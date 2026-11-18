const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const sIdx = html.indexOf('id="studio-model-dropdown"');
const eIdx = html.indexOf('id="studio-prompt-input"');
const block = html.substring(sIdx, eIdx);
const lines = block.split('\n');
lines.forEach(l => {
    if (l.includes('Banana')) console.log(JSON.stringify(l));
});
