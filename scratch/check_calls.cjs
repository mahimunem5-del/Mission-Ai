const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

function findCalls(name) {
    console.log(`\n=== Finding "${name}" ===`);
    let idx = 0;
    while ((idx = content.indexOf(name, idx)) !== -1) {
        console.log(`Found at index ${idx}:`);
        console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 150)));
        console.log('---');
        idx += name.length;
    }
}

findCalls('initImageStudio');
findCalls('renderImageHomeTemplates');
findCalls('initDesignTemplatesSection');
findCalls('checkAdminStudioRoute');
