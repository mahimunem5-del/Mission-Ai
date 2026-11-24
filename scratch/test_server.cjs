const { spawn } = require('child_process');
const http = require('http');

console.log('Starting serve process...');
const srv = spawn('npx', ['serve', '-c', 'serve.json', '.', '-p', '3000'], { stdio: 'pipe', shell: true });

srv.stdout.on('data', d => console.log('serve out:', d.toString().trim()));
srv.stderr.on('data', d => console.error('serve err:', d.toString().trim()));

function probe(retries = 15) {
    if (retries <= 0) {
        console.error('Server probe timed out');
        srv.kill();
        process.exit(1);
    }

    setTimeout(() => {
        const req = http.get('http://localhost:3000', res => {
            console.log(`Server responded with HTTP ${res.statusCode}`);
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                console.log(`Response length: ${body.length} bytes`);
                const hasMobileComposer = body.includes('id="mobile-image-composer-shell"');
                const hasMobileMultiSelect = body.includes('id="mobile-result-multiselect-bar"');
                const hasMobileTmplModal = body.includes('id="mobile-tmpl-card-container"');
                console.log('Mobile Composer in served HTML:', hasMobileComposer);
                console.log('Mobile MultiSelect in served HTML:', hasMobileMultiSelect);
                console.log('Mobile Template Modal in served HTML:', hasMobileTmplModal);
                srv.kill();
                process.exit(0);
            });
        });
        req.on('error', () => {
            console.log('Waiting for server...');
            probe(retries - 1);
        });
    }, 600);
}

probe();
