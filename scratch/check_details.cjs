const fs = require('fs');
const s = fs.readFileSync('scratch/new_mobile_workspace_snippet.html', 'utf8');

// Check Clear all
const clearMatches = [...s.matchAll(/Clear all/gi)];
console.log('Clear all occurrences:', clearMatches.length);
clearMatches.forEach(m => {
  console.log('Around Clear all:', s.substring(m.index - 50, m.index + 50));
});

// Check workspace header
const wsSheet = s.indexOf('id="mobile-workspace-sheet"');
console.log('wsSheet header:\n', s.substring(wsSheet, wsSheet + 800));

// Check swipe dismiss calls
const swipeMatches = [...s.matchAll(/attachSwipeDismiss/g)];
console.log('attachSwipeDismiss occurrences:', swipeMatches.length);
swipeMatches.forEach(m => {
  console.log('Around swipe:', s.substring(m.index - 100, m.index + 100));
});
