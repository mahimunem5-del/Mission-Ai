const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('function stopMobileImageVoice');
console.log('stopMobileImageVoice index:', idx);
if (idx !== -1) {
    console.log(html.substring(idx, idx + 800));
}
