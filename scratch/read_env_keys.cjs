const fs = require('fs');
if (fs.existsSync('server/.env')) {
    const lines = fs.readFileSync('server/.env', 'utf8').split('\n');
    lines.forEach(l => {
        const parts = l.split('=');
        if (parts[0]) {
            console.log(parts[0].trim(), parts[1] ? (parts[1].trim() ? '[SET]' : '[EMPTY]') : '[EMPTY]');
        }
    });
} else {
    console.log('server/.env does not exist');
}
