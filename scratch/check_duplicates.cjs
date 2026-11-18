const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const fnsToCheck = [
    'renderImageHomeTemplates',
    'initDesignTemplatesSection',
    'getAllDesignTemplates',
    'getStoredAdminTemplates',
    'saveCustomDesignTemplate',
    'deleteCustomDesignTemplate',
    'saveAllDesignTemplates',
    'checkAdminStudioRoute',
    'exitAdminStudioToLive',
    'openTemplateWhitePreviewModal',
    'closeTemplateWhitePreviewModal',
    'initAdminStudioModule'
];

for (const fn of fnsToCheck) {
    const fnRegex = new RegExp(`function\\s+${fn}\\b`, 'g');
    const matches = content.match(fnRegex) || [];
    console.log(`Function "${fn}": declared ${matches.length} time(s)`);
}
