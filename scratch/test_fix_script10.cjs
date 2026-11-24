const fs = require('fs');
const { execSync } = require('child_process');

let code = fs.readFileSync('scratch/script_10.js', 'utf8');

// Replace second and third escapeHtml declarations with assignments or comments
// Let's find all occurrences
let parts = code.split('function escapeHtml(str) {');
console.log('Occurrences of function escapeHtml in script_10:', parts.length - 1);

// Keep first, replace others
let newCode = parts[0] + 'function escapeHtml(str) {' + parts[1];
for (let i = 2; i < parts.length; i++) {
  newCode += '/* duplicate escapeHtml */ var _escapeHtml_dup' + i + ' = function(str) {' + parts[i];
}

fs.writeFileSync('scratch/script_10_fixed.js', newCode);

try {
  execSync('node --check "scratch/script_10_fixed.js"', { stdio: 'pipe' });
  console.log('script_10_fixed.js: OK - NO MORE SYNTAX ERRORS!');
} catch (err) {
  console.error('script_10_fixed.js ERROR:\n', err.stderr ? err.stderr.toString() : err.message);
}
