const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3000;
const rootDir = process.cwd();

async function debugAdmin() {
    const server = http.createServer((req, res) => {
        let reqPath = decodeURI(req.url.split('?')[0].split('#')[0]);
        if (reqPath === '/' || !path.extname(reqPath)) reqPath = '/index.html';
        const filePath = path.join(rootDir, reqPath);
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(404);
                res.end('Not found');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            }
        });
    });
    await new Promise(r => server.listen(PORT, '127.0.0.1', r));

    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--disable-gpu',
        '--remote-debugging-port=9222',
        '--no-sandbox',
        '--window-size=1280,800'
    ]);

    let wsEndpoint = '';
    await new Promise((resolve) => {
        chrome.stderr.on('data', (d) => {
            const m = d.toString().match(/ws:\/\/[^\s]+/);
            if (m) {
                wsEndpoint = m[0];
                resolve();
            }
        });
    });

    const ws = new WebSocket(wsEndpoint);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    function send(method, params = {}) {
        return new Promise((resolve) => {
            const msgId = id++;
            const handler = (e) => {
                const res = JSON.parse(e.data);
                if (res.id === msgId) {
                    ws.removeEventListener('message', handler);
                    resolve(res.result);
                }
            };
            ws.addEventListener('message', handler);
            ws.send(JSON.stringify({ id: msgId, method, params }));
        });
    }

    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

    function sendPage(method, params = {}) {
        return new Promise((resolve) => {
            const msgId = id++;
            const handler = (e) => {
                const res = JSON.parse(e.data);
                if (res.id === msgId) {
                    ws.removeEventListener('message', handler);
                    resolve(res.result);
                }
            };
            ws.addEventListener('message', handler);
            ws.send(JSON.stringify({ id: msgId, sessionId, method, params }));
        });
    }

    await sendPage('Page.enable');
    await sendPage('Runtime.enable');

    console.log('Navigating directly to http://localhost:3000/#/admin/templates...');
    await sendPage('Page.navigate', { url: 'http://localhost:3000/#/admin/templates' });
    await new Promise(r => setTimeout(r, 2000));

    const check = await sendPage('Runtime.evaluate', {
        expression: `(() => {
            return {
                title: document.title,
                bodyLength: document.body.innerHTML.length,
                allIdsSample: Array.from(document.querySelectorAll('[id]')).slice(0, 30).map(e => e.id),
                hasAdminRoot: Boolean(document.getElementById('mestrio-admin-studio-root')),
                adminElHtml: document.getElementById('mestrio-admin-studio-root')?.outerHTML?.slice(0, 100)
            };
        })()`,
        returnByValue: true
    });

    console.log('Check result:', check.result.value);

    chrome.kill();
    server.close();
}

debugAdmin().catch(console.error);
