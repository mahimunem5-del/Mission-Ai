const fs = require('fs');

const lines = fs.readFileSync('index.html', 'utf8').split('\n');
console.log('Total lines in index.html:', lines.length);

lines.forEach((line, idx) => {
  if (line.includes(':5001') || line.includes('localhost') || line.includes('127.0.0.1')) {
    console.log(`L${idx + 1}: ${line.trim()}`);
  }
});
