const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const regex = /function\s+renderMobileImageHomeTemplates\s*\([\s\S]*?\{/g;
let m;
while ((m = regex.exec(html)) !== null) {
    console.log('Found function at index', m.index);
    console.log(html.substring(m.index, m.index + 800));
}
