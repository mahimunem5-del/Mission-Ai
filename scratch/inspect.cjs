const fs = require('fs');

const snippet = fs.readFileSync('scratch/mobile_workspace_snippet.html', 'utf8');

const idRegex = /id="([^"]+)"/g;
let m;
const ids = [];
while ((m = idRegex.exec(snippet)) !== null) {
    ids.push(m[1]);
}
console.log('DOM IDs defined (' + ids.length + '):\n', ids);

// Look for functions defined in the script
const fnRegex = /(?:function\s+([a-zA-Z0-9_$]+)|(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:function|\([^)]*\)\s*=>))/g;
const fns = [];
while ((m = fnRegex.exec(snippet)) !== null) {
    fns.push(m[1] || m[2]);
}
console.log('\nFunctions defined (' + fns.length + '):\n', fns);
