const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const s1 = '                <!-- Hidden File Input for Reference Upload -->';
const e1 = '                    <!-- Right Circular Send (↑) Button -->';
const p1 = content.indexOf(s1);
const p2 = content.indexOf(e1, p1);
const p2End = content.indexOf('</div>', p2) + '</div>'.length;

console.log('1. Composer HTML block:', p1, p2End);
console.log('Composer block preview:\n' + content.slice(p1, p1 + 100) + '\n...\n' + content.slice(p2End - 100, p2End));

const s2 = '        <!-- B. Multi-Select Floating Contextual Bar (Appears when 1+ images are checked) -->';
const e2 = 'id="mobile-result-multiselect-bar"';
const p3 = content.indexOf(s2);
const p4 = content.indexOf('</div>\n        </div>', p3) + '</div>\n        </div>'.length;
console.log('2. MultiSelect HTML block:', p3, p4);

const s3 = '        <!-- Centered Floating Rounded Card Container -->';
const p5 = content.indexOf(s3);
const p6 = content.indexOf('<!-- Template Preview Image -->', p5);
const p6End = content.indexOf('</div>', p6) + '</div>'.length;
console.log('3. Template preview img container:', p5, p6End);
