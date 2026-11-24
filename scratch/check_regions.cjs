const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const find = (label, pattern) => {
    const idx = html.indexOf(pattern);
    console.log(label + ' found at: ' + idx);
    if (idx !== -1) {
        console.log(html.substring(idx - 50, idx + 250));
        console.log('--------------------------------------------------');
    }
};

find('1. Sidebar Btn', 'mobile-image-sidebar-btn');
find('2. Tool Cards', 'mobile-card-generate');
find('3. Preview Modal', 'template-white-preview-modal');
find('4. Open Modal Fn', 'function openTemplateWhitePreviewModal');
find('5. Snippet Start', 'DEDICATED MOBILE INNER WORKSPACE');
find('6. Snippet End', 'Secret Template Admin Studio');
