const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('mobile-multiselect-cancel-btn');
console.log('mobile-multiselect-cancel-btn index:', idx);
if (idx !== -1) {
    console.log(html.substring(idx - 400, idx + 600));
}
