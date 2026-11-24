const fs = require('fs');
const snippet = fs.readFileSync('scratch/new_mobile_workspace_snippet.html', 'utf8');
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
while ((match = scriptRegex.exec(snippet)) !== null) {
  count++;
  new Function(match[1]);
  console.log(`Script ${count} syntax verified! Length: ${match[1].length}`);
}
