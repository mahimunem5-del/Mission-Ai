const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');
const snippet = fs.readFileSync('scratch/new_mobile_workspace_snippet.html', 'utf8');

// 1. Create backup
fs.writeFileSync('index.html.bak', indexHtml, 'utf8');
console.log('Created backup index.html.bak');

// 2. Update CSS rule in <style>
const oldCss = `#mobile-image-home-container,
            #mobile-image-composer-container,
            #mobile-workspace-drawer,
            #mobile-workspace-result-feed {
                display: none !important;
            }`;

const newCss = `#mobile-image-home-container,
            #mobile-image-composer-container,
            #mobile-workspace-drawer,
            #mobile-model-drawer,
            #mobile-workspace-result-feed {
                display: none !important;
            }`;

let updatedHtml = indexHtml;
if (updatedHtml.includes(oldCss)) {
    updatedHtml = updatedHtml.replace(oldCss, newCss);
    console.log('CSS media query rule updated successfully!');
} else {
    console.error('Could not find oldCss in index.html!');
    process.exit(1);
}

// 3. Find start and end markers for mobile workspace block
const startMarker = '<!-- STEP 1: FLOATING BOTTOM SHEET DRAWER OVER DIMMED BACKDROP -->';
const endMarker = '<!-- Secret Template Admin Studio (100% Invisible to Public Users) -->';

const startIndex = updatedHtml.indexOf(startMarker);
const endIndex = updatedHtml.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error('Markers not found! start:', startIndex, 'end:', endIndex);
    process.exit(1);
}

console.log('Replacing from index', startIndex, 'to', endIndex);
console.log('Old length in between:', endIndex - startIndex);

const finalHtml = updatedHtml.substring(0, startIndex) + snippet + '\n\n    ' + updatedHtml.substring(endIndex);

fs.writeFileSync('index.html', finalHtml, 'utf8');
console.log('Successfully wrote updated index.html, new length:', finalHtml.length);
