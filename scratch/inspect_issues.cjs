const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

console.log('--- 1. Buttons inside mobile-image-composer-shell ---');
const shellStart = html.indexOf('id="mobile-image-composer-shell"');
const shellEnd = html.indexOf('<!-- Mobile Image Voice Equalizer Capsule', shellStart);
const shellHtml = html.substring(shellStart, shellEnd);
const btns = shellHtml.match(/<button[\s\S]*?<\/button>/g) || [];
btns.forEach((b, i) => console.log(`[Button ${i}]`, b.replace(/\s+/g, ' ').slice(0, 150)));

console.log('\n--- 2. Elements with max-w-[760px] ---');
let pos = 0;
while ((pos = html.indexOf('max-w-[760px]', pos)) !== -1) {
    const start = Math.max(0, pos - 150);
    const end = Math.min(html.length, pos + 150);
    console.log(html.substring(start, end).replace(/\s+/g, ' '));
    pos += 13;
}

console.log('\n--- 3. Voice Recording functions ---');
['startMobileVoiceRecording', 'stopMobileVoiceRecording', 'toggleMobileVoiceRecording'].forEach(fn => {
    const idx = html.indexOf(fn);
    console.log(`${fn} index:`, idx);
    if (idx !== -1) {
        console.log(html.substring(idx - 20, idx + 100).replace(/\s+/g, ' '));
    }
});

console.log('\n--- 4. Template card markup & click handler ---');
const tmplGridIdx = html.indexOf('id="mobile-image-home-templates-grid"');
if (tmplGridIdx !== -1) {
    console.log(html.substring(tmplGridIdx, tmplGridIdx + 500).replace(/\s+/g, ' '));
}

console.log('\n--- 5. Creations view & updateCreationsActionBar ---');
['showMobileCreationsView', 'updateCreationsActionBar', 'mobile-creations-action-bar'].forEach(str => {
    const idx = html.indexOf(str);
    console.log(`${str} index:`, idx);
});
