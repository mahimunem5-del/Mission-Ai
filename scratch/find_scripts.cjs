const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');

let scriptStart = -1;
let scriptNum = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<script')) {
    scriptNum++;
    scriptStart = i + 1;
    console.log(`Script ${scriptNum} starts at line ${scriptStart}: ${lines[i].trim()}`);
  }
}
