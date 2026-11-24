const fs = require('fs');
const indexHtml = fs.readFileSync('index.html', 'utf8');

function findOccurrences(term) {
    let pos = 0;
    const matches = [];
    while (true) {
        const idx = indexHtml.indexOf(term, pos);
        if (idx === -1) break;
        matches.push(idx);
        pos = idx + term.length;
    }
    return matches;
}

console.log('mobile-card-generate:', findOccurrences('mobile-card-generate'));
console.log('mobile-workspace-result-feed:', findOccurrences('mobile-workspace-result-feed'));
console.log('renderMobileWorkspaceFeed:', findOccurrences('renderMobileWorkspaceFeed'));
console.log('openMobileFeedPreviewModal:', findOccurrences('openMobileFeedPreviewModal'));
console.log('openMobileWorkspaceDrawer:', findOccurrences('openMobileWorkspaceDrawer'));
