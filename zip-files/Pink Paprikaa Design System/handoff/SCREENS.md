# Screens & reference builds

Everything here is a **design reference** composed only from the component library. Recreate each screen in the app using the ported components — do not ship these HTML files.

Open any `index.html` in a browser from the project root (they load `../../styles.css`, `../../brand.js` and `../../_ds_bundle.js`). `Pink Paprikaa Website.html` at the root is a single self-contained offline copy of the website kit, rebuilt with the latest components (interaction states, custom pickers).

---

## Website — `ui_kits/website/`

The marketing site at 1440px, **composed entirely from the component library** —
this kit contains no layout of its own beyond two brand-specific sections.

### Composition
| Band | Component |
| --- | --- |
| Masthead | `SiteHeader` |
| Hero | `HeroBanner` |
| Menu | `MenuList` (grid variant) |
| Story | `Sections.jsx` — `Section` + `ImageSlot` + `Stat` + `SpiceLevel` |
| Proof | `StatBand` |
| Reviews | `TestimonialWall` |
| Outlets | `Sections.jsx` — `FilterBar` + `AutoGrid` + `OutletCard` |
| FAQ | `FaqSection` |
| Franchise | `CtaBand` |
| Footer | `SiteFooter` |
| Overlays | `Toast`, `Dialog`, `Select`, `DatePicker`, `SlotPicker`, `Input`, `Field` |

`Sections.jsx` holds only Story and Outlets, because those two compositions are
specific to this page rather than reusable organisms.

### Interactions
- Category filters actually filter the menu.
- Adding a dish increments the header cart and pops an `--ease-pop` `Toast`.
- The header goes translucent past 24px of scroll.
- "Book a Table" opens a `Dialog` (`<form noValidate>`): Outlet and Guests (`Select`), Date (`DatePicker`, min today), Time (`SlotPicker`), Mobile (`Input`, validated in code — empty and short-number messages), then a two-step confirm.
- Every control has hover, press, focus and disabled states; no browser-native pickers or validation bubbles appear.

### Not real yet
No Pink Paprikaa site was supplied, so this is a brand-faithful reconstruction,
not a copy. Every image is an `ImageSlot` labelled with the crop it needs.

---

## Ordering app — `ui_kits/app/`

390×844 click-through, **composed from the component library**. Only two files
hold page-specific composition; every frame, list, cart and tracker is an
organism.

### Composition
| Screen | Component |
| --- | --- |
| Frame | `AppShell` (status bar, home indicator, overlay slot) |
| Navigation | `TabBar` |
| Home | `Screens.jsx` — `PatternField` + `SearchField` + `LoyaltyCard` + `FilterBar` + `MenuItemCard` |
| Menu | `MenuList` (list variant) |
| Item detail | `ItemSheet.jsx` — `Dialog sheet` + `Field` + `Radio` + `Checkbox` + `QuantityStepper` |
| Cart | `CartPanel` |
| Tracking | `OrderTracker` |
| Account | `Screens.jsx` — `Avatar` + `LoyaltyCard` + `ListRow` + `Switch` |
| Overlays | `Toast` |

### Flow to try
Home → tap a dish → customise in the sheet → Add to Order (`--ease-pop` toast) →
Cart tab → Pay → tracking advances "Order in → On the tandoor → Ready" → Back to Home.

### Not real yet
No Pink Paprikaa app was supplied, so this is a brand-faithful reconstruction of
the standard pickup-ordering flow. All imagery is a labelled `ImageSlot`.

---

## Marketing & social — `ui_kits/marketing/`

Instagram, story and display-ad artwork built on the brand's real pixel canvases.
**No campaign artwork was supplied**, so these are brand-faithful templates; all
photography is a labelled placeholder.

### Formats (from `tokens/canvas.css`)
| Token pair | Size | Use |
| --- | --- | --- |
| `--canvas-post-*` | 1080×1080 | Instagram feed 1:1, carousel slides |
| `--canvas-portrait-*` | 1080×1350 | Instagram feed 4:5 — the loudest format |
| `--canvas-story-*` | 1080×1920 | Stories / Reels covers |
| `--canvas-landscape-*` | 1200×628 | Link previews, OG images |
| `--canvas-wide-*` | 1920×1080 | In-store screens |
| `--canvas-leaderboard-*` | 728×90 | Display ad |
| `--canvas-mpu-*` | 300×250 | Display ad |

### Artboards
| File | Boards |
| --- | --- |
| `FeedArtboards.jsx` | `OfferPost` (flooded pink + corner `OfferSeal`), `DishLaunchPost` (photo half / copy half), `StatementPost` (4:5 ink statement), `CarouselSlide` (menu item with n/total) |
| `AdArtboards.jsx` | `OfferStory` (with `CouponTicket`), `DishStory`, `LinkBanner`, `Leaderboard`, `Mpu` |

### Rules baked in
- Canvas type comes from `--fs-canvas-*` (hero 132 / h1 96 / h2 72 / body 34 /
  caption 26 / overline 24) via `SocialHeadline` — never screen `--fs-*` sizes.
- `--canvas-pad` (72px) safe margin on 1080 canvases; stories additionally keep
  the top 250px and bottom 320px clear of platform chrome (toggle the guides in
  the Stories tab).
- One `OfferSeal` per board, cornered and allowed to bleed.
- Pattern opacity ≤ 0.12, one flooded field colour per board, no gradients.
- Every board ends with a `LogoLockup` or `Logo` — nothing ships unsigned.

### Website kit — update in this release
- "Book a Table" dialog is a `<form noValidate>`: Outlet (Select) → Guests (Select, users icon) → **Date (DatePicker, min = today)** → Time (SlotPicker; 9:00pm sold out) → Mobile (Input type="tel", numeric keypad).
- "Hold My Table" validates the mobile number in code: empty → *"Add a mobile number so we can text your confirmation."*; fewer than 10 digits → *"That number looks short. We need all 10 digits."* The error clears as soon as the guest types. Valid → step 2, *"Table held for 10 minutes"* / *"We'll text you the confirmation. See you at Sector 57."*

---

## Templates — `templates/`

Starting points for new pages (built as single-file design components; treat as layout references).

| Template | Entry | Seeds |
|---|---|---|
| Marketing website | `templates/website/Website.dc.html` | Full homepage — hero, menu, story, proof, reviews, outlets, FAQ, franchise CTA, footer |
| Ordering app screen | `templates/app/OrderingApp.dc.html` | 390×844 frame with tab bar, menu list and cart |
| Social post | `templates/social-post/SocialPost.dc.html` | 1080×1080 / 1080×1350 artboards — pattern field, offer seal, signed lockup |

---

## Foundation spec cards — `guidelines/`

Visual specs for every foundation. Open in a browser: `autogrid`, `borders`, `brand-company`, `brand-logo`, `brand-pattern`, `brand-symbol`, `brand-wordmark`, `breakpoints`, `canvas-formats`, `canvas-type`, `card-anatomy`, `color-accents`, `color-heat`, `color-ink`, `color-primary`, `color-semantic`, `color-status`, `color-surfaces`, `diamond-motif`, `elevation`, `fluid-type`, `form-states`, `mark-legibility`, `motion`, `radii`, `spacing-layout`, `spacing-scale`, `states`, `type-body`, `type-devanagari`, `type-display`, `type-headings`, `type-overline-mono`.
