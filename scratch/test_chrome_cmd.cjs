const { execSync } = require('child_process');
try {
  const out = execSync('cmd /c "\\"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe\\" --headless=new --dump-dom about:blank"', { stdio: 'pipe' });
  console.log('Chrome output length:', out.length);
  console.log('Success! Chrome headless works.');
} catch (e) {
  console.log('Error:', e.message);
  if (e.stderr) console.log('Stderr:', e.stderr.toString());
  if (e.stdout) console.log('Stdout:', e.stdout.toString());
}
