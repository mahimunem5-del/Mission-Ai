const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const idx2 = content.indexOf('const toggleBtn = document.getElementById(\'sidebar-toggle-btn\');');
console.log('Enclosing function:');
console.log(content.slice(idx2 - 800, idx2));
