const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const s = html.indexOf('id="studio-precise-edit-ref-dropzone"');
console.log(html.substring(s, s + 500));
