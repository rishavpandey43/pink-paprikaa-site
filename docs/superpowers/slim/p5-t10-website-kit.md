# P5 T10 — Kit fixtures + the Website kit

**Files:** extend `apps/storybook/src/kits/fixtures.ts`. Create `kits/{kit-notice.tsx,expect-no-overflow.ts}` and `kits/website/{website-kit.tsx,website.stories.tsx}`.

**What it is:** the `ui_kits/website` homepage, built from public ui exports. Facts come from `brand` and `toBrandLines`. It carries the "Reference kit — not production copy" notice.

**Fixtures**

- `DIRECTIONS_URL`
- `GOOGLE_REVIEWS`: 4 reviews, verbatim, with one "[…]" elision. Copy from ui `organisms/story-fixtures.ts` (not importable).
- `MENU_ITEMS` (8 veg), `MENU_CATEGORIES`, `FEATURED_DISH`, `SAMPLE_CART`, `NAV_LINKS`
- `FOOTER_COLUMNS`, `SOCIAL_LINKS`, `FAQS` — all from `brand`
- `GUEST_OPTIONS`, `BOOKING_SLOTS`

**Helpers**

- `KitNotice({ source })`: `role="note"` with a Badge. Export its text as `KIT_NOTICE`.
- `expectNoHorizontalOverflow(el, width)`: asserts `innerWidth === width` and `scrollWidth ≤ clientWidth`.

**Page, top to bottom:** SiteHeader → HeroBanner → MenuList grid (Add shows a pop Toast) → Story Section (alt) → StatBand → TestimonialWall → OutletCards → FaqSection → franchise CtaBand → SiteFooter (legal lines) → a two-step booking Dialog ("Book a table" → "Table held for 10 minutes").

**Stories** (`Website/Homepage`, fullscreen)

- `Homepage`: plays the toast and both booking steps.
- `Homepage360`: viewport `floor360`, no sideways scroll, the "Menu" button visible.
- Probe: an 800px child must make `Homepage360` fail.

**Gotchas**

- No invented rating, no "18 spices", no egg FAQ.
- `outlet.hours` and `mapsUrl` are `null`. Fall back to `brand.hours.display` and `DIRECTIONS_URL`.
- The Directions anchor needs `rel="noopener noreferrer"` and an sr-only " Opens in a new tab" (R44/R45).
- SiteHeader `actions` show only from lg. Below lg, use `compactActions` or the drawer.
- `CartLine` arrives with Plan 4 T15 CartPanel, so run this task after that.
- Mount one `ToastProvider`, at the root.

**Commit:** `feat(storybook): the Website reference kit`
