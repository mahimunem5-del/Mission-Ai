const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// 1. Fix DOM ready listener
const oldInit = `        // Initialize mobile homepage when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initMobileHomepage);
        } else {
            initMobileHomepage();
            initMobileImageHomepage();
        }`;

const newInit = `        // Initialize mobile homepages when DOM is ready
        function initAllMobileHomepages() {
            if (typeof initMobileHomepage === 'function') initMobileHomepage();
            if (typeof initMobileImageHomepage === 'function') initMobileImageHomepage();
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initAllMobileHomepages);
        } else {
            initAllMobileHomepages();
        }`;

if (content.includes(oldInit)) {
    content = content.replace(oldInit, newInit);
    console.log('Fixed initAllMobileHomepages in index.html.');
} else {
    // Try normalized CRLF / LF
    const normalizedContent = content.replace(/\r\n/g, '\n');
    const normalizedOld = oldInit.replace(/\r\n/g, '\n');
    if (normalizedContent.includes(normalizedOld)) {
        content = normalizedContent.replace(normalizedOld, newInit.replace(/\r\n/g, '\n'));
        console.log('Fixed initAllMobileHomepages in index.html (normalized).');
    } else {
        console.error('oldInit not found!');
    }
}

// 2. Call renderMobileImageHomeTemplates inside renderImageHomeTemplates
const tmplRenderEnd = `                grid.appendChild(card);
            });
        }`;

const newTmplRenderEnd = `                grid.appendChild(card);
            });

            if (typeof renderMobileImageHomeTemplates === 'function') {
                renderMobileImageHomeTemplates();
            }
        }`;

if (content.includes(tmplRenderEnd)) {
    content = content.replace(tmplRenderEnd, newTmplRenderEnd);
    console.log('Hooked renderMobileImageHomeTemplates inside renderImageHomeTemplates.');
} else {
    const normalizedContent = content.replace(/\r\n/g, '\n');
    const normalizedOld = tmplRenderEnd.replace(/\r\n/g, '\n');
    if (normalizedContent.includes(normalizedOld)) {
        content = normalizedContent.replace(normalizedOld, newTmplRenderEnd.replace(/\r\n/g, '\n'));
        console.log('Hooked renderMobileImageHomeTemplates inside renderImageHomeTemplates (normalized).');
    } else {
        console.error('tmplRenderEnd not found!');
    }
}

// 3. Hook in setImageStudioMode('home')
const homeSetMode = `renderImageHomeTemplates();`;
const newHomeSetMode = `renderImageHomeTemplates();
                if (typeof renderMobileImageHomeTemplates === 'function') {
                    renderMobileImageHomeTemplates();
                }`;

if (!content.includes('if (typeof renderMobileImageHomeTemplates === \'function\') renderMobileImageHomeTemplates();') &&
    !content.includes('renderMobileImageHomeTemplates();\n                }')) {
    const idx = content.indexOf('renderImageHomeCreations();\n                renderImageHomeTemplates();');
    if (idx !== -1) {
        content = content.replace('renderImageHomeCreations();\n                renderImageHomeTemplates();',
            'renderImageHomeCreations();\n                renderImageHomeTemplates();\n                if (typeof renderMobileImageHomeTemplates === "function") renderMobileImageHomeTemplates();');
        console.log('Hooked renderMobileImageHomeTemplates in setImageStudioMode.');
    } else {
        const idxCRLF = content.indexOf('renderImageHomeCreations();\r\n                renderImageHomeTemplates();');
        if (idxCRLF !== -1) {
            content = content.replace('renderImageHomeCreations();\r\n                renderImageHomeTemplates();',
                'renderImageHomeCreations();\r\n                renderImageHomeTemplates();\r\n                if (typeof renderMobileImageHomeTemplates === "function") renderMobileImageHomeTemplates();');
            console.log('Hooked renderMobileImageHomeTemplates in setImageStudioMode (CRLF).');
        }
    }
}

fs.writeFileSync('index.html', content, 'utf8');
console.log('Updated index.html successfully!');
