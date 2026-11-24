const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('function startMobileImageVoice');
console.log('startMobileImageVoice index:', idx);
if (idx !== -1) {
    console.log(html.substring(idx, idx + 800));
}
