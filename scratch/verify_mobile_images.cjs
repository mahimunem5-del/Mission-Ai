const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('--- Starting Comprehensive Mobile & Desktop Images UI Verification ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.error('[Browser Error]:', msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
    console.error('[Page Exception]:', err.toString());
  });

  // 1. DESKTOP VERIFICATION (1440x900)
  console.log('\n[1/4] Testing Desktop (1440x900)...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Check Chat workspace desktop
  let desktopHeroVisible = await page.$eval('#hero-section', el => window.getComputedStyle(el).display !== 'none');
  console.log(`Desktop: Hero Section displayed? ${desktopHeroVisible}`);

  let mobileImageHomeDesktop = await page.$eval('#mobile-image-home-container', el => window.getComputedStyle(el).display);
  let mobileImageCompDesktop = await page.$eval('#mobile-image-composer-container', el => window.getComputedStyle(el).display);
  console.log(`Desktop: #mobile-image-home-container display: ${mobileImageHomeDesktop} (should be none)`);
  console.log(`Desktop: #mobile-image-composer-container display: ${mobileImageCompDesktop} (should be none)`);

  // Switch to Images workspace on Desktop
  await page.evaluate(() => {
    switchWorkspace('image-studio');
  });
  await new Promise(r => setTimeout(r, 600));

  let desktopImageHomeVisible = await page.$eval('#image-home-view', el => window.getComputedStyle(el).display !== 'none');
  let desktopImageHeroVisible = await page.$eval('#image-home-view .max-w-\\[760px\\]', el => window.getComputedStyle(el).display !== 'none');
  let mobileImageHomeOnDesktopImages = await page.$eval('#mobile-image-home-container', el => window.getComputedStyle(el).display);
  console.log(`Desktop Images: #image-home-view displayed? ${desktopImageHomeVisible}`);
  console.log(`Desktop Images: Desktop hero prompt displayed? ${desktopImageHeroVisible}`);
  console.log(`Desktop Images: Mobile container display? ${mobileImageHomeOnDesktopImages} (must be none)`);

  await page.screenshot({ path: 'scratch/desktop_images_1440x900.png' });
  console.log('Saved screenshot: scratch/desktop_images_1440x900.png');

  // 2. MOBILE VERIFICATION (360x800) - CHAT HOMEPAGE 100% UNTOUCHED
  console.log('\n[2/4] Testing Mobile (360x800) - Chat Homepage...');
  await page.setViewport({ width: 360, height: 800 });
  await page.evaluate(() => {
    switchWorkspace('chat');
  });
  await new Promise(r => setTimeout(r, 600));

  let mobileChatHomeVisible = await page.$eval('#mobile-home-container', el => window.getComputedStyle(el).display !== 'none');
  let mobileChatTitle = await page.$eval('#mobile-home-container h1', el => el.textContent.trim());
  console.log(`Mobile Chat Home: #mobile-home-container displayed? ${mobileChatHomeVisible}`);
  console.log(`Mobile Chat Home: Greeting text: "${mobileChatTitle}"`);
  await page.screenshot({ path: 'scratch/mobile_chat_home_intact.png' });
  console.log('Saved screenshot: scratch/mobile_chat_home_intact.png');

  // 3. MOBILE VERIFICATION (360x800) - IMAGES WORKSPACE
  console.log('\n[3/4] Testing Mobile (360x800) - Images Landing Page...');
  // Open sidebar drawer and click Images
  await page.click('#mobile-sidebar-toggle-btn');
  await new Promise(r => setTimeout(r, 400));
  await page.click('#sidebar-nav-images');
  await new Promise(r => setTimeout(r, 600));

  // Check Mobile Images View
  let mobImgHomeDisplay = await page.$eval('#mobile-image-home-container', el => window.getComputedStyle(el).display);
  let mobImgCompDisplay = await page.$eval('#mobile-image-composer-container', el => window.getComputedStyle(el).display);
  let mobImgHeaderTitle = await page.$eval('#mobile-image-home-container h1', el => el.textContent.trim());
  let mobImgHeaderSub = await page.$eval('#mobile-image-home-container p', el => el.textContent.trim());
  let mobImgBgColor = await page.$eval('#mobile-image-home-container', el => window.getComputedStyle(el).backgroundColor);
  let persistentSidebarBtn = await page.$eval('#mobile-image-sidebar-btn', el => {
    const s = window.getComputedStyle(el);
    return { display: s.display, position: s.position, top: s.top, left: s.left };
  });

  console.log(`Mobile Images: #mobile-image-home-container display: ${mobImgHomeDisplay}`);
  console.log(`Mobile Images: #mobile-image-composer-container display: ${mobImgCompDisplay}`);
  console.log(`Mobile Images: Title: "${mobImgHeaderTitle}"`);
  console.log(`Mobile Images: Subtitle: "${mobImgHeaderSub}"`);
  console.log(`Mobile Images: Background Color: ${mobImgBgColor}`);
  console.log('Mobile Images: Persistent Sidebar Button:', persistentSidebarBtn);

  // Check 2x2 Workspace Cards
  const workspaceCards = await page.$$eval('#mobile-image-home-container .grid.grid-cols-2 button', btns => {
    return btns.slice(0, 4).map(b => {
      const img = b.querySelector('img');
      const span = b.querySelector('span');
      return {
        title: span ? span.textContent.trim() : '',
        imgSrc: img ? img.getAttribute('src') : '',
        imgClass: img ? img.className : '',
        hasSubtitle: b.querySelectorAll('span, p').length > 1
      };
    });
  });
  console.log('Mobile Images: 2x2 Workspace Cards:', workspaceCards);

  // Check Filter-Free Templates
  const templateCardsCount = await page.$$eval('#mobile-image-home-templates-grid > div', cards => cards.length);
  const sampleTemplate = await page.$eval('#mobile-image-home-templates-grid > div:first-child', card => {
    return {
      classes: card.className,
      title: card.querySelector('span') ? card.querySelector('span').textContent.trim() : '',
      imgSrc: card.querySelector('img') ? card.querySelector('img').getAttribute('src') : ''
    };
  });
  console.log(`Mobile Images: Template cards rendered: ${templateCardsCount}`);
  console.log('Mobile Images: Sample Template card:', sampleTemplate);

  await page.screenshot({ path: 'scratch/mobile_images_360x800_home.png' });
  console.log('Saved screenshot: scratch/mobile_images_360x800_home.png');

  // Test + Popover Sheet in Floating Composer
  console.log('\nTesting Mobile Images + Popover Sheet...');
  await page.click('#mobile-image-attach-btn');
  await new Promise(r => setTimeout(r, 300));
  let popoverVisible = await page.$eval('#mobile-image-attach-popover', el => !el.classList.contains('hidden'));
  console.log(`Mobile Images: + Popover visible? ${popoverVisible}`);
  await page.screenshot({ path: 'scratch/mobile_images_360x800_attach_popover.png' });

  // Close popover
  await page.click('#mobile-image-attach-btn');
  await new Promise(r => setTimeout(r, 200));

  // Test Typing into Prompt Input
  console.log('\nTesting Mobile Images Prompt Typing...');
  await page.type('#mobile-image-prompt-input', 'Futuristic cyberpunk neon city skyline');
  let submitBtnState = await page.$eval('#mobile-image-submit-btn', el => ({
    disabled: el.disabled,
    className: el.className
  }));
  console.log('Mobile Images: Submit button state after typing:', submitBtnState);
  await page.screenshot({ path: 'scratch/mobile_images_360x800_typing.png' });

  // Test Tapping Template Card -> Opens White Preview Modal
  console.log('\nTesting Template Card Click -> Preview Modal...');
  await page.click('#mobile-image-home-templates-grid > div:first-child');
  await new Promise(r => setTimeout(r, 500));
  let previewModalVisible = await page.$eval('#template-white-preview-modal', el => !el.classList.contains('hidden'));
  console.log(`Template Preview Modal opened? ${previewModalVisible}`);
  await page.screenshot({ path: 'scratch/mobile_images_360x800_template_modal.png' });

  // Close modal
  await page.evaluate(() => {
    if (typeof closeTemplateWhitePreviewModal === 'function') closeTemplateWhitePreviewModal();
  });
  await new Promise(r => setTimeout(r, 300));

  // Test Tapping Workspace Card (e.g. Generate Image)
  console.log('\nTesting Workspace Card Click (Generate Image)...');
  await page.click('#mobile-image-home-container .grid.grid-cols-2 button:first-child');
  await new Promise(r => setTimeout(r, 600));
  let studioWorkspaceVisible = await page.$eval('#image-studio-workspace', el => window.getComputedStyle(el).display !== 'none');
  let mobileHomeHiddenDuringStudio = await page.$eval('#image-home-view', el => window.getComputedStyle(el).display === 'none');
  console.log(`Studio Workspace opened? ${studioWorkspaceVisible}`);
  console.log(`Mobile Home hidden during studio? ${mobileHomeHiddenDuringStudio}`);
  await page.screenshot({ path: 'scratch/mobile_images_360x800_studio_workspace.png' });

  // Back to image home
  await page.click('#ideogram-back-to-home-btn');
  await new Promise(r => setTimeout(r, 500));
  let mobileHomeRestored = await page.$eval('#mobile-image-home-container', el => window.getComputedStyle(el).display !== 'none');
  console.log(`Mobile Home restored after back click? ${mobileHomeRestored}`);

  // 4. LARGE ANDROID VIEWPORT (412x915)
  console.log('\n[4/4] Testing Large Mobile (412x915)...');
  await page.setViewport({ width: 412, height: 915 });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: 'scratch/mobile_images_412x915_home.png' });
  console.log('Saved screenshot: scratch/mobile_images_412x915_home.png');

  console.log('\n--- Console Errors Recorded ---');
  console.log(`Total errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log(consoleErrors);
  }

  await browser.close();
  console.log('\nAll tests completed successfully!');
})();
