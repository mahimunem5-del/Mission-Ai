const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const s = html.indexOf('<!-- 4. PROMPT COMPOSER -->');
console.log(html.substring(s, s + 1500));
