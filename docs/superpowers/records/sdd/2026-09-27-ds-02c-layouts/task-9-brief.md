### Task 9: Tier parity review — Layouts at 360 and 1280

Spec §11.4: each design-system card is served locally and screenshotted next to its Storybook stories at 360 and 1280. Differences are fixed, or listed with a reason. This is review evidence, not a pixel gate.

**Files:**

- Modify: only the layout files a fix touches.
- Create: `/tmp/pp-layout-parity.mjs` — outside the repo, never committed.

**Interfaces:**

- Consumes: Tasks 2–8.
- Produces: screenshot pairs in `/tmp/pp-parity/layouts/`, and the parity notes (committed in the commit body).

- [ ] **Step 1: Serve both sides**

In one terminal: `python3 -m http.server 5055 --directory "zip-files/Pink Paprikaa Design System"`. The cards load React and Babel from unpkg, so this needs network; rerun with the sandbox disabled if it is blocked.

In another: `pnpm nx run @pink-paprikaa-web/storybook:serve` (port 6006).

- [ ] **Step 2: Screenshot every card next to every story of its component**

`/tmp/pp-layout-parity.mjs`. Story ids come from Storybook's own index, so nothing is guessed:

```js
// Run from the repository root: node /tmp/pp-layout-parity.mjs
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

const { chromium } = createRequire(join(process.cwd(), "apps/storybook/package.json"))(
  "playwright"
);
const index = await (await fetch("http://localhost:6006/index.json")).json();

const CARDS = ["Container", "Section", "Stack", "Cluster", "AutoGrid", "AppShell", "PostFrame"];
const VIEWPORTS = [
  { width: 360, height: 780 },
  { width: 1280, height: 900 },
];
const OUT = "/tmp/pp-parity/layouts";
const kebab = (name) => name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
for (const viewport of VIEWPORTS) {
  const page = await browser.newPage({ viewport });
  for (const card of CARDS) {
    await page.goto(`http://localhost:5055/components/layouts/${card}.card.html`, {
      waitUntil: "networkidle",
    });
    await page.screenshot({ path: `${OUT}/${card}-${viewport.width}-0-card.png`, fullPage: true });
    const prefix = `layouts-${kebab(card)}--`;
    const stories = Object.values(index.entries).filter(
      (entry) => entry.type === "story" && entry.id.startsWith(prefix)
    );
    for (const { id } of stories) {
      await page.goto(`http://localhost:6006/iframe.html?viewMode=story&id=${id}`, {
        waitUntil: "networkidle",
      });
      await page.screenshot({ path: `${OUT}/${card}-${viewport.width}-${id}.png`, fullPage: true });
    }
  }
  await page.close();
}
await browser.close();
console.log(`screenshots written to ${OUT}`);
```

Run: `node /tmp/pp-layout-parity.mjs && ls /tmp/pp-parity/layouts | wc -l`
Expected: one card PNG plus one PNG per story, for each of the seven components at both widths. The Chrome DevTools MCP (`new_page` → `resize_page` → `take_screenshot`) is an acceptable substitute.

Also screenshot the four guideline cards this tier implements — `guidelines/{spacing-layout,autogrid,breakpoints,canvas-formats}.card.html` — against `Layouts/Container`, `Layouts/AutoGrid` and `Layouts/PostFrame` → `AllFormats`.

- [ ] **Step 3: Compare side by side; fix or list**

Open each card PNG next to its stories (the Read tool renders PNGs). For every difference, either fix it in the component or story and re-run the gate, or list it with a reason.

Expected, already-known differences — confirm each, and add anything new:

- **Font rasterisation.**
- **Gutter and rhythm (spec C8).** At 360px the gutter is 16px, not 20px, and section rhythm is clamp(48px, 8vw, 96px), not clamp(56px, 7vw, 96px). These are the handoff values.
- **Section `soft` tone** — an extra row added by the contract.
- **AutoGrid snapping.** The card's `min={240}` and `{160}` snap to `md` 260 and `xs` 140 (spec §15 risk 2).
- **AppShell.**
  - TabBar, Dialog, FilterBar, MenuItemRow and LoyaltyCard are atom stand-ins (temporary; see below).
  - The battery is Lucide `BatteryFull`.
  - `statusTone="light"` floods the status row brand (resolution 7).
- **PostFrame.**
  - LogoLockup is replaced by the `Logo` lockup, and there is no OfferSeal (Plan 3b).
  - The mpu and leaderboard inner padding is 16px, not 18px (the nearest design-system step).
  - The leaderboard headline is `h4` at 20px, not 22px.
  - An extra `tone="alt"` (pink-50) board: the contract addition (deviation 3).

The AppShell and PostFrame stand-ins are temporary and are not fixed here: **Plan 4's final task** replaces them with the real TabBar, Dialog, FilterBar, MenuItemRow, LoyaltyCard, LogoLockup and OfferSeal, and re-runs this parity check for those rows.

- [ ] **Step 4: Story tests, cold**

Run: `pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache 2>&1 | tail -10`
Expected: green; paste the summary.

- [ ] **Step 5: Commit**

If Step 3 changed files, commit them with the notes. If not, record the review as an empty commit, so the evidence lives in history the way the gate probes do. If Step 3 found a difference not listed below, add it to the body before committing: one line, with its reason.

```bash
git add -A packages/ui/src/layouts
git commit --allow-empty -m "test(ui): layouts tier parity review at 360 and 1280

Every design-system layout card compared with its stories; differences
that remain, each with its reason:

- font rasterisation
- gutter 16px / rhythm clamp(48px, 8vw, 96px): handoff values (spec C8)
- Section soft tone: added by the contracts
- AutoGrid min 240/160 snap to md 260 / xs 140 (spec risk 2)
- AppShell: TabBar, Dialog, FilterBar, MenuItemRow, LoyaltyCard are
  temporary atom stand-ins, replaced by Plan 4's final task; Lucide
  BatteryFull; statusTone=light floods the status row brand
- PostFrame: Logo lockup in place of LogoLockup, no OfferSeal (stand-ins
  until Plan 4's final task); ad-unit padding 16px (nearest step to 18px);
  leaderboard headline h4; an extra tone=alt (pink-50) board

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

## Controller amendments (2026-09-27)

- **Container `size="prose"` uses `max-w-text-measure-prose`**, the spacing token Plan 2a Task 2 creates (`--spacing-text-measure-prose: var(--container-prose)`). Tailwind 4.3's static `max-w-prose` (65ch) shadows the `--container-prose` (64ch) theme value, so it must never be used. Task 0 confirms the token exists before Task 2 starts.
- **Ruling R13 — optional props accept `undefined`.** Every optional custom prop is declared `name?: T | undefined` (matching React's own DOM prop types) so compositions can forward a possibly-undefined value under `exactOptionalPropertyTypes`. Apply this to every `…Props` interface in this plan.
- **Ruling R15 — file paths in tests.** Any spec/test in `packages/ui` that reads a file builds its path with `join(import.meta.dirname, "…")` (`node:path`), never `new URL("…", import.meta.url)`: under Vitest's jsdom environment Vite rewrites the latter to an `http://localhost` URL and `readFileSync` fails (found in Plan 1 Task 5).
