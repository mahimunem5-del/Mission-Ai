const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const lines = content.split('\n');
console.log('=== renderMobileGenRefSlots (lines 40550-40600) ===');
for (let i = 40549; i < 40600 && i < lines.length; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}

console.log('\n=== File Input & Handlers (search mobile-gen-ref) ===');
let idx = 0;
while ((idx = content.indexOf('mobile-gen-ref', idx)) !== -1) {
  const line = content.slice(0, idx).split('\n').length;
  console.log(`Line ${line}: ` + content.slice(idx, idx + 80).replace(/\r?\n/g, ' '));
  idx += 30;
}
