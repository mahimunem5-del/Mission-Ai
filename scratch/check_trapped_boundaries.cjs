const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const markerBefore = '<div>${bodyHtml}</div>';
const markerAfter = '</body>\n</html>`;\n                const blob = new Blob';

const idxStart = html.indexOf(markerBefore);
const idxEnd = html.indexOf(markerAfter, idxStart);

console.log('idxStart:', idxStart);
console.log('idxEnd:', idxEnd);

const trapped = html.slice(idxStart + markerBefore.length, idxEnd);
console.log('trapped length:', trapped.length);
console.log('trapped starts with:', JSON.stringify(trapped.slice(0, 80)));
console.log('trapped ends with:', JSON.stringify(trapped.slice(-80)));
