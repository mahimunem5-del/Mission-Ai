const fs = require('fs');

let indexHtml = fs.readFileSync('index.html', 'utf8');
const snippet = fs.readFileSync('scratch/new_mobile_workspace_snippet.html', 'utf8');

const startMarker = '    <!-- ============================================================ -->\r\n    <!-- DEDICATED MOBILE INNER WORKSPACE';
const startMarkerLf = '    <!-- ============================================================ -->\n    <!-- DEDICATED MOBILE INNER WORKSPACE';
const endMarker = '<!-- Secret Template Admin Studio (100% Invisible to Public Users) -->';

const startIndex = indexHtml.indexOf(startMarker) !== -1 ? indexHtml.indexOf(startMarker) : indexHtml.indexOf(startMarkerLf);
const endIndex = indexHtml.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error('✗ Snippet markers not found! start:', startIndex, 'end:', endIndex);
    process.exit(1);
}

console.log('Replacing mobile workspace snippet from index', startIndex, 'to', endIndex);
indexHtml = indexHtml.substring(0, startIndex) + snippet + '\n\n    ' + indexHtml.substring(endIndex);

fs.writeFileSync('index.html', indexHtml, 'utf8');
console.log('✓ Successfully spliced snippet into index.html, final length:', indexHtml.length);
