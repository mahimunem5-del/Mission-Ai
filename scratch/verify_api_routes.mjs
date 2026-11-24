import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('=== STEP 1: Clearing Port 5001 ===');
try {
    const out = execSync('netstat -ano | findstr ":5001"', { encoding: 'utf8' });
    const lines = out.trim().split('\n');
    for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && pid !== String(process.pid)) {
            try { execSync(`taskkill /F /PID ${pid}`); } catch (_) {}
        }
    }
} catch (_) {}

await new Promise(r => setTimeout(r, 800));

console.log('=== STEP 2: Booting Server on Port 5001 ===');
process.chdir(rootDir);
const { default: app } = await import('../server/src/index.js');

let server;
try {
    server = await new Promise((resolve, reject) => {
        const s = app.listen(5001, '0.0.0.0', () => {
            console.log('[Backend] Express actively listening on http://127.0.0.1:5001');
            resolve(s);
        });
        s.on('error', reject);
    });
} catch (e) {
    console.log('[Backend] Port 5001 already active from index.js boot.');
}

await new Promise(r => setTimeout(r, 1200));

console.log('=== STEP 3: Testing /api/health ===');
const healthRes = await fetch('http://127.0.0.1:5001/api/health');
const healthJson = await healthRes.json();
console.log('[Health Check]: Status', healthRes.status, healthJson);
if (healthRes.status !== 200 || healthJson.status !== 'ok') {
    console.error('FAIL: Health check failed!');
    process.exit(1);
}

console.log('=== STEP 4: Testing /api/chat/stream ===');
const chatRes = await fetch('http://127.0.0.1:5001/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        model: 'gemini-2.5-flash',
        messages: [{ role: 'user', content: 'Say "pong"' }]
    })
});
console.log('[Chat Stream]: Status', chatRes.status, 'Content-Type:', chatRes.headers.get('content-type'));
if (chatRes.status !== 200 || !chatRes.headers.get('content-type')?.includes('text/event-stream')) {
    console.error('FAIL: Chat stream failed!');
    process.exit(1);
}

// Read SSE chunks
const reader = chatRes.body.getReader();
const decoder = new TextDecoder();
let streamOutput = '';
let streamChunks = 0;
while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    streamChunks++;
    streamOutput += decoder.decode(value);
    if (streamChunks >= 3) {
        // Sampled enough tokens to confirm streaming is active
        reader.cancel();
        break;
    }
}
console.log(`[PASS] Chat stream received ${streamChunks} chunks. Sample output:`, streamOutput.slice(0, 150));

console.log('=== STEP 5: Testing /api/images/generate ===');
const imgRes = await fetch('http://127.0.0.1:5001/api/images/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        prompt: 'Minimalist geometric red dot on white background',
        model: 'openai/gpt-image-2.5-sunburst'
    })
});
const imgJson = await imgRes.json();
console.log('[Image Generation]: Status', imgRes.status, 'Success:', imgJson.success, 'Image count:', imgJson.images?.length);
if (imgRes.status !== 200 || !imgJson.success || !imgJson.images?.[0]?.url) {
    console.error('FAIL: Image generation failed!', imgJson);
    process.exit(1);
}
console.log('[PASS] Image generated successfully. URL prefix:', imgJson.images[0].url.slice(0, 50));

console.log('=== STEP 6: Testing /api/templates and /api/admin/templates ===');
const tmplRes = await fetch('http://127.0.0.1:5001/api/templates');
const tmplJson = await tmplRes.json();
console.log('[Templates Fetch]: Status', tmplRes.status, 'Success:', tmplJson.success);
if (tmplRes.status !== 200 || !tmplJson.success) {
    console.error('FAIL: Templates fetch failed!');
    process.exit(1);
}

console.log('=== STEP 7: Testing Supabase Isolated Template Publishing ===');
const pubRes = await fetch('http://127.0.0.1:5001/api/admin/templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        title: 'Route Verification Template ' + Date.now(),
        category: 'Portrait & Photo',
        prompt: 'Professional corporate headshot',
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    })
});
const pubJson = await pubRes.json();
console.log('[Template Publish]: Status', pubRes.status, 'Success:', pubJson.success, 'ID:', pubJson.template?.id);
if (pubRes.status !== 201 || !pubJson.success || !pubJson.template?.id) {
    console.error('FAIL: Template publish failed!', pubJson);
    process.exit(1);
}

// Clean up created template
await fetch(`http://127.0.0.1:5001/api/admin/templates/${encodeURIComponent(pubJson.template.id)}`, {
    method: 'DELETE'
});
console.log('[PASS] Cleaned up test template.');

console.log('\n=============================================================');
console.log('ALL ROUTES VERIFIED SUCCESSFULLY! BACKEND READY ON PORT 5001.');
console.log('=============================================================\n');

if (server) server.close();
process.exit(0);
