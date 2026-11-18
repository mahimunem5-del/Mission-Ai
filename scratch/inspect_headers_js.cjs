const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const regexes = [
  /workspace-active-tool-label/g,
  /ideogram-header-edit-title/g,
  /ideogram-header-edit/g,
  /ideogram-header-generate/g,
  /workspace-tool-switcher-btn/g,
  /renderWorkspaceTools/g,
  /setImageStudioMode/g,
  /populateWorkflow/g
];

regexes.forEach(r => {
  let match;
  console.log(`=== Matches for ${r} ===`);
  while ((match = r.exec(html)) !== null) {
    const line = html.substring(0, match.index).split('\n').length;
    console.log(`Line ${line}: ${html.substring(Math.max(0, match.index - 50), Math.min(html.length, match.index + 80)).replace(/\n/g, ' ')}`);
  }
});
