const fs = require('fs');
const { execSync } = require('child_process');

const html = fs.readFileSync('index.html', 'utf8');
const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  count++;
  const attrs = match[1];
  const code = match[2];
  const startIndex = match.index;
  const lineNum = html.substring(0, startIndex).split('\n').length;
  if (/src\s*=/i.test(attrs)) {
    console.log(`Script ${count} (line ${lineNum}): external (src), skipped`);
    continue;
  }
  if (!code.trim()) continue;

  const filename = `scratch/script_${count}.cjs`;
  fs.writeFileSync(filename, code);
  try {
    execSync(`node --check "${filename}"`, { stdio: 'pipe' });
    console.log(`Script ${count} (line ${lineNum}): OK`);
  } catch (err) {
    console.error(`Script ${count} (line ${lineNum}) ERROR:\n${err.stderr ? err.stderr.toString() : err.message}`);
  }
}
