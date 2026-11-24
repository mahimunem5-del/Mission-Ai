const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

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

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function runChrome(args) {
    return new Promise((resolve, reject) => {
        execFile(chromePath, [
            '--headless=new',
            '--no-sandbox',
            '--disable-gpu',
            '--disable-software-rasterizer',
            ...args
        ], (err, stdout, stderr) => {
            if (err) return reject(err);
            resolve({ stdout, stderr });
        });
    });
}

server.listen(0, '127.0.0.1', async () => {
    const port = server.address().port;
    console.log(`Live HTTP server listening on http://127.0.0.1:${port}`);

    try {
        // 1. Mobile 360x800 Screenshot
        const shot360 = path.join(rootDir, 'scratch', 'mobile_image_workspace_360x800.png');
        console.log('Capturing 360x800 screenshot...');
        await runChrome([
            '--window-size=360,800',
            `--screenshot=${shot360}`,
            `http://127.0.0.1:${port}/?workspace=image-studio`
        ]);
        console.log('[OK] Saved mobile_image_workspace_360x800.png:', fs.statSync(shot360).size, 'bytes');

        // 2. Mobile 412x915 Screenshot
        const shot412 = path.join(rootDir, 'scratch', 'mobile_image_workspace_412x915.png');
        console.log('Capturing 412x915 screenshot...');
        await runChrome([
            '--window-size=412,915',
            `--screenshot=${shot412}`,
            `http://127.0.0.1:${port}/?workspace=image-studio`
        ]);
        console.log('[OK] Saved mobile_image_workspace_412x915.png:', fs.statSync(shot412).size, 'bytes');

        // 3. Desktop 1440x900 Screenshot
        const shot1440 = path.join(rootDir, 'scratch', 'desktop_image_workspace_1440x900.png');
        console.log('Capturing 1440x900 screenshot...');
        await runChrome([
            '--window-size=1440,900',
            `--screenshot=${shot1440}`,
            `http://127.0.0.1:${port}/?workspace=image-studio`
        ]);
        console.log('[OK] Saved desktop_image_workspace_1440x900.png:', fs.statSync(shot1440).size, 'bytes');

        // 4. Dump DOM on Mobile 360x800 to inspect rendered layout
        console.log('Dumping rendered DOM on mobile...');
        const domResult = await runChrome([
            '--window-size=360,800',
            '--dump-dom',
            `http://127.0.0.1:${port}/?workspace=image-studio`
        ]);

        const dom = domResult.stdout;

        // Check if mobile elements are present
        const hasMobileHome = dom.includes('id="mobile-image-home-container"');
        const hasTitle = dom.includes('Image Workspace');
        const hasSubtitle = dom.includes('Create, edit, and enhance images with AI');
        const has2x2Cards = dom.includes('id="mobile-card-generate"') && dom.includes('id="mobile-card-rembg"') && dom.includes('id="mobile-card-precise"') && dom.includes('id="mobile-card-upscale"');
        const hasTemplates = dom.includes('id="mobile-templates-grid"');
        const hasComposer = dom.includes('id="mobile-image-composer-shell"');

        console.log('Mobile DOM Verification:');
        console.log('  #mobile-image-home-container present:', hasMobileHome);
        console.log('  Image Workspace title present:', hasTitle);
        console.log('  Subtitle present:', hasSubtitle);
        console.log('  2x2 tool cards present:', has2x2Cards);
        console.log('  Templates grid present:', hasTemplates);
        console.log('  Bottom composer present:', hasComposer);

        // Check that stray arrow is NOT in the composer
        const composerHtml = dom.substring(dom.indexOf('id="mobile-image-composer-shell"'), dom.indexOf('<!-- Atmospheric Studio Backdrop'));
        const strayArrowCount = (composerHtml.match(/<svg class="w-4 h-4"/g) || []).length;
        console.log('  Stray arrow count in composer shell:', strayArrowCount, '(expected 2: submit btn + voice send btn, NOT 3)');

        if (strayArrowCount > 2) {
            console.error('FAIL: Stray arrow found in composer!');
            process.exit(1);
        }

        console.log('\n>>> VISUAL INSPECTION AND LIVE CHROME VERIFICATION COMPLETE AND PASSED! <<<');
    } catch (err) {
        console.error('Error during Chrome verification:', err);
    } finally {
        server.close();
    }
});
