### Task 15: Stat

Design-system sources: `components/molecules/Stat.*`; organism `StatBand.jsx` (passes `tone="inverse"` on dark bands, `"brand"` on light). Card rows: default (two stats) · icon + brand · inverse + center.

**Files:**

- Create: `packages/design-tokens/tokens/component/stat.json`
- Create: `packages/ui/src/molecules/stat/stat.tsx`, `stat.test.tsx`, `stat.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`), `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/stat/stat.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                           | Ruling  | Where / why                                                                               |
| ------------------------------------------------------------------ | ------- | ----------------------------------------------------------------------------------------- |
| no sub line and no glyph unless given                              | ADD     | test "renders no sub line and no glyph…"                                                  |
| caller `className` merges                                          | ADD     | test "merges a caller className…"                                                         |
| `WithSub`, `Row` (three across) and `Narrow` stories               | ADD     | `WithSub`, `Row`, `Narrow` stories                                                        |
| inverse label / sub at 85% / 65% white (`text-text-on-inverse/85`) | DROP    | spec D5 / §3.2.2: label and sub are semantic text that the ink surface remaps (.92 / .85) |
| number fluid (`text-h1-fluid`, extrabold)                          | ALREADY | `text-stat-value` fluid clamp at font-weight black (design system `Stat.jsx`)             |
| label and value; three tones; centre; decorative glyph             | ALREADY | tests "reads number, label and sub…", tone `it.each`, "centres…", glyph `it.each`         |
| `Default`, `WithIcon`, `Tones`, `OnInk`, `Centred` stories         | ALREADY | `Playground`, `Default`, `IconBrand`, `InverseCentre`                                     |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Icon`.
- Produces: `Stat`, `StatProps` — contract §5. `tone` colours the number only (`ink` → heading, `brand` → brand text, `inverse` → white); the label and sub are semantic text and follow the surface.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/stat.json`:

```json
{
  "text": {
    "$type": "typography",
    "stat-value": {
      "$value": {
        "fontSize": "clamp(30px, 3.4vw, 42px)",
        "lineHeight": 1.02,
        "letterSpacing": "-0.025em",
        "fontWeight": "{font-weight.black}"
      },
      "$description": "The big number — fluid, so it never overflows a narrow column (Poppins 800)."
    },
    "stat-label": {
      "$value": { "fontSize": "15px", "lineHeight": 1.6 },
      "$description": "The one line under the number (DM Sans 500)."
    },
    "stat-sub": {
      "$value": { "fontSize": "13px", "lineHeight": 1.6 },
      "$description": "Optional fine print under the label."
    }
  }
}
```

Append `"stat-value"`, `"stat-label"`, `"stat-sub"` to `TEXT`. Rebuild tokens and run the variant spec. (No new pair: `text-heading`, `text-brand`, `text-body`, `text-subtle` and `text-on-inverse` are already measured on every surface by Plan 1.)

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/stat/stat.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { Heart } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Stat } from "./stat";

describe("Stat", () => {
  it("reads number, label and sub in that order", () => {
    const { container } = render(
      <Stat value="18" label="spices ground in-house, daily" sub="Every morning at Sector 57" />
    );
    expect(container.firstElementChild).toHaveTextContent(
      "18spices ground in-house, dailyEvery morning at Sector 57"
    );
    expect(screen.getByText("18")).toHaveClass("text-stat-value");
  });

  it.each([
    ["ink", "text-text-heading"],
    ["brand", "text-text-brand"],
    ["inverse", "text-text-on-inverse"],
  ] as const)("colours the number for tone %s", (tone, colour) => {
    render(<Stat value="4.6" label="average guest rating" tone={tone} />);
    expect(screen.getByText("4.6")).toHaveClass(colour);
  });

  it("keeps the label and sub on semantic text, so they follow the surface", () => {
    render(<Stat value="2025" label="the year we started" sub="Sector 57" tone="inverse" />);
    expect(screen.getByText("the year we started")).toHaveClass("text-text-body");
    expect(screen.getByText("Sector 57")).toHaveClass("text-text-subtle");
  });

  it.each([
    ["ink", "text-pink-500"],
    ["inverse", "text-white-alpha-70"],
  ] as const)("draws a decorative %s-tone glyph above the number", (tone, colour) => {
    const { container } = render(
      <Stat value="4.6" label="average guest rating" icon={Heart} tone={tone} />
    );
    const glyph = container.querySelector("svg.lucide-heart")?.parentElement;
    expect(glyph).toHaveAttribute("aria-hidden", "true");
    expect(glyph).toHaveClass(colour);
  });

  it("centres everything for align center", () => {
    const { container } = render(<Stat value="6" label="outlets" align="center" />);
    expect(container.firstElementChild).toHaveClass("justify-items-center", "text-center");
  });

  it("renders no sub line and no glyph unless given", () => {
    const { container } = render(<Stat value="6" label="outlets" />);
    expect(container.firstElementChild?.children).toHaveLength(2);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("merges a caller className over its own gap", () => {
    const { container } = render(<Stat value="6" label="outlets" className="gap-4" />);
    expect(container.firstElementChild).toHaveClass("gap-4");
    expect(container.firstElementChild).not.toHaveClass("gap-1");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Stat value="4.6" label="average guest rating" icon={Heart} tone="brand" />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/stat 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./stat`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/stat/stat.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";

const stat = componentVariants({
  slots: {
    root: "grid gap-1",
    icon: "mb-1",
    value: "text-stat-value font-display",
    label: "text-stat-label font-body font-medium text-text-body",
    sub: "text-stat-sub text-text-subtle",
  },
  variants: {
    tone: {
      ink: { icon: "text-pink-500", value: "text-text-heading" },
      brand: { icon: "text-pink-500", value: "text-text-brand" },
      inverse: { icon: "text-white-alpha-70", value: "text-text-on-inverse" },
    },
    align: {
      start: { root: "justify-items-start text-start" },
      center: { root: "justify-items-center text-center" },
    },
  },
  defaultVariants: { tone: "ink", align: "start" },
});

export interface StatProps extends ComponentProps<"div"> {
  value: ReactNode;
  /** One short line, sentence case, no full stop. */
  label: ReactNode;
  sub?: ReactNode;
  icon?: IconComponent | undefined;
  /** Colours the number: heading ink, brand pink, or white on a dark band. */
  tone?: "ink" | "brand" | "inverse" | undefined;
  align?: "start" | "center" | undefined;
}

/** A single big fact — outlet counts, spices ground, years open. At most 3–4 in a row; never invent numbers. */
export function Stat({
  value,
  label,
  sub,
  icon,
  tone = "ink",
  align = "start",
  className,
  ...props
}: StatProps) {
  const styles = stat({ tone, align });

  return (
    <div className={styles.root({ className })} {...props}>
      {icon === undefined ? null : <Icon icon={icon} size="lg" className={styles.icon()} />}
      <span className={styles.value()}>{value}</span>
      <span className={styles.label()}>{label}</span>
      {sub === undefined || sub === null ? null : <span className={styles.sub()}>{sub}</span>}
    </div>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/stat 2>&1 | tail -8`
Expected: PASS (11 tests).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/stat/stat.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Heart } from "lucide-react";

import { Stat } from "./stat";

const meta = {
  title: "Molecules/Stat",
  component: Stat,
  args: { value: "18", label: "spices ground in-house, daily" },
  parameters: {
    docs: {
      description: {
        component:
          "A single big fact — outlet counts, spices ground, years open. The number is fluid-clamped Poppins 800, so it never overflows a narrow column; `tone` colours it (ink, brand, or white `inverse` on a dark band) while the label and sub follow the surface. Use at most 3–4 in a row and never invent numbers.",
      },
    },
  },
} satisfies Meta<typeof Stat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "default". */
export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-10">
      <Stat value="18" label="spices ground in-house, daily" />
      <Stat value="100%" label="vegetarian kitchen" />
    </div>
  ),
};

/** Card row "icon + brand". */
export const IconBrand: Story = {
  args: { value: "4.6", label: "average guest rating", icon: Heart, tone: "brand" },
};

/** Card row "inverse + center", on an ink field. */
export const InverseCentre: Story = {
  args: { value: "2025", label: "the year we started", tone: "inverse", align: "center" },
  render: (args) => (
    <div data-surface="ink" className="rounded-lg bg-surface-inverse p-6">
      <Stat {...args} />
    </div>
  ),
};

/** Dev parity: the sub line carries the detail behind the number. */
export const WithSub: Story = {
  args: { value: "100%", label: "vegetarian kitchen", sub: "No meat, no egg, ever." },
};

/** Dev parity: three across, the most a row should carry; one column each below 480px. */
export const Row: Story = {
  render: () => (
    <div className="grid gap-8 sm:grid-cols-3">
      <Stat value="100%" label="vegetarian kitchen" />
      <Stat value="18" label="spices ground in-house, daily" />
      <Stat value="2025" label="the year we started" />
    </div>
  ),
};

/** Dev parity: at 360px the fluid number steps down rather than pushing the column open. */
export const Narrow: Story = {
  args: { value: "4.6", label: "average guest rating", sub: "Across every ordering channel" },
  decorators: [
    (Story) => (
      <div className="w-full max-w-80">
        <Story />
      </div>
    ),
  ],
};
```

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export { Stat, type StatProps } from "./molecules/stat/stat";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/stat packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/stat packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/stat.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): Stat molecule

A fluid Poppins 800 number with one line under it; tone colours the number
only, so the label and sub follow whatever surface the band sets.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

