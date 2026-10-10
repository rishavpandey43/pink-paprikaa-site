# P5 T9 — Marketing foundations + the 33-card check

**Files:** create `apps/storybook/src/foundations/marketing/{marketing.stories.tsx,canvas-formats.mdx,canvas-type.mdx}`. Carried: `foundations/{brand,colors}/*`.

**What it is:** a canvas-formats page and a canvas-type page. Then prove that every guideline card has a page.

**Specimens** (in the hidden `Marketing/Specimens`)

- `CanvasFormats`: each `POST_FORMATS` entry drawn to scale ×0.073, labelled `format · label · w×h`. Its play asserts each `width`/`height` equals `cssValue("canvas-<f>-w|h")`.
- `CanvasTokens`: `TokenTable`, prefix `canvas-`.
- `CanvasType`: `PostFrame post light isFit` holding SocialHeadline overline / hero / h1 / h2 / body / caption, each printing its `text-canvas-*` value.
- `CanvasTypeTokens`: prefix `text-canvas-`.

**Pages**

- Canvas formats: a table of the seven formats and their uses. Rules:
  - Build every board in PostFrame and keep to the safe margins.
  - One idea per board. One OfferSeal per board, placed via `bleed`.
  - Sign with LogoLockup, or Logo on small ads.
- Canvas type: headlines of six words or fewer. Prices on artwork use `PriceTag size="canvas"`.

**Mapping check:** the plan's Step 3 diff must print "33 of 33 guideline cards mapped", and there must be 34 MDX pages.

**Carried (deferred specimens):**

- Brand `ClearSpace`: LogoLockup, where the clear space is the first P (R98).
- Colors `StatusAlerts`: Alert in four tones. Then delete the "Deferred" comment.

**Tests:** the CanvasFormats play; axe on every specimen.

**Reuse:** `POST_FORMATS`, `PostFrame`, `SocialHeadline`, `LogoLockup`, `Alert`; docs-kit `TokenTable`, `cssValue`, `formatValue`, `token`.

**Gotchas**

- `canvas-*` and `text-canvas-*` have no utility (`utilitiesOf` → `[]`), so they get no copy chips.
- `isFit` cannot be combined with `scale`.
- Run the mapping after T7: it counts only literal `guidelines/<card>.card.html` comments.

**Commit:** `feat(storybook): the Marketing foundation pages`
