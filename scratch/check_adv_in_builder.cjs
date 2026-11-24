const fs = require('fs');
const content = fs.readFileSync('scratch/build_mobile_workspace.cjs', 'utf8');

console.log('Builder size:', content.length);

const advIdx = content.indexOf('Collapsible Advanced Settings (Seed)');
console.log('advIdx:', advIdx);
console.log(content.substring(advIdx - 50, advIdx + 600));
