# Parity audit — organisms + layouts (design handoff @ 6b1e28a vs `packages/ui`)

Read-only. `D/` = `zip-files/Pink Paprikaa Design System/components/`; `ui/` = `packages/ui/src/`.
The mapping uses our shared vocabulary (API spec §4): `tone`→`surface`, `multiple`/`bare`/`divide`/`nowrap`/`scroll`/`fit`/`safeArea`→`is*`/`has*`, `onX` callbacks→slots or `onValueChange`, px `width/height`→`frame`/`size`, `base`/`style` dropped (assets are bundled, and `sx` covers style). A renamed prop with the same meaning does **not** count as a gap.
Deliberate decisions are kept, not counted: pure-veg-only DietMark (spec C10, so no `diet:"egg"`), gutter `clamp(16px,4vw,40px)` (spec C8), and content-free defaults (no brand copy or company facts baked in: the default overline, title and steps, the `brand.js` footer facts).

## Summary

| Component       | Status                                              | #gaps |
| --------------- | --------------------------------------------------- | ----- |
| **Organisms**   |                                                     |       |
| CartPanel       | identical (API is slot-based)                       | 0     |
| CtaBand         | differs                                             | 1     |
| Dialog          | differs (+ extra `drawer` variant / `Drawer`)       | 1     |
| FaqSection      | differs                                             | 1     |
| HeroBanner      | differs                                             | 4     |
| MenuList        | differs                                             | 2     |
| OrderTracker    | differs                                             | 2     |
| SiteFooter      | differs (6b1e28a change absorbed)                   | 4     |
| SiteHeader      | differs (6b1e28a change missing)                    | 7     |
| StatBand        | identical                                           | 0     |
| TabBar          | differs (6b1e28a rewrite missing)                   | 3     |
| TestimonialWall | differs                                             | 2     |
| ActionDock      | extra (handoff-site organism)                       | —     |
| QuotePanel      | extra                                               | —     |
| ReviewCarousel  | extra                                               | —     |
| **Layouts**     |                                                     |       |
| AppShell        | differs (deliberate: `light` floods the status row) | 0     |
| AutoGrid        | differs                                             | 1     |
| Cluster         | identical                                           | 0     |
| Container       | differs (deliberate gutter; `default`→`content`)    | 0     |
| PostFrame       | identical                                           | 0     |
| Section         | differs                                             | 1     |
| Stack           | identical                                           | 0     |
| Box             | extra (§4)                                          | —     |
| Grid / GridItem | extra                                               | —     |
| _Cross-cutting_ | CONFLICT (low)                                      | 1     |

**Totals:** 20 design components (13 organisms + 7 layouts), all exist at the right tier, none missing. 6 identical, 14 differ, 0 missing, 6 extra (counting Dialog's `drawer` as a variant, not a component). **30 gaps**: 27 in organisms, 2 in layouts, 1 cross-cutting.
**Stories:** every design card row has a matching story (see the per-component notes). There are no story gaps.

---

## Organisms

### CtaBand

- [visual] Body sits 12px under the title (`D/organisms/CtaBand.jsx:16` `marginTop:12`; the title is at 10) → uniform `gap-2.5` (10px) (`ui/organisms/cta-band/cta-band.tsx:19`) → wrap the body in `mt-0.5`, or change `copy` to `gap-2.5` plus `[&>p]:mt-0.5`. Trivial.
- Stories: InkSplit, BrandCentred and SoftSplit match the card's 3 rows. ✓

### Dialog

- [interaction] The centred modal has no keyframe (`animation:"none"`, only a `transform` transition with `--dur-slow --ease-entrance`, `D/organisms/Dialog.jsx:14,26`). INTERACTIONS reserves `pp-sheet-in` for sheets → we apply `animate-sheet-in` to **every** variant (`ui/organisms/dialog/dialog.tsx:21`), so the modal slides up like a sheet → move `animate-sheet-in` into `variant.sheet.content`. Give `modal` a fade/scale-in, `pp-pop-in` (token: `--animate-pop-in` 140ms, which INTERACTIONS names for popover panels but `styles.css:34-42` lacks).
- API mapping (no change): `sheet`→`variant="sheet"`, `onClose`→`onOpenChange`, `width:460`→`size="md"` (the 460 token, and arbitrary widths go through `sx`), `open` default `true`→Radix uncontrolled. Extras: `drawer` variant + `Drawer`, `description`, `hasCloseButton`, `trigger`, `portalContainer`.
- Stories: CentredModal ("Book a table" with Select and Input) and Sheet ("Remove this item?") match. ✓ a11y: Radix labelledby beats the design's `aria-label={title}`. ✓

### FaqSection

- [visual] Two columns come from `auto-fit minmax(min(320px,100%),1fr)` (`D/organisms/FaqSection.jsx:9`), so they appear at roughly 700px of content width → we use `lg:grid-cols-2` (`ui/organisms/faq-section/faq-section.tsx:14`), which keeps 768–1023px single-column → use `md:grid-cols-2` or `autogrid-min-lg` (320). Keep the sticky `lead` at `lg` only.
- API: `multiple`→`isMultiple` ✓. Extras: `defaultOpen`, `aside`, `headingLevel`. Stories: Default ✓.

### HeroBanner

- [visual] Copy rhythm: overline→title 18, title→body 20, body→actions 32, actions→meta 36 (`D/organisms/HeroBanner.jsx:15-19`) → uniform `gap-5` (20px) (`ui/organisms/hero-banner/hero-banner.tsx:20`) → keep `gap-5`, then add `mt-3` to `actions` (32 total) and `mt-4` to `meta` (36 total). Overline→title is 18 vs 20: accept.
- [visual] Split collapses by `auto-fit minmax(min(340px,100%),1fr)` (`:12`), so it goes two-column at about 730px → `lg:grid-cols-2` (`hero-banner.tsx:37`) → `md:grid-cols-2`, or a `autogrid-min-[340]` utility (token: `grid-min-hero` 340px).
- [visual] Centred copy is capped at `22ch` and the body at `42ch` (`:13,16`) → `max-w-article` (760px) and `measure="narrow"` (44ch) (`hero-banner.tsx:40,131`) → add a `hero-banner-center-measure` 22ch token and apply it to the `center` variant's `copy` (token). The body at 44ch is close enough to accept.
- [visual] Padding is asymmetric: `clamp(44px,6vw,72px)` top, `clamp(52px,7vw,80px)` bottom (`:12`) → one `py-hero-banner-y` = `clamp(28px,6vw,80px)` → split it into `--spacing-hero-banner-top` and `--spacing-hero-banner-bottom` (token). Confirm first that 28px was not a handoff-mobile decision.
- API: `tone`→`surface` ✓ (+`alt`). `image`/`imageLabel`→`media` slot: the design auto-renders a 4:5 ImageSlot with `radius-xl` and `shadow-4`, and ours relies on the caller. Document this in the `media` JSDoc (no gap counted). Extras: `badges`, `titleSize`, `pattern`.
- Stories: BrandSplit and SoftCentred match the card rows ✓ (+InkSplit).

### MenuList

- [visual/a11y] An empty category always shows an EmptyState (symbol, "Nothing matches that yet.", "Try another category.", `D/organisms/MenuList.jsx:20`) → by default ours renders **nothing** (`ui/organisms/menu-list/menu-list.tsx:142-144`), leaving a silent blank panel → default `emptyState` to `<EmptyState variant="symbol" title=… body=…/>`, with an `emptyTitle`/`emptyBody` override like CartPanel's.
- [visual] The card track minimum is 240px (`:23`) → `autogrid` = 260 (`menu-list.tsx:48`). At around 1000px that gives 3 cards instead of the design's 4 → add a 240 step (token: `--spacing-grid-min-240` / `autogrid-min-card-sm`), or accept 260 and update the card's `gridCount` story.
- API: `cat`→`category`, `onAdd`→`renderItemAction`, `onOpen`→`getItemHref`, `title={null}` ✓. Stories: GridWebsite and ListApp ✓.

### OrderTracker

- [api] The status badge comes automatically from the step: `last ? "Ready" : "Preparing"`, `tone="ink"` (`D/organisms/OrderTracker.jsx:24`) → ours is a bare `badge` slot with no default (`ui/organisms/order-tracker/order-tracker.tsx:101`), so every caller recomputes it → add `statusLabels?: {pending, ready}` (default "Preparing"/"Ready") that renders `<Badge color="inverse" variant="solid">` when `badge` is unset.
- [visual] Pattern tile 58 (`:22`) → `tile={56}` (`order-tracker.tsx:99`), because no 58 utility exists → accept 56 (2px), or add `pattern-tile-58` (token). Recommendation: accept.
- API: `onDone`→`action` ✓. a11y extra: `role="status"` live region ✓. Stories: OrderIn, OnTheTandoor and Ready ✓.

### SiteFooter (6b1e28a set the design's social default to `["instagram"]`. Ours has no defaults, so there is nothing to change.)

- [visual] Social buttons are `IconButton on="brand"`: transparent with a white glyph, white 16% on hover, 28% on press (`D/organisms/SiteFooter.jsx:37`, INTERACTIONS "IconButton on=brand") → `variant="secondary"` (`ui/organisms/site-footer/site-footer.tsx:164`), which is a white disc with an ink-300 border and a pink glyph and is not surface-aware (`ui/atoms/icon-button/icon-button.tsx:43`) → use `variant="ghost"`, which is already surface-aware (`surfaces.css` brand: `icon-button-ghost-fg` ink-000, `button-hover-tint` white-16).
- [visual/interaction] Column links are the `Link variant="inverse"` atom: white, 40% underline at rest, solid underline plus white 16% bg on press (`:44`) → hand-rolled `text-text-link no-underline hover:underline` (`site-footer.tsx:58,205`), which has no rest underline and no press state → render the `Link` atom (`asChild` around `LinkComponent`) and drop the `link` slot.
- [visual] Policies are `Link variant="inverse" size="sm"` (`:54`) → `text-text-muted no-underline` (`site-footer.tsx:65,226`) → same as above, using `Link size="sm"`.
- [visual] The column track minimum is 220 (`:27`) → `autogrid-min-sm` = 200 (`site-footer.tsx:52`) → accept, or use `autogrid-min-[220]` (token).
- Stories: DesignSystemPink matches the single card row ✓.

### SiteHeader (6b1e28a added logo states and an aria-label. Neither is in ours.)

- [interaction] The logo link goes to opacity .82 on hover and scale .97 on press, with `--dur-fast`/`--dur-instant` (`D/organisms/SiteHeader.jsx:29-31`, INTERACTIONS "SiteHeader logo") → none (`ui/organisms/site-header/site-header.tsx:32,137`) → `home` slot: `rounded-sm transition-[opacity,scale] duration-fast ease-out hover:opacity-82 active:press-scale`.
- [a11y] The home link is named "Pink Paprikaa home" (`:29`) → its name comes from the Logo's `role="img"` title, "Pink Paprikaa" (`ui/atoms/logo/logo.tsx:68`) → add `homeLabel = "Pink Paprikaa home"` as the link's `aria-label`.
- [interaction] Nav links drop off at viewport ≥1280 all, ≥1080 4, ≥860 3, <860 none (`:15`) → ours is <lg(1024) none, lg–2xl(1440) 3, ≥2xl all (`site-header.tsx:23,58`) → the 1024–1279 range matches in spirit. At 1280–1439 the design shows all 5 and we show 3 → reveal links 4–5 from `xl` (1280) and the 6th from `2xl`, or record a decision against it (the `SixLinksAt*` budget stories were built for 6 links, while the design has 5).
- [visual] Nav links are the `Link variant="quiet"` atom: ink-700, pink-600 with an underline on hover, pink-700 on press (`:33`, INTERACTIONS) → hand-rolled `text-text-heading` (ink-900) with `hover:text-text-brand` and no underline or press state (`site-header.tsx:38-39`) → use `Link variant="quiet"` and keep our `isActive` border as an addition.
- [interaction] "Order Now" (primary sm, shopping-bag) shows at **every** width and "Book a Table" from 720px (`:43-44`). Search and cart IconButtons are always shown (`:36-41`) → `actions` is `hidden … lg:flex` (`site-header.tsx:41`), so below 1024 only `compactActions` plus the drawer appear, and 720 is not a breakpoint → document that `compactActions` must carry Order Now (and the cart) below lg, and add a story that proves it (`HandoffCompact` covers the handoff, not the DS row). Do not add a 720 breakpoint; use `md`.
- [api] `scrolled` is a controllable prop (`SiteHeader.d.ts`) → ours is internal only (`site-header-bar.tsx:27-32`), so a kit or screenshot cannot force the glass state without scrolling → add `isScrolled?: boolean` (an override; undefined keeps the scroll listener).
- [visual] Row gap is 24 (`:23`) → `gap-5` (20) (`site-header.tsx:31`) → `gap-6`.
- API mapping: `onOrder`/`onBook`/`onSearch`/`onCart`/`cart` → the `actions` slot (`IconButton count` does the badge) ✓. Extras: drawer (focus-trapped Radix sheet), skip link, `size="compact"`, `announcement`, `badge`. 88px height ✓ (the design's prompt says 72, but its token `--header-h` is 88).
- Stories: Rest and ScrolledWithCart match the card's 2 rows ✓.

### TabBar (6b1e28a rewrote it around `usePress` with an icon pill)

- [visual/interaction] A 56×30 `radius-pill` pill sits behind the icon: pink-50 when hovered or active, pink-100 and **pill** scale .92 when pressed (`D/organisms/TabBar.jsx:18-21`, INTERACTIONS "TabBar item") → we have no pill, and the whole control scales .97 (`ui/organisms/tab-bar/tab-bar.tsx:26-27`) → turn the `glyph` slot into the pill (`h-7.5 w-14 rounded-pill grid place-items-center`, with `group-hover:bg-pink-50`, `bg-pink-50` when active, `group-active:bg-pink-100 group-active:scale-92`) and drop `active:press-scale` from `control`. (token) Add `--state-hover`/`--state-press` aliases and `--motion-press-scale-icon: .92`. None exist in `theme.css`; today only raw pink-50/100 and `--motion-press-scale .97` do.
- [visual] Colours: rest ink-500, hover ink-800, press pink-600, active pink-500 (`:13`) → ours text-subtle (ink-600), hover text-heading (ink-900), no press colour, active text-brand (pink-600) → add `active:text-pink-600` and hover `text-ink-800`. **Keep** ink-600 and pink-600 for rest and active: the design's ink-500 and pink-500 at 11px fail AA on white. Record that as a deliberate contrast deviation.
- [visual] The focus outline has `radius-md` (`:14`) → the ring has square corners (no rounding on `control`) → add `rounded-md` to `control`. Once the pill lands, the count offset re-anchors to the pill (`top:-3,right:8`), which is visually equal to today's `-top-1 -right-2` on the glyph.
- Stories: FourTabsWithCount and FiveTabs ✓. There is no states story. Add a `States` story (hover/press/focus via `pseudo-states` or play) to cover the INTERACTIONS row.

### TestimonialWall

- [visual] The card track minimum is 280 (`D/organisms/TestimonialWall.jsx:10`) → `autogrid` = 260 (`ui/organisms/testimonial-wall/testimonial-wall.tsx:15`) → add a 280 step (token: grid-min 280) or accept. At 1000px both give 3 columns, so impact is low.
- [api] **CONFLICT:** `variant: "default" | "brand"` (`testimonial-wall.tsx:28`) passes a _card surface_. §4 moves ReviewCard `brand` to `surface`, but the wall itself paints nothing, so `surface` on the wall would wrongly read as the wall's own ground. → **Recommended mapping:** rename it to `cardSurface?: "page" | "brand"`, matching ReviewCard's `surface`, and reserve `surface` for a future wall background. Keep `variant` as a deprecated alias for one release.
- Stories: Default ✓ (+BrandCards).

### CartPanel / StatBand — no gaps

- CartPanel: `onQty(name)`→`onQuantityChange(id)`, `onPlace`→`placeAction`, `onBrowse`→`browseAction`, and the note Input→`noteField` slot. Totals go through `cartTotals` and PriceSummary ✓. Focus is managed when a line hits 0 (extra a11y ✓). Thumb 56 ✓. Stories: Filled and Empty ✓.
- StatBand: `tone`→`surface`, tile 80, `autogrid-min-sm` (200) ✓, Stat inverse on brand and ink ✓. Stories: Soft and Brand ✓ (+Ink).

---

## Layouts

### AutoGrid

- [api/visual] `min` takes any px; the card rows use `min={240}` and `min={160}` (`D/layouts/AutoGrid.card.html` rows 1–2, and 240 is the prompt's "cards" value) → we snap to steps xs 140 / sm 200 / md 260 / lg 320 (`ui/layouts/auto-grid/auto-grid.tsx:7-21`), and neither 240 nor 160 exists, so the MinMd and MinXs stories are not the card values → add a `card` step = 240 (token: `--spacing-grid-min-card` 240, shared with MenuList) and keep md 260 for panels, or record that 240 snaps to md. 160 snapping to xs (140) is fine.
- `columns` is `repeat(N, minmax(0,1fr))` ✓, and `space` defaults to the grid gap ✓. Stories: MinMd, MinXs and Columns3 ✓.

### Section

- [visual] The default rhythm is `--section-y-fluid` = `clamp(56px,7vw,96px)` (design `tokens/breakpoints.css:21`) → `--spacing-section` = `clamp(48px,8vw,96px)` (`ui/layouts/section/section.tsx:15`, theme.css:155) → check the token's provenance. If it is not a recorded handoff decision, set it to `clamp(56px,7vw,96px)` (token). tight and loose ✓.
- `tone`→`surface` (+`soft`), `bare`→`isBare`, `pattern` extra ✓. Arbitrary CSS colours go through `sx`. Stories: Surfaces (5+1 tones) and Rhythm ✓.

### AppShell / Cluster / Container / PostFrame / Stack — no gaps

- AppShell: `width/height`→`frame: phone|phone-sm` (§4) ✓. With `statusTone="light"` the design paints white text on the frame's white status bar (`D/layouts/AppShell.jsx:5-7`), which is a design bug. Ours floods the row `bg-surface-brand` (`app-shell.tsx:28`). Keep ours. `contain-layout` anchors fixed overlays the way the design's `position:relative` does ✓. Stories: WithTabBar and WithOverlaySheet ✓.
- Cluster: `nowrap`/`scroll`→`isNowrap`/`isScrollable` (+keyboard tab stop, a11y ✓) and `space-between`→`between` ✓. Stories: Wrap, JustifyBetween and Scroll ✓.
- Container: `size="default"`→`"content"` (same 1200), with extras `narrow` and `article`. Any CSS length goes through `sx`. Gutter is 16 vs 20 at the floor (deliberate, spec C8). Stories: Sizes ✓.
- PostFrame: `background`→`surface` (§4), `fit`→`isFit`, `safeArea`→`hasSafeArea`, `padding` number→`none|default|tight` (+`sx`). Safe-area guides ✓, and the format table matches. Stories: AllFormats and the per-format stories ✓.
- Stack: `divide`→`isDivided` (the rule becomes an `li` inside lists, a11y ✓) and `space-between`→`between`. Half steps exist ✓. Stories: Space2, Space6 and Divided ✓.

---

## Cross-cutting

- **CONFLICT (low):** §4 says every component's props extend `BaseProps<"el">`, but the layouts (AppShell, Section, Container, Stack, Cluster, AutoGrid, PostFrame, Box, Grid) declare `ComponentProps<"div"> & { sx?: Sx }` by hand (for example `ui/layouts/app-shell/app-shell.tsx:36`, `stack.tsx:31`). The two types are the same → switch them to `BaseProps<"div">` (or `BaseProps<"section">`) for one source of truth. No behaviour change.
- (token) Missing from `theme.css`, and needed by the TabBar and footer press states: `--state-hover` (pink-50), `--state-press` (pink-100), `--state-hover-on-color` (white 16%), `--state-press-on-color` (white 28%), `--motion-press-scale-icon` (.92), and `--animate-pop-in`. These likely overlap the atoms/molecules audit, so dedupe there.
- SCREENS.md implies no missing props beyond the ones listed. The website kit (header cart count, Book-a-Table Dialog form, glass at 24px) and the app kit (AppShell overlay sheet, MenuList list, CartPanel pay, OrderTracker advance) are all expressible today through slots.
