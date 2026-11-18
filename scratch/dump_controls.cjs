const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

let out = '';
function showSection(startStr, endStr, title) {
  const s = html.indexOf(startStr);
  const e = endStr ? html.indexOf(endStr, s) : s + 2000;
  out += `\n=================== ${title} ===================\n`;
  out += html.substring(s, e);
}

showSection('<div id="ideogram-header-generate"', '<div id="ideogram-generate-controls"', 'LEFT PANEL HEADER');
showSection('<div id="ideogram-generate-controls"', '<div id="ideogram-vector-illustration-controls"', 'GENERATE CONTROLS');
showSection('<div id="ideogram-precise-edit-controls"', '<div id="ideogram-remove-bg-controls"', 'PRECISE EDIT CONTROLS');
showSection('<div id="ideogram-remove-bg-controls"', '<div id="ideogram-upscale-controls"', 'REMOVE BACKGROUND CONTROLS');
showSection('<div id="ideogram-upscale-controls"', '<div id="ideogram-vectorize-controls"', 'UPSCALE CONTROLS');

fs.writeFileSync('scratch/controls_dump.txt', out, 'utf8');
console.log('Saved utf8 controls_dump.txt');
