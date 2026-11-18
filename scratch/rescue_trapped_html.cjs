const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const markerBefore = '<div>${bodyHtml}</div>';
const markerAfter = '</body>\n</html>`;\n                const blob = new Blob';

const idxStart = html.indexOf(markerBefore);
const idxEnd = html.indexOf(markerAfter, idxStart);

if (idxStart === -1 || idxEnd === -1) {
    console.error('Could not find markers');
    process.exit(1);
}

const trappedHtml = html.slice(idxStart + markerBefore.length, idxEnd);
console.log('Extracted trapped HTML of length:', trappedHtml.length);

// 1. Remove trapped HTML from inside docHtml
html = html.slice(0, idxStart + markerBefore.length) + '\n' + html.slice(idxEnd);
console.log('Removed trapped HTML from inside docHtml');

// 2. Insert trappedHtml into actual DOM before the guaranteed route watcher
const insertionTarget = '    <!-- Guaranteed Self-Executing Admin Studio Route Watcher (Outside Main Script) -->';
const insertIdx = html.indexOf(insertionTarget);

if (insertIdx === -1) {
    console.error('Could not find insertionTarget');
    process.exit(1);
}

html = html.slice(0, insertIdx) + trappedHtml.trim() + '\n\n' + html.slice(insertIdx);
console.log('Inserted trapped HTML into actual document body');

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html successfully updated!');
