const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('id="mobile-multiselect-bar"');
console.log('mobile-multiselect-bar index:', idx);
if (idx !== -1) {
    console.log(html.substring(idx - 100, idx + 1000));
}
