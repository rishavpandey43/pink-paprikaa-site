# Handoff: Pink Paprikaa website (Homely Meals · Dawat · Restaurant)

## Overview
A sales-focused, multi-page marketing site for Pink Paprikaa (pure-veg café, MKM Market, Sector 57, Gurgaon) selling three revenue streams:
1. **Homely Meals by Pink Paprikaa**: daily meal plans (trial, weekday, full month) for households, offices and PGs.
2. **Dawat by Pink Paprikaa**: catering / bulk orders with 4 Dawat tiers, starters, platters, snacks.
3. **Restaurant**: dine-in and online menu.

There is **no backend**. Every enquiry ends in a pre-filled **WhatsApp message**, tagged with the source page. All prices come from one data file (`design/rates.js`).

## About the design files
Everything in `design/` is a **high-fidelity HTML design reference**, not production code. The files are "Design Components" (`*.dc.html`): an HTML template with `{{ }}` holes plus a small `class Component` logic block at the bottom of each file, rendered by `design/support.js`.

**Task:** recreate these designs in a real production codebase. If none exists, use **Next.js (App Router, static export) + TypeScript + plain CSS modules or Tailwind mapped to the design tokens**. Match the layout, copy, colours, type and behaviour exactly. Port the calculator logic faithfully: read each file's `class Component` block.

### Viewing the reference
The files need a local HTTP server (they fetch each other):
```
cd design
npx serve .        # or: python3 -m http.server 8080
```
Open `http://localhost:3000/Home.dc.html`. `Device Preview.dc.html` shows any page at 390, 768 and 1280px.

## Fidelity
**High fidelity.** Final colours, typography, spacing, copy and interactions. Recreate pixel-accurately. Image slots marked "PHOTO: …" are placeholders; see *Assets*.

## Design system (binding)
The full system is in `design-system/`. Read `design-system/README.md` first: it covers voice, colour, type, spacing, motion, states, responsive rules and the icon set.
- `design-system/tokens/*.css`: every CSS variable (colours, type scale, spacing, radii, shadows, motion, breakpoints). **Import these as-is**; don't retype values.
- `design-system/components/`: React source for every component (atoms, molecules, organisms, layouts). Each has a `.jsx`, a `.d.ts` props contract and a `.prompt.md` usage note. Port or reuse them directly.
- `design-system/brand.js`: company facts (legal name, GSTIN, FSSAI, contact, hours). Read from it; never hard-code.

Key tokens:
- **Colours:** primary pink `#EE2C68` (`--pink-500`), light pink `#FFDBE8` (`--pink-100`), pink-50 `#FFF5F8`, hover `#D21E55`, active `#AB1544`. Ink `#1A1216` (900) / `#2B1F25` (800) / `#6B5A62` (600, muted) / `#ECE6E8` (200, borders). Mint `#2FA37C` (veg/success), turmeric `#F2B233` (warning). No gradients.
- **Type:** Poppins 700/800 (display, headings, overlines: uppercase +0.14em), DM Sans (body/UI, line-height 1.6), Space Mono (codes only). Display tracking −0.02 to −0.03em. Use the fluid `--fs-*-fluid` sizes.
- **Spacing:** 4px base; `--space-N` = N×4px. Content max width 1200px; gutters `clamp(16px,4vw,40px)`; section padding `clamp(48px,8vw,96px)`.
- **Radii:** 4 / 6 / 10 (inputs) / 16 (cards) / 24 (sheets, feature cards) / pill (buttons, chips).
- **Shadows:** warm-ink `--shadow-1…4`; `--shadow-brand` (pink glow) only on primary CTAs.
- **Rules:** never a bare `1fr` (use `minmax(0,1fr)`); must work at 360px; buttons and pills are `nowrap`; no emoji; `₹240` format (no space, no decimals); 44px minimum touch targets; WCAG AA contrast.
- **Signature details used on this site:** diamond symbol watermark tiled at 4% opacity in dark/pink sections; `OfferSeal` rotated-diamond price seal; "100% vegetarian" badge; the logo lockup (`assets/logo-lockup-*.svg`) in header and footer.

## Pages
| File | Route | Purpose |
| --- | --- | --- |
| `Home.dc.html` | `/` | Overview of all 3 streams; hero "₹130 a meal · Try 5 meals for ₹650"; 3 "door" cards; plates; today/tomorrow menu preview; Dawat cards; restaurant; kitchen proof; Google reviews; FAQ |
| `HomelyMeals.dc.html` | `/homely-meals` | Plates (Everyday / Classic / Signature), trial week, `PlanCalculator`, add-ons, referral, delivery-zone checker, FAQ |
| `Catering.dc.html` | `/catering` | 4 Dawats, tasting offer, `DawatCalculator`, FAQ |
| `OfficeLunch.dc.html` | `/office-pg` | Team/PG pricing (20+ people), group calculator, Pluxee/Sodexo |
| `Menu.dc.html` | `/menu` | Restaurant menu listing (sample data; real menu to come) |
| `ThisWeek.dc.html` | `/this-week` | This week's Homely Meals menu by day |
| `About.dc.html` | `/about` | Story, kitchen and team photos |
| `Contact.dc.html` | `/contact` | Contact details, map embed |
| `Legal.dc.html` | `/legal` | Terms, privacy, refunds |

**Shared components** (build once and reuse): `PPHeader` (sticky 72px, launch countdown, nav), `PPFooter`, `PlanCalculator`, `DawatCalculator`, `FaqBlock` (FAQ with ready-made WhatsApp questions), `GoogleReviews` (carousel of real reviews linking to Maps).

For exact layout, spacing, colours and copy on every screen, read the template markup of each file. All styles are inline, so each element carries its complete style.

## Interactions & behaviour
- **Single source of prices:** `rates.js` (`window.PP_RATES`) mirrors the owner's Notion rate card. Convert it to a typed `rates.ts` module. **No price may be hard-coded anywhere else.**
- **WhatsApp CTAs:** every CTA opens `https://wa.me/<PP_RATES.wa>?text=…` with a pre-filled message that starts with a page tag: `[Web-Home]`, `[Web-Homely]`, `[Web-Catering]`, `[Web-Office]`, `[Web-Menu]` and so on. Keep these tags; the owner tracks enquiries by them.
- **Launch offer:** `homely.launch` (₹130 Classic, ₹120 for both meals, ends `2026-10-31T23:59:59+05:30`). The header countdown and all launch pricing and "+1 free meal / month" copy **disappear automatically** after the end date.
- **PlanCalculator:** picks the lowest valid price per person (launch, household tier 2 / 3–7 / 8–10, 3-month upfront, or 20+ group). It shows live totals and free meals. Price-drop nudges appear only for households (2–10 people) and never point to the 20+ rate; at 8+ people they're replaced by a group-pricing CTA. Choices persist in `localStorage`.
- **DawatCalculator:** guests, Dawat tier, per-tier upgrades, starter combos (pick 3), platters with upgrades, snacks in steps of 10, service style, date and optional referrer, giving a live per-head and total price, GST 5%, then WhatsApp. Persists in `localStorage`.
- **Trial week:** 5 meals, any days within a week; the specials shown change by plate.
- **Delivery-zone checker:** a sector dropdown (`PP_RATES.zones`) shows free or paid delivery and time slots.
- **Today / Tomorrow preview** on Home reads the weekly menu data by weekday.
- **Motion:** hovers 140ms, state changes 220ms, sheets 340ms. Cards lift −2px on hover; buttons press at `scale(.97)`. Respect `prefers-reduced-motion`.
- **Floating WhatsApp bar** on mobile.

## State
Client-only: calculator selections (persisted to `localStorage`), FAQ open item, carousel index, day tab, launch-countdown timer. No data fetching and no API.

## Assets
`design/assets/`
- **Logos** (SVG): `logo-lockup-pink|white|badge.svg` (default, includes the tagline), `logo-wordmark-*.svg` (under 120px wide), `symbol-*.svg` (diamond mark: pattern, favicon).
- **Photos done** (`assets/photos/`):
  - `home-hero.jpg`: 1600×1200, 4:3. Home hero and Homely Meals hero. The ₹130 `OfferSeal` overlaps its top-right corner.
  - `door-box.jpg`: 1:1. Home "Homely Meals" door card (shown at 88px).
  - `boxes-packed.png`: 1200×900, 4:3. Home kitchen section, "Boxes being packed".
  - `classic-thali.png`: real photo of the Classic Thali, currently unused and kept as a spare.
- **Photos still placeholders**, to be supplied by the owner using these names. Use JPG, 150–300KB each, sized at 2× display:

| Name | Ratio | Size | Slot |
| --- | --- | --- | --- |
| home-door-buffet | 1:1 | 400×400 | Home, Catering door card |
| home-door-dish | 1:1 | 400×400 | Home, Restaurant door card |
| home-restaurant | 4:3 | 1600×1200 | Home, restaurant section |
| home-kitchen-chefs | 3:4 | 800×1066 | Home, kitchen section |
| home-kitchen-veg | 4:3 | 800×600 | Home, kitchen section |
| catering-hero | 4:3 | 1600×1200 | Catering hero |
| dawat-classic / -signature / -maharaja / -royal | 16:10 | 1200×750 | Dawat cards (Home and Catering) |
| office-hero | 4:3 | 1600×1200 | Office & PG hero |
| office-reception / office-pg | 16:9 | 1200×675 | Office & PG cards |
| about-storefront | 21:9 | 2400×1030 | About hero |
| about-chef / -kitchen / -packing / -dinein | 3:4 | 900×1200 | About grid |
| share-image | — | 1200×628 | Open Graph / WhatsApp preview |

Always render images inside an `aspect-ratio` box with `object-fit: cover` and the rounded corners from the design, so a missing photo never collapses the layout. Use `next/image` or an equivalent for responsive sizes and WebP output.

**Icons:** Lucide (stroke 1.75, `currentColor`). Use `lucide-react`.

## Open TODOs (owner to supply)
In `rates.js`: Google rating and review count, Google profile URL, Swiggy/Zomato outlet links, order-online URL, 6 homepage bestsellers. Also: the full restaurant menu, the About-page story (current copy is a placeholder), and remaining photos. The logo tagline makes a "first" claim; the owner may switch to the wordmark-only version.

## Production extras to add
SEO titles and meta per page, Open Graph image, `LocalBusiness`/`Restaurant` JSON-LD (address, hours, FSSAI, `servesCuisine`), sitemap, favicon from `symbol-badge.svg`, analytics events on WhatsApp clicks (carry the page tag), and Lighthouse ≥ 90 on mobile.

## Files
- `design/`: all pages and shared components (`*.dc.html`), `rates.js` (prices and business data), `assets/`, `_ds/` (compiled design-system bundle and tokens so the reference renders), `support.js` (reference runtime only; do not port).
- `design-system/`: design-system README, tokens, component source, brand facts.
- `CLAUDE_CODE_PROMPT.md`: paste this into Claude Code to start.
