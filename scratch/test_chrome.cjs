const { spawn } = require('child_process');
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--no-sandbox'
]);

chrome.stdout.on('data', d => console.log('stdout:', d.toString()));
chrome.stderr.on('data', d => console.log('stderr:', d.toString()));

setTimeout(() => {
    console.log('PID:', chrome.pid);
    chrome.kill();
}, 2000);
