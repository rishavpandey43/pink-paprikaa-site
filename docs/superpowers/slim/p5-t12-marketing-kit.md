# P5 T12 — The Marketing kit

**Files:** create `apps/storybook/src/kits/marketing/{artboard,feed-artboards,ad-artboards}.tsx` and `{feed,ads}.stories.tsx`.

**What it is:** the `ui_kits/marketing` boards. Each is built inside `PostFrame` at its true canvas, with `isFit` for preview. Facts come from `brand`: established, statement, vegStatement, outlet, tagline. Campaign copy stays sample.

**Artboard:** `Artboard({ format, className, children })`. A figure card; `className` is a `max-w-*` step. Caption: `label · w×h`.

**Boards**

- `OfferPost`: post, brand, pattern 96, LogoLockup lg, OfferSeal xl top-right `bleed="md"`.
- `DishLaunchPost`: post, light, padding none, 16:9 ImageSlot, DietMark lg.
- `StatementPost`: portrait, ink, "Since {established}", Divider, LogoLockup md.
- `CarouselSlide`: post, alt, "2/5", SpiceLevel lg.
- `OfferStory`, `DishStory`: story, `hasSafeArea`. The offer story carries CouponTicket (light, lg, `notch="brand"`).
- `LinkBanner`: landscape, soft, tight.
- `Leaderboard`: wordmark, vertical Divider, Button sm.
- `Mpu`: ink, wordmark, OfferSeal sm.

**Stories** (each file has a KitNotice decorator)

- `Marketing/Kit/Feed`: Offer, DishLaunch, Statement, Carousel, Feed360.
- `Marketing/Kit/Ads`: Offer story, Dish story, Link / OG, Leaderboard, MPU, Ads360.
- The 360 stories use viewport `floor360` and call `expectNoHorizontalOverflow`.
- Probe: `max-w-150` with no `isFit` must fail Feed360.

**Reuse:** PostFrame, POST_FORMATS, PatternField, SocialHeadline, LogoLockup, Logo, OfferSeal, CouponTicket, PriceTag, DietMark, SpiceLevel, ImageSlot, Divider, Button; docs-kit `token`.

**Gotchas**

- Prices: `PriceTag size="canvas"` (built), not `formatRupees`.
- Canvas pads have no utility. Use inline `style` with `var(${token("canvas-pad").cssVar})`.
- Lockup widths: lg 280 · md 240 (the kit's 220 → md) · sm 200. Small ads use the wordmark.
- A 360 canvas leaves 328px for content. Pick `max-w-*` steps that fit.

**Commit:** `feat(storybook): the Marketing reference kit`
