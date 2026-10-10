# Pink Paprikaa — Design System

> Developers: the implementation handoff lives in **`handoff/README.md`**.

**Brand:** Pink Paprikaa · *India's First Desi Urban Café*
**Registered entity:** Paprikaa Culinary Ventures Private Limited

---

## 1. Context

Pink Paprikaa is a **pure-vegetarian** café brand positioned as **India's First
Desi Urban Café** — a
contemporary, city-facing café whose menu and personality are rooted in Indian
(*desi*) flavour rather than imported café convention. The name is a pun made
visible in the logo: the word *Paprikaa* is set half in Latin and half in
Devanagari (`Papri` + `का`), and the dot of the "i" is a chilli. The brand is
loud, warm, young and city-street confident — pink is not decorative here, it is
the whole identity.

### Company facts live in one file
`brand.js` (plain script → `window.PP_BRAND`; ES-module twin at `tokens/brand.module.js`) holds every fact a
design might need to print: legal entity, CIN, GSTIN, FSSAI, PAN, registered
address, website, phone, WhatsApp, emails, Instagram (@thepinkpaprikaa),
ordering links (own site order.pinkpaprikaa.com, Swiggy, Zomato), Google rating
(4.3 · 98 reviews, with the Maps link), founding year (2025), opening hours, the
outlet list, and billing constants (5% GST split, invoice prefix, bank/UPI).
**Never retype these in a page** — read `window.PP_BRAND` (or import it) and
use the derived `PP_BRAND.lines.*` strings for footers and legal lines.
`SiteFooter` already does. Fields still reading `TODO` need real values from
the company; the **Brand → Company details** card lists them in red.

### Sources supplied
The brand was supplied as four PNGs and, later, four SVGs, plus two colour values.
There was **no codebase, no Figma file, no deck, and no live site** to read.

| Source | Path | Notes |
| --- | --- | --- |
| Logo lockup + symbol, first pass | `uploads/*.png` | Four 1563×1563 PNGs, superseded |
| Wordmark, pink on white | `uploads/logo-1.svg` | Vector master for both wordmark colourways |
| Wordmark, white on pink | `uploads/logo-3.svg` | Same lockup, alternate colourway |
| Symbol, white on pink | `uploads/logo-4.svg` | Same mark as symbol-1, alternate colourway |
| Symbol, pink on white | `uploads/symbol-1.svg` | Vector master for both symbol colourways |
| Primary colour | `#EE2C68` | given by the client |
| Light pink | `#FFDBE8` | given by the client |

Everything else in this system (type, neutrals, accents, spacing, motion,
components, UI kits) is **derived** from those assets and clearly flagged where
it is an interpretation rather than a supplied fact. See §7 *Open questions*.

### Products represented
No shipped product was supplied, so two surfaces were reconstructed as the most
plausible, most useful applications of the brand for a café business:

1. **`ui_kits/website/`** — the marketing site: hero, menu highlights, story,
   outlet locator, franchise callout, footer.
2. **`ui_kits/app/`** — the ordering app: home, menu category browse, item
   detail with spice/customisation, cart, order tracking.

These are recreations of the *brand*, not of an existing Pink Paprikaa product.
If real screens or a real site exist, send them and the kits should be rebuilt
against them.

---

## 2. Content fundamentals

**Voice: a confident city café that speaks Hinglish without apology.**
The brand's one supplied line of copy sets the whole tone — *"India's First Desi
Urban Café"*: a claim, stated flatly, in Title Case, no punctuation, no hedging.
Copy follows that lead.

**Rules**

- **Person.** Talk to the guest as **you**; the café speaks as **we**. Never "the
  customer", never "users". *"Your table's ready."* / *"We roast our own masala."*
- **Casing.** Title Case for names, claims and buttons of consequence
  (*"Order Now"*, *"Find a Paprikaa"*). Sentence case for body, helper text and
  form labels. **ALL CAPS only for eyebrows/overlines and heat labels**
  (`MENU`, `EXTRA HOT`) — never for a full sentence.
- **Length.** Headlines ≤ 6 words. Body sentences short — average 12 words,
  hard stop at 24. Menu descriptions ≤ 14 words, ingredient-led, no adjective
  stacking: *"Amritsari paneer, burnt chilli mayo, potato brioche."* not
  *"A delicious hand-crafted artisanal paneer creation."*
- **Interface labels are plain, generic English.** Spice is *Mild / Medium /
  Hot / Extra Hot*; sizes are *Regular / Sharing*; nothing a guest has to decode.
  Anything a person taps, filters by, or is billed for uses the word they
  already know.
- **Hinglish belongs to dish names and voice, not to controls.** *Kulhad Chai*,
  *Gulkand Kulfi*, *Masala Cold Brew* are dish names and stay as they are; the
  tagline *"Desi at heart. Urban by nature."* stays exactly as written. But a
  filter chip, a radio label, a status line or a button never carries a word the
  guest might not know. Devanagari is reserved for the logo, big display moments
  and dish names on the menu (`छोले`, `कुल्फी`).
- **Numbers & prices.** `₹` with no space, no decimals on whole rupees:
  `₹240`. Ranges use an en dash: `₹180–₹320`. Times are 12-hour lowercase:
  `8am – 11:30pm`.
- **Emoji: no.** The brand has a chilli, a diamond symbol and a very loud pink;
  it does not need emoji. Use the chilli/heat glyph component for spice, not 🌶.
- **Exclamation marks:** at most one per screen, and never in a heading.
- **Being pure veg is stated once, plainly, and never apologised for or
  over-sold**: *"100% vegetarian kitchen."* Never "veg-friendly", never "even
  meat-eaters love it", never a leaf emoji. The veg badge sits in the menu
  header and the footer — not on every dish name (the `DietMark` does that job).
- **Never say:** "artisanal", "curated", "experience" (as a noun), "elevated",
  "journey", "unleash", "revolutionise". Never call the food "authentic" — the
  brand's claim is *desi*, which is a fact, not a compliment.

**Examples**

| Situation | ✅ Write | ❌ Don't |
| --- | --- | --- |
| Hero headline | Desi at heart. Urban by nature. | Experience Our Curated Culinary Journey |
| Menu item | Paprikaa Chilli Paneer — `₹280` · Amritsari paneer, burnt chilli mayo. | Our signature artisanal paneer creation, lovingly hand-crafted |
| Veg claim | 100% vegetarian kitchen. Always was. | 100% PURE VEG!! No compromise! |
| Empty cart | Nothing here yet. Let's fix that. | Your cart is currently empty! 🛒 |
| Error | That card didn't go through. Try another? | Transaction failed. Error code 402. |
| Order confirmed | Order in. Kitchen's on it. | Thank you for your purchase!!! |
| Loyalty | 3 more visits and chai's on us. | Unlock exclusive rewards today |

---

## 3. Visual foundations

### 3.1 Colour
- **One primary, used at full strength.** `--pink-500 #EE2C68` is the brand.
  Large flat fields of it (full-bleed hero panels, footers, CTA bars) with white
  type on top — exactly the `logo-2.png` relationship — are the signature move.
- **`--pink-100 #FFDBE8`** is the calm counterpart: page tints, soft badges,
  card fills, section backgrounds. Together with white it does 80% of the work.
- **Neutrals are warm**, tinted toward the pink (`--ink-900 #1A1216` … 
  `--ink-100 #F7F3F4`). Never use a blue-grey or pure `#888`.
- **Spice accents** — turmeric `#F2B233`, tandoor `#E4572E`, mint `#2FA37C`,
  kesar `#7A3EA8` — exist for heat scales, veg/non-veg marks, status and the
  occasional data point. **Max one accent per screen** beside the pink.
- **Max two background colours per composition**: white/`pink-50` plus one
  flooded pink or ink panel. No third field colour.
- **Gradients: essentially none.** The only permitted gradients are the two
  legibility scrims (`--scrim-bottom`, `--scrim-top`) over photography. No
  pink-to-orange, no purple, no mesh.

### 3.2 Type
- **Poppins** (display, 700/800) for everything structural — geometric,
  circular, tight tracking; it matches the wordmark's circular bowls and the
  ExtraBold tagline. It also carries Devanagari, so `पैप्रिका` sets in the same
  family. **DM Sans** for running text and UI, **Space Mono** for order codes
  and receipt lines only.
- Display sizes get negative tracking (−0.02 to −0.03em) and line-height near
  1.0. Body stays at 1.6. Overlines are Poppins 700, uppercase, +0.14em.
- **These are the brand's final typefaces.** Poppins for display and headings
  (it carries Devanagari, so `पैप्रिका` and dish names set in the same family),
  DM Sans for body and UI, Space Mono for order codes and promo codes. All three
  are Google Fonts, so they are free to embed, ship and hand to any vendor. Do
  not substitute.

### 3.3 Layout & spacing
- **4-px base scale where the step number *is* the multiple**: `--space-6` is
  24px, `--space-10` is 40px. Steps 1–12 run in fours, then 14, 16, 18, 20, 24,
  32 (56–128px); half steps `--space-0-5` (2px) and `--space-1-5` (6px) exist for
  optical nudges. 16 / 24 / 40 do most of the work. Content max width `1200px`; gutters 20px mobile / 40px desktop.
- Sections breathe: 56px vertical on mobile, 96px desktop.
- **Fixed elements:** website header is sticky, 72px, translucent white with
  `--blur-glass` once scrolled past the hero. App has a fixed 64px bottom tab
  bar and a sticky cart bar above it. Nothing else is pinned.
- Menus and card grids are honest grids with `gap`, not masonry.

### 3.4 Backgrounds, imagery, texture
- **Food photography is the hero.** Warm, high-saturation, hard-ish light,
  shot close and cropped tight — steam, char, chilli oil visible. Slightly warm
  white balance; never cool, never desaturated, never black & white.
- Full-bleed imagery for heroes and category headers; 4:3 or 1:1 crops in cards.
- **The diamond carries the mark.** Every small diamond the system draws —
  heat levels, review scores, order-step markers, status dots — is a rotated
  square with the brand mark inside it: white at 35% on a coloured fill, pink at
  45% on an empty `--ink-200` fill so it never blends away. The loader is the
  bare mark, pulsing.
- **The diamond symbol is the only pattern.** Tiled/rotated at 6–10% opacity it
  makes the brand's one texture (used on pink panels, ticket stubs, loading
  states). No noise, no grain, no paper texture, no hand-drawn illustration.
- Images always carry `--radius-md` (10px → `--radius-lg` 16px on cards) except when
  full-bleed.

### 3.5 Cards, borders, shadows
- **Default card:** white fill, `--radius-lg` (16px), `1px --border-subtle`,
  `--shadow-1`. On hover it lifts `--lift-y` (−2px) to `--shadow-3`.
- **Feature card:** `--pink-100` fill, no border, no shadow, `--radius-xl`.
- **Menu row:** no card at all — a `1px --border-subtle` rule between rows.
- Shadows are warm-ink tinted and used sparingly (levels 1–3); `--shadow-brand`
  (pink glow) is reserved for the primary CTA and the floating cart button.
- **No card has a coloured left border.** Ever.
- Borders on inputs are 1px `--border-default`, going 2px `--border-brand` on
  focus plus `--focus-ring`.

### 3.6 Radii
4 / 6 / 10 / 16 / 24 / pill. The brand's forms are geometric, so nothing is
blobby: chips and buttons are **pill**, cards 16, sheets and modals 24 (top
corners only on bottom sheets), inputs 10, thumbnails 10, avatars circular.

### 3.7 Motion
- Short and matter-of-fact. `--dur-fast 140ms` for hovers, `--dur-base 220ms`
  for state changes, `--dur-slow 340ms` for sheets and page transitions.
- `--ease-out` for anything entering, `--ease-in-out` for moves,
  `--ease-entrance` for sheets. **`--ease-pop` (one overshoot) is reserved for
  add-to-cart and reward confirmations** — nowhere else. No bouncing UI.
- Fades are always paired with a small translate (8–12px), never opacity alone.
- Respect `prefers-reduced-motion`: keep the fade, drop the translate.

### 3.8 States
- **Hover:** darken pink one step (`--brand-hover`); on white surfaces tint to
  `--pink-50`; on imagery, brighten scrim slightly. Never opacity-fade a button.
- **Press:** `scale(var(--press-scale))` = 0.97 **and** darken to
  `--brand-active`. Both, together, 80ms.
- **Focus:** 2px pink outline, 2px offset (or `--focus-ring` inset for fields). On pink, ink or status fills the ring is white.
- **Every pressable thing has all five states — rest, hover, press, focus-visible, disabled.** No exceptions: Button, IconButton, TextButton, Link, Tag, Pagination, Tabs, TabBar, Accordion, ListRow, SlotPicker, QuantityStepper, Menu rows, calendar days, coupon stub, Checkbox/Radio/Switch, field triggers (hover = `--border-strong`). They all read one hook, `usePress` (exported from `TextButton.jsx`), and the `--state-*` tokens: `--state-hover` (pink-50) / `--state-press` (pink-100) on light, `--state-hover-on-color` / `--state-press-on-color` (white 16% / 28%) on pink, ink and status fills, `--state-hover-tint` / `--state-press-tint` for neutral overlays. A text-only action (toast CTA, "Undo", "Edit") is a **TextButton**, never a bare `<button>` — at rest it reads as a word, on hover it gains a tinted pill.
- **Disabled:** `--ink-200` fill, `--ink-400` text, no shadow, `cursor:not-allowed`.
  Not just reduced opacity.
- **Text colour follows the surface, never the component.** Any flooded field
  carries `data-surface="brand" | "ink" | "soft"` (Card, Section, PatternField,
  SiteFooter and PostFrame set it automatically; raw HTML can add the attribute
  or the `.pp-on-brand` / `.pp-on-ink` / `.pp-on-soft` class). Inside that
  scope the semantic tokens remap — `--text-heading` and links go white,
  `--text-body` to 90% white, borders to translucent white — so an `<h2>`, a
  `<p>`, a `Text` or a `Link` needs no colour override to sit on pink or ink.
  Never hard-code `#fff` on a heading; put it on a surface.
- **Form status is one system across every control** — `default`, `error`
  (danger), `success` (mint), `warning` (turmeric), plus `disabled`,
  `readOnly` (sunken fill + lock) and `loading` (trailing spinner). A status
  raises the border to 2px, tints the leading icon, shows the matching glyph on
  the right and replaces `hint` with the status message. Never show a status
  colour without a message.
- **Loading:** pink diamond symbol pulsing at 1.2s, or a `--pink-100` skeleton
  block. No spinners with gradients.

### 3.9 Transparency & blur
Used in exactly three places: the scrolled site header (`--surface-glass` +
`--blur-glass`), modal/sheet scrims (`--surface-overlay`, 56% ink), and the
legibility scrim under text sitting on photography. Never on cards, never as
decoration, never "glassmorphism".


### 3.10 Responsive rules (apply to every screen surface)
- **Breakpoints:** `--bp-sm 480` · `--bp-md 768` · `--bp-lg 1024` · `--bp-xl 1280` ·
  `--bp-2xl 1440`. Column counts: 1 → 2 → 3 → 4 → 4 (capped by `--container-max`).
  Every design must survive **360px** on the low end.
- **Never use a bare `1fr` track.** Always `minmax(0, 1fr)` (or the
  `.pp-autogrid` utility, `repeat(auto-fit, minmax(min(260px,100%),1fr))`) —
  `1fr` carries a min-content floor and a long uppercase label will silently
  widen the track and overflow the row.
- **Type is fluid in layouts**, fixed only in specimens and on marketing
  canvases: `--fs-display-1-fluid`, `--fs-h1-fluid` … and the matching
  `.pp-fluid-*` classes. Never hard-code a display size in a responsive layout.
- **Fluid rhythm:** `--gutter-fluid` clamp(20→40), `--section-y-fluid`
  clamp(56→96), `--gap-grid` clamp(16→24).
- **Nothing clips text.** Buttons, tags and pills are `white-space: nowrap` +
  `flex: 0 0 auto`; anything that could get long uses `text-wrap: pretty`
  (prose), `text-wrap: balance` (headlines) or `.pp-clamp-2` / `.pp-clamp-3`.
  A nav shortens its link list at 1280/1080 rather than clipping a word.
- **Flex rows that hold text carry `min-width: 0`**, and any row that can run
  out of space uses `flex-wrap: wrap` with a `gap` — never per-child margins.
- **Fixed-height controls never wrap:** 36/44/54px buttons, 48px fields,
  38px tags, 44px minimum touch target (`--hit-min`).
- **Images** are capped by the global `img{max-width:100%}` and always sit in an
  `aspect-ratio` box, so a missing photo can't collapse a layout.
- **Motion respects `prefers-reduced-motion`** globally (durations collapse in
  `tokens/base.css`).

### 3.11 Depth ladder
Six deliberate steps, all warm-ink tinted — pick by *meaning*, not by taste:
| Token | Where |
| --- | --- |
| none | Flat panels, feature/quiet cards, menu rows |
| `--shadow-1` | Card at rest, status bar edges |
| `--shadow-2` | Dropdowns, floating search field, secondary buttons on pink |
| `--shadow-3` | Card hover, toasts, coupons, offer seals |
| `--shadow-4` | Modals, sheets, device frames, hero image |
| `--shadow-brand` | Primary CTA and the floating add button — pink glow, nothing else |

---

## 4. Iconography

- **No icon set was supplied with the brand assets.** The system therefore
  standardises on **Lucide** (`https://unpkg.com/lucide-static`) — 24px grid,
  1.75–2px stroke, round caps, geometric construction, which is the closest
  available match to the logo's even-weight geometry. **This is a substitution;
  flagged in §7.**
- Stroke icons only, `stroke-width: 1.75` at 20–24px, `2` at 16px. Icons take
  `currentColor` — never a second colour, never filled + stroked together.
- Sizes: 16 (inline with body), 20 (buttons, list rows), 24 (nav, tab bar),
  32 (empty states).
- **Brand glyphs are PNG/SVG assets, not icons:** the diamond symbol
  (`assets/symbol-*.svg`) is a brand mark used for bullets, loaders, pattern
  tiles, and the app's launcher — do not restyle or recolour it beyond
  pink/white. The chilli in the logo is part of the lockup and must not be
  extracted as a standalone icon.
- **Emoji are never used as icons** — including 🌶 for spice. Heat is shown with
  the `SpiceLevel` component (filled diamonds on the `--heat-*` scale).
- Unicode is used for two things only: `₹` and the en dash in ranges.
- The kitchen is **100% vegetarian**, so the only diet marks in this system are
  the statutory green square-and-dot (veg) and a turmeric dot for the few
  egg-containing bakes. Render them as `DietMark` — never as emoji, and never
  add a non-veg mark.


## 4b. Marketing, social & digital media

The brand ships far more artwork than product UI, so canvases are tokenised.

### Formats — the only seven
| Token pair | Size | Use |
| --- | --- | --- |
| `--canvas-post-*` | 1080×1080 | Instagram feed 1:1, carousel slides |
| `--canvas-portrait-*` | 1080×1350 | Feed 4:5 — the loudest, default for statements |
| `--canvas-story-*` | 1080×1920 | Stories, Reels covers |
| `--canvas-landscape-*` | 1200×628 | Link previews, OG images, email headers |
| `--canvas-wide-*` | 1920×1080 | In-store screens, menu boards |
| `--canvas-leaderboard-*` | 728×90 | Display ad |
| `--canvas-mpu-*` | 300×250 | Display ad |

Never invent a size outside this list; add one to `tokens/canvas.css` instead.

### Canvas rules
- **Build every asset inside `PostFrame`** — it pins the true pixel canvas and
  scales for preview, so nothing is designed at an arbitrary size.
- **Canvas type is its own scale** (`--fs-canvas-hero` 132 → `--fs-canvas-overline`
  24) used through `SocialHeadline`. Screen `--fs-*` sizes look like fine print
  on a 1080 canvas and must never be used there.
- **Safe margins:** `--canvas-pad` 72px on 1080 canvases (`--canvas-pad-tight`
  48px on 1200×628). Stories keep the top `--story-safe-top` 250px and bottom
  `--story-safe-bottom` 320px clear of platform chrome.
- **One idea per board.** Overline + headline + signature. Headlines ≤ 6 words,
  `text-wrap: balance`, 2–3 lines maximum.
- **Composition:** flooded `--pink-500` with the tiled diamond pattern is the
  house look; the alternates are ink `--ink-900` (statements) and `--pink-50`/
  `--pink-100` (light, product-led). One field colour per board.
- **One `OfferSeal` per board**, cornered and allowed to bleed off the edge —
  but **the number itself must stay fully inside the canvas**. Pass `bleed`
  rather than positioning the seal by hand; the component clamps the offset to
  0.18 × `size` (the counter-rotated value reaches ~0.32 × `size` from centre).
  Rotated diamond only — never a circular starburst or a ribbon.
- **Every board is signed** with `LogoLockup` (or `Logo` on small ad units).
  Wordmark ≥ 200px on a 1080 canvas; use the white lockup on pink/ink.
- **Photography is the other half.** Warm, close-cropped, high-saturation, hard
  light. Placeholders in these kits are labelled with the exact crop needed.
- **Display ads** get the smallest possible message: mark, one line, one button.
  Long text is ellipsised, never shrunk below 20px.
- **Prices on artwork** use `PriceTag` scaled up — `₹`, no decimals, no space.

---

## 5. Files

| Path | What |
| --- | --- |
| `styles.css` | Global entry point — `@import` list only. Link this one file. |
| `tokens/` | `fonts`, `colors`, `typography`, `spacing`, `breakpoints`, `canvas`, `elevation`, `motion`, `base` |
| `assets/` | Logo lockups + symbol, pink and white, background-free |
| `guidelines/` | Foundation specimen cards (Design System tab) |
| `components/` | React primitives — see below |
| `ui_kits/website/` | Marketing site recreation |
| `ui_kits/app/` | Ordering app recreation |
| `ui_kits/marketing/` | Instagram, story and display-ad artboards |
| `templates/` | Copy-and-go starting points for consuming projects |
| `brand.js` · `tokens/brand.module.js` | Company facts — legal, GST, contact, outlets, billing |
| `SKILL.md` | Agent Skills entry point |
| `handoff/` | Developer handoff — README, TOKENS, COMPONENTS, SCREENS, BRAND |
| `thumbnail.html` | Homepage tile for this design system |
| `uploads/` | The original brand files as supplied |

### Assets
All **SVG**, cropped tight to the ink and centred, so they scale cleanly from a
10px status dot to a 1080px canvas. Three variants × three tones = nine files.

**Use the lockup — the one with the tagline — by default.** The tagline tucks
into the white space beside the "P" descender, so the lockup and the wordmark
occupy the same ~1.9:1 box: swapping the full logo in costs no layout anywhere.
The wordmark exists only for units under about 120px wide, where the tagline
falls below ~6px and turns to mud. Every header, footer, app screen, artboard
and template in this system ships the lockup.

| File | Use |
| --- | --- |
| `assets/logo-lockup-pink.svg` | **The official logo.** Tagline included. On white / light |
| `assets/logo-lockup-white.svg` | Official logo on pink, ink or photography |
| `assets/logo-lockup-badge.svg` | Official logo on a pink plate — social headers, covers |
| `assets/logo-wordmark-pink.svg` | Wordmark only, no tagline — units under ~120px |
| `assets/logo-wordmark-white.svg` | Wordmark only, on pink / ink |
| `assets/logo-wordmark-badge.svg` | Wordmark only, on a pink plate |
| `assets/symbol-pink.svg` | Standalone diamond mark on light; square 1:1 |
| `assets/symbol-white.svg` | Standalone mark on pink/ink; pattern tile |
| `assets/symbol-badge.svg` | Mark on a pink plate — app icon, favicon, avatar |

All nine are rebuilt from the vendor SVGs in `uploads/` (`logo-1.svg` wordmark,
`logo-2.svg` lockup, `logo-3.svg` badge lockup, `logo-4.svg` badge symbol,
`symbol-1.svg` symbol) — vector, tightly cropped to the ink, with the symbol
forced to a true square. The pink and white variants are the same artwork
recoloured; the badge variants nest that artwork inside a pink plate at fixed
padding, so nothing is ever rescaled by hand.

**The tagline "India's First Desi Urban Café" is part of the lockup artwork.**
Never set it in live type next to the mark — it is drawn, kerned and locked to
the wordmark, and retyping it will drift. `LogoLockup` renders the real file.

Reach for all of these through the `Logo` component
(`variant="lockup" | "wordmark" | "symbol"`, `tone="pink" | "white" | "badge"`)
rather than placing files by hand. The `pink` and `white` files have transparent
backgrounds; only `badge` carries a plate.

Clear space around any logo = the height of the "P". **Minimum lockup width
200px** — below that the tagline stops reading, so switch to `wordmark`
(minimum 140px). Never recolour, outline, rotate, or add effects to the logo.

### Components (Atomic Design)
The library follows **Atomic Design**. Four tiers, one folder each, and every
component ships a `.jsx`, a `.d.ts` props contract, a `.prompt.md` usage note and
a `.card.html` **story** showing all of its variants in the Design System tab.

#### `components/atoms/` — 31 indivisible primitives
Typography & links: **Text**, **Link**
Brand: **Logo**, **Icon**, **PatternField**, **SocialHeadline**
Actions: **Button**, **IconButton**, **TextButton**, **Tag**
Surfaces: **Card**, **Divider**, **ImageSlot**
Form controls: **Input**, **Select**, **Checkbox**, **Radio**, **Switch**
Overlays: **Popover** (floating surface / bottom sheet), **Menu** (the shared option panel)
Indicators: **Badge**, **StatusDot**, **Avatar**, **Rating**, **ProgressBar**,
**Spinner**, **Skeleton**, **Tooltip**
Menu primitives: **DietMark**, **SpiceLevel**, **PriceTag**

#### `components/molecules/` — 30 small compositions
Forms: **Field**, **SearchField**, **QuantityStepper**, **OtpInput**, **SlotPicker**, **Combobox**, **DatePicker**
Overflow: **ActionMenu**
Messaging: **Alert**, **Toast**, **Snackbar**, **EmptyState**
Navigation: **Tabs**, **Breadcrumb**, **Pagination**
Content: **SectionHeader**, **Stat**, **Accordion**, **ListRow**, **PriceSummary**,
**StepTracker**
Domain: **MenuItemRow**, **MenuItemCard**, **OutletCard**, **ReviewCard**,
**LoyaltyCard**, **FilterBar**
Marketing: **LogoLockup**, **OfferSeal**, **CouponTicket**

#### `components/organisms/` — 12 complete sections
Website: **SiteHeader**, **SiteFooter**, **HeroBanner**, **MenuList**, **CtaBand**,
**StatBand**, **TestimonialWall**, **FaqSection**
App: **TabBar**, **Dialog**, **CartPanel**, **OrderTracker**

#### `components/layouts/` — 7 templates & spacing primitives
**Container**, **Section**, **Stack**, **Cluster**, **AutoGrid**, **AppShell**,
**PostFrame**

**Pages** — the fifth Atomic Design tier — are the UI kits in `ui_kits/`.

#### `templates/` — starting points
Consuming projects pick these from the template picker; each is one file plus a
`ds-base.js` that loads this system.

| Template | What it seeds |
| --- | --- |
| `templates/website/` | The full marketing homepage — header, hero, menu, proof, reviews, FAQ, CTA, footer |
| `templates/app/` | Two 390×844 app frames — menu list and cart — with the tab bar wired |
| `templates/social-post/` | 1080×1080 and 1080×1350 Instagram artboards at true canvas scale |

#### Rules for the tiers
- An **atom** owns no layout beyond itself and imports nothing but `Icon`.
- A **molecule** composes atoms and stays content-agnostic.
- An **organism** is a whole section, sets its own width/rhythm, and is the
  largest thing a page should have to assemble.
- A **layout** carries no visual style of its own — only spacing, width and frame.
- `components/_story.css` and `components/_story.js` are the shared shell every
  story card loads; they are not part of the shipped library.

**Intentional additions** (no source defined a component inventory, so a
standard set was authored; these five are brand-specific and justified):
- `SpiceLevel` — the brand is named after a chilli; heat needs a first-class,
  non-emoji representation.
- `DietMark` — the statutory veg mark is legally required on Indian menus.
- `PriceTag` — enforces the `₹`/no-decimal/strike-through-original rules.
- `MenuItemRow` / `MenuItemCard` — the atom both surfaces are built from.
- `PostFrame` / `SocialHeadline` / `LogoLockup` / `PatternField` / `OfferSeal` /
  `CouponTicket` — the brand ships mostly marketing artwork, and these pin the
  canvas sizes, canvas type scale and signature block so no asset is designed at
  an invented size.
- `SlotPicker`, `OtpInput`, `SearchField` — required by the ordering flow.
- `Popover`, `Menu`, `Combobox`, `DatePicker`, `ActionMenu` — no browser-native UI anywhere: every dropdown, list, calendar and overflow menu is ours. `Input` refuses date/time/color/file/range types; `required` is announced via aria-required (no browser validation bubbles) — forms use `noValidate` and our error states; scrollbars use the `--scrollbar-*` tokens.
- `Logo` — wraps the asset files so nobody hand-places or recolours the lockup.

---

## 6. Design System tab groups
`Brand` · `Colors` · `Type` · `Spacing` · `Layout` · `Motion` · `Marketing` ·
`Atoms` · `Molecules` · `Organisms` · `Layouts` · `Website` · `App`

Every component has its own card in its tier group — that grid **is** the
storybook. Each card shows the component under every variant, size, tone and
state it supports, labelled with the prop that produces it.

---

## 7. Open questions / flagged substitutions

1. **Icons are Lucide**, loaded from a CDN. Fine for prototyping; decide whether
   to self-host before production.
2. **No photography was supplied.** Every image slot in the UI kits is a
   labelled placeholder. Real food photography would change these screens most.
3. **The two secondary accent choices** (turmeric/tandoor/mint/kesar) are an
   interpretation of "desi urban", not a supplied palette.
4. **The UI kits are brand-plausible, not product-accurate.** If a real site or
   app exists, share it and they should be rebuilt from that source.
