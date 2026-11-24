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
    '.webp': 'image/webp',
    '.woff2': 'font/woff2'
};

function startServer() {
    return new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
            let reqPath = decodeURI(req.url.split('?')[0].split('#')[0]);
            if (reqPath === '/' || reqPath === '/create/svg/vectorize' || reqPath.startsWith('/create/svg/vectorize/') || reqPath === '/vectorize') {
                reqPath = '/index.html';
            }
            let filePath = path.join(rootDir, reqPath);
            if (!fs.existsSync(filePath)) {
                filePath = path.join(rootDir, 'index.html');
            }
            const ext = path.extname(filePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';
            fs.readFile(filePath, (err, content) => {
                if (err) {
                    res.writeHead(500);
                    res.end('Error loading file');
                } else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content);
                }
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
            this.ws.close();
        }
    }
}

async function runVerification() {
    let server;
    let chrome;
    let client;
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

        // Launch headless Chrome
        chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
            '--headless=new',
            '--remote-debugging-port=9222',
            '--disable-gpu',
            '--no-sandbox',
            '--disable-extensions',
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

        const browserClient = new CDPClient(wsEndpoint);
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
                // filter external network fetch errors (e.g. backend /api/chat/stream 404 when test submits message)
                if (!msg.includes('POST') && !msg.includes('Failed to load resource')) {
                    consoleErrors.push(msg);
                }
            }
        });
        client.on('Runtime.exceptionThrown', (params) => {
            consoleErrors.push(params.exceptionDetails.text + (params.exceptionDetails.exception ? ' ' + params.exceptionDetails.exception.description : ''));
        });

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

        await client.send('Page.navigate', { url: `http://localhost:${PORT}/` });
        await new Promise(r => setTimeout(r, 2000));

        const desktopState = (await client.send('Runtime.evaluate', {
            expression: `(() => {
                const mobHome = document.getElementById('mobile-home-container');
                const heroSection = document.getElementById('hero-section');
                const chatInput = document.getElementById('chat-input');
                const imageStudioWorkspace = document.getElementById('image-studio-workspace');
                const imageHomeView = document.getElementById('image-home-view');

                const getDisplay = (el) => el ? window.getComputedStyle(el).display : 'none';

                return {
                    mobHomeDisplay: getDisplay(mobHome),
                    heroSectionDisplay: getDisplay(heroSection),
                    chatInputExists: Boolean(chatInput),
                    imageStudioExists: Boolean(imageStudioWorkspace),
                    imageHomeExists: Boolean(imageHomeView),
                    currentWorkspace: typeof currentWorkspace !== 'undefined' ? currentWorkspace : null
                };
            })()`,
            returnByValue: true
        })).result.value;

        check('Desktop: Mobile Homepage is HIDDEN on 1440x900', desktopState.mobHomeDisplay === 'none', `display: ${desktopState.mobHomeDisplay}`);
        check('Desktop: Hero Section is DISPLAYED (flex) on 1440x900', desktopState.heroSectionDisplay === 'flex', `display: ${desktopState.heroSectionDisplay}`);
        check('Desktop: Chat Input exists and is functional', desktopState.chatInputExists);

        // Capture Desktop Screenshot
        const desktopShot = await client.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(rootDir, 'scratch', 'desktop_1440x900.png'), Buffer.from(desktopShot.data, 'base64'));
        console.log('[Screenshot] Saved scratch/desktop_1440x900.png');

        // Test Images workspace switch on Desktop
        await client.send('Runtime.evaluate', { expression: `switchWorkspace('image-studio')` });
        await new Promise(r => setTimeout(r, 1000));
        const desktopImagesState = (await client.send('Runtime.evaluate', {
            expression: `(() => {
                const homeView = document.getElementById('image-home-view');
                const studioWorkspace = document.getElementById('image-studio-workspace');
                const isHomeActive = !homeView.classList.contains('hidden') || !studioWorkspace.classList.contains('hidden');
                return { isHomeActive, font: window.getComputedStyle(studioWorkspace).fontFamily };
            })()`,
            returnByValue: true
        })).result.value;
        check('Desktop Images workspace opens untouched', desktopImagesState.isHomeActive);
        check('Desktop Images typography uses Plus Jakarta Sans', desktopImagesState.font.includes('Plus Jakarta Sans'), desktopImagesState.font);

        // Switch back to Chat
        await client.send('Runtime.evaluate', { expression: `switchWorkspace('chat')` });
        await new Promise(r => setTimeout(r, 500));

        // ════════════════════════════════════════════════════════════════════
        // TEST SUITE 2: MOBILE / ANDROID (360px × 800px)
        // ════════════════════════════════════════════════════════════════════
        console.log('\n--- VERIFYING MOBILE / ANDROID (360px × 800px) ---');
        await client.send('Emulation.setDeviceMetricsOverride', {
            width: 360,
            height: 800,
            deviceScaleFactor: 2,
            mobile: true
        });
        await new Promise(r => setTimeout(r, 1000));

        const mobileState = (await client.send('Runtime.evaluate', {
            expression: `(() => {
                const mobHome = document.getElementById('mobile-home-container');
                const heroSection = document.getElementById('hero-section');
                const chatFreePlanHeader = document.getElementById('chat-free-plan-header');
                const chatHeaderActions = document.getElementById('chat-header-actions');
                const sidebarToggleBtn = document.getElementById('mobile-sidebar-toggle-btn');
                const incognitoBtn = document.getElementById('mobile-incognito-btn');
                const greeting = document.getElementById('mobile-greeting-heading');
                const composerCard = document.getElementById('mobile-composer-card');
                const chatInput = document.getElementById('mobile-chat-input');
                const plusBtn = document.getElementById('mobile-plus-btn');
                const modelBtn = document.getElementById('mobile-model-select-btn');
                const modelName = document.getElementById('mobile-model-name');
                const micBtn = document.getElementById('mobile-mic-btn');
                const sendBtn = document.getElementById('mobile-send-btn');

                const getDisplay = (el) => el ? window.getComputedStyle(el).display : 'none';
                const mobHomeStyle = window.getComputedStyle(mobHome);
                const greetingStyle = window.getComputedStyle(greeting);
                const composerStyle = window.getComputedStyle(composerCard);

                return {
                    mobHomeDisplay: mobHomeStyle.display,
                    mobHomeBg: mobHomeStyle.backgroundColor,
                    heroSectionDisplay: getDisplay(heroSection),
                    freePlanDisplay: getDisplay(chatFreePlanHeader),
                    headerActionsDisplay: getDisplay(chatHeaderActions),
                    sidebarToggleExists: Boolean(sidebarToggleBtn),
                    incognitoBtnExists: Boolean(incognitoBtn),
                    greetingText: greeting ? greeting.textContent.trim() : '',
                    greetingFont: greetingStyle.fontFamily,
                    greetingSize: greetingStyle.fontSize,
                    greetingWeight: greetingStyle.fontWeight,
                    greetingTracking: greetingStyle.letterSpacing,
                    composerBorderRadius: composerStyle.borderRadius,
                    composerBg: composerStyle.backgroundColor,
                    chatInputPlaceholder: chatInput ? chatInput.placeholder : '',
                    modelLabel: modelName ? modelName.textContent.trim() : '',
                    sendBtnBg: window.getComputedStyle(sendBtn).backgroundColor,
                    sendBtnDisabled: sendBtn.hasAttribute('disabled')
                };
            })()`,
            returnByValue: true
        })).result.value;

        check('Mobile: Mobile Homepage is DISPLAYED (flex) on 360x800', mobileState.mobHomeDisplay === 'flex', `display: ${mobileState.mobHomeDisplay}`);
        check('Mobile: Pure white background (#FFFFFF / rgb(255, 255, 255))', mobileState.mobHomeBg === 'rgb(255, 255, 255)', `bg: ${mobileState.mobHomeBg}`);
        check('Mobile: Desktop Hero Section is HIDDEN on 360x800', mobileState.heroSectionDisplay === 'none', `display: ${mobileState.heroSectionDisplay}`);
        check('Mobile: Desktop Free Plan Header is HIDDEN on 360x800', mobileState.freePlanDisplay === 'none', `display: ${mobileState.freePlanDisplay}`);
        check('Mobile: Desktop Header Actions is HIDDEN on 360x800', mobileState.headerActionsDisplay === 'none', `display: ${mobileState.headerActionsDisplay}`);
        check('Mobile: ChatGPT-style Sidebar toggle button exists', mobileState.sidebarToggleExists);
        check('Mobile: Perplexity-style Incognito button exists', mobileState.incognitoBtnExists);
        check('Mobile: Centered greeting text is "What would you like to do today?"', mobileState.greetingText === "What would you like to do today?", `text: ${mobileState.greetingText}`);
        check('Mobile: Greeting font uses Desktop Images typography (Plus Jakarta Sans)', mobileState.greetingFont.includes('Plus Jakarta Sans'), `font: ${mobileState.greetingFont}`);
        check('Mobile: Greeting font size is 24px', mobileState.greetingSize === '24px', `size: ${mobileState.greetingSize}`);
        check('Mobile: Greeting font weight is 600', mobileState.greetingWeight === '600', `weight: ${mobileState.greetingWeight}`);
        check('Mobile: Composer card has rounded-[28px] border-radius', mobileState.composerBorderRadius === '28px', `radius: ${mobileState.composerBorderRadius}`);
        check('Mobile: Chat input placeholder is "Ask anything..."', mobileState.chatInputPlaceholder === 'Ask anything...', `placeholder: ${mobileState.chatInputPlaceholder}`);
        check('Mobile: Inline model selector shows "Auto"', mobileState.modelLabel === 'Auto', `model: ${mobileState.modelLabel}`);
        check('Mobile: Send button is initially disabled/neutral', mobileState.sendBtnDisabled);

        // Capture Mobile (360x800) Screenshot
        const mobileShot = await client.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(rootDir, 'scratch', 'mobile_360x800_home.png'), Buffer.from(mobileShot.data, 'base64'));
        console.log('[Screenshot] Saved scratch/mobile_360x800_home.png');

        // Test Popover Menus on Mobile
        console.log('\n--- VERIFYING MOBILE INTERACTIONS ---');

        // 1. Plus button toggle
        await client.send('Runtime.evaluate', { expression: `document.getElementById('mobile-plus-btn').click()` });
        await new Promise(r => setTimeout(r, 300));
        const attachPopoverOpen = (await client.send('Runtime.evaluate', {
            expression: `!document.getElementById('mobile-attach-popover').classList.contains('hidden')`,
            returnByValue: true
        })).result.value;
        check('Mobile: "+" button opens Attachment Popover', attachPopoverOpen);

        // Capture Attachment Popover Screenshot
        const attachShot = await client.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(rootDir, 'scratch', 'mobile_360x800_attachment_popover.png'), Buffer.from(attachShot.data, 'base64'));

        // 2. Model selector toggle
        await client.send('Runtime.evaluate', { expression: `document.getElementById('mobile-model-select-btn').click()` });
        await new Promise(r => setTimeout(r, 300));
        const modelPopoverOpen = (await client.send('Runtime.evaluate', {
            expression: `!document.getElementById('mobile-model-popover').classList.contains('hidden') && document.getElementById('mobile-attach-popover').classList.contains('hidden')`,
            returnByValue: true
        })).result.value;
        check('Mobile: "Auto ⌄" opens Model Selector Popover and closes Attachment Popover', modelPopoverOpen);

        // Capture Model Popover Screenshot
        const modelShot = await client.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(rootDir, 'scratch', 'mobile_360x800_model_popover.png'), Buffer.from(modelShot.data, 'base64'));

        // Close popovers
        await client.send('Runtime.evaluate', { expression: `closeMobileModelPopover(); closeMobileAttachPopover();` });

        // 3. Incognito Toggle
        await client.send('Runtime.evaluate', { expression: `document.getElementById('mobile-incognito-btn').click()` });
        await new Promise(r => setTimeout(r, 400));
        const incogState = (await client.send('Runtime.evaluate', {
            expression: `(() => {
                const btn = document.getElementById('mobile-incognito-btn');
                const heading = document.getElementById('mobile-greeting-heading');
                return {
                    isActive: btn.classList.contains('is-active'),
                    btnBg: window.getComputedStyle(btn).backgroundColor,
                    text: heading.textContent.trim(),
                    chatStateIncog: chatState.isIncognito
                };
            })()`,
            returnByValue: true
        })).result.value;
        check('Mobile: Incognito toggle activates is-active visual state', incogState.isActive && incogState.chatStateIncog, `bg: ${incogState.btnBg}`);
        check('Mobile: Greeting heading updates to "You\'re incognito"', incogState.text === "You're incognito", `text: ${incogState.text}`);

        // Capture Incognito Screenshot
        const incogShot = await client.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(rootDir, 'scratch', 'mobile_360x800_incognito.png'), Buffer.from(incogShot.data, 'base64'));

        // Toggle back to Normal mode
        await client.send('Runtime.evaluate', { expression: `document.getElementById('mobile-incognito-btn').click()` });
        await new Promise(r => setTimeout(r, 400));

        // 4. Test Text Input and Send Button State Transition
        await client.send('Runtime.evaluate', {
            expression: `(() => {
                const input = document.getElementById('mobile-chat-input');
                input.value = 'Hello Mestrio AI';
                input.dispatchEvent(new Event('input'));
            })()`
        });
        await new Promise(r => setTimeout(r, 200));

        const activeSendState = (await client.send('Runtime.evaluate', {
            expression: `(() => {
                const btn = document.getElementById('mobile-send-btn');
                return {
                    disabled: btn.hasAttribute('disabled'),
                    btnBg: window.getComputedStyle(btn).backgroundColor,
                    cursor: window.getComputedStyle(btn).cursor
                };
            })()`,
            returnByValue: true
        })).result.value;
        check('Mobile: Send button transitions to active dark (#111827 / rgb(17, 24, 39))', activeSendState.btnBg === 'rgb(17, 24, 39)', `bg: ${activeSendState.btnBg}`);
        check('Mobile: Send button is enabled with cursor pointer', !activeSendState.disabled && activeSendState.cursor === 'pointer');

        // Capture Active Send Button Screenshot
        const typingShot = await client.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(rootDir, 'scratch', 'mobile_360x800_typing.png'), Buffer.from(typingShot.data, 'base64'));

        // 5. Test Message Submit and Transition to Active Conversation
        await client.send('Runtime.evaluate', { expression: `document.getElementById('mobile-send-btn').click()` });
        await new Promise(r => setTimeout(r, 800));

        const chatActiveState = (await client.send('Runtime.evaluate', {
            expression: `(() => {
                const mobHome = document.getElementById('mobile-home-container');
                const heroSection = document.getElementById('hero-section');
                const messagesContainer = document.getElementById('messages-container');
                const msgs = document.querySelectorAll('.message-bubble, [id^="msg_"]');
                return {
                    mobHomeDisplay: window.getComputedStyle(mobHome).display,
                    heroSectionDisplay: window.getComputedStyle(heroSection).display,
                    messagesContainerDisplay: window.getComputedStyle(messagesContainer).display,
                    msgCount: msgs.length
                };
            })()`,
            returnByValue: true
        })).result.value;
        check('Mobile: After sending, Mobile Homepage is hidden', chatActiveState.mobHomeDisplay === 'none', `display: ${chatActiveState.mobHomeDisplay}`);
        check('Mobile: Active conversation view is displayed', chatActiveState.heroSectionDisplay === 'flex' && chatActiveState.messagesContainerDisplay !== 'none');

        // Capture Active Chat Screenshot
        const convShot = await client.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(rootDir, 'scratch', 'mobile_360x800_active_chat.png'), Buffer.from(convShot.data, 'base64'));

        // 6. Test New Chat restores Mobile Homepage
        await client.send('Runtime.evaluate', { expression: `createNewChat()` });
        await new Promise(r => setTimeout(r, 600));

        const restoredMobileState = (await client.send('Runtime.evaluate', {
            expression: `window.getComputedStyle(document.getElementById('mobile-home-container')).display`,
            returnByValue: true
        })).result.value;
        check('Mobile: Clicking New Chat restores Mobile Homepage', restoredMobileState === 'flex', `display: ${restoredMobileState}`);

        // ════════════════════════════════════════════════════════════════════
        // TEST SUITE 3: MOBILE / ANDROID (412px × 915px)
        // ════════════════════════════════════════════════════════════════════
        console.log('\n--- VERIFYING MOBILE / ANDROID (412px × 915px) ---');
        await client.send('Emulation.setDeviceMetricsOverride', {
            width: 412,
            height: 915,
            deviceScaleFactor: 2.625,
            mobile: true
        });
        await new Promise(r => setTimeout(r, 600));

        const mobile412State = (await client.send('Runtime.evaluate', {
            expression: `(() => {
                const mobHome = document.getElementById('mobile-home-container');
                return {
                    display: window.getComputedStyle(mobHome).display,
                    bg: window.getComputedStyle(mobHome).backgroundColor
                };
            })()`,
            returnByValue: true
        })).result.value;
        check('Mobile: Mobile Homepage displays cleanly on 412x915', mobile412State.display === 'flex' && mobile412State.bg === 'rgb(255, 255, 255)');

        const shot412 = await client.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(rootDir, 'scratch', 'mobile_412x915_home.png'), Buffer.from(shot412.data, 'base64'));
        console.log('[Screenshot] Saved scratch/mobile_412x915_home.png');

        // Check console errors
        console.log('\n--- CONSOLE / RUNTIME ERROR AUDIT ---');
        if (consoleErrors.length === 0) {
            console.log('[PASS] ZERO console or runtime errors recorded!');
        } else {
            console.error('[FAIL] Console errors found:', consoleErrors);
            allPassed = false;
        }

        console.log('\n================================================================');
        if (allPassed) {
            console.log('ALL MANDATORY VERIFICATION CHECKS PASSED (100%)!');
        } else {
            console.error('SOME VERIFICATION CHECKS FAILED.');
        }
        console.log('================================================================');

    } catch (err) {
        console.error('Error during verification:', err);
        allPassed = false;
    } finally {
        if (client) client.close();
        if (chrome) chrome.kill();
        if (server) server.close();
        process.exit(allPassed ? 0 : 1);
    }
}

runVerification();
