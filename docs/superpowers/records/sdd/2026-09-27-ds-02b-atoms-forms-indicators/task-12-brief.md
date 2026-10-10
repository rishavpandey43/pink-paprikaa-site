### Task 12: SpiceLevel

**Files:**

- Create: `packages/ui/src/atoms/spice-level/spice-level.tsx`, `spice-level.test.tsx`, `spice-level.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/atoms/spice-level/spice-level.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                         | Ruling  | Where / clause                                                        |
| ---------------------------------------------------------------- | ------- | --------------------------------------------------------------------- |
| `level` defaults to 1 (Mild)                                     | DROP    | contract §3 `level` is required (D9: no content defaults)             |
| named "Spice level: Mild"                                        | DROP    | spec §9.1 `role="img"` "Spice level 3 of 4"                           |
| the whole four-diamond scale                                     | ALREADY | Step 2                                                                |
| a shorter scale (`max` 1–3)                                      | DROP    | contract §3 `max?: 4`                                                 |
| lit diamonds take the level's colour, replacing the neutral base | ALREADY | `BrandDiamond` `fill` (a lit diamond carries no `bg-ink-200`); Step 2 |
| diamonds above the level stay ink-200                            | ALREADY | Step 2                                                                |
| the printed heat name is not announced twice                     | ALREADY | inside `role="img"` the label is presentational                       |
| heat name only on request                                        | ALREADY | Step 2                                                                |
| size xs                                                          | DROP    | contract sm / md / lg (plan "Decisions": 12 / 14 / 20)                |
| caller `className` on the root, replacing a conflict             | ADD     | Step 2 new test                                                       |
| axe over a plain level 1 and a labelled level                    | ADD     | Step 2 a11y test                                                      |
| stories levels / with label / sizes                              | ALREADY | Step 6                                                                |
| story: a shorter scale                                           | DROP    | goes with `max` 1–3                                                   |
| story: in a menu row (the real shape)                            | ADD     | Step 6 `InContext`                                                    |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `BrandDiamond` (Task 11), `componentVariants`, `OnSurfaces` (Plan 2a).
- Produces: `SpiceLevel`, `SpiceLevelProps` as contract §3 (`role="img"` "Spice level 3 of 4"; `hasLabel` shows Mild / Medium / Hot / Extra Hot; size sm/md/lg = 12/14/20px diamonds).

- [ ] **Step 1: Component tokens**

None new: diamonds reuse `brand-diamond.json` (12, 14, 20), the label is `text-overline`. The label paints `text-text-muted` — asserted on every ground. No list names.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/spice-level/spice-level.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { SpiceLevel } from "./spice-level";

describe("SpiceLevel", () => {
  it("is one image named with the level", () => {
    render(<SpiceLevel level={3} />);
    expect(screen.getByRole("img", { name: "Spice level 3 of 4" })).toBeInTheDocument();
  });

  it("fills the first diamonds with the level's heat colour and leaves the rest ink-200", () => {
    const { container } = render(<SpiceLevel level={3} />);
    expect(container.querySelectorAll(".rotate-45.bg-heat-3")).toHaveLength(3);
    expect(container.querySelectorAll(".rotate-45.bg-ink-200")).toHaveLength(1);
  });

  it.each([
    [1, "bg-heat-1"],
    [2, "bg-heat-2"],
    [4, "bg-heat-4"],
  ] as const)("colours level %d with %s — the heat ramp, mint to pink", (level, heat) => {
    const { container } = render(<SpiceLevel level={level} />);
    expect(container.querySelectorAll(`.rotate-45.${heat}`)).toHaveLength(level);
  });

  it.each([
    [1, "Mild"],
    [2, "Medium"],
    [3, "Hot"],
    [4, "Extra Hot"],
  ] as const)("names level %d %s with hasLabel, as an uppercase overline", (level, label) => {
    render(<SpiceLevel level={level} hasLabel />);
    expect(screen.getByText(label)).toHaveClass("uppercase", "text-overline", "text-text-muted");
  });

  it("shows no label by default", () => {
    render(<SpiceLevel level={2} />);
    expect(screen.queryByText("Medium")).not.toBeInTheDocument();
  });

  it.each([
    ["sm", "size-brand-diamond-12"],
    ["md", "size-brand-diamond-14"],
    ["lg", "size-brand-diamond-20"],
  ] as const)("draws size %s diamonds at %s", (size, diamond) => {
    const { container } = render(<SpiceLevel level={2} size={size} />);
    expect(container.querySelectorAll(`.${diamond}`)).toHaveLength(4);
  });

  it("carries a white mark on a filled diamond and a pink one on an empty diamond", () => {
    const { container } = render(<SpiceLevel level={1} />);
    expect(container.querySelector(".bg-heat-1 > svg")).toHaveClass("text-ink-000");
    expect(container.querySelector(".bg-ink-200 > svg")).toHaveClass("text-pink-500");
  });

  it("merges a caller className onto the root, replacing a conflicting class", () => {
    render(<SpiceLevel level={2} className="gap-6" />);
    const spice = screen.getByRole("img");
    expect(spice).toHaveClass("gap-6");
    expect(spice).not.toHaveClass("gap-2");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <SpiceLevel level={1} />
        <SpiceLevel level={4} hasLabel />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './spice-level'`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/spice-level/spice-level.tsx`:

```tsx
import type { ComponentProps } from "react";

import { BrandDiamond, type BrandDiamondSize } from "../../lib/brand-diamond";
import { componentVariants } from "../../lib/component-variants";

type Level = 1 | 2 | 3 | 4;
type SpiceSize = "sm" | "md" | "lg";

/** Plain heat names a guest already knows (readme §2: controls never carry a word to decode). */
const SPICE_LABEL: Readonly<Record<Level, string>> = {
  1: "Mild",
  2: "Medium",
  3: "Hot",
  4: "Extra Hot",
};

/** Filled diamonds take the heat colour of the level: mint → turmeric → tandoor → pink. */
const HEAT_FILL = { 1: "heat-1", 2: "heat-2", 3: "heat-3", 4: "heat-4" } as const;

/** sm is the menu size (MenuItemRow, MenuItemCard); md the design system's default. */
const DIAMOND_SIZE: Readonly<Record<SpiceSize, BrandDiamondSize>> = {
  sm: "12px",
  md: "14px",
  lg: "20px",
};

const spiceLevel = componentVariants({
  slots: {
    root: "inline-flex items-center gap-2",
    diamonds: "inline-flex items-center gap-1",
    label: "font-display text-overline text-text-muted uppercase",
  },
});

export interface SpiceLevelProps extends ComponentProps<"span"> {
  level: Level;
  /** = 4 */
  max?: 4 | undefined;
  /** Show Mild / Medium / Hot / Extra Hot beside the diamonds. */
  hasLabel?: boolean | undefined;
  /** sm 12 · md 14 · lg 20px diamonds. = "md" */
  size?: SpiceSize | undefined;
}

/** Heat from the brand's diamond motif — the sanctioned alternative to a chilli emoji. */
export function SpiceLevel({
  level,
  max = 4,
  hasLabel = false,
  size = "md",
  className,
  ...props
}: SpiceLevelProps) {
  const styles = spiceLevel();
  return (
    <span
      role="img"
      aria-label={`Spice level ${String(level)} of ${String(max)}`}
      className={styles.root({ className })}
      {...props}
    >
      <span className={styles.diamonds()}>
        {Array.from({ length: max }, (_, index) => (
          <BrandDiamond
            key={index}
            size={DIAMOND_SIZE[size]}
            fill={index < level ? HEAT_FILL[level] : "empty"}
          />
        ))}
      </span>
      {hasLabel ? <span className={styles.label()}>{SPICE_LABEL[level]}</span> : null}
    </span>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories (card parity with `SpiceLevel.card.html`; docs from `SpiceLevel.prompt.md`)**

`packages/ui/src/atoms/spice-level/spice-level.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { SpiceLevel } from "./spice-level";

const LEVELS = [1, 2, 3, 4] as const;

const meta = {
  title: "Atoms/SpiceLevel",
  component: SpiceLevel,
  args: { level: 3 },
  parameters: {
    docs: {
      description: {
        component:
          'Heat indicator built from the brand\'s diamond motif — never a chilli emoji. Filled diamonds take the heat colour of the level (mint → turmeric → tandoor → pink); the rest sit in ink-200, each carrying the brand mark. `hasLabel` adds the plain name: Mild, Medium, Hot, Extra Hot. `sm` (12px) is the menu size, `md` (14px) the default. One image, named "Spice level 3 of 4".',
      },
    },
  },
} satisfies Meta<typeof SpiceLevel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Levels: Story = {
  name: "level",
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      {LEVELS.map((level) => (
        <SpiceLevel key={level} level={level} />
      ))}
    </div>
  ),
};

export const WithLabel: Story = {
  name: "hasLabel",
  render: () => (
    <div className="grid gap-3">
      {LEVELS.map((level) => (
        <SpiceLevel key={level} level={level} hasLabel />
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <SpiceLevel level={3} size="sm" />
      <SpiceLevel level={3} size="md" />
      <SpiceLevel level={3} size="lg" />
    </div>
  ),
};

/** How it appears: under the dish name in a menu row (plain elements — an atom story composes no atom). */
export const InContext: Story = {
  name: "in a menu row",
  render: () => (
    <div className="max-w-text-measure-prose grid gap-1">
      <p className="m-0 font-display text-h4 font-bold text-text-heading">Paprikaa Chilli Paneer</p>
      <p className="m-0 font-body text-body-sm text-text-muted">
        Wok-tossed cottage cheese, capsicum, spring onion.
      </p>
      <SpiceLevel level={3} size="sm" hasLabel />
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <SpiceLevel level={3} hasLabel />
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { SpiceLevel, type SpiceLevelProps } from "./atoms/spice-level/spice-level";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/spice-level
```

Run the gate. Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui
git commit -m "feat(ui): add the SpiceLevel atom

Four brand diamonds on the heat ramp, the filled ones in the level's colour
with a white mark, the rest ink-200 with a pink one; an optional plain label
(Mild to Extra Hot). One image named with the level.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

