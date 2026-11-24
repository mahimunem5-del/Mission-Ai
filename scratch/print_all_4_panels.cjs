const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const marker = '<!-- ============================================================ -->\n    <!-- DEDICATED MOBILE INNER WORKSPACE';
const endMarker = '<!-- Secret Template Admin Studio';

const sub = html.substring(html.indexOf(marker), html.indexOf(endMarker));

const panels = [
  'mobile-panel-generate',
  'mobile-panel-remove-bg',
  'mobile-panel-precise-edit',
  'mobile-panel-upscale'
];

panels.forEach(p => {
  const pos = sub.indexOf(`id="${p}"`);
  console.log(`\n========================================\n=== ${p} (pos ${pos}) ===\n========================================`);
  if (pos !== -1) {
    // Find next panel or end of scroll body
    const nextIdx = sub.indexOf('<!-- ==============================================', pos + 10);
    const end = nextIdx !== -1 ? nextIdx : pos + 3000;
    console.log(sub.substring(pos, end));
  }
});
