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
                if (fs.existsSync(publicPath)) filePath = publicPath;
            }
            fs.readFile(filePath, (err, content) => {
                if (err) {
                    res.writeHead(404);
                    res.end('Not Found');
                    return;
                }
                const ext = path.extname(filePath).toLowerCase();
                res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/html' });
                res.end(content);
            });
        });
        server.listen(PORT, '127.0.0.1', () => resolve(server));
        server.on('error', reject);
    });
}

(async () => {
    let server = await startServer();
    let chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9222',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-extensions',
        'about:blank'
    ]);

    const wsEndpoint = await new Promise((resolve, reject) => {
        chrome.stderr.on('data', (d) => {
            const m = d.toString().match(/ws:\/\/127\.0\.0\.1:9222\/devtools\/browser\/[a-zA-Z0-9_-]+/);
            if (m) resolve(m[0]);
        });
    });

    const WebSocket = globalThis.WebSocket;
    const ws = new WebSocket(wsEndpoint);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    function send(s, method, params = {}) {
        return new Promise((res, rej) => {
            const curId = id++;
            const handler = (evt) => {
                const data = JSON.parse(evt.data);
                if (data.id === curId) {
                    s.removeEventListener('message', handler);
                    if (data.error) rej(data.error);
                    else res(data.result);
                }
            };
            s.addEventListener('message', handler);
            s.send(JSON.stringify({ id: curId, method, params }));
        });
    }

    const targets = await send(ws, 'Target.getTargets');
    const pageTarget = targets.targetInfos.find(t => t.type === 'page');
    const pageWs = new WebSocket(`ws://127.0.0.1:9222/devtools/page/${pageTarget.targetId}`);
    await new Promise(r => pageWs.onopen = r);

    await send(pageWs, 'Page.enable');
    await send(pageWs, 'Runtime.enable');
    await send(pageWs, 'Emulation.setDeviceMetricsOverride', {
        width: 360,
        height: 800,
        deviceScaleFactor: 2,
        mobile: true
    });

    await send(pageWs, 'Page.navigate', { url: `http://localhost:${PORT}/` });
    await new Promise(r => setTimeout(r, 2000));

    // Navigate to Image Studio
    await send(pageWs, 'Runtime.evaluate', {
        expression: `switchWorkspace('image-studio');`
    });
    await new Promise(r => setTimeout(r, 600));

    // Type prompt into mobile pill composer
    await send(pageWs, 'Runtime.evaluate', {
        expression: `
            const input = document.getElementById('mobile-image-prompt-input');
            input.value = 'Cinematic drone shot of Tokyo neon skyline at midnight';
            input.dispatchEvent(new Event('input', { bubbles: true }));
        `
    });
    await new Promise(r => setTimeout(r, 200));

    // Submit prompt
    await send(pageWs, 'Runtime.evaluate', {
        expression: `document.getElementById('mobile-image-submit-btn').click();`
    });
    await new Promise(r => setTimeout(r, 800));

    const checkSubmit = (await send(pageWs, 'Runtime.evaluate', {
        expression: `(() => {
            const studio = document.getElementById('image-studio-workspace');
            const studioPrompt = document.getElementById('studio-prompt-input');
            return {
                studioVisible: studio && window.getComputedStyle(studio).display !== 'none',
                studioPromptVal: studioPrompt ? studioPrompt.value : ''
            };
        })()`,
        returnByValue: true
    })).result.value;

    console.log('Submit result:', checkSubmit);

    // Capture screenshot of submission transitioning to studio workspace
    const shot = await send(pageWs, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/mobile_images_360x800_submitted.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved screenshot: scratch/mobile_images_360x800_submitted.png');

    pageWs.close();
    ws.close();
    chrome.kill();
    server.close();
})();
