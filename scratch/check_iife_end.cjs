const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('function updateMobileMultiSelectBar');
const scriptClose = html.indexOf('})();', idx);
console.log(html.substring(scriptClose - 400, scriptClose + 10));
