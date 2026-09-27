# Porting Pink Paprikaa DS into a React app

## What's in this folder
- `styles.css` → entry stylesheet; `@import`s everything in `tokens/` (colours, type, spacing, radii, shadows, motion, fonts, base).
- `tokens/` → CSS custom properties. Framework-agnostic — use as-is.
- `brand.js` / `tokens/brand.module.js` → company facts (entity, CIN, GSTIN, FSSAI, address, contact). Import once, never hard-code.
- `assets/` → 9 SVG logos/symbols (pink / white / badge × lockup / wordmark / symbol).
- `components/{atoms,molecules,organisms,layouts}/` → React components. Each has `.jsx` (code), `.d.ts` (props), `.prompt.md` (usage), `.card.html` (story — reference only).
- `ui_kits/`, `templates/` → reference screens built from the components.
- `readme.md` → full design guide. `SKILL.md` → Claude Code skill.
- Skip in your app: `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json`, `*.card.html`, `components/_story.*`, `uploads/`.

## Setup (Vite + React)
```bash
npm create vite@latest pink-paprikaa -- --template react
cd pink-paprikaa && npm i
```
1. Copy `tokens/`, `styles.css` into `src/styles/`; `assets/` into `public/assets/`.
2. Copy `components/` into `src/components/` (drop the files listed above).
3. Copy `tokens/brand.module.js` to `src/brand.js`.
4. In `src/main.jsx`: `import "./styles/styles.css";`
5. Fonts load from Google Fonts via `tokens/fonts.css` — no install needed. To self-host, `npm i @fontsource/poppins @fontsource/dm-sans @fontsource/space-mono` and remove the `@import url(...)`.
6. Icons: components call Lucide by name. `npm i lucide-react` and swap `components/atoms/Icon.jsx` to render `lucide-react` icons (or keep the CDN version).
7. Components that show marks accept `base` (default `/assets`) — matches `public/assets/`.

## Usage
```jsx
import { Button } from "./components/atoms/Button.jsx";
import { SiteHeader } from "./components/organisms/SiteHeader.jsx";
import { PP_BRAND } from "./brand.js";
```
Components use relative imports between each other, so keep the folder structure. Rename `.jsx` → `.tsx` and fold the `.d.ts` interfaces in if you move to TypeScript.

## Still placeholder
Opening hours, guest reviews, delivery date, bank details, photography (every image is an `ImageSlot`).
