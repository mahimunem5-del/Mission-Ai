const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');
const snippet = fs.readFileSync('scratch/new_mobile_workspace_snippet.html', 'utf8');

// 1. Create backup
fs.writeFileSync('index.html.bak', indexHtml, 'utf8');
console.log('Created backup index.html.bak');

const startMarker = '    <!-- ============================================================ -->\r\n    <!-- DEDICATED MOBILE INNER WORKSPACE';
const startMarkerLf = '    <!-- ============================================================ -->\n    <!-- DEDICATED MOBILE INNER WORKSPACE';
const endMarker = '<!-- Secret Template Admin Studio (100% Invisible to Public Users) -->';

const startIndex = indexHtml.indexOf(startMarker) !== -1 ? indexHtml.indexOf(startMarker) : indexHtml.indexOf(startMarkerLf);
const endIndex = indexHtml.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error('Markers not found! start:', startIndex, 'end:', endIndex);
    process.exit(1);
}

console.log('Replacing from index', startIndex, 'to', endIndex);
console.log('Length of replaced region:', endIndex - startIndex);
console.log('Length of new snippet:', snippet.length);

const finalHtml = indexHtml.substring(0, startIndex) + snippet + '\n\n    ' + indexHtml.substring(endIndex);

fs.writeFileSync('index.html', finalHtml, 'utf8');
console.log('Successfully wrote updated index.html, new length:', finalHtml.length);
