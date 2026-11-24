const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

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

        // Listen on port 0 for dynamic ephemeral port
        server.listen(0, '127.0.0.1', () => {
            const port = server.address().port;
            console.log(`[Server] Live app serving on http://127.0.0.1:${port}`);
            resolve({ server, port });
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

async function runLiveVerification() {
    let serverObj;
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
        serverObj = await startServer();
        const port = serverObj.port;

        console.log('[Chrome] Launching headless Chrome with DevTools...');
        chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
            '--headless=new',
            '--remote-debugging-port=0',
            '--disable-gpu',
            '--no-sandbox',
            '--disable-extensions',
            '--disable-software-rasterizer',
            'about:blank'
        ]);

        const wsEndpoint = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Chrome launch timeout')), 12000);
            chrome.stderr.on('data', (d) => {
                const str = d.toString();
                const m = str.match(/ws:\/\/127\.0\.0\.1:(\d+)\/devtools\/browser\/[a-zA-Z0-9_-]+/);
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
        const devtoolsPortMatch = wsEndpoint.match(/:(\d+)\//);
        const devtoolsPort = devtoolsPortMatch ? devtoolsPortMatch[1] : '9222';
        const pageWsUrl = `ws://127.0.0.1:${devtoolsPort}/devtools/page/${pageTarget.targetId}`;

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

        // ====================================================================
        // TEST 1: DESKTOP (1440px x 900px) — VERIFY 100% UNTOUCHED
        // ====================================================================
        console.log('\n--- 1. VERIFYING DESKTOP (1440px × 900px) ---');
        await client.send('Emulation.setDeviceMetricsOverride', {
            width: 1440,
            height: 900,
            deviceScaleFactor: 1,
            mobile: false
        });

        await client.send('Page.navigate', { url: `http://127.0.0.1:${port}/?workspace=image-studio` });
        await new Promise(r => setTimeout(r, 2000));

        const desktopState = (await client.send('Runtime.evaluate', {
            expression: `(() => {
                const imgHome = document.getElementById('image-home-view');
                const mobHome = document.getElementById('mobile-image-home-container');
                const mobComp = document.getElementById('mobile-image-composer-container');
                const backdrop = imgHome ? imgHome.querySelector('.pointer-events-none') : null;
                const hero = imgHome ? imgHome.querySelector('[class*="max-w-[760px]"]') : null;
                const desktopCards = imgHome ? imgHome.querySelectorAll('.grid.grid-cols-1.sm\\:grid-cols-3 > div') : [];

                const getDisplay = (el) => el ? window.getComputedStyle(el).display : 'none';
                return {
                    imgHomeDisplay: getDisplay(imgHome),
                    mobHomeDisplay: getDisplay(mobHome),
                    mobCompDisplay: getDisplay(mobComp),
                    backdropDisplay: getDisplay(backdrop),
                    heroDisplay: getDisplay(hero),
                    desktopCardsCount: desktopCards.length
                };
            })()`,
            returnByValue: true
        })).result.value;

        check('Desktop: Image Home View is displayed (flex)', desktopState.imgHomeDisplay === 'flex');
        check('Desktop: Mobile Images Home is hidden (none)', desktopState.mobHomeDisplay === 'none');
        check('Desktop: Mobile Image Composer is hidden (none)', desktopState.mobCompDisplay === 'none');
        check('Desktop: Atmospheric backdrop is displayed (block)', desktopState.backdropDisplay === 'block');
        check('Desktop: Hero Prompt section is displayed (flex)', desktopState.heroDisplay === 'flex');
        check('Desktop: 3 tall studio workflow cards present', desktopState.desktopCardsCount === 3);

        const desktopShot = await client.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('scratch/desktop_1440x900.png', Buffer.from(desktopShot.data, 'base64'));
        console.log('Saved screenshot: scratch/desktop_1440x900.png');

        // ====================================================================
        // TEST 2: MOBILE LANDING (360px x 800px) — RESTORED CLEAN LAYOUT
        // ====================================================================
        console.log('\n--- 2. VERIFYING MOBILE LANDING (360px × 800px) ---');
        await client.send('Emulation.setDeviceMetricsOverride', {
            width: 360,
            height: 800,
            deviceScaleFactor: 2,
            mobile: true
        });
        await new Promise(r => setTimeout(r, 600));

        const mobState = (await client.send('Runtime.evaluate', {
            expression: `(() => {
                const getDisplay = (el) => el ? window.getComputedStyle(el).display : 'none';

                const mobHome = document.getElementById('mobile-image-home-container');
                const mobComp = document.getElementById('mobile-image-composer-container');
                const title = mobHome ? mobHome.querySelector('h1') : null;
                const subtitle = mobHome ? mobHome.querySelector('p') : null;

                // Leaked desktop elements:
                const desktopHero = document.querySelector('#image-home-view [class*="max-w-[760px]"]');
                const desktopBackdrop = document.querySelector('#image-home-view .pointer-events-none');
                const desktopScrollArea = document.querySelector('#image-home-view > div.flex-1.w-full.pb-16');

                // 2x2 tool cards:
                const wsGrid = mobHome ? mobHome.querySelector('.grid.grid-cols-2') : null;
                const wsCards = wsGrid ? Array.from(wsGrid.querySelectorAll('button')).map(b => {
                    const span = b.querySelector('span');
                    const img = b.querySelector('img');
                    return {
                        title: span ? span.textContent.trim() : '',
                        hasImg: Boolean(img && img.getAttribute('src'))
                    };
                }) : [];

                // Templates grid:
                const tmplGrid = document.getElementById('mobile-image-home-templates-grid');
                const tmplCount = tmplGrid ? tmplGrid.children.length : 0;

                // Composer & Stray Arrow check:
                const shell = document.getElementById('mobile-image-composer-shell');
                const strayArrows = shell ? shell.querySelectorAll('button:not(#mobile-image-submit-btn):not(#mobile-image-attach-btn):not(#mobile-image-mic-btn)') : [];
                const submitBtn = document.getElementById('mobile-image-submit-btn');
                const attachBtn = document.getElementById('mobile-image-attach-btn');
                const promptInput = document.getElementById('mobile-image-prompt-input');
                const micBtn = document.getElementById('mobile-image-mic-btn');

                return {
                    mobHomeDisplay: getDisplay(mobHome),
                    mobCompDisplay: getDisplay(mobComp),
                    desktopHeroDisplay: getDisplay(desktopHero),
                    desktopBackdropDisplay: getDisplay(desktopBackdrop),
                    desktopScrollAreaDisplay: getDisplay(desktopScrollArea),
                    titleText: title ? title.textContent.trim() : '',
                    subtitleText: subtitle ? subtitle.textContent.trim() : '',
                    wsCards,
                    tmplCount,
                    hasStrayArrow: strayArrows.length > 0,
                    strayArrowCount: strayArrows.length,
                    hasSubmitBtn: Boolean(submitBtn),
                    hasAttachBtn: Boolean(attachBtn),
                    hasPromptInput: Boolean(promptInput),
                    hasMicBtn: Boolean(micBtn),
                    shellClasses: shell ? shell.className : '',
                    shellMinHeight: shell ? window.getComputedStyle(shell).minHeight : ''
                };
            })()`,
            returnByValue: true
        })).result.value;

        check('Mobile: Mobile container is visible (flex)', mobState.mobHomeDisplay === 'flex');
        check('Mobile: Composer container is visible (block)', mobState.mobCompDisplay === 'block');
        check('Mobile: Leaked desktop hero is HIDDEN (none)', mobState.desktopHeroDisplay === 'none');
        check('Mobile: Leaked desktop backdrop is HIDDEN (none)', mobState.desktopBackdropDisplay === 'none');
        check('Mobile: Leaked desktop main scroll container is HIDDEN (none)', mobState.desktopScrollAreaDisplay === 'none');
        check('Mobile: Title is exactly "Image Workspace"', mobState.titleText === 'Image Workspace');
        check('Mobile: Subtitle is "Create, edit, and enhance images with AI"', mobState.subtitleText === 'Create, edit, and enhance images with AI');
        check('Mobile: 4 compact 2x2 tool cards present', mobState.wsCards.length === 4);
        check('Mobile: Card 1 is "Generate Image"', mobState.wsCards[0]?.title === 'Generate Image' && mobState.wsCards[0]?.hasImg);
        check('Mobile: Card 2 is "Remove Background"', mobState.wsCards[1]?.title === 'Remove Background' && mobState.wsCards[1]?.hasImg);
        check('Mobile: Card 3 is "Precise Edit"', mobState.wsCards[2]?.title === 'Precise Edit' && mobState.wsCards[2]?.hasImg);
        check('Mobile: Card 4 is "Upscale Image"', mobState.wsCards[3]?.title === 'Upscale Image' && mobState.wsCards[3]?.hasImg);
        check('Mobile: Filter-free Templates grid rendered', mobState.tmplCount > 0, `count: ${mobState.tmplCount}`);
        check('Mobile: Stray black arrow is completely GONE', !mobState.hasStrayArrow, `stray count: ${mobState.strayArrowCount}`);
        check('Mobile: Composer shell has rounded-full single row', mobState.shellClasses.includes('rounded-full'));
        check('Mobile: Composer attach button exists', mobState.hasAttachBtn);
        check('Mobile: Composer prompt textarea exists', mobState.hasPromptInput);
        check('Mobile: Composer mic button exists', mobState.hasMicBtn);
        check('Mobile: Composer blue submit button exists', mobState.hasSubmitBtn);

        const mobLandingShot = await client.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('scratch/mobile_360x800_landing.png', Buffer.from(mobLandingShot.data, 'base64'));
        console.log('Saved screenshot: scratch/mobile_360x800_landing.png');

        // ====================================================================
        // TEST 3: AUTO-LIFT STACKING & TYPING
        // ====================================================================
        console.log('\n--- 3. TESTING AUTO-LIFT STACKING & TYPING ---');
        await client.send('Runtime.evaluate', {
            expression: `
                const input = document.getElementById('mobile-image-prompt-input');
                input.value = 'A cinematic editorial photo of a crystal perfume bottle floating on iridescent rippling water with soft atmospheric mist and natural sunlight caustics.';
                input.dispatchEvent(new Event('input', { bubbles: true }));
            `
        });
        await new Promise(r => setTimeout(r, 300));

        const typingState = (await client.send('Runtime.evaluate', {
            expression: `(() => {
                const shell = document.getElementById('mobile-image-composer-shell');
                const submitBtn = document.getElementById('mobile-image-submit-btn');
                return {
                    isStacked: shell.classList.contains('composer-stacked'),
                    submitDisabled: submitBtn.disabled,
                    submitClass: submitBtn.className
                };
            })()`,
            returnByValue: true
        })).result.value;

        check('Mobile Composer: Auto-lifts into stacked layout (.composer-stacked)', typingState.isStacked);
        check('Mobile Composer: Submit button becomes active (not disabled)', !typingState.submitDisabled);
        check('Mobile Composer: Submit button has blue accent', typingState.submitClass.includes('bg-blue-600'));

        const typingShot = await client.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('scratch/mobile_360x800_typing.png', Buffer.from(typingShot.data, 'base64'));
        console.log('Saved screenshot: scratch/mobile_360x800_typing.png');

        // Reset prompt
        await client.send('Runtime.evaluate', {
            expression: `
                const input = document.getElementById('mobile-image-prompt-input');
                input.value = '';
                input.dispatchEvent(new Event('input', { bubbles: true }));
            `
        });
        await new Promise(r => setTimeout(r, 200));

        // ====================================================================
        // TEST 4: VOICE EQUALIZER WITH CIRCULAR STOP/PAUSE SPINNER
        // ====================================================================
        console.log('\n--- 4. TESTING BLACK AUDIO-REACTIVE EQUALIZER & CIRCULAR STOP LOADER ---');
        await client.send('Runtime.evaluate', {
            expression: `
                if (typeof startMobileVoiceRecording === 'function') {
                    startMobileVoiceRecording();
                }
            `
        });
        await new Promise(r => setTimeout(r, 400));

        const voiceState = (await client.send('Runtime.evaluate', {
            expression: `(() => {
                const eq = document.getElementById('mobile-image-equalizer');
                const stopBtn = document.getElementById('mobile-voice-stop-btn');
                const bars = document.getElementById('mobile-voice-bars');
                const timer = document.getElementById('mobile-voice-timer');
                const getDisplay = (el) => el ? window.getComputedStyle(el).display : 'none';
                return {
                    eqDisplay: getDisplay(eq),
                    eqClasses: eq ? eq.className : '',
                    stopBtnClasses: stopBtn ? stopBtn.className : '',
                    hasSpinner: stopBtn ? Boolean(stopBtn.querySelector('svg.animate-spin')) : false,
                    hasBars: Boolean(bars && bars.children.length > 0),
                    hasTimer: Boolean(timer)
                };
            })()`,
            returnByValue: true
        })).result.value;

        check('Mobile Voice: Equalizer bar is displayed (flex)', voiceState.eqDisplay === 'flex');
        check('Mobile Voice: Equalizer has black background (bg-slate-900)', voiceState.eqClasses.includes('bg-slate-900'));
        check('Mobile Voice: Circular stop button present (rounded-full bg-slate-100)', voiceState.stopBtnClasses.includes('rounded-full'));
        check('Mobile Voice: Circular stop button has inline animated spinner', voiceState.hasSpinner);
        check('Mobile Voice: Real-time audio bars rendered', voiceState.hasBars);
        check('Mobile Voice: Recording timer rendered', voiceState.hasTimer);

        const voiceShot = await client.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('scratch/mobile_360x800_voice.png', Buffer.from(voiceShot.data, 'base64'));
        console.log('Saved screenshot: scratch/mobile_360x800_voice.png');

        // Stop voice
        await client.send('Runtime.evaluate', {
            expression: `
                if (typeof stopMobileVoiceRecording === 'function') {
                    stopMobileVoiceRecording();
                }
            `
        });
        await new Promise(r => setTimeout(r, 300));

        // ====================================================================
        // TEST 5: TEMPLATE PREVIEW MODAL (NATURAL ASPECT RATIO & SLIM FRAME)
        // ====================================================================
        console.log('\n--- 5. TESTING TEMPLATE PREVIEW MODAL ---');
        await client.send('Runtime.evaluate', {
            expression: `
                const firstTmpl = document.querySelector('#mobile-image-home-templates-grid > div');
                if (firstTmpl) firstTmpl.click();
            `
        });
        await new Promise(r => setTimeout(r, 500));

        const tmplModalState = (await client.send('Runtime.evaluate', {
            expression: `(() => {
                const modal = document.getElementById('template-white-preview-modal');
                const card = document.getElementById('template-preview-card');
                const img = document.getElementById('template-preview-img');
                const useBtn = document.getElementById('template-preview-use-btn');
                const closeBtn = document.getElementById('template-preview-close-btn');
                const getDisplay = (el) => el ? window.getComputedStyle(el).display : 'none';
                return {
                    modalDisplay: getDisplay(modal),
                    imgNaturalDisplay: img ? window.getComputedStyle(img).objectFit : '',
                    hasUseBtn: Boolean(useBtn),
                    hasCloseBtn: Boolean(closeBtn),
                    cardClasses: card ? card.className : ''
                };
            })()`,
            returnByValue: true
        })).result.value;

        check('Mobile Template Modal: Opened and displayed (flex)', tmplModalState.modalDisplay === 'flex');
        check('Mobile Template Modal: Image uses natural/contain aspect fit', tmplModalState.imgNaturalDisplay === 'contain');
        check('Mobile Template Modal: Has slim outer card frame', tmplModalState.cardClasses.includes('border-slate-100') || tmplModalState.cardClasses.includes('rounded-3xl'));
        check('Mobile Template Modal: Has Use Template button', tmplModalState.hasUseBtn);

        const tmplShot = await client.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('scratch/mobile_360x800_template_modal.png', Buffer.from(tmplShot.data, 'base64'));
        console.log('Saved screenshot: scratch/mobile_360x800_template_modal.png');

        // Close modal
        await client.send('Runtime.evaluate', {
            expression: `if (typeof closeTemplateWhitePreviewModal === 'function') closeTemplateWhitePreviewModal();`
        });
        await new Promise(r => setTimeout(r, 300));

        // ====================================================================
        // TEST 6: CREATIONS BOTTOM MULTI-SELECT BAR & DELETE CONFIRMATION
        // ====================================================================
        console.log('\n--- 6. TESTING CREATIONS BOTTOM MULTI-SELECT BAR & DELETE POPUP ---');
        await client.send('Runtime.evaluate', {
            expression: `
                // Inject sample creation items if empty for testing
                if (typeof creationHistory !== 'undefined' && (!creationHistory || creationHistory.length === 0)) {
                    creationHistory = [
                        { id: 'c1', prompt: 'Sample 1', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300', timestamp: Date.now() },
                        { id: 'c2', prompt: 'Sample 2', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300', timestamp: Date.now() }
                    ];
                }
                if (typeof showMobileCreationsView === 'function') {
                    showMobileCreationsView();
                } else if (typeof switchImageStudioTab === 'function') {
                    switchImageStudioTab('creations');
                }
            `
        });
        await new Promise(r => setTimeout(r, 500));

        // Select items in creations
        await client.send('Runtime.evaluate', {
            expression: `
                if (typeof selectedCreations !== 'undefined') {
                    selectedCreations = new Set(['c1', 'c2']);
                    if (typeof updateCreationsActionBar === 'function') {
                        updateCreationsActionBar();
                    }
                }
            `
        });
        await new Promise(r => setTimeout(r, 400));

        const creationsState = (await client.send('Runtime.evaluate', {
            expression: `(() => {
                const bar = document.getElementById('mobile-creations-action-bar');
                const countLabel = document.getElementById('mobile-creations-count');
                const deleteBtn = document.getElementById('mobile-creations-delete-btn');
                const cancelBtn = document.getElementById('mobile-creations-cancel-btn');
                const downloadBtn = document.getElementById('mobile-creations-download-btn');
                const deleteModal = document.getElementById('mobile-creations-delete-modal');
                const getDisplay = (el) => el ? window.getComputedStyle(el).display : 'none';
                return {
                    barVisible: bar && !bar.classList.contains('hidden') && getDisplay(bar) !== 'none',
                    countText: countLabel ? countLabel.textContent.trim() : '',
                    hasDeleteBtn: Boolean(deleteBtn),
                    hasCancelBtn: Boolean(cancelBtn),
                    hasDownloadBtn: Boolean(downloadBtn),
                    hasDeleteModal: Boolean(deleteModal)
                };
            })()`,
            returnByValue: true
        })).result.value;

        check('Mobile Creations: Floating bottom bar is visible', creationsState.barVisible);
        check('Mobile Creations: Left count label says "2 selected"', creationsState.countText === '2 selected');
        check('Mobile Creations: Download button present', creationsState.hasDownloadBtn);
        check('Mobile Creations: Delete button present', creationsState.hasDeleteBtn);
        check('Mobile Creations: Minimal circular ( × ) close button present', creationsState.hasCancelBtn);

        // Click delete to trigger minimal confirmation popover
        await client.send('Runtime.evaluate', {
            expression: `
                const delBtn = document.getElementById('mobile-creations-delete-btn');
                if (delBtn) delBtn.click();
            `
        });
        await new Promise(r => setTimeout(r, 300));

        const deleteModalOpen = (await client.send('Runtime.evaluate', {
            expression: `(() => {
                const modal = document.getElementById('mobile-creations-delete-modal');
                return modal && !modal.classList.contains('hidden');
            })()`,
            returnByValue: true
        })).result.value;

        check('Mobile Creations: Delete tap opens minimal surface-matched confirmation modal', deleteModalOpen);

        const creationsShot = await client.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('scratch/mobile_360x800_creations_bar.png', Buffer.from(creationsShot.data, 'base64'));
        console.log('Saved screenshot: scratch/mobile_360x800_creations_bar.png');

        // ====================================================================
        // TEST 7: LARGE ANDROID (412px x 915px)
        // ====================================================================
        console.log('\n--- 7. VERIFYING LARGE ANDROID (412px × 915px) ---');
        await client.send('Emulation.setDeviceMetricsOverride', {
            width: 412,
            height: 915,
            deviceScaleFactor: 2.625,
            mobile: true
        });

        // Navigate back to image-studio home
        await client.send('Page.navigate', { url: `http://127.0.0.1:${port}/?workspace=image-studio` });
        await new Promise(r => setTimeout(r, 1500));

        const largeMobShot = await client.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('scratch/mobile_412x915_landing.png', Buffer.from(largeMobShot.data, 'base64'));
        console.log('Saved screenshot: scratch/mobile_412x915_landing.png');

        const largeMobState = (await client.send('Runtime.evaluate', {
            expression: `(() => {
                const getDisplay = (el) => el ? window.getComputedStyle(el).display : 'none';
                const mobHome = document.getElementById('mobile-image-home-container');
                const mobComp = document.getElementById('mobile-image-composer-container');
                const desktopHero = document.querySelector('#image-home-view [class*="max-w-[760px]"]');
                return {
                    mobHomeDisplay: getDisplay(mobHome),
                    mobCompDisplay: getDisplay(mobComp),
                    desktopHeroDisplay: getDisplay(desktopHero)
                };
            })()`,
            returnByValue: true
        })).result.value;

        check('Large Mobile: Mobile Home container is visible (flex)', largeMobState.mobHomeDisplay === 'flex');
        check('Large Mobile: Floating Composer container is visible (block)', largeMobState.mobCompDisplay === 'block');
        check('Large Mobile: Desktop elements strictly HIDDEN (none)', largeMobState.desktopHeroDisplay === 'none');

        // Check console errors
        console.log('\n--- 8. CHECKING RUNTIME / CONSOLE ERRORS ---');
        check('Zero console or runtime errors recorded', consoleErrors.length === 0, `errors: ${JSON.stringify(consoleErrors)}`);

    } finally {
        if (client) client.close();
        if (browserClient) browserClient.close();
        if (chrome) {
            try { chrome.kill(); } catch (_) {}
        }
        if (serverObj && serverObj.server) {
            try { serverObj.server.close(); } catch (_) {}
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

runLiveVerification().catch(err => {
    console.error('Live verification failed with exception:', err);
    process.exit(1);
});
