# Handoff: Pink Paprikaa Design System

**Start here.** This folder is the developer handoff for the complete Pink Paprikaa design system. It is self-sufficient: a developer (or Claude Code) who was not in the design conversation can build the product from these documents and the files next to them.

| Doc | What it covers |
|---|---|
| `handoff/README.md` | This file: overview, setup, build order, global rules, behaviour, accessibility, QA, open items |
| `handoff/TOKENS.md` | Every design token (240 CSS custom properties), with values, scopes and notes, plus `base.css` verbatim |
| `handoff/COMPONENTS.md` | All 80 components: purpose, usage, full props contract (`.d.ts`), dependencies, card file |
| `handoff/SCREENS.md` | The website, app and marketing reference builds, templates and foundation cards |
| `handoff/BRAND.md` | `brand.js` company facts, logo assets and rules, fonts, icons |
| `readme.md` (root) | The full design guide: voice and copy rules, visual foundations, states, motion, responsive rules, marketing canvases |
| `SETUP.md` (root) | A short Vite + React porting recipe |
| `SKILL.md` (root) | Claude Code skill entry point for this system |

---

## 1. Overview

Pink Paprikaa is a 100% vegetarian café brand: *"India's First Desi Urban Café"*. It runs a single outlet at Booth No. 67P, HSVP Market, Sector 57, Gurgaon, opened in 2025, and is operated by Paprikaa Culinary Ventures Private Limited.

The system covers three surfaces:
1. **Marketing website** (desktop-first, fluid to 360px)
2. **Pickup ordering app** (390×844 mobile)
3. **Social & ad artwork** (seven fixed pixel canvases)

The system includes:
- 80 React components across four Atomic Design tiers
- 240 tokens
- 9 SVG brand assets
- 3 UI kits
- 3 templates
- 33 foundation spec cards

## 2. About the design files

The files in this bundle are **design references built in HTML/React**. They show the intended look and behaviour exactly, but they are not a finished production codebase. **Recreate them in the target app's own environment** using its patterns.

If no app exists yet, use the recommended stack (§4). The component `.jsx` files are clean, dependency-free React 18 and can be ported almost 1:1. Treat them as the reference implementation and the `.d.ts` files as the props contract.

## 3. Fidelity

**High-fidelity.** Colours, type, spacing, radii, shadows, motion, copy and every interactive state are final. Recreate them pixel-for-pixel, and use the tokens rather than raw values.

The only non-final content:
- **Photography:** every image is a labelled `ImageSlot` placeholder.
- **Copy and data marked TODO:** see §11.

---

## 4. Setup (recommended stack)

```bash
npm create vite@latest pink-paprikaa -- --template react-ts
cd pink-paprikaa && npm i && npm i lucide-react
```

1. Copy `styles.css` and `tokens/` → `src/styles/`. In `src/main.tsx`: `import "./styles/styles.css";`
2. Copy `assets/` → `public/assets/`. Components that draw the brand mark take `base` (default `/assets`).
3. Copy `components/{atoms,molecules,organisms,layouts}/` → `src/components/`. Keep the folder structure, because components import each other relatively.
4. Rename `.jsx` → `.tsx` and fold each `.d.ts` interface into its component.
5. Copy `tokens/brand.module.js` → `src/brand.ts`. Import `PP_BRAND` wherever a company fact appears.
6. Icons: rewrite `components/atoms/Icon.jsx` to render `lucide-react` by kebab-case name. Keep its props: `name`, `size` (xs 14 / sm 16 / md 20 / lg 24 / xl 32), stroke width 2 at ≤16px and 1.75 above, `currentColor`.
7. Fonts: Google Fonts via `tokens/fonts.css`, or self-host with `@fontsource/poppins`, `@fontsource/dm-sans` and `@fontsource/space-mono`.

**Do not ship:**
- `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json`
- every `*.card.html` file, and `components/_story.*`
- `templates/*/support.js` and `ds-base.js`
- `uploads/`, `thumbnail.html`

These are design-tool and preview files only. The cards and `ui_kits/*/index.html` open directly in a browser as a living spec.

**Styling approach:** the components use inline style objects that read CSS variables. Keep that pattern, or move it to CSS Modules or Tailwind with the variables as the theme. Either way, **never replace a token with its raw value**.

## 5. Build order

1. **Foundations:** `styles.css` + tokens. Check fonts, `[data-surface]` scopes, focus ring and scrollbars.
2. **Atoms (31):** `TextButton` + its `usePress` hook come right after `Icon` — every other pressable reads them. start with `Icon`, `Text`, `Button`, `Input`, then `Popover` → `Menu` → `Select` (Menu and Popover are shared by every overlay).
3. **Molecules (30):** forms first (`Field`, `SearchField`, `Combobox`, `DatePicker`, `SlotPicker`, `QuantityStepper`, `OtpInput`), then content and domain.
4. **Organisms (12):** `SiteHeader`, `SiteFooter`, `Dialog`, `TabBar`, `CartPanel`, `OrderTracker`, etc.
5. **Layouts (7):** `Container`, `Section`, `Stack`, `Cluster`, `AutoGrid`, `AppShell`, `PostFrame`.
6. **Pages:** rebuild `ui_kits/website`, then `ui_kits/app`, then the marketing artboards. Details are in `handoff/SCREENS.md`.

Open each component's `.card.html` next to your implementation and match every row. The cards are the visual acceptance test.

---

## 6. Global rules (non-negotiable)

### 6.1 No browser-native UI, anywhere
Every dropdown, list, calendar, tooltip, scrollbar and validation message is ours.
- **Dropdowns:** use `Select` (short lists) or `Combobox` (long or type-to-filter lists). Never a native `<select>`.
- **Dates:** use `DatePicker`. Never `<input type="date">`. **Times:** use `SlotPicker`. Never `type="time"`. **Quantities:** use `QuantityStepper`. `Input type="number"` renders as text with a decimal keypad (no spinner arrows).
- `Input` refuses `date`, `time`, `datetime-local`, `month`, `week`, `color`, `file` and `range`, and warns in the console.
- **Overflow actions:** use `ActionMenu`. **Hover hints:** use `Tooltip` (never the `title` attribute; `Avatar` has a `tooltip` prop).
- **Validation:** forms are `<form noValidate>`. Controls set `aria-required`, not `required`, so the browser bubble never appears. Validate in code and show the message through the control's `error` prop.
- **Search:** `SearchField` is a text input with `inputMode="search"`, so the browser's own ✕ never appears. `base.css` also hides `::-webkit-search-cancel-button` and number spinners globally.
- **Scrollbars:** thin, styled with `--scrollbar-thumb` (`--pink-200`), `--scrollbar-thumb-hover` (`--pink-300`), `--scrollbar-track` (transparent) and `--scrollbar-size` (8px), applied globally in `base.css`.
- **Text selection:** `--pink-100` background with `--pink-800` text.

### 6.2 Colour and surfaces
- **Primary:** `--pink-500 #EE2C68`, used at full strength. Pair it with `--pink-100 #FFDBE8` and white. Neutrals are warm, pink-tinted "ink" (`--ink-900 #1A1216` … `--ink-000`).
- **Accents:** at most one spice accent per screen beside the pink. At most two background colours per composition. No gradients except the two photo scrims.
- **Text colour follows the surface.** Any flooded field carries `data-surface="brand" | "ink" | "soft"` (Card, Section, PatternField, SiteFooter and PostFrame set it automatically). Inside that scope the semantic tokens remap headings, body, links and borders. Never hard-code `#fff` on text, and never put black text on pink.
- **Contrast:** text at least 4.5:1 (3:1 for headline-scale only).

### 6.3 Type
- **Fonts:** Poppins (700/800 display, tight negative tracking), DM Sans (body at line-height 1.6), Space Mono (codes only).
- **Fluid type in layouts:** `--fs-*-fluid` or the `.pp-fluid-*` classes. Fixed sizes only on marketing canvases (`--fs-canvas-*` via `SocialHeadline`).

### 6.4 Layout and responsive
- **Spacing:** 4px scale where the step number is the multiple (`--space-6` = 24px).
- **Widths and rhythm:** container max 1200px; gutters `--gutter-fluid` 20→40; sections `--section-y-fluid` 56→96.
- **Breakpoints:** 480 / 768 / 1024 / 1280 / 1440. Everything must work at **360px**.
- **Grids:** never a bare `1fr`; use `minmax(0,1fr)` or `.pp-autogrid`. Text-bearing flex children get `min-width:0`, and wrapping rows use `gap`.
- **Fixed sizes:** buttons 36/44/54, fields 40/48/56, tags 38, minimum touch target 44px (`--hit-min`).

### 6.5 Shape and depth
- **Radii:** 4 / 6 / 10 / 16 / 24 / pill. Buttons and chips are pill, inputs 10, cards 16, sheets and modals 24.
- **Shadows:** `--shadow-1` (rest) → `-2` (dropdown) → `-3` (hover, popovers, toasts) → `-4` (modals, sheets). `--shadow-brand` is for the primary CTA, the floating add button and the selected calendar day only.
- **Never:** a coloured left border on a card, emoji, or glassmorphism decoration.

### 6.6 Copy
- **Voice:** "you" (guest) and "we" (café).
- **Casing:** Title Case for buttons and claims, sentence case for body and labels, ALL CAPS only on overlines.
- **Prices and times:** `₹240` (no space, no decimals), `8am – 11:30pm`.
- **Banned words:** artisanal, curated, experience (as a noun), elevated, journey, authentic.
- **Punctuation:** at most one exclamation mark per screen.
- Full rules and examples are in the root `readme.md` §2.

---

## 7. Interactions and behaviour

### 7.1 States (every interactive component)
| State | Treatment |
|---|---|
| **Rule** | **Every pressable element has rest, hover, press, focus-visible and disabled** — buttons, text buttons, links, tags, pagination, tabs, tab bar, accordion heads, list rows, slots, steppers, menu rows, calendar days, coupon stub, checkbox/radio/switch, field triggers. All use `usePress` (in `atoms/TextButton.jsx`) + the `--state-*` tokens. Every card shows a `state=` row with each one forced; the full matrix and tokens are in `guidelines/states.card.html`. |
| Hover | Pink steps one darker (`--brand-hover`); white surfaces tint `--state-hover` (pink-50); on pink/ink/status fills `--state-hover-on-color` (white 16%); field borders go `--border-strong`. Never an opacity fade. Touch pointers never show hover. |
| Press | `scale(var(--press-scale))` 0.97 (icon buttons 0.92) **and** a second darker step: `--brand-active`, `--state-press` (pink-100), `--state-press-on-color` (white 28%). 80ms. Space/Enter show press too. |
| Focus | Keyboard only (`:focus-visible`): 2px `--pink-500` outline, 2px offset — **white** on pink/ink/status surfaces. Fields use the 2px border plus `--focus-ring` |
| Disabled | `--ink-100` or `--ink-200` fill, `--ink-400` text, no shadow, `not-allowed` cursor |
| Form status | `error` (danger) / `success` (mint `#186c51` text) / `warning` (turmeric `#8a5c00` text). The border goes 2px, the leading icon tints, a status glyph appears on the right (`circle-alert` / `circle-check` / `triangle-alert`), and the message replaces the hint. Never a status colour without a message. |
| readOnly | `--surface-sunken` fill plus a lock icon |
| Loading | Trailing `Spinner` (pulsing brand diamond, 1.2s) or a `--pink-100` `Skeleton` |

### 7.2 Motion
| Token | Value | Use |
|---|---|---|
| `--dur-instant` | 80ms | press |
| `--dur-fast` | 140ms | hover, popover in |
| `--dur-base` | 220ms | state changes, sheet in |
| `--dur-slow` | 340ms | modals, page |
| `--dur-page` | 480ms | page transitions |
| `--ease-out` | `cubic-bezier(.2,.8,.2,1)` | entering |
| `--ease-in-out` | `cubic-bezier(.4,0,.2,1)` | moves |
| `--ease-entrance` | `cubic-bezier(.16,1,.3,1)` | sheets |
| `--ease-pop` | `cubic-bezier(.34,1.4,.64,1)` | **only** add-to-cart and reward confirmations |

**Keyframes in `base.css`:**
- `pp-pop-in`: popover enters at −4px and 0.98 scale
- `pp-sheet-in`: sheet rises 24px
- `pp-toast-pop`
- `pp-skeleton`
- `pp-spin-pulse`
- `pp-dot-pulse`
- `pp-mark-pulse`
- `pp-rotate`

Fades always pair with a small translate. `prefers-reduced-motion` collapses all durations globally.

### 7.3 Overlays (Popover → Menu → Select / Combobox / DatePicker / ActionMenu)
- **Popover** anchors to its parent element, opens 6px below, and flips above when there is no room. Its minimum width is the anchor's width, and it is clamped 8px from the viewport edges. It closes on outside press or Esc (Esc returns focus to the trigger) and repositions on scroll and resize. It uses `position: fixed` so it escapes `overflow:hidden` parents such as Dialog. Port it with a portal (`createPortal` to `document.body`) to also escape transformed ancestors.
- **Phones (≤640px):** `sheet="auto"` turns every popover into a bottom sheet:
  - full-width panel, top radius 24, `--shadow-4`
  - 40×4 drag handle and the field's label as the title
  - body max-height `min(70vh, 520px)`
  - `--surface-overlay` scrim; tapping it closes the sheet
  - `pp-sheet-in` animation, plus `env(safe-area-inset-bottom)` padding
- **Menu** rows and states:
  - rows 44px high (52px in a sheet), padding 8×12, radius 6, DM Sans 15
  - hover or keyboard-active row: `--pink-50` (danger rows: `--status-danger-soft`)
  - selected row: `--pink-700`, weight 600, trailing 14px brand diamond (StatusDot `live`)
  - disabled rows: `--ink-400`
  - **Items** support `icon` (20px), `description` (13px muted), `meta` (Space Mono 12, e.g. a price), `danger`, `disabled`, `{group}` headers (Space Mono 10.5, uppercase, +0.08em) and `{divider}` lines
  - panel: white, 1px `--border-subtle`, radius 10, `--shadow-3`, 6px padding, max-height 320 with its own scroll
- **Keyboard:**
  - **Select:** ↓ ↑ Enter or Space on the trigger opens the list. In the list: ↑ ↓, Home and End move; Enter or Space chooses; Tab closes; typing letters jumps to a match (600ms buffer). The list keeps `aria-activedescendant` in sync. Choosing returns focus to the trigger.
  - **Combobox:** focus stays in the input. ↓ ↑ move through matches, Enter chooses, Esc closes (a second Esc clears the text), Tab closes. Matches filter by case-insensitive *contains*, and the matched letters are bold `--pink-700`. With no results it shows: *"No matches. Try a shorter word."* It is always a popover, never a sheet, so the phone keyboard stays open.
  - **DatePicker:** ←/→ move a day, ↑/↓ a week, PageUp and PageDown a month, Home and End to the week's start and end, Enter chooses, Esc closes. Focus moves through the days with only one day tabbable at a time.
- **Select details:**
  - The trigger matches Input metrics exactly and is `role="combobox"`.
  - The chevron rotates 180° while open; a status glyph replaces it when there is a status.
  - `onChange` stays event-shaped (`e.target.value`); `onValueChange` returns the bare value.
  - Pass `name` to add a hidden input for form posts.
  - Uncontrolled with no placeholder, it defaults to the first option.
- **DatePicker details:**
  - Values are ISO `YYYY-MM-DD`, and the trigger shows `Sat, 10 Oct 2026` (`en-IN`).
  - Weeks start Monday; the header shows the month in Poppins 700 16 with chevron IconButtons, which disable outside `min` and `max`.
  - Day cells are 40×40 (44 in a sheet).
  - **Selected day:** white bold number on a `--pink-500` rotated-square diamond (70% of the cell, radius 6, `--shadow-brand`).
  - **Today:** bold `--pink-700` number with a 5px pink diamond below it.
  - **Blocked days:** `--ink-300` with a strike-through (`min`, `max`, `isDateDisabled`). **Hover:** `--pink-50`.
- **ActionMenu:** a ghost IconButton (`ellipsis-vertical`) opening at `bottom-end`, minimum width 200. Destructive actions go last, after a divider.
- **Dialog:** centred on desktop (width 460, radius 24, `--shadow-4`, `--surface-overlay` scrim, scrim-click closes); a bottom sheet with a drag handle on mobile.

### 7.4 Feedback
- **Toast:** add-to-cart uses `--ease-pop` and the brand tone with an optional action, e.g. "View Cart". The action is a `TextButton` (`caps`, `size="sm"`, `on` matched to the toast tone) with full hover/press/focus/disabled states.
- **Snackbar:** for undo and copy confirmations.
- **Alert:** inline, with the four status tones.
- **EmptyState:** always in the brand voice.

Details for each are in `handoff/COMPONENTS.md`.

### 7.5 Form validation rules (reference)
- **Mobile number:** exactly 10 digits after stripping non-digits.
  - empty → *"Add a mobile number so we can text your confirmation."*
  - too short → *"That number looks short. We need all 10 digits."*
  - the error clears on the next keystroke
- **OTP:** six single-digit boxes with auto-advance. See `OtpInput.card.html` for the entering / complete / verified / expired / disabled states.
- **Booking date:** `min` is today.
- **Time slots:** sold-out slots are disabled in SlotPicker.
- Validate on submit, then re-validate on change once the field has shown an error.

---

## 8. State management (reference builds)

### Website (`ui_kits/website/index.html`)
- **State:** `cart` (count), `toast` (message or null), `book` (dialog open), `booked` (step 2), `slot` (`"8:00pm"`), `date` (ISO, today), `phone`, `phoneErr`, `scrolled` (header goes translucent past 24px).
- **Menu:** the category filter in `MenuList` filters dishes locally. Add → `cart+1` and a toast.

### App (`ui_kits/app/`)
- **Tabs:** home / menu / cart / account via `TabBar`.
- **Item sheet:** spice level (Radio), add-ons (Checkbox), quantity (QuantityStepper).
- **Cart:** lines + `PriceSummary` (5% GST inclusive, split CGST/SGST 2.5% each, from `PP_BRAND.billing`).
- **Order tracker:** steps "Order in → On the tandoor → Ready".

### Data the real product will need from an API
- the menu: categories, dishes, price, diet mark, spice level, image, availability
- outlet hours and status
- time slots with capacity
- loyalty stamps
- order status
- OTP verification
- reviews: pull from Google; the current ones are placeholders

---

## 9. Design tokens

All tokens are listed in **`handoff/TOKENS.md`**. Key values:
- **Pink:** 50 → 800 (`--pink-500 #EE2C68`, `--pink-100 #FFDBE8`)
- **Ink:** 000 → 900 (`--ink-900 #1A1216`)
- **Accents:** turmeric `#F2B233`, tandoor `#E4572E`, mint `#2FA37C`, kesar `#7A3EA8`
- **Radii:** 4 / 6 / 10 / 16 / 24 / 999
- **Shadows:** warm-ink tint, e.g. `--shadow-3: 0 12px 32px -8px rgba(43,31,37,.16)`
- **Spacing:** 4px steps, plus 2px and 6px half-steps
- **Marketing canvases:** 1080², 1080×1350, 1080×1920, 1200×628, 1920×1080, 728×90, 300×250. The canvas type scale runs from 132 down to 24.

## 10. Assets, fonts, icons
See **`handoff/BRAND.md`**:
- 9 SVGs: lockup, wordmark and symbol, each in pink, white and badge
- the logo rules, and the brand-mark-in-diamond treatment B (opacity and scale by size)
- fonts and the Lucide icon setup

Photography: none was supplied. Every `ImageSlot` names the crop it needs (e.g. "Hero — 3:2 overhead of chilli paneer").

## 11. Open items (not blockers)
1. **`brand.js` TODOs:** outlet `hours`, plus `bankName`, `accountNumber`, `ifsc` and `upi` for billing.
2. **Guest reviews:** the TestimonialWall content is placeholder; replace it with real Google reviews (the 4.3 rating and 98 reviews are real).
3. **Delivery launch date:** copy currently says "Delivery starts in 2027"; confirm it.
4. **Photography:** food and lifestyle crops are needed for every `ImageSlot`.
5. **Icons:** decide whether to self-host Lucide (recommended: `lucide-react`) or keep the CDN.
6. **Overlay positioning:** add a portal for Popover in production (see §7.3).

## 12. Accessibility checklist
- All controls are reachable and operable by keyboard, with the visible pink focus ring.
- **Select:** a `role="combobox"` button with `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, and options carrying `aria-selected`.
- **Combobox:** `aria-autocomplete="list"`.
- **DatePicker:** `role="grid"` with day buttons carrying `aria-selected`, `aria-current="date"` and a full `aria-label` (e.g. "Saturday, 10 October, unavailable").
- **ActionMenu:** `aria-haspopup="menu"` with `menuitem` rows.
- **Errors:** `aria-invalid` plus `aria-describedby` pointing to the message. Required fields use `aria-required`.
- **Icon-only buttons:** always have a `label` (it becomes `aria-label`).
- **Avatar:** uses `role="img"` with an `aria-label`.
- **Contrast:** 4.5:1 for text; never black on pink.
- **Touch and motion:** touch targets of at least 44px; respect `prefers-reduced-motion`.

## 13. QA, definition of done
- [ ] Every `*.card.html` row is matched by the ported component, across all variants, sizes, tones and states.
- [ ] Every pressable shows hover, press, focus-visible and disabled exactly as in `guidelines/states.card.html` (Checkbox/Radio/Switch tint the whole row; fields go `--border-strong` on hover; OtpInput cells show focus).
- [ ] No native `<select>`, date or time input, `title` tooltip, or browser validation bubble appears anywhere.
- [ ] Popovers flip near the bottom edge, close on outside press and Esc, and become sheets at 640px and below.
- [ ] Every page works at 360, 768, 1024 and 1440px with no clipping or horizontal scroll.
- [ ] All company facts come from `brand.js`, with no retyped phone numbers, GSTINs or URLs.
- [ ] Tokens are used everywhere, with no raw hex in components (the only exceptions are the two status text colours already in the source).
- [ ] Copy follows the voice rules: ₹ format, casing, banned words.
- [ ] Keyboard-only pass through the booking dialog and the full app ordering flow.

## 14. File map
```
styles.css              global entry (imports tokens/*)
tokens/                 fonts, colors, typography, spacing, breakpoints, canvas, elevation, motion, base (+ brand.module.js)
brand.js                company facts (window.PP_BRAND / ES twin in tokens/)
assets/                 9 SVG logos & symbols
components/atoms/       31 primitives      (.jsx, .d.ts, .prompt.md, .card.html)
components/molecules/   30 compositions
components/organisms/   12 sections
components/layouts/     7 layout primitives
ui_kits/website|app|marketing/   reference pages (open index.html)
templates/              website, app, social-post starting points
guidelines/             33 foundation spec cards
Pink Paprikaa Website.html   self-contained offline copy of the website kit
readme.md               full design guide (voice, foundations, rules)
SETUP.md · SKILL.md     porting recipe · Claude Code skill
handoff/                this documentation set
```
