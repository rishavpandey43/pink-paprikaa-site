# UI kit — marketing & social artboards

Instagram, story and display-ad artwork built on the brand's real pixel canvases.
**No campaign artwork was supplied**, so these are brand-faithful templates; all
photography is a labelled placeholder.

## Formats (from `tokens/canvas.css`)
| Token pair | Size | Use |
| --- | --- | --- |
| `--canvas-post-*` | 1080×1080 | Instagram feed 1:1, carousel slides |
| `--canvas-portrait-*` | 1080×1350 | Instagram feed 4:5 — the loudest format |
| `--canvas-story-*` | 1080×1920 | Stories / Reels covers |
| `--canvas-landscape-*` | 1200×628 | Link previews, OG images |
| `--canvas-wide-*` | 1920×1080 | In-store screens |
| `--canvas-leaderboard-*` | 728×90 | Display ad |
| `--canvas-mpu-*` | 300×250 | Display ad |

## Artboards
| File | Boards |
| --- | --- |
| `FeedArtboards.jsx` | `OfferPost` (flooded pink + corner `OfferSeal`), `DishLaunchPost` (photo half / copy half), `StatementPost` (4:5 ink statement), `CarouselSlide` (menu item with n/total) |
| `AdArtboards.jsx` | `OfferStory` (with `CouponTicket`), `DishStory`, `LinkBanner`, `Leaderboard`, `Mpu` |

## Rules baked in
- Canvas type comes from `--fs-canvas-*` (hero 132 / h1 96 / h2 72 / body 34 /
  caption 26 / overline 24) via `SocialHeadline` — never screen `--fs-*` sizes.
- `--canvas-pad` (72px) safe margin on 1080 canvases; stories additionally keep
  the top 250px and bottom 320px clear of platform chrome (toggle the guides in
  the Stories tab).
- One `OfferSeal` per board, cornered and allowed to bleed.
- Pattern opacity ≤ 0.12, one flooded field colour per board, no gradients.
- Every board ends with a `LogoLockup` or `Logo` — nothing ships unsigned.
