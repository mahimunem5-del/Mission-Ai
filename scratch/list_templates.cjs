const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const regex = /BASE_DESIGN_TEMPLATES\s*=\s*\[([\s\S]*?)\];/;
let m = regex.exec(html);
if (m) {
    const list = eval('[' + m[1] + ']');
    console.log(`Found ${list.length} templates:`);
    list.forEach(t => console.log(`- ${t.id}: ${t.title} -> ${t.imageUrl}`));
}
