const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

console.log('Searching for dropdowns:');
lines.forEach((line, idx) => {
    if (line.includes('popover') || line.includes('dropdown') || line.includes('menu')) {
        if (line.includes('ratio') || line.includes('model') || line.includes('variation') || line.includes('quality')) {
            console.log((idx + 1) + ': ' + line.trim().substring(0, 120));
        }
    }
});
