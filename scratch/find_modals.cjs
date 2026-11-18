const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const markers = ['<!-- Modal', 'id="studio-template-modal"', 'id="ideogram-delete-confirm-modal"'];
for (const m of markers) {
    const idx = content.indexOf(m);
    console.log(m, 'idx:', idx);
    if (idx !== -1) {
        console.log(content.slice(idx, idx + 200));
        console.log('---');
    }
}
