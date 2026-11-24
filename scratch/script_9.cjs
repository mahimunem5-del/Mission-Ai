
        (function () {
            // Plan Subscription State Management (Single Global Source of Truth)
            window.getUserPlan = function () {
                const raw = localStorage.getItem('ai_user_plan') || 'Free';
                const lower = raw.trim().toLowerCase();
                if (lower === 'pro') return 'Pro';
                if (lower === 'max') return 'Max';
                return 'Free';
            };

            window.setUserPlan = function (planName) {
                if (!planName) planName = 'Free';
                const lower = planName.trim().toLowerCase();
                let normalized = 'Free';
                if (lower === 'pro') normalized = 'Pro';
                else if (lower === 'max') normalized = 'Max';
                localStorage.setItem('ai_user_plan', normalized);
                updatePlanUI();
            };

            function updatePlanUI() {
                const plan = window.getUserPlan();
                const t = (k, fb) => (typeof window.t === 'function' ? window.t(k, fb) : fb);
                const displayLabel = plan === 'Free' ? t('chat.freePlan', 'Free plan') : (plan === 'Pro' ? t('chat.proPlan', 'Pro plan') : (plan === 'Max' ? t('chat.maxPlan', 'Max plan') : `${plan} plan`));

                // 1. Sidebar bottom-left account plan label
                const sidebarLabel = document.getElementById('sidebar-user-plan-label');
                if (sidebarLabel) {
                    sidebarLabel.textContent = displayLabel;
                }

                // 2. Account dropdown menu plan label
                const menuPlanLabel = document.getElementById('account-menu-plan-label');
                if (menuPlanLabel) {
                    menuPlanLabel.textContent = displayLabel;
                }

                // 3. Main chat top plan indicator & Upgrade button
                const chatPlanLabel = document.getElementById('chat-plan-label');
                const chatSeparator = document.getElementById('chat-plan-upgrade-separator');
                const chatUpgradeBtn = document.getElementById('btn-open-upgrade-screen');

                if (chatPlanLabel) {
                    chatPlanLabel.textContent = displayLabel;
                }

                const isFree = plan === 'Free';
                if (chatSeparator) {
                    chatSeparator.style.display = isFree ? '' : 'none';
                    chatSeparator.classList.toggle('hidden', !isFree);
                }
                if (chatUpgradeBtn) {
                    chatUpgradeBtn.style.display = isFree ? '' : 'none';
                    chatUpgradeBtn.classList.toggle('hidden', !isFree);
                }

                // 4. Settings modal subscription panel and account tab
                const subPlanBadge = document.getElementById('settings-sub-plan-badge');
                if (subPlanBadge) {
                    subPlanBadge.textContent = displayLabel;
                    if (isFree) {
                        subPlanBadge.className = 'text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200';
                    } else if (plan === 'Pro') {
                        subPlanBadge.className = 'text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200';
                    } else {
                        subPlanBadge.className = 'text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 text-white border border-slate-800';
                    }
                }

                const subPlanDesc = document.getElementById('settings-sub-plan-desc');
                if (subPlanDesc) {
                    if (isFree) {
                        subPlanDesc.textContent = t('settings.freePlanDesc', 'Standard rate limits and frontier reasoning models for everyday productivity.');
                    } else if (plan === 'Pro') {
                        subPlanDesc.textContent = t('settings.proPlanDesc', 'Unlimited access to GPT-5.6, Claude 3.7, Deep Research, and high-res Image Studio.');
                    } else {
                        subPlanDesc.textContent = t('settings.maxPlanDesc', 'Maximum rate limits, 1M token context windows, peak priority processing, and 24/7 support.');
                    }
                }

                const subActionBtn = document.getElementById('settings-sub-action-btn');
                if (subActionBtn) {
                    if (isFree) {
                        subActionBtn.textContent = t('account.upgradePlan', 'Upgrade plan');
                        subActionBtn.className = 'px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer shrink-0';
                    } else {
                        subActionBtn.textContent = t('common.manage', 'Manage plan');
                        subActionBtn.className = 'px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer shrink-0';
                    }
                }

                const accountPlanBadge = document.getElementById('settings-account-plan-badge');
                if (accountPlanBadge) {
                    accountPlanBadge.textContent = displayLabel;
                }

                if (typeof renderModelDropdownOptions === 'function') {
                    renderModelDropdownOptions();
                }
                if (typeof renderProjectModelOptions === 'function') {
                    renderProjectModelOptions();
                }
                if (typeof renderProjectActiveModelOptions === 'function') {
                    renderProjectActiveModelOptions();
                }
            }
            window.updatePlanUI = updatePlanUI;

            // Sync with changes from other tabs or windows
            window.addEventListener('storage', (e) => {
                if (e.key === 'ai_user_plan') {
                    updatePlanUI();
                }
            });

            // Immediate initial pass
            updatePlanUI();

            function initUpgradeModal() {
                const modal = document.getElementById('plan-selection-modal');
                const openBtn = document.getElementById('btn-open-upgrade-screen');
                const closeBtn = document.getElementById('close-upgrade-modal-btn');
                const toggleMonthly = document.getElementById('upgrade-toggle-monthly');
                const toggleAnnual = document.getElementById('upgrade-toggle-annual');
                const proPrice = document.getElementById('plan-pro-price');
                const proSubtext = document.getElementById('plan-pro-subtext');
                const maxPrice = document.getElementById('plan-max-price');
                const maxSubtext = document.getElementById('plan-max-subtext');
                const planBtns = document.querySelectorAll('.btn-select-plan');

                if (!modal) return;

                window.openUpgradeModal = function () {
                    modal.classList.remove('hidden');
                    document.body.style.overflow = 'hidden';
                };

                window.closeUpgradeModal = function () {
                    modal.classList.add('hidden');
                    document.body.style.overflow = '';
                    if (window._openedPlanFromSettings) {
                        window._openedPlanFromSettings = false;
                        if (typeof window.openSettings === 'function') {
                            window.openSettings('subscription');
                        }
                    }
                };

                openBtn?.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.openUpgradeModal();
                });

                const pillContainer = document.getElementById('chat-plan-pill-container');
                pillContainer?.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.openUpgradeModal();
                });

                closeBtn?.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.closeUpgradeModal();
                });

                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        window.closeUpgradeModal();
                    }
                });

                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                        window.closeUpgradeModal();
                    }
                });

                function setBilling(annual) {
                    if (annual) {
                        toggleAnnual?.classList.add('bg-white', 'shadow-xs', 'text-slate-900', 'font-semibold');
                        toggleAnnual?.classList.remove('text-slate-500');
                        toggleMonthly?.classList.remove('bg-white', 'shadow-xs', 'text-slate-900', 'font-semibold');
                        toggleMonthly?.classList.add('text-slate-500');

                        if (proPrice) proPrice.textContent = '$16';
                        if (proSubtext) proSubtext.textContent = 'Billed annually ($192/yr)';
                        if (maxPrice) maxPrice.textContent = '$48';
                        if (maxSubtext) maxSubtext.textContent = 'Billed annually ($576/yr)';
                    } else {
                        toggleMonthly?.classList.add('bg-white', 'shadow-xs', 'text-slate-900', 'font-semibold');
                        toggleMonthly?.classList.remove('text-slate-500');
                        toggleAnnual?.classList.remove('bg-white', 'shadow-xs', 'text-slate-900', 'font-semibold');
                        toggleAnnual?.classList.add('text-slate-500');

                        if (proPrice) proPrice.textContent = '$20';
                        if (proSubtext) proSubtext.textContent = 'Billed monthly';
                        if (maxPrice) maxPrice.textContent = '$60';
                        if (maxSubtext) maxSubtext.textContent = 'Billed monthly';
                    }
                }

                toggleMonthly?.addEventListener('click', () => setBilling(false));
                toggleAnnual?.addEventListener('click', () => setBilling(true));

                planBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const planName = btn.dataset.plan || 'Pro';
                        window.setUserPlan(planName);
                        window.closeUpgradeModal();
                    });
                });
            }

            function initAccountMenu() {
                const trigger = document.querySelector('.sidebar-profile-area');
                const menu = document.getElementById('account-dropdown-menu');
                const appearanceWrapper = document.getElementById('account-menu-appearance-wrapper');
                const appearanceBtn = document.getElementById('account-menu-appearance');
                const appearanceSubmenu = document.getElementById('appearance-submenu');
                const languageWrapper = document.getElementById('account-menu-language-wrapper');
                const languageBtn = document.getElementById('account-menu-language');
                const languageSubmenu = document.getElementById('language-submenu');
                const settingsBtn = document.getElementById('account-menu-settings');
                const helpBtn = document.getElementById('account-menu-help');
                const upgradeBtn = document.getElementById('account-menu-upgrade');
                const logoutBtn = document.getElementById('account-menu-logout');

                if (!trigger || !menu) return;

                // Set authentic user email if available
                const userEmail = window.currentUser?.email || localStorage.getItem('user_email') || localStorage.getItem('auth_email');
                const emailEl = document.getElementById('account-menu-email');
                if (emailEl && userEmail) {
                    emailEl.textContent = userEmail;
                    emailEl.classList.remove('hidden');
                }

                function positionAccountMenu() {
                    const rect = trigger.getBoundingClientRect();
                    const bottomGap = window.innerHeight - rect.top + 8;
                    menu.style.bottom = `${bottomGap}px`;
                    if (document.documentElement.getAttribute('dir') === 'rtl') {
                        menu.style.left = 'auto';
                        menu.style.right = `${Math.max(12, window.innerWidth - rect.right)}px`;
                    } else {
                        menu.style.right = 'auto';
                        menu.style.left = `${Math.max(12, rect.left)}px`;
                    }
                }

                function openAccountMenu() {
                    positionAccountMenu();
                    menu.classList.remove('hidden');
                    trigger.setAttribute('aria-expanded', 'true');
                }

                function closeAccountMenu() {
                    menu.classList.add('hidden');
                    closeSubmenus();
                    trigger.setAttribute('aria-expanded', 'false');
                }

                function toggleAccountMenu(e) {
                    e.stopPropagation();
                    if (menu.classList.contains('hidden')) {
                        openAccountMenu();
                    } else {
                        closeAccountMenu();
                    }
                }

                function closeSubmenus() {
                    appearanceSubmenu?.classList.add('hidden');
                    languageSubmenu?.classList.add('hidden');
                }

                trigger.addEventListener('click', toggleAccountMenu);

                // Settings
                settingsBtn?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    closeAccountMenu();
                    if (typeof window.showSettingsModal === 'function') {
                        window.showSettingsModal(true);
                    } else if (typeof window.openSettings === 'function') {
                        window.openSettings();
                    } else if (typeof showStudioToast === 'function') {
                        showStudioToast('Settings coming soon');
                    }
                });

                // Help
                helpBtn?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    closeAccountMenu();
                    if (typeof window.openHelp === 'function') {
                        window.openHelp();
                    } else if (typeof showStudioToast === 'function') {
                        showStudioToast('Help & Support coming soon');
                    }
                });

                // Upgrade plan
                upgradeBtn?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    closeAccountMenu();
                    if (typeof window.openUpgradeModal === 'function') {
                        window.openUpgradeModal();
                    }
                });

                // Log out
                logoutBtn?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    closeAccountMenu();
                    if (typeof window.logout === 'function') {
                        window.logout();
                    } else if (typeof window.handleLogout === 'function') {
                        window.handleLogout();
                    } else {
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('user_email');
                        if (typeof showStudioToast === 'function') {
                            showStudioToast('Logged out');
                        }
                    }
                });

                // Appearance Submenu behavior
                function toggleAppearanceSubmenu(show) {
                    if (show) {
                        appearanceSubmenu?.classList.remove('hidden');
                        languageSubmenu?.classList.add('hidden');
                    } else {
                        appearanceSubmenu?.classList.add('hidden');
                    }
                }

                appearanceBtn?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isHidden = appearanceSubmenu?.classList.contains('hidden');
                    toggleAppearanceSubmenu(isHidden);
                });

                appearanceWrapper?.addEventListener('mouseenter', () => {
                    toggleAppearanceSubmenu(true);
                });

                // Language Submenu behavior
                function toggleLanguageSubmenu(show) {
                    if (show) {
                        languageSubmenu?.classList.remove('hidden');
                        appearanceSubmenu?.classList.add('hidden');
                        if (languageSubmenu) {
                            const rect = languageSubmenu.getBoundingClientRect();
                            if (rect.bottom > window.innerHeight - 12) {
                                const diff = rect.bottom - (window.innerHeight - 12);
                                languageSubmenu.style.bottom = `${diff}px`;
                            } else {
                                languageSubmenu.style.bottom = '';
                            }
                        }
                    } else {
                        languageSubmenu?.classList.add('hidden');
                        if (languageSubmenu) languageSubmenu.style.bottom = '';
                    }
                }

                languageBtn?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isHidden = languageSubmenu?.classList.contains('hidden');
                    toggleLanguageSubmenu(isHidden);
                });

                languageWrapper?.addEventListener('mouseenter', () => {
                    toggleLanguageSubmenu(true);
                });

                // Close submenus on hovering other items
                [settingsBtn, helpBtn, upgradeBtn, logoutBtn].forEach(btn => {
                    btn?.addEventListener('mouseenter', closeSubmenus);
                });

                // Theme options in dropdown
                document.querySelectorAll('.appearance-opt').forEach(opt => {
                    opt.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const theme = opt.dataset.theme;
                        if (theme) {
                            setAppearance(theme);
                        }
                    });
                });

                // Language option click in dropdown
                document.querySelectorAll('.language-opt').forEach(opt => {
                    opt.addEventListener('click', (e) => {
                        e.stopPropagation();
                        closeSubmenus();
                    });
                });

                // Global Dismissals (Click outside and Escape)
                document.addEventListener('click', (e) => {
                    if (menu.classList.contains('hidden')) return;
                    if (!menu.contains(e.target) && !trigger.contains(e.target)) {
                        closeAccountMenu();
                    }
                });

                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && !menu.classList.contains('hidden')) {
                        closeAccountMenu();
                    }
                });

                window.addEventListener('resize', () => {
                    if (!menu.classList.contains('hidden')) {
                        positionAccountMenu();
                    }
                });
            }

            // Theme switching logic (Light, Dark, System) - Global across App and Settings
            function applyTheme(theme) {
                const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                }
            }
            window.applyTheme = applyTheme;

            function updateAppearanceUI(theme) {
                // Dropdown menu check icons
                document.querySelectorAll('.appearance-check-icon').forEach(icon => {
                    if (icon.getAttribute('data-check') === theme) {
                        icon.classList.remove('hidden');
                    } else {
                        icon.classList.add('hidden');
                    }
                });

                // Settings modal appearance cards
                document.querySelectorAll('.settings-appearance-card').forEach(card => {
                    const cardTheme = card.getAttribute('data-theme');
                    const isSelected = cardTheme === theme;
                    const checkIcon = card.querySelector('.settings-theme-check');
                    if (isSelected) {
                        card.classList.add('border-blue-600', 'bg-blue-50/40', 'ring-1', 'ring-blue-600/30', 'text-blue-900');
                        card.classList.remove('border-slate-200', 'bg-white', 'text-slate-700');
                        if (checkIcon) checkIcon.classList.remove('hidden');
                    } else {
                        card.classList.remove('border-blue-600', 'bg-blue-50/40', 'ring-1', 'ring-blue-600/30', 'text-blue-900');
                        card.classList.add('border-slate-200', 'bg-white', 'text-slate-700');
                        if (checkIcon) checkIcon.classList.add('hidden');
                    }
                });
            }
            window.updateAppearanceUI = updateAppearanceUI;

            function setAppearance(theme) {
                localStorage.setItem('ai_appearance_mode', theme);
                applyTheme(theme);
                updateAppearanceUI(theme);
            }
            window.setAppearance = setAppearance;

            if (window.matchMedia) {
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                    if ((localStorage.getItem('ai_appearance_mode') || 'system') === 'system') {
                        applyTheme('system');
                    }
                });
            }

            // Global Account Display Name Synchronization
            function updateAccountNameUI(name) {
                if (!name) name = localStorage.getItem('ai_user_name') || 'Munem Mahi';
                const initial = name.charAt(0).toUpperCase();

                const sidebarName = document.getElementById('sidebar-user-name');
                if (sidebarName) sidebarName.textContent = name;

                const sidebarAvatar = document.getElementById('sidebar-user-avatar');
                if (sidebarAvatar) sidebarAvatar.textContent = initial;

                const menuName = document.getElementById('account-menu-name');
                if (menuName) menuName.textContent = name;

                const menuAvatar = document.getElementById('account-menu-avatar');
                if (menuAvatar) menuAvatar.textContent = initial;

                const settingsNameVal = document.getElementById('settings-name-val');
                if (settingsNameVal) settingsNameVal.textContent = name;

                const settingsAccountName = document.getElementById('settings-account-name');
                if (settingsAccountName) settingsAccountName.textContent = name;

                const settingsAccountAvatar = document.getElementById('settings-account-avatar');
                if (settingsAccountAvatar) settingsAccountAvatar.textContent = initial;

                const heroGreeting = document.getElementById('hero-greeting-name');
                if (heroGreeting) {
                    const firstName = name.split(' ')[0] || name;
                    const currentText = heroGreeting.textContent;
                    if (currentText.includes(',')) {
                        const prefix = currentText.split(',')[0];
                        heroGreeting.textContent = `${prefix}, ${firstName}`;
                    }
                }
            }
            window.updateAccountNameUI = updateAccountNameUI;

            // Global Account Email Synchronization
            function updateAccountEmailUI(email) {
                if (!email) {
                    email = window.currentUser?.email || localStorage.getItem('user_email') || localStorage.getItem('auth_email') || 'munem.mahi@example.com';
                }
                const menuEmail = document.getElementById('account-menu-email');
                if (menuEmail) {
                    menuEmail.textContent = email;
                    menuEmail.classList.remove('hidden');
                }
                const settingsEmail = document.getElementById('settings-email-val');
                if (settingsEmail) settingsEmail.textContent = email;

                const settingsAccountEmail = document.getElementById('settings-account-email');
                if (settingsAccountEmail) settingsAccountEmail.textContent = email;
            }
            window.updateAccountEmailUI = updateAccountEmailUI;

            // Settings Modal Controller
            function initSettingsModal() {
                const modal = document.getElementById('settings-modal');
                const closeBtn = document.getElementById('close-settings-modal-btn');
                const tabs = document.querySelectorAll('.settings-nav-tab');
                const panels = document.querySelectorAll('.settings-panel');

                if (!modal) return;

                function switchSettingsTab(tabName) {
                    tabs.forEach(tab => {
                        const isTarget = tab.dataset.tab === tabName;
                        if (isTarget) {
                            tab.className = 'settings-nav-tab w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-slate-900 bg-white shadow-2xs border border-slate-200/80';
                        } else {
                            tab.className = 'settings-nav-tab w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-white/60';
                        }
                    });

                    panels.forEach(panel => {
                        if (panel.id === `settings-panel-${tabName}`) {
                            panel.classList.remove('hidden');
                        } else {
                            panel.classList.add('hidden');
                        }
                    });
                }

                tabs.forEach(tab => {
                    tab.addEventListener('click', (e) => {
                        e.preventDefault();
                        switchSettingsTab(tab.dataset.tab);
                    });
                });

                window.isSettingsOpen = false;

                window.showSettingsModal = function (show = true, initialTab = 'general') {
                    window.isSettingsOpen = Boolean(show);
                    if (window.isSettingsOpen) {
                        modal.classList.remove('hidden', 'pointer-events-none');
                        modal.style.display = 'flex';
                        modal.style.pointerEvents = 'auto';
                        modal.style.visibility = 'visible';
                        modal.style.opacity = '1';
                        document.body.style.overflow = 'hidden';
                        switchSettingsTab(initialTab);
                        updateAccountNameUI();
                        updateAccountEmailUI();
                        updatePlanUI();
                        const currentTheme = localStorage.getItem('ai_appearance_mode') || 'system';
                        updateAppearanceUI(currentTheme);
                        if (typeof window.updateSettingsLanguageUI === 'function') {
                            window.updateSettingsLanguageUI();
                        }
                        if (typeof window.updateWorkspaceDropdownUI === 'function') {
                            window.updateWorkspaceDropdownUI();
                        }
                    } else {
                        modal.classList.add('hidden');
                        modal.style.display = 'none';
                        modal.style.pointerEvents = 'none';
                        modal.style.visibility = 'hidden';
                        modal.style.opacity = '0';
                        document.body.style.overflow = '';
                        exitNameEditMode();
                    }
                };

                window.openSettings = function (initialTab = 'general') {
                    window.showSettingsModal(true, initialTab);
                };

                window.closeSettings = function () {
                    window.showSettingsModal(false);
                };

                // Defensive wiring for triggers
                const userProfileBtn = document.getElementById('userProfileBtn');
                userProfileBtn?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (typeof closeAccountMenu === 'function') closeAccountMenu();
                    window.showSettingsModal(!window.isSettingsOpen);
                });

                const avatarBtn = document.getElementById('sidebar-user-avatar');
                avatarBtn?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (typeof closeAccountMenu === 'function') closeAccountMenu();
                    window.showSettingsModal(true);
                });

                closeBtn?.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.closeSettings();
                });

                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        window.closeSettings();
                    }
                });

                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && window.isSettingsOpen) {
                        window.closeSettings();
                    }
                });

                // 1. General Tab Name Editing
                const nameValSpan = document.getElementById('settings-name-val');
                const nameEditBtn = document.getElementById('settings-name-edit-btn');
                const nameViewWrap = document.getElementById('settings-name-view');
                const nameEditForm = document.getElementById('settings-name-edit-form');
                const nameInput = document.getElementById('settings-name-input');
                const nameSaveBtn = document.getElementById('settings-name-save-btn');
                const nameCancelBtn = document.getElementById('settings-name-cancel-btn');

                function enterNameEditMode() {
                    if (!nameEditForm || !nameViewWrap) return;
                    nameInput.value = localStorage.getItem('ai_user_name') || 'Munem Mahi';
                    nameEditForm.classList.remove('hidden');
                    nameViewWrap.classList.add('hidden');
                    nameInput.focus();
                }

                function exitNameEditMode() {
                    if (!nameEditForm || !nameViewWrap) return;
                    nameEditForm.classList.add('hidden');
                    nameViewWrap.classList.remove('hidden');
                }

                nameEditBtn?.addEventListener('click', enterNameEditMode);
                nameCancelBtn?.addEventListener('click', exitNameEditMode);

                nameSaveBtn?.addEventListener('click', () => {
                    const val = (nameInput.value || '').trim();
                    const finalName = val.length > 0 ? val : 'Munem Mahi';
                    localStorage.setItem('ai_user_name', finalName);
                    updateAccountNameUI(finalName);
                    exitNameEditMode();
                });

                nameInput?.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        nameSaveBtn.click();
                    } else if (e.key === 'Escape') {
                        exitNameEditMode();
                    }
                });

                const WORKSPACE_LABELS = {
                    'chat': 'Main Chat / Home',
                    'image-studio': 'Image Studio',
                    'slides-studio': 'Slides Studio',
                    'projects': 'Projects'
                };

                function getDefaultWorkspace() {
                    const stored = localStorage.getItem('ai_default_workspace') || 'chat';
                    return (stored === 'code' || stored === 'code-studio') ? 'chat' : stored;
                }
                window.getDefaultWorkspace = getDefaultWorkspace;

                function setDefaultWorkspace(workspaceKey) {
                    const valid = ['chat', 'image-studio', 'slides-studio', 'projects'];
                    const key = valid.includes(workspaceKey) ? workspaceKey : 'chat';
                    localStorage.setItem('ai_default_workspace', key);
                    updateWorkspaceDropdownUI(key);
                }
                window.setDefaultWorkspace = setDefaultWorkspace;

                function updateWorkspaceDropdownUI(activeKey) {
                    if (!activeKey) activeKey = getDefaultWorkspace();
                    const labelEl = document.getElementById('workspace-dropdown-selected-label');
                    if (labelEl) {
                        labelEl.textContent = WORKSPACE_LABELS[activeKey] || 'Main Chat / Home';
                    }

                    const opts = document.querySelectorAll('.workspace-opt');
                    opts.forEach(opt => {
                        const isSelected = opt.dataset.workspace === activeKey;
                        const check = opt.querySelector('.workspace-check');
                        opt.setAttribute('aria-selected', isSelected ? 'true' : 'false');
                        if (isSelected) {
                            opt.classList.add('text-slate-900', 'font-semibold');
                            opt.classList.remove('text-slate-700', 'font-normal');
                            if (check) check.classList.remove('hidden');
                        } else {
                            opt.classList.remove('text-slate-900', 'font-semibold');
                            opt.classList.add('text-slate-700', 'font-normal');
                            if (check) check.classList.add('hidden');
                        }
                    });
                }
                window.updateWorkspaceDropdownUI = updateWorkspaceDropdownUI;

                function initWorkspaceDropdown() {
                    const wrapper = document.getElementById('workspace-dropdown-wrapper');
                    const btn = document.getElementById('workspace-dropdown-btn');
                    const menu = document.getElementById('workspace-dropdown-menu');
                    const chevron = document.getElementById('workspace-dropdown-chevron');

                    if (!wrapper || !btn || !menu) return;

                    function openMenu() {
                        menu.classList.remove('hidden');
                        btn.setAttribute('aria-expanded', 'true');
                        if (chevron) chevron.classList.add('rotate-180');
                    }

                    function closeMenu() {
                        menu.classList.add('hidden');
                        btn.setAttribute('aria-expanded', 'false');
                        if (chevron) chevron.classList.remove('rotate-180');
                    }

                    function toggleMenu() {
                        if (menu.classList.contains('hidden')) {
                            openMenu();
                        } else {
                            closeMenu();
                        }
                    }

                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        toggleMenu();
                    });

                    const allOpts = Array.from(document.querySelectorAll('.workspace-opt'));
                    allOpts.forEach((opt, idx) => {
                        opt.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const ws = opt.dataset.workspace;
                            if (ws) {
                                setDefaultWorkspace(ws);
                            }
                            closeMenu();
                            btn.focus();
                        });

                        opt.addEventListener('keydown', (e) => {
                            if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                const next = allOpts[(idx + 1) % allOpts.length];
                                next?.focus();
                            } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                const prev = allOpts[(idx - 1 + allOpts.length) % allOpts.length];
                                prev?.focus();
                            } else if (e.key === 'Escape') {
                                e.preventDefault();
                                closeMenu();
                                btn.focus();
                            }
                        });
                    });

                    btn.addEventListener('keydown', (e) => {
                        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openMenu();
                            const firstOpt = menu.querySelector('.workspace-opt');
                            firstOpt?.focus();
                        } else if (e.key === 'Escape') {
                            closeMenu();
                        }
                    });

                    document.addEventListener('click', (e) => {
                        if (!wrapper.contains(e.target)) {
                            closeMenu();
                        }
                    });

                    document.addEventListener('keydown', (e) => {
                        if (e.key === 'Escape' && !menu.classList.contains('hidden')) {
                            closeMenu();
                        }
                    });

                    updateWorkspaceDropdownUI();
                }

                initWorkspaceDropdown();

                // Wire up account panel edit profile button
                const accountEditProfileBtn = document.getElementById('settings-account-edit-profile-btn');
                accountEditProfileBtn?.addEventListener('click', () => {
                    switchSettingsTab('general');
                    enterNameEditMode();
                });

                // 2. Appearance Options Click in Settings
                document.querySelectorAll('.settings-appearance-card').forEach(card => {
                    card.addEventListener('click', (e) => {
                        e.preventDefault();
                        const theme = card.dataset.theme;
                        if (theme && typeof setAppearance === 'function') {
                            setAppearance(theme);
                        }
                    });
                });

                // 3. Notifications & Privacy Toggles
                function setupToggle(btnId, storageKey, defaultVal = true) {
                    const btn = document.getElementById(btnId);
                    if (!btn) return;

                    function getVal() {
                        const stored = localStorage.getItem(storageKey);
                        return stored !== null ? stored === 'true' : defaultVal;
                    }

                    function setVal(val) {
                        localStorage.setItem(storageKey, val.toString());
                        renderVal(val);
                    }

                    function renderVal(val) {
                        const knob = btn.querySelector('.toggle-knob');
                        if (val) {
                            btn.classList.add('bg-blue-600');
                            btn.classList.remove('bg-slate-200');
                            btn.setAttribute('aria-checked', 'true');
                            if (knob) {
                                knob.classList.add('translate-x-4');
                                knob.classList.remove('translate-x-0.5');
                            }
                        } else {
                            btn.classList.remove('bg-blue-600');
                            btn.classList.add('bg-slate-200');
                            btn.setAttribute('aria-checked', 'false');
                            if (knob) {
                                knob.classList.remove('translate-x-4');
                                knob.classList.add('translate-x-0.5');
                            }
                        }
                    }

                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const newVal = !getVal();
                        setVal(newVal);
                    });

                    renderVal(getVal());
                }

                setupToggle('settings-toggle-updates', 'ai_notify_updates', true);
                setupToggle('settings-toggle-security', 'ai_notify_security', true);
                setupToggle('settings-toggle-history', 'ai_chat_history_enabled', true);

                // 4. Subscription Action Button (Cleanly transition to Plan view)
                const subActionBtn = document.getElementById('settings-sub-action-btn');
                subActionBtn?.addEventListener('click', (e) => {
                    e.preventDefault();
                    window._openedPlanFromSettings = true;
                    if (typeof window.closeSettings === 'function') {
                        window.closeSettings();
                    }
                    if (typeof window.openUpgradeModal === 'function') {
                        window.openUpgradeModal();
                    }
                });

                // 5. Privacy & Data Export & Delete
                const exportBtn = document.getElementById('settings-export-chats-btn');
                exportBtn?.addEventListener('click', (e) => {
                    e.preventDefault();
                    try {
                        const chats = (typeof chatState !== 'undefined' && Array.isArray(chatState.conversations)) ?
                            chatState.conversations :
                            JSON.parse(localStorage.getItem('mestrio_platform_chats_v1') || '[]');
                        const exportData = {
                            application: 'AI Mestrio',
                            version: '2.4',
                            exportedAt: new Date().toISOString(),
                            user: localStorage.getItem('ai_user_name') || 'Munem Mahi',
                            plan: window.getUserPlan(),
                            conversations: chats
                        };
                        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `ai-mestrio-conversations-${new Date().toISOString().slice(0, 10)}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    } catch (err) {
                        console.error('Export failed:', err);
                    }
                });

                const clearChatsBtn = document.getElementById('settings-clear-chats-btn');
                clearChatsBtn?.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (confirm('Are you sure you want to delete all chat history? This action cannot be undone.')) {
                        const cs = (typeof chatState !== 'undefined') ? chatState : window.chatState;
                        if (cs) {
                            cs.conversations = [];
                            cs.currentConversationId = null;
                            cs.pendingAttachments = [];
                        }

                        // Set flag to prevent any seed/mock chat re-population on reload
                        localStorage.setItem('hasClearedChats', 'true');

                        // Save empty state to storage and wipe any legacy chat keys
                        const emptyPayload = JSON.stringify({
                            conversations: [],
                            currentConversationId: null,
                            selectedModel: (cs && cs.selectedModel) || 'GPT-5.6'
                        });
                        localStorage.setItem('mestrio_platform_chats_v1', emptyPayload);
                        localStorage.removeItem('chats');
                        localStorage.removeItem('recent_chats');
                        localStorage.removeItem('conversations');

                        try {
                            for (let i = localStorage.length - 1; i >= 0; i--) {
                                const k = localStorage.key(i);
                                if (k && k.startsWith('proj_chats_')) {
                                    localStorage.removeItem(k);
                                }
                            }
                        } catch (err) { }

                        // Reset UI active message view to clean initial home dashboard screen
                        if (typeof window.renderCurrentConversation === 'function') {
                            window.renderCurrentConversation();
                        } else {
                            const heroSection = document.getElementById('hero-section');
                            const heroHeader = document.getElementById('hero-header');
                            const heroGlow = document.getElementById('hero-glow');
                            const actionBadges = document.getElementById('action-badges');
                            const messagesContainer = document.getElementById('messages-container');
                            const chatBoxArea = document.getElementById('chat-box-area');
                            const chatInput = document.getElementById('chat-input');
                            const sendBtn = document.getElementById('send-btn');

                            if (heroSection) heroSection.className = 'flex-1 min-h-[calc(100vh-120px)] flex flex-col items-center justify-center -translate-y-10 px-4';
                            const _mobHomeReset = document.getElementById('mobile-home-container');
                            if (_mobHomeReset) _mobHomeReset.classList.remove('hidden');
                            if (heroHeader) {
                                heroHeader.className = 'flex flex-col items-center text-center mb-5 sm:mb-6';
                                heroHeader.classList.remove('hidden');
                            }
                            if (actionBadges) actionBadges.classList.remove('hidden');
                            if (heroGlow) heroGlow.classList.remove('hidden');
                            const _stripReset = document.getElementById('chat-conv-header-strip');
                            if (_stripReset) _stripReset.classList.add('hidden');
                            if (messagesContainer) {
                                messagesContainer.className = 'hidden w-full flex-1 overflow-y-auto min-h-0';
                                messagesContainer.innerHTML = '';
                            }
                            if (chatBoxArea) chatBoxArea.className = 'relative w-full max-w-3xl mx-auto flex flex-col items-center z-10';
                            if (typeof updateChatInputLayout === 'function') updateChatInputLayout(false);
                            // Restore Free plan · Upgrade banner on new chat reset
                            const _fpEl = document.getElementById('chat-free-plan-header');
                            if (_fpEl) {
                                if (typeof currentWorkspace !== 'undefined' && currentWorkspace !== 'chat') {
                                    _fpEl.classList.add('hidden');
                                    _fpEl.style.display = 'none';
                                } else {
                                    _fpEl.classList.remove('hidden');
                                    _fpEl.style.display = '';
                                }
                            }
                            if (chatInput) {
                                chatInput.value = '';
                                chatInput.style.height = 'auto';
                            }
                            if (sendBtn) {
                                sendBtn.classList.add('hidden');
                                sendBtn.classList.remove('flex');
                            }
                        }

                        // Update recent chats list UI
                        if (typeof window.renderRecentChats === 'function') {
                            window.renderRecentChats();
                        } else {
                            const listContainer = document.getElementById('recent-chats-list');
                            if (listContainer) {
                                listContainer.innerHTML = '<div class="px-3 py-4 text-center text-xs text-slate-400">No recent chats yet</div>';
                            }
                        }
                    }
                });

                // 6. Account Tab Actions
                const accountEditBtn = document.getElementById('settings-account-edit-profile-btn');
                accountEditBtn?.addEventListener('click', (e) => {
                    e.preventDefault();
                    switchSettingsTab('general');
                    enterNameEditMode();
                });

                const accountLogoutBtn = document.getElementById('settings-account-logout-btn');
                accountLogoutBtn?.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.closeSettings();
                    if (typeof window.logout === 'function') {
                        window.logout();
                    } else if (typeof window.handleLogout === 'function') {
                        window.handleLogout();
                    } else {
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('user_email');
                    }
                });

                // 7. Delete Account Feature
                const deleteAccountBtn = document.getElementById('settings-account-delete-btn');
                const deleteAccountModal = document.getElementById('delete-account-modal');
                const deleteAccountCloseBtn = document.getElementById('delete-account-close-btn');
                const deleteAccountCancelBtn = document.getElementById('delete-account-cancel-btn');
                const deleteAccountConfirmBtn = document.getElementById('delete-account-confirm-btn');

                function openDeleteAccountModal() {
                    if (deleteAccountModal) {
                        deleteAccountModal.classList.remove('hidden');
                    }
                }

                function closeDeleteAccountModal() {
                    if (deleteAccountModal) {
                        deleteAccountModal.classList.add('hidden');
                    }
                }

                deleteAccountBtn?.addEventListener('click', (e) => {
                    e.preventDefault();
                    openDeleteAccountModal();
                });

                deleteAccountCloseBtn?.addEventListener('click', (e) => {
                    e.preventDefault();
                    closeDeleteAccountModal();
                });

                deleteAccountCancelBtn?.addEventListener('click', (e) => {
                    e.preventDefault();
                    closeDeleteAccountModal();
                });

                deleteAccountModal?.addEventListener('click', (e) => {
                    if (e.target === deleteAccountModal) {
                        closeDeleteAccountModal();
                    }
                });

                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && deleteAccountModal && !deleteAccountModal.classList.contains('hidden')) {
                        closeDeleteAccountModal();
                    }
                });

                deleteAccountConfirmBtn?.addEventListener('click', (e) => {
                    e.preventDefault();
                    try {
                        localStorage.clear();
                        sessionStorage.clear();
                    } catch (err) {
                        console.error('Error clearing storage:', err);
                    }
                    window.location.reload();
                });
            }

            function init() {
                updateAccountNameUI();
                updateAccountEmailUI();
                updatePlanUI();
                initUpgradeModal();
                initAccountMenu();
                initSettingsModal();
                const currentTheme = localStorage.getItem('ai_appearance_mode') || 'system';
                applyTheme(currentTheme);
                updateAppearanceUI(currentTheme);
            }

            // Cross-tab synchronization for appearance, name, and default workspace
            window.addEventListener('storage', (e) => {
                if (e.key === 'ai_appearance_mode' && e.newValue) {
                    applyTheme(e.newValue);
                    updateAppearanceUI(e.newValue);
                } else if (e.key === 'ai_user_name' && e.newValue) {
                    updateAccountNameUI(e.newValue);
                } else if (e.key === 'ai_default_workspace' && e.newValue) {
                    if (typeof window.updateWorkspaceDropdownUI === 'function') {
                        window.updateWorkspaceDropdownUI(e.newValue);
                    }
                }
            });

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', init);
            } else {
                init();
            }
        })();
    