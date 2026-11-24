const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

console.log('--- Search for mic / speech in index.html ---');
const regex = /(?:SpeechRecognition|webkitSpeechRecognition|getUserMedia|transcribe|whisper)/gi;
let m;
const hits = new Set();
while ((m = regex.exec(html)) !== null) {
    const term = m[0];
    const preview = html.substring(Math.max(0, m.index - 50), Math.min(html.length, m.index + 120)).replace(/\s+/g, ' ');
    if (!hits.has(term)) {
        hits.add(term);
        console.log(`[${term}] at ${m.index}: ${preview}`);
    }
}
