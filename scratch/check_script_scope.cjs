const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('function updateMobileMultiSelectBar');
// Find which script tag it belongs to
const scriptOpen = html.lastIndexOf('<script', idx);
console.log('Script tag opening:', html.substring(scriptOpen, scriptOpen + 50));
console.log('Is it inside an IIFE?');
console.log(html.substring(scriptOpen, scriptOpen + 200));
