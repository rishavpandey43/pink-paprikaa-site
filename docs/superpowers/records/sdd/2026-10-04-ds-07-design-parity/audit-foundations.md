# Audit — foundations parity vs Claude Design handoff (6b1e28a)

Read-only. Format: `- design says → we have → exact change`.
Prefixes: `DS/` = `zip-files/Pink Paprikaa Design System/`; `tok/` = `packages/design-tokens/tokens/`;
`dist/` = `packages/design-tokens/dist/` (built 2026-10-04 15:20, fresh vs sources); `ui/` = `packages/ui/src/`;
`sb/` = `apps/storybook/src/`; `content/` = `packages/content/src/brand/`.
Naming map (not a gap): `--dur-*`→`--duration-*`, `--press-scale`→`--motion-press-scale`, `--focus-ring`→`--shadow-focus-ring`,
`--scrim-*`→`--effect-scrim-*`, `--container-max`→`--container-content`, `--measure-*`→`--container-prose*`,
`--fs/lh/ls-*`→`--text-*` + `--line-height`/`--letter-spacing`, `--space-N`→Tailwind `--spacing: 4px` multiplier (p-6 = 24px),
`--blur-glass: blur(14px)`→`14px` (Tailwind blur namespace). All value-identical.

## Tokens (10: 3 missing, 7 different — 5 of those deliberate, keep)

Matched value-for-value: pink 50–800, ink 000–900, 4 spices + soft, status 8, heat 1–4, surface 9, border 5, brand-hover/active,
all typography (display/h1–h4/body/caption/overline/mono + 7 fluid), weights, fonts, breakpoints 5, canvas 26, radii 6,
border-width 2, shadows 1–4/brand/inset, scrims, motion 9 + lift, card-min/-wide, gap-grid, header 88, tabbar 64, hit 44.

### Missing
- `--scrollbar-thumb/-thumb-hover/-track/-size` (pink-200 / pink-300 / transparent / 8px) `DS/tokens/colors.css:116-121` → none → add `tok/semantic/color.json` `color.scrollbar.{thumb:{color.pink.200},thumb-hover:{color.pink.300},track:transparent}` + `tok/primitive/space.json` `spacing.scrollbar: 8px` (utility: []).
- `--state-*` 11 tokens `DS/tokens/colors.css:124-136` → only scattered equivalents (`color-button-hover-tint` pink-50 component-scoped, `white-alpha-16/28` primitives) → add `tok/semantic/color.json` `color.state.{hover:{pink.50}, press:{pink.100}, hover-neutral:{ink.100}, press-neutral:{ink.200}, press-danger:#F8D4D4 (new primitive danger-press), hover-on-color:{white-alpha.16}, press-on-color:{white-alpha.28}, hover-tint:{ink-alpha.06}, press-tint:{ink-alpha.12}, disabled-fill:{ink.100}, disabled-ink:{ink.400}}`; add `ink-alpha.06` rgba(26,18,22,.06) and `ink-alpha.12` rgba(26,18,22,.12) to `tok/primitive/color.json:77` block. Then repoint component hover/press tints at them.
- Press-scale variants `DS/handoff/INTERACTIONS.md:12` (.92 icon/stepper/marks/calendar, .94 page buttons, .99 cards) → only `.97` `tok/primitive/motion.json:21` → add `motion.press-scale-icon .92`, `-page .94`, `-card .99` + `@utility press-scale-*` in `ui/styles.css:255` (avoids arbitrary `scale-[.92]`).

### Different value
- `--gutter-mobile 20px`, `--gutter-fluid clamp(20px,4vw,40px)` `DS/tokens/spacing.css:28`, `DS/tokens/breakpoints.css:20` → `16px`, `clamp(16px,4vw,40px)` `tok/primitive/space.json:8-9` → set 20px / `clamp(20px, 4vw, 40px)`; drop "Handoff value (spec C8)" description (older handoff, superseded).
- `--section-y-mobile 56px`, `--section-y-fluid clamp(56px,7vw,96px)` `DS/tokens/spacing.css:30`, `DS/tokens/breakpoints.css:21` → `48px`, `clamp(48px,8vw,96px)` `tok/primitive/space.json:11-12` → set 56px / `clamp(56px, 7vw, 96px)`; update `sb/foundations/spacing/layout-rhythm.mdx:19-21` prose.
- `--text-subtle ink-500` `DS/tokens/colors.css:50` → ink-600 `tok/semantic/color.json:19-21` → KEEP (ink-500 = 3.79:1, fails handoff's own §6.2 4.5:1); no change.
- `--text-brand pink-500` `DS/tokens/colors.css:51` → pink-600 `tok/semantic/color.json:23-25` → KEEP (4.04:1); no change.
- brand/ink surface `--text-body .9 / -muted .76 / -subtle .62` `DS/tokens/colors.css:94-96` → `ink-000 / white-92 / white-85` `tok/surface/brand.json:19-21`, `tok/surface/ink.json:13-15` → KEEP (white on pink-500 is already <4.5; alpha makes it worse); add a `$description` citing contrast-pairs.json so the divergence is recorded.
- brand surface `--text-brand pink-100` `DS/tokens/colors.css:105` → ink-000 `tok/surface/brand.json:22` → KEEP or set pink-100 if contrast-pairs passes; measure first (pink-100 on pink-500 ≈ 3.2:1 → keep white).
- soft surface `--text-brand pink-600` `DS/tokens/colors.css:109` → pink-700 `tok/surface/soft.json:7-9` → KEEP (4.08:1).

### Extra (ours only — keep, document)
`*-strong` (mint/turmeric/kesar/danger), `veg`, `text-success/warning/danger/info`, `color-focus`, `white-alpha-*` ramp, z-index 7,
aspect 7, container narrow/article, `header-compact`, `dock-clearance`, `radius-diamond`, `motion-reveal-distance`, `pattern-*`,
`shadow-selected`, `shadow-field-ring-*`, `surface/light.json`, soft `link-hover pink-800` `tok/surface/soft.json:12`. No action.

## Global interactions (17: 12 gaps, 5 OK)

- Scrollbars: thin, `--scrollbar-*` on `*` + `::-webkit-scrollbar*` `DS/tokens/base.css:30-34` → absent from `ui/styles.css` → add to `@layer base` (after line 143): `* { scrollbar-width: thin; scrollbar-color: var(--color-scrollbar-thumb) var(--color-scrollbar-track) }` + the 4 webkit rules verbatim.
- `::selection { background: pink-100; color: pink-800 }` `DS/tokens/base.css:38` → absent → add to base layer.
- Search cancel/decoration hidden **globally** `DS/tokens/base.css:35` → opt-in `@utility search-reset` `ui/styles.css:350-359` → move the pseudo-element rules into `@layer base` on `input[type=search]`; keep utility or delete it.
- Number spinners hidden globally `DS/tokens/base.css:36-37` → absent → add `input[type=number]{appearance:textfield}` + inner/outer spin-button `appearance:none; margin:0` to base layer.
- `@keyframes pp-pop-in` (−4px, .98) for popover/menu/select open, 140ms `DS/tokens/base.css:47`, `DS/handoff/INTERACTIONS.md:68` → missing; overlays have no open animation (`ui/molecules/popover/popover.tsx`, menu, select, combobox, date-picker: no `animate-*`) → add keyframe after `ui/styles.css:507` + `--animate-pop-in: pp-pop-in var(--duration-fast) var(--ease-out)` in `@theme` `ui/styles.css:33-43`; apply `data-[state=open]:animate-pop-in` on panels.
- Focus ring `outline 2px pink-500, offset 2px, radius-xs` on a/button/input/select/textarea/[tabindex] `DS/tokens/base.css:11` → `:focus-visible` outline via `--color-focus` `ui/styles.css:129-132`; radius only on `a` `:135-137` → OK (universal is a superset). White on status fills `DS/handoff/README.md:142` → only brand/ink surfaces remap `--color-focus` → confirm every status-filled pressable (Toast success/danger, Alert) sets `data-surface`; toast does (`ui/molecules/toast/toast.tsx:136`).
- Reduced motion `DS/tokens/base.css:39` → `ui/styles.css:145-154` (+iteration-count, scroll-behavior) → OK.
- Timing: colour 140ms, transform 80ms, ease-out `DS/handoff/INTERACTIONS.md:11` → `@utility transition-control` `ui/styles.css:265-272` → OK.
- Hover pointer-only, never on touch `DS/handoff/INTERACTIONS.md:7` → Tailwind v4 `hover:` is `@media (hover:hover)`-gated → OK.
- Press on Space **and Enter** keydown `DS/handoff/INTERACTIONS.md:8` → CSS `active:` only (Space on button yes, Enter no, Enter on links no) → decide: add a tiny `usePress`-equivalent (`data-pressed` on keydown Enter/Space → keyup) in `ui/lib/` and `data-pressed:` variants, or accept the CSS limit and record it.
- Field hover `1px --border-strong`; Checkbox/Radio/Switch tint the **whole row** pink-50 / press pink-100 `DS/guidelines/form-states.card.html:11`, `DS/handoff/INTERACTIONS.md:58-63` → no `hover` in `ui/lib/field-control.tsx`, `ui/atoms/checkbox/checkbox.tsx`, `radio.tsx`, `switch.tsx` → add `hover:border-border-strong` (not when focused/status) in field-control root; row `hover:bg-state-hover active:bg-state-press` on choice-control rows.
- Native-control policy: never native `<select>` `DS/handoff/README.md:93` → `ui/atoms/select/select.tsx:75` renders `<select>` (doc says "It is the platform's `<select>`" `select.stories.tsx:37`) → rebuild Select on `Popover`+`Menu` (listbox, `role="combobox"` trigger, typeahead 600ms, sheet ≤640px) per `DS/handoff/README.md:189-197`. Biggest single gap.
- Input type policy: refuse date/time/datetime-local/month/week/color/file/range; `number` → text + decimal keypad `DS/handoff/README.md:94-95` → `ui/atoms/input/input.tsx:29-33` accepts any `type` (passthrough at `:76`) → narrow the prop type to `"text"|"tel"|"email"|"url"|"search"|"password"|"number"`, map `number` → `type="text" inputMode="decimal"`, dev-warn on refused types; fix `ui/molecules/field/field.stories.tsx:109`.
- Validation bubbles: controls set `aria-required`, never `required`; forms `noValidate` `DS/handoff/README.md:97` → `ui/molecules/field/field.tsx:95` sets `control.required = true` → change to `control["aria-required"] = true`.
- `title` tooltips banned (Avatar has a `tooltip` prop) `DS/handoff/README.md:96` → `ui/atoms/avatar/avatar.tsx:71` sets `title` → remove; add optional `tooltip` prop wrapping `Tooltip`.
- `TextButton` + `usePress` are the build-order prerequisite for every pressable `DS/handoff/README.md:79`, `DS/SKILL.md` "Rules that are easy to miss" → no TextButton atom in `ui/atoms/` → add `TextButton` (brand/neutral/danger × on light/dark/brand, `caps`, sizes) before Toast/Snackbar action rework.
- Lint gate (recommend): no gate stops native `<select>`, `type="date|time|…"`, `required`, `title=` on DOM → add `no-restricted-syntax` selectors in `tools/eslint-config` (workspace-wide, like `no-raw-hex`).

## Foundations pages (3 changed cards with gaps; 30 unchanged cards 1:1 mapped)

All 33 cards map to a page via `{/* source: … */}` comments (verified). Unchanged cards inherit the token deltas above
(`layout-rhythm` gutter/section values; `semantic`/`ink` show text-subtle = ink-600 by design).

- **states.card.html** (rewritten 760×1320) `DS/guidelines/states.card.html:1-31`: rule paragraph; 5-state matrix (rest/hover/press/focus/disabled) for Button primary/secondary/ghost, TextButton, TextButton `on="brand"` caps, IconButton secondary, Link, Tag, PageButton; 12-token swatch grid (`--state-*`, `--brand-hover/active`); timing line → `sb/foundations/motion/states.mdx:9-25` + `motion.stories.tsx:111-138`: 3 live buttons, 7-token table, old copy ("on imagery lift the scrim", "fields use 3px focus ring") → rewrite mdx to the card's rule text (`states.card.html:16`); replace `States` story with a 5-column matrix per component — needs forced states: add `@storybook/addon-pseudo-states` (`pnpm add -D`) and use `parameters.pseudo` per column, or static `data-*` forcing; replace `StateTokens` with a swatch grid of the 12 tokens (after Tokens §Missing lands); add timing line. Blocked on TextButton + `--state-*` tokens.
- **form-states.card.html** `DS/guidelines/form-states.card.html:11-24` → `sb/foundations/motion/form-states.mdx:14-29`:
  - new `hover` row "1px border-strong · Input, Select, Combobox, DatePicker, SearchField, OtpInput; Checkbox/Radio/Switch tint the whole row" → missing → add row after `default` (`:16`).
  - error/success/warning "applies to" add Combobox, DatePicker → missing → update `:18-20`.
  - readOnly applies to "Input, Select, DatePicker" → "Input, Select" `:22` → add DatePicker.
  - 3 policy notes (No browser-native UI; No validation bubbles: `noValidate`, `aria-required`, validate on submit then on change; pickers = popover, flips, sheet ≤640px) `:21-23` → missing → add as a list under the table.
  - `FormStates` story `motion.stories.tsx:140-178` → add a hover specimen and a Combobox + DatePicker error row.
- **brand-company.card.html** `DS/guidelines/brand-company.card.html:23-24` adds boxes `Ordering` (website/swiggy/zomato URLs) and `Reviews` (googleRating line + link) → `sb/foundations/brand/company-details.tsx:51-113` has Identity/Legal/Contact/Billing/Social/Outlets only → add both boxes after Contact (blocked on content §Brand facts); add `googleRating` and `est` to derived lines `:141-148`; `Identity` add `about`.
- Unchanged-card spot checks: fonts weights match card/tokens exactly (`apps/storybook/.storybook/fonts.ts:6-17`); `motion.mdx` uses `--duration-*` names (rename map, fine).

## Kits — Website (13: 9 gaps, 4 keep/OK)

Order matches design: Header → Hero → Menu → Story → StatBand → Testimonials → Outlets → FAQ → CtaBand → Footer → Toast/Dialog
(`DS/ui_kits/website/index.html:84-133` vs `sb/kits/website/website-kit.tsx:101-393`).

- Booking body is `<form noValidate onSubmit>` `DS/…/index.html:121` → `<Stack>` `website-kit.tsx:365` → wrap in `<form noValidate onSubmit={e=>{e.preventDefault();hold();}}>`; footer button `type="submit" form=…`.
- `DatePicker label="Date" min={todayISO}` between Guests and Time `index.html:124` → absent → add `Field label="Date"` + `DatePicker` (value state `date`, min = today ISO local).
- Guests Select `icon="users"` `index.html:123` → no icon `website-kit.tsx:369-371` → add `icon={Users}` (once Select is the custom one).
- Mobile: `type="tel" inputMode="numeric"`, controlled, `error` from code validation — empty → "Add a mobile number so we can text your confirmation.", short → "That number looks short. We need all 10 digits.", clears on keystroke `index.html:52-57,125-126`, `DS/handoff/README.md:216-224` → uncontrolled, no validation, `isRequired` → native `required` `website-kit.tsx:380-389` → add `phone`/`phoneErr` state + `hold()` validator; pass `status="error" message={phoneErr}` to Field; `inputMode="numeric"`.
- "Hold My Table" calls validator `index.html:116` → sets booked directly `website-kit.tsx:351-354` → call `hold()`.
- Hero meta 3rd item "Open till 11:30pm" `index.html:89` → `brand.hours.weekday` "8am – 11:30pm" `website-kit.tsx:126-130` → derive `Open till ${close}` from brand hours (or accept; content wins).
- Hero body ends "Chai at 8am, chilli paneer at midnight." `index.html:88` → "Open 8am – 11:30pm, every day." `website-kit.tsx:125` → KEEP ours ("midnight" contradicts 11:30pm close) — flag to owner.
- Hero CTAs `on="brand"` primary + secondary `index.html:91` → no `on` prop `website-kit.tsx:138-147` → confirm HeroBanner sets `data-surface="brand"` so buttons remap; else pass it.
- StatBand "18 spices…", "100%", "4.6 average guest rating" `index.html:97-100` → established / 100% / hours `website-kit.tsx:216-222` → replace 3rd stat with `brand.reviews.google.rating` + "Google rating" (4.3 real; design's 4.6 is placeholder and contradicts brand.js). "18 spices" is an unverified claim → owner.
- Story stat "18 spices ground in-house, daily" `DS/…/Sections.jsx:22` → "1 kitchen" `website-kit.tsx:198-202` → owner to confirm "18"; keep ours until then.
- FAQ: design 4 Qs incl. "A few bakes contain egg" + "Delivery starts in 2027" `index.html:30-35` → ours "not even egg" + different set `sb/kits/fixtures.ts:232-…` → CONTENT CONFLICT (egg) → owner decision; product spec wins on content.
- Outlet directions → design maps link `DS/brand.js:57` → `outlet.mapsUrl ?? DIRECTIONS_URL` (null today) `website-kit.tsx:245`, `fixtures.ts:41` → fills once content gets `mapsUrl`; then delete `DIRECTIONS_URL`.
- Header translucent past 24px `DS/…/README.md:27` → `ui/organisms/site-header/site-header.tsx:30` glass on `data-scrolled` → OK. Extras (Search IconButton, "Pure veg" badge) → keep.

## Brand facts (9) — HARD RULE check: PASS

No founder identity anywhere in the handoff (grep founder/rishav/pandey/anand/"code to kitchen" over all `.md/.js/.jsx/.html/.css`, bundle and offline HTML: 0 hits). Legal entity (`legal.entity`, `billing.accountName`) present on both sides — allowed. `content/brand.spec.ts:18-19` guards it.

- `social.instagram` = `@thepinkpaprikaa`, `https://www.instagram.com/thepinkpaprikaa/` `DS/brand.js:41` → `@pinkpaprikaa`, old URL `content/brand-data.ts:36` → update.
- youtube + linkedin removed `DS/brand.js:40-42` → still present `content/brand-data.ts:37-42` → delete both (footer `SOCIAL_LINKS` follows automatically).
- `ordering: { website: order.pinkpaprikaa.com, swiggy, zomato }` (label + url) `DS/brand.js:44-48` → absent → add to `rawBrand` + Zod schema `content/brand-schema.ts` (url: `z.url()`); use for Order Now / delivery links.
- `reviews.google { rating 4.3, count 98, label, url }` `DS/brand.js:50-52` → absent → add + schema.
- outlet `maps` = `https://maps.app.goo.gl/y8xr1QtSW1kfQKwD7?g_st=ic` `DS/brand.js:57` → `mapsUrl: null` `content/brand-data.ts:57` → set.
- `about: "Opened in 2025."` `DS/brand.js:17` → absent → add (optional string).
- derived `lines.googleRating` "4.3 · 98 Google reviews", `lines.est` "Est. 2025" `DS/brand.js:87-88` → absent `content/brand-lines.ts:3-27` → add both to `BrandLines` + `toBrandLines`; spec test in `brand-lines.spec.ts`.
- `est` → we call it `established` `content/brand-data.ts:15` → keep name (value 2025 matches).
- Outlet address "HSVP Market, Sector 57" `DS/brand.js:57` → "HSVP Market (MKM Market), Sector 57" `content/brand-data.ts:54` → KEEP (deliberate reconciliation, documented in file header). Outlet `hours` design "TODO" → ours `null` → equivalent.

## Rules (README / SKILL / SETUP) (10)

- No browser-native UI anywhere (select, date/time/number pickers, `title`, validation bubbles, scrollbars, search ✕) `DS/handoff/README.md:91-100`, `DS/SKILL.md`, `DS/SETUP.md` → violated: `ui/atoms/select/select.tsx:75`, `ui/atoms/input/input.tsx:29-33`, `ui/molecules/field/field.tsx:95`, `ui/atoms/avatar/avatar.tsx:71`, base scrollbars/spinners → see Global interactions; add lint gate.
- Every pressable has 5 states via one hook + `--state-*` tokens; text actions are `TextButton`, never bare `<button>` `DS/SKILL.md`, `DS/handoff/README.md:139` → no TextButton, no `--state-*` → see above; then audit Toast/Snackbar/CouponTicket/inline "Edit/Undo" actions for bare buttons.
- Port Popover with a portal to `document.body` `DS/SETUP.md`, `DS/handoff/README.md:174` → Radix `Portal` `ui/molecules/popover/popover.tsx:93` → OK.
- Popover → bottom sheet at ≤640px (`sheet="auto"`, handle, label title, max-h `min(70vh,520px)`, scrim, `pp-sheet-in`, safe-area) `DS/handoff/README.md:175-180` → no sheet mode in popover → add; note 640 is not one of our breakpoints (480/768) → add a `max-[640px]` custom variant or `--breakpoint-sheet: 640px` token (decide).
- Text colour follows the surface; never black on pink `DS/SKILL.md`, `DS/handoff/README.md:105` → surfaces.css remaps + contrast-pairs gate → OK.
- Contrast 4.5:1 text (3:1 headline-only) `DS/handoff/README.md:106` → `packages/design-tokens/contrast-pairs.json` min 4.5 (brand-fill 3) → OK; this rule is why our text-subtle/brand/surface alphas diverge (keep).
- Fluid type in layouts, fixed `--fs-canvas-*` only on canvases `DS/handoff/README.md:110` → tokens present → OK (component check is out of scope here).
- Fixed sizes buttons 36/44/54, fields 40/48/56, tags 38, hit 44 `DS/handoff/README.md:117` → `dist/theme.css:55-57,82-84,145,162` → OK.
- Gutters 20→40, sections 56→96 `DS/handoff/README.md:114` → 16/48 → see Tokens.
- No raw hex in components; facts only from brand.js; never ship `uploads/`, cards, `_ds_*` `DS/handoff/README.md:66-72,296-297` → CLAUDE.md rules 3/7 + content package → OK. Copy rules (₹ format, casing, banned words) → `sb/foundations/brand/voice-and-content.mdx:32-42` → OK.

## Top gaps (ranked)
1. Native `<select>` in `ui/atoms/select/select.tsx:75` — rebuild on Popover+Menu (keyboard, typeahead, sheet).
2. `--state-*` (11) + scrollbar (4) tokens missing, and base layer lacks scrollbars/selection/number-spinner/search-cancel/`pp-pop-in`.
3. `TextButton` + press/hover mechanics absent (no field hover border-strong, no choice-row tint, no Enter-press) — blocks the new states card.
4. Validation/native-input policy: `field.tsx:95` emits `required`, Input passes any `type`, Avatar uses `title`; Website kit booking lacks `noValidate`, DatePicker and phone validation.
5. Brand facts stale: Instagram handle, youtube/linkedin, no `ordering`/`reviews`/`mapsUrl`/`googleRating`/`est` lines; gutter/section rhythm still on the superseded 16/48 values.
