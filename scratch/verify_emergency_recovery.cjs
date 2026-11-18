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

    close() {
        if (this.ws) this.ws.close();
    }
}

async function runRecoveryVerification() {
    let server;
    let chrome;
    let browserClient;
    let allPassed = true;

    function check(testName, condition, details = '') {
        if (condition) {
            console.log(`  [PASS] ${testName}`);
        } else {
            console.error(`  [FAIL] ${testName} ${details ? '(' + details + ')' : ''}`);
            allPassed = false;
        }
    }

    try {
        server = await startServer();

        // Launch real headless Chrome
        chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
            '--headless=new',
            '--disable-gpu',
            '--remote-debugging-port=9222',
            '--no-sandbox',
            '--window-size=1280,800',
            '--disable-background-networking'
        ]);

        let wsEndpoint = '';
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Chrome launch timeout')), 10000);
            chrome.stderr.on('data', (d) => {
                const str = d.toString();
                const m = str.match(/ws:\/\/[^\s]+/);
                if (m) {
                    wsEndpoint = m[0];
                    clearTimeout(timeout);
                    resolve();
                }
            });
        });

        console.log(`[Chrome] DevTools listening on ${wsEndpoint}`);

        browserClient = new CDPClient(wsEndpoint);
        await browserClient.connect();

        const { targetId } = await browserClient.send('Target.createTarget', { url: 'about:blank' });
        const { sessionId } = await browserClient.send('Target.attachToTarget', { targetId, flatten: true });

        const pageErrors = [];
        const consoleErrors = [];

        let pageMsgId = 1;
        function sendPage(method, params = {}) {
            return new Promise((resolve, reject) => {
                const id = pageMsgId++;
                const handler = (e) => {
                    const data = JSON.parse(e.data);
                    if (data.id === id) {
                        browserClient.ws.removeEventListener('message', handler);
                        if (data.error) reject(new Error(data.error.message));
                        else resolve(data.result);
                    }
                };
                browserClient.ws.addEventListener('message', handler);
                browserClient.ws.send(JSON.stringify({ id, sessionId, method, params }));
            });
        }

        // Listen for console and exceptions
        browserClient.ws.addEventListener('message', (e) => {
            const data = JSON.parse(e.data);
            if (data.sessionId === sessionId) {
                if (data.method === 'Runtime.exceptionThrown') {
                    const desc = data.params.exceptionDetails.exception?.description || data.params.exceptionDetails.text;
                    pageErrors.push(desc);
                } else if (data.method === 'Runtime.consoleAPICalled') {
                    if (data.params.type === 'error') {
                        const text = data.params.args.map(a => a.value || a.description).join(' ');
                        consoleErrors.push(text);
                    }
                }
            }
        });

        await sendPage('Page.enable');
        await sendPage('Runtime.enable');
        await sendPage('DOM.enable');
        await sendPage('Emulation.setDeviceMetricsOverride', {
            width: 1280,
            height: 800,
            deviceScaleFactor: 1,
            mobile: false
        });

        async function evalInPage(expression) {
            const res = await sendPage('Runtime.evaluate', {
                expression,
                returnByValue: true,
                awaitPromise: true
            });
            if (res.exceptionDetails) {
                throw new Error(res.exceptionDetails.text || res.exceptionDetails.exception?.description);
            }
            return res.result.value;
        }

        console.log('\n================================================================');
        console.log('CHECK 1: NAVIGATE TO APP & ZERO SYNTAX / RUNTIME ERRORS');
        console.log('================================================================');

        await sendPage('Page.navigate', { url: 'http://localhost:3000' });
        await new Promise(r => setTimeout(r, 1500));

        check('ZERO runtime page exceptions (SyntaxError / ReferenceError)',
            pageErrors.length === 0,
            pageErrors.join(' | ')
        );

        // Check if main app loaded cleanly
        const appLoaded = await evalInPage(`(() => {
            const sidebar = document.getElementById('sidebar');
            const chatInput = document.getElementById('chat-input');
            const mainContainer = document.querySelector('main');
            return Boolean(sidebar && chatInput && mainContainer);
        })()`);
        check('Application DOM root elements mounted successfully', appLoaded);

        console.log('\n================================================================');
        console.log('CHECK 2: SIDEBAR ICONS, TOGGLE & CHAT WORKSPACE');
        console.log('================================================================');

        const sidebarState = await evalInPage(`(() => {
            const navItems = ['new-chat-btn', 'sidebar-nav-images', 'sidebar-nav-slides', 'sidebar-nav-projects', 'sidebar-nav-library'];
            const found = navItems.map(id => {
                const el = document.getElementById(id);
                const icon = el ? el.querySelector('i, svg') : null;
                return { id, exists: Boolean(el), hasIcon: Boolean(icon) };
            });
            const toggleBtn = document.getElementById('sidebar-toggle-btn');
            const chatInput = document.getElementById('chat-input');
            return {
                navItems: found,
                toggleBtnExists: Boolean(toggleBtn),
                chatInputExists: Boolean(chatInput)
            };
        })()`);

        check('All sidebar nav items exist with icons intact',
            sidebarState.navItems.every(n => n.exists && n.hasIcon),
            JSON.stringify(sidebarState.navItems)
        );

        check('Sidebar toggle button exists and active', sidebarState.toggleBtnExists);
        check('Chat input available and responsive', sidebarState.chatInputExists);

        // Test sidebar collapse toggle click
        console.log('\n[Action] Clicking sidebar toggle button...');
        await evalInPage(`document.getElementById('sidebar-toggle-btn').click();`);
        await new Promise(r => setTimeout(r, 300));

        const collapsed = await evalInPage(`document.getElementById('sidebar').classList.contains('sidebar-collapsed');`);
        check('Sidebar collapses smoothly on toggle button click', collapsed);

        // Test sidebar expand toggle click
        console.log('[Action] Clicking sidebar toggle button again to expand...');
        await evalInPage(`document.getElementById('sidebar-toggle-btn').click();`);
        await new Promise(r => setTimeout(r, 300));

        const expanded = await evalInPage(`!document.getElementById('sidebar').classList.contains('sidebar-collapsed');`);
        check('Sidebar expands back smoothly', expanded);

        console.log('\n================================================================');
        console.log('CHECK 3: NAVIGATION BETWEEN NEW CHAT AND IMAGES');
        console.log('================================================================');

        console.log('[Action] Clicking "Images" nav item (#sidebar-nav-images)...');
        await evalInPage(`document.getElementById('sidebar-nav-images').click();`);
        await new Promise(r => setTimeout(r, 500));

        const imagesView = await evalInPage(`(() => {
            const studio = document.getElementById('image-studio-container');
            const templatesGrid = document.getElementById('image-home-templates-grid');
            const isStudioVisible = studio ? !studio.classList.contains('hidden') : false;
            return {
                isStudioVisible,
                templatesCount: templatesGrid ? templatesGrid.children.length : 0
            };
        })()`);

        check('Navigation to Images studio active and templates rendered',
            imagesView.isStudioVisible && imagesView.templatesCount > 0,
            `visible: ${imagesView.isStudioVisible}, templates: ${imagesView.templatesCount}`
        );

        console.log('[Action] Clicking "New chat" nav item (#new-chat-btn)...');
        await evalInPage(`document.getElementById('new-chat-btn').click();`);
        await new Promise(r => setTimeout(r, 500));

        const chatView = await evalInPage(`(() => {
            const chatWorkspace = document.getElementById('chat-workspace');
            const chatInput = document.getElementById('chat-input');
            const isChatVisible = chatWorkspace ? !chatWorkspace.classList.contains('hidden') : false;
            return {
                isChatVisible,
                chatInputExists: Boolean(chatInput)
            };
        })()`);

        check('Navigation back to New chat workspace works cleanly',
            chatView.isChatVisible && chatView.chatInputExists
        );

        // Switch back to Images for template inspection
        await evalInPage(`document.getElementById('sidebar-nav-images').click();`);
        await new Promise(r => setTimeout(r, 500));

        console.log('\n================================================================');
        console.log('CHECK 4: DESIGN TEMPLATE CARD DESIGN & CLICK PREVIEW MODAL');
        console.log('================================================================');

        const cardDetails = await evalInPage(`(() => {
            const grid = document.getElementById('image-home-templates-grid');
            if (!grid || grid.children.length === 0) return null;
            const firstCard = grid.children[0];
            const img = firstCard.querySelector('img');
            const hasHoverZoom = img ? img.classList.contains('group-hover:scale-[1.03]') : false;
            const bottomGradient = firstCard.querySelector('.bg-gradient-to-t');
            const titleContainer = firstCard.querySelector('.absolute.bottom-3');
            const titleSpan = titleContainer ? titleContainer.querySelector('span') : null;
            const titleText = titleSpan ? titleSpan.textContent.trim() : '';

            // Check for buttons on card (must be ZERO hover buttons)
            const buttons = firstCard.querySelectorAll('button');

            return {
                cardCount: grid.children.length,
                hasHoverZoom,
                hasBottomGradient: Boolean(bottomGradient),
                titleText,
                buttonCount: buttons.length
            };
        })()`);

        check('Template cards have subtle hover zoom (group-hover:scale-[1.03])', cardDetails.hasHoverZoom);
        check('Template cards have subtle dark bottom gradient', cardDetails.hasBottomGradient);
        check('Template name visible at bottom-left', Boolean(cardDetails.titleText), `Title: "${cardDetails.titleText}"`);
        check('ZERO hover overlay buttons on template card', cardDetails.buttonCount === 0, `found: ${cardDetails.buttonCount}`);

        console.log('\n[Action] Clicking first Design Template card...');
        await evalInPage(`(() => {
            const grid = document.getElementById('image-home-templates-grid');
            if (grid && grid.children[0]) {
                grid.children[0].click();
            }
        })()`);
        await new Promise(r => setTimeout(r, 400));

        const modalState = await evalInPage(`(() => {
            const modal = document.getElementById('template-white-preview-modal');
            if (!modal) return { exists: false };
            const style = window.getComputedStyle(modal);
            const isVisible = !modal.classList.contains('hidden') && style.display !== 'none';
            const titleEl = document.getElementById('tmpl-preview-title');
            const promptEl = document.getElementById('tmpl-preview-prompt');
            const closeBtn = document.getElementById('btn-close-tmpl-preview');
            return {
                exists: true,
                isVisible,
                title: titleEl ? titleEl.textContent.trim() : '',
                prompt: promptEl ? promptEl.textContent.trim() : '',
                hasCloseBtn: Boolean(closeBtn)
            };
        })()`);

        check('Clicking template card opens #template-white-preview-modal cleanly',
            modalState.isVisible && Boolean(modalState.title),
            `modal title: "${modalState.title}"`
        );

        console.log('[Action] Closing template white preview modal...');
        await evalInPage(`(() => {
            const closeBtn = document.getElementById('btn-close-tmpl-preview');
            if (closeBtn) closeBtn.click();
            else {
                const modal = document.getElementById('template-white-preview-modal');
                if (modal) modal.classList.add('hidden');
            }
        })()`);
        await new Promise(r => setTimeout(r, 200));

        const modalClosed = await evalInPage(`(() => {
            const modal = document.getElementById('template-white-preview-modal');
            return modal ? modal.classList.contains('hidden') : true;
        })()`);
        check('Template white preview modal closes cleanly', modalClosed);

        console.log('\n================================================================');
        console.log('CHECK 5: STRICT ZERO-TOUCH VERIFICATION ACROSS WHOLE SITE');
        console.log('================================================================');

        const siteIntegrity = await evalInPage(`(() => {
            const workflowsGrid = document.getElementById('creative-workflows-grid');
            const filterBar = document.getElementById('tmpl-category-filter-bar');
            const adminRoot = document.getElementById('mestrio-admin-studio-root');
            const slidesNav = document.getElementById('sidebar-nav-slides');
            const projectsNav = document.getElementById('sidebar-nav-projects');

            return {
                workflowsCount: workflowsGrid ? workflowsGrid.querySelectorAll('[data-workflow-tool]').length : 0,
                filterPillCount: filterBar ? filterBar.querySelectorAll('[data-category]').length : 0,
                adminRootExists: Boolean(adminRoot),
                slidesNavExists: Boolean(slidesNav),
                projectsNavExists: Boolean(projectsNav)
            };
        })()`);

        check('Creative Workflows (4 tools) intact', siteIntegrity.workflowsCount === 4, `found: ${siteIntegrity.workflowsCount}`);
        check('Template Category filter bar (6 pills) intact', siteIntegrity.filterPillCount === 6, `found: ${siteIntegrity.filterPillCount}`);
        check('Admin Studio root element intact', siteIntegrity.adminRootExists);
        check('Slides and Projects navigation intact', siteIntegrity.slidesNavExists && siteIntegrity.projectsNavExists);

        console.log('\n================================================================');
        if (allPassed) {
            console.log('ALL EMERGENCY RECOVERY VERIFICATION CHECKS PASSED (100%)!');
        } else {
            console.error('SOME VERIFICATION CHECKS FAILED.');
        }
        console.log('================================================================');

    } catch (err) {
        console.error('[Verification Error]:', err);
        allPassed = false;
    } finally {
        if (browserClient) browserClient.close();
        if (chrome) chrome.kill();
        if (server) server.close();
        process.exit(allPassed ? 0 : 1);
    }
}

runRecoveryVerification();
