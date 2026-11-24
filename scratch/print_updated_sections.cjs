const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

function printSnippet(startStr, endStr, label) {
    console.log(`\n=================== ${label} ===================`);
    const p1 = html.indexOf(startStr);
    const p2 = html.indexOf(endStr, p1);
    if (p1 === -1 || p2 === -1) {
        console.log('Not found:', { p1, p2 });
        return;
    }
    console.log(html.slice(p1, p2 + endStr.length));
}

printSnippet(
    '<!-- B. Multi-Select Floating Contextual Bar',
    '<!-- C. Scrollable Result Feed',
    '1. Multi-Select Bar'
);

printSnippet(
    '<!-- Centered Floating Rounded Card Container (Slim p-2.5',
    '<!-- Content Area: Title, Prompt Section, Action Buttons -->',
    '2. Template Modal'
);

printSnippet(
    '<!-- ChatGPT-Style Auto-Expanding Capsule / Card Shell -->',
    '<!-- Atmospheric Studio Backdrop:',
    '3. Prompt Composer'
);
