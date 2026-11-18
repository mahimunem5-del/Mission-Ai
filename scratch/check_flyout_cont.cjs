const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const s = html.indexOf('function renderWorkflowFlyoutList');
console.log(html.substring(s + 1400, s + 2800));
