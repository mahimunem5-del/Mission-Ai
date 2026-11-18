const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// -------------------------------------------------------------
// FIX 1: Restore Toggle Sidebar Button & Remove Duplicate Listener
// -------------------------------------------------------------

// Look for the sidebar-toggle-btn HTML tag
const oldBtnHtml = `<button id="sidebar-toggle-btn" type="button"
                    onclick="event.preventDefault();if(typeof window.toggleDesktopSidebar==='function'){window.toggleDesktopSidebar();}else{document.getElementById('sidebar')?.classList.toggle('sidebar-collapsed');}"
                    class="p-1.5 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer border-0 outline-none"
                    title="Toggle Sidebar">`;

const newBtnHtml = `<button id="sidebar-toggle-btn" type="button"
                    class="p-1.5 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer border-0 outline-none"
                    title="Toggle Sidebar">`;

if (html.includes(oldBtnHtml)) {
    html = html.replace(oldBtnHtml, newBtnHtml);
    console.log('[SUCCESS 1A] Removed duplicate inline onclick from #sidebar-toggle-btn');
} else {
    // Regex fallback if whitespace slightly differs
    const btnRegex = /<button id="sidebar-toggle-btn" type="button"\s+onclick="[^"]*"\s+class="([^"]*)"\s+title="Toggle Sidebar">/;
    if (btnRegex.test(html)) {
        html = html.replace(btnRegex, `<button id="sidebar-toggle-btn" type="button" class="$1" title="Toggle Sidebar">`);
        console.log('[SUCCESS 1A via regex] Removed duplicate inline onclick from #sidebar-toggle-btn');
    } else {
        console.warn('[WARN 1A] Could not find oldBtnHtml');
    }
}

// In JavaScript, ensure toggleBtn click handler is cleanly bound and non-duplicative
const oldToggleJs = `            // ── Desktop toggle button ─────────────────────────────────────
            if (toggleBtn) {
                toggleBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isMobile()) {
                        // On mobile, this button is inside the open drawer → close it
                        closeMobileDrawer();
                    } else {
                        toggleDesktopSidebar();
                    }
                });
            }`;

const newToggleJs = `            // ── Desktop toggle button ─────────────────────────────────────
            if (toggleBtn) {
                toggleBtn.onclick = function (e) {
                    if (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    if (isMobile()) {
                        // On mobile, this button is inside the open drawer → close it
                        closeMobileDrawer();
                    } else {
                        toggleDesktopSidebar();
                    }
                };
            }`;

if (html.includes(oldToggleJs)) {
    html = html.replace(oldToggleJs, newToggleJs);
    console.log('[SUCCESS 1B] Replaced toggleBtn event listener with single toggleBtn.onclick handler');
} else {
    console.warn('[WARN 1B] Could not find oldToggleJs');
}


// -------------------------------------------------------------
// FIX 2: Self-Contained Resilient Admin Studio Route Watcher at Bottom
// -------------------------------------------------------------
const routeWatcherJs = `
        // ─── Self-Contained Resilient Admin Studio Route Watcher ───────────
        (function initAdminRouteWatcher() {
            function forceMountAdminStudio() {
                try {
                    const hash = window.location.hash || '';
                    const search = window.location.search || '';
                    const isAdmin = hash.includes('/admin/templates') || hash === '#/admin/templates' || hash.startsWith('#/admin/templates') || search.includes('admin=templates');
                    const adminRoot = document.getElementById('mestrio-admin-studio-root');
                    if (!adminRoot) return;

                    const lockScreen = document.getElementById('admin-security-lock-screen');
                    const isAuth = sessionStorage.getItem('mestrio_admin_auth') === 'authenticated';

                    if (isAdmin) {
                        adminRoot.classList.remove('hidden');
                        adminRoot.style.cssText = 'display: flex !important; position: fixed !important; inset: 0 !important; z-index: 99999 !important; background: #ffffff !important; overflow-y: auto !important; flex-direction: column !important; width: 100vw !important; height: 100vh !important;';
                        document.body.style.overflow = 'hidden';

                        if (isAuth) {
                            if (lockScreen) {
                                lockScreen.classList.add('hidden');
                                lockScreen.style.cssText = 'display: none !important;';
                            }
                            if (typeof renderAdminTemplatesList === 'function') {
                                renderAdminTemplatesList();
                            }
                        } else {
                            if (lockScreen) {
                                lockScreen.classList.remove('hidden');
                                lockScreen.style.cssText = 'display: flex !important; position: absolute; inset: 0; z-index: 50;';
                            }
                            const passInput = document.getElementById('admin-passcode-input');
                            if (passInput) {
                                setTimeout(() => passInput.focus(), 80);
                            }
                        }
                    } else {
                        adminRoot.classList.add('hidden');
                        adminRoot.style.cssText = 'display: none !important;';
                        document.body.style.overflow = '';
                    }
                } catch (err) {
                    console.error('[Admin Studio Route Watcher]:', err);
                }
            }

            // Expose globally so exits and navigations can trigger it
            window.forceMountAdminStudio = forceMountAdminStudio;
            window.checkAdminStudioRoute = forceMountAdminStudio;

            // 1. Run immediately on script execution
            forceMountAdminStudio();

            // 2. Run on DOMContentLoaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', forceMountAdminStudio);
            }

            // 3. Run on window load
            window.addEventListener('load', forceMountAdminStudio);

            // 4. Run on hashchange & popstate
            window.addEventListener('hashchange', forceMountAdminStudio);
            window.addEventListener('popstate', forceMountAdminStudio);
        })();
`;

// Insert routeWatcherJs right before </script>
const scriptEndTag = '</script>';
const lastScriptIdx = html.lastIndexOf(scriptEndTag);
if (lastScriptIdx !== -1) {
    html = html.slice(0, lastScriptIdx) + '\n' + routeWatcherJs + '\n' + html.slice(lastScriptIdx);
    console.log('[SUCCESS 2] Injected self-contained Admin Studio Route Watcher before </script>');
} else {
    console.warn('[WARN 2] Could not find </script>');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully saved isolated hotfix to index.html');
