const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');
const rx = /<script(?:\s+type=["'](?:text\/javascript|module)?["']|\s*)?>([\s\S]*?)<\/script>/gi;
let m, i = 0, errors = 0;

while ((m = rx.exec(html)) !== null) {
  const fullTag = m[0];
  const code = m[1];
  if (!code.trim() || fullTag.includes('src=')) continue;
  i++;
  try {
    new vm.Script(code);
    console.log(`Script ${i}: syntax OK (${code.length} bytes)`);
  } catch (err) {
    console.error(`Script ${i} ERROR:`, err.message);
    errors++;
  }
}

if (errors > 0) {
  console.error(`FAIL: ${errors} syntax errors found.`);
  process.exit(1);
} else {
  console.log(`SUCCESS: All ${i} inline scripts syntax valid!`);
}
