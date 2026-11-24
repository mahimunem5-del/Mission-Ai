const fs = require('fs');
const s = fs.readFileSync('scratch/new_mobile_workspace_snippet.html', 'utf8');

const wsSheet = s.indexOf('id="mobile-workspace-sheet"');
console.log('workspace sheet header HTML:\n', s.substring(wsSheet + 600, wsSheet + 1200));
