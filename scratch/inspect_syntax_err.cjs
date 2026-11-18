const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const query = 'group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between';
let idx = 0;
while ((idx = content.indexOf(query, idx)) !== -1) {
    console.log(`Found at index ${idx}:`);
    console.log(content.slice(Math.max(0, idx - 200), Math.min(content.length, idx + 200)));
    console.log('----------------');
    idx += query.length;
}
