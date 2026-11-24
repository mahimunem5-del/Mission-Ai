
                (function () {
                    // Prevent duplicate/conflicting external handlers
                    try {
                        Object.defineProperty(window, 'initRecentChatsActions', {
                            value: function () { },
                            writable: false,
                            configurable: true
                        });
                    } catch (e) { }

                    function setupRecentChats() {
                        const listContainer = document.getElementById('recent-chats-list');
                        const sortBtn = document.getElementById('recent-chats-sort-btn');
                        const sortPopover = document.getElementById('recent-chats-sort-popover');
                        const contextMenu = document.getElementById('chat-item-context-menu');
                        const menuPinBtn = document.getElementById('menu-action-pin');
                        const menuPinLabel = document.getElementById('menu-pin-label');
                        const menuRenameBtn = document.getElementById('menu-action-rename');
                        const menuProjectWrapper = document.getElementById('menu-project-wrapper');
                        const menuProjectBtn = document.getElementById('menu-action-project');
                        const menuProjectLabel = document.getElementById('menu-project-label');
                        const menuDeleteBtn = document.getElementById('menu-action-delete');

                        const projectSubmenu = document.getElementById('chat-project-submenu');
                        const projectSearchInput = document.getElementById('project-submenu-search');
                        const projectSubmenuList = document.getElementById('project-submenu-list');
                        const projectRemoveWrapper = document.getElementById('project-submenu-remove-wrapper');
                        const projectRemoveBtn = document.getElementById('project-submenu-remove-btn');

                        const recentsToggleBtn = document.getElementById('recents-toggle-btn');
                        const recentsChevron = document.getElementById('recentsChevron');

                        if (!listContainer || !sortBtn || !sortPopover || !contextMenu) return;

                        // Gemini-Style Collapsible Recents Accordion
                        let isRecentsCollapsed = false;
                        try {
                            isRecentsCollapsed = localStorage.getItem('isRecentsCollapsed') === 'true';
                        } catch (e) { }

                        function updateRecentsAccordion(collapsed) {
                            if (!listContainer || !recentsChevron) return;
                            if (collapsed) {
                                listContainer.classList.add('hidden');
                                recentsChevron.classList.add('-rotate-90', 'collapsed-chevron');
                                if (recentsToggleBtn) recentsToggleBtn.setAttribute('aria-expanded', 'false');
                            } else {
                                listContainer.classList.remove('hidden');
                                recentsChevron.classList.remove('-rotate-90', 'collapsed-chevron');
                                if (recentsToggleBtn) recentsToggleBtn.setAttribute('aria-expanded', 'true');
                            }
                        }

                        updateRecentsAccordion(isRecentsCollapsed);

                        if (recentsToggleBtn && !recentsToggleBtn._hasAccordionListener) {
                            recentsToggleBtn._hasAccordionListener = true;
                            recentsToggleBtn.addEventListener('click', (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                isRecentsCollapsed = !isRecentsCollapsed;
                                try {
                                    localStorage.setItem('isRecentsCollapsed', String(isRecentsCollapsed));
                                } catch (err) { }
                                updateRecentsAccordion(isRecentsCollapsed);
                            });
                        }

                        window.recentChatsSortMode = window.recentChatsSortMode || 'activity';
                        let activeTargetChatRow = null;
                        let submenuCloseTimer = null;

                        // 1. Sort Popover Toggle with Active Tint State
                        function isSortOpen() {
                            return !sortPopover.classList.contains('hidden');
                        }

                        function openSortPopover() {
                            closeContextMenu();
                            sortPopover.classList.remove('hidden');
                            sortBtn.classList.add('sort-btn-active', 'bg-slate-200/80', 'text-slate-800');
                            sortBtn.classList.remove('text-slate-400');
                            sortBtn.setAttribute('aria-expanded', 'true');
                        }

                        function closeSortPopover() {
                            sortPopover.classList.add('hidden');
                            sortBtn.classList.remove('sort-btn-active', 'bg-slate-200/80', 'text-slate-800');
                            sortBtn.classList.add('text-slate-400');
                            sortBtn.setAttribute('aria-expanded', 'false');
                        }

                        function toggleSortPopover(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            if (isSortOpen()) {
                                closeSortPopover();
                            } else {
                                openSortPopover();
                            }
                        }

                        sortBtn.addEventListener('click', toggleSortPopover, true);

                        // 2. Sort Options & Workability
                        function updateSortCheckmarks() {
                            const opts = sortPopover.querySelectorAll('.recent-sort-opt');
                            opts.forEach(opt => {
                                const isSelected = opt.dataset.sort === window.recentChatsSortMode;
                                const checkIcon = opt.querySelector('.sort-check-icon');
                                if (isSelected) {
                                    opt.classList.add('text-slate-900', 'font-medium');
                                    opt.classList.remove('text-slate-600', 'font-normal');
                                    if (checkIcon) checkIcon.classList.remove('hidden');
                                } else {
                                    opt.classList.remove('text-slate-900', 'font-medium');
                                    opt.classList.add('text-slate-600', 'font-normal');
                                    if (checkIcon) checkIcon.classList.add('hidden');
                                }
                            });
                        }

                        function getRowActivityTime(row) {
                            const chatId = row.dataset.chatId;
                            if (chatId && typeof chatState !== 'undefined' && Array.isArray(chatState.conversations)) {
                                const conv = chatState.conversations.find(c => c.id === chatId);
                                if (conv) {
                                    const lastMsg = conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null;
                                    const d = (lastMsg && lastMsg.createdAt) || conv.updatedAt || conv.createdAt;
                                    if (d) return new Date(d).getTime();
                                }
                            }
                            if (row.dataset.timestamp) return Number(row.dataset.timestamp) || 0;
                            if (row.dataset.created) return Number(row.dataset.created) || 0;
                            return 0;
                        }

                        function getRowCreationTime(row) {
                            const chatId = row.dataset.chatId;
                            if (chatId && typeof chatState !== 'undefined' && Array.isArray(chatState.conversations)) {
                                const conv = chatState.conversations.find(c => c.id === chatId);
                                if (conv && conv.createdAt) {
                                    return new Date(conv.createdAt).getTime();
                                }
                            }
                            if (row.dataset.created) return Number(row.dataset.created) || 0;
                            if (row.dataset.timestamp) return Number(row.dataset.timestamp) || 0;
                            return 0;
                        }

                        function sortChatItems() {
                            const items = Array.from(listContainer.querySelectorAll('.chat-item, [data-chat-id]'));
                            if (items.length <= 1) return;

                            const sortMode = window.recentChatsSortMode || 'activity';

                            items.sort((a, b) => {
                                const aPinned = a.dataset.pinned === 'true';
                                const bPinned = b.dataset.pinned === 'true';

                                if (aPinned !== bPinned) {
                                    return aPinned ? -1 : 1;
                                }

                                if (sortMode === 'name') {
                                    const titleA = (a.querySelector('.chat-title-text')?.textContent || a.textContent || '').trim().toLowerCase();
                                    const titleB = (b.querySelector('.chat-title-text')?.textContent || b.textContent || '').trim().toLowerCase();
                                    return titleA.localeCompare(titleB);
                                } else if (sortMode === 'created') {
                                    return getRowCreationTime(b) - getRowCreationTime(a);
                                } else {
                                    return getRowActivityTime(b) - getRowActivityTime(a);
                                }
                            });

                            items.forEach(item => listContainer.appendChild(item));
                        }

                        const sortOptions = sortPopover.querySelectorAll('.recent-sort-opt');
                        sortOptions.forEach(opt => {
                            opt.addEventListener('click', (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.recentChatsSortMode = opt.dataset.sort;
                                updateSortCheckmarks();
                                sortChatItems();
                                closeSortPopover();
                            }, true);
                        });

                        // 3. Project Storage & Association Helpers
                        function getAvailableProjects() {
                            let projs = [];
                            if (typeof loadProjectsFromStorage === 'function') {
                                projs = loadProjectsFromStorage();
                            } else {
                                try {
                                    const raw = localStorage.getItem('mestrio_projects_v1');
                                    if (raw) projs = JSON.parse(raw);
                                } catch (e) { }
                            }
                            if (!Array.isArray(projs) || projs.length === 0) {
                                projs = [
                                    { id: 'proj-demo-1', name: 'Mahi Testing' },
                                    { id: 'proj-demo-2', name: 'dfdf' },
                                    { id: 'proj-demo-3', name: 'efds' }
                                ];
                            }
                            return projs;
                        }

                        function getChatMessages(chatId, chatTitle) {
                            const cleanTitle = (chatTitle || '').trim().toLowerCase();
                            if (typeof chatState !== 'undefined' && Array.isArray(chatState.conversations) && chatState.conversations.length > 0) {
                                const conv = chatState.conversations.find(c =>
                                    (chatId && c.id === chatId) ||
                                    (chatId === 'demo-1' && c.id === 'seed_1') ||
                                    (chatId === 'demo-2' && c.id === 'seed_2') ||
                                    (chatId === 'demo-3' && c.id === 'seed_3') ||
                                    (chatId === 'demo-4' && c.id === 'seed_4') ||
                                    (cleanTitle && c.title && c.title.trim().toLowerCase() === cleanTitle)
                                );
                                if (conv && Array.isArray(conv.messages) && conv.messages.length > 0) {
                                    return JSON.parse(JSON.stringify(conv.messages));
                                }
                            }
                            try {
                                const raw = localStorage.getItem('mestrio_platform_chats_v1');
                                if (raw) {
                                    const parsed = JSON.parse(raw);
                                    if (parsed && Array.isArray(parsed.conversations)) {
                                        const conv = parsed.conversations.find(c =>
                                            (chatId && c.id === chatId) ||
                                            (chatId === 'demo-1' && c.id === 'seed_1') ||
                                            (chatId === 'demo-2' && c.id === 'seed_2') ||
                                            (chatId === 'demo-3' && c.id === 'seed_3') ||
                                            (chatId === 'demo-4' && c.id === 'seed_4') ||
                                            (cleanTitle && c.title && c.title.trim().toLowerCase() === cleanTitle)
                                        );
                                        if (conv && Array.isArray(conv.messages) && conv.messages.length > 0) {
                                            return JSON.parse(JSON.stringify(conv.messages));
                                        }
                                    }
                                }
                            } catch (e) { }
                            if (typeof getInitialSeedConversations === 'function') {
                                const seeds = getInitialSeedConversations();
                                const seedConv = seeds.find(s =>
                                    (chatId && s.id === chatId) ||
                                    (chatId === 'demo-1' && s.id === 'seed_1') ||
                                    (chatId === 'demo-2' && s.id === 'seed_2') ||
                                    (chatId === 'demo-3' && s.id === 'seed_3') ||
                                    (chatId === 'demo-4' && s.id === 'seed_4') ||
                                    (cleanTitle && s.title && s.title.trim().toLowerCase() === cleanTitle)
                                );
                                if (seedConv && Array.isArray(seedConv.messages) && seedConv.messages.length > 0) {
                                    return JSON.parse(JSON.stringify(seedConv.messages));
                                }
                            }
                            const hardcodedSeeds = [
                                {
                                    matchIds: ['demo-1', 'seed_1'],
                                    title: 'Website analysis for my startup',
                                    messages: [
                                        { id: 'm1_1', role: 'user', content: 'Can you analyze the website design and structure for my startup?', createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
                                        { id: 'm1_2', role: 'assistant', content: 'Here is a comprehensive website analysis: Your hero headline is punchy, the call-to-action button is well-placed, and the clean typography ensures high readability.', createdAt: new Date(Date.now() - 2 * 3600 * 1000 + 1000).toISOString() }
                                    ]
                                },
                                {
                                    matchIds: ['demo-2', 'seed_2'],
                                    title: 'Create a cinematic portrait',
                                    messages: [
                                        { id: 'm2_1', role: 'user', content: 'Create a cinematic portrait description with 35mm film aesthetic and golden hour rim lighting.', createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString() },
                                        { id: 'm2_2', role: 'assistant', content: 'Here is a cinematic portrait prompt: 35mm film photography of a contemplative explorer, subtle lens flare, soft sunset rim lighting, shallow depth of field, 8k hyper-detail.', createdAt: new Date(Date.now() - 5 * 3600 * 1000 + 1000).toISOString() }
                                    ]
                                },
                                {
                                    matchIds: ['demo-3', 'seed_3'],
                                    title: 'Compare Claude vs GPT-4',
                                    messages: [
                                        { id: 'm3_1', role: 'user', content: 'Compare Claude vs GPT-4 for code generation and technical writing.', createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
                                        { id: 'm3_2', role: 'assistant', content: 'Both models excel in distinct domains: Claude offers large contextual memory and natural prose, while GPT-4 provides deep reasoning and broad tool ecosystem support.', createdAt: new Date(Date.now() - 24 * 3600 * 1000 + 1000).toISOString() }
                                    ]
                                },
                                {
                                    matchIds: ['demo-4', 'seed_4'],
                                    title: 'Explain this python algorithm',
                                    messages: [
                                        { id: 'm4_1', role: 'user', content: 'Explain this python algorithm: quicksort with randomized pivot selection.', createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString() },
                                        { id: 'm4_2', role: 'assistant', content: 'Randomized Quicksort chooses a random pivot element to achieve average-case time complexity of O(n log n) while avoiding the O(n^2) worst-case on pre-sorted arrays.', createdAt: new Date(Date.now() - 48 * 3600 * 1000 + 1000).toISOString() }
                                    ]
                                }
                            ];
                            const matched = hardcodedSeeds.find(s =>
                                s.matchIds.includes(chatId) || (cleanTitle && s.title.toLowerCase() === cleanTitle)
                            );
                            if (matched) {
                                return JSON.parse(JSON.stringify(matched.messages));
                            }
                            return [];
                        }
                        window.getChatMessages = getChatMessages;

                        function getChatAssignedProjectId(row) {
                            if (!row) return null;
                            if (row.dataset.projectId) return row.dataset.projectId;
                            const chatId = row.dataset.chatId;
                            if (chatId) {
                                if (typeof chatState !== 'undefined' && Array.isArray(chatState.conversations)) {
                                    const conv = chatState.conversations.find(c =>
                                        c.id === chatId ||
                                        (chatId === 'demo-1' && c.id === 'seed_1') ||
                                        (chatId === 'demo-2' && c.id === 'seed_2') ||
                                        (chatId === 'demo-3' && c.id === 'seed_3') ||
                                        (chatId === 'demo-4' && c.id === 'seed_4')
                                    );
                                    if (conv && conv.projectId) {
                                        row.dataset.projectId = conv.projectId;
                                        return conv.projectId;
                                    }
                                }
                                const projs = getAvailableProjects();
                                for (const p of projs) {
                                    let pChats = [];
                                    if (typeof loadProjectChats === 'function') {
                                        pChats = loadProjectChats(p.id) || [];
                                    }
                                    if (Array.isArray(pChats) && pChats.some(c => c.id === chatId)) {
                                        row.dataset.projectId = p.id;
                                        return p.id;
                                    }
                                }
                            }
                            return null;
                        }

                        function addChatToProjectStorage(projectId, chatId, chatTitle) {
                            if (!projectId || !chatId) return;
                            if (typeof chatState !== 'undefined' && Array.isArray(chatState.conversations)) {
                                const conv = chatState.conversations.find(c =>
                                    c.id === chatId ||
                                    (chatId === 'demo-1' && c.id === 'seed_1') ||
                                    (chatId === 'demo-2' && c.id === 'seed_2') ||
                                    (chatId === 'demo-3' && c.id === 'seed_3') ||
                                    (chatId === 'demo-4' && c.id === 'seed_4') ||
                                    (chatTitle && c.title === chatTitle)
                                );
                                if (conv) {
                                    // Single source of truth: assign projectId without resetting or mutating messages
                                    conv.projectId = projectId;
                                    saveToLocalStorage();
                                    return;
                                }
                            }
                            try {
                                const key = 'proj_chats_' + projectId;
                                const pChats = JSON.parse(localStorage.getItem(key) || '[]');
                                const existing = pChats.find(c => c.id === chatId);
                                if (existing) {
                                    existing.title = chatTitle;
                                } else {
                                    pChats.push({
                                        id: chatId,
                                        title: chatTitle,
                                        projectId: projectId,
                                        createdAt: new Date().toISOString(),
                                        messages: []
                                    });
                                }
                                localStorage.setItem(key, JSON.stringify(pChats));
                            } catch (e) { }
                        }

                        function removeChatFromProjectStorage(projectId, chatId) {
                            if (!projectId || !chatId) return;
                            if (typeof chatState !== 'undefined' && Array.isArray(chatState.conversations)) {
                                const conv = chatState.conversations.find(c =>
                                    c.id === chatId ||
                                    (chatId === 'demo-1' && c.id === 'seed_1') ||
                                    (chatId === 'demo-2' && c.id === 'seed_2') ||
                                    (chatId === 'demo-3' && c.id === 'seed_3') ||
                                    (chatId === 'demo-4' && c.id === 'seed_4')
                                );
                                if (conv && conv.projectId === projectId) {
                                    delete conv.projectId;
                                    saveToLocalStorage();
                                }
                            }
                            try {
                                const key = 'proj_chats_' + projectId;
                                let pChats = JSON.parse(localStorage.getItem(key) || '[]');
                                pChats = pChats.filter(c => c.id !== chatId);
                                localStorage.setItem(key, JSON.stringify(pChats));
                            } catch (e) { }
                        }

                        function renderProjectSubmenuList(query = '') {
                            if (!projectSubmenuList) return;
                            const projs = getAvailableProjects();
                            const currentProjId = getChatAssignedProjectId(activeTargetChatRow);
                            const q = query.trim().toLowerCase();

                            const filtered = projs.filter(p => (p.name || '').toLowerCase().includes(q));
                            projectSubmenuList.innerHTML = '';

                            if (filtered.length === 0 && !q) {
                                projectSubmenuList.innerHTML = '<div class="px-3 py-2 text-center text-[11px] text-slate-400">No projects found</div>';
                            } else {
                                filtered.forEach(p => {
                                    const isSelected = p.id === currentProjId;
                                    const item = document.createElement('button');
                                    item.type = 'button';
                                    item.className = `w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer group ${isSelected ? 'bg-blue-50/80 text-blue-900 font-medium' : 'text-slate-700 hover:bg-slate-100/70 hover:text-slate-900'
                                        }`;
                                    item.innerHTML = `
                                    <div class="flex items-center gap-2 min-w-0 flex-1">
                                        <svg class="w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} shrink-0 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                                        </svg>
                                        <span class="truncate text-xs">${p.name || 'Untitled project'}</span>
                                    </div>
                                    ${isSelected ? '<svg class="w-3.5 h-3.5 text-blue-600 shrink-0 ml-2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
                                `;

                                    item.addEventListener('click', (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        selectProjectForChat(p);
                                    });

                                    projectSubmenuList.appendChild(item);
                                });
                            }

                            // Create project option if searching and not exact match
                            if (q && !projs.some(p => (p.name || '').toLowerCase() === q)) {
                                const createBtn = document.createElement('button');
                                createBtn.type = 'button';
                                createBtn.className = 'w-full flex items-center gap-2 px-2.5 py-1.5 mt-0.5 rounded-lg text-left text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer text-xs font-medium border-t border-slate-100';
                                createBtn.innerHTML = `
                                <svg class="w-3.5 h-3.5 text-blue-600 shrink-0 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                <span class="truncate">Create project "${query.trim()}"</span>
                            `;
                                createBtn.addEventListener('click', (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const newProj = {
                                        id: 'proj_' + Date.now(),
                                        name: query.trim(),
                                        createdAt: new Date().toISOString(),
                                        isPinned: false
                                    };
                                    const existing = getAvailableProjects();
                                    existing.unshift(newProj);
                                    if (typeof saveProjectsToStorage === 'function') {
                                        saveProjectsToStorage(existing);
                                    } else {
                                        try { localStorage.setItem('mestrio_projects_v1', JSON.stringify(existing)); } catch (err) { }
                                    }
                                    selectProjectForChat(newProj);
                                });
                                projectSubmenuList.appendChild(createBtn);
                            }

                            if (projectRemoveWrapper) {
                                if (currentProjId) {
                                    projectRemoveWrapper.classList.remove('hidden');
                                } else {
                                    projectRemoveWrapper.classList.add('hidden');
                                }
                            }
                        }

                        function selectProjectForChat(project) {
                            if (!activeTargetChatRow || !project) return;
                            const chatId = activeTargetChatRow.dataset.chatId || `chat-${Date.now()}`;
                            const chatTitle = activeTargetChatRow.querySelector('.chat-title-text')?.textContent.trim() || 'Chat';

                            const oldProjId = getChatAssignedProjectId(activeTargetChatRow);
                            if (oldProjId && oldProjId !== project.id) {
                                removeChatFromProjectStorage(oldProjId, chatId);
                            }

                            activeTargetChatRow.dataset.projectId = project.id;

                            if (chatId && typeof chatState !== 'undefined' && Array.isArray(chatState.conversations)) {
                                const conv = chatState.conversations.find(c =>
                                    c.id === chatId ||
                                    (chatId === 'demo-1' && c.id === 'seed_1') ||
                                    (chatId === 'demo-2' && c.id === 'seed_2') ||
                                    (chatId === 'demo-3' && c.id === 'seed_3') ||
                                    (chatId === 'demo-4' && c.id === 'seed_4') ||
                                    c.title === chatTitle
                                );
                                if (conv) {
                                    // Single source of truth: assign projectId without resetting or mutating messages
                                    conv.projectId = project.id;
                                    if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
                                }
                            }
                            addChatToProjectStorage(project.id, chatId, chatTitle);

                            // Silent background update - no toast popup
                            if (typeof currentActiveProjectId !== 'undefined' && currentActiveProjectId === project.id) {
                                if (typeof renderProjectChatsList === 'function') {
                                    renderProjectChatsList(project.id);
                                }
                            }

                            closeProjectSubmenu();
                            closeContextMenu();
                        }

                        projectRemoveBtn?.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!activeTargetChatRow) return;

                            const chatId = activeTargetChatRow.dataset.chatId;
                            const currentProjId = getChatAssignedProjectId(activeTargetChatRow);
                            if (currentProjId && chatId) {
                                removeChatFromProjectStorage(currentProjId, chatId);
                            }

                            delete activeTargetChatRow.dataset.projectId;

                            if (chatId && typeof chatState !== 'undefined' && Array.isArray(chatState.conversations)) {
                                const conv = chatState.conversations.find(c =>
                                    c.id === chatId ||
                                    (chatId === 'demo-1' && c.id === 'seed_1') ||
                                    (chatId === 'demo-2' && c.id === 'seed_2') ||
                                    (chatId === 'demo-3' && c.id === 'seed_3') ||
                                    (chatId === 'demo-4' && c.id === 'seed_4')
                                );
                                if (conv) {
                                    delete conv.projectId;
                                    if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
                                }
                            }

                            // Silent background update - no toast popup
                            if (typeof currentActiveProjectId !== 'undefined' && currentActiveProjectId === currentProjId) {
                                if (typeof renderProjectChatsList === 'function') {
                                    renderProjectChatsList(currentProjId);
                                }
                            }

                            closeProjectSubmenu();
                            closeContextMenu();
                        });

                        projectSearchInput?.addEventListener('input', (e) => {
                            renderProjectSubmenuList(e.target.value);
                        });

                        function openProjectSubmenu() {
                            if (!projectSubmenu || !contextMenu || contextMenu.classList.contains('hidden')) return;
                            clearTimeout(submenuCloseTimer);

                            if (projectSearchInput) projectSearchInput.value = '';
                            renderProjectSubmenuList('');

                            const parentRect = contextMenu.getBoundingClientRect();
                            const submenuWidth = 256;
                            let left = parentRect.right + 4;
                            if (left + submenuWidth > window.innerWidth - 8) {
                                left = parentRect.left - submenuWidth - 4;
                            }

                            const targetBtnRect = (menuProjectBtn || menuProjectWrapper).getBoundingClientRect();
                            let top = targetBtnRect.top - 6;
                            if (top + 260 > window.innerHeight - 8) {
                                top = Math.max(8, window.innerHeight - 268);
                            }

                            projectSubmenu.style.left = `${Math.max(8, left)}px`;
                            projectSubmenu.style.top = `${top}px`;
                            projectSubmenu.classList.remove('hidden');

                            setTimeout(() => {
                                if (projectSearchInput) projectSearchInput.focus();
                            }, 50);
                        }

                        function closeProjectSubmenu() {
                            if (projectSubmenu) {
                                projectSubmenu.classList.add('hidden');
                            }
                        }

                        // Hover and Click Triggers for Project Option
                        menuProjectWrapper?.addEventListener('mouseenter', () => {
                            clearTimeout(submenuCloseTimer);
                            openProjectSubmenu();
                        });

                        menuProjectBtn?.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (projectSubmenu && !projectSubmenu.classList.contains('hidden')) {
                                closeProjectSubmenu();
                            } else {
                                openProjectSubmenu();
                            }
                        });

                        projectSubmenu?.addEventListener('mouseenter', () => {
                            clearTimeout(submenuCloseTimer);
                        });

                        [menuPinBtn, menuRenameBtn, menuDeleteBtn].forEach(btn => {
                            btn?.addEventListener('mouseenter', () => {
                                submenuCloseTimer = setTimeout(() => {
                                    closeProjectSubmenu();
                                }, 100);
                            });
                        });

                        // 4. Chat Row 3-Dot Context Menu
                        function closeContextMenu() {
                            contextMenu.classList.add('hidden');
                            closeProjectSubmenu();
                            activeTargetChatRow = null;
                        }

                        listContainer.addEventListener('click', (e) => {
                            const trigger = e.target.closest('.chat-item-menu-trigger');
                            if (trigger) {
                                e.preventDefault();
                                e.stopPropagation();
                                closeSortPopover();

                                const row = trigger.closest('.chat-item, [data-chat-id]');
                                if (!row) return;

                                activeTargetChatRow = row;
                                const isPinned = row.dataset.pinned === 'true';
                                if (menuPinLabel) {
                                    menuPinLabel.textContent = isPinned ? 'Unpin' : 'Pin';
                                }

                                const assignedProjId = getChatAssignedProjectId(row);
                                if (menuProjectLabel) {
                                    menuProjectLabel.textContent = assignedProjId ? 'Change project' : 'Add to project';
                                }

                                const rect = trigger.getBoundingClientRect();
                                const menuWidth = 176;
                                const left = Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 12);
                                const top = rect.bottom + 4;

                                contextMenu.style.top = `${top}px`;
                                contextMenu.style.left = `${Math.max(12, left)}px`;
                                contextMenu.classList.remove('hidden');
                                closeProjectSubmenu();
                            }
                        }, true);

                        // Context Menu Action: Pin / Unpin
                        menuPinBtn?.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!activeTargetChatRow) return;

                            const row = activeTargetChatRow;
                            const isPinned = row.dataset.pinned === 'true';
                            const nextPinned = !isPinned;
                            row.dataset.pinned = nextPinned ? 'true' : 'false';

                            const titleContainer = row.querySelector('.flex.items-center.gap-2.truncate') || row.firstElementChild;
                            let pinIcon = row.querySelector('.chat-pin-icon');

                            if (nextPinned) {
                                if (!pinIcon && titleContainer) {
                                    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                                    svg.setAttribute('class', 'w-3 h-3 text-blue-600 shrink-0 mr-0.5 rotate-45 chat-pin-icon');
                                    svg.setAttribute('viewBox', '0 0 24 24');
                                    svg.setAttribute('fill', 'currentColor');
                                    svg.setAttribute('stroke', 'currentColor');
                                    svg.setAttribute('stroke-width', '2');
                                    svg.setAttribute('stroke-linecap', 'round');
                                    svg.setAttribute('stroke-linejoin', 'round');
                                    svg.innerHTML = '<line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>';
                                    const titleSpan = row.querySelector('.chat-title-text');
                                    if (titleSpan) {
                                        titleContainer.insertBefore(svg, titleSpan);
                                    } else {
                                        titleContainer.appendChild(svg);
                                    }
                                }
                            } else {
                                if (pinIcon) pinIcon.remove();
                            }

                            const chatId = row.dataset.chatId;
                            if (chatId && typeof chatState !== 'undefined' && Array.isArray(chatState.conversations)) {
                                const conv = chatState.conversations.find(c => c.id === chatId);
                                if (conv) {
                                    conv.isPinned = nextPinned;
                                    if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
                                }
                            }

                            closeContextMenu();
                            sortChatItems();
                        }, true);

                        // Context Menu Action: Rename
                        menuRenameBtn?.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!activeTargetChatRow) return;

                            const row = activeTargetChatRow;
                            const titleSpan = row.querySelector('.chat-title-text');
                            if (!titleSpan) {
                                closeContextMenu();
                                return;
                            }

                            closeContextMenu();

                            const originalTitle = titleSpan.textContent.trim();
                            const input = document.createElement('input');
                            input.type = 'text';
                            input.value = originalTitle;
                            input.className = 'w-full bg-white border border-blue-500 rounded px-1.5 py-0.5 text-xs text-slate-800 outline-none shadow-xs font-medium focus:ring-1 focus:ring-blue-500';

                            titleSpan.style.display = 'none';
                            titleSpan.parentNode.insertBefore(input, titleSpan);
                            input.focus();
                            input.select();

                            let committed = false;
                            function commitRename() {
                                if (committed) return;
                                committed = true;
                                const newTitle = input.value.trim() || originalTitle;
                                titleSpan.textContent = newTitle;
                                titleSpan.style.display = '';
                                input.remove();

                                const chatId = row.dataset.chatId;
                                if (chatId && typeof chatState !== 'undefined' && Array.isArray(chatState.conversations)) {
                                    const conv = chatState.conversations.find(c => c.id === chatId);
                                    if (conv) {
                                        conv.title = newTitle;
                                        if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
                                    }
                                }

                                if (window.recentChatsSortMode === 'name') {
                                    sortChatItems();
                                }
                            }

                            function cancelRename() {
                                if (committed) return;
                                committed = true;
                                titleSpan.style.display = '';
                                input.remove();
                            }

                            input.addEventListener('keydown', (evt) => {
                                if (evt.key === 'Enter') {
                                    evt.preventDefault();
                                    commitRename();
                                } else if (evt.key === 'Escape') {
                                    evt.preventDefault();
                                    cancelRename();
                                }
                            });

                            input.addEventListener('blur', commitRename);
                        }, true);

                        // Claude-Style Delete Modal Controller
                        const deleteModal = document.getElementById('recent-chat-delete-modal');
                        const deleteNameSpan = document.getElementById('recent-chat-delete-name');
                        const deleteCancelBtn = document.getElementById('recent-chat-delete-cancel-btn');
                        const deleteConfirmBtn = document.getElementById('recent-chat-delete-confirm-btn');

                        let pendingDeleteChat = null;

                        function openRecentChatDeleteModal(row, chatId, title) {
                            closeContextMenu();
                            const chatTitle = title || row?.querySelector('.chat-title-text')?.textContent.trim() || 'Chat';
                            pendingDeleteChat = { row, chatId, title: chatTitle };
                            if (deleteNameSpan) {
                                deleteNameSpan.textContent = `"${chatTitle}"`;
                            }
                            if (deleteModal) {
                                deleteModal.classList.remove('hidden');
                            }
                        }

                        function closeRecentChatDeleteModal() {
                            pendingDeleteChat = null;
                            if (deleteModal) {
                                deleteModal.classList.add('hidden');
                            }
                        }

                        function executeRecentChatDelete() {
                            if (!pendingDeleteChat) return;
                            const { row, chatId } = pendingDeleteChat;
                            closeRecentChatDeleteModal();

                            if (row) {
                                row.style.transition = 'opacity 140ms ease';
                                row.style.opacity = '0';

                                setTimeout(() => {
                                    row.remove();

                                    const remainingItems = listContainer.querySelectorAll('.chat-item, [data-chat-id]');
                                    if (remainingItems.length === 0) {
                                        listContainer.innerHTML = '<div class="px-3 py-4 text-center text-xs text-slate-400">No recent chats yet</div>';
                                    }
                                }, 140);
                            }

                            if (chatId && typeof chatState !== 'undefined' && Array.isArray(chatState.conversations)) {
                                chatState.conversations = chatState.conversations.filter(c => c.id !== chatId);
                                if (chatState.currentConversationId === chatId) {
                                    const remaining = chatState.conversations.filter(c => c.messages && c.messages.length > 0);
                                    if (remaining.length > 0) {
                                        if (typeof openConversation === 'function') openConversation(remaining[0].id);
                                    } else {
                                        if (typeof startNewConversation === 'function') startNewConversation();
                                    }
                                }
                                if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
                            }
                        }

                        window.openRecentChatDeleteModal = openRecentChatDeleteModal;
                        window.closeRecentChatDeleteModal = closeRecentChatDeleteModal;

                        deleteCancelBtn?.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            closeRecentChatDeleteModal();
                        });

                        deleteConfirmBtn?.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            executeRecentChatDelete();
                        });

                        deleteModal?.addEventListener('click', (e) => {
                            if (e.target === deleteModal) {
                                closeRecentChatDeleteModal();
                            }
                        });

                        // Context Menu Action: Delete
                        menuDeleteBtn?.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!activeTargetChatRow) return;

                            const row = activeTargetChatRow;
                            const chatId = row.dataset.chatId;
                            const title = row.querySelector('.chat-title-text')?.textContent.trim() || 'Chat';

                            openRecentChatDeleteModal(row, chatId, title);
                        }, true);

                        // 5. Click outside & Escape dismissal
                        document.addEventListener('click', (e) => {
                            if (!e.target) return;
                            if (sortPopover && sortBtn && typeof sortPopover.contains === 'function' && typeof sortBtn.contains === 'function') {
                                if (!sortPopover.contains(e.target) && !sortBtn.contains(e.target)) {
                                    closeSortPopover();
                                }
                            }
                            if (contextMenu && typeof contextMenu.contains === 'function') {
                                if (
                                    !contextMenu.contains(e.target) &&
                                    !(e.target.closest && e.target.closest('.chat-item-menu-trigger')) &&
                                    (!projectSubmenu || (typeof projectSubmenu.contains === 'function' && !projectSubmenu.contains(e.target)))
                                ) {
                                    closeContextMenu();
                                }
                            }
                        });

                        document.addEventListener('keydown', (e) => {
                            if (e.key === 'Escape') {
                                if (deleteModal && !deleteModal.classList.contains('hidden')) {
                                    closeRecentChatDeleteModal();
                                    return;
                                }
                                closeSortPopover();
                                closeContextMenu();
                            }
                        }, true);

                        // Initialize default sort state
                        updateSortCheckmarks();
                    }

                    if (document.readyState === 'loading') {
                        document.addEventListener('DOMContentLoaded', setupRecentChats);
                    } else {
                        setupRecentChats();
                    }
                })();
            