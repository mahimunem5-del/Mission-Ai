const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

function findSnippet(query) {
    const idx = content.indexOf(query);
    console.log(`Query "${query}": index = ${idx}`);
    if (idx !== -1) {
        console.log('--- Context ---');
        console.log(content.slice(Math.max(0, idx - 150), Math.min(content.length, idx + 350)));
        console.log('---------------');
    }
}

findSnippet('studio-template-modal');
findSnippet('image-home-templates-grid');
findSnippet('executePreciseEdit');
findSnippet('initDesignTemplatesSection');
