const { execFile } = require('child_process');

execFile('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless=new', '--dump-dom', 'about:blank'], (err, stdout, stderr) => {
  if (err) {
    console.error('execFile error:', err);
    console.error('stderr:', stderr);
    return;
  }
  console.log('execFile success! Output length:', stdout.length);
  console.log('Output preview:', stdout.slice(0, 100));
});
