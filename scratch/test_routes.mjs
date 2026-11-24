import http from 'http';

async function run() {
    process.chdir('server');
    const { default: app } = await import('../server/src/index.js');
    console.log('App loaded.');

    const server = app.listen(5098, '127.0.0.1', async () => {
        console.log('Test server listening on 5098.');
        try {
            const hRes = await fetch('http://127.0.0.1:5098/api/health');
            console.log('/api/health:', hRes.status);

            const cRes = await fetch('http://127.0.0.1:5098/api/chat/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'gemini-2.5-flash',
                    messages: [{ role: 'user', content: 'Hi' }]
                })
            });
            console.log('/api/chat/stream status:', cRes.status, cRes.headers.get('content-type'));

            const imgGenRes = await fetch('http://127.0.0.1:5098/api/images/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: 'test apple' })
            });
            console.log('/api/images/generate status:', imgGenRes.status, await imgGenRes.json());

            const genImgRes = await fetch('http://127.0.0.1:5098/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: 'test apple' })
            });
            console.log('/api/generate-image status:', genImgRes.status, await genImgRes.json());
        } catch (err) {
            console.error('Error during test:', err);
        } finally {
            server.close();
            process.exit(0);
        }
    });
}

run();
