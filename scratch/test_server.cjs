const http = require('http');
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
});

server.listen(3002, () => {
    http.get('http://localhost:3002', (res) => {
        console.log(`Server responded with status code: ${res.statusCode}`);
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`Received ${data.length} bytes from server.`);
            console.log(`Contains #image-home-templates-grid: ${data.includes('id="image-home-templates-grid"')}`);
            console.log(`Contains #mestrio-admin-studio-root: ${data.includes('id="mestrio-admin-studio-root"')}`);
            console.log(`Contains #template-white-preview-modal: ${data.includes('id="template-white-preview-modal"')}`);
            server.close(() => process.exit(0));
        });
    }).on('error', (e) => {
        console.error('Request failed:', e);
        server.close(() => process.exit(1));
    });
});
