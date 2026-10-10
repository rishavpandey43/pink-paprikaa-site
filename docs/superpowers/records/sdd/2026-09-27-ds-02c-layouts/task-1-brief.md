### Task 1: The spacing steps the layouts share — `lib/space.ts`

**Files:**

- Create: `packages/ui/src/lib/space.ts`, `packages/ui/src/lib/space.spec.ts`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** none as a file — dev inlined a `GAP` map in each layout: `git show dev:packages/ui/src/templates/{stack/stack,cluster/cluster,auto-grid/auto-grid}.tsx`

**Dev parity:**

| Dev item                                                                                                          | Ruling  | Where / clause                                                                   |
| ----------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------- |
| Per-layout `GAP` maps (Stack 0–16, Cluster 0–12, AutoGrid 0/2–12) and `StackSpace`/`ClusterSpace`/`AutoGridSpace` | ALREADY | One shared `GAP_CLASS` / `SpaceStep` (contracts §1), a superset of every dev map |
| Half-step classes `gap-0-5`, `gap-1-5`                                                                            | DROP    | D4 (old token names); Tailwind 4's native `gap-0.5` / `gap-1.5`                  |
| Literal class strings so Tailwind scans them                                                                      | ALREADY | Step 3 doc comment + the `it.each(STEPS)` spec                                   |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Produces (contracts §1, used by Stack, Cluster, AutoGrid and any later component that takes a gap): `type SpaceStep = 0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 14 | 16 | 18 | 20 | 24 | 32` and `const GAP_CLASS: Readonly<Record<SpaceStep, string>>` (complete literal class names). Pass it straight into `componentVariants({ variants: { space: GAP_CLASS } })`.

- [ ] **Step 1: Write the failing spec**

`packages/ui/src/lib/space.spec.ts`:

```ts
import { GAP_CLASS, type SpaceStep } from "./space";

/** The design system's spacing steps (readme §3.3): 0, the half steps, 1–12, then 14 … 32. */
const STEPS: SpaceStep[] = [
  0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 32,
];

describe("GAP_CLASS", () => {
  it("covers exactly the design system's steps — no more, no fewer", () => {
    const keys = Object.keys(GAP_CLASS)
      .map(Number)
      .sort((a, b) => a - b);
    expect(keys).toEqual(STEPS);
  });

  it.each(STEPS)("maps step %s to its literal gap class, so Tailwind scans it", (step) => {
    expect(GAP_CLASS[step]).toBe(`gap-${String(step)}`);
  });
});
```

(`GAP_CLASS` is a plain object, so `eslint-plugin-tailwindcss` does not read it. This spec is what catches a typo in it.)

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Failed to resolve import "./space"`.

- [ ] **Step 3: Implement**

`packages/ui/src/lib/space.ts`:

```ts
/**
 * The design system's spacing steps (readme §3.3). Step N is N × 4px — `6` is 24px, always — so a
 * layout takes a step number, never a length. Steps 1–12 run in ones, then 14, 16, 18, 20, 24 and
 * 32 (56–128px); the half steps 0.5 (2px) and 1.5 (6px) exist for optical nudges.
 */
export type SpaceStep =
  0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 14 | 16 | 18 | 20 | 24 | 32;

/**
 * The gap utility for each step. Every value is a complete literal class name, so Tailwind's
 * scanner (`@source "./"` in styles.css) emits it — never assemble these strings at runtime.
 * Layouts pass this map straight to `componentVariants` as their `space` variant.
 */
export const GAP_CLASS: Readonly<Record<SpaceStep, string>> = {
  0: "gap-0",
  0.5: "gap-0.5",
  1: "gap-1",
  1.5: "gap-1.5",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  7: "gap-7",
  8: "gap-8",
  9: "gap-9",
  10: "gap-10",
  11: "gap-11",
  12: "gap-12",
  14: "gap-14",
  16: "gap-16",
  18: "gap-18",
  20: "gap-20",
  24: "gap-24",
  32: "gap-32",
};
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS (22 tests in `space.spec.ts`).

- [ ] **Step 5: Export**

Add to `packages/ui/src/index.ts`, next to the other `./lib/…` exports:

```ts
export { GAP_CLASS, type SpaceStep } from "./lib/space";
```

- [ ] **Step 6: Format, gate, commit**

Run `pnpm exec prettier --write packages/ui/src/lib/space.ts packages/ui/src/lib/space.spec.ts packages/ui/src/index.ts`, then the gate. Expected: green; paste the summary lines.

```bash
git add packages/ui/src/lib/space.ts packages/ui/src/lib/space.spec.ts packages/ui/src/index.ts
git commit -m "feat(ui): spacing steps shared by the layout primitives

SpaceStep is the design system's scale (step N = N x 4px, with the 0.5
and 1.5 half steps); GAP_CLASS maps each step to a literal gap class so
Tailwind scans every one. Layouts take a step, never a length.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

