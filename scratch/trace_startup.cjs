const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3000;
const rootDir = process.cwd();

function startServer() {
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            let reqPath = decodeURI(req.url.split('?')[0].split('#')[0]);
            if (reqPath === '/') reqPath = '/index.html';
            let filePath = path.join(rootDir, reqPath);
            if (!fs.existsSync(filePath)) filePath = path.join(rootDir, 'index.html');
            res.end(fs.readFileSync(filePath));
        });
        server.listen(PORT, '127.0.0.1', () => resolve(server));
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
    close() { if (this.ws) this.ws.close(); }
}

async function traceStartup() {
    let server = await startServer();
    let chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9222',
        '--disable-gpu',
        '--no-sandbox',
        'about:blank'
    ]);

    const wsEndpoint = await new Promise((resolve) => {
        chrome.stderr.on('data', (d) => {
            const m = d.toString().match(/ws:\/\/127\.0\.0\.1:9222\/devtools\/browser\/[a-zA-Z0-9_-]+/);
            if (m) resolve(m[0]);
        });
    });

    const browserClient = new CDPClient(wsEndpoint);
    await browserClient.connect();
    const targets = await browserClient.send('Target.getTargets');
    const pageTarget = targets.targetInfos.find(t => t.type === 'page');
    const client = new CDPClient(`ws://127.0.0.1:9222/devtools/page/${pageTarget.targetId}`);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');

    client.on('Runtime.consoleAPICalled', (params) => {
        console.log('[Console Log]:', params.args.map(a => a.value || a.description).join(' '));
    });

    // Add script on new document to spy on switchWorkspace and currentWorkspace
    await client.send('Page.addScriptToEvaluateOnNewDocument', {
        source: `
            window._workspaceChanges = [];
            let _cw = 'chat';
            Object.defineProperty(window, 'currentWorkspace', {
                get() { return _cw; },
                set(val) {
                    console.log('[SPY] currentWorkspace set to:', val, new Error().stack);
                    _cw = val;
                }
            });
        `
    });

    await client.send('Emulation.setDeviceMetricsOverride', {
        width: 1440,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false
    });

    await client.send('Page.navigate', { url: `http://localhost:${PORT}/` });
    await new Promise(r => setTimeout(r, 2000));

    client.close();
    browserClient.close();
    chrome.kill();
    server.close();
}

traceStartup();
