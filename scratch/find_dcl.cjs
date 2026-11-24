const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const regex = /DOMContentLoaded/g;
let m;
while ((m = regex.exec(html)) !== null) {
  const line = html.substring(0, m.index).split('\n').length;
  console.log('DOMContentLoaded at line', line, html.substring(m.index, m.index + 200).replace(/\n/g, ' '));
}
