const fs = require('fs');
const content = fs.readFileSync('server/.env', 'utf8');
const lines = content.split('\n');
lines.forEach(l => {
    const trimmed = l.trim();
    if (trimmed && !trimmed.startsWith('#')) {
        const k = trimmed.split('=')[0].trim();
        console.log(k);
    }
});
