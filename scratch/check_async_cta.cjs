const fs = require('fs');
const content = fs.readFileSync('scratch/build_mobile_workspace.cjs', 'utf8');

const pos = content.indexOf('handleMobileDrawerCtaClick');
console.log(content.substring(pos - 20, pos + 40));
