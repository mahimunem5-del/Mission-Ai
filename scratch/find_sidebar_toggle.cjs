const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

function searchMatches(pattern) {
    console.log(`=== Matches for ${pattern} ===`);
    let idx = 0;
    while ((idx = content.indexOf(pattern, idx)) !== -1) {
        console.log(`At index ${idx}:`);
        console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 200)));
        console.log('---');
        idx += pattern.length;
    }
}

searchMatches('sidebar-toggle-btn');
searchMatches('Toggle Sidebar');
searchMatches('toggleSidebar');
searchMatches('sidebar-collapsed');
