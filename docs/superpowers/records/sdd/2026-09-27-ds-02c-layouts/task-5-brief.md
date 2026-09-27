### Task 5: AutoGrid

**Files:**

- Create: `packages/design-tokens/tokens/component/auto-grid.json`, `packages/ui/src/layouts/auto-grid/{auto-grid.tsx,auto-grid.test.tsx,auto-grid.stories.tsx}`
- Modify: `packages/ui/src/styles.css`, `packages/ui/src/lib/component-variants.ts`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/templates/auto-grid/auto-grid.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                           | Ruling  | Where / clause                                                                          |
| ------------------------------------------------------------------ | ------- | --------------------------------------------------------------------------------------- |
| Default card floor 260px + fluid grid gap                          | ALREADY | `min="md"`, `gap-grid-gap`                                                              |
| `size` narrow 180 / card 260 / panel 320                           | ALREADY | `min` xs–2xl token steps (spec §8.2, §9.4); 180 snaps to `sm` 200                       |
| Arbitrary `grid-cols-[repeat(auto-fit,minmax(min(Npx,100%),1fr))]` | DROP    | Token-only class rule (AUTHORING §6); the `autogrid-min-*` utility keeps the same track |
| Never a bare `1fr` track                                           | ALREADY | Step 3 stylesheet assertion + `LongWordHoldsTracks`                                     |
| `columns` 1–4, overriding auto-fit                                 | ALREADY | `columns` 1–6 (`grid-cols-N`)                                                           |
| `space` overrides the gap token                                    | ALREADY | Step 3                                                                                  |
| Test: keeps every child                                            | ALREADY | Step 3 `as="ul"` test                                                                   |
| Test: emits no colour, border or type classes                      | ADD     | Step 3 "paints nothing"                                                                 |
| Test: caller className replaces the gap token                      | ADD     | Step 3                                                                                  |
| Test: axe on a `ul`                                                | ALREADY | Step 3                                                                                  |
| Story `Default`, `FixedColumns`, `Narrow`                          | ALREADY | `Playground`, `Columns3`, `ColumnsAt360` / `NarrowerThanMinAt360`                       |
| Story `Floors` (every floor, labelled)                             | ADD     | Step 7 `Mins` (all six steps)                                                           |
| Story `Spacing` (2 · 6 · 12)                                       | ADD     | Step 7 `Spacing`                                                                        |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `--spacing-card-min(-wide)`, `--spacing-grid-gap` (Plan 1); `GAP_CLASS` (Task 1); `Card`, `Text` (Plan 2a) in stories.
- Produces: `AutoGrid`, `type AutoGridProps`, `type AutoGridMin = "xs" | "sm" | "md" | "lg" | "xl" | "2xl"` (used by Plan 3b's ChoiceCardGroup), component tokens `--spacing-grid-min-{xs,sm,md,lg,xl,2xl}`, and the utility `autogrid-min-<step>`.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/auto-grid.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "grid-min-xs": {
      "$value": "140px",
      "$description": "AutoGrid min=\"xs\": the smallest track before a column drops (chips, small tiles)."
    },
    "grid-min-sm": { "$value": "200px", "$description": "AutoGrid min=\"sm\"." },
    "grid-min-md": {
      "$value": "{spacing.card-min}",
      "$description": "AutoGrid min=\"md\" (default): the card minimum, 260px."
    },
    "grid-min-lg": {
      "$value": "{spacing.card-min-wide}",
      "$description": "AutoGrid min=\"lg\": the panel minimum, 320px."
    },
    "grid-min-xl": { "$value": "380px", "$description": "AutoGrid min=\"xl\"." },
    "grid-min-2xl": { "$value": "420px", "$description": "AutoGrid min=\"2xl\"." }
  }
}
```

In `packages/ui/src/lib/component-variants.ts`, add to `SPACING`:

```ts
  "grid-min-xs",
  "grid-min-sm",
  "grid-min-md",
  "grid-min-lg",
  "grid-min-xl",
  "grid-min-2xl",
```

- [ ] **Step 2: The auto-fit utility**

In `packages/ui/src/styles.css`, directly after `@utility autogrid-wide { … }`, add:

```css
/* AutoGrid's `min` steps (tokens/component/auto-grid.json): auto-fit tracks that drop a column
   instead of squashing one. min(step, 100%) keeps a track from outgrowing a narrow parent, and a
   fixed floor (never min-content) keeps a long word from widening its column. */
@utility autogrid-min-* {
  grid-template-columns: repeat(auto-fit, minmax(min(--value(--spacing-grid-min-*), 100%), 1fr));
}
```

(`--value(--spacing-grid-min-*)` is Tailwind 4.3's theme-key lookup for functional utilities. It was verified against the installed compiler: `autogrid-min-md` compiles to `repeat(auto-fit, minmax(min(var(--spacing-grid-min-md), 100%), 1fr))`, and an unknown step compiles to nothing.)

- [ ] **Step 3: Write the failing test**

`packages/ui/src/layouts/auto-grid/auto-grid.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { AutoGrid, type AutoGridMin } from "./auto-grid";

interface CatalogueEntry {
  name: string;
  value: unknown;
  surface: string | null;
}

const catalogue = JSON.parse(
  readFileSync(new URL("../../../../design-tokens/dist/tokens.json", import.meta.url), "utf8")
) as CatalogueEntry[];
const stylesheet = readFileSync(new URL("../../styles.css", import.meta.url), "utf8").replace(
  /\s+/g,
  " "
);

const MIN_STEPS: [AutoGridMin, string][] = [
  ["xs", "140px"],
  ["sm", "200px"],
  ["md", "260px"],
  ["lg", "320px"],
  ["xl", "380px"],
  ["2xl", "420px"],
];

describe("AutoGrid", () => {
  it("is an auto-fit grid at the card minimum with the fluid gap by default", () => {
    render(<AutoGrid data-testid="grid" />);
    expect(screen.getByTestId("grid")).toHaveClass("grid", "gap-grid-gap", "autogrid-min-md");
  });

  it.each(MIN_STEPS)("min=%s drops a column below its %s token", (min, width) => {
    render(<AutoGrid min={min} data-testid="grid" />);
    expect(screen.getByTestId("grid")).toHaveClass(`autogrid-min-${min}`);
    const token = catalogue.find(
      (entry) => entry.surface === null && entry.name === `spacing-grid-min-${min}`
    );
    expect(token?.value).toBe(width);
  });

  it.each([1, 2, 3, 4, 5, 6] as const)(
    "columns=%s fixes that many minmax(0, 1fr) tracks and ignores min",
    (columns) => {
      render(<AutoGrid columns={columns} min="lg" data-testid="grid" />);
      const grid = screen.getByTestId("grid");
      expect(grid).toHaveClass(`grid-cols-${String(columns)}`);
      expect(grid.className).not.toMatch(/autogrid-min-/);
    }
  );

  // Review Focus 1, pure half — the rendered half is the LongWordHoldsTracks story.
  it("builds auto-fit tracks on the min(step, 100%) floor, never content", () => {
    expect(stylesheet).toContain(
      "@utility autogrid-min-* { grid-template-columns: repeat(auto-fit, minmax(min(--value(--spacing-grid-min-*), 100%), 1fr)); }"
    );
  });

  it("takes a spacing step in place of the fluid gap", () => {
    render(<AutoGrid space={6} data-testid="grid" />);
    const grid = screen.getByTestId("grid");
    expect(grid).toHaveClass("gap-6");
    expect(grid).not.toHaveClass("gap-grid-gap");
  });

  it("lets a consumer className replace the gap token", () => {
    render(<AutoGrid className="gap-12" data-testid="grid" />);
    const grid = screen.getByTestId("grid");
    expect(grid).toHaveClass("gap-12");
    expect(grid).not.toHaveClass("gap-grid-gap");
  });

  it("paints nothing — no colour, border, shadow or type class", () => {
    render(<AutoGrid data-testid="grid" />);
    const classes = screen.getByTestId("grid").className.split(/\s+/);
    expect(classes.filter((name) => /^(bg|border|shadow|text|font)-/.test(name))).toEqual([]);
  });

  it("renders a list when as=ul", () => {
    render(
      <AutoGrid as="ul">
        <li>Chai</li>
      </AutoGrid>
    );
    expect(screen.getByRole("list")).toContainElement(screen.getByRole("listitem"));
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <AutoGrid as="ul" min="sm">
        <li>Chai</li>
        <li>Kulfi</li>
        <li>Bun maska</li>
      </AutoGrid>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 4: Run it to verify it fails**

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Failed to resolve import "./auto-grid"`. The `component-variants` spec must already PASS with the six new names; if it fails, the `SPACING` list and the token file disagree.

- [ ] **Step 5: Implement**

`packages/ui/src/layouts/auto-grid/auto-grid.tsx`:

```tsx
import type { ComponentProps, ElementType } from "react";

import { componentVariants } from "../../lib/component-variants";
import { GAP_CLASS, type SpaceStep } from "../../lib/space";

/** Minimum track before a column drops: xs 140 · sm 200 · md 260 · lg 320 · xl 380 · 2xl 420 px. */
export type AutoGridMin = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const autoGrid = componentVariants({
  base: "grid gap-grid-gap",
  variants: {
    // styles.css `autogrid-min-*`: repeat(auto-fit, minmax(min(<step>, 100%), 1fr)).
    min: {
      xs: "autogrid-min-xs",
      sm: "autogrid-min-sm",
      md: "autogrid-min-md",
      lg: "autogrid-min-lg",
      xl: "autogrid-min-xl",
      "2xl": "autogrid-min-2xl",
    },
    // Tailwind's grid-cols-N is repeat(N, minmax(0, 1fr)) — never a bare 1fr.
    columns: {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
    },
    space: GAP_CLASS,
  },
});

export interface AutoGridProps extends ComponentProps<"div"> {
  /** Auto-fit track minimum — the width at which a column drops. Handoff values snap to a step. */
  min?: AutoGridMin;
  /** A fixed column count instead of auto-fit; `min` is then ignored. */
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Gap step. Default: the fluid grid gap clamp(16px, 2vw, 24px). */
  space?: SpaceStep;
  as?: "div" | "ul" | "ol" | "section";
}

/** Every card grid in the system: it drops columns instead of squashing them. */
export function AutoGrid({
  as = "div",
  min = "md",
  columns,
  space,
  className,
  ...props
}: AutoGridProps) {
  const Element: ElementType = as;
  return (
    <Element
      className={autoGrid({
        min: columns === undefined ? min : undefined,
        columns,
        space,
        className,
      })}
      {...props}
    />
  );
}
```

- [ ] **Step 6: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 7: Stories — card parity, columns by viewport, and the track proofs**

The card (`AutoGrid.card.html`) rows:

- `min={240}` — four cards; snaps to `md` (260). 240 is 20px from 260 and 40px from 200 (spec §15 risk 2).
- `min={160}` — five cards; snaps to `xs` (140).
- `columns={3}` — three cards.

The guideline card `autogrid.card.html` is the `md` default.

`packages/ui/src/layouts/auto-grid/auto-grid.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";

import { expect, within } from "storybook/test";

import { Card } from "../../atoms/card/card";
import { Text } from "../../atoms/text/text";
import { GAP_CLASS } from "../../lib/space";
import { AutoGrid, type AutoGridMin } from "./auto-grid";

function DemoCard({ children }: { children: ReactNode }) {
  return (
    <Card padding="sm">
      <Text variant="caption" as="div" tone="muted">
        {children}
      </Text>
    </Card>
  );
}

const cards = (count: number, label = "card") =>
  Array.from({ length: count }, (_value, index) => (
    <DemoCard key={index}>{`${label} ${String(index + 1)}`}</DemoCard>
  ));

const LONG_WORD = "Paprikaa".repeat(8);

const MINS: { min: AutoGridMin; px: string }[] = [
  { min: "xs", px: "140px" },
  { min: "sm", px: "200px" },
  { min: "md", px: "260px" },
  { min: "lg", px: "320px" },
  { min: "xl", px: "380px" },
  { min: "2xl", px: "420px" },
];

const meta = {
  title: "Layouts/AutoGrid",
  component: AutoGrid,
  args: { min: "md", children: cards(4) },
  argTypes: {
    columns: { control: "select", options: [1, 2, 3, 4, 5, 6] },
    space: { control: "select", options: Object.keys(GAP_CLASS).map(Number) },
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Every card grid in the system. Tracks are always minmax(0, 1fr) — or the auto-fit min pattern minmax(min(step, 100%), 1fr) — so a long label wraps instead of widening the column: the single most common layout bug this prevents. `min` steps: xs 140 · sm 200 · md 260 (default, the card minimum) · lg 320 (panels) · xl 380 · 2xl 420; handoff grid minimums snap to the nearest step. `columns` fixes the count instead. The gap is the fluid clamp(16px, 2vw, 24px) unless `space` picks a step.",
      },
    },
  },
} satisfies Meta<typeof AutoGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const MinMd: Story = {
  name: 'min="md" · the card\'s min={240}, snapped to 260',
  args: { min: "md", children: cards(4) },
};

export const MinXs: Story = {
  name: 'min="xs" · the card\'s min={160}, snapped to 140',
  args: { min: "xs", children: cards(5) },
};

export const Columns3: Story = {
  name: "columns={3} · minmax(0, 1fr)",
  args: { columns: 3, children: cards(3, "fixed") },
};

/** Every `min` step, labelled: the width a track must lose before a column drops (dev parity). */
export const Mins: Story = {
  name: "min — xs 140 · sm 200 · md 260 · lg 320 · xl 380 · 2xl 420",
  render: () => (
    <div className="grid gap-8">
      {MINS.map(({ min, px }) => (
        <div key={min} className="grid gap-3">
          <Text variant="overline" as="div" tone="muted">
            {`min="${min}" · ${px}`}
          </Text>
          <AutoGrid min={min}>{cards(6)}</AutoGrid>
        </div>
      ))}
    </div>
  ),
};

/** `space` swaps the fluid gap for a step: 8px · 24px · 48px (dev parity). */
export const Spacing: Story = {
  name: "space — 2 · 6 · 12",
  render: () => (
    <div className="grid gap-8">
      {([2, 6, 12] as const).map((space) => (
        <AutoGrid key={space} space={space}>
          {cards(3, `space={${String(space)}}`)}
        </AutoGrid>
      ))}
    </div>
  ),
};

export const ColumnsAt360: Story = {
  name: "360px — one column",
  args: { children: cards(8) },
  globals: { viewport: { value: "floor360", isRotated: false } },
};

export const ColumnsAt768: Story = {
  name: "768px — two columns",
  args: { children: cards(8) },
  globals: { viewport: { value: "md", isRotated: false } },
};

export const ColumnsAt1280: Story = {
  name: "1280px — four columns",
  args: { children: cards(8) },
  globals: { viewport: { value: "xl", isRotated: false } },
};

/**
 * Review Focus 1: a 64-character word in one cell overflows that cell — the three tracks stay
 * equal. (A bare `1fr` track would take the word's min-content width and squeeze the others.)
 */
export const LongWordHoldsTracks: Story = {
  name: "long unbreakable word — tracks hold",
  render: () => (
    <AutoGrid columns={3}>
      <div data-testid="cell">{LONG_WORD}</div>
      <div data-testid="cell">Chai</div>
      <div data-testid="cell">Kulfi</div>
    </AutoGrid>
  ),
  play: async ({ canvasElement }) => {
    const widths = within(canvasElement)
      .getAllByTestId("cell")
      .map((cell) => cell.getBoundingClientRect().width);
    const [first = 0, ...rest] = widths;
    for (const width of rest) {
      await expect(width).toBeCloseTo(first, 0);
    }
  },
};

/** Review Focus 1 at the floor: a 380px step inside a 328px column — min(step, 100%) wins. */
export const NarrowerThanMinAt360: Story = {
  name: '360px — min="xl" never outgrows its parent',
  globals: { viewport: { value: "floor360", isRotated: false } },
  render: () => (
    <AutoGrid min="xl" data-testid="grid">
      {cards(3)}
    </AutoGrid>
  ),
  play: async ({ canvasElement }) => {
    const grid = within(canvasElement).getByTestId("grid");
    const gridWidth = grid.getBoundingClientRect().width;
    for (const cell of grid.children) {
      await expect(cell.getBoundingClientRect().width).toBeLessThanOrEqual(gridWidth + 0.5);
    }
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};
```

- [ ] **Step 8: Export**

Add to `packages/ui/src/index.ts`:

```ts
export { AutoGrid, type AutoGridMin, type AutoGridProps } from "./layouts/auto-grid/auto-grid";
```

- [ ] **Step 9: Format, gate, commit**

Run `pnpm exec prettier --write packages/ui/src/layouts/auto-grid packages/ui/src/styles.css packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/auto-grid.json`, then the gate. Expected: green, including both track stories. Paste the summary lines.

```bash
git add packages/design-tokens/tokens/component/auto-grid.json packages/ui/src/layouts/auto-grid \
  packages/ui/src/styles.css packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): AutoGrid layout

Auto-fit card grids on six token steps (140-420px, md = the card
minimum) through one functional utility, or fixed minmax(0, 1fr)
columns. Track floors are never content, so a long word overflows its
cell instead of widening a column; Chromium stories measure the tracks.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

