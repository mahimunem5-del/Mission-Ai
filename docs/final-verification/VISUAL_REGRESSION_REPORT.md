# Visual Regression Report — Mestrio AI

- **Target Live URL:** `http://127.0.0.1:5001`
- **Viewports Tested:** Desktop (`1440×900`) and Mobile (`375×812`)

## 1. Captured Live Screenshots

All screenshots were captured directly from `http://127.0.0.1:5001` via headless Chromium:

- Desktop (`1440×900`):
  - `docs/final-verification/screenshots/desktop-chat.png`
  - `docs/final-verification/screenshots/desktop-images.png`
  - `docs/final-verification/screenshots/desktop-slides.png`
  - `docs/final-verification/screenshots/desktop-projects.png`
  - `docs/final-verification/screenshots/desktop-library.png`
- Mobile (`375×812`):
  - `docs/final-verification/screenshots/mobile-chat.png`
  - `docs/final-verification/screenshots/mobile-images.png`
  - `docs/final-verification/screenshots/mobile-slides.png`
  - `docs/final-verification/screenshots/mobile-projects.png`
  - `docs/final-verification/screenshots/mobile-library.png`

## 2. Layout & Asset Checks

- **Horizontal Overflow (`scrollWidth > innerWidth`):** `false` (`0` overflow) across all 5 routes on both Desktop (`1440`) and Mobile (`375`).
- **Image Workspace (`/images`):**
  - Restored 1:1 from git `HEAD:index.html` (`62dbf0513ec5af3cc3ce65b9e9c3ef238fe9902f`): atmospheric dot-grid backdrop, `Imagine it. Craft it.` hero, word-by-word `48ms` typewriter placeholder + `TAB` badge, 4-column workflow row with diagonal `.split-slice-top` / `.split-slice-bottom` animations (`/workflows/*.jpeg`, all `15` visible desktop images loaded with `0` broken), 5-column Templates masonry + `#template-white-preview-modal`, `#ideogram-sidebar-resizer`, `.remove-bg-placeholder-shimmer`, `.transparent-checkerboard-bg`, and `#studio-lightbox-modal`.
- **Note on Mobile `/slides` Lazy Images:** 6 offscreen Unsplash template thumbnails (`loading="lazy"`) had not yet scrolled into viewport within the 1.6s mobile capture window; all 18 desktop `/slides` images loaded with `0` broken.
