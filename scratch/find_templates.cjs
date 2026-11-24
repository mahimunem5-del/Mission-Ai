const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const regexes = [
  /template-preview/gi,
  /id=["'][^"']*template[^"']*["']/gi,
  /openTemplate/gi,
  /showTemplate/gi,
  /closeTemplate/gi,
  /setSelectedTemplate/gi,
  /Templates/gi,
  /Try with Photo/gi,
  /Use Prompt/gi
];

regexes.forEach(r => {
  let m;
  console.log('--- Matches for ' + r + ' ---');
  let count = 0;
  while ((m = r.exec(content)) !== null && count < 15) {
    count++;
    const line = content.slice(0, m.index).split('\n').length;
    console.log('Line ' + line + ': ' + m[0] + ' | Context: ' + content.slice(Math.max(0, m.index - 40), Math.min(content.length, m.index + 80)).replace(/\r?\n/g, ' '));
  }
});
