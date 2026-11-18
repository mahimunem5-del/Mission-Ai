const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. CSS REPLACEMENT
const oldCss = `        /* Collapsed desktop: icon-only rail */
        #sidebar.sidebar-collapsed {
            width: 56px;
        }

        #sidebar.sidebar-collapsed .sidebar-header-area {
            padding: 0.75rem 0.5rem !important;
            justify-content: center !important;
            align-items: center !important;
            width: 56px !important;
            box-sizing: border-box !important;
        }

        #sidebar.sidebar-collapsed #sidebar-brand-logo,
        #sidebar.sidebar-collapsed #sidebar-search-btn {
            display: none !important;
        }

        #sidebar.sidebar-collapsed .sidebar-header-actions {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            gap: 0 !important;
        }

        #sidebar.sidebar-collapsed #sidebar-toggle-btn {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 40px !important;
            height: 36px !important;
            margin: 0 auto !important;
            padding: 0 !important;
            border-radius: 0.75rem !important;
            cursor: pointer !important;
        }

        #sidebar.sidebar-collapsed .sidebar-hide-on-collapse {
            opacity: 0;
            pointer-events: none;
            width: 0;
            overflow: hidden;
            white-space: nowrap;
        }

        #sidebar.sidebar-collapsed .sidebar-label {
            display: none;
        }

        #sidebar.sidebar-collapsed #recent-chats-list,
        #sidebar.sidebar-collapsed .sidebar-upgrade-card,
        #sidebar.sidebar-collapsed .sidebar-profile-name {
            display: none;
        }

        #sidebar.sidebar-collapsed .sidebar-section-header {
            display: none;
        }

        /* Center icons in collapsed rail */
        #sidebar.sidebar-collapsed .sidebar-nav-item {
            justify-content: center;
            padding-left: 0;
            padding-right: 0;
        }

        #sidebar.sidebar-collapsed .sidebar-new-chat-btn {
            justify-content: center;
            padding-left: 0;
            padding-right: 0;
            gap: 0;
        }

        #sidebar.sidebar-collapsed .sidebar-profile-area {
            justify-content: center;
        }`;

const newCss = `        /* Collapsed desktop: icon-only rail */
        #sidebar.sidebar-collapsed {
            width: 56px;
        }

        .sidebar-header-area {
            position: relative;
            transition: padding 200ms ease;
        }

        #sidebar.sidebar-collapsed .sidebar-header-area {
            padding: 0.75rem 0.5rem !important;
            justify-content: center !important;
            align-items: center !important;
            width: 56px !important;
            box-sizing: border-box !important;
            position: relative !important;
        }

        /* In collapsed rail: display brand logo centered */
        #sidebar.sidebar-collapsed #sidebar-brand-logo {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 36px !important;
            height: 36px !important;
            margin: 0 auto !important;
            cursor: pointer !important;
            transition: opacity 150ms ease;
        }

        #sidebar.sidebar-collapsed #sidebar-search-btn {
            display: none !important;
        }

        /* Collapsed rail hover toggle: reveal toggle button cleanly over logo on hover */
        #sidebar.sidebar-collapsed .sidebar-header-actions {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            position: absolute !important;
            inset: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            gap: 0 !important;
            opacity: 0 !important;
            pointer-events: none !important;
            transition: opacity 150ms ease;
            background: inherit !important;
            border-radius: 0.75rem !important;
        }

        #sidebar.sidebar-collapsed .sidebar-header-area:hover .sidebar-header-actions,
        #sidebar.sidebar-collapsed #sidebar-brand-logo:hover ~ .sidebar-header-actions,
        #sidebar.sidebar-collapsed .sidebar-header-actions:hover {
            opacity: 1 !important;
            pointer-events: auto !important;
        }

        #sidebar.sidebar-collapsed .sidebar-header-area:hover #sidebar-brand-logo {
            opacity: 0 !important;
        }

        #sidebar.sidebar-collapsed #sidebar-toggle-btn {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 36px !important;
            height: 36px !important;
            margin: 0 auto !important;
            padding: 0 !important;
            border-radius: 0.75rem !important;
            cursor: pointer !important;
        }

        #sidebar.sidebar-collapsed .sidebar-hide-on-collapse {
            opacity: 0;
            pointer-events: none;
            width: 0;
            overflow: hidden;
            white-space: nowrap;
        }

        /* Nav Item & Label: Zero layout jump guarantee during expansion and collapse */
        .sidebar-nav-item {
            display: flex !important;
            align-items: center !important;
            justify-content: flex-start !important;
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            white-space: nowrap !important;
            width: 100% !important;
        }

        .sidebar-label {
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: clip !important;
            transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        #sidebar.sidebar-collapsed .sidebar-label {
            display: none !important;
            opacity: 0 !important;
            width: 0 !important;
            pointer-events: none !important;
        }

        #sidebar.sidebar-collapsed #recent-chats-list,
        #sidebar.sidebar-collapsed .sidebar-upgrade-card,
        #sidebar.sidebar-collapsed .sidebar-profile-name {
            display: none;
        }

        #sidebar.sidebar-collapsed .sidebar-section-header {
            display: none;
        }

        /* In collapsed rail, keep left-aligned padding so icon center stays exactly at x=28px with ZERO jump */
        #sidebar.sidebar-collapsed .sidebar-nav-item {
            justify-content: flex-start !important;
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
            overflow: hidden !important;
            white-space: nowrap !important;
        }

        #sidebar.sidebar-collapsed .sidebar-new-chat-btn {
            justify-content: flex-start !important;
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
            gap: 0;
        }

        #sidebar.sidebar-collapsed .sidebar-profile-area {
            justify-content: center;
        }`;

if (!html.includes(oldCss)) {
    console.error('Failed to find oldCss');
    process.exit(1);
}
html = html.replace(oldCss, newCss);
console.log('Step 1: CSS replaced successfully');

// 2. HTML BRAND HEADER REPLACEMENT (Remove inline onclick)
const oldBrandHeader = `        <!-- Brand Header -->
        <div class="sidebar-header-area flex items-center justify-between px-4 py-3">
            <a href="javascript:void(0)" id="sidebar-brand-logo"
                onclick="event.preventDefault();if(typeof createNewChat==='function'){createNewChat();}else if(typeof switchWorkspace==='function'){switchWorkspace('chat');}"
                class="flex items-center overflow-hidden w-9 h-9 justify-center cursor-pointer" title="AI Mestrio">
                <!-- scale-150 diye image-er inner graphic-take boro kora hoyeche -->
                <img src="/public/logo.png" onerror="if(!this.dataset.retried){this.dataset.retried='1';this.src='/logo.png';}else if(this.dataset.retried==='1'){this.dataset.retried='2';this.src='./public/logo.png';}" alt="Mestrio"
                    class="w-9 h-9 object-contain scale-150 origin-center hover:opacity-85 transition-transform" />
            </a>`;

const newBrandHeader = `        <!-- Brand Header -->
        <div class="sidebar-header-area flex items-center justify-between px-4 py-3">
            <a href="javascript:void(0)" id="sidebar-brand-logo"
                class="flex items-center overflow-hidden w-9 h-9 justify-center cursor-pointer" title="AI Mestrio">
                <!-- scale-150 diye image-er inner graphic-take boro kora hoyeche -->
                <img src="/public/logo.png" onerror="if(!this.dataset.retried){this.dataset.retried='1';this.src='/logo.png';}else if(this.dataset.retried==='1'){this.dataset.retried='2';this.src='./public/logo.png';}" alt="Mestrio"
                    class="w-9 h-9 object-contain scale-150 origin-center hover:opacity-85 transition-transform" />
            </a>`;

if (!html.includes(oldBrandHeader)) {
    console.error('Failed to find oldBrandHeader');
    process.exit(1);
}
html = html.replace(oldBrandHeader, newBrandHeader);
console.log('Step 2: Brand header HTML replaced successfully');

// 3. BRAND LOGO LISTENER GUARD AT LINE ~20497
const oldBrandLogoListener = `        const brandLogo = document.getElementById('sidebar-brand-logo');
        if (brandLogo) {
            brandLogo.addEventListener('click', (e) => {
                e.preventDefault();
                createNewChat();
            });
        }`;

const newBrandLogoListener = `        const brandLogo = document.getElementById('sidebar-brand-logo');
        if (brandLogo) {
            brandLogo.addEventListener('click', (e) => {
                const sb = document.getElementById('sidebar');
                if (sb && sb.classList.contains('sidebar-collapsed')) {
                    return; // Handled by collapsed rail expand toggle
                }
                e.preventDefault();
                createNewChat();
            });
        }`;

if (!html.includes(oldBrandLogoListener)) {
    console.error('Failed to find oldBrandLogoListener');
    process.exit(1);
}
html = html.replace(oldBrandLogoListener, newBrandLogoListener);
console.log('Step 3: Brand logo listener guard replaced successfully');

// 4. SIDEBAR COLLAPSE SCRIPT BLOCK
const oldSidebarScript = `            // ── Desktop: toggle collapsed/expanded ───────────────────────
            function toggleDesktopSidebar() {
                if (isMobile()) {
                    closeMobileDrawer();
                    return;
                }
                const isNowCollapsed = sidebar.classList.toggle('sidebar-collapsed');
                localStorage.setItem(STORAGE_KEY, isNowCollapsed ? '1' : '0');
                syncSidebarBorder();
                window.dispatchEvent(new Event('resize'));
            }
            window.toggleDesktopSidebar = toggleDesktopSidebar;

            // ── Mobile: open drawer ───────────────────────────────────────
            function openMobileDrawer() {
                sidebar.classList.add('mobile-open');
                overlay.classList.remove('hidden');
                // Prevent body scroll while drawer is open
                document.body.style.overflow = 'hidden';
            }

            // ── Mobile: close drawer ──────────────────────────────────────
            function closeMobileDrawer() {
                sidebar.classList.remove('mobile-open');
                overlay.classList.add('hidden');
                document.body.style.overflow = '';
            }

            // ── Desktop toggle button ─────────────────────────────────────
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
            }

            // ── Mobile hamburger ──────────────────────────────────────────
            if (mobileBtn) {
                mobileBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openMobileDrawer();
                });
            }

            // ── Overlay click closes drawer ───────────────────────────────
            if (overlay) {
                overlay.addEventListener('click', closeMobileDrawer);
            }

            // ── Centralized Sidebar Navigation Delegation (Guarantees zero /# navigation traps) ──
            sidebar.addEventListener('click', (e) => {
                const brandLogo = e.target.closest('#sidebar-brand-logo');
                if (brandLogo) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isMobile()) closeMobileDrawer();
                    if (typeof createNewChat === 'function') createNewChat();
                    else if (typeof switchWorkspace === 'function') switchWorkspace('chat');
                    return;
                }

                const navItem = e.target.closest('#new-chat-btn, #sidebar-nav-images, #sidebar-nav-slides, #sidebar-nav-projects, #sidebar-nav-library, #sidebar-nav-compare');
                if (!navItem) return;

                e.preventDefault();
                e.stopPropagation();
                if (isMobile()) closeMobileDrawer();

                const id = navItem.id;
                if (id === 'new-chat-btn') {
                    if (typeof createNewChat === 'function') createNewChat();
                    else if (typeof switchWorkspace === 'function') switchWorkspace('chat');
                } else if (id === 'sidebar-nav-images') {
                    if (typeof imageStudioMode !== 'undefined') imageStudioMode = 'home';
                    if (typeof switchWorkspace === 'function') switchWorkspace('image-studio');
                } else if (id === 'sidebar-nav-slides') {
                    if (typeof switchWorkspace === 'function') switchWorkspace('slides-studio');
                } else if (id === 'sidebar-nav-projects') {
                    if (typeof switchWorkspace === 'function') switchWorkspace('projects');
                } else if (id === 'sidebar-nav-library') {
                    if (typeof switchWorkspace === 'function') switchWorkspace('library');
                } else if (id === 'sidebar-nav-compare') {
                    if (typeof switchWorkspace === 'function') switchWorkspace('compare');
                }
            });`;

const newSidebarScript = `            // ── Desktop: toggle collapsed/expanded ───────────────────────
            function toggleDesktopSidebar() {
                if (isMobile()) {
                    closeMobileDrawer();
                    return;
                }
                const isNowCollapsed = sidebar.classList.toggle('sidebar-collapsed');
                try { localStorage.setItem(STORAGE_KEY, isNowCollapsed ? '1' : '0'); } catch (_) {}
                syncSidebarBorder();
                try { window.dispatchEvent(new Event('resize')); } catch (_) {}
            }
            window.toggleDesktopSidebar = toggleDesktopSidebar;

            // ── Mobile: open drawer ───────────────────────────────────────
            function openMobileDrawer() {
                sidebar.classList.add('mobile-open');
                overlay.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }

            // ── Mobile: close drawer ──────────────────────────────────────
            function closeMobileDrawer() {
                sidebar.classList.remove('mobile-open');
                overlay.classList.add('hidden');
                document.body.style.overflow = '';
            }

            // ── Desktop toggle button ─────────────────────────────────────
            if (toggleBtn) {
                toggleBtn.onclick = function (e) {
                    if (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    if (isMobile()) {
                        closeMobileDrawer();
                    } else {
                        toggleDesktopSidebar();
                    }
                };
            }

            // ── Brand logo & Collapsed Rail Logo Hover Toggle ────────────
            function handleBrandLogoClick(e) {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                if (sidebar.classList.contains('sidebar-collapsed')) {
                    toggleDesktopSidebar();
                    return;
                }
                if (isMobile()) closeMobileDrawer();
                if (typeof createNewChat === 'function') createNewChat();
                else if (typeof switchWorkspace === 'function') switchWorkspace('chat');
            }

            const brandLogo = document.getElementById('sidebar-brand-logo');
            if (brandLogo) {
                brandLogo.onclick = handleBrandLogoClick;
            }

            // ── Mobile hamburger ──────────────────────────────────────────
            if (mobileBtn) {
                mobileBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openMobileDrawer();
                });
            }

            // ── Overlay click closes drawer ───────────────────────────────
            if (overlay) {
                overlay.addEventListener('click', closeMobileDrawer);
            }

            // ── Centralized Sidebar Navigation Delegation (Guarantees zero /# navigation traps) ──
            sidebar.addEventListener('click', (e) => {
                if (e.target.closest('#sidebar-toggle-btn')) {
                    return; // Cleanly handled by toggleBtn.onclick
                }
                const brandLogoEl = e.target.closest('#sidebar-brand-logo');
                if (brandLogoEl) {
                    handleBrandLogoClick(e);
                    return;
                }

                const navItem = e.target.closest('#new-chat-btn, #sidebar-nav-images, #sidebar-nav-slides, #sidebar-nav-projects, #sidebar-nav-library, #sidebar-nav-compare');
                if (!navItem) return;

                e.preventDefault();
                e.stopPropagation();
                if (isMobile()) closeMobileDrawer();

                const id = navItem.id;
                if (id === 'new-chat-btn') {
                    if (typeof createNewChat === 'function') createNewChat();
                    else if (typeof switchWorkspace === 'function') switchWorkspace('chat');
                } else if (id === 'sidebar-nav-images') {
                    if (typeof imageStudioMode !== 'undefined') imageStudioMode = 'home';
                    if (typeof switchWorkspace === 'function') switchWorkspace('image-studio');
                } else if (id === 'sidebar-nav-slides') {
                    if (typeof switchWorkspace === 'function') switchWorkspace('slides-studio');
                } else if (id === 'sidebar-nav-projects') {
                    if (typeof switchWorkspace === 'function') switchWorkspace('projects');
                } else if (id === 'sidebar-nav-library') {
                    if (typeof switchWorkspace === 'function') switchWorkspace('library');
                } else if (id === 'sidebar-nav-compare') {
                    if (typeof switchWorkspace === 'function') switchWorkspace('compare');
                }
            });`;

if (!html.includes(oldSidebarScript)) {
    console.error('Failed to find oldSidebarScript');
    process.exit(1);
}
html = html.replace(oldSidebarScript, newSidebarScript);
console.log('Step 4: Sidebar collapse script replaced successfully');

// 5. REMOVE OLD initAdminRouteWatcher FROM MAIN SCRIPT & ADD ISOLATED SCRIPT BEFORE </body>
const oldEndBlock = `        // ─── Self-Contained Resilient Admin Studio Route Watcher ───────────
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

</script>
</body>

</html>`;

const newEndBlock = `</script>

    <!-- Guaranteed Self-Executing Admin Studio Route Watcher (Outside Main Script) -->
    <script>
    (function initGuaranteedAdminRouteWatcher() {
        const ADMIN_PASSCODE = '26135062';
        const ADMIN_SESSION_KEY = 'mestrio_admin_auth';

        function forceMountAdminStudio() {
            try {
                const hash = window.location.hash || '';
                const search = window.location.search || '';
                const isAdmin = hash.includes('/admin/templates') || search.includes('admin=templates');
                const adminRoot = document.getElementById('mestrio-admin-studio-root');
                if (!adminRoot) return;

                const lockScreen = document.getElementById('admin-security-lock-screen');
                const isAuth = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'authenticated';

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
                            lockScreen.style.cssText = 'display: flex !important; position: absolute !important; inset: 0 !important; z-index: 50 !important;';
                        }
                        const passInput = document.getElementById('admin-passcode-input');
                        if (passInput) {
                            passInput.value = '';
                            setTimeout(() => passInput.focus(), 80);
                        }
                    }
                } else {
                    adminRoot.classList.add('hidden');
                    adminRoot.style.cssText = 'display: none !important;';
                    document.body.style.overflow = '';
                }
            } catch (err) {
                console.error('[Guaranteed Admin Route Watcher]:', err);
            }
        }

        function unlockAdminWithPasscode(e) {
            if (e) e.preventDefault();
            const passInput = document.getElementById('admin-passcode-input');
            const lockError = document.getElementById('admin-lock-error');
            const lockScreen = document.getElementById('admin-security-lock-screen');
            if ((passInput?.value || '').trim() === ADMIN_PASSCODE) {
                sessionStorage.setItem(ADMIN_SESSION_KEY, 'authenticated');
                if (lockError) lockError.classList.add('hidden');
                if (lockScreen) {
                    lockScreen.classList.add('hidden');
                    lockScreen.style.cssText = 'display: none !important;';
                }
                if (typeof renderAdminTemplatesList === 'function') {
                    renderAdminTemplatesList();
                }
            } else {
                if (lockError) {
                    lockError.classList.remove('hidden');
                    lockError.style.display = 'block';
                }
                if (passInput) passInput.value = '';
            }
        }

        function exitAdminStudio() {
            if (window.location.hash.includes('/admin/templates')) {
                window.location.hash = '';
            }
            if (window.location.search.includes('admin=templates')) {
                try {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('admin');
                    window.history.replaceState({}, '', url.pathname + (url.hash || ''));
                } catch (_) {}
            }
            const adminRoot = document.getElementById('mestrio-admin-studio-root');
            if (adminRoot) {
                adminRoot.classList.add('hidden');
                adminRoot.style.cssText = 'display: none !important;';
            }
            document.body.style.overflow = '';
            if (typeof renderImageHomeTemplates === 'function') {
                renderImageHomeTemplates();
            }
        }

        function attachAdminListeners() {
            const lockForm = document.getElementById('admin-lock-form');
            if (lockForm) {
                lockForm.onsubmit = unlockAdminWithPasscode;
            }
            const unlockBtn = document.getElementById('admin-unlock-submit-btn');
            if (unlockBtn) {
                unlockBtn.onclick = unlockAdminWithPasscode;
            }
            const lockExitBtn = document.getElementById('admin-lock-exit-btn');
            if (lockExitBtn) {
                lockExitBtn.onclick = exitAdminStudio;
            }
            const headerExitBtn = document.getElementById('admin-btn-exit-studio');
            if (headerExitBtn) {
                headerExitBtn.onclick = exitAdminStudio;
            }
        }

        window.forceMountAdminStudio = forceMountAdminStudio;
        window.checkAdminStudioRoute = forceMountAdminStudio;
        window.exitAdminStudioToLive = exitAdminStudio;

        // Run immediately
        forceMountAdminStudio();
        attachAdminListeners();

        // Run on DOM events
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                forceMountAdminStudio();
                attachAdminListeners();
            });
        }
        window.addEventListener('load', () => {
            forceMountAdminStudio();
            attachAdminListeners();
        });
        window.addEventListener('hashchange', forceMountAdminStudio);
        window.addEventListener('popstate', forceMountAdminStudio);
    })();
    </script>
</body>

</html>`;

if (!html.includes(oldEndBlock)) {
    console.error('Failed to find oldEndBlock');
    process.exit(1);
}
html = html.replace(oldEndBlock, newEndBlock);
console.log('Step 5: End block replaced successfully');

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html successfully updated!');
