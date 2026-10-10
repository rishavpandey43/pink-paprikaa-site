### Task 0: Reconcile with the code as built

Plans 1, 2a and 2b are executed in parallel with this one; their **declared interfaces are truth**, but the code decides. This task reads, probes and patches this plan — it changes no product code.

**Files:** none, apart from a probe test you create and delete, and edits to this plan file when a mismatch forces one.

**Interfaces:**

- Consumes: everything listed in "Depends on".
- Produces: a written reconciliation report — each check, its result and every patch made to Tasks 1–9.

- [ ] **Step 1: Plan 1 tokens exist with the values this plan relies on**

Run:

```bash
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache
node -e '
const catalogue = require("./packages/design-tokens/dist/tokens.json");
const names = ["spacing-gutter","spacing-section","spacing-grid-gap","spacing-card-min","spacing-card-min-wide",
  "spacing-tabbar","container-content","container-wide","container-narrow","container-article","container-prose",
  "canvas-post-w","canvas-post-h","canvas-portrait-w","canvas-portrait-h","canvas-story-w","canvas-story-h",
  "canvas-landscape-w","canvas-landscape-h","canvas-wide-w","canvas-wide-h","canvas-mpu-w","canvas-mpu-h",
  "canvas-leaderboard-w","canvas-leaderboard-h","canvas-pad","canvas-pad-tight","canvas-story-safe-top",
  "canvas-story-safe-bottom","color-surface-page","color-surface-page-alt","color-surface-sunken",
  "color-surface-brand-soft","color-surface-brand","color-surface-inverse","color-surface-overlay",
  "color-border-subtle","color-border-default","color-ink-300","radius-pill","shadow-4"];
for (const name of names) {
  const entry = catalogue.find((e) => e.surface === null && e.name === name);
  console.log(name.padEnd(28), entry === undefined ? "MISSING" : entry.value);
}'
```

Expected:

- nothing `MISSING`;
- `spacing-gutter` = `clamp(16px, 4vw, 40px)`, `spacing-section` = `clamp(48px, 8vw, 96px)`, `spacing-card-min` = `260px`, `spacing-card-min-wide` = `320px`;
- the canvas sizes match readme §4b (post 1080×1080 … leaderboard 728×90), `canvas-pad` = `72px`, `canvas-pad-tight` = `48px`, story safe top/bottom = `250px`/`320px`.

A different **name** means patching every task that uses it. A different **value** means stopping to ask: the spec owns values.

- [ ] **Step 2: Plan 1 library core matches its declared interfaces**

Run:

```bash
rtk proxy grep -n '@source "./"\|@utility autogrid-wide\|@utility cluster' packages/ui/src/styles.css
rtk proxy grep -n "^const SPACING\|^const RADIUS\|^const TEXT\|twMergeConfig\|createTV" packages/ui/src/lib/component-variants.ts
rtk proxy grep -n "export async function expectNoA11yViolations\|ResizeObserver ??=" packages/ui/vitest.setup.ts
rtk proxy grep -n "export function Icon\|export type IconComponent" packages/ui/src/atoms/icon/icon.tsx
rtk proxy grep -n "export function Logo" packages/ui/src/atoms/logo/logo.tsx
rtk proxy grep -n "floor360\|xl:\|decorators" apps/storybook/.storybook/preview.tsx
cat packages/ui/tailwind.css | tail -3
```

Expected:

- `styles.css` scans itself and defines `autogrid-wide`;
- `component-variants.ts` has `SPACING`, `RADIUS` and `TEXT` arrays inside `twMergeConfig.extend.theme`;
- the test helper is exported, and `ResizeObserver` is stubbed with `??=` (so `vi.stubGlobal` can replace it);
- `Icon` takes `icon`/`size`/`label`, and `Logo` takes `variant`/`tone`/`className`;
- the preview's viewport keys include `floor360` and `xl`;
- `packages/ui/tailwind.css` imports `./src/styles.css`, so `no-custom-classname` sees the `autogrid-min-*` utility added in Task 5.

Also confirm Plan 1's `Icon` test is green (`pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -5`). That test runs `expectNoA11yViolations` on landmark-less content. If axe's `region` rule fires on an isolated component, confirm the helper disables it (Plan 1 Task 7 owns that — component tests are not page-level) and continue.

- [ ] **Step 3: Plan 2a atoms match contracts §2**

Run:

```bash
rtk proxy grep -n "export interface\|export function\|export type" \
  packages/ui/src/atoms/{pattern-field,text,card,button,tag,social-headline}/*.tsx | rtk proxy grep -v "test\|stories"
cat packages/ui/src/atoms/pattern-field/pattern-field.tsx
```

Confirm each prop this plan uses:

- `PatternField`: `tone`, `tile`, `density`, `className`;
- `Text`: `variant`, `tone`, `as`, `weight`;
- `Card`: `padding`;
- `Button`: `variant`, `size`, `isFullWidth`;
- `Tag`: `isSelected`, and it renders a `<span>` when there is no `onClick`;
- `SocialHeadline`: `size`, `as`.

Then prove the one PatternField behaviour Section relies on — rendering as a transparent layer through `className`. Create `packages/ui/src/layouts/probe.test.tsx`:

```tsx
import { render } from "@testing-library/react";

import { PatternField } from "../atoms/pattern-field/pattern-field";

it("PatternField can be a transparent, absolutely placed layer", () => {
  const { container } = render(
    <PatternField
      aria-hidden
      tone="ink"
      density="faint"
      className="pointer-events-none absolute inset-0 bg-transparent"
    />
  );
  const layer = container.firstElementChild;
  expect(layer).toHaveAttribute("data-surface", "ink");
  expect(layer).toHaveClass("absolute", "bg-transparent");
  expect(layer?.className).not.toMatch(/\bbg-surface-/);
  expect(layer?.className).not.toMatch(/(^|\s)relative(\s|$)/);
});
```

Run `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- -t "transparent" 2>&1 | tail -8`, then delete the file (`rm packages/ui/src/layouts/probe.test.tsx`). Expected: PASS.

If it fails, PatternField paints its field with something `className` cannot override (an inline style, or a class twMerge does not group with `bg-transparent`). **Do not edit PatternField from this plan.** Raise it with the Plan 2a owner and hold Task 6; every other task can proceed.

- [ ] **Step 4: Nothing this plan creates exists yet**

Run: `ls packages/ui/src/lib/space.ts packages/ui/src/layouts 2>&1; ls packages/design-tokens/tokens/component/`

Expected: `space.ts` and `layouts/` are absent, and none of `section|auto-grid|app-shell|post-frame.json` exists. If `space.ts` already exists (another executor created it to unblock itself), diff it against Task 1. If it matches, Task 1 only adds what is missing; if it differs, patch it to Task 1's version and tell that plan's owner.

- [ ] **Step 5: Story tests honour viewport globals**

Run: `pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache 2>&1 | tail -8`

Expected: green (Plan 1's Icon and Logo stories). This plan's Review Focus depends on `globals: { viewport: { value: "floor360" } }` reaching `page.viewport()`. That is addon-vitest's `setViewport`, verified in `node_modules/@storybook/addon-vitest/dist/vitest-plugin/test-utils.js`.

- [ ] **Step 5b: Dev parity tables present on every ported-component task**

Run: `rtk proxy grep -c '^\*\*Dev parity:\*\*' docs/superpowers/plans/2026-09-27-ds-02c-layouts.md`

Expected: `8` — Task 1 (dev's inline gap maps) and Tasks 2–8 (the seven dev `templates/` layouts). Spot-check one table against `git show dev:packages/ui/src/templates/<name>/<name>.tsx`.

- [ ] **Step 6: Patch this plan, then report**

For every mismatch found in Steps 1–5, edit the affected task's code blocks in **this file** before Task 1 starts (so implementers of later tasks read the corrected code). Report each check with its output and list every patch. No commit — this task changes no product code. If you patched the plan, commit the plan file alone:

```bash
git add docs/superpowers/plans/2026-09-27-ds-02c-layouts.md
git commit -m "docs: reconcile plan 2c with the code as built

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

