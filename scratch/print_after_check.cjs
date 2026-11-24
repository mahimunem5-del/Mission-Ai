const fs = require('fs');
const content = fs.readFileSync('scratch/build_mobile_workspace.cjs', 'utf8');

const sIdx = content.indexOf('mobile-model-auto-check');
console.log(content.substring(sIdx, sIdx + 400));
