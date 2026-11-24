const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('function openMobileTemplateCardModal');
console.log('openMobileTemplateCardModal index:', idx);
if (idx !== -1) {
    console.log(html.substring(idx, idx + 1000));
}
