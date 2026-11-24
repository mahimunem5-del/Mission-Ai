const fs = require('fs');
let code = fs.readFileSync('scratch/build_mobile_workspace.cjs', 'utf8');

// Find the second "const items =" inside renderMobileResultFeed
const target = `            // 2. Output Items
            const items = (typeof getEffectiveStudioImagesForWorkspace === 'function')
                ? getEffectiveStudioImagesForWorkspace(window.activeMobileTool)
                : (Array.isArray(window.STUDIO_RECENT_IMAGES) ? window.STUDIO_RECENT_IMAGES : []);`;

const replacement = `            // 2. Output Items (items already retrieved above for atomic resolution)`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    console.log('Replaced duplicate const items successfully!');
    fs.writeFileSync('scratch/build_mobile_workspace.cjs', code, 'utf8');
} else {
    console.log('Target not found!');
}
