const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const regex = /sidebar-toggle-btn/g;
let match;
while ((match = regex.exec(content)) !== null) {
    console.log(content.slice(Math.max(0, match.index - 50), Math.min(content.length, match.index + 150)));
    console.log('---');
}
