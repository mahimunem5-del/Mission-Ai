const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/') reqUrl = '/index.html';

    let filePath = path.join(rootDir, reqUrl);
    if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    try {
        const content = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    } catch (e) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(e.message);
    }
});

server.listen(0, '127.0.0.1', async () => {
    const port = server.address().port;
    console.log(`Live HTTP server listening on http://127.0.0.1:${port}`);

    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

    const testViewport = (width, height, name, extraUrl = '') => {
        const screenshotPath = path.join(rootDir, 'scratch', `${name}.png`);
        const url = `http://127.0.0.1:${port}/${extraUrl}`;
        console.log(`Capturing ${width}x${height} -> ${screenshotPath}...`);

        try {
            execSync(`"${chromePath}" --headless=new --disable-gpu --window-size=${width},${height} --screenshot="${screenshotPath}" "${url}"`, {
                timeout: 25000
            });
            const stats = fs.statSync(screenshotPath);
            console.log(`[OK] Screenshot captured: ${name}.png (${stats.size} bytes)`);
        } catch (err) {
            console.error(`Error capturing screenshot ${name}:`, err.message);
        }
    };

    // 1. Mobile 360x800 Image Workspace
    testViewport(360, 800, 'mobile_images_360x800', '?workspace=image-studio');

    // 2. Mobile 412x915 Image Workspace
    testViewport(412, 915, 'mobile_images_412x915', '?workspace=image-studio');

    // 3. Desktop 1440x900 Image Workspace
    testViewport(1440, 900, 'desktop_images_1440x900', '?workspace=image-studio');

    server.close(() => {
        console.log('Test server closed.');
    });
});
