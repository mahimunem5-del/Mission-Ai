const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3457;
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
    '.svg': 'image/svg+xml'
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
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 Not Found');
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

    async connect(retries = 8) {
        for (let i = 0; i < retries; i++) {
            try {
                await new Promise((resolve, reject) => {
                    this.ws = new WebSocket(this.wsUrl);
                    this.ws.onopen = resolve;
                    this.ws.onerror = reject;
                });
                break;
            } catch (err) {
                if (i === retries - 1) throw err;
                await new Promise(r => setTimeout(r, 250));
            }
        }

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

    close() {
        if (this.ws) {
            try { this.ws.close(); } catch (_) {}
        }
    }
}

function findChromePath() {
    const candidates = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) return p;
    }
    return 'chrome';
}

async function runVerification() {
    let server;
    let chrome;
    let client;
    let allPassed = true;

    function check(desc, passed, details = '') {
        if (passed) {
            console.log(`  âœ“ PASS: ${desc}`);
        } else {
            console.error(`  âœ— FAIL: ${desc} ${details ? '(' + details + ')' : ''}`);
            allPassed = false;
        }
    }

    try {
        server = await startServer();

        const chromePath = findChromePath();
        console.log('[Chrome] Launching Chrome CDP from:', chromePath);

        const chromePort = 9225;
        chrome = spawn(chromePath, [
            '--headless=new',
            '--remote-debugging-port=' + chromePort,
            '--disable-gpu',
            '--no-sandbox',
            '--disable-extensions',
            '--window-size=1440,900'
        ], { stdio: 'ignore' });

        await new Promise(r => setTimeout(r, 1200));

        const versionRes = await fetch(`http://127.0.0.1:${chromePort}/json/version`);
        const versionData = await versionRes.json();
        const browserWs = versionData.webSocketDebuggerUrl;

        const browserClient = new CDPClient(browserWs);
        await browserClient.connect();

        const { targetId } = await browserClient.send('Target.createTarget', { url: `http://localhost:${PORT}/index.html` });
        const targetsRes = await fetch(`http://127.0.0.1:${chromePort}/json`);
        const targets = await targetsRes.json();
        const pageTarget = targets.find(t => t.id === targetId);

        client = new CDPClient(pageTarget.webSocketDebuggerUrl);
        await client.connect();

        await client.send('Page.enable');
        await client.send('DOM.enable');
        await client.send('Runtime.enable');

        await new Promise(r => setTimeout(r, 1000));

        const safeEval = async (expression) => {
            const res = await client.send('Runtime.evaluate', {
                expression,
                returnByValue: true,
                awaitPromise: true
            });
            if (res.exceptionDetails) {
                throw new Error(res.exceptionDetails.text || JSON.stringify(res.exceptionDetails));
            }
            return res.result?.value;
        };

        // ============================================================
        // TEST 1: MOBILE 360x800 - CREATIONS + NEW BUTTON BEHAVIOR
        // ============================================================
        console.log('\n======================================================');
        console.log('1. VERIFYING MOBILE CREATIONS "+ New" BUTTON');
        console.log('======================================================');

        await client.send('Emulation.setDeviceMetricsOverride', {
            width: 360,
            height: 800,
            deviceScaleFactor: 2,
            mobile: true
        });
        await new Promise(r => setTimeout(r, 400));

        // Step A: Open Precise Edit first, fill with mock data
        console.log('-> Step A: Opening Precise Edit drawer and putting state in...');
        const preciseState = await safeEval(`(() => {
            // Open precise edit
            openMobileWorkspaceDrawer('precise-edit', {
                prompt: 'Turn the jacket into red velvet',
                editItem: { id: 'test_item_123', url: 'https://example.com/test.png', img: 'https://example.com/test.png' }
            });
            return {
                tool: window.activeMobileTool,
                drawerOpen: window.isMobileDrawerOpen,
                title: document.getElementById('mobile-drawer-title')?.textContent,
                promptVal: document.getElementById('mobile-precise-prompt-input')?.value,
                hasSource: Boolean(window.studioPreciseEditState && window.studioPreciseEditState.sourceItem)
            };
        })()`);
        console.log('Precise Edit state:', preciseState);
        check('Precise Edit opens correctly', preciseState.tool === 'precise-edit' && preciseState.drawerOpen);
        check('Precise Edit title is correct', preciseState.title === 'Precise Edit');
        check('Precise Edit has prompt and source', preciseState.promptVal === 'Turn the jacket into red velvet' && preciseState.hasSource);

        // Step B: Close the drawer
        console.log('-> Step B: Closing drawer...');
        await safeEval(`setIsMobileDrawerOpen(false)`);

        // Step C: Go to Creations view
        console.log('-> Step C: Navigating to Creations result feed view...');
        const creationsViewState = await safeEval(`(() => {
            setMobileWorkspaceView('results');
            const feed = document.getElementById('mobile-workspace-result-feed');
            return {
                view: window.mobileWorkspaceView,
                feedVisible: feed && !feed.classList.contains('hidden')
            };
        })()`);
        console.log('Creations view state:', creationsViewState);
        check('Creations result feed is visible', creationsViewState.view === 'results' && creationsViewState.feedVisible);

        // Step D: Tap the "+ New" button in the Creations header
        console.log('-> Step D: Tapping "+ New" button in Creations header...');
        const newBtnResult = await safeEval(`(() => {
            const btn = document.getElementById('mobile-result-new-btn');
            if (!btn) return { error: 'Button not found' };
            btn.click();

            const title = document.getElementById('mobile-drawer-title')?.textContent;
            const genPrompt = document.getElementById('mobile-gen-prompt-input')?.value;
            const precisePrompt = document.getElementById('mobile-precise-prompt-input')?.value;
            const ctaBtn = document.getElementById('mobile-drawer-cta-btn');
            const pGen = document.getElementById('mobile-panel-generate');
            const pPrecise = document.getElementById('mobile-panel-precise-edit');

            return {
                activeMobileTool: window.activeMobileTool,
                activeTool: window.activeTool,
                drawerOpen: window.isMobileDrawerOpen,
                title: title,
                genPrompt: genPrompt,
                precisePrompt: precisePrompt,
                preciseSourceCleared: !window.studioPreciseEditState || !window.studioPreciseEditState.sourceItem,
                refImagesCount: (imageStudioState?.referenceImages || []).length,
                pGenVisible: pGen && !pGen.classList.contains('hidden'),
                pPreciseHidden: pPrecise && pPrecise.classList.contains('hidden'),
                ctaDisabled: ctaBtn ? ctaBtn.disabled : null
            };
        })()`);
        console.log('"+ New" Click Result:', newBtnResult);

        check('activeMobileTool reset to "generate-image"', newBtnResult.activeMobileTool === 'generate-image');
        check('activeTool is "generate"', newBtnResult.activeTool === 'generate');
        check('Drawer is open', newBtnResult.drawerOpen === true);
        check('Drawer title is "Generate Image"', newBtnResult.title === 'Generate Image');
        check('Generate Image panel is visible', newBtnResult.pGenVisible === true);
        check('Precise Edit panel is strictly hidden', newBtnResult.pPreciseHidden === true);
        check('Prompt text is completely empty', newBtnResult.genPrompt === '');
        check('Precise edit leftover prompt is cleared', newBtnResult.precisePrompt === '');
        check('Precise edit source item is null/cleared', newBtnResult.preciseSourceCleared === true);
        check('Reference images are cleared (count 0)', newBtnResult.refImagesCount === 0);
        check('CTA button is disabled when prompt is empty', newBtnResult.ctaDisabled === true);

        // Step E: Repeat a second time to ensure 100% consistency
        console.log('-> Step E: Retesting sequence a 2nd time...');
        await safeEval(`(() => {
            openMobileWorkspaceDrawer('precise-edit', { prompt: 'Add sunglasses' });
            setIsMobileDrawerOpen(false);
            setMobileWorkspaceView('results');
            document.getElementById('mobile-result-new-btn').click();
        })()`);
        const repeatCheck = await safeEval(`(() => {
            return {
                tool: window.activeMobileTool,
                title: document.getElementById('mobile-drawer-title')?.textContent,
                prompt: document.getElementById('mobile-gen-prompt-input')?.value,
                drawerOpen: window.isMobileDrawerOpen
            };
        })()`);
        check('Repeat test: Clean Generate Image opens again', repeatCheck.tool === 'generate-image' && repeatCheck.title === 'Generate Image' && repeatCheck.prompt === '' && repeatCheck.drawerOpen);

        // ============================================================
        // TEST 2: LAN IP & MOBILE API ROUTING
        // ============================================================
        console.log('\n======================================================');
        console.log('2. VERIFYING LAN IP / MOBILE API ROUTING & CONFIG');
        console.log('======================================================');

        // Check getApiBaseUrl() behavior
        const apiBaseResult = await safeEval(`(() => {
            return {
                baseUrl: typeof getApiBaseUrl === 'function' ? getApiBaseUrl() : null
            };
        })()`);
        check('getApiBaseUrl() returns relative "" on http protocol', apiBaseResult.baseUrl === '');

        // Verify vite.config.js exists and has correct host & proxy
        const viteConfigContent = fs.readFileSync('vite.config.js', 'utf8');
        check('vite.config.js exists and sets host: true (0.0.0.0)', viteConfigContent.includes('host: true'));
        check('vite.config.js proxies /api to port 5001', viteConfigContent.includes("'/api'") && viteConfigContent.includes('5001'));

        // Verify server/src/index.js CORS and body-parser limits
        const serverIndexContent = fs.readFileSync('server/src/index.js', 'utf8');
        check('server/src/index.js allows 192.168.* origins', serverIndexContent.includes('192\\.168\\.'));
        check('server/src/index.js allows 10.* origins', serverIndexContent.includes('10\\.'));
        check('server/src/index.js allows 172.* origins', serverIndexContent.includes('172\\.'));
        check('server/src/index.js has express.json limit 50mb', serverIndexContent.includes("express.json({ limit: '50mb' })"));
        check('server/src/index.js binds to 0.0.0.0 explicitly', serverIndexContent.includes("app.listen(PORT, '0.0.0.0'"));

        // ============================================================
        // TEST 3: DESKTOP LOCKED (1440px × 900px)
        // ============================================================
        console.log('\n======================================================');
        console.log('3. VERIFYING DESKTOP UI LOCKED (1440px × 900px)');
        console.log('======================================================');

        await client.send('Emulation.setDeviceMetricsOverride', {
            width: 1440,
            height: 900,
            deviceScaleFactor: 1,
            mobile: false
        });
        await new Promise(r => setTimeout(r, 400));

        const desktopState = await safeEval(`(() => {
            const getDisplay = (el) => el ? window.getComputedStyle(el).display : 'none';
            const mobDrawer = document.getElementById('mobile-workspace-drawer');
            const mobFeed = document.getElementById('mobile-workspace-result-feed');
            const mobHome = document.getElementById('mobile-image-home-container');
            const mobComp = document.getElementById('mobile-image-composer-container');
            const desktopNav = document.getElementById('sidebar');

            return {
                mobDrawerDisplay: getDisplay(mobDrawer),
                mobFeedDisplay: getDisplay(mobFeed),
                mobHomeDisplay: getDisplay(mobHome),
                mobCompDisplay: getDisplay(mobComp),
                desktopNavExists: Boolean(desktopNav)
            };
        })()`);

        check('Desktop: Mobile drawer is hidden (none)', desktopState.mobDrawerDisplay === 'none');
        check('Desktop: Mobile result feed is hidden (none)', desktopState.mobFeedDisplay === 'none');
        check('Desktop: Mobile home container is hidden (none)', desktopState.mobHomeDisplay === 'none');
        check('Desktop: Mobile composer container is hidden (none)', desktopState.mobCompDisplay === 'none');
        check('Desktop: Desktop navigation is intact', desktopState.desktopNavExists === true);

    } finally {
        if (client) client.close();
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
        console.error('VERIFICATION CHECKS FAILED! Check log details above.');
        process.exit(1);
    }
    console.log('======================================================\n');
}

runVerification().catch(err => {
    console.error('Fatal verification error:', err);
    process.exit(1);
});
