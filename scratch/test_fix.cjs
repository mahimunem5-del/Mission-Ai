const fs = require('fs');
const vm = require('vm');

let html = fs.readFileSync('index.html', 'utf8');

const broken = `                card.addEventListener('click', () => {
                    openTemplateWhitePreviewModal(tmpl, executePreciseEdit, executeGenerate);
                });
                    openTemplateWhitePreviewModal(tmpl, executePreciseEdit, executeGenerate);
                });`;

const fixed = `                card.addEventListener('click', () => {
                    openTemplateWhitePreviewModal(tmpl, executePreciseEdit, executeGenerate);
                });`;

console.log('Includes broken snippet:', html.includes(broken));
if (html.includes(broken)) {
    const testHtml = html.replace(broken, fixed);

    const scriptRegex = /<script\b(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    let count = 0;
    let hasError = false;
    while ((match = scriptRegex.exec(testHtml)) !== null) {
        count++;
        const scriptContent = match[1];
        const startIndex = match.index;
        const lineNumber = testHtml.substring(0, startIndex).split('\n').length;
        try {
            new vm.Script(scriptContent, { filename: `inline-script-${count}.js`, lineOffset: lineNumber - 1 });
            console.log(`Script #${count} (starts near line ${lineNumber}) is VALID.`);
        } catch (err) {
            hasError = true;
            console.error(`SYNTAX ERROR in script #${count} (starts near line ${lineNumber}):`);
            console.error(err.message);
        }
    }
    console.log('All scripts checked. Any error?', hasError);
}
