const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const full = path.join(dir, file);
        const stat = fs.statSync(full);
        if (stat && stat.isDirectory()) {
            if (file !== 'node_modules') results = results.concat(walk(full));
        } else {
            results.push(full);
        }
    });
    return results;
}

const files = walk('server/src');
files.forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    if (content.includes('transcribe') || content.includes('whisper') || content.includes('audio') || content.includes('groq')) {
        console.log(`Match in ${f}:`);
        const lines = content.split('\n');
        lines.forEach((l, i) => {
            if (/transcribe|whisper|groq|audio/i.test(l)) {
                console.log(`  Line ${i + 1}: ${l.trim().slice(0, 100)}`);
            }
        });
    }
});
