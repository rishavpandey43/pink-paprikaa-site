### Task 17: Tier parity review (spec §11.4)

Side-by-side screenshots of every design-system card (and, for Slider and Countdown, the handoff pages they came from) against the matching Storybook docs page, at 360 and 1280. Fix what differs; list with a reason what stays different.

**Files:**

- Create (then delete, never committed): `apps/storybook/parity.tmp.mjs`
- Modify: whichever component or story a difference points at

**Interfaces:**

- Consumes: every story in `Atoms/*` from this plan; `serve` (root devDependency) and `playwright` (Storybook app devDependency, Chromium installed by Plan 1 Task 1).
- Produces: screenshots in `/tmp/parity-2b/`, fixes, and the list of accepted differences.

- [ ] **Step 1: Serve both sides**

Run each in the background (e.g. `run_in_background`):

```bash
pnpm exec serve -l 4800 zip-files
pnpm nx run @pink-paprikaa-web/storybook:serve
```

Wait until `http://localhost:4800/Pink%20Paprikaa%20Design%20System/components/atoms/Input.card.html` and `http://localhost:6006` both answer. The cards load React from unpkg; if the sandbox blocks the network, rerun with the sandbox disabled.

- [ ] **Step 2: Screenshot every pair at 360 and 1280**

`apps/storybook/parity.tmp.mjs`:

```js
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const CARDS = "http://localhost:4800/Pink%20Paprikaa%20Design%20System/components/atoms";
const HANDOFF = "http://localhost:4800/pink-paprikaa-handoff/design";
const DOCS = "http://localhost:6006/iframe.html?viewMode=docs&id=";
const OUT = "/tmp/parity-2b";

/** [name, reference page, Storybook docs id] */
const PAIRS = [
  ["input", `${CARDS}/Input.card.html`, "atoms-input--docs"],
  ["select", `${CARDS}/Select.card.html`, "atoms-select--docs"],
  ["checkbox", `${CARDS}/Checkbox.card.html`, "atoms-checkbox--docs"],
  ["radio", `${CARDS}/Radio.card.html`, "atoms-radio--docs"],
  ["switch", `${CARDS}/Switch.card.html`, "atoms-switch--docs"],
  ["slider", `${HANDOFF}/DawatCalculator.dc.html`, "atoms-slider--docs"],
  ["spinner", `${CARDS}/Spinner.card.html`, "atoms-spinner--docs"],
  ["skeleton", `${CARDS}/Skeleton.card.html`, "atoms-skeleton--docs"],
  ["progress-bar", `${CARDS}/ProgressBar.card.html`, "atoms-progressbar--docs"],
  ["rating", `${CARDS}/Rating.card.html`, "atoms-rating--docs"],
  ["spice-level", `${CARDS}/SpiceLevel.card.html`, "atoms-spicelevel--docs"],
  ["diet-mark", `${CARDS}/DietMark.card.html`, "atoms-dietmark--docs"],
  ["price-tag", `${CARDS}/PriceTag.card.html`, "atoms-pricetag--docs"],
  ["tooltip", `${CARDS}/Tooltip.card.html`, "atoms-tooltip--docs"],
  ["countdown", `${HANDOFF}/PPHeader.dc.html`, "atoms-countdown--docs"],
];

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
for (const width of [360, 1280]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const [name, reference, docsId] of PAIRS) {
    for (const [side, url] of [
      ["card", reference],
      ["story", `${DOCS}${docsId}`],
    ]) {
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: `${OUT}/${name}-${String(width)}-${side}.png`,
        fullPage: true,
      });
    }
  }
  await page.close();
}
await browser.close();
console.log(`parity screenshots written to ${OUT}`);
```

Run: `node apps/storybook/parity.tmp.mjs`
Expected: 60 PNGs in `/tmp/parity-2b/`. (If a docs id 404s, read the real id from Storybook's sidebar URL and correct the list.)

- [ ] **Step 3: Compare each pair and act**

Open each `<name>-<width>-card.png` beside `<name>-<width>-story.png` (the Read tool shows images). For every difference: if it is a defect, fix the component or story (token first if it is a value), rerun its task's gate, and re-shoot that pair. Otherwise add it to the accepted list with its reason. The accepted list starts as:

- Label, hint and status message rows (Input, Select, Checkbox): owned by Field (Molecules/Field, Plan 3a) — spec §8.2.
- `IconButton` / `Button` triggers and slots (Tooltip, Input trailing): native stand-ins in atom stories (atoms may not import atoms).
- SpiceLevel `sm` is 12px (card's smallest sample is 10px): the menu call sites use 12.
- DietMark `lg` is 20px (card samples 26px) and there is no egg row: spec C10, pure veg.
- Select text clears a leading icon at 44px, not 42px: one field chrome with Input.
- Disabled Checkbox, Radio, Switch use real fills, not 50% opacity: readme §3.8.
- A read-only Select shows the lock, not the chevron: form-states guideline.
- Font rasterisation and the cards' 128px row-label column.

- [ ] **Step 4: Story tests and the gate, cold**

```bash
rm apps/storybook/parity.tmp.mjs
pnpm nx format:check && pnpm nx sync:check
```

Then run the gate and `pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache 2>&1 | tail -15`. Expected: all green — every Atoms story passes axe in Chromium, and the Select, Tooltip and Countdown plays pass. `git status --short` shows no stray file.

- [ ] **Step 5: Commit (only if Step 3 changed files)**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "fix(ui): align the forms, indicators and menu atoms with their cards

Side-by-side review at 360 and 1280 against the design-system cards and
the handoff pages (spec §11.4). Accepted differences, each by decision:
<paste the final accepted list, one line each>

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

If nothing changed, paste the accepted list in the task report instead.

## Controller amendments — ruling R19 and 2b rulings (2026-09-27)

- **R19 — the symbol is one shared CSS mask, never inline SVG per instance.** Plan 1 Task 7 generates `packages/ui/src/lib/brand-artwork.css` (imported by `styles.css`) defining `--pp-symbol-mask` once and the utility `mask-symbol` (`background-color: currentColor` + the mask). `SymbolMark` (Plan 2a Task 1) is therefore `<span aria-hidden="true" className={…"mask-symbol"…} />` sized by className — no path data in the HTML. Its test asserts the class and `aria-hidden`, and that the rendered HTML contains no `<path`. PatternField uses `mask-image: var(--pp-symbol-mask)` (a class or `style={{ maskImage: "var(--pp-symbol-mask)" }}`) instead of inlining `SYMBOL_DATA_URI_WHITE` per instance. Reason: a 20-dish menu with spice levels would otherwise carry ~80 copies of ~5 KB path data (page budget ≤1 MB). Plan 2b's Rating/SpiceLevel/Spinner and `lib/brand-diamond.tsx` build on this `SymbolMark`.
- **One diamond corner token:** `radius.diamond` (2px) is created once, in Plan 2a (StatusDot's task), and used as `rounded-diamond` by StatusDot and by Plan 2b's `lib/brand-diamond.tsx`; drop `radius-status-dot` / `radius-brand-diamond`.
- **Tooltip** opens with `delayDuration={0}` as designed — accepted.
- **No on-brand variants** for Checkbox/Radio/Switch/Slider (none designed) — YAGNI, accepted.
- **Read-only Select** renders disabled for the visual, **plus a hidden `<input type="hidden" name={name} value={value}>`** so the value is still submitted (react-hook-form reads it) — add a test.
- **R21 — field text is 16px.** `lib/field-control.tsx` renders the control value at `text-body` (16px) for every size (sm/md/lg change height and padding only): iOS Safari zooms on focus below 16px, and the handoff fields use `font-size:16px`. Add a test asserting the value text class.
