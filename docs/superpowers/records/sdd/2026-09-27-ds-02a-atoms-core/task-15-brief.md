### Task 15: Tier parity review

Spec §11.4: every atom is compared side by side with its design-system card at 360 and 1280. Each difference is either fixed or listed with a reason. This is review evidence, not a pixel gate.

**Files:** fixes only, in whichever task's files the review implicates. Screenshots go to `/tmp/pp-parity/` and are **never** committed.

**Interfaces:** Consumes the 13 atoms' stories (`Atoms/<Name>`), the design-system cards (`zip-files/Pink Paprikaa Design System/components/atoms/<Name>.card.html`), and Playwright from `apps/storybook`.

- [ ] **Step 1: Serve both sides**

Run each in the background (they keep running):

```bash
npx --yes serve -l 4400 "zip-files/Pink Paprikaa Design System"
pnpm nx run @pink-paprikaa-web/storybook:serve
```

If port 4400 is taken, pick another and use it below. If `npx` cannot download `serve` in the sandbox, use `python3 -m http.server 4400 --directory "zip-files/Pink Paprikaa Design System"` instead. The cards load React and Babel from unpkg: if the sandbox blocks the network, rerun that server with the sandbox disabled. Poll until `curl -sf http://localhost:4400/components/atoms/Button.card.html` and `curl -sf http://localhost:6006/index.json` both succeed (Storybook's first build takes about 30s).

- [ ] **Step 2: Screenshot every card and every story at both widths**

Create `/tmp/pp-parity/shoot.mjs`:

```js
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(`${process.cwd()}/apps/storybook/package.json`);
const { chromium } = require("playwright");

const CARDS = "http://localhost:4400/components/atoms";
const STORYBOOK = "http://localhost:6006";
const ATOMS = [
  "Text",
  "Link",
  "PatternField",
  "SocialHeadline",
  "Button",
  "IconButton",
  "Tag",
  "Card",
  "Divider",
  "ImageSlot",
  "Badge",
  "StatusDot",
  "Avatar",
];

const index = await (await fetch(`${STORYBOOK}/index.json`)).json();
const browser = await chromium.launch();

for (const width of [360, 1280]) {
  const out = `/tmp/pp-parity/${String(width)}`;
  mkdirSync(out, { recursive: true });
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const name of ATOMS) {
    await page.goto(`${CARDS}/${name}.card.html`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${out}/${name}.card.png`, fullPage: true });
    const stories = Object.values(index.entries).filter(
      (entry) => entry.type === "story" && entry.title === `Atoms/${name}`
    );
    for (const story of stories) {
      await page.goto(`${STORYBOOK}/iframe.html?id=${story.id}&viewMode=story`, {
        waitUntil: "networkidle",
      });
      await page.screenshot({
        path: `${out}/${name}--${story.id.split("--")[1]}.png`,
        fullPage: true,
      });
    }
  }
  await page.close();
}
await browser.close();
console.log("screenshots in /tmp/pp-parity/{360,1280}");
```

Run from the repo root: `node /tmp/pp-parity/shoot.mjs`
Expected: `screenshots in /tmp/pp-parity/{360,1280}`, and one `.card.png` plus one PNG per story per atom per width.

- [ ] **Step 3: Compare**

For each atom and width, open the card screenshot and its story screenshots (the Read tool shows images). Go row by row: geometry (height, padding, radius, gaps), type (face, size, weight, tracking, case), colour, glyph size and stroke, states that are visible (selected, disabled, loading, pulse) and surface rows. At 360, also check that nothing clips or causes horizontal scroll. Keep a table: `atom | row | difference | fixed in <file> / accepted because <reason>`.

These differences are **deliberate and accepted**, so list them without fixing:

| Atom           | Difference                                                                                    | Reason                                                                 |
| -------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| all            | Font rasterisation                                                                            | Self-hosted Fontsource files vs the zip's CDN fonts (spec §11.4)       |
| Text           | Display steps render at true size (72/56px), not the card's 44/34px                           | The card shrinks them to fit its 700px frame                           |
| SocialHeadline | True canvas pixels, not the card's 40% scale; body copy is text-body (ink-800, white on dark) | PostFrame (Plan 2c) scales artboards; handoff §3.2.2 body-on-dark rule |
| Button         | Secondary hover tints pink-50; ghost on brand has no border                                   | Readme §3.8 hover rule; spec C9 ("white outline/text")                 |
| IconButton     | Disabled is a grey fill (zip: 45% opacity); primary turns white on a brand field              | Readme §3.8; primary shares Button's surface skin                      |
| Tag            | Disabled is a grey fill (zip: 50% opacity); zone tones keep Tag geometry (38px, DM Sans 500)  | Readme §3.8; one component, one geometry (handoff chips were ad hoc)   |
| Divider        | On brand the rule is white 22% (zip: 28%)                                                     | Semantic `border-subtle` on the surface — one hairline token           |
| ImageSlot      | Labels pink-700 / pink-800 / ink-600 (zip: pink-400 / pink-700 / ink-500)                     | AA re-pointing, spec §5.3 and contract deviation 5                     |
| Link           | `quiet` shows no underline on hover                                                           | `Link.jsx` (transparent in both states) wins over the prompt's wording |
| Pills          | A label longer than its container ellipsises (zip: overflowed its row)                        | Review Focus 1                                                         |

Anything else is a bug. Fix it in the owning task's component or token file, rerun that component's test file and reshoot it.

- [ ] **Step 4: Story tests (every story, a11y enforced, `play` functions run)**

Run: `pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache 2>&1 | tail -15`
Expected: PASS for all `Atoms/*` stories, including the `play` assertions in Button `NestedSurfaces` and `LongLabel`, Tag `Selectable` and `LongLabel`, and Card `LightIsland`.

- [ ] **Step 5: Cold gate for the tier**

Stop both servers, then run:

```bash
pnpm nx format:check && pnpm nx sync:check \
  && pnpm nx run-many -t typecheck lint test build -p @pink-paprikaa-web/design-tokens @pink-paprikaa-web/ui @pink-paprikaa-web/storybook --skip-nx-cache --outputStyle=static 2>&1 | tail -12 \
  && pnpm guard:founder
```

Expected: every target green; `Founder-name guard: clean.`

- [ ] **Step 6: Commit the fixes (skip if Step 3 found none)**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "fix(ui): atom parity fixes from the side-by-side review

<one line per fixed difference: atom, row, what changed>

Accepted differences (font rasterisation, card-scaled specimens, readme 3.8
disabled fills, AA label re-pointing, pill truncation) are listed in the
plan 2a parity table.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

In the report, include the full difference table from Step 3 and the tail of the Step 4 and Step 5 outputs.

## Controller amendments (2026-09-27)

- **Ruling R13 — optional props accept `undefined`.** Every optional custom prop is declared `name?: T | undefined` (matching React's own DOM prop types) so molecules and organisms can forward a possibly-undefined value under `exactOptionalPropertyTypes` without conditional spreads. Apply this to every `…Props` interface in this plan, including the contract types in `lib/link-as.ts`.
- **Ghost on brand** = white text, no border (C9) — confirmed.
- **Slot class rule** — classes go on the component, never on the slotted child (Slot joins child classes without tailwind-merge) — confirmed as a system rule; AUTHORING.md records it.
- **Ruling R15 — file paths in tests.** Any spec/test in `packages/ui` that reads a file builds its path with `join(import.meta.dirname, "…")` (`node:path`), never `new URL("…", import.meta.url)`: under Vitest's jsdom environment Vite rewrites the latter to an `http://localhost` URL and `readFileSync` fails (found in Plan 1 Task 5).

## Controller amendments — ruling R19 and 2b rulings (2026-09-27)

- **R19 — the symbol is one shared CSS mask, never inline SVG per instance.** Plan 1 Task 7 generates `packages/ui/src/lib/brand-artwork.css` (imported by `styles.css`) defining `--pp-symbol-mask` once and the utility `mask-symbol` (`background-color: currentColor` + the mask). `SymbolMark` (Plan 2a Task 1) is therefore `<span aria-hidden="true" className={…"mask-symbol"…} />` sized by className — no path data in the HTML. Its test asserts the class and `aria-hidden`, and that the rendered HTML contains no `<path`. PatternField uses `mask-image: var(--pp-symbol-mask)` (a class or `style={{ maskImage: "var(--pp-symbol-mask)" }}`) instead of inlining `SYMBOL_DATA_URI_WHITE` per instance. Reason: a 20-dish menu with spice levels would otherwise carry ~80 copies of ~5 KB path data (page budget ≤1 MB). Plan 2b's Rating/SpiceLevel/Spinner and `lib/brand-diamond.tsx` build on this `SymbolMark`.
- **One diamond corner token:** `radius.diamond` (2px) is created once, in Plan 2a (StatusDot's task), and used as `rounded-diamond` by StatusDot and by Plan 2b's `lib/brand-diamond.tsx`; drop `radius-status-dot` / `radius-brand-diamond`.
- **Tooltip** opens with `delayDuration={0}` as designed — accepted.
- **No on-brand variants** for Checkbox/Radio/Switch/Slider (none designed) — YAGNI, accepted.
- **Read-only Select** renders disabled for the visual, **plus a hidden `<input type="hidden" name={name} value={value}>`** so the value is still submitted (react-hook-form reads it) — add a test.
- **R25 — no `SYMBOL_DATA_URI_WHITE` export.** Plan 1 removed it (it tempted per-instance inlining). Task 0 must not expect it; PatternField and SymbolMark use `var(--pp-symbol-mask)` / `mask-symbol` only. Logo no longer accepts SVG `width`/`height` props — size it with classes (`w-50`, or `h-12 w-auto` for header sizing).
