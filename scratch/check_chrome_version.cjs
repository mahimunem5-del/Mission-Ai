const { execSync } = require('child_process');
try {
  const out = execSync('"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --version', { stdio: 'pipe' });
  console.log('Chrome version:', out.toString());
} catch (e) {
  console.log('Error:', e.message);
  if (e.stderr) console.log('Stderr:', e.stderr.toString());
  if (e.stdout) console.log('Stdout:', e.stdout.toString());
}
