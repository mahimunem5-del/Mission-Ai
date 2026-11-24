const { execFile } = require('child_process');

execFile('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-software-rasterizer',
  '--dump-dom',
  'about:blank'
], (err, stdout, stderr) => {
  if (err) {
    console.error('execFile error:', err);
    console.error('stderr:', stderr);
    return;
  }
  console.log('SUCCESS! Chrome headless ran with --no-sandbox! Output length:', stdout.length);
  console.log('Output preview:', stdout.trim());
});
