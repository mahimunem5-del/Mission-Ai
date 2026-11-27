# Desktop & Mobile E2E Report — Mestrio AI

- **Target Live URL:** `http://127.0.0.1:5001`
- **Browser:** Google Chrome Headless (`--headless=new`) via CDP

## Desktop (`1440×900`) & Mobile (`375×812`) Matrix

| Route | Desktop `1440×900` | Mobile `375×812` | React Fiber | Console Errors | Failed Requests |
| --- | --- | --- | --- | --- | --- |
| `/` | `scrollWidth: 1440`, `0` broken imgs | `scrollWidth: 375`, `0` broken imgs | `true` | `0` | `0` |
| `/images` | `scrollWidth: 1440`, `15` imgs (`0` broken) | `scrollWidth: 375`, `11` imgs (`0` broken) | `true` | `0` | `0` |
| `/slides` | `scrollWidth: 1440`, `18` imgs (`0` broken) | `scrollWidth: 375`, `16` imgs (6 lazy offscreen) | `true` | `0` | `0` |
| `/projects` | `scrollWidth: 1440`, `1` img (`0` broken) | `scrollWidth: 375`, `1` img (`0` broken) | `true` | `0` | `0` |
| `/library` | `scrollWidth: 1440`, `3` imgs (`0` broken) | `scrollWidth: 375`, `3` imgs (`0` broken) | `true` | `0` | `0` |

## Interactive Flows Verified in Live Chromium

- Clicked template card on `/images` -> `#template-white-preview-modal` opened (`true`).
- Clicked `#tmpl-modal-cta-btn` -> `#image-studio-workspace` opened with `#ideogram-sidebar-resizer` (`true`) and prompt populated (`true`).
- Clicked `#sidebar-account-btn` -> Account menu opened (`Settings`, `Upgrade plan`) (`true`).
- Clicked `Settings` -> Settings modal opened (`true`) and dismissed via `Escape`.
- Tested browser `history.back()` / `history.forward()` between `/` and `/images`.
