const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const regex = /currentWorkspace\s*=/g;
let m;
while ((m = regex.exec(html)) !== null) {
  const line = html.substring(0, m.index).split('\n').length;
  console.log('line', line, html.substring(m.index - 50, m.index + 100).replace(/\n/g, ' '));
}
