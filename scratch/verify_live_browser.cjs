const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const rootDir = path.resolve(__dirname, '..');

const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.js': 'text/javascript',
    '.cjs': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/') reqUrl = '/index.html';

    let filePath = path.join(rootDir, reqUrl);
    if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found: ' + reqUrl);
        return;
    }

    if (fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
        if (!fs.existsSync(filePath)) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not found index.html');
            return;
        }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    try {
        const content = fs.readFileSync(filePath);
        res.writeHead(200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*'
        });
        res.end(content);
    } catch (e) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(e.message);
    }
});

server.listen(3000, '127.0.0.1', async () => {
    console.log('[Server] Live on http://127.0.0.1:3000');

    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const cdpPort = 9222;

    const chromeProc = spawn(chromePath, [
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        '--disable-software-rasterizer',
        `--remote-debugging-port=${cdpPort}`,
        '--window-size=1440,900',
        'http://127.0.0.1:3000'
    ]);

    chromeProc.on('error', (err) => {
        console.error('[Chrome] Process spawn error:', err);
    });

    // Helper: wait ms
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    // Wait for CDP endpoint to be ready
    let targets = null;
    for (let i = 0; i < 20; i++) {
        await sleep(300);
        try {
            const data = await fetchJson(`http://127.0.0.1:${cdpPort}/json`);
            if (Array.isArray(data) && data.length > 0) {
                targets = data;
                break;
            }
        } catch (_) {}
    }

    if (!targets) {
        console.error('[FAIL] Could not connect to Chrome CDP on port ' + cdpPort);
        chromeProc.kill();
        server.close();
        process.exit(1);
    }

    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    console.log('[CDP] Connected to page:', pageTarget.url);

    // Simple WebSocket CDP client using standard http/ws
    // In Node 22+, global WebSocket is available!
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    let id = 1;
    const callbacks = new Map();
    const consoleErrors = [];
    const exceptions = [];

    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && callbacks.has(msg.id)) {
            const cb = callbacks.get(msg.id);
            callbacks.delete(msg.id);
            if (msg.error) cb.reject(msg.error);
            else cb.resolve(msg.result);
        }

        if (msg.method === 'Runtime.consoleAPICalled') {
            const type = msg.params.type;
            const text = (msg.params.args || []).map(a => a.value || a.description || '').join(' ');
            if (type === 'error') {
                console.error('[Browser Console Error]', text);
                consoleErrors.push(text);
            }
        }

        if (msg.method === 'Runtime.exceptionThrown') {
            const ex = msg.params.exceptionDetails;
            const desc = ex.exception ? (ex.exception.description || ex.exception.value) : ex.text;
            console.error('[Browser Uncaught Exception]', desc, `at line ${ex.lineNumber}:${ex.columnNumber}`);
            exceptions.push({ desc, line: ex.lineNumber });
        }
    };

    const send = (method, params = {}) => {
        return new Promise((resolve, reject) => {
            const reqId = id++;
            callbacks.set(reqId, { resolve, reject });
            ws.send(JSON.stringify({ id: reqId, method, params }));
        });
    };

    await new Promise((resolve) => { ws.onopen = resolve; });
    console.log('[CDP] WebSocket open, enabling domains...');

    await send('Runtime.enable');
    await send('Page.enable');

    // Wait 2 seconds for initial scripts to parse and execute
    await sleep(2000);

    // Evaluate in browser
    const evaluate = async (expression) => {
        const res = await send('Runtime.evaluate', {
            expression,
            returnByValue: true,
            awaitPromise: true
        });
        if (res.exceptionDetails) {
            throw new Error(res.exceptionDetails.text + ' ' + (res.exceptionDetails.exception?.description || ''));
        }
        return res.result?.value;
    };

    console.log('\n--- 1. Checking for Startup Console Errors & Syntax Errors ---');
    console.log(`Uncaught exceptions recorded: ${exceptions.length}`);
    console.log(`Console errors recorded: ${consoleErrors.length}`);

    const hasSyntaxError = exceptions.some(e => String(e.desc).includes('SyntaxError')) ||
                          consoleErrors.some(e => String(e).includes('SyntaxError'));
    const hasReferenceError = exceptions.some(e => String(e.desc).includes('ReferenceError')) ||
                             consoleErrors.some(e => String(e).includes('ReferenceError'));

    console.log('Has SyntaxError:', hasSyntaxError);
    console.log('Has ReferenceError:', hasReferenceError);

    console.log('\n--- 2. Testing Navigation to Images Workspace ---');
    const switchRes = await evaluate(`
        (function() {
            try {
                // Click Images sidebar or call switchWorkspace
                if (typeof switchWorkspace === 'function') {
                    switchWorkspace('images');
                } else if (typeof switchWorkspaceTab === 'function') {
                    switchWorkspaceTab('images');
                } else {
                    window.location.hash = '#/images';
                }
                return { success: true, mode: typeof imageStudioMode !== 'undefined' ? imageStudioMode : 'unknown' };
            } catch(e) {
                return { success: false, error: e.message };
            }
        })()
    `);
    console.log('Switch to images workspace:', JSON.stringify(switchRes));

    console.log('\n--- 3. Testing Switching to Precise Edit Workflow ---');
    const preciseSwitchRes = await evaluate(`
        (function() {
            try {
                if (typeof setImageStudioMode === 'function') {
                    setImageStudioMode('workspace', { tool: 'precise-edit' });
                }
                const controls = document.getElementById('ideogram-precise-edit-controls');
                const isControlsVisible = controls && !controls.classList.contains('hidden');
                const activeTool = typeof activeWorkflowTool !== 'undefined' ? activeWorkflowTool : null;
                const activeLabel = document.getElementById('workspace-active-tool-label')?.textContent;
                return { success: true, activeTool, activeLabel, isControlsVisible };
            } catch(e) {
                return { success: false, error: e.message };
            }
        })()
    `);
    console.log('Precise Edit workflow state:', JSON.stringify(preciseSwitchRes));

    console.log('\n--- 4. Testing Precise Edit Model Dropdown & Clean "Auto" Label ---');
    const modelDropdownTest = await evaluate(`
        (function() {
            try {
                const modelBtn = document.getElementById('precise-edit-model-btn');
                const modelLabel = document.getElementById('precise-edit-model-label');
                const modelDrop = document.getElementById('precise-edit-model-dropdown');
                const topSwitcherBtn = document.getElementById('workspace-tool-switcher-btn');
                const topFlyout = document.getElementById('workspace-tool-flyout');

                const initialLabel = modelLabel ? modelLabel.textContent.trim() : null;

                // Step A: Click Model Dropdown to open it
                modelBtn.click();
                const modelOpenAfterClick = !modelDrop.classList.contains('hidden');

                // Step B: Click Top Switcher -> Model Dropdown MUST immediately close (No Overlap!)
                topSwitcherBtn.click();
                const modelClosedAfterTopSwitcher = modelDrop.classList.contains('hidden');
                const topFlyoutOpen = !topFlyout.classList.contains('hidden');

                // Step C: Click Model Dropdown again -> Top Switcher MUST immediately close
                modelBtn.click();
                const topFlyoutClosedAfterModelClick = topFlyout.classList.contains('hidden');
                const modelOpenAgain = !modelDrop.classList.contains('hidden');

                // Step D: Select Krea K3 Edit option
                const kreaOption = modelDrop.querySelector('[data-edit-model="krea/k3-edit"]');
                if (kreaOption) kreaOption.click();
                const labelAfterKrea = modelLabel ? modelLabel.textContent.trim() : null;

                // Step E: Select Auto option
                modelBtn.click();
                const autoOption = modelDrop.querySelector('[data-edit-model="auto"]');
                if (autoOption) autoOption.click();
                const labelAfterAuto = modelLabel ? modelLabel.textContent.trim() : null;

                return {
                    initialLabel,
                    modelOpenAfterClick,
                    modelClosedAfterTopSwitcher,
                    topFlyoutOpen,
                    topFlyoutClosedAfterModelClick,
                    modelOpenAgain,
                    labelAfterKrea,
                    labelAfterAuto
                };
            } catch(e) {
                return { error: e.message, stack: e.stack };
            }
        })()
    `);
    console.log('Model Dropdown Interaction Test Results:\n', JSON.stringify(modelDropdownTest, null, 2));

    console.log('\n--- 5. Testing Precise Edit Gallery Card Model Brand Icons ---');
    const brandIconTest = await evaluate(`
        (function() {
            try {
                // Test getModelIconSvg for all 4 models
                const iconAuto = typeof getModelIconSvg === 'function' ? getModelIconSvg('auto') : '';
                const iconKrea = typeof getModelIconSvg === 'function' ? getModelIconSvg('krea/k3-edit') : '';
                const iconSeedream = typeof getModelIconSvg === 'function' ? getModelIconSvg('bytedance-seed/seedream-5-5') : '';
                const iconBanana = typeof getModelIconSvg === 'function' ? getModelIconSvg('google/gemini-3.1-flash-image-preview') : '';

                const hasAutoIcon = iconAuto.includes('<svg') && iconAuto.includes('text-blue-500');
                const hasKreaIcon = iconKrea.includes('<svg') && (iconKrea.includes('M12 2 2 7') || iconKrea.includes('polygon'));
                const hasSeedreamIcon = iconSeedream.includes('<svg') && iconSeedream.includes('rect');
                const hasBananaIcon = iconBanana.includes('<svg') && (iconBanana.includes('gemini') || iconBanana.includes('M12 2C12'));

                return {
                    hasAutoIcon,
                    hasKreaIcon,
                    hasSeedreamIcon,
                    hasBananaIcon
                };
            } catch(e) {
                return { error: e.message };
            }
        })()
    `);
    console.log('Brand Icon Test Results:\n', JSON.stringify(brandIconTest, null, 2));

    console.log('\n--- 6. Mobile 360x800 Viewport Verification ---');
    // Emulate Mobile Device Metrics
    await send('Emulation.setDeviceMetricsOverride', {
        width: 360,
        height: 800,
        deviceScaleFactor: 2,
        mobile: true
    });
    await sleep(500);

    const mobileTest = await evaluate(`
        (function() {
            try {
                if (typeof openMobileWorkspaceDrawer === 'function') {
                    openMobileWorkspaceDrawer('precise-edit');
                }
                const mobLabel = document.getElementById('mobile-precise-model-label');
                const labelText = mobLabel ? mobLabel.textContent.trim() : null;

                const mobBtn = document.getElementById('mobile-precise-model-btn');
                const mobDrop = document.getElementById('mobile-precise-model-dropdown');

                let mobOpen = false;
                if (mobBtn && mobDrop) {
                    mobBtn.click();
                    mobOpen = !mobDrop.classList.contains('hidden');
                }

                return {
                    labelText,
                    mobOpen
                };
            } catch(e) {
                return { error: e.message };
            }
        })()
    `);
    console.log('Mobile Test Results:\n', JSON.stringify(mobileTest, null, 2));

    // Summary Verification Checks
    let allPassed = true;
    function check(desc, passed) {
        if (passed) {
            console.log(`[PASS] ${desc}`);
        } else {
            console.error(`[FAIL] ${desc}`);
            allPassed = false;
        }
    }

    console.log('\n================================================================');
    console.log('FINAL LIVE VERIFICATION RESULTS');
    console.log('================================================================');
    check('ZERO SyntaxError in browser', !hasSyntaxError);
    check('ZERO ReferenceError in browser', !hasReferenceError);
    check('Desktop model dropdown opens on click', modelDropdownTest.modelOpenAfterClick === true);
    check('Top switcher click immediately closes model dropdown (mutual exclusion / no overlap)', modelDropdownTest.modelClosedAfterTopSwitcher === true);
    check('Model dropdown click immediately closes top switcher flyout', modelDropdownTest.topFlyoutClosedAfterModelClick === true);
    check('Desktop Precise Edit displays clean "Auto" label', modelDropdownTest.labelAfterAuto === 'Auto');
    check('Desktop Precise Edit switches to "Krea K3 Edit"', modelDropdownTest.labelAfterKrea === 'Krea K3 Edit');
    check('Brand icon exists for Auto', brandIconTest.hasAutoIcon === true);
    check('Brand icon exists for Krea K3 Edit', brandIconTest.hasKreaIcon === true);
    check('Brand icon exists for Seedream 5.5', brandIconTest.hasSeedreamIcon === true);
    check('Brand icon exists for Nano Banana 2', brandIconTest.hasBananaIcon === true);
    check('Mobile Precise Edit displays clean "Auto" label', mobileTest.labelText === 'Auto');
    check('Mobile Precise Edit model dropdown opens smoothly', mobileTest.mobOpen === true);

    // Clean up
    ws.close();
    chromeProc.kill();
    server.close(() => {
        console.log('\nTest completed and server closed.');
        process.exit(allPassed ? 0 : 1);
    });
});

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(body)); }
                catch(e) { reject(e); }
            });
        }).on('error', reject);
    });
}
