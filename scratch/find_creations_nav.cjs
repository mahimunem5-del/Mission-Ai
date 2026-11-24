const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

lines.forEach((l, idx) => {
  if (l.includes("setMobileWorkspaceView('results')") || l.includes('mobile-workspace-result-feed') || l.includes('mobile-recent-creations')) {
    console.log(`${idx + 1}: ${l.trim().slice(0, 100)}`);
  }
});
