const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const start = html.indexOf('id="image-home-view"');
const end = html.indexOf('id="image-studio-workspace"', start);
const section = html.substring(start, end);

// Find top-level children
const lines = section.split('\n');
lines.forEach((line, idx) => {
    if (line.includes('id=') || line.includes('<!-- Atmospheric Studio Backdrop') || line.includes('<!-- Main Scrollable Content')) {
        console.log(`Line ${idx}: ${line.trim()}`);
    }
});
