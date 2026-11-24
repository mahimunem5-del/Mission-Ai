
    (function initAdminRouteWatcher() {
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

        // 1. Run immediately on script execution
        forceMountAdminStudio();
        attachAdminListeners();

        // 2. Run on DOMContentLoaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                forceMountAdminStudio();
                attachAdminListeners();
            });
            document.addEventListener('DOMContentLoaded', forceMountAdminStudio);
        }

        // 3. Run on window load
        window.addEventListener('load', () => {
            forceMountAdminStudio();
            attachAdminListeners();
        });
        window.addEventListener('load', forceMountAdminStudio);

        // 4. Run on hashchange & popstate
        window.addEventListener('hashchange', forceMountAdminStudio);
        window.addEventListener('popstate', forceMountAdminStudio);
    })();
    