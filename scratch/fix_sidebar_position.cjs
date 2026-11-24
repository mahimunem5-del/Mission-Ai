const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const oldMobileSidebar = `@media (max-width: 767px) {
            #sidebar {
                position: fixed;
                top: 0;
                left: 0;
                height: 100%;
                width: 256px !important;
                /* always full width on mobile */
                z-index: 50;
                transform: translateX(-100%);
                box-shadow: none;
            }

            #sidebar.mobile-open {
                transform: translateX(0);
                box-shadow: 4px 0 24px rgba(0, 0, 0, 0.10);
            }`;

const newMobileSidebar = `@media (max-width: 767px) {
            #sidebar {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                height: 100% !important;
                width: 256px !important;
                /* always full width on mobile */
                z-index: 50 !important;
                transform: translateX(-100%) !important;
                box-shadow: none;
            }

            #sidebar.mobile-open {
                transform: translateX(0) !important;
                box-shadow: 4px 0 24px rgba(0, 0, 0, 0.10) !important;
            }`;

if (html.includes(oldMobileSidebar)) {
    html = html.replace(oldMobileSidebar, newMobileSidebar);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log('[PASS] Replaced with LF');
} else {
    const crlfOld = oldMobileSidebar.replace(/\r?\n/g, '\r\n');
    const crlfNew = newMobileSidebar.replace(/\r?\n/g, '\r\n');
    if (html.includes(crlfOld)) {
        html = html.replace(crlfOld, crlfNew);
        fs.writeFileSync('index.html', html, 'utf8');
        console.log('[PASS] Replaced with CRLF');
    } else {
        console.error('Target not found!');
    }
}
