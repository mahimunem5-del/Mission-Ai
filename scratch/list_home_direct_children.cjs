const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idxHomeView = html.indexOf('id="image-home-view"');
const afterOpenTag = html.indexOf('>', idxHomeView) + 1;
// Grab next 3000 chars after #image-home-view
console.log(html.substring(afterOpenTag, afterOpenTag + 4000));
