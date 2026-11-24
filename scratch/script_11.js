
    (function () {
        window.isMobileDrawerOpen = false;
        window.isMobileModelDrawerOpen = false;
        window.mobileWorkspaceView = 'landing'; // 'landing' | 'results'
        window.activeMobileTool = 'generate-image'; // 'generate-image' | 'remove-background' | 'precise-edit' | 'upscale-image'
        window.isMobileProcessing = false;
        window.mobileProcessingStatus = 'Generating your image...';
        window.mobileSelectedImageIds = new Set();
        window.mobileModelFilterProvider = 'All';
        window.mobileModelSearchQuery = '';
        window.mobileRecentModelId = null;
        window.activeMobileTemplate = null;

        function openMobileTemplateCardModal(tmpl) {
            const modal = document.getElementById('mobile-template-card-modal');
            if (!modal || !tmpl) return;
            window.activeMobileTemplate = tmpl;

            if (typeof setIsMobileDrawerOpen === 'function') {
                setIsMobileDrawerOpen(false);
            }
            if (typeof closeMobileWorkspaceDrawer === 'function') {
                closeMobileWorkspaceDrawer();
            }

            const imgEl = document.getElementById('mobile-tmpl-card-img');
            const fallbackEl = document.getElementById('mobile-tmpl-card-fallback');
            const fallbackTitleEl = document.getElementById('mobile-tmpl-card-fallback-title');
            const titleEl = document.getElementById('mobile-tmpl-card-title');
            const promptEl = document.getElementById('mobile-tmpl-card-prompt-text');
            const ctaBtn = document.getElementById('mobile-tmpl-card-cta-btn');
            const ctaText = document.getElementById('mobile-tmpl-card-cta-text');
            const dlBtn = document.getElementById('mobile-tmpl-card-download-btn');
            const copyBtn = document.getElementById('mobile-tmpl-card-copy-btn');

            const title = tmpl.title || 'Template';
            const imgUrl = tmpl.imageUrl || tmpl.img || '';
            const promptText = tmpl.prompt || '';
            const isPreciseEdit = tmpl.targetWorkflow === 'precise-edit';

            if (titleEl) titleEl.textContent = title;
            if (fallbackTitleEl) fallbackTitleEl.textContent = title;
            if (promptEl) promptEl.textContent = promptText;
            if (ctaText) ctaText.textContent = isPreciseEdit ? 'Try with Photo' : 'Use Prompt';

            if (imgEl) {
                imgEl.style.display = 'block';
                if (fallbackEl) fallbackEl.classList.add('hidden');
                imgEl.onload = () => {
                    imgEl.style.display = 'block';
                    if (fallbackEl) fallbackEl.classList.add('hidden');
                };
                imgEl.onerror = function () {
                    if (!this.dataset.triedPublic && imgUrl && !this.src.includes('/public/')) {
                        this.dataset.triedPublic = '1';
                        this.src = '/public' + (imgUrl.startsWith('/') ? imgUrl : '/' + imgUrl);
                    } else {
                        this.style.display = 'none';
                        if (fallbackEl) fallbackEl.classList.remove('hidden');
                    }
                };
                imgEl.dataset.triedPublic = '';
                imgEl.src = imgUrl;
            }

            // Copy handler (inline feedback, zero toasts)
            if (copyBtn) {
                copyBtn.onclick = (e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(promptText).then(() => {
                        const copyIcon = copyBtn.querySelector('.copy-icon');
                        const checkIcon = copyBtn.querySelector('.check-icon');
                        const copyLabel = copyBtn.querySelector('.copy-label');
                        if (copyIcon && checkIcon) {
                            copyIcon.classList.add('hidden');
                            checkIcon.classList.remove('hidden');
                            if (copyLabel) copyLabel.textContent = 'Copied!';
                            setTimeout(() => {
                                copyIcon.classList.remove('hidden');
                                checkIcon.classList.add('hidden');
                                if (copyLabel) copyLabel.textContent = 'Copy';
                            }, 1800);
                        }
                    }).catch(() => {});
                };
            }

            // CTA button: Use Prompt
            if (ctaBtn) {
                ctaBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeMobileTemplateCardModal();

                    const targetTool = isPreciseEdit ? 'precise-edit' : 'generate-image';
                    if (typeof openMobileWorkspaceDrawer === 'function') {
                        openMobileWorkspaceDrawer(targetTool, {
                            prompt: promptText,
                            aspectRatio: tmpl.aspectRatio,
                            stylePreset: tmpl.stylePreset
                        });
                    }

                    const genInput = document.getElementById('mobile-gen-prompt-input');
                    if (genInput) {
                        genInput.value = promptText;
                        genInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    const homeInput = document.getElementById('image-home-prompt-input');
                    if (homeInput) {
                        homeInput.value = promptText;
                        homeInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    if (tmpl.stylePreset && typeof selectMobileStylePreset === 'function') {
                        selectMobileStylePreset(tmpl.stylePreset);
                    }
                };
            }

            // Download button
            if (dlBtn) {
                dlBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (typeof triggerSilentTemplateDownload === 'function') {
                        triggerSilentTemplateDownload(imgUrl, title);
                    }
                };
            }

            modal.classList.remove('hidden');
        }
        window.openMobileTemplateCardModal = openMobileTemplateCardModal;

        function closeMobileTemplateCardModal() {
            const modal = document.getElementById('mobile-template-card-modal');
            if (modal) modal.classList.add('hidden');
            window.activeMobileTemplate = null;
        }
        window.closeMobileTemplateCardModal = closeMobileTemplateCardModal;

        const TOOL_TITLES = {
            'generate-image': 'Generate Image',
            'remove-background': 'Remove Background',
            'precise-edit': 'Precise Edit',
            'upscale-image': 'Upscale Image'
        };

        const TOOL_CTA_LABELS = {
            'generate-image': 'Generate',
            'remove-background': 'Remove Background',
            'precise-edit': 'Apply Edit',
            'upscale-image': 'Upscale'
        };

        function escapeHtml(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        const STYLE_PRESETS = [
            'Auto', 'General', 'Realistic', 'Design', '3D Render', 'Anime', 'Cinematic', 'Illustration', 'Typography'
        ];

        const RATIOS = [
            { id: '1:1', label: '1:1', wireframe: 'w-3.5 h-3.5' },
            { id: '2:3', label: '2:3', wireframe: 'w-[10px] h-[15px]' },
            { id: '3:4', label: '3:4', wireframe: 'w-[11px] h-[15px]' },
            { id: '9:16', label: '9:16', wireframe: 'w-[9px] h-[16px]' },
            { id: '3:2', label: '3:2', wireframe: 'w-[15px] h-[10px]' },
            { id: '4:3', label: '4:3', wireframe: 'w-[15px] h-[11px]' },
            { id: '16:9', label: '16:9', wireframe: 'w-[16px] h-[9px]' },
            { id: 'auto', label: 'Auto', wireframe: 'w-3.5 h-3.5 border-dashed' }
        ];

        function getRelativeTime(timestamp) {
            if (!timestamp) return 'Just now';
            const now = Date.now();
            const time = typeof timestamp === 'number' ? timestamp : (new Date(timestamp).getTime() || now);
            const diffSec = Math.max(0, Math.floor((now - time) / 1000));
            if (diffSec < 60) return 'Just now';
            const diffMin = Math.floor(diffSec / 60);
            if (diffMin < 60) return `${diffMin}m ago`;
            const diffHour = Math.floor(diffMin / 60);
            if (diffHour < 24) return `${diffHour}h ago`;
            const diffDay = Math.floor(diffHour / 24);
            return `${diffDay}d ago`;
        }

        function getAutoIconSvg() {
            return '<svg class="w-4 h-4 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>';
        }

        function getEffectiveModelsList() {
            if (typeof IMAGE_MODELS !== 'undefined' && Array.isArray(IMAGE_MODELS) && IMAGE_MODELS.length > 0) {
                return IMAGE_MODELS;
            }
            return [
                { id: "openai/gpt-image-2.5-sunburst", name: "GPT Image 2.5 Sunburst", provider: "openai" },
                { id: "google/gemini-3-pro-image", name: "Nano Banana Pro", provider: "google" },
                { id: "black-forest-labs/flux.2-pro", name: "FLUX.2 Pro", provider: "bfl" },
                { id: "black-forest-labs/flux.2-flex", name: "FLUX.2 Flex", provider: "bfl" },
                { id: "bytedance-seed/seedream-5.0-pro", name: "Seedream 5.0 Pro", provider: "bytedance" },
                { id: "meta/muse-image", name: "Meta: Muse Image", provider: "meta" },
                { id: "google/gemini-3.1-flash-image-preview", name: "Nano Banana 2", provider: "google" }
            ];
        }

        function getModelDisplayName(modelId) {
            if (!modelId || modelId === 'auto') return 'Auto';
            const models = getEffectiveModelsList();
            const found = models.find(m => m.id === modelId);
            return found ? found.name : modelId;
        }

        function getModelDisplayIcon(modelId) {
            if (!modelId || modelId === 'auto') return getAutoIconSvg();
            if (typeof getModelIconSvg === 'function') {
                return getModelIconSvg(modelId);
            }
            return getAutoIconSvg();
        }

        // ============================================================
        // UNIVERSAL SWIPE-TO-DISMISS PHYSICS FOR ALL BOTTOM SHEETS
        // ============================================================
        function attachSwipeToDismiss({ backdropEl, sheetEl, dragHandleEl, scrollBodyEl, onClose }) {
            if (!sheetEl || sheetEl._swipeInited) return;
            sheetEl._swipeInited = true;

            let startY = 0;
            let currentY = 0;
            let isDragging = false;
            let startTime = 0;

            const onPointerDown = (e) => {
                const target = e.target;
                const isHandle = dragHandleEl && (dragHandleEl.contains(target) || dragHandleEl === target);
                const atTop = !scrollBodyEl || scrollBodyEl.scrollTop <= 0;

                // Only start drag if on handle/header, or if the scrollable body is at the very top
                if (!isHandle && !atTop) return;

                startY = (e.touches && e.touches[0] ? e.touches[0].clientY : e.clientY) || 0;
                currentY = startY;
                isDragging = false;
                startTime = Date.now();
            };

            const onPointerMove = (e) => {
                if (!startY) return;
                const clientY = (e.touches && e.touches[0] ? e.touches[0].clientY : e.clientY) || 0;
                currentY = clientY;
                const deltaY = clientY - startY;

                if (deltaY < 0 || (scrollBodyEl && scrollBodyEl.scrollTop > 0)) {
                    if (isDragging) {
                        isDragging = false;
                        sheetEl.style.transition = 'transform 250ms cubic-bezier(0.22, 1, 0.36, 1)';
                        sheetEl.style.transform = 'translateY(0)';
                        if (backdropEl) backdropEl.style.opacity = '1';
                    }
                    return;
                }

                if (deltaY > 6) {
                    isDragging = true;
                    if (e.cancelable && e.type === 'touchmove') {
                        e.preventDefault();
                    }
                    sheetEl.style.transition = 'none';
                    sheetEl.style.transform = `translateY(${deltaY}px)`;
                    if (backdropEl) {
                        const h = sheetEl.offsetHeight || 600;
                        const progress = Math.min(deltaY / h, 1);
                        backdropEl.style.opacity = String(Math.max(0.15, 1 - progress * 0.85));
                    }
                }
            };

            const onPointerUp = (e) => {
                if (!startY) return;
                const deltaY = currentY - startY;
                const duration = Date.now() - startTime;
                const velocity = deltaY / Math.max(duration, 1);

                const shouldDismiss = isDragging && (deltaY > 100 || (deltaY > 40 && velocity > 0.35));

                startY = 0;
                currentY = 0;

                if (shouldDismiss) {
                    sheetEl.style.transition = 'transform 200ms cubic-bezier(0.32, 0.72, 0, 1)';
                    sheetEl.style.transform = 'translateY(100%)';
                    if (backdropEl) {
                        backdropEl.style.transition = 'opacity 200ms ease';
                        backdropEl.style.opacity = '0';
                    }
                    setTimeout(() => {
                        sheetEl.style.transform = '';
                        sheetEl.style.transition = '';
                        if (backdropEl) {
                            backdropEl.style.opacity = '';
                            backdropEl.style.transition = '';
                        }
                        isDragging = false;
                        if (typeof onClose === 'function') onClose();
                    }, 200);
                } else if (isDragging) {
                    sheetEl.style.transition = 'transform 250ms cubic-bezier(0.22, 1, 0.36, 1)';
                    sheetEl.style.transform = 'translateY(0)';
                    if (backdropEl) {
                        backdropEl.style.transition = 'opacity 250ms ease';
                        backdropEl.style.opacity = '1';
                    }
                    setTimeout(() => {
                        sheetEl.style.transform = '';
                        sheetEl.style.transition = '';
                        if (backdropEl) {
                            backdropEl.style.opacity = '';
                            backdropEl.style.transition = '';
                        }
                        isDragging = false;
                    }, 260);
                }
            };

            const targetEl = dragHandleEl || sheetEl;
            targetEl.addEventListener('touchstart', onPointerDown, { passive: true });
            targetEl.addEventListener('touchmove', onPointerMove, { passive: false });
            targetEl.addEventListener('touchend', onPointerUp, { passive: true });
            targetEl.addEventListener('touchcancel', onPointerUp, { passive: true });

            targetEl.addEventListener('mousedown', onPointerDown);
            if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
                window.addEventListener('mousemove', (e) => {
                    if (startY) onPointerMove(e);
                });
                window.addEventListener('mouseup', onPointerUp);
            }
        }

        // ============================================================
        // DRAWER VISIBILITY & VIEW CONTROLS
        // ============================================================
        function setIsMobileDrawerOpen(isOpen) {
            window.isMobileDrawerOpen = Boolean(isOpen);
            if (typeof closeAllMobilePopovers === 'function') closeAllMobilePopovers();
            const drawer = document.getElementById('mobile-workspace-drawer');
            if (!drawer) return;
            if (isOpen) {
                // Ensure model drawer is closed when opening workspace drawer
                setIsMobileModelDrawerOpen(false);
                drawer.classList.remove('hidden');
                syncControlsFromState();
            } else {
                drawer.classList.add('hidden');
            }
        }
        window.setIsMobileDrawerOpen = setIsMobileDrawerOpen;

        function setIsMobileModelDrawerOpen(isOpen) {
            window.isMobileModelDrawerOpen = Boolean(isOpen);
            const modelDrawer = document.getElementById('mobile-model-drawer');
            if (!modelDrawer) return;
            if (isOpen) {
                modelDrawer.classList.remove('hidden');
                renderMobileModelFilterPills();
                renderMobileModelList();
                const searchInp = document.getElementById('mobile-model-search-input');
                if (searchInp) {
                    searchInp.value = '';
                    window.mobileModelSearchQuery = '';
                }
            } else {
                modelDrawer.classList.add('hidden');
            }
        }
        window.setIsMobileModelDrawerOpen = setIsMobileModelDrawerOpen;

        function setMobileWorkspaceView(view) {
            window.mobileWorkspaceView = view || 'landing';
            const feed = document.getElementById('mobile-workspace-result-feed');
            const landingHome = document.getElementById('mobile-image-home-container');
            const landingComposer = document.getElementById('mobile-image-composer-container');
            const homeView = document.getElementById('image-home-view');

            if (window.mobileWorkspaceView === 'results') {
                if (feed) feed.classList.remove('hidden');
                if (landingHome) landingHome.classList.add('hidden');
                if (landingComposer) landingComposer.classList.add('hidden');
                renderMobileResultFeed();
            } else {
                if (feed) feed.classList.add('hidden');
                if (landingHome) landingHome.classList.remove('hidden');
                if (landingComposer) landingComposer.classList.remove('hidden');
                if (homeView) homeView.classList.remove('hidden');
            }
        }
        window.setMobileWorkspaceView = setMobileWorkspaceView;

        function normalizeToolName(tool) {
            if (!tool) return 'generate-image';
            if (tool === 'generate' || tool === 'generate-image') return 'generate-image';
            if (tool === 'remove-bg' || tool === 'remove-background') return 'remove-background';
            if (tool === 'edit' || tool === 'precise-edit') return 'precise-edit';
            if (tool === 'upscale' || tool === 'upscale-image') return 'upscale-image';
            return tool;
        }
        window.normalizeToolName = normalizeToolName;

        function openMobileWorkspaceDrawer(tool, options = {}) {
            // Close any open template preview modal so two overlays never stack
            if (typeof closeMobileTemplateCardModal === 'function') {
                closeMobileTemplateCardModal();
            }
            if (typeof setSelectedTemplate === 'function') {
                setSelectedTemplate(null);
            } else if (typeof closeTemplateWhitePreviewModal === 'function') {
                closeTemplateWhitePreviewModal();
            }

            window.activeMobileTool = normalizeToolName(tool);
            
            // 1. Update Title and CTA Text
            const titleEl = document.getElementById('mobile-drawer-title');
            const ctaText = document.getElementById('mobile-drawer-cta-text');
            if (titleEl) titleEl.textContent = TOOL_TITLES[window.activeMobileTool] || 'Generate Image';
            if (ctaText) ctaText.textContent = TOOL_CTA_LABELS[window.activeMobileTool] || 'Generate';

            // 2. Toggle active panel
            const pGen = document.getElementById('mobile-panel-generate');
            const pRembg = document.getElementById('mobile-panel-remove-bg');
            const pPrecise = document.getElementById('mobile-panel-precise-edit');
            const pUpscale = document.getElementById('mobile-panel-upscale');

            if (pGen) pGen.classList.toggle('hidden', window.activeMobileTool !== 'generate-image');
            if (pRembg) pRembg.classList.toggle('hidden', window.activeMobileTool !== 'remove-background');
            if (pPrecise) pPrecise.classList.toggle('hidden', window.activeMobileTool !== 'precise-edit');
            if (pUpscale) pUpscale.classList.toggle('hidden', window.activeMobileTool !== 'upscale-image');

            // 3. Clear or fill options
            if (options.clear) {
                handleMobileDrawerClear();
            } else {
                if (options.prompt) {
                    if (window.activeMobileTool === 'generate-image') {
                        const genPrompt = document.getElementById('mobile-gen-prompt-input');
                        if (genPrompt) genPrompt.value = options.prompt;
                        if (typeof imageStudioState !== 'undefined') imageStudioState.prompt = options.prompt;
                    } else if (window.activeMobileTool === 'precise-edit') {
                        const precisePrompt = document.getElementById('mobile-precise-prompt-input');
                        if (precisePrompt) precisePrompt.value = options.prompt;
                    }
                }
                if (options.referenceImages && Array.isArray(options.referenceImages)) {
                    if (typeof imageStudioState !== 'undefined') {
                        imageStudioState.referenceImages = [...options.referenceImages];
                        imageStudioState.referenceImage = imageStudioState.referenceImages[0] || null;
                    }
                    if (typeof renderStudioReferenceSlots === 'function') {
                        renderStudioReferenceSlots();
                    }
                    renderMobileGenRefSlots();
                }
                if (options.aspectRatio && typeof imageStudioState !== 'undefined') {
                    imageStudioState.aspectRatio = options.aspectRatio;
                }
                if (options.stylePreset && typeof imageStudioState !== 'undefined') {
                    imageStudioState.activeStyle = options.stylePreset;
                }
                if (options.editItem) {
                    setMobilePreciseEditSource(options.editItem);
                }
            }

            // 4. Update CTA button disabled state
            updateMobileCtaButtonState();

            // 5. Open Drawer
            setIsMobileDrawerOpen(true);
        }
        window.openMobileWorkspaceDrawer = openMobileWorkspaceDrawer;

        function updateMobileCtaButtonState() {
            const btn = document.getElementById('mobile-drawer-cta-btn');
            if (!btn) return;

            let canSubmit = false;
            if (window.activeMobileTool === 'generate-image') {
                const promptVal = (document.getElementById('mobile-gen-prompt-input')?.value || '').trim();
                canSubmit = promptVal.length > 0 && !window.isMobileProcessing;
            } else if (window.activeMobileTool === 'remove-background') {
                const hasSrc = Boolean(window.removeBgSourceData || window.removeBgSourceFile);
                canSubmit = hasSrc && !window.isMobileProcessing;
            } else if (window.activeMobileTool === 'precise-edit') {
                const hasSrc = Boolean(typeof studioPreciseEditState !== 'undefined' && studioPreciseEditState.sourceItem && (studioPreciseEditState.sourceItem.url || studioPreciseEditState.sourceItem.img));
                const promptVal = (document.getElementById('mobile-precise-prompt-input')?.value || '').trim();
                canSubmit = hasSrc && promptVal.length > 0 && !window.isMobileProcessing;
            } else if (window.activeMobileTool === 'upscale-image') {
                const hasSrc = Boolean(window.upscaleSourceData || window.upscaleSourceImage);
                canSubmit = hasSrc && !window.isMobileProcessing;
            }

            btn.disabled = !canSubmit;
        }
        window.updateMobileCtaButtonState = updateMobileCtaButtonState;

        function handleMobileDrawerClear() {
            if (window.activeMobileTool === 'generate-image') {
                const input = document.getElementById('mobile-gen-prompt-input');
                if (input) input.value = '';
                if (typeof imageStudioState !== 'undefined') {
                    imageStudioState.prompt = '';
                    imageStudioState.currentPrompt = '';
                    imageStudioState.referenceImages = [];
                    imageStudioState.referenceImage = null;
                    imageStudioState.activeStyle = 'Auto';
                    imageStudioState.seed = '';
                }
                const deskPrompt = document.getElementById('studio-prompt-input');
                if (deskPrompt) deskPrompt.value = '';
                const seedInput = document.getElementById('mobile-gen-seed-input');
                if (seedInput) seedInput.value = '';
                if (typeof studioPreciseEditState !== 'undefined' && studioPreciseEditState) {
                    studioPreciseEditState.sourceItem = null;
                    studioPreciseEditState.sourceCard = null;
                    studioPreciseEditState.referenceImages = [];
                    studioPreciseEditState.isActive = false;
                    if (studioPreciseEditState.mask) studioPreciseEditState.mask = null;
                    if (studioPreciseEditState.maskData) studioPreciseEditState.maskData = null;
                }
                renderMobileGenRefSlots();
                renderMobileStylePills();
            } else if (window.activeMobileTool === 'remove-background') {
                window.removeBgSourceData = null;
                window.removeBgSourceFile = null;
                const dropzone = (document.getElementById('mobile-remove-bg-dropzone') || document.getElementById('mobile-rembg-dropzone'));
                const previewWrap = document.getElementById('mobile-rembg-preview-wrap');
                const previewImg = document.getElementById('mobile-rembg-preview-img');
                if (dropzone) dropzone.classList.remove('hidden');
                if (previewWrap) previewWrap.classList.add('hidden');
                if (previewImg) previewImg.src = '';
                const fileInput = document.getElementById('mobile-rembg-file-input');
                if (fileInput) fileInput.value = '';
            } else if (window.activeMobileTool === 'precise-edit') {
                if (typeof studioPreciseEditState !== 'undefined') {
                    studioPreciseEditState.sourceItem = null;
                    studioPreciseEditState.referenceImages = [];
                }
                const input = document.getElementById('mobile-precise-prompt-input');
                if (input) input.value = '';
                const deskInput = document.getElementById('studio-precise-edit-input');
                if (deskInput) deskInput.value = '';
                const dropzone = document.getElementById('mobile-precise-dropzone');
                const previewWrap = document.getElementById('mobile-precise-preview-wrap');
                const previewImg = document.getElementById('mobile-precise-preview-img');
                if (dropzone) dropzone.classList.remove('hidden');
                if (previewWrap) previewWrap.classList.add('hidden');
                if (previewImg) previewImg.src = '';
                const fileInput = document.getElementById('mobile-precise-file-input');
                if (fileInput) fileInput.value = '';
            } else if (window.activeMobileTool === 'upscale-image') {
                window.upscaleSourceData = null;
                window.upscaleSourceImage = null;
                const dropzone = document.getElementById('mobile-upscale-dropzone');
                const previewWrap = document.getElementById('mobile-upscale-preview-wrap');
                const previewImg = document.getElementById('mobile-upscale-preview-img');
                if (dropzone) dropzone.classList.remove('hidden');
                if (previewWrap) previewWrap.classList.add('hidden');
                if (previewImg) previewImg.src = '';
                const fileInput = document.getElementById('mobile-upscale-file-input');
                if (fileInput) fileInput.value = '';
            }
            updateMobileCtaButtonState();
        }

        async function handleMobileDrawerCtaClick() {
            // 1. Close drawer
            setIsMobileDrawerOpen(false);

            // Record pre-generation top item for atomic skeleton resolution
            const preItems = (typeof getEffectiveStudioImagesForWorkspace === 'function')
                ? getEffectiveStudioImagesForWorkspace(window.activeMobileTool)
                : (Array.isArray(window.STUDIO_RECENT_IMAGES) ? window.STUDIO_RECENT_IMAGES : []);
            window.mobilePreGenFirstItemId = preItems[0] ? (preItems[0].id || preItems[0].url || preItems[0].img) : null;
            window.mobileGenerationStartTime = Date.now();

            // 2. Switch to results feed
            setMobileWorkspaceView('results');

            // 3. Mark processing
            window.isMobileProcessing = true;
            if (window.activeMobileTool === 'generate-image') {
                window.mobileProcessingStatus = 'Generating your image...';
            } else if (window.activeMobileTool === 'remove-background') {
                window.mobileProcessingStatus = 'Removing background...';
            } else if (window.activeMobileTool === 'precise-edit') {
                window.mobileProcessingStatus = 'Applying edit...';
            } else if (window.activeMobileTool === 'upscale-image') {
                window.mobileProcessingStatus = 'Upscaling image...';
            }

            renderMobileResultFeed();

            // 4. Fire real handler
            try {
                if (window.activeMobileTool === 'generate-image') {
                    const promptVal = (document.getElementById('mobile-gen-prompt-input')?.value || '').trim();
                    const studioPrompt = document.getElementById('studio-prompt-input');
                    if (studioPrompt) studioPrompt.value = promptVal;
                    if (typeof imageStudioState !== 'undefined') imageStudioState.prompt = promptVal;
                    
                    const seedVal = document.getElementById('mobile-gen-seed-input')?.value;
                    const deskSeed = document.getElementById('ideogram-seed-input');
                    if (deskSeed && seedVal) deskSeed.value = seedVal;

                    if (typeof generateStudioImages === 'function') {
                        await generateStudioImages(promptVal, imageStudioState?.aspectRatio);
                    }
                } else if (window.activeMobileTool === 'remove-background') {
                    const btn = document.getElementById('btn-do-remove-bg');
                    if (btn) btn.click();
                } else if (window.activeMobileTool === 'precise-edit') {
                    const promptVal = (document.getElementById('mobile-precise-prompt-input')?.value || '').trim();
                    const deskPrompt = document.getElementById('studio-precise-edit-input');
                    if (deskPrompt) deskPrompt.value = promptVal;
                    if (typeof applyStudioPreciseEdit === 'function') {
                        await applyStudioPreciseEdit();
                    }
                } else if (window.activeMobileTool === 'upscale-image') {
                    const btn = document.getElementById('upscaleSubmitBtn') || document.getElementById('btn-do-upscale');
                    if (btn) btn.click();
                }
            } catch (err) {
                console.error('[Mobile Workspace Submit Error]:', err);
            } finally {
                window.isMobileProcessing = false;
                renderMobileResultFeed();
            }
        }

        function setMobilePreciseEditSource(item) {
            if (!item) return;
            const url = item.url || item.img || '';
            if (typeof studioPreciseEditState !== 'undefined') {
                studioPreciseEditState.sourceItem = item;
                studioPreciseEditState.isActive = true;
            }
            const dropzone = document.getElementById('mobile-precise-dropzone');
            const previewWrap = document.getElementById('mobile-precise-preview-wrap');
            const previewImg = document.getElementById('mobile-precise-preview-img');
            if (dropzone) dropzone.classList.add('hidden');
            if (previewWrap) previewWrap.classList.remove('hidden');
            if (previewImg) previewImg.src = url;

            // Desktop sync
            const deskDropzone = document.getElementById('studio-precise-edit-dropzone');
            const deskPreviewWrap = document.getElementById('studio-precise-edit-preview-wrap');
            const deskPreviewImg = document.getElementById('studio-precise-edit-preview-img');
            if (deskDropzone) deskDropzone.classList.add('hidden');
            if (deskPreviewWrap) deskPreviewWrap.classList.remove('hidden');
            if (deskPreviewImg) deskPreviewImg.src = url;

            updateMobileCtaButtonState();
        }
        window.setMobilePreciseEditSource = setMobilePreciseEditSource;

        function setMobileUpscaleSource(item) {
            if (!item) return;
            const url = item.url || item.img || '';
            window.upscaleSourceData = url;
            window.upscaleSourceImage = item;

            const dropzone = document.getElementById('mobile-upscale-dropzone');
            const previewWrap = document.getElementById('mobile-upscale-preview-wrap');
            const previewImg = document.getElementById('mobile-upscale-preview-img');
            if (dropzone) dropzone.classList.add('hidden');
            if (previewWrap) previewWrap.classList.remove('hidden');
            if (previewImg) previewImg.src = url;

            // Desktop sync
            const deskDrop = document.getElementById('upscale-upload-zone');
            const deskWrap = document.getElementById('upscale-preview-wrapper');
            const deskImg = document.getElementById('upscale-preview-img');
            if (deskDrop) deskDrop.classList.add('hidden');
            if (deskWrap) deskWrap.classList.remove('hidden');
            if (deskImg) deskImg.src = url;

            updateMobileCtaButtonState();
        }
        window.setMobileUpscaleSource = setMobileUpscaleSource;

        function syncControlsFromState() {
            if (typeof imageStudioState !== 'undefined') {
                const genPrompt = document.getElementById('mobile-gen-prompt-input');
                if (genPrompt) {
                    genPrompt.value = imageStudioState.prompt || imageStudioState.currentPrompt || '';
                }
                const ratioLabel = document.getElementById('mobile-gen-ratio-label');
                if (ratioLabel) ratioLabel.textContent = imageStudioState.aspectRatio || '1:1';

                const countLabel = document.getElementById('mobile-gen-count-label');
                if (countLabel) countLabel.textContent = String(imageStudioState.imageCount || 1);

                const currentModelId = imageStudioState.model || 'auto';
                const modelLabel = document.getElementById('mobile-gen-model-label');
                const modelIcon = document.getElementById('mobile-gen-model-icon');
                if (modelLabel) {
                    modelLabel.textContent = getModelDisplayName(currentModelId);
                }
                if (modelIcon) {
                    modelIcon.innerHTML = getModelDisplayIcon(currentModelId);
                }
            }

            renderMobileStylePills();
            renderMobileGenRefSlots();
            updateMobileCtaButtonState();
        }

        // ============================================================
        // MINIMAL STYLE PRESETS RENDERING (Ideogram Plain Aesthetic)
        // ============================================================
        function renderMobileStylePills() {
            const container = document.getElementById('mobile-gen-style-pills');
            if (!container) return;
            container.innerHTML = '';

            const currentStyle = (typeof imageStudioState !== 'undefined' && imageStudioState.activeStyle) ? imageStudioState.activeStyle : 'Auto';

            STYLE_PRESETS.forEach(style => {
                const btn = document.createElement('button');
                btn.type = 'button';
                const isActive = (style.toLowerCase() === currentStyle.toLowerCase());
                // Minimal plain surface: unselected on plain #FFFFFF surface, selected as soft subtle tinted pill (NEVER solid black)
                btn.className = isActive
                    ? 'px-3 py-1.5 rounded-full bg-slate-100 text-slate-900 font-semibold text-[13.5px] transition-colors cursor-pointer select-none active:scale-95'
                    : 'px-3 py-1.5 rounded-full bg-transparent hover:bg-slate-100/60 text-slate-600 font-medium text-[13.5px] transition-colors cursor-pointer select-none active:scale-95';
                btn.textContent = style;
                btn.onclick = () => {
                    if (typeof imageStudioState !== 'undefined') imageStudioState.activeStyle = style;
                    if (typeof syncStudioStylePills === 'function') syncStudioStylePills(style);
                    renderMobileStylePills();
                };
                container.appendChild(btn);
            });
        }

        function renderMobileGenRefSlots() {
            const container = document.getElementById('mobile-gen-ref-slots');
            const countEl = document.getElementById('mobile-gen-ref-count');
            if (!container) return;

            const refs = (typeof imageStudioState !== 'undefined' && Array.isArray(imageStudioState.referenceImages))
                ? imageStudioState.referenceImages
                : [];

            if (countEl) countEl.textContent = `${refs.length}/10`;
            container.innerHTML = '';

            refs.forEach((ref, idx) => {
                const slot = document.createElement('div');
                slot.className = 'w-full aspect-square rounded-xl overflow-hidden relative border border-slate-200 group bg-slate-100';
                slot.innerHTML = `
                    <img src="${ref.dataUrl || ref.url || ref}" class="w-full h-full object-cover">
                    <button type="button" class="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-[10px] cursor-pointer" title="Remove">✕</button>
                `;
                slot.querySelector('button')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (typeof removeStudioReferenceImage === 'function') {
                        removeStudioReferenceImage(idx);
                    } else {
                        if (typeof imageStudioState !== 'undefined' && Array.isArray(imageStudioState.referenceImages)) {
                            imageStudioState.referenceImages.splice(idx, 1);
                            imageStudioState.referenceImage = imageStudioState.referenceImages[0] || null;
                        }
                        if (typeof renderStudioReferenceSlots === 'function') renderStudioReferenceSlots();
                    }
                    renderMobileGenRefSlots();
                    if (typeof updateMobileCtaButtonState === 'function') updateMobileCtaButtonState();
                });
                container.appendChild(slot);
            });

            if (refs.length < 10) {
                const addSlot = document.createElement('div');
                addSlot.className = 'w-full aspect-square rounded-2xl border border-dashed border-slate-300 hover:border-slate-400 flex items-center justify-center text-slate-400 hover:text-slate-600 bg-slate-50/70 transition-all cursor-pointer';
                addSlot.innerHTML = '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14m-7-7h14"/></svg>';
                addSlot.onclick = () => document.getElementById('mobile-gen-ref-file-input')?.click();
                container.appendChild(addSlot);
            }

            const totalSlots = container.children.length;
            const ghostNeeded = Math.max(0, 5 - (totalSlots % 5));
            if (ghostNeeded > 0 && ghostNeeded < 5) {
                for (let i = 0; i < ghostNeeded; i++) {
                    const ghost = document.createElement('div');
                    ghost.className = 'w-full aspect-square rounded-2xl border border-dashed border-slate-200/70 bg-[#FFFFFF]';
                    container.appendChild(ghost);
                }
            }
        }

        function renderMobilePreciseRefSlots() {
            const container = document.getElementById('mobile-precise-ref-slots');
            const countEl = document.getElementById('mobile-precise-ref-count');
            if (!container) return;

            const refs = (typeof studioPreciseEditState !== 'undefined' && Array.isArray(studioPreciseEditState.referenceImages))
                ? studioPreciseEditState.referenceImages
                : [];

            if (countEl) countEl.textContent = `${refs.length}/10`;
            container.innerHTML = '';

            refs.forEach((ref, idx) => {
                const slot = document.createElement('div');
                slot.className = 'w-full aspect-square rounded-xl overflow-hidden relative border border-slate-200 group bg-slate-100';
                slot.innerHTML = `
                    <img src="${ref.dataUrl || ref.url || ref}" class="w-full h-full object-cover">
                    <button type="button" class="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-[10px] cursor-pointer" title="Remove">✕</button>
                `;
                slot.querySelector('button')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    refs.splice(idx, 1);
                    renderMobilePreciseRefSlots();
                });
                container.appendChild(slot);
            });

            if (refs.length < 10) {
                const addSlot = document.createElement('div');
                addSlot.className = 'w-full aspect-square rounded-2xl border border-dashed border-slate-300 hover:border-slate-400 flex items-center justify-center text-slate-400 hover:text-slate-600 bg-slate-50/70 transition-all cursor-pointer';
                addSlot.innerHTML = '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14m-7-7h14"/></svg>';
                addSlot.onclick = () => document.getElementById('mobile-precise-ref-file-input')?.click();
                container.appendChild(addSlot);
            }

            const totalSlots = container.children.length;
            const ghostNeeded = Math.max(0, 5 - (totalSlots % 5));
            if (ghostNeeded > 0 && ghostNeeded < 5) {
                for (let i = 0; i < ghostNeeded; i++) {
                    const ghost = document.createElement('div');
                    ghost.className = 'w-full aspect-square rounded-2xl border border-dashed border-slate-200/70 bg-[#FFFFFF]';
                    container.appendChild(ghost);
                }
            }
        }

        // ============================================================
        // NESTED MODEL SELECTOR DRAWER LOGIC
        // ============================================================
        function renderMobileModelFilterPills() {
            const container = document.getElementById('mobile-model-filter-pills');
            if (!container) return;
            container.innerHTML = '';

            const providers = ['All', 'OpenAI', 'Google', 'FLUX', 'ByteDance', 'Meta'];
            providers.forEach(p => {
                const isActive = (p.toLowerCase() === (window.mobileModelFilterProvider || 'All').toLowerCase());
                const pill = document.createElement('button');
                pill.type = 'button';
                // Background-matched filter pills: unselected #FFFFFF border-slate-200/70, active soft tint bg-slate-100
                pill.className = isActive
                    ? 'px-3 py-1 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-900 font-semibold text-[12.5px] shrink-0 transition-colors cursor-pointer select-none active:scale-95'
                    : 'px-3 py-1 rounded-lg bg-[#FFFFFF] border border-slate-200/70 text-slate-600 font-medium text-[12.5px] shrink-0 hover:bg-slate-50 transition-colors cursor-pointer select-none active:scale-95';
                pill.textContent = p;
                pill.onclick = () => {
                    window.mobileModelFilterProvider = p;
                    renderMobileModelFilterPills();
                    renderMobileModelList();
                };
                container.appendChild(pill);
            });
        }

        function renderMobileModelList() {
            const listContainer = document.getElementById('mobile-model-list-container');
            const autoCheck = document.getElementById('mobile-model-auto-check');
            const autoRow = document.getElementById('mobile-model-auto-row');
            if (!listContainer) return;

            const currentModelId = (typeof imageStudioState !== 'undefined' && imageStudioState.model) ? imageStudioState.model : 'auto';

            if (autoRow) {
                if (currentModelId === 'auto') {
                    autoRow.className = 'w-full bg-slate-100/80 rounded-xl px-3.5 py-3 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all select-none';
                } else {
                    autoRow.className = 'w-full bg-transparent hover:bg-slate-50/80 rounded-xl px-3.5 py-2.5 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all select-none';
                }
            }

            const allModels = getEffectiveModelsList();
            const query = (window.mobileModelSearchQuery || '').trim().toLowerCase();
            const filterProvider = (window.mobileModelFilterProvider || 'All').toLowerCase();

            const matches = allModels.filter(m => {
                if (filterProvider !== 'all') {
                    const prov = (m.provider || '').toLowerCase();
                    if (filterProvider === 'flux' && prov !== 'bfl' && !m.id.includes('flux')) return false;
                    if (filterProvider === 'openai' && prov !== 'openai') return false;
                    if (filterProvider === 'google' && prov !== 'google') return false;
                    if (filterProvider === 'bytedance' && prov !== 'bytedance') return false;
                    if (filterProvider === 'meta' && prov !== 'meta') return false;
                }
                if (query) {
                    const matchName = (m.name || '').toLowerCase().includes(query);
                    const matchId = (m.id || '').toLowerCase().includes(query);
                    const matchProv = (m.provider || '').toLowerCase().includes(query);
                    if (!matchName && !matchId && !matchProv) return false;
                }
                return true;
            });

            listContainer.innerHTML = '';

            if (matches.length === 0) {
                listContainer.innerHTML = '<div class="py-8 text-center text-slate-400 text-[13px]">No matching models found</div>';
                return;
            }

            // Optional Recent Section if active/recent model is in list
            const recentId = window.mobileRecentModelId;
            const recentModel = (recentId && recentId !== 'auto') ? matches.find(m => m.id === recentId) : null;

            if (recentModel && !query && filterProvider === 'all') {
                const recentHeader = document.createElement('div');
                recentHeader.className = 'text-[11.5px] font-semibold uppercase tracking-wider text-slate-400 px-1 pt-1 select-none';
                recentHeader.textContent = 'Recent';
                listContainer.appendChild(recentHeader);

                const recentRow = createModelRowElement(recentModel, currentModelId);
                listContainer.appendChild(recentRow);
            }

            // All models Header
            const allHeader = document.createElement('div');
            allHeader.className = 'text-[11.5px] font-semibold uppercase tracking-wider text-slate-400 px-1 pt-1 select-none';
            allHeader.textContent = 'All models';
            listContainer.appendChild(allHeader);

            matches.forEach(m => {
                const row = createModelRowElement(m, currentModelId);
                listContainer.appendChild(row);
            });
        }

        function createModelRowElement(model, currentModelId) {
            const isSelected = (model.id === currentModelId);
            const row = document.createElement('div');
            // Clean selection state: soft subtle tinted fill (bg-slate-100/80), no outer borders, no checkmarks
            row.className = 'w-full rounded-xl cursor-pointer active:scale-[0.99] transition-all select-none flex items-center justify-between ' + (isSelected ? 'bg-slate-100/80 px-3.5 py-3' : 'bg-transparent hover:bg-slate-50/80 px-3.5 py-2.5');

            const iconHtml = getModelDisplayIcon(model.id);

            row.innerHTML = '<div class="flex items-center gap-3 min-w-0">' +
                '<span class="w-5 h-5 shrink-0 flex items-center justify-center text-slate-700">' +
                    iconHtml +
                '</span>' +
                '<div class="truncate">' +
                    '<div class="text-[13.5px] font-medium text-slate-900 leading-tight truncate">' + escapeHtml(model.name) + '</div>' +
                    '<div class="text-[11px] text-slate-400 uppercase tracking-wider mt-0.5">' + escapeHtml(model.provider || '') + '</div>' +
                '</div>' +
            '</div>';

            row.onclick = () => {
                window.mobileRecentModelId = model.id;
                if (typeof imageStudioState !== 'undefined') imageStudioState.model = model.id;
                
                const label = document.getElementById('mobile-gen-model-label');
                const icon = document.getElementById('mobile-gen-model-icon');
                if (label) label.textContent = model.name;
                if (icon) icon.innerHTML = getModelDisplayIcon(model.id);

                if (typeof syncStudioModelDropdown === 'function') syncStudioModelDropdown(model.id);
                setIsMobileModelDrawerOpen(false);
            };

            return row;
        }

        async function downloadMobileImageDirect(item) {
            if (!item) return;
            const url = item.url || item.img || '';
            const filename = (item.title || 'image').replace(/[^a-z0-9_-]/gi, '_') + '.png';
            try {
                if (url.startsWith('data:image/')) {
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    return;
                }
                const res = await fetch(url, { mode: 'cors' });
                if (!res.ok) throw new Error('Fetch failed');
                const blob = await res.blob();
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
            } catch (err) {
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.target = '_blank';
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        }

        // ============================================================
        // MULTI-SELECT BAR SYNC & BATCH ACTIONS
        // ============================================================
        function updateMobileMultiSelectBar() {
            const bar = document.getElementById('mobile-result-multiselect-bar');
            const countEl = document.getElementById('mobile-multiselect-count');
            const popover = document.getElementById('mobile-result-delete-confirm-popover');
            if (!bar) return;

            const size = window.mobileSelectedImageIds ? window.mobileSelectedImageIds.size : 0;
            if (size > 0) {
                bar.classList.remove('hidden');
                if (countEl) countEl.textContent = `${size} selected`;
            } else {
                bar.classList.add('hidden');
                if (popover) popover.classList.add('hidden');
            }
        }
        window.updateMobileMultiSelectBar = updateMobileMultiSelectBar;

        function handleMobileMultiDownload() {
            if (!window.mobileSelectedImageIds || window.mobileSelectedImageIds.size === 0) return;
            const allItems = (typeof getEffectiveStudioImagesForWorkspace === 'function')
                ? getEffectiveStudioImagesForWorkspace(window.activeMobileTool)
                : (Array.isArray(window.STUDIO_RECENT_IMAGES) ? window.STUDIO_RECENT_IMAGES : []);

            allItems.forEach(item => {
                const id = item.id || item.url || item.img;
                if (window.mobileSelectedImageIds.has(id)) {
                    downloadMobileImageDirect(item);
                }
            });
            window.mobileSelectedImageIds.clear();
            updateMobileMultiSelectBar();
            renderMobileResultFeed();
        }

        function handleMobileMultiDelete() {
            if (!window.mobileSelectedImageIds || window.mobileSelectedImageIds.size === 0) return;
            const popover = document.getElementById('mobile-result-delete-confirm-popover');
            const countText = document.getElementById('mobile-delete-confirm-text');
            const count = window.mobileSelectedImageIds.size;
            if (countText) {
                countText.textContent = `Delete ${count} selected item${count > 1 ? 's' : ''}?`;
            }
            if (popover) {
                popover.classList.remove('hidden');
            }
        }

        function handleMobileMultiEdit() {
            if (!window.mobileSelectedImageIds || window.mobileSelectedImageIds.size !== 1) return;
            const targetId = Array.from(window.mobileSelectedImageIds)[0];
            const allItems = (typeof getEffectiveStudioImagesForWorkspace === 'function')
                ? getEffectiveStudioImagesForWorkspace(window.activeMobileTool)
                : (Array.isArray(window.STUDIO_RECENT_IMAGES) ? window.STUDIO_RECENT_IMAGES : []);

            const found = allItems.find(item => (item.id || item.url || item.img) === targetId);
            if (found) {
                window.mobileSelectedImageIds.clear();
                updateMobileMultiSelectBar();
                setMobilePreciseEditSource(found);
                openMobileWorkspaceDrawer('precise-edit');
            }
        }

        // ============================================================
        // ATOMIC SKELETON-TO-IMAGE RESULT FEED RENDERING
        // ============================================================
        function renderMobileResultFeed() {
            const feed = document.getElementById('mobile-result-scroll-feed');
            if (!feed) return;

            feed.innerHTML = '';
            updateMobileMultiSelectBar();

            const activeToolTitle = TOOL_TITLES[window.activeMobileTool] || 'Generate Image';

            const items = (typeof getEffectiveStudioImagesForWorkspace === 'function')
                ? getEffectiveStudioImagesForWorkspace(window.activeMobileTool)
                : (Array.isArray(window.STUDIO_RECENT_IMAGES) ? window.STUDIO_RECENT_IMAGES : []);

            // Atomic Resolution: If new item arrived at top, immediately clear processing to avoid layout jump
            if (window.isMobileProcessing) {
                const topItem = items[0];
                const topItemId = topItem ? (topItem.id || topItem.url || topItem.img) : null;
                if (topItem && topItemId !== window.mobilePreGenFirstItemId) {
                    window.isMobileProcessing = false;
                }
            }

            // 1. In-place Active Generation Slot (when processing)
            if (window.isMobileProcessing) {
                const currentPrompt = (typeof imageStudioState !== 'undefined' && imageStudioState.prompt)
                    ? imageStudioState.prompt
                    : ((document.getElementById('mobile-gen-prompt-input')?.value || '').trim() || 'Generating your image...');

                const progCard = document.createElement('div');
                progCard.className = 'w-full space-y-2 select-none animate-in fade-in duration-200';
                progCard.innerHTML = `
                    <!-- Top Metadata Row -->
                    <div class="flex items-center gap-2.5">
                        <div class="w-4 h-4 rounded-[5px] border border-slate-200 bg-slate-100 flex items-center justify-center"></div>
                        <span class="text-[13px] font-semibold text-slate-800">${escapeHtml(activeToolTitle)}</span>
                        <span class="text-[12px] text-slate-400">Just now</span>
                        <svg class="w-3.5 h-3.5 animate-spin text-slate-600 ml-1 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>

                    <!-- Prompt Row -->
                    <div class="text-[13.5px] leading-relaxed text-slate-600 line-clamp-2">
                        ${escapeHtml(currentPrompt)}
                    </div>

                    <!-- Compact Image Frame (w-[82%] max-w-[290px] aspect-square shimmer) -->
                    <div class="mt-2.5 w-[82%] max-w-[290px] aspect-square rounded-2xl bg-slate-100 border border-slate-200/60 overflow-hidden relative animate-pulse shadow-2xs">
                        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
                    </div>


                `;
                feed.appendChild(progCard);
            }

            // 2. Output Items (items already retrieved above for atomic resolution)

            if (items.length === 0 && !window.isMobileProcessing) {
                const emptyCard = document.createElement('div');
                emptyCard.className = 'p-8 text-center text-slate-400 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 select-none';
                emptyCard.innerHTML = `
                    <p class="text-sm font-medium text-slate-600">No images yet</p>
                    <p class="text-xs text-slate-400 mt-1">Tap "+ New" or "Edit Prompt" to create your first image.</p>
                `;
                feed.appendChild(emptyCard);
                return;
            }

            items.forEach((item, index) => {
                if (!item) return;
                const card = document.createElement('div');
                card.className = 'w-full space-y-2 animate-in fade-in duration-200';

                const itemId = item.id || item.url || item.img || String(index);
                const isSelected = window.mobileSelectedImageIds && window.mobileSelectedImageIds.has(itemId);

                const imgUrl = item.url || item.img || '';
                const promptText = (typeof getCleanStudioPrompt === 'function')
                    ? (getCleanStudioPrompt(item) || item.prompt || item.title || '')
                    : (item.originalPrompt || item.prompt || item.title || '');

                const isRemoveBg = Boolean(
                    item.isRemoveBg ||
                    item.tool === 'remove-bg' ||
                    item.tool === 'remove-background' ||
                    item.workflow === 'remove-bg' ||
                    item.model === 'remove-background' ||
                    (item.title && (item.title === 'Background Removed' || item.title === 'Transparent Cutout'))
                );

                const isUpscale = !isRemoveBg && Boolean(
                    item.isUpscale ||
                    item.tool === 'upscale-image' ||
                    item.type === 'upscale' ||
                    item.model === 'upscale-image' ||
                    item.modelName === 'Upscale Image' ||
                    (item.title && (item.title.startsWith('Upscaled ') || item.title === 'Upscale Image'))
                );

                const isPreciseEdit = !isRemoveBg && !isUpscale && Boolean(
                    item.isPreciseEdit ||
                    item.tool === 'precise-edit' ||
                    item.mode === 'edit' ||
                    item.editInstruction ||
                    item.workflowTool === 'precise-edit'
                );

                const workspaceTitle = isRemoveBg
                    ? 'Remove Background'
                    : (isUpscale
                        ? 'Upscale Image'
                        : (isPreciseEdit ? 'Precise Edit' : 'Generate Image'));

                const displayPrompt = promptText || (isRemoveBg ? 'Remove Background' : (isUpscale ? 'Upscaled Image' : 'Generated Image'));
                const timeAgo = getRelativeTime(item.createdAt || item.timestamp);

                // Accurate Model Icon + Model Name
                let modelName = 'FLUX.2 Flex';
                let modelIconSvg = getModelDisplayIcon('black-forest-labs/flux.2-flex');

                if (isRemoveBg) {
                    modelName = item.modelName || 'Remove Background';
                    modelIconSvg = '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>';
                } else if (isUpscale) {
                    const scaleVal = item.scale || item.upscaleFactor || (item.badge ? item.badge.replace(/\s*•\s*4K/gi, '').trim() : '2x') || '2x';
                    modelName = scaleVal + ' Upscale';
                    modelIconSvg = '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';
                } else if (isPreciseEdit) {
                    const mId = item.model || item.modelId || 'krea/k3-edit';
                    modelName = item.modelName || (mId.includes('seedream') ? 'Seedream 5.5' : (mId.includes('gemini') || mId.includes('banana') ? 'Nano Banana 2' : (mId.includes('auto') ? 'Auto' : 'Krea K3 Edit')));
                    modelIconSvg = getModelDisplayIcon(mId.includes('auto') && item.modelName ? item.modelName : mId);
                } else {
                    const mId = item.model || item.modelId || (typeof imageStudioState !== 'undefined' ? imageStudioState.model : null) || 'black-forest-labs/flux.2-flex';
                    modelName = item.modelName || getModelDisplayName(mId) || 'FLUX.2 Flex';
                    modelIconSvg = getModelDisplayIcon(mId);
                }

                const showModelBadge = !isRemoveBg && !isUpscale;
                const showPromptRow = !isRemoveBg && !isUpscale;
                const frameMarginClass = showPromptRow ? 'mt-2.5' : 'mt-2';

                let metadataRowHtml = '';
                if (showModelBadge) {
                    metadataRowHtml = '<div class="flex items-center gap-2 select-none min-w-0">' +
                        '<button type="button" class="mobile-item-check-btn w-4 h-4 rounded-[5px] border ' + (isSelected ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-300 hover:border-slate-400 bg-white') + ' flex items-center justify-center cursor-pointer transition-colors shrink-0" title="Select">' +
                        (isSelected ? '<svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : '') +
                        '</button>' +
                        '<span class="text-[13px] font-semibold text-slate-900 shrink-0">' + escapeHtml(workspaceTitle) + '</span>' +
                        '<span class="text-slate-300 select-none shrink-0">·</span>' +
                        '<div class="flex items-center gap-1 min-w-0 text-slate-600">' +
                        '<span class="w-3.5 h-3.5 shrink-0 flex items-center justify-center [&>svg]:w-3.5 [&>svg]:h-3.5 text-slate-500">' + modelIconSvg + '</span>' +
                        '<span class="text-[12.5px] font-medium truncate">' + escapeHtml(modelName) + '</span>' +
                        '</div>' +
                        '<span class="text-slate-300 select-none shrink-0">·</span>' +
                        '<span class="text-[12px] text-slate-400 shrink-0 whitespace-nowrap">' + escapeHtml(timeAgo) + '</span>' +
                        '</div>';
                } else {
                    metadataRowHtml = '<div class="flex items-center gap-2 select-none min-w-0">' +
                        '<button type="button" class="mobile-item-check-btn w-4 h-4 rounded-[5px] border ' + (isSelected ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-300 hover:border-slate-400 bg-white') + ' flex items-center justify-center cursor-pointer transition-colors shrink-0" title="Select">' +
                        (isSelected ? '<svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : '') +
                        '</button>' +
                        '<span class="text-[13px] font-semibold text-slate-900 shrink-0">' + escapeHtml(workspaceTitle) + '</span>' +
                        '<span class="text-slate-300 select-none shrink-0">·</span>' +
                        '<span class="text-[12px] text-slate-400 shrink-0 whitespace-nowrap">' + escapeHtml(timeAgo) + '</span>' +
                        '</div>';
                }

                let promptRowHtml = '';
                if (showPromptRow) {
                    promptRowHtml = '<div class="mt-1.5 text-[13.5px] leading-relaxed text-slate-600 break-words select-text">' +
                        '<span>' + escapeHtml(displayPrompt) + '</span>' +
                        '<button type="button" class="mobile-action-copy-prompt-btn inline-flex items-center gap-1 ml-2 text-[12.5px] font-medium text-slate-400 hover:text-slate-800 active:scale-95 transition-all cursor-pointer" title="Copy prompt">' +
                        '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>' +
                        '<span class="copy-label">Copy prompt</span>' +
                        '</button>' +
                        '</div>';
                }

                card.innerHTML = metadataRowHtml +
                    promptRowHtml +
                    '<div class="mobile-output-frame ' + frameMarginClass + ' w-[82%] max-w-[290px] rounded-2xl overflow-hidden border border-slate-200/60 bg-slate-50 cursor-pointer shadow-2xs hover:shadow-sm transition-shadow">' +
                    '<img src="' + imgUrl + '" alt="' + escapeHtml(displayPrompt) + '" loading="lazy" class="w-full h-auto object-cover block" />' +
                    '</div>';

                // Square checkbox toggle
                const checkBtn = card.querySelector('.mobile-item-check-btn');
                if (checkBtn) {
                    checkBtn.onclick = (e) => {
                        e.stopPropagation();
                        if (window.mobileSelectedImageIds.has(itemId)) {
                            window.mobileSelectedImageIds.delete(itemId);
                        } else {
                            window.mobileSelectedImageIds.add(itemId);
                        }
                        updateMobileMultiSelectBar();
                        renderMobileResultFeed();
                    };
                }

                // Tapping Image opens White Full-Screen Preview Modal with Context-Aware Details
                const frameEl = card.querySelector('.mobile-output-frame');
                if (frameEl) {
                    frameEl.onclick = () => {
                        if (typeof openTemplateWhitePreviewModal === 'function') {
                            const wsType = isRemoveBg ? 'remove-background' : (isUpscale ? 'upscale-image' : (isPreciseEdit ? 'precise-edit' : 'generate-image'));
                            const scaleVal = item.scale || item.upscaleFactor || (item.badge ? item.badge.replace(/s*•s*4K/gi, '').trim() : '2x') || '2x';
                            openTemplateWhitePreviewModal({
                                isFeedResult: true,
                                isResultItem: true,
                                workspaceType: wsType,
                                imageUrl: imgUrl,
                                prompt: promptText || displayPrompt,
                                scale: scaleVal,
                                title: workspaceTitle,
                                originalItem: item,
                                images: item.images || item.batchImages || item.outputs || null
                            });
                        }
                    };
                }

                // Inline Copy prompt action
                const copyBtn = card.querySelector('.mobile-action-copy-prompt-btn');
                if (copyBtn) {
                    copyBtn.onclick = (e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(displayPrompt).then(() => {
                            const lbl = copyBtn.querySelector('.copy-label');
                            if (lbl) lbl.textContent = '✓ Copied';
                            copyBtn.classList.add('text-emerald-600');
                            setTimeout(() => {
                                if (lbl) lbl.textContent = 'Copy prompt';
                                copyBtn.classList.remove('text-emerald-600');
                            }, 2000);
                        }).catch(() => {});
                    };
                }

                feed.appendChild(card);
            });
        }
        window.renderMobileResultFeed = renderMobileResultFeed;

        function handleMobileRegenerate() {
            const preItems = (typeof getEffectiveStudioImagesForWorkspace === 'function')
                ? getEffectiveStudioImagesForWorkspace(window.activeMobileTool)
                : (Array.isArray(window.STUDIO_RECENT_IMAGES) ? window.STUDIO_RECENT_IMAGES : []);
            window.mobilePreGenFirstItemId = preItems[0] ? (preItems[0].id || preItems[0].url || preItems[0].img) : null;
            window.mobileGenerationStartTime = Date.now();
            window.isMobileProcessing = true;
            if (window.activeMobileTool === 'generate-image') {
                window.mobileProcessingStatus = 'Generating your image...';
                renderMobileResultFeed();
                if (typeof generateStudioImages === 'function') generateStudioImages();
            } else if (window.activeMobileTool === 'remove-background') {
                window.mobileProcessingStatus = 'Removing background...';
                renderMobileResultFeed();
                document.getElementById('btn-do-remove-bg')?.click();
            } else if (window.activeMobileTool === 'precise-edit') {
                window.mobileProcessingStatus = 'Applying edit...';
                renderMobileResultFeed();
                if (typeof applyStudioPreciseEdit === 'function') applyStudioPreciseEdit();
            } else if (window.activeMobileTool === 'upscale-image') {
                window.mobileProcessingStatus = 'Upscaling image...';
                renderMobileResultFeed();
                (document.getElementById('upscaleSubmitBtn') || document.getElementById('btn-do-upscale'))?.click();
            }
        }

        // ============================================================
        // INITIALIZATION OF DEDICATED MOBILE WORKSPACE
        // ============================================================
        function initDedicatedMobileWorkspace() {
            // Wire dedicated mobile template card modal backdrop & close button
            const tmplBackdrop = document.getElementById('mobile-tmpl-card-backdrop');
            if (tmplBackdrop && !tmplBackdrop._wired) {
                tmplBackdrop._wired = true;
                tmplBackdrop.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeMobileTemplateCardModal();
                });
            }
            const tmplCloseBtn = document.getElementById('mobile-tmpl-card-close-btn');
            if (tmplCloseBtn && !tmplCloseBtn._wired) {
                tmplCloseBtn._wired = true;
                tmplCloseBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeMobileTemplateCardModal();
                });
            }

            // 0. Wire the 4 Mobile Workspace Cards
            const cardMap = [
                { id: 'mobile-card-generate', tool: 'generate' },
                { id: 'mobile-card-remove-bg', tool: 'remove-bg' },
                { id: 'mobile-card-precise-edit', tool: 'edit' },
                { id: 'mobile-card-upscale', tool: 'upscale' }
            ];
            cardMap.forEach(({ id, tool }) => {
                const cardEl = document.getElementById(id);
                if (cardEl && !cardEl._wired) {
                    cardEl._wired = true;
                    cardEl.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (typeof setSelectedTemplate === 'function') setSelectedTemplate(null);
                        if (tool === 'edit' && typeof studioPreciseEditState !== 'undefined' && studioPreciseEditState) {
                            studioPreciseEditState.sourceItem = null;
                        }
                        openMobileWorkspaceDrawer(tool);
                    });
                }
            });

            // 1. Swipe-to-dismiss gesture for Workspace Bottom Sheet Drawer
            const wsBackdrop = document.getElementById('mobile-workspace-drawer');
            const wsSheet = document.getElementById('mobile-workspace-sheet');
            const wsHandle = document.getElementById('mobile-workspace-drag-handle');
            const wsScroll = document.getElementById('mobile-drawer-scroll-body');

            if (wsBackdrop && !wsBackdrop._backdropInited) {
                wsBackdrop._backdropInited = true;
                wsBackdrop.addEventListener('click', (e) => {
                    if (e.target === wsBackdrop) {
                        setIsMobileDrawerOpen(false);
                    }
                });
            }

            attachSwipeToDismiss({
                backdropEl: wsBackdrop,
                sheetEl: wsSheet,
                dragHandleEl: wsHandle,
                scrollBodyEl: wsScroll,
                onClose: () => setIsMobileDrawerOpen(false)
            });

            // 2. Swipe-to-dismiss gesture for Model Selector Bottom Sheet Drawer
            const modelBackdrop = document.getElementById('mobile-model-drawer');
            const modelSheet = document.getElementById('mobile-model-sheet');
            const modelHandle = document.getElementById('mobile-model-drag-handle');
            const modelScroll = document.getElementById('mobile-model-scroll-body');

            if (modelBackdrop && !modelBackdrop._backdropInited) {
                modelBackdrop._backdropInited = true;
                modelBackdrop.addEventListener('click', (e) => {
                    if (e.target === modelBackdrop) {
                        setIsMobileModelDrawerOpen(false);
                    }
                });
            }

            attachSwipeToDismiss({
                backdropEl: modelBackdrop,
                sheetEl: modelSheet,
                dragHandleEl: modelHandle,
                scrollBodyEl: modelScroll,
                onClose: () => setIsMobileModelDrawerOpen(false)
            });

            // 3. Workspace Drawer Close Button (←)
            const closeBtn = document.getElementById('mobile-drawer-close-btn');
            if (closeBtn && !closeBtn._inited) {
                closeBtn._inited = true;
                closeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    setIsMobileDrawerOpen(false);
                });
            }

            // 4. Model Drawer Close Button (✕)
            const modelCloseBtn = document.getElementById('mobile-model-close-btn');
            if (modelCloseBtn && !modelCloseBtn._inited) {
                modelCloseBtn._inited = true;
                modelCloseBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    setIsMobileModelDrawerOpen(false);
                });
            }

            // 5. Model Trigger Button in Generate Image drawer opens Nested Model Drawer
            const modelBtn = document.getElementById('mobile-gen-model-btn');
            if (modelBtn && !modelBtn._inited) {
                modelBtn._inited = true;
                modelBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsMobileModelDrawerOpen(true);
                });
            }

            // 6. Model Search Input
            const modelSearchInput = document.getElementById('mobile-model-search-input');
            if (modelSearchInput && !modelSearchInput._inited) {
                modelSearchInput._inited = true;
                modelSearchInput.addEventListener('input', (e) => {
                    window.mobileModelSearchQuery = e.target.value;
                    renderMobileModelList();
                });
            }

            // 7. Auto Row Click
            const autoRow = document.getElementById('mobile-model-auto-row');
            if (autoRow && !autoRow._inited) {
                autoRow._inited = true;
                autoRow.addEventListener('click', () => {
                    if (typeof imageStudioState !== 'undefined') imageStudioState.model = 'auto';
                    const label = document.getElementById('mobile-gen-model-label');
                    const icon = document.getElementById('mobile-gen-model-icon');
                    if (label) label.textContent = 'Auto';
                    if (icon) icon.innerHTML = getAutoIconSvg();
                    if (typeof syncStudioModelDropdown === 'function') syncStudioModelDropdown('auto');
                    setIsMobileModelDrawerOpen(false);
                });
            }

            // 8. Primary CTA Button
            const ctaBtn = document.getElementById('mobile-drawer-cta-btn');
            if (ctaBtn && !ctaBtn._inited) {
                ctaBtn._inited = true;
                ctaBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    handleMobileDrawerCtaClick();
                });
            }

            // 9. Result Feed Navigation Bar (< Back & + New)
            const resultBackBtn = document.getElementById('mobile-result-back-btn');
            if (resultBackBtn && !resultBackBtn._inited) {
                resultBackBtn._inited = true;
                resultBackBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    setMobileWorkspaceView('landing');
                    if (typeof setImageStudioMode === 'function') setImageStudioMode('home');
                });
            }

            const resultNewBtn = document.getElementById('mobile-result-new-btn');
            if (resultNewBtn && !resultNewBtn._inited) {
                resultNewBtn._inited = true;
                resultNewBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    // 1. Reset active image tool state explicitly to Generate Image
                    window.activeTool = 'generate';
                    window.activeMobileTool = 'generate-image';
                    if (typeof imageStudioMode !== 'undefined') {
                        imageStudioMode = 'home';
                    }

                    // 2. Clear leftover prompt text, source image, mask/selection, or reference images from previous sessions
                    if (typeof studioPreciseEditState !== 'undefined' && studioPreciseEditState) {
                        studioPreciseEditState.sourceItem = null;
                        studioPreciseEditState.sourceCard = null;
                        studioPreciseEditState.referenceImages = [];
                        studioPreciseEditState.isActive = false;
                        if (studioPreciseEditState.mask) studioPreciseEditState.mask = null;
                        if (studioPreciseEditState.maskData) studioPreciseEditState.maskData = null;
                    }
                    window.removeBgSourceData = null;
                    window.removeBgSourceFile = null;
                    window.upscaleSourceData = null;
                    window.upscaleSourceImage = null;

                    // Clear DOM inputs and dropzones across all tools
                    const genPrompt = document.getElementById('mobile-gen-prompt-input');
                    if (genPrompt) genPrompt.value = '';
                    const deskPrompt = document.getElementById('studio-prompt-input');
                    if (deskPrompt) deskPrompt.value = '';
                    const genSeed = document.getElementById('mobile-gen-seed-input');
                    if (genSeed) genSeed.value = '';
                    const precisePrompt = document.getElementById('mobile-precise-prompt-input');
                    if (precisePrompt) precisePrompt.value = '';
                    const deskPrecisePrompt = document.getElementById('studio-precise-edit-input');
                    if (deskPrecisePrompt) deskPrecisePrompt.value = '';

                    const preciseFile = document.getElementById('mobile-precise-file-input');
                    if (preciseFile) preciseFile.value = '';
                    const rembgFile = document.getElementById('mobile-rembg-file-input');
                    if (rembgFile) rembgFile.value = '';
                    const upscaleFile = document.getElementById('mobile-upscale-file-input');
                    if (upscaleFile) upscaleFile.value = '';

                    const pWrap = document.getElementById('mobile-precise-preview-wrap');
                    if (pWrap) pWrap.classList.add('hidden');
                    const pDrop = document.getElementById('mobile-precise-dropzone');
                    if (pDrop) pDrop.classList.remove('hidden');
                    const pImg = document.getElementById('mobile-precise-preview-img');
                    if (pImg) pImg.src = '';

                    const rWrap = document.getElementById('mobile-rembg-preview-wrap');
                    if (rWrap) rWrap.classList.add('hidden');
                    const rDrop = document.getElementById('mobile-remove-bg-dropzone') || document.getElementById('mobile-rembg-dropzone');
                    if (rDrop) rDrop.classList.remove('hidden');
                    const rImg = document.getElementById('mobile-rembg-preview-img');
                    if (rImg) rImg.src = '';

                    const uWrap = document.getElementById('mobile-upscale-preview-wrap');
                    if (uWrap) uWrap.classList.add('hidden');
                    const uDrop = document.getElementById('mobile-upscale-dropzone');
                    if (uDrop) uDrop.classList.remove('hidden');
                    const uImg = document.getElementById('mobile-upscale-preview-img');
                    if (uImg) uImg.src = '';

                    if (typeof imageStudioState !== 'undefined') {
                        imageStudioState.prompt = '';
                        imageStudioState.currentPrompt = '';
                        imageStudioState.referenceImages = [];
                        imageStudioState.referenceImage = null;
                        imageStudioState.activeStyle = 'Auto';
                        imageStudioState.seed = '';
                    }

                    if (typeof renderMobileGenRefSlots === 'function') renderMobileGenRefSlots();
                    if (typeof renderMobileStylePills === 'function') renderMobileStylePills();
                    if (typeof renderStudioReferenceSlots === 'function') renderStudioReferenceSlots();

                    // 3. Close the Creations overlay/view if needed and open clean Generate Image sheet immediately
                    if (typeof setMobileWorkspaceView === 'function') {
                        setMobileWorkspaceView('landing');
                    }
                    openMobileWorkspaceDrawer('generate-image', { clear: true });
                });
            }

            // 10. Multi-Select Bar Buttons
            const cancelBtn = document.getElementById('mobile-multiselect-cancel-btn') || document.getElementById('mobile-multiselect-deselect-btn');
            if (cancelBtn && !cancelBtn._inited) {
                cancelBtn._inited = true;
                cancelBtn.addEventListener('click', () => {
                    if (window.mobileSelectedImageIds) {
                        window.mobileSelectedImageIds.clear();
                    }
                    const popover = document.getElementById('mobile-result-delete-confirm-popover');
                    if (popover) popover.classList.add('hidden');
                    updateMobileMultiSelectBar();
                    renderMobileResultFeed();
                });
            }

            const multiDlBtn = document.getElementById('mobile-multiselect-download-btn');
            if (multiDlBtn && !multiDlBtn._inited) {
                multiDlBtn._inited = true;
                multiDlBtn.addEventListener('click', handleMobileMultiDownload);
            }

            const multiDelBtn = document.getElementById('mobile-multiselect-delete-btn');
            if (multiDelBtn && !multiDelBtn._inited) {
                multiDelBtn._inited = true;
                multiDelBtn.addEventListener('click', handleMobileMultiDelete);
            }

            // Delete Confirmation Popover Buttons
            const confirmCancelBtn = document.getElementById('mobile-delete-confirm-cancel');
            if (confirmCancelBtn && !confirmCancelBtn._inited) {
                confirmCancelBtn._inited = true;
                confirmCancelBtn.addEventListener('click', () => {
                    const popover = document.getElementById('mobile-result-delete-confirm-popover');
                    if (popover) popover.classList.add('hidden');
                });
            }

            const confirmOkBtn = document.getElementById('mobile-delete-confirm-ok');
            if (confirmOkBtn && !confirmOkBtn._inited) {
                confirmOkBtn._inited = true;
                confirmOkBtn.addEventListener('click', () => {
                    const popover = document.getElementById('mobile-result-delete-confirm-popover');
                    if (popover) popover.classList.add('hidden');
                    if (!window.mobileSelectedImageIds || window.mobileSelectedImageIds.size === 0) return;

                    if (typeof window.deleteStudioImageByIds === 'function') {
                        window.deleteStudioImageByIds(window.mobileSelectedImageIds);
                    } else if (typeof STUDIO_RECENT_IMAGES !== 'undefined' && Array.isArray(STUDIO_RECENT_IMAGES)) {
                        window.STUDIO_RECENT_IMAGES = STUDIO_RECENT_IMAGES.filter(img => {
                            const id = img.id || img.url || img.img;
                            return !window.mobileSelectedImageIds.has(id);
                        });
                        if (typeof saveStoredRecentImages === 'function') {
                            saveStoredRecentImages(window.STUDIO_RECENT_IMAGES);
                        }
                    }
                    window.mobileSelectedImageIds.clear();
                    updateMobileMultiSelectBar();
                    renderMobileResultFeed();
                    if (typeof renderStudioAssetsGallery === 'function') renderStudioAssetsGallery();
                    if (typeof renderImageHomeCreations === 'function') renderImageHomeCreations();
                });
            }

            // 11. Result Feed Bottom Bar (Edit Prompt & Regenerate)
            const editPromptBtn = document.getElementById('mobile-result-edit-prompt-btn');
            if (editPromptBtn && !editPromptBtn._inited) {
                editPromptBtn._inited = true;
                editPromptBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    openMobileWorkspaceDrawer(window.activeMobileTool);
                });
            }

            const regenBtn = document.getElementById('mobile-result-regenerate-btn');
            if (regenBtn && !regenBtn._inited) {
                regenBtn._inited = true;
                regenBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    handleMobileRegenerate();
                });
            }

            // 12. Inputs change listeners to update CTA enabled/disabled state
            const genPrompt = document.getElementById('mobile-gen-prompt-input');
            if (genPrompt && !genPrompt._inited) {
                genPrompt._inited = true;
                genPrompt.addEventListener('input', () => {
                    if (typeof imageStudioState !== 'undefined') imageStudioState.prompt = genPrompt.value;
                    const deskPrompt = document.getElementById('studio-prompt-input');
                    if (deskPrompt) deskPrompt.value = genPrompt.value;
                    updateMobileCtaButtonState();
                });
            }

            const precisePrompt = document.getElementById('mobile-precise-prompt-input');
            if (precisePrompt && !precisePrompt._inited) {
                precisePrompt._inited = true;
                precisePrompt.addEventListener('input', () => {
                    const deskPrompt = document.getElementById('studio-precise-edit-input');
                    if (deskPrompt) deskPrompt.value = precisePrompt.value;
                    updateMobileCtaButtonState();
                });
            }

            // 13. File input listeners
            const genFileInput = document.getElementById('mobile-gen-ref-file-input');
            if (genFileInput && !genFileInput._inited) {
                genFileInput._inited = true;
                genFileInput.addEventListener('change', (e) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        if (typeof imageStudioState !== 'undefined') {
                            if (!Array.isArray(imageStudioState.referenceImages)) imageStudioState.referenceImages = [];
                            imageStudioState.referenceImages.push({
                                dataUrl: ev.target.result,
                                name: file.name
                            });
                            imageStudioState.referenceImage = imageStudioState.referenceImages[0];
                            if (typeof renderStudioReferenceSlots === 'function') renderStudioReferenceSlots();
                        }
                        renderMobileGenRefSlots();
                    };
                    reader.readAsDataURL(file);
                    genFileInput.value = '';
                });
            }

            const rembgFileInput = document.getElementById('mobile-rembg-file-input');
            const rembgDropzone = (document.getElementById('mobile-remove-bg-dropzone') || document.getElementById('mobile-rembg-dropzone'));
            if (rembgDropzone && !rembgDropzone._inited) {
                rembgDropzone._inited = true;
                rembgDropzone.addEventListener('click', () => rembgFileInput?.click());
            }
            if (rembgFileInput && !rembgFileInput._inited) {
                rembgFileInput._inited = true;
                rembgFileInput.addEventListener('change', (e) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        window.removeBgSourceData = ev.target.result;
                        window.removeBgSourceFile = file;

                        const dropzone = (document.getElementById('mobile-remove-bg-dropzone') || document.getElementById('mobile-rembg-dropzone'));
                        const previewWrap = document.getElementById('mobile-rembg-preview-wrap');
                        const previewImg = document.getElementById('mobile-rembg-preview-img');
                        if (dropzone) dropzone.classList.add('hidden');
                        if (previewWrap) previewWrap.classList.remove('hidden');
                        if (previewImg) previewImg.src = ev.target.result;

                        // Desktop sync
                        const deskDrop = document.getElementById('remove-bg-upload-zone');
                        const deskWrap = document.getElementById('remove-bg-preview-wrapper');
                        const deskImg = document.getElementById('remove-bg-preview-img');
                        if (deskDrop) deskDrop.classList.add('hidden');
                        if (deskWrap) deskWrap.classList.remove('hidden');
                        if (deskImg) deskImg.src = ev.target.result;

                        updateMobileCtaButtonState();
                    };
                    reader.readAsDataURL(file);
                    rembgFileInput.value = '';
                });
            }
            const rembgRemoveBtn = document.getElementById('mobile-rembg-remove-btn');
            if (rembgRemoveBtn && !rembgRemoveBtn._inited) {
                rembgRemoveBtn._inited = true;
                rembgRemoveBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.removeBgSourceData = null;
                    window.removeBgSourceFile = null;
                    (document.getElementById('mobile-remove-bg-dropzone') || document.getElementById('mobile-rembg-dropzone'))?.classList.remove('hidden');
                    document.getElementById('mobile-rembg-preview-wrap')?.classList.add('hidden');
                    updateMobileCtaButtonState();
                });
            }

            const preciseFileInput = document.getElementById('mobile-precise-file-input');
            const preciseDropzone = document.getElementById('mobile-precise-dropzone');
            if (preciseDropzone && !preciseDropzone._inited) {
                preciseDropzone._inited = true;
                preciseDropzone.addEventListener('click', () => preciseFileInput?.click());
            }
            if (preciseFileInput && !preciseFileInput._inited) {
                preciseFileInput._inited = true;
                preciseFileInput.addEventListener('change', (e) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        setMobilePreciseEditSource({ url: ev.target.result, img: ev.target.result });
                    };
                    reader.readAsDataURL(file);
                    preciseFileInput.value = '';
                });
            }
            const preciseRemoveBtn = document.getElementById('mobile-precise-remove-btn');
            if (preciseRemoveBtn && !preciseRemoveBtn._inited) {
                preciseRemoveBtn._inited = true;
                preciseRemoveBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (typeof studioPreciseEditState !== 'undefined') studioPreciseEditState.sourceItem = null;
                    document.getElementById('mobile-precise-dropzone')?.classList.remove('hidden');
                    document.getElementById('mobile-precise-preview-wrap')?.classList.add('hidden');
                    updateMobileCtaButtonState();
                });
            }

            const upscaleFileInput = document.getElementById('mobile-upscale-file-input');
            const upscaleDropzone = document.getElementById('mobile-upscale-dropzone');
            if (upscaleDropzone && !upscaleDropzone._inited) {
                upscaleDropzone._inited = true;
                upscaleDropzone.addEventListener('click', () => upscaleFileInput?.click());
            }
            if (upscaleFileInput && !upscaleFileInput._inited) {
                upscaleFileInput._inited = true;
                upscaleFileInput.addEventListener('change', (e) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        setMobileUpscaleSource({ url: ev.target.result, img: ev.target.result });
                    };
                    reader.readAsDataURL(file);
                    upscaleFileInput.value = '';
                });
            }
            const upscaleRemoveBtn = document.getElementById('mobile-upscale-remove-btn');
            if (upscaleRemoveBtn && !upscaleRemoveBtn._inited) {
                upscaleRemoveBtn._inited = true;
                upscaleRemoveBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.upscaleSourceData = null;
                    window.upscaleSourceImage = null;
                    document.getElementById('mobile-upscale-dropzone')?.classList.remove('hidden');
                    document.getElementById('mobile-upscale-preview-wrap')?.classList.add('hidden');
                    updateMobileCtaButtonState();
                });
            }

            // Helper to close all floating mobile popovers
            function closeAllMobilePopovers() {
                ['mobile-gen-ratio-dropdown', 'mobile-gen-count-dropdown', 'mobile-precise-quality-dropdown', 'mobile-precise-var-dropdown', 'mobile-precise-model-dropdown'].forEach(id => {
                    document.getElementById(id)?.classList.add('hidden');
                });
                document.getElementById('mobile-popover-backdrop')?.classList.add('hidden');
            }
            window.closeAllMobilePopovers = closeAllMobilePopovers;

            function toggleMobilePopover(dropId, renderFn) {
                const drop = document.getElementById(dropId);
                if (!drop) return;
                const isHidden = drop.classList.contains('hidden');
                closeAllMobilePopovers();
                if (isHidden) {
                    if (typeof renderFn === 'function') renderFn();
                    drop.classList.remove('hidden');
                    document.getElementById('mobile-popover-backdrop')?.classList.remove('hidden');
                }
            }

            // Transparent Popover Backdrop Dismissal
            const popoverBackdrop = document.getElementById('mobile-popover-backdrop');
            if (popoverBackdrop && !popoverBackdrop._inited) {
                popoverBackdrop._inited = true;
                popoverBackdrop.addEventListener('click', (e) => {
                    e.stopPropagation();
                    closeAllMobilePopovers();
                });
            }

            // Close popovers on drawer scroll
            document.getElementById('mobile-drawer-scroll-body')?.addEventListener('scroll', closeAllMobilePopovers, { passive: true });

            // Render Functions for Floating Popovers
            function renderMobileRatioOptions() {
                const ratioDrop = document.getElementById('mobile-gen-ratio-dropdown');
                if (!ratioDrop) return;
                ratioDrop.innerHTML = '';
                const currentRatio = (typeof imageStudioState !== 'undefined' && imageStudioState.aspectRatio) ? imageStudioState.aspectRatio : '1:1';
                RATIOS.forEach(r => {
                    const isSel = (r.id === currentRatio);
                    const opt = document.createElement('button');
                    opt.type = 'button';
                    // Soft selection state: unselected on #FFFFFF (px-3.5 py-2.5 text-[13.5px] text-slate-700 hover:bg-slate-50),
                    // selected has soft subtle tinted highlight (bg-slate-100/80 text-slate-900 font-semibold mx-1.5 rounded-xl px-2.5)
                    opt.className = isSel
                        ? 'w-[calc(100%-12px)] mx-1.5 flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl bg-slate-100/80 text-slate-900 font-semibold cursor-pointer transition-colors text-left'
                        : 'w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13.5px] text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors text-left';
                    opt.innerHTML = '<div class="w-5 h-5 flex items-center justify-center shrink-0"><div class="' + r.wireframe + ' border-[1.5px] border-current rounded-[2px] shrink-0"></div></div><span class="text-[13.5px]">' + r.label + '</span>';
                    opt.onclick = () => {
                        if (typeof imageStudioState !== 'undefined') imageStudioState.aspectRatio = r.id;
                        const label = document.getElementById('mobile-gen-ratio-label');
                        if (label) label.textContent = r.label;
                        const icon = document.getElementById('mobile-gen-ratio-icon');
                        if (icon) icon.innerHTML = '<div class="' + r.wireframe + ' border-[1.5px] border-current rounded-[2px] shrink-0"></div>';
                        if (typeof syncStudioRatioDropdown === 'function') syncStudioRatioDropdown(r.id);
                        closeAllMobilePopovers();
                    };
                    ratioDrop.appendChild(opt);
                });
            }

            function renderMobileCountOptions() {
                const countDrop = document.getElementById('mobile-gen-count-dropdown');
                if (!countDrop) return;
                countDrop.innerHTML = '';
                const currentCount = (typeof imageStudioState !== 'undefined' && imageStudioState.imageCount) ? imageStudioState.imageCount : 1;
                [1, 2, 3, 4].forEach(c => {
                    const isSel = (c === currentCount);
                    const opt = document.createElement('button');
                    opt.type = 'button';
                    opt.className = isSel
                        ? 'w-[calc(100%-12px)] mx-1.5 flex items-center justify-between px-2.5 py-2.5 rounded-xl bg-slate-100/80 text-slate-900 font-semibold cursor-pointer transition-colors text-left'
                        : 'w-full flex items-center justify-between px-3.5 py-2.5 text-[13.5px] text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors text-left';
                    opt.innerHTML = '<span class="text-[13.5px]">' + c + '</span>';
                    opt.onclick = () => {
                        if (typeof imageStudioState !== 'undefined') imageStudioState.imageCount = c;
                        const label = document.getElementById('mobile-gen-count-label');
                        if (label) label.textContent = String(c);
                        if (typeof syncStudioCountDropdown === 'function') syncStudioCountDropdown(c);
                        closeAllMobilePopovers();
                    };
                    countDrop.appendChild(opt);
                });
            }

            // 14. Ratio Popover Wiring
            const ratioBtn = document.getElementById('mobile-gen-ratio-btn');
            if (ratioBtn && !ratioBtn._inited) {
                ratioBtn._inited = true;
                ratioBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleMobilePopover('mobile-gen-ratio-dropdown', renderMobileRatioOptions);
                });
            }

            // 15. Variations Popover Wiring in Generate Image
            const countBtn = document.getElementById('mobile-gen-count-btn');
            if (countBtn && !countBtn._inited) {
                countBtn._inited = true;
                countBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleMobilePopover('mobile-gen-count-dropdown', renderMobileCountOptions);
                });
            }

            // 16. Advanced Settings Toggle
            const advToggle = document.getElementById('mobile-gen-adv-toggle');
            const advContent = document.getElementById('mobile-gen-adv-content');
            const advChevron = document.getElementById('mobile-gen-adv-chevron');
            if (advToggle && advContent && !advToggle._inited) {
                advToggle._inited = true;
                advToggle.addEventListener('click', () => {
                    advContent.classList.toggle('hidden');
                    advChevron?.classList.toggle('rotate-180');
                });
            }

            const randBtn = document.getElementById('mobile-gen-seed-rand-btn');
            if (randBtn && !randBtn._inited) {
                randBtn._inited = true;
                randBtn.addEventListener('click', () => {
                    const randSeed = Math.floor(Math.random() * 2147483647);
                    const inp = document.getElementById('mobile-gen-seed-input');
                    if (inp) inp.value = randSeed;
                    const deskInp = document.getElementById('ideogram-seed-input');
                    if (deskInp) deskInp.value = randSeed;
                });
            }

            function renderMobileQualityOptions() {
                const qualityDrop = document.getElementById('mobile-precise-quality-dropdown');
                if (!qualityDrop) return;
                qualityDrop.innerHTML = '';
                const currentQuality = (typeof studioPreciseEditState !== 'undefined' && studioPreciseEditState.quality) ? studioPreciseEditState.quality : 'High';
                ['Low', 'Medium', 'High'].forEach(q => {
                    const isSel = (q.toLowerCase() === currentQuality.toLowerCase());
                    const opt = document.createElement('button');
                    opt.type = 'button';
                    opt.className = isSel
                        ? 'w-[calc(100%-12px)] mx-1.5 flex items-center justify-between px-2.5 py-2.5 rounded-xl bg-slate-100/80 text-slate-900 font-semibold cursor-pointer transition-colors text-left'
                        : 'w-full flex items-center justify-between px-3.5 py-2.5 text-[13.5px] text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors text-left';
                    opt.innerHTML = '<span class="text-[13.5px]">' + q + '</span>';
                    opt.onclick = () => {
                        if (typeof studioPreciseEditState !== 'undefined') {
                            studioPreciseEditState.quality = q;
                            studioPreciseEditState.editWeight = q;
                        }
                        const label = document.getElementById('mobile-precise-quality-label');
                        if (label) label.textContent = q;
                        closeAllMobilePopovers();
                    };
                    qualityDrop.appendChild(opt);
                });
            }

            function renderMobilePreciseVarOptions() {
                const varDrop = document.getElementById('mobile-precise-var-dropdown');
                if (!varDrop) return;
                varDrop.innerHTML = '';
                const currentVar = (typeof studioPreciseEditState !== 'undefined' && studioPreciseEditState.variationCount) ? studioPreciseEditState.variationCount : 1;
                [1, 2, 3, 4].forEach(v => {
                    const isSel = (v === currentVar);
                    const opt = document.createElement('button');
                    opt.type = 'button';
                    opt.className = isSel
                        ? 'w-[calc(100%-12px)] mx-1.5 flex items-center justify-between px-2.5 py-2.5 rounded-xl bg-slate-100/80 text-slate-900 font-semibold cursor-pointer transition-colors text-left'
                        : 'w-full flex items-center justify-between px-3.5 py-2.5 text-[13.5px] text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors text-left';
                    opt.innerHTML = '<span class="text-[13.5px]">' + v + '</span>';
                    opt.onclick = () => {
                        if (typeof studioPreciseEditState !== 'undefined') studioPreciseEditState.variationCount = v;
                        const label = document.getElementById('mobile-precise-var-label');
                        if (label) label.textContent = String(v);
                        closeAllMobilePopovers();
                    };
                    varDrop.appendChild(opt);
                });
            }

            // 17. Quality Popover Wiring in Precise Edit
            const qualityBtn = document.getElementById('mobile-precise-quality-btn');
            if (qualityBtn && !qualityBtn._inited) {
                qualityBtn._inited = true;
                qualityBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleMobilePopover('mobile-precise-quality-dropdown', renderMobileQualityOptions);
                });
            }

            // 18. Variations Popover Wiring in Precise Edit
            const varBtn = document.getElementById('mobile-precise-var-btn');
            if (varBtn && !varBtn._inited) {
                varBtn._inited = true;
                varBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleMobilePopover('mobile-precise-var-dropdown', renderMobilePreciseVarOptions);
                });
            }

            // 19. Upscale Scale Buttons (Soft-Tinted 2x / 4x Pills)
            const btn2x = document.getElementById('mobile-upscale-2x-btn');
            const btn4x = document.getElementById('mobile-upscale-4x-btn');
            if (btn2x && btn4x && !btn2x._inited) {
                btn2x._inited = true;
                btn2x.onclick = () => {
                    window.upscaleScaleFactor = 2;
                    btn2x.className = 'py-2.5 px-3 rounded-xl bg-slate-100/90 border border-slate-200/80 text-slate-900 font-semibold text-[13px] flex items-center justify-center cursor-pointer transition';
                    btn4x.className = 'py-2.5 px-3 rounded-xl bg-[#FFFFFF] border border-slate-200/70 text-slate-600 font-medium text-[13px] flex items-center justify-center cursor-pointer hover:bg-slate-50 transition';
                    document.getElementById('upscale-scale-2x-btn')?.click();
                };
                btn4x.onclick = () => {
                    window.upscaleScaleFactor = 4;
                    btn4x.className = 'py-2.5 px-3 rounded-xl bg-slate-100/90 border border-slate-200/80 text-slate-900 font-semibold text-[13px] flex items-center justify-center cursor-pointer transition';
                    btn2x.className = 'py-2.5 px-3 rounded-xl bg-[#FFFFFF] border border-slate-200/70 text-slate-600 font-medium text-[13px] flex items-center justify-center cursor-pointer hover:bg-slate-50 transition';
                    document.getElementById('upscale-scale-4x-btn')?.click();
                };
            }
        }
        window.initDedicatedMobileWorkspace = initDedicatedMobileWorkspace;

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initDedicatedMobileWorkspace);
        } else {
            initDedicatedMobileWorkspace();
        }
    })();
    