const fs = require('fs');
const vm = require('vm');

let html = fs.readFileSync('index.html', 'utf8');

// Test 1: Check finding the Hero Aspect Ratio and Model section
const heroStart = '<!-- Bottom-Left Minimal Icons (Ideogram style: Aspect Ratio & Model Selection) -->';
const heroEnd = '<!-- Bottom-Right Circular Send Button -->';

console.log('Hero start index:', html.indexOf(heroStart));
console.log('Hero end index:', html.indexOf(heroEnd));
