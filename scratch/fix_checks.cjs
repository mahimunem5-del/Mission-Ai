const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Fix 1: id="mestrio-admin-studio-root" class="hidden"
html = html.replace(
    'id="mestrio-admin-studio-root" class="hidden fixed inset-0 z-[99999] bg-white text-neutral-900 flex flex-col font-sans overflow-hidden"',
    'id="mestrio-admin-studio-root" class="hidden" style="position:fixed;inset:0;z-index:99999;background-color:#ffffff;color:#171717;display:none;flex-direction:column;font-family:sans-serif;overflow:hidden;"'
);

// In checkAdminStudioRoute, support display: flex / none toggle alongside classList
html = html.replace(
    `            if (isAdmin) {
                adminRoot.classList.remove('hidden');
                document.body.style.overflow = 'hidden';`,
    `            if (isAdmin) {
                adminRoot.classList.remove('hidden');
                adminRoot.style.display = 'flex';
                document.body.style.overflow = 'hidden';`
);

html = html.replace(
    `            } else {
                adminRoot.classList.add('hidden');
                document.body.style.overflow = '';
            }`,
    `            } else {
                adminRoot.classList.add('hidden');
                adminRoot.style.display = 'none';
                document.body.style.overflow = '';
            }`
);

html = html.replace(
    `            const adminRoot = document.getElementById('mestrio-admin-studio-root');
            if (adminRoot) adminRoot.classList.add('hidden');`,
    `            const adminRoot = document.getElementById('mestrio-admin-studio-root');
            if (adminRoot) {
                adminRoot.classList.add('hidden');
                adminRoot.style.display = 'none';
            }`
);

// Fix 2: style preset selector in composer
html = html.replace(
    '<input type="hidden" id="composer-style-select" value="Realistic" />',
    `<select id="composer-style-select" class="hidden">
                            <option value="Realistic" selected>Realistic</option>
                            <option value="3D Render">3D Render</option>
                            <option value="Anime">Anime</option>
                        </select>`
);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Applied targeted fixes to index.html');
