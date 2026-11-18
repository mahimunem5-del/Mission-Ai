const fs = require('fs');
let code = fs.readFileSync('scratch/browser_verify.cjs', 'utf8');
code = code.replace(
    "await sendPage('Page.navigate', { url: 'http://localhost:3000/#/admin/templates' });",
    "await sendPage('Page.navigate', { url: 'http://localhost:3000/?admin=templates' });"
);
fs.writeFileSync('scratch/browser_verify_query.cjs', code, 'utf8');
console.log('Created browser_verify_query.cjs');
