const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const oldCode = `            targetEl.addEventListener('mousedown', onPointerDown);
            window.addEventListener('mousemove', (e) => {
                if (startY) onPointerMove(e);
            });
            window.addEventListener('mouseup', onPointerUp);`;

const newCode = `            targetEl.addEventListener('mousedown', onPointerDown);
            if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
                window.addEventListener('mousemove', (e) => {
                    if (startY) onPointerMove(e);
                });
                window.addEventListener('mouseup', onPointerUp);
            }`;

if (html.includes(oldCode)) {
    html = html.replace(oldCode, newCode);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log('Updated window.addEventListener in index.html');
} else {
    console.log('Target not found in index.html');
}

// Also update build_mobile_workspace.cjs
let builder = fs.readFileSync('scratch/build_mobile_workspace.cjs', 'utf8');
if (builder.includes(oldCode)) {
    builder = builder.replace(oldCode, newCode);
    fs.writeFileSync('scratch/build_mobile_workspace.cjs', builder, 'utf8');
    console.log('Updated window.addEventListener in build_mobile_workspace.cjs');
}
