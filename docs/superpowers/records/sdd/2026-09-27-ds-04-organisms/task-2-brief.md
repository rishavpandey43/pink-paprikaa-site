### Task 2: StatBand

**Dev reference:** `git show dev:packages/ui/src/organisms/stat-band/stat-band.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                          | Ruling  | Where / clause                                                           |
| ------------------------------------------------- | ------- | ------------------------------------------------------------------------ |
| Every value and label render                      | ALREADY | test "lists every stat with its value, label and sub-line"               |
| A sub-line only on the stat that carries one      | ADD     | test "renders a sub-line only for the stat that carries one"             |
| One glyph per stat that asks for one              | ADD     | test "draws one glyph per stat that asks for one"                        |
| Each tone floods its `bg-surface-*` ground        | ADD     | the tone `it.each` asserts the background class                          |
| Numbers white on brand/ink, pink on soft          | ADD     | test "colours the numbers brand on soft and white on the flooded fields" |
| Every column centred                              | ADD     | test "centres every stat so the row reads as one band"                   |
| Auto-fit grid survives 360px (`min(200px,100%)`)  | ALREADY | `autogrid-min-sm` test                                                   |
| Merges a caller `className`                       | ADD     | test "merges a caller className over its own"                            |
| axe                                               | ALREADY | test "has no accessibility violations"                                   |
| `label`/`sub` as `string`, `icon` as `LucideIcon` | ALREADY | `ReactNode` / `IconComponent` (D10)                                      |
| Exported `StatBandTone`                           | ALREADY | `StatBandProps["tone"]`                                                  |
| Stories Default · Tones · FourAcross · Narrow     | ALREADY | Playground · Soft/Brand/Ink · FourStats · Mobile                         |
| Story WithIcons                                   | ADD     | `WithIcons`                                                              |
| Story WithSubLines                                | ADD     | `WithSubLines`                                                           |
| "4.6 average guest rating", "7 sections" copy     | DROP    | prompt "only real, verifiable numbers" + spec §10.1 (Step 6 note)        |

Implementer: copy this table into your report, extended with anything the plan missed.

**Files:**

- Create: `packages/design-tokens/tokens/component/stat-band.json`
- Create: `packages/ui/src/organisms/stat-band/stat-band.tsx`, `stat-band.test.tsx`, `stat-band.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `PatternField`, `Stat`, `IconComponent`, `componentVariants`; the `autogrid-min-sm` utility (Plan 2c).
- Produces: `StatBand`, `StatBandProps`, `StatBandItem`.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/stat-band.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "stat-band-y": {
      "$value": "clamp(40px, 5vw, 64px)",
      "$description": "StatBand vertical rhythm (design system StatBand)."
    },
    "stat-band-gap": { "$value": "clamp(24px, 3vw, 40px)" }
  }
}
```

Append to `SPACING` in `packages/ui/src/lib/component-variants.ts`:

```ts
  "stat-band-y",
  "stat-band-gap",
```

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && rtk proxy grep -n "stat-band" packages/design-tokens/dist/theme.css`
Expected: `--spacing-stat-band-y` and `--spacing-stat-band-gap`. The track is Plan 2c's `autogrid-min-sm` utility (`repeat(auto-fit, minmax(min(200px, 100%), 1fr))`, the design system's 200px stat minimum), so no track token is needed.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/organisms/stat-band/stat-band.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";
import { Leaf } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { StatBand, type StatBandItem } from "./stat-band";

const STATS: StatBandItem[] = [
  { value: "30", label: "dishes on the Classic plan" },
  { value: "3 km", label: "free delivery radius" },
  { value: "100%", label: "pure vegetarian kitchen", sub: "No egg, no meat, ever" },
];

describe("StatBand", () => {
  it("lists every stat with its value, label and sub-line", () => {
    render(<StatBand stats={STATS} />);
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("30");
    expect(items[0]).toHaveTextContent("dishes on the Classic plan");
    expect(screen.getByText("No egg, no meat, ever")).toBeInTheDocument();
  });

  it("renders a sub-line only for the stat that carries one", () => {
    render(<StatBand stats={STATS} />);
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items[0]?.textContent).toBe("30dishes on the Classic plan");
    expect(items[2]).toHaveTextContent("No egg, no meat, ever");
  });

  it("draws one glyph per stat that asks for one", () => {
    render(
      <StatBand
        stats={STATS.map((stat, index) => (index === 1 ? stat : { ...stat, icon: Leaf }))}
      />
    );
    expect(screen.getByRole("list").querySelectorAll("svg")).toHaveLength(2);
  });

  it.each([
    ["soft", "bg-surface-brand-soft"],
    ["brand", "bg-surface-brand"],
    ["ink", "bg-surface-inverse"],
  ] as const)("paints the %s field and sets its surface", (tone, background) => {
    const { container } = render(<StatBand stats={STATS} tone={tone} />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", tone);
    expect(container.firstElementChild).toHaveClass(background);
  });

  it("colours the numbers brand on soft and white on the flooded fields", () => {
    const { rerender } = render(<StatBand stats={STATS} tone="soft" />);
    expect(screen.getByText("3 km")).toHaveClass("text-text-brand");
    rerender(<StatBand stats={STATS} tone="ink" />);
    expect(screen.getByText("3 km")).toHaveClass("text-text-on-inverse");
  });

  it("centres every stat so the row reads as one band", () => {
    render(<StatBand stats={STATS} />);
    expect(screen.getByText("3 km").parentElement).toHaveClass("text-center");
  });

  it("merges a caller className over its own", () => {
    const { container } = render(<StatBand stats={STATS} className="bg-surface-page" />);
    expect(container.firstElementChild).toHaveClass("bg-surface-page");
    expect(container.firstElementChild).not.toHaveClass("bg-surface-brand-soft");
  });

  it("always carries the tiled diamond", () => {
    const { container } = render(<StatBand stats={STATS} />);
    expect(container.querySelector('section > [aria-hidden="true"]')).toBeInTheDocument();
  });

  it("lays the stats on the auto-fitting stat grid", () => {
    render(<StatBand stats={STATS} />);
    expect(screen.getByRole("list")).toHaveClass("autogrid-min-sm", "container-page");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<StatBand stats={STATS} tone="brand" />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- stat-band 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./stat-band`.

- [ ] **Step 4: Implement**

`packages/ui/src/organisms/stat-band/stat-band.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import type { IconComponent } from "../../atoms/icon/icon";

import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { Stat } from "../../molecules/stat/stat";

export interface StatBandItem {
  value: ReactNode;
  label: ReactNode;
  sub?: ReactNode;
  icon?: IconComponent | undefined;
}

const statBand = componentVariants({
  slots: {
    root: "relative",
    pattern: "absolute inset-0",
    grid: "gap-stat-band-gap py-stat-band-y relative container-page grid autogrid-min-sm",
  },
  variants: {
    tone: {
      soft: { root: "bg-surface-brand-soft" },
      brand: { root: "bg-surface-brand" },
      ink: { root: "bg-surface-inverse" },
    },
  },
  defaultVariants: { tone: "soft" },
});

type StatBandTone = NonNullable<VariantProps<typeof statBand>["tone"]>;

/** Numbers read in brand pink on the soft field and white on the flooded ones (design system). */
const STAT_TONE: Readonly<Record<StatBandTone, "brand" | "inverse">> = {
  soft: "brand",
  brand: "inverse",
  ink: "inverse",
};

export interface StatBandProps
  extends ComponentProps<"section">, Pick<VariantProps<typeof statBand>, "tone"> {
  /** Three or four real, verifiable numbers — more reads as noise. */
  stats: StatBandItem[];
}

/** A proof band of big numbers between two content sections, over the tiled diamond. */
export function StatBand({ stats, tone = "soft", className, ...props }: StatBandProps) {
  const slots = statBand({ tone });
  return (
    <section data-surface={tone} className={slots.root({ className })} {...props}>
      <PatternField aria-hidden tone={tone} tile={80} className={slots.pattern()} />
      <ul className={slots.grid()}>
        {stats.map((stat, index) => (
          <li key={index}>
            <Stat {...stat} tone={STAT_TONE[tone]} align="center" />
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- stat-band 2>&1 | tail -8`
Expected: PASS (12 tests). The number-colour and centring assertions read Stat's own classes (Plan 3a: `text-text-brand` / `text-text-on-inverse` on the value, `text-center` on the root); if Task 0 found them renamed, use the built names.

- [ ] **Step 6: Stories (card parity with `StatBand.card.html`)**

The card's own numbers ("6 outlets", "4.6 average guest rating") are not true of the brand today (one kitchen; no published rating) and the prompt rule is "only real, verifiable numbers", so the rows use verifiable facts from the handoff.

`packages/ui/src/organisms/stat-band/stat-band.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Clock, Leaf, Truck, UtensilsCrossed } from "lucide-react";

import { VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { StatBand, type StatBandItem } from "./stat-band";

const STATS: StatBandItem[] = [
  { value: "30", label: "dishes on the Classic plan" },
  { value: "3 km", label: "free delivery radius" },
  { value: "100%", label: "pure vegetarian kitchen" },
];

const meta = {
  title: "Organisms/StatBand",
  component: StatBand,
  args: { stats: STATS },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A proof band of big numbers between two content sections. Three or four real, verifiable numbers — never more. Auto-fits to one column on phones.",
      },
    },
  },
} satisfies Meta<typeof StatBand>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: `tone="soft"` (default). */
export const Soft: Story = { args: { tone: "soft" } };

/** Card row: `tone="brand"`. */
export const Brand: Story = { args: { tone: "brand" } };

/** The third tone named on the card. */
export const Ink: Story = { args: { tone: "ink" } };

export const FourStats: Story = {
  args: { stats: [...STATS, { value: "8 km", label: "free catering delivery" }] },
};

/** Glyphs go on every stat or none — a half-set row reads as a rendering bug. */
export const WithIcons: Story = {
  args: {
    stats: [
      { value: "30", label: "dishes on the Classic plan", icon: UtensilsCrossed },
      { value: "3 km", label: "free delivery radius", icon: Truck },
      { value: "100%", label: "pure vegetarian kitchen", icon: Leaf },
    ],
  },
};

/** The sub-line carries the detail behind a number that needs one. */
export const WithSubLines: Story = {
  args: {
    stats: [
      {
        value: "8am",
        label: "the kitchen opens",
        sub: "Open till 11:30pm, every day",
        icon: Clock,
      },
      {
        value: "3 km",
        label: "free delivery radius",
        sub: "From MKM Market, Sector 57",
        icon: Truck,
      },
      {
        value: "100%",
        label: "pure vegetarian kitchen",
        sub: "No egg, no meat, ever",
        icon: Leaf,
      },
    ],
  },
};

export const Mobile: Story = { globals: VIEWPORT_360 };
export const Tablet: Story = { globals: VIEWPORT_768 };
export const Desktop: Story = { globals: VIEWPORT_1280 };
```

- [ ] **Step 7: Export**

```ts
export { StatBand, type StatBandItem, type StatBandProps } from "./organisms/stat-band/stat-band";
```

- [ ] **Step 8: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/stat-band packages/design-tokens/tokens/component/stat-band.json packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/design-tokens/tokens/component/stat-band.json packages/ui/src/organisms/stat-band packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): StatBand organism

Three or four stats on an auto-fitting grid over the tiled diamond, in the
soft, brand and ink tones; numbers go brand pink on soft and white on the
flooded fields.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

