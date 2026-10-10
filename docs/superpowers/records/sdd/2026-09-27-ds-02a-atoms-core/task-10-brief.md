### Task 10: Divider

> **CONTROLLER DELTA (routed from batch A review):** `SymbolMark` (Task 1, done) renders `<span aria-hidden="true" className="…mask-symbol…">` — a CSS mask, not inline SVG. Anywhere this brief's test queries an `svg` element for the mark, query `.mask-symbol` (or the rendered span) instead.

**Dev reference:** `git show dev:packages/ui/src/atoms/divider/divider.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                           | Ruling  | Where / reason                                                                                       |
| ---------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------- |
| A labelled divider is a plain row of decorative rules, so the label stays readable | ALREADY | the label names the separator (`aria-label`), plan deviation 4                                       |
| `on="brand"` (white 30% rule, white label and mark)                                | DROP    | D5 — `border-subtle`, `text-subtle` and `color-divider-mark` follow the surface; Task 15 accepts 22% |
| Radix `Separator` + `"use client"`                                                 | DROP    | D6/D7 — a native `role="separator"` needs no JS                                                      |
| `min-w-0` rules, so a long label cannot push them out                              | ALREADY | the rules are empty `flex-1` spans (zero min-content width)                                          |
| `diamond` ignores `label`                                                          | ALREADY | the label names the diamond break without printing it                                                |
| Tests: hairline + separator role, overline caps, two rules, decorative mark, axe   | ALREADY | Step 2                                                                                               |
| Test: caller className replaces the rule colour                                    | ADD     | Step 2                                                                                               |
| Stories `Default`, `Variants`                                                      | ALREADY | `Line`, `Label`, `Diamond`                                                                           |
| Story `OnBrand` includes the plain line                                            | ADD     | Step 6                                                                                               |
| Story `BetweenMenuRows`                                                            | ADD     | Step 6                                                                                               |

Implementer: copy this table into your report, extended with anything the plan missed.

Source: `components/atoms/Divider.{jsx,d.ts,card.html,prompt.md}`.

**Visuals:**

- A 1px hairline in border-subtle.
- `label`: an uppercase overline (Poppins 700, 11.5px, +0.14em) in text-subtle, centred between two rules with a 14px gap.
- `diamond`: the 16px symbol at 90% opacity between two rules with a 12px gap; pink on light, white on a pink field.

**Semantics:** always `role="separator"`. The label is also the separator's `aria-label`, because a separator's children are presentational. `orientation="vertical"` draws a plain vertical rule.

**Surfaces:** the rule and label use semantic tokens (border-subtle, text-subtle), so they follow any surface. On a pink field that gives white at 22% (the zip hard-coded 28%). Only the mark needs a surface token, `color-divider-mark`.

**Files:**

- Create: `packages/design-tokens/tokens/component/divider.json`
- Modify: `tokens/surface/brand.json`, `tokens/surface/ink.json`, `tokens/surface/light.json`
- Create: `packages/ui/src/atoms/divider/divider.tsx`, `divider.test.tsx`, `divider.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`
- `contrast-pairs.json`: unchanged. The label is `text-subtle`, already measured on every surface, and the mark is not text.

**Interfaces:**

- Consumes: `SymbolMark` (Task 1), `componentVariants`; `OnSurfaces`.
- Produces: `Divider`, `interface DividerProps extends ComponentProps<"div">` (contracts §2); tokens `spacing-divider-mark`, `color-divider-mark`.

- [ ] **Step 1: Component tokens and surface skin**

`packages/design-tokens/tokens/component/divider.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "divider-mark": { "$value": "16px", "$description": "The diamond section-break mark." }
  },
  "color": {
    "$type": "color",
    "divider": {
      "mark": {
        "$value": "{color.pink.500}",
        "$description": "Diamond mark; white on pink and ink fields."
      }
    }
  }
}
```

`tokens/surface/brand.json` and `tokens/surface/ink.json`: inside `surface-<name>.color`, add `"divider": { "mark": { "$value": "{color.ink.000}" } }`.
`tokens/surface/light.json`: inside `surface-light.color`, add `"divider": { "mark": { "$value": "{color.pink.500}" } }`.

In `component-variants.ts`, append to `SPACING`: `"divider-mark",`.

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -6` → PASS.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/divider/divider.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Divider } from "./divider";

describe("Divider", () => {
  it("is a hairline separator in the surface's subtle border by default", () => {
    render(<Divider />);
    const rule = screen.getByRole("separator");
    expect(rule).toHaveClass("h-px", "w-full", "bg-border-subtle");
    expect(rule).toBeEmptyDOMElement();
    expect(rule).not.toHaveAttribute("aria-orientation");
  });

  it("centres an uppercase overline label between two rules, and names the separator with it", () => {
    render(<Divider label="Also Try" />);
    const rule = screen.getByRole("separator", { name: "Also Try" });
    expect(rule).toHaveClass("flex", "items-center", "gap-3.5");
    expect(within(rule).getByText("Also Try")).toHaveClass(
      "font-display",
      "text-overline",
      "uppercase",
      "text-text-subtle"
    );
    expect(rule.querySelectorAll(".bg-border-subtle")).toHaveLength(2);
  });

  it("breaks a section with the diamond mark in the surface-aware mark colour", () => {
    render(<Divider variant="diamond" />);
    const rule = screen.getByRole("separator");
    const mark = rule.querySelector("svg");
    expect(rule).toHaveClass("flex", "gap-3");
    expect(mark).toHaveClass("size-divider-mark", "text-divider-mark", "opacity-90");
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(rule.querySelectorAll(".bg-border-subtle")).toHaveLength(2);
  });

  it("names a diamond break with its label without printing it", () => {
    render(<Divider variant="diamond" label="Company" />);
    expect(screen.getByRole("separator", { name: "Company" })).toBeInTheDocument();
    expect(screen.queryByText("Company")).not.toBeInTheDocument();
  });

  it("draws a plain vertical rule", () => {
    render(<Divider orientation="vertical" label="Between" />);
    const rule = screen.getByRole("separator", { name: "Between" });
    expect(rule).toHaveAttribute("aria-orientation", "vertical");
    expect(rule).toHaveClass("w-px", "self-stretch", "bg-border-subtle");
    expect(rule).toBeEmptyDOMElement();
  });

  it("merges a consumer className and forwards native props", () => {
    render(<Divider className="my-6" id="rule" />);
    const rule = screen.getByRole("separator");
    expect(rule).toHaveClass("my-6", "h-px");
    expect(rule).toHaveAttribute("id", "rule");
  });

  it("lets a consumer className replace the rule colour", () => {
    render(<Divider className="bg-border-strong" />);
    const rule = screen.getByRole("separator");
    expect(rule).toHaveClass("bg-border-strong");
    expect(rule).not.toHaveClass("bg-border-subtle");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Divider />
        <Divider label="Also Try" />
        <Divider variant="diamond" />
        <Divider orientation="vertical" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: FAIL — `Failed to resolve import "./divider"`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/divider/divider.tsx`:

```tsx
import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";
import { SymbolMark } from "../../lib/symbol-mark";

export interface DividerProps extends ComponentProps<"div"> {
  /** line = hairline · diamond = the brand's section break. */
  variant?: "line" | "diamond";
  /** Centred uppercase label; also the separator's accessible name. */
  label?: string;
  /** vertical draws a plain rule (label and diamond are horizontal-only). */
  orientation?: "horizontal" | "vertical";
}

type Layout = "rule" | "vertical" | "labelled" | "diamond";

const divider = componentVariants({
  slots: {
    root: "",
    line: "h-px flex-1 bg-border-subtle",
    label: "shrink-0 font-display text-overline text-text-subtle uppercase",
    mark: "size-divider-mark text-divider-mark shrink-0 opacity-90",
  },
  variants: {
    layout: {
      rule: { root: "h-px w-full bg-border-subtle" },
      vertical: { root: "w-px self-stretch bg-border-subtle" },
      labelled: { root: "flex items-center gap-3.5" },
      diamond: { root: "flex items-center gap-3" },
    },
  },
});

function layoutOf(
  variant: DividerProps["variant"],
  label: string | undefined,
  orientation: DividerProps["orientation"]
): Layout {
  if (orientation === "vertical") return "vertical";
  if (variant === "diamond") return "diamond";
  return label === undefined ? "rule" : "labelled";
}

/** Hairline rule. `diamond` inserts the brand mark as a section break. */
export function Divider({
  variant = "line",
  label,
  orientation = "horizontal",
  className,
  ...props
}: DividerProps) {
  const layout = layoutOf(variant, label, orientation);
  const slots = divider({ layout });
  const hasOrnament = layout === "labelled" || layout === "diamond";
  return (
    <div
      role="separator"
      aria-orientation={orientation === "vertical" ? "vertical" : undefined}
      aria-label={label}
      className={slots.root({ className })}
      {...props}
    >
      {hasOrnament ? (
        <>
          <span className={slots.line()} />
          {layout === "diamond" ? (
            <SymbolMark className={slots.mark()} />
          ) : (
            <span className={slots.label()}>{label}</span>
          )}
          <span className={slots.line()} />
        </>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: PASS.

- [ ] **Step 6: Stories**

Card rows (`Divider.card.html`, full-width rows): `line`, `label`, `diamond`, `on="brand"` (→ a brand surface: the plain line, `label="Company"` + `diamond`). Extras: `orientation="vertical"`, `OnSurfaces`, `BetweenMenuRows` (dev parity).

`packages/ui/src/atoms/divider/divider.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Divider } from "./divider";

const meta = {
  title: "Atoms/Divider",
  component: Divider,
  args: { variant: "line" },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Hairline separator; the `diamond` variant is the brand's section break. Menu rows are separated by `Divider`, not by cards. The rule, the label and the mark follow the surface, so on a pink field they turn white with no prop. A `label` is also the separator's accessible name.",
      },
    },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Line: Story = { name: 'variant="line"' };

export const Label: Story = { name: "label", args: { label: "Also Try" } };

export const Diamond: Story = { name: 'variant="diamond"', args: { variant: "diamond" } };

export const OnBrand: Story = {
  name: "on a brand surface",
  render: () => (
    <div data-surface="brand" className="grid gap-2.5 rounded-lg bg-surface-brand p-3.5">
      <Divider />
      <Divider label="Company" />
      <Divider variant="diamond" />
    </div>
  ),
};

/** How it reads: menu rows separated by a rule, not by cards, closed by the diamond. */
export const BetweenMenuRows: Story = {
  name: "in context: between menu rows",
  render: () => (
    <div className="w-80 font-body text-body">
      {[
        { name: "Paneer Tikka Masala", price: "₹280" },
        { name: "Veg Steamed Momos", price: "₹180" },
        { name: "Masala Cold Brew", price: "₹200" },
      ].map((dish, index) => (
        <div key={dish.name}>
          {index > 0 ? <Divider /> : null}
          <div className="flex items-baseline justify-between gap-4 py-4">
            <span className="min-w-0">{dish.name}</span>
            <span className="text-text-brand">{dish.price}</span>
          </div>
        </div>
      ))}
      <Divider variant="diamond" className="my-8" />
    </div>
  ),
};

export const Vertical: Story = {
  name: 'orientation="vertical"',
  render: () => (
    <div className="flex h-10 items-center gap-3 font-body text-body-sm">
      <span>Sector 57</span>
      <Divider orientation="vertical" />
      <span>8am – 11:30pm</span>
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <div className="grid w-full gap-2.5">
        <Divider label="Also Try" />
        <Divider variant="diamond" />
      </div>
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { Divider, type DividerProps } from "./atoms/divider/divider";
```

- [ ] **Step 8: Gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/divider packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: green; Storybook builds.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the Divider atom with the diamond section break

A separator in three forms (hairline, labelled, diamond) plus a vertical
rule. The rule and label follow the surface through semantic tokens and the
drawn mark through its own surface token; the label names the separator.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

