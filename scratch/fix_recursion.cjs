const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// 1. Remove recursive call inside renderMobileImageHomeTemplates
const badSelfCall = `                grid.appendChild(card);
            });

            if (typeof renderMobileImageHomeTemplates === 'function') {
                renderMobileImageHomeTemplates();
            }
        }
        window.renderMobileImageHomeTemplates = renderMobileImageHomeTemplates;`;

const goodMobileEnd = `                grid.appendChild(card);
            });
        }
        window.renderMobileImageHomeTemplates = renderMobileImageHomeTemplates;`;

if (content.includes(badSelfCall)) {
    content = content.replace(badSelfCall, goodMobileEnd);
    console.log('Removed recursive call inside renderMobileImageHomeTemplates.');
} else {
    const normContent = content.replace(/\r\n/g, '\n');
    const normBad = badSelfCall.replace(/\r\n/g, '\n');
    if (normContent.includes(normBad)) {
        content = normContent.replace(normBad, goodMobileEnd.replace(/\r\n/g, '\n'));
        console.log('Removed recursive call inside renderMobileImageHomeTemplates (normalized).');
    } else {
        console.error('badSelfCall not found!');
    }
}

// 2. Add renderMobileImageHomeTemplates inside desktop renderImageHomeTemplates
const desktopCardEnd = `                card.addEventListener('click', () => {
                    openTemplateWhitePreviewModal(tmpl, executePreciseEdit, executeGenerate);
                });

                grid.appendChild(card);
            });
        }`;

const desktopCardEndWithMobile = `                card.addEventListener('click', () => {
                    openTemplateWhitePreviewModal(tmpl, executePreciseEdit, executeGenerate);
                });

                grid.appendChild(card);
            });

            if (typeof renderMobileImageHomeTemplates === 'function') {
                renderMobileImageHomeTemplates();
            }
        }`;

if (content.includes(desktopCardEnd)) {
    content = content.replace(desktopCardEnd, desktopCardEndWithMobile);
    console.log('Added renderMobileImageHomeTemplates inside desktop renderImageHomeTemplates.');
} else {
    const normContent = content.replace(/\r\n/g, '\n');
    const normEnd = desktopCardEnd.replace(/\r\n/g, '\n');
    if (normContent.includes(normEnd)) {
        content = normContent.replace(normEnd, desktopCardEndWithMobile.replace(/\r\n/g, '\n'));
        console.log('Added renderMobileImageHomeTemplates inside desktop renderImageHomeTemplates (normalized).');
    } else {
        console.error('desktopCardEnd not found!');
    }
}

fs.writeFileSync('index.html', content, 'utf8');
console.log('Successfully fixed recursive call in index.html!');
