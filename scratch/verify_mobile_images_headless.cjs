const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3000;
const rootDir = process.cwd();

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf'
};

function startServer() {
    return new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
            let reqUrl = req.url.split('?')[0];
            if (reqUrl === '/') reqUrl = '/index.html';
            let filePath = path.join(rootDir, reqUrl);

            if (!fs.existsSync(filePath)) {
                const publicPath = path.join(rootDir, 'public', reqUrl);
                if (fs.existsSync(publicPath)) {
                    filePath = publicPath;
                }
            }

            fs.readFile(filePath, (err, content) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        fs.readFile(path.join(rootDir, 'index.html'), (err2, fallback) => {
                            if (err2) {
                                res.writeHead(404, { 'Content-Type': 'text/plain' });
                                res.end('404 Not Found');
                            } else {
                                res.writeHead(200, { 'Content-Type': 'text/html' });
                                res.end(fallback);
                            }
                        });
                    } else {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('500 Server Error: ' + err.code);
                    }
                    return;
                }
                const ext = path.extname(filePath).toLowerCase();
                const contentType = MIME_TYPES[ext] || 'application/octet-stream';
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            });
        });

        server.listen(PORT, '127.0.0.1', () => {
            console.log(`[Server] Live app serving on http://localhost:${PORT}`);
            resolve(server);
        });
        server.on('error', reject);
    });
}

class CDPClient {
    constructor(wsUrl) {
        this.wsUrl = wsUrl;
        this.ws = null;
        this.msgId = 1;
        this.pending = new Map();
        this.eventListeners = new Map();
    }

    async connect() {
        this.ws = new WebSocket(this.wsUrl);
        await new Promise((resolve, reject) => {
            this.ws.onopen = resolve;
            this.ws.onerror = reject;
        });

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.id && this.pending.has(data.id)) {
                const { resolve, reject } = this.pending.get(data.id);
                this.pending.delete(data.id);
                if (data.error) reject(new Error(data.error.message));
                else resolve(data.result);
            } else if (data.method && this.eventListeners.has(data.method)) {
                for (const cb of this.eventListeners.get(data.method)) {
                    cb(data.params);
                }
            }
        };
    }

    send(method, params = {}) {
        return new Promise((resolve, reject) => {
            const id = this.msgId++;
            this.pending.set(id, { resolve, reject });
            this.ws.send(JSON.stringify({ id, method, params }));
        });
    }

    on(event, cb) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(cb);
    }

    close() {
        if (this.ws) {
            try { this.ws.close(); } catch (_) {}
        }
    }
}

async function runVerification() {
    let server;
    let chrome;
    let client;
    let browserClient;
    let allPassed = true;

    function check(label, condition, details = '') {
        if (condition) {
            console.log(`[PASS] ${label} ${details ? '(' + details + ')' : ''}`);
        } else {
            console.error(`[FAIL] ${label} ${details ? '(' + details + ')' : ''}`);
            allPassed = false;
        }
    }

    try {
        server = await startServer();

        chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
            '--headless=new',
            '--remote-debugging-port=9222',
            '--remote-allow-origins=*',
            '--disable-gpu',
            '--no-sandbox',
            '--disable-extensions',
            '--disable-software-rasterizer',
            'about:blank'
        ]);

        const wsEndpoint = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Chrome launch timeout')), 10000);
            chrome.stderr.on('data', (d) => {
                const str = d.toString();
                const m = str.match(/ws:\/\/127\.0\.0\.1:9222\/devtools\/browser\/[a-zA-Z0-9_-]+/);
                if (m) {
                    clearTimeout(timeout);
                    resolve(m[0]);
                }
            });
        });

        console.log(`[Chrome] DevTools listening on ${wsEndpoint}`);

        browserClient = new CDPClient(wsEndpoint);
        await browserClient.connect();

        const targets = await browserClient.send('Target.getTargets');
        const pageTarget = targets.targetInfos.find(t => t.type === 'page');
        const pageWsUrl = `ws://127.0.0.1:9222/devtools/page/${pageTarget.targetId}`;

        client = new CDPClient(pageWsUrl);
        await client.connect();

        await client.send('Page.enable');
        await client.send('Runtime.enable');
        await client.send('DOM.enable');

        const consoleErrors = [];
        client.on('Runtime.consoleAPICalled', (params) => {
            if (params.type === 'error') {
                const msg = params.args.map(a => a.value || a.description).join(' ');
                if (!msg.includes('POST') && !msg.includes('Failed to load resource')) {
                    consoleErrors.push(msg);
                }
            }
        });
        client.on('Runtime.exceptionThrown', (params) => {
            consoleErrors.push(params.exceptionDetails.text + (params.exceptionDetails.exception ? ' ' + params.exceptionDetails.exception.description : ''));
        });

        async function safeEval(expression) {
            const res = await client.send('Runtime.evaluate', {
                expression,
                returnByValue: true,
                awaitPromise: true
            });
            if (res.exceptionDetails) {
                console.error('Eval error on:', expression.slice(0, 80), res.exceptionDetails);
            }
            return (res.result && res.result.value) !== undefined ? res.result.value : res.result;
        }

        // ════════════════════════════════════════════════════════════════════
        // TEST SUITE 1: DESKTOP (1440px × 900px) — 100% LOCKED AND UNTOUCHED
        // ════════════════════════════════════════════════════════════════════
        console.log('\n--- VERIFYING DESKTOP (1440px × 900px) ---');
        await client.send('Emulation.setDeviceMetricsOverride', {
            width: 1440,
            height: 900,
            deviceScaleFactor: 1,
            mobile: false
        });

        await client.send('Page.navigate', { url: `http://localhost:${PORT}/?workspace=image-studio` });
        await new Promise(r => setTimeout(r, 2000));

        const desktopImagesState = await safeEval(`(() => {
            const imgHome = document.getElementById('image-home-view');
            const mobHome = document.getElementById('mobile-image-home-container');
            const mobComp = document.getElementById('mobile-image-composer-container');
            const backdrop = imgHome ? imgHome.querySelector('.pointer-events-none') : null;
            const hero = imgHome ? imgHome.querySelector('[class*="max-w-[760px]"]') : null;
            const desktopCards = document.querySelectorAll('#creative-workflows-grid > div');

            const getDisplay = (el) => el ? window.getComputedStyle(el).display : 'none';
            return {
                imgHomeDisplay: getDisplay(imgHome),
                mobHomeDisplay: getDisplay(mobHome),
                mobCompDisplay: getDisplay(mobComp),
                backdropDisplay: getDisplay(backdrop),
                heroDisplay: getDisplay(hero),
                desktopCardsCount: desktopCards.length
            };
        })()`);

        check('Desktop: Image Home View is displayed (flex)', desktopImagesState.imgHomeDisplay === 'flex');
        check('Desktop: Mobile Images Home is hidden (none)', desktopImagesState.mobHomeDisplay === 'none');
        check('Desktop: Mobile Image Composer is hidden (none)', desktopImagesState.mobCompDisplay === 'none');
        check('Desktop: Atmospheric backdrop is displayed (block)', desktopImagesState.backdropDisplay === 'block');
        check('Desktop: Hero Prompt section is displayed (flex)', desktopImagesState.heroDisplay === 'flex');
        check('Desktop: 4 tall studio workflow cards present', desktopImagesState.desktopCardsCount === 4, `count: ${desktopImagesState.desktopCardsCount}`);

        const desktopShot = await client.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('scratch/desktop_images_1440x900.png', Buffer.from(desktopShot.data, 'base64'));
        console.log('Saved screenshot: scratch/desktop_images_1440x900.png');

        // ════════════════════════════════════════════════════════════════════
        // TEST SUITE 2: MOBILE IMAGES WORKSPACE (360px × 800px)
        // ════════════════════════════════════════════════════════════════════
        console.log('\n--- VERIFYING MOBILE IMAGES WORKSPACE (360px × 800px) ---');
        await client.send('Emulation.setDeviceMetricsOverride', {
            width: 360,
            height: 800,
            deviceScaleFactor: 2,
            mobile: true
        });
        await new Promise(r => setTimeout(r, 800));

        const mobImagesState = await safeEval(`(() => {
            const getDisplay = (el) => el ? window.getComputedStyle(el).display : 'none';
            const getBg = (el) => el ? window.getComputedStyle(el).backgroundColor : '';

            const mobHome = document.getElementById('mobile-image-home-container');
            const mobComp = document.getElementById('mobile-image-composer-container');
            const h1 = mobHome ? mobHome.querySelector('h1') : null;
            const sub = mobHome ? mobHome.querySelector('p') : null;
            const sidebarBtn = document.getElementById('mobile-image-sidebar-btn');
            const creationsBtn = document.getElementById('mobile-image-creations-btn');

            // Leaked desktop elements check:
            const desktopScrollArea = document.querySelector('#image-home-view > div.flex-1.w-full.pb-16');
            const desktopBackdrop = document.querySelector('#image-home-view > div.pointer-events-none');

            // 2x2 cards:
            const wsCards = Array.from(mobHome ? mobHome.querySelectorAll('.grid.grid-cols-2 button') : []).slice(0, 4).map(b => {
                const img = b.querySelector('img');
                const span = b.querySelector('span');
                return {
                    title: span ? span.textContent.trim() : '',
                    imgSrc: img ? img.getAttribute('src') : '',
                    hasSubtitle: b.querySelectorAll('span, p').length > 1
                };
            });

            // Templates grid:
            const tmplGrid = document.getElementById('mobile-image-home-templates-grid');
            const tmplCards = Array.from(tmplGrid ? tmplGrid.children : []).map(c => {
                const img = c.querySelector('img');
                const titleSpan = c.querySelector('span');
                return {
                    title: titleSpan ? titleSpan.textContent.trim() : '',
                    imgSrc: img ? img.getAttribute('src') : ''
                };
            });

            // Composer checks:
            const shell = document.getElementById('mobile-image-composer-shell');
            const compInput = document.getElementById('mobile-image-prompt-input');
            const compSubmit = document.getElementById('mobile-image-submit-btn');
            const compMic = document.getElementById('mobile-image-mic-btn');
            const compAttach = document.getElementById('mobile-image-attach-btn');

            return {
                mobHomeDisplay: getDisplay(mobHome),
                mobCompDisplay: getDisplay(mobComp),
                desktopScrollAreaDisplay: getDisplay(desktopScrollArea),
                desktopBackdropDisplay: getDisplay(desktopBackdrop),
                bgColor: getBg(mobHome),
                title: h1 ? h1.textContent.trim() : '',
                subtitle: sub ? sub.textContent.trim() : '',
                hasSidebarBtn: Boolean(sidebarBtn),
                hasCreationsBtn: Boolean(creationsBtn),
                wsCards,
                tmplCardsCount: tmplCards.length,
                hasCompInput: Boolean(compInput),
                hasCompSubmit: Boolean(compSubmit),
                hasCompMic: Boolean(compMic),
                hasCompAttach: Boolean(compAttach),
                shellClasses: shell ? shell.className : ''
            };
        })()`);

        check('Mobile Images: Home container is displayed (flex)', mobImagesState.mobHomeDisplay === 'flex');
        check('Mobile Images: Floating capsule composer is displayed (block)', mobImagesState.mobCompDisplay === 'block');
        check('Mobile Images: Leaked desktop scroll container strictly HIDDEN (none)', mobImagesState.desktopScrollAreaDisplay === 'none');
        check('Mobile Images: Leaked desktop backdrop strictly HIDDEN (none)', mobImagesState.desktopBackdropDisplay === 'none');
        check('Mobile Images: Title is "Image Workspace"', mobImagesState.title === 'Image Workspace');
        check('Mobile Images: Subtitle is "Create, edit, and enhance images with AI"', mobImagesState.subtitle.includes('Create, edit, and enhance images with AI'));
        check('Mobile Images: Top header sidebar button present', mobImagesState.hasSidebarBtn);
        check('Mobile Images: Top header Creations pill present', mobImagesState.hasCreationsBtn);

        // 2x2 Workspace Cards
        check('Mobile Images: 4 Workspace Cards rendered', mobImagesState.wsCards.length === 4);
        check('Mobile Images: Card 1 is "Generate Image"', mobImagesState.wsCards[0]?.title === 'Generate Image');
        check('Mobile Images: Card 2 is "Remove Background"', mobImagesState.wsCards[1]?.title === 'Remove Background');
        check('Mobile Images: Card 3 is "Precise Edit"', mobImagesState.wsCards[2]?.title === 'Precise Edit');
        check('Mobile Images: Card 4 is "Upscale Image"', mobImagesState.wsCards[3]?.title === 'Upscale Image');
        check('Mobile Images: NO subtitles inside 2x2 cards (all false)', mobImagesState.wsCards.every(c => c.hasSubtitle === false));

        // Filter-free Templates
        check('Mobile Images: Templates rendered (count > 0)', mobImagesState.tmplCardsCount > 0, `count: ${mobImagesState.tmplCardsCount}`);

        // Composer structure
        check('Mobile Images: Composer is single-row capsule (rounded-full)', mobImagesState.shellClasses.includes('rounded-full'));
        check('Mobile Images: Direct image upload button present', mobImagesState.hasCompAttach);
        check('Mobile Images: Prompt input textarea present', mobImagesState.hasCompInput);
        check('Mobile Images: Voice mic button present', mobImagesState.hasCompMic);
        check('Mobile Images: Blue submit button present', mobImagesState.hasCompSubmit);

        // Screenshot Mobile Images Home
        const mobHomeShot = await client.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('scratch/mobile_images_360x800_home.png', Buffer.from(mobHomeShot.data, 'base64'));
        console.log('Saved screenshot: scratch/mobile_images_360x800_home.png');

        // ════════════════════════════════════════════════════════════════════
        // TEST SUITE 3: AUTO-LIFT STACKING & TYPING
        // ════════════════════════════════════════════════════════════════════
        console.log('\n--- TESTING MOBILE COMPOSER AUTO-LIFT & TYPING ---');
        await safeEval(`(() => {
            const el = document.getElementById('mobile-image-prompt-input');
            if (el) {
                el.value = 'A cinematic editorial photo of a crystal perfume bottle floating on iridescent rippling water with soft atmospheric mist and natural sunlight caustics.';
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
        })()`);
        await new Promise(r => setTimeout(r, 200));

        const typingState = await safeEval(`(() => {
            const shell = document.getElementById('mobile-image-composer-shell');
            const btn = document.getElementById('mobile-image-submit-btn');
            return {
                isStacked: shell.classList.contains('composer-stacked'),
                disabled: btn.disabled,
                isBlue: btn.className.includes('bg-blue-600')
            };
        })()`);

        check('Mobile Images: Auto-lifts into stacked layout (.composer-stacked)', typingState.isStacked);
        check('Mobile Images: Send button enabled when typing', !typingState.disabled);
        check('Mobile Images: Send button styled with blue accent (#2563EB)', typingState.isBlue);

        const typingShot = await client.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('scratch/mobile_images_360x800_typing.png', Buffer.from(typingShot.data, 'base64'));
        console.log('Saved screenshot: scratch/mobile_images_360x800_typing.png');

        // Reset prompt
        await safeEval(`(() => {
            const el = document.getElementById('mobile-image-prompt-input');
            if (el) {
                el.value = '';
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
        })()`);
        await new Promise(r => setTimeout(r, 200));

        // ════════════════════════════════════════════════════════════════════
        // TEST SUITE 4: REAL-TIME BLACK VOICE EQUALIZER & CIRCULAR STOP LOADER
        // ════════════════════════════════════════════════════════════════════
        console.log('\n--- TESTING REAL-TIME BLACK VOICE EQUALIZER & CIRCULAR STOP LOADER ---');
        await safeEval(`
            if (typeof startMobileImageVoice === 'function') {
                startMobileImageVoice();
            }
        `);
        await new Promise(r => setTimeout(r, 400));

        const voiceState = await safeEval(`(() => {
            const voiceView = document.getElementById('mobile-image-composer-voice-view');
            const bars = document.getElementById('mobile-voice-equalizer-bars');
            const pauseBtn = document.getElementById('mobile-voice-pause-btn');
            const stopIcon = document.getElementById('mobile-voice-stop-icon');
            const spinner = document.getElementById('mobile-voice-stop-spinner');
            const sendBtn = document.getElementById('mobile-voice-send-btn');
            const cancelBtn = document.getElementById('mobile-voice-cancel-btn');

            const getDisplay = (el) => el ? window.getComputedStyle(el).display : 'none';
            const firstBar = bars ? bars.firstElementChild : null;
            return {
                voiceViewVisible: voiceView && !voiceView.classList.contains('hidden') && getDisplay(voiceView) !== 'none',
                barsCount: bars ? bars.children.length : 0,
                barHasSlate900: firstBar ? firstBar.className.includes('bg-slate-900') : false,
                hasPauseBtn: Boolean(pauseBtn),
                isCircularPause: pauseBtn ? pauseBtn.className.includes('rounded-full') : false,
                hasStopIcon: Boolean(stopIcon),
                hasSpinner: Boolean(spinner),
                hasSendBtn: Boolean(sendBtn),
                hasCancelBtn: Boolean(cancelBtn)
            };
        })()`);

        check('Mobile Voice: Voice Equalizer View is visible', voiceState.voiceViewVisible);
        check('Mobile Voice: Audio-reactive bars container populated', voiceState.barsCount > 0, `bars: ${voiceState.barsCount}`);
        check('Mobile Voice: Styled with solid dark bars (bg-slate-900)', voiceState.barHasSlate900);
        check('Mobile Voice: Stop/pause button is circular (rounded-full)', voiceState.isCircularPause);
        check('Mobile Voice: Stop icon present in pause button', voiceState.hasStopIcon);
        check('Mobile Voice: Loading spinner element present in pause button', voiceState.hasSpinner);
        check('Mobile Voice: Circular blue Send button present', voiceState.hasSendBtn);
        check('Mobile Voice: Cancel button present', voiceState.hasCancelBtn);

        const voiceShot = await client.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('scratch/mobile_images_360x800_voice.png', Buffer.from(voiceShot.data, 'base64'));
        console.log('Saved screenshot: scratch/mobile_images_360x800_voice.png');

        // Stop voice recording
        await safeEval(`
            if (typeof stopMobileImageVoice === 'function') {
                stopMobileImageVoice('pause');
            }
        `);
        await new Promise(r => setTimeout(r, 300));

        // ════════════════════════════════════════════════════════════════════
        // TEST SUITE 5: TEMPLATE PREVIEW MODAL (NATURAL ASPECT RATIO & SLIM FRAME)
        // ════════════════════════════════════════════════════════════════════
        console.log('\n--- TESTING TEMPLATE PREVIEW MODAL ---');
        await safeEval(`(() => {
            const firstTmpl = document.querySelector('#mobile-image-home-templates-grid > div');
            if (firstTmpl) firstTmpl.click();
        })()`);
        await new Promise(r => setTimeout(r, 500));

        const modalState = await safeEval(`(() => {
            const modal = document.getElementById('mobile-template-card-modal');
            const container = document.getElementById('mobile-tmpl-card-container');
            const img = document.getElementById('mobile-tmpl-card-img');
            const ctaBtn = document.getElementById('mobile-tmpl-card-cta-btn');
            const closeBtn = document.getElementById('mobile-tmpl-card-close-btn');
            const getDisplay = (el) => el ? window.getComputedStyle(el).display : 'none';
            return {
                visible: modal && !modal.classList.contains('hidden') && getDisplay(modal) === 'flex',
                objectFit: img ? window.getComputedStyle(img).objectFit : '',
                hasSlimPadding: container ? container.className.includes('p-2.5') : false,
                hasSlimBorder: container ? (container.className.includes('border-slate-200') && container.className.includes('rounded-2xl')) : false,
                hasCtaBtn: Boolean(ctaBtn),
                hasCloseBtn: Boolean(closeBtn)
            };
        })()`);

        check('Mobile Template Modal: Opens cleanly on tap', modalState.visible);
        check('Mobile Template Modal: Image uses natural/contain aspect fit', modalState.objectFit === 'contain');
        check('Mobile Template Modal: Container has slim p-2.5 padding', modalState.hasSlimPadding);
        check('Mobile Template Modal: Container has slim hairline border (rounded-2xl border-slate-200/80)', modalState.hasSlimBorder);
        check('Mobile Template Modal: Has Generate CTA button', modalState.hasCtaBtn);
        check('Mobile Template Modal: Has circular close button', modalState.hasCloseBtn);

        const modalShot = await client.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('scratch/mobile_images_360x800_template_modal.png', Buffer.from(modalShot.data, 'base64'));
        console.log('Saved screenshot: scratch/mobile_images_360x800_template_modal.png');

        // Close preview modal
        await safeEval(`(() => {
            const closeBtn = document.getElementById('mobile-tmpl-card-close-btn');
            if (closeBtn) closeBtn.click();
        })()`);
        await new Promise(r => setTimeout(r, 300));

        // ════════════════════════════════════════════════════════════════════
        // TEST SUITE 6: CREATIONS BOTTOM MULTI-SELECT BAR & DELETE CONFIRMATION
        // ════════════════════════════════════════════════════════════════════
        console.log('\n--- TESTING CREATIONS BOTTOM MULTI-SELECT BAR & DELETE CONFIRMATION ---');
        // Open Creations view via setMobileWorkspaceView('results')
        await safeEval(`(() => {
            if (typeof setMobileWorkspaceView === 'function') {
                setMobileWorkspaceView('results');
            }
        })()`);
        await new Promise(r => setTimeout(r, 400));

        // Select items in mobile creations
        await safeEval(`(() => {
            window.mobileSelectedImageIds = new Set(['item-1', 'item-2']);
            if (typeof updateMobileMultiSelectBar === 'function') {
                updateMobileMultiSelectBar();
            }
        })()`);
        await new Promise(r => setTimeout(r, 300));

        const creationsState = await safeEval(`(() => {
            const feed = document.getElementById('mobile-workspace-result-feed');
            const bar = document.getElementById('mobile-result-multiselect-bar');
            const count = document.getElementById('mobile-multiselect-count');
            const delBtn = document.getElementById('mobile-multiselect-delete-btn');
            const cancelBtn = document.getElementById('mobile-multiselect-cancel-btn');
            const dlBtn = document.getElementById('mobile-multiselect-download-btn');
            const getDisplay = (el) => el ? window.getComputedStyle(el).display : 'none';
            return {
                feedVisible: feed && !feed.classList.contains('hidden') && getDisplay(feed) !== 'none',
                barVisible: bar && !bar.classList.contains('hidden') && getDisplay(bar) !== 'none',
                barClasses: bar ? bar.className : 'null',
                barDisplay: getDisplay(bar),
                barHidden: bar ? bar.classList.contains('hidden') : null,
                selectedIdsSize: window.mobileSelectedImageIds ? window.mobileSelectedImageIds.size : -1,
                countText: count ? count.textContent.trim() : '',
                hasDelBtn: Boolean(delBtn),
                hasCancelBtn: Boolean(cancelBtn),
                hasDlBtn: Boolean(dlBtn),
                isCircularCancel: cancelBtn ? cancelBtn.className.includes('rounded-full') : false
            };
        })()`);
        console.log('creationsState debug:', creationsState);

        check('Mobile Creations: Result Feed is visible', creationsState.feedVisible);
        check('Mobile Creations: Floating bottom action bar is visible', creationsState.barVisible);
        check('Mobile Creations: Left count label displays "2 selected"', creationsState.countText === '2 selected');
        check('Mobile Creations: Surface-matched Download button present', creationsState.hasDlBtn);
        check('Mobile Creations: Delete button present', creationsState.hasDelBtn);
        check('Mobile Creations: Cancel button is sleek circular ( × ) icon', creationsState.hasCancelBtn && creationsState.isCircularCancel);

        // Tap Delete to open surface-matched confirmation modal
        await safeEval(`(() => {
            const delBtn = document.getElementById('mobile-multiselect-delete-btn');
            if (delBtn) delBtn.click();
        })()`);
        await new Promise(r => setTimeout(r, 300));

        const deleteModalVisible = await safeEval(`(() => {
            const m = document.getElementById('mobile-result-delete-confirm-popover');
            return m && !m.classList.contains('hidden') && window.getComputedStyle(m).display !== 'none';
        })()`);

        check('Mobile Creations: Delete tap opens minimal surface-matched confirmation popover', deleteModalVisible);

        const creationsShot = await client.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('scratch/mobile_images_360x800_creations_selected.png', Buffer.from(creationsShot.data, 'base64'));
        console.log('Saved screenshot: scratch/mobile_images_360x800_creations_selected.png');

        // Dismiss confirmation & return to landing view
        await safeEval(`(() => {
            const cancelBtn = document.getElementById('mobile-delete-confirm-cancel');
            if (cancelBtn) cancelBtn.click();
            if (typeof clearMobileSelectedImages === 'function') clearMobileSelectedImages();
            if (typeof setMobileWorkspaceView === 'function') setMobileWorkspaceView('landing');
        })()`);
        await new Promise(r => setTimeout(r, 300));

        // ════════════════════════════════════════════════════════════════════
        // TEST SUITE 7: LARGE ANDROID (412px × 915px)
        // ════════════════════════════════════════════════════════════════════
        console.log('\n--- VERIFYING LARGE MOBILE (412px × 915px) ---');
        await client.send('Emulation.setDeviceMetricsOverride', {
            width: 412,
            height: 915,
            deviceScaleFactor: 2.625,
            mobile: true
        });

        await client.send('Page.navigate', { url: `http://localhost:${PORT}/?workspace=image-studio` });
        await new Promise(r => setTimeout(r, 1500));

        const largeMobShot = await client.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('scratch/mobile_images_412x915_home.png', Buffer.from(largeMobShot.data, 'base64'));
        console.log('Saved screenshot: scratch/mobile_images_412x915_home.png');

        const largeMobState = await safeEval(`(() => {
            const getDisplay = (el) => el ? window.getComputedStyle(el).display : 'none';
            const mobHome = document.getElementById('mobile-image-home-container');
            const mobComp = document.getElementById('mobile-image-composer-container');
            const desktopScrollArea = document.querySelector('#image-home-view > div.flex-1.w-full.pb-16');
            return {
                mobHomeDisplay: getDisplay(mobHome),
                mobCompDisplay: getDisplay(mobComp),
                desktopScrollAreaDisplay: getDisplay(desktopScrollArea)
            };
        })()`);

        check('Large Mobile: Mobile Home container is displayed (flex)', largeMobState.mobHomeDisplay === 'flex');
        check('Large Mobile: Floating Composer container is displayed (block)', largeMobState.mobCompDisplay === 'block');
        check('Large Mobile: Desktop scroll area is strictly HIDDEN (none)', largeMobState.desktopScrollAreaDisplay === 'none');

        // ════════════════════════════════════════════════════════════════════
        // TEST SUITE 8: CONSOLE & RUNTIME ERRORS
        // ════════════════════════════════════════════════════════════════════
        console.log('\n--- VERIFYING CONSOLE & RUNTIME ERRORS ---');
        check('Zero console or runtime errors recorded', consoleErrors.length === 0, `errors: ${JSON.stringify(consoleErrors)}`);

    } finally {
        if (client) client.close();
        if (browserClient) browserClient.close();
        if (chrome) {
            try { chrome.kill(); } catch (_) {}
        }
        if (server) {
            try { server.close(); } catch (_) {}
        }
    }

    console.log('\n======================================================');
    if (allPassed) {
        console.log('ALL VERIFICATION CHECKS PASSED WITH 100% SUCCESS!');
    } else {
        console.error('SOME CHECKS FAILED! Review logs above.');
        process.exit(1);
    }
    console.log('======================================================\n');
}

runVerification().catch(err => {
    console.error('Verification failed with exception:', err);
    process.exit(1);
});
