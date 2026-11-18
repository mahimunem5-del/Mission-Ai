const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// -------------------------------------------------------------
// 1. In initImageStudio(), ensure renderImageHomeTemplates() is called directly
// -------------------------------------------------------------
const initStudioOld = `            if (typeof initDesignTemplatesSection === 'function') {
                initDesignTemplatesSection();
            }
            if (typeof initVectorIllustrationControls === 'function') {`;

const initStudioNew = `            if (typeof initDesignTemplatesSection === 'function') {
                initDesignTemplatesSection();
            }
            if (typeof renderImageHomeTemplates === 'function') {
                renderImageHomeTemplates();
            }
            if (typeof initVectorIllustrationControls === 'function') {`;

if (html.includes(initStudioOld)) {
    html = html.replace(initStudioOld, initStudioNew);
    console.log('[SUCCESS] Added explicit renderImageHomeTemplates() inside initImageStudio()');
} else {
    console.warn('[WARN] Could not find initStudioOld pattern');
}

// -------------------------------------------------------------
// 2. Add DOMContentLoaded listener for renderImageHomeTemplates()
// -------------------------------------------------------------
const domContentOld = `        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initAdminStudioModule);
        } else {
            initAdminStudioModule();
        }`;

const domContentNew = `        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                initAdminStudioModule();
                if (typeof renderImageHomeTemplates === 'function') {
                    renderImageHomeTemplates();
                }
                if (typeof checkAdminStudioRoute === 'function') {
                    checkAdminStudioRoute();
                }
            });
        } else {
            initAdminStudioModule();
            if (typeof renderImageHomeTemplates === 'function') {
                renderImageHomeTemplates();
            }
            if (typeof checkAdminStudioRoute === 'function') {
                checkAdminStudioRoute();
            }
        }`;

if (html.includes(domContentOld)) {
    html = html.replace(domContentOld, domContentNew);
    console.log('[SUCCESS] Added DOMContentLoaded handler for renderImageHomeTemplates and checkAdminStudioRoute');
} else {
    console.warn('[WARN] Could not find domContentOld pattern');
}

// -------------------------------------------------------------
// 3. Update #mestrio-admin-studio-root element styles
// -------------------------------------------------------------
const oldRoot = `id="mestrio-admin-studio-root" class="hidden" style="position:fixed;inset:0;z-index:99999;background-color:#ffffff;color:#171717;display:none;flex-direction:column;font-family:sans-serif;overflow:hidden;"`;
const newRoot = `id="mestrio-admin-studio-root" class="hidden" style="position: fixed; inset: 0; z-index: 99999; background: #ffffff; overflow-y: auto;"`;

if (html.includes(oldRoot)) {
    html = html.replace(oldRoot, newRoot);
    console.log('[SUCCESS] Updated #mestrio-admin-studio-root style to position: fixed; inset: 0; z-index: 99999; background: #ffffff; overflow-y: auto;');
} else {
    console.warn('[WARN] Could not find oldRoot');
}

// -------------------------------------------------------------
// 4. Update checkAdminStudioRoute() logic and listeners
// -------------------------------------------------------------
const oldCheckRoute = `        function checkAdminStudioRoute() {
            const hash = window.location.hash || '';
            const search = window.location.search || '';
            const isAdmin = hash === '#/admin/templates' || hash.startsWith('#/admin/templates') || search.includes('admin=templates');
            const adminRoot = document.getElementById('mestrio-admin-studio-root');
            const lockScreen = document.getElementById('admin-security-lock-screen');
            if (!adminRoot) return;

            if (isAdmin) {
                adminRoot.classList.remove('hidden');
                adminRoot.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                const isAuth = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'authenticated';
                if (isAuth) {
                    if (lockScreen) lockScreen.classList.add('hidden');
                    renderAdminTemplatesList();
                } else {
                    if (lockScreen) lockScreen.classList.remove('hidden');
                    const passInput = document.getElementById('admin-passcode-input');
                    if (passInput) {
                        passInput.value = '';
                        setTimeout(() => passInput.focus(), 100);
                    }
                }
            } else {
                adminRoot.classList.add('hidden');
                adminRoot.style.display = 'none';
                document.body.style.overflow = '';
            }
        }`;

const newCheckRoute = `        function checkAdminStudioRoute() {
            const hash = window.location.hash || '';
            const search = window.location.search || '';
            const isAdmin = hash.includes('/admin/templates') || hash === '#/admin/templates' || hash.startsWith('#/admin/templates') || search.includes('admin=templates');
            const adminRoot = document.getElementById('mestrio-admin-studio-root');
            const lockScreen = document.getElementById('admin-security-lock-screen');
            if (!adminRoot) return;

            if (isAdmin) {
                adminRoot.classList.remove('hidden');
                adminRoot.style.position = 'fixed';
                adminRoot.style.inset = '0';
                adminRoot.style.zIndex = '99999';
                adminRoot.style.background = '#ffffff';
                adminRoot.style.overflowY = 'auto';
                adminRoot.style.display = 'flex';
                document.body.style.overflow = 'hidden';

                const isAuth = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'authenticated';
                if (isAuth) {
                    if (lockScreen) {
                        lockScreen.classList.add('hidden');
                        lockScreen.style.display = 'none';
                    }
                    renderAdminTemplatesList();
                } else {
                    if (lockScreen) {
                        lockScreen.classList.remove('hidden');
                        lockScreen.style.display = 'flex';
                    }
                    const passInput = document.getElementById('admin-passcode-input');
                    if (passInput) {
                        passInput.value = '';
                        setTimeout(() => passInput.focus(), 100);
                    }
                }
            } else {
                adminRoot.classList.add('hidden');
                adminRoot.style.display = 'none';
                document.body.style.overflow = '';
            }
        }`;

if (html.includes(oldCheckRoute)) {
    html = html.replace(oldCheckRoute, newCheckRoute);
    console.log('[SUCCESS] Updated checkAdminStudioRoute() with overlay mounting & hash.includes(/admin/templates)');
} else {
    console.warn('[WARN] Could not find oldCheckRoute');
}

// -------------------------------------------------------------
// 5. In renderImageHomeTemplates(), ensure starter templates display cleanly
// with subtle neutral placeholder if image not yet loaded/added locally
// -------------------------------------------------------------
const oldCardImgHtml = `                card.innerHTML = \`
                    <img src="\${imgUrl}"
                         alt="\${displayTitle}"
                         loading="lazy"
                         class="w-full h-full object-cover block group-hover:scale-[1.02] transition-transform duration-300"
                         onerror="this.onerror=null; this.closest('.break-inside-avoid')?.remove();" />`;

const newCardImgHtml = `                card.innerHTML = \`
                    <div class="relative w-full h-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                        <!-- Clean subtle neutral placeholder that shows if local image is not yet placed -->
                        <div class="tmpl-card-placeholder absolute inset-0 flex flex-col items-center justify-center p-3 text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 select-none">
                            <svg class="w-6 h-6 mb-1.5 opacity-40 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                <circle cx="9" cy="9" r="2"/>
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                            </svg>
                            <span class="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 text-center line-clamp-1 px-2">\${displayTitle}</span>
                        </div>
                        <!-- Template image (onload hides placeholder, onerror keeps subtle neutral placeholder visible without breaking card) -->
                        \${imgUrl ? \`
                        <img src="\${imgUrl}"
                             alt="\${displayTitle}"
                             loading="lazy"
                             class="absolute inset-0 w-full h-full object-cover block group-hover:scale-[1.02] transition-transform duration-300 z-[1]"
                             onload="this.previousElementSibling?.classList.add('hidden');"
                             onerror="this.style.display='none';" />
                        \` : ''}
                    </div>\``;

if (html.includes(oldCardImgHtml)) {
    html = html.replace(oldCardImgHtml, newCardImgHtml);
    console.log('[SUCCESS] Updated template card image rendering with neutral placeholder fallback');
} else {
    console.warn('[WARN] Could not find oldCardImgHtml');
}

// -------------------------------------------------------------
// 6. Ensure checkAdminStudioRoute() is evaluated on load, DOMContentLoaded, hashchange
// -------------------------------------------------------------
const oldInitAdminListeners = `            // Check secret hash on load & hashchange
            window.addEventListener('hashchange', checkAdminStudioRoute);
            checkAdminStudioRoute();`;

const newInitAdminListeners = `            // Check secret hash on load, DOMContentLoaded, and hashchange
            window.addEventListener('hashchange', checkAdminStudioRoute);
            window.addEventListener('popstate', checkAdminStudioRoute);
            window.addEventListener('load', checkAdminStudioRoute);
            checkAdminStudioRoute();`;

if (html.includes(oldInitAdminListeners)) {
    html = html.replace(oldInitAdminListeners, newInitAdminListeners);
    console.log('[SUCCESS] Added hashchange, popstate, load listeners to checkAdminStudioRoute');
} else {
    console.warn('[WARN] Could not find oldInitAdminListeners');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully saved hotfix to index.html');
