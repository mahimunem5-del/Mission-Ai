const { spawn } = require('child_process');

async function testCDP() {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--disable-gpu',
        '--remote-debugging-port=9222',
        '--no-sandbox',
        '--disable-background-networking'
    ]);

    let wsEndpoint = '';
    await new Promise((resolve) => {
        chrome.stderr.on('data', (d) => {
            const str = d.toString();
            const m = str.match(/ws:\/\/[^\s]+/);
            if (m) {
                wsEndpoint = m[0];
                resolve();
            }
        });
    });

    console.log('Connecting to wsEndpoint:', wsEndpoint);
    const ws = new WebSocket(wsEndpoint);
    await new Promise(r => ws.onopen = r);
    console.log('WebSocket connected successfully!');

    let msgId = 1;
    function send(method, params = {}) {
        return new Promise((resolve) => {
            const id = msgId++;
            const handler = (e) => {
                const res = JSON.parse(e.data);
                if (res.id === id) {
                    ws.removeEventListener('message', handler);
                    resolve(res.result);
                }
            };
            ws.addEventListener('message', handler);
            ws.send(JSON.stringify({ id, method, params }));
        });
    }

    const version = await send('Browser.getVersion');
    console.log('Browser version:', version.product);

    ws.close();
    chrome.kill();
}

testCDP().catch(err => console.error(err));
