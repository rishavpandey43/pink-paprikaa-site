### Task 15: The final gauntlet, the whole-branch review and the visual sweep

`/pre-merge` (`.claude/commands/pre-merge.md`) run cold, plus spec §11.5's extra gates, a fresh whole-branch review against the spec, and a visual sweep of all thirteen groups. **This task does not merge** — the owner decides; it ends with the evidence table.

**Files:** none planned. Findings are fixed in their own commits (`fix(<scope>): …`), each followed by the affected gate.

**Dev reference:** `git show dev:apps/storybook/.storybook/main.ts` (the `remark-gfm` and react-docgen-typescript comments)

**Dev parity:**

| Dev item                                                                                          | Ruling  | Where / spec clause                                                       |
| ------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------- |
| Regression on record: without `remark-gfm` every Foundations table shipped as raw pipe characters | ADD     | Step 7 sweep fails a docs page whose text shows a raw Markdown table      |
| Regression on record: docgen resolving from the wrong root documented 6 of 69 components          | ADD     | Step 7 sweep fails a `packages/ui` component docs page with no props rows |
| Story tests with axe `test: "error"` over every story                                             | ALREADY | Step 2 `storybook:test --skip-nx-cache`                                   |

Implementer: copy this table into your report, extended with anything the plan missed.

- [ ] **Step 1: Clean tree, formatting, references**

```bash
git status --short                     # must print nothing
pnpm nx format:check && pnpm nx sync:check
```

- [ ] **Step 2: Everything, cold**

```bash
pnpm verify:all --skip-nx-cache --outputStyle=static 2>&1 | tail -30
pnpm nx run @pink-paprikaa-web/design-tokens:test --skip-nx-cache 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -5
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache 2>&1 | tail -12
```

Expected: every task green; the story-test summary counts every story file (packages/ui + apps/storybook) with 0 failures.

- [ ] **Step 3: End-to-end, founder guard over fresh output, budgets, lockfile**

```bash
pnpm nx run-many -t e2e 2>&1 | tail -10
pnpm nx run-many -t build && pnpm guard:founder
pnpm nx build @pink-paprikaa-web/web && pnpm exec lhci autorun 2>&1 | tail -10
pnpm install --frozen-lockfile 2>&1 | tail -3
```

Expected: e2e green; `Founder-name guard: clean.` (it scans `apps/storybook/storybook-static`); Lighthouse budgets pass (if no Chrome is available, skip `lhci` and say why in the table — nothing else may be skipped); the frozen install changes nothing.

- [ ] **Step 4: Diff review against the merge base (`dev`)**

```bash
BASE=$(git merge-base dev HEAD)
# Raw hex outside the token package (docs and reference material excluded):
git diff --name-only "$BASE"...HEAD -- . ':!packages/design-tokens/**' ':!docs/**' ':!zip-files/**' ':!pnpm-lock.yaml' \
  | xargs grep -nE '#[0-9a-fA-F]{3,8}\b' 2>/dev/null | grep -vE '^\S+\.md:' ; echo "hex scan done"
# Hand-written versions: every package.json change must be pnpm's (compare with the lockfile):
git diff "$BASE"...HEAD -- '**/package.json' package.json | grep -E '^\+\s+"[^"]+": "[\^~]?[0-9]' ; echo "version lines above must each match pnpm-lock.yaml"
# No project.json, no --no-verify, no egg, no founder names in source:
git ls-files '**/project.json'; echo "project.json scan done"
git log "$BASE"..HEAD --format=%B | grep -i -- '--no-verify'; echo "no-verify scan done"
grep -rniE '\begg' apps/storybook/src packages/ui/src packages/content/src | grep -viE 'egg-free|not even egg|no egg|egg mark|egg-dot'; echo "egg scan done"
grep -rniE 'rishav|pandey|anand' apps packages --include='*.ts' --include='*.tsx' --include='*.mdx' --include='*.json' --include='*.css' \
  -l | grep -v node_modules | grep -v 'scripts/check-founder-names'; echo "founder scan done"
# Scope creep: files outside the spec's §12 list
git diff --stat "$BASE"...HEAD -- apps/web apps/blog packages/seo tools/image-pipeline tools/typescript-config | tail -3
```

Expected: each scan prints only its `… done` line (hex hits in `.md` are excluded by the filter; any other hit is a finding); version lines each correspond to a lockfile entry; the last command shows no changes to the untouched projects (spec §12 "Untouched"), or each change is justified by a baseline repair (§11.3).

- [ ] **Step 5: Drift check (handbook maintenance contract)**

Every decision this branch changed has its handbook edit on this branch: confirm `docs/engineering/{02,03,04,05,06,09}-*.md` appear in `git diff --name-only "$BASE"...HEAD`, and that 09 lists D1–D18 and S-01–S-07. Missing → add it now (Task 14 wording), commit, rerun Steps 1–2.

- [ ] **Step 6: Whole-branch review by a fresh reviewer**

Dispatch a **new** reviewer subagent (superpowers:requesting-code-review — never the implementer's own session) with this brief, the spec path, the contracts path and `git diff "$BASE"...HEAD`:

> Review branch `feat/design-system` against `docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md`. For each of §1's six done-criteria, state met / not met with file:line evidence. Then walk every section — §2 sources (nothing copied from the zip `.jsx`), §3 decisions D1–D18, §4 conflicts C1–C16 as resolved, §5 the accessibility policy (one declared exception, axe everywhere else), §6 token architecture and name mapping, §7 assets/fonts/brand facts, §8 component rules (canonical shape, prop translation, client boundary, no arbitrary values), §9 the 90-component inventory against `packages/ui/src/index.ts`, §10 Storybook (13 groups in order, 33 cards mapped, kit copy rule), §11 gates (each probe-verified), §12 repository changes (and "Untouched"), §16 carried-forward items — and the contracts file's §0–§9. Hard rules: two-`a` Pink Paprikaa, no founder names, no egg, no literal brand hex outside `packages/design-tokens`, no hand-written versions, no `project.json`. Report findings as Critical / Important / Minor with file:line and a one-line fix.

For each finding: fix it (own commit, `fix(<scope>): …`), rerun the affected gate, and send the fix diff back to the **same** reviewer for a scoped re-review. Loop until no Critical or Important remain. A Minor not fixed is added to 09's drift ledger with its owner phase. Record every finding and its resolution for the evidence table.

- [ ] **Step 7: Visual sweep — all thirteen groups at 360 and 1280**

```bash
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -3
mkdir -p /tmp/pp-visual-sweep
pnpm exec serve apps/storybook/storybook-static -l 6007 >/tmp/pp-visual-sweep/serve.log 2>&1 &
SERVE_PID=$!
cd apps/storybook && node --input-type=module <<'SWEEP'
import { chromium } from "playwright";

const BASE = "http://localhost:6007";
const GROUPS = ["Introduction", "Brand", "Colors", "Type", "Spacing", "Layout", "Motion", "Marketing",
  "Atoms", "Molecules", "Organisms", "Layouts", "Website", "App"];
const index = await (await fetch(`${BASE}/index.json`)).json();
const visible = Object.values(index.entries).filter((entry) => (entry.tags ?? []).includes("dev"));
const isKit = (title) => title.startsWith("Website/") || title.startsWith("App/") || title.startsWith("Marketing/Kit/");
const pages = visible.filter((entry) => entry.type === "docs" || isKit(entry.title));
const perGroup = Object.fromEntries(GROUPS.map((group) => [group, pages.filter((p) => p.title.split("/")[0] === group).length]));
const problems = Object.entries(perGroup).filter(([, count]) => count === 0).map(([group]) => `no pages in ${group}`);
const browser = await chromium.launch();
for (const width of [360, 1280]) {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await context.newPage();
  page.on("pageerror", (error) => problems.push(`${width} ${page.url()} — ${error.message}`));
  for (const entry of pages) {
    const viewMode = entry.type === "docs" ? "docs" : "story";
    await page.goto(`${BASE}/iframe.html?id=${entry.id}&viewMode=${viewMode}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (isKit(entry.title) && entry.type !== "docs" && width === 360 && overflow > 0) {
      problems.push(`${entry.id} overflows by ${overflow}px at 360`);
    }
    if (entry.type === "docs" && width === 1280) {
      // remark-gfm (main.ts): without it an MDX table renders as literal pipes.
      if (await page.evaluate(() => /\|\s*-{3,}/.test(document.body.innerText))) {
        problems.push(`${entry.id} shows a raw Markdown table`);
      }
      // react-docgen-typescript include + tsconfigPath (main.ts): a component page lists its props.
      if (entry.importPath.includes("packages/ui/src/") && (await page.locator(".docblock-argstable-body tr").count()) === 0) {
        problems.push(`${entry.id} has an empty props table`);
      }
    }
    await page.screenshot({ path: `/tmp/pp-visual-sweep/${width}-${entry.id}.png`, fullPage: true });
  }
  await context.close();
}
await browser.close();
console.log(JSON.stringify(perGroup));
console.log(`${pages.length} pages × 2 widths → /tmp/pp-visual-sweep`);
console.log(problems.length === 0 ? "sweep: no page errors, every group present, no kit overflow" : problems.join("\n"));
process.exitCode = problems.length === 0 ? 0 : 1;
SWEEP
cd - && kill $SERVE_PID
```

Expected: every group has ≥ 1 page, `sweep: no page errors, every group present, no kit overflow` — no raw Markdown table on any docs page, and a props table on every component docs page (a component whose props are all native legitimately has none: list it with that reason; any other hit is a docgen finding). Then **look** at the screenshots (open each PNG; the reviewer from Step 6 may split the load by group) and compare foundation pages with their cards and kits with their source pages, served from the zip:

```bash
pnpm exec serve "zip-files/Pink Paprikaa Design System" -l 6008   # guidelines/*.card.html, ui_kits/*/index.html
```

Differences are fixed, or listed with a reason (expected: font rasterisation; copy that became real facts; the V4 token-step sizes). The kits' source pages load React from unpkg; if the sandbox blocks the network, compare against the `Pink Paprikaa Design System/ui_kits/*/README.md` composition tables and say so.

- [ ] **Step 8: The evidence table — and stop**

Write the report as a table, one row per step, each with the actual command and the tail of its output:

| #   | Step                            | Command                                      | Result    | Output tail |
| --- | ------------------------------- | -------------------------------------------- | --------- | ----------- |
| 1   | Clean tree                      | `git status --short`                         | PASS/FAIL |             |
| 2   | Formatting · references         | `nx format:check && nx sync:check`           |           |             |
| 3   | Everything, cold                | `pnpm verify:all --skip-nx-cache`            |           |             |
| 4   | Token gates                     | `design-tokens:test --skip-nx-cache`         |           |             |
| 5   | Storybook build                 | `storybook:build --skip-nx-cache`            |           |             |
| 6   | Story tests                     | `storybook:test --skip-nx-cache`             |           |             |
| 7   | E2E                             | `nx run-many -t e2e`                         |           |             |
| 8   | Founder guard (incl. Storybook) | `nx run-many -t build && pnpm guard:founder` |           |             |
| 9   | Lighthouse budgets              | `nx build web && lhci autorun`               |           |             |
| 10  | Lockfile integrity              | `pnpm install --frozen-lockfile`             |           |             |
| 11  | Diff review                     | Step 4 scans                                 |           |             |
| 12  | Drift check                     | Step 5                                       |           |             |
| 13  | Whole-branch review             | findings → resolutions (count by severity)   |           |             |
| 14  | Visual sweep                    | Step 7 script + manual comparison            |           |             |
| 15  | 33 cards mapped                 | Task 9 Step 3 `diff`                         |           |             |

Any FAIL stops here: fix through the normal loop and rerun from Step 1. With every row PASS, report the table and **do not merge** — the merge (and re-running `pnpm verify:all` on the merged result, and deleting the branch) is the owner's decision under `/pre-merge`'s last paragraph.

## Controller amendments (2026-09-27)

- **Review quote with the one-`a` misspelling** — elide the misspelled words with "[…]" (as written); the guest's remaining words stay verbatim. Accepted.
- **Canvas prices** — Plan 2b adds `PriceTag size="canvas"`; the Marketing kit uses `PriceTag` for every price on an artboard (the design system: "Prices on artwork use PriceTag scaled up"), not `SocialHeadline` + `formatRupees`. Task 0 confirms the size exists and patches Task 12.
- **Kit sample copy** (promo code, franchise line, story paragraphs) stays under the "Reference kit" badge — accepted.
- **Form story title** `Molecules/Field/React Hook Form + Zod` — keep; the Task 15 sweep judges the sidebar.
- **`isContained` (ToastProvider) / `portalContainer` (Dialog, Toast)** — Task 0 confirms the names against Plans 3a/4 as built and patches the kits.
- **Plan 4 deviations to reconcile in Task 0:** CartPanel `emptyTitle`/`emptyBody`/`noteField` + `cartTotals`; OrderTracker `badge`/`codeLabel`/`paymentLabel`; QuotePanel `wasLabel`; Dialog `closeLabel`/`portalContainer`; SiteHeader `compactActions`/`drawerLinks`/`portalContainer` with the drawer below `lg`; CtaBand/SiteFooter/HeroBanner `pattern` enum (replaces `hasPattern`); SiteFooter `hasDockClearance`; MenuList server organism + client filter with `allLabel`/`filterLabel`/`overflowLabel`/`emptyState`. Task 14 also amends spec §9.3 (drawer below lg).
