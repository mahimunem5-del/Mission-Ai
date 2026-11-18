const fs = require('fs');
const dump = fs.readFileSync('scratch/controls_dump.txt', 'utf8');

// Let's inspect the 4 workspace sections in dump
console.log('Examining all 4 workspaces...');
