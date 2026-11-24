const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Add console.log with stack trace to setImageStudioMode
const target = `if (typeof currentWorkspace !== 'undefined' && currentWorkspace !== 'image-studio') {
                currentWorkspace = 'image-studio';`;

const replacement = `if (typeof currentWorkspace !== 'undefined' && currentWorkspace !== 'image-studio') {
                console.log('[DEBUG TRACE setImageStudioMode stack]:', new Error().stack);
                currentWorkspace = 'image-studio';`;

if (html.includes(target)) {
    html = html.replace(target, replacement);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log('[PASS] Added trace to setImageStudioMode');
} else {
    const crlfTarget = target.replace(/\r?\n/g, '\r\n');
    if (html.includes(crlfTarget)) {
        html = html.replace(crlfTarget, replacement.replace(/\r?\n/g, '\r\n'));
        fs.writeFileSync('index.html', html, 'utf8');
        console.log('[PASS] Added trace to setImageStudioMode (CRLF)');
    } else {
        console.error('Target not found!');
    }
}
