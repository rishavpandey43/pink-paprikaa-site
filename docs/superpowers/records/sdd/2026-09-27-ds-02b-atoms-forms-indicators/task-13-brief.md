### Task 13: DietMark (veg only)

The kitchen is pure veg — not even egg (spec C10, owner 2026-09-27). The design system's `type="egg"` variant is **not built**; `DietMark.card.html`'s "egg" row has no story, and the docs say why.

**Files:**

- Create: `packages/design-tokens/tokens/component/diet-mark.json`
- Create: `packages/ui/src/atoms/diet-mark/diet-mark.tsx`, `diet-mark.test.tsx`, `diet-mark.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/atoms/diet-mark/diet-mark.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                 | Ruling  | Where / clause                                         |
| -------------------------------------------------------- | ------- | ------------------------------------------------------ |
| the veg mark by default, named "Vegetarian"              | ALREADY | Step 2                                                 |
| `variant="egg"` ("Contains egg", turmeric) + its stories | DROP    | C10 — pure veg, not even egg                           |
| outline in the veg green, dot from `currentColor`        | ALREADY | Step 2                                                 |
| size xs (sizes 14 / 16 / 20 / 24)                        | DROP    | contract sm / md / lg (plan "Decisions": 14 / 16 / 20) |
| a caller label                                           | ALREADY | Step 2                                                 |
| caller `className` replaces a conflict                   | ADD     | Step 2 new test                                        |
| axe                                                      | ALREADY | Step 2                                                 |
| stories default / sizes / in context                     | ALREADY | Step 6 (egg rows dropped, C10)                         |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `componentVariants`, `--color-veg`.
- Produces: `DietMark`, `DietMarkProps` as contract §3 (`role="img"`, `label` default "Vegetarian", size sm/md/lg = 14/16/20px).

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/diet-mark.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "diet-mark-sm": {
      "$value": "14px",
      "$description": "Beside a dish name in a menu row or card."
    },
    "diet-mark-md": { "$value": "16px", "$description": "The default mark." },
    "diet-mark-lg": { "$value": "20px" }
  }
}
```

Append to `SPACING`: `"diet-mark-sm", "diet-mark-md", "diet-mark-lg"`. No contrast pair (a non-text mark; `veg` on white is 5.4:1 regardless).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/diet-mark/diet-mark.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { DietMark } from "./diet-mark";

describe("DietMark", () => {
  it("is an image named Vegetarian", () => {
    render(<DietMark />);
    expect(screen.getByRole("img", { name: "Vegetarian" })).toBeInTheDocument();
  });

  it("draws the statutory square and dot in the veg green", () => {
    const { container } = render(<DietMark />);
    expect(screen.getByRole("img")).toHaveClass("text-veg");
    expect(container.querySelector("rect")).toHaveAttribute("stroke", "currentColor");
    expect(container.querySelector("rect")).toHaveAttribute("fill", "none");
    expect(container.querySelector("circle")).toHaveAttribute("fill", "currentColor");
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it.each([
    ["sm", "size-diet-mark-sm"],
    ["md", "size-diet-mark-md"],
    ["lg", "size-diet-mark-lg"],
  ] as const)("renders size %s at %s", (size, sizeClass) => {
    render(<DietMark size={size} />);
    expect(screen.getByRole("img")).toHaveClass(sizeClass);
  });

  it("takes another label", () => {
    render(<DietMark label="Pure vegetarian" />);
    expect(screen.getByRole("img", { name: "Pure vegetarian" })).toBeInTheDocument();
  });

  it("merges a caller className, replacing a conflicting size", () => {
    render(<DietMark className="size-6" />);
    expect(screen.getByRole("img")).toHaveClass("size-6");
    expect(screen.getByRole("img")).not.toHaveClass("size-diet-mark-md");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<DietMark />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './diet-mark'`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/diet-mark/diet-mark.tsx`:

```tsx
import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";

const dietMark = componentVariants({
  base: "inline-flex shrink-0 text-veg",
  variants: {
    size: { sm: "size-diet-mark-sm", md: "size-diet-mark-md", lg: "size-diet-mark-lg" },
  },
  defaultVariants: { size: "md" },
});

export interface DietMarkProps extends ComponentProps<"span"> {
  /** sm 14px (beside a dish name) · md 16px · lg 20px. = "md" */
  size?: "sm" | "md" | "lg" | undefined;
  /** = "Vegetarian" */
  label?: string | undefined;
}

/**
 * The statutory Indian vegetarian mark: a green square outline with a green dot at half its size.
 * The only diet mark in this system — the kitchen is pure veg, not even egg (spec C10). The
 * outline keeps a 1.5px stroke at every size (non-scaling stroke), as the design system's border.
 */
export function DietMark({
  size = "md",
  label = "Vegetarian",
  className,
  ...props
}: DietMarkProps) {
  return (
    <span role="img" aria-label={label} className={dietMark({ size, className })} {...props}>
      <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className="size-full">
        <rect
          x="0.75"
          y="0.75"
          width="14.5"
          height="14.5"
          rx="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx="8" cy="8" r="4" fill="currentColor" />
      </svg>
    </span>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories (card parity with `DietMark.card.html`, egg row excluded; docs from `DietMark.prompt.md`)**

`packages/ui/src/atoms/diet-mark/diet-mark.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { DietMark } from "./diet-mark";

const meta = {
  title: "Atoms/DietMark",
  component: DietMark,
  parameters: {
    docs: {
      description: {
        component:
          "The statutory Indian vegetarian mark — a green square and dot. Every menu item on every surface carries one. Pink Paprikaa is a pure-veg kitchen, not even egg, so this is the only diet mark in the system: the design system's egg variant is not built (spec C10) and no non-veg mark may be added. Never substitute an emoji or a coloured pill. `sm` (14px) sits beside a dish name.",
      },
    },
  },
} satisfies Meta<typeof DietMark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Veg: Story = {
  name: "veg",
  render: () => (
    <div className="flex items-center gap-4">
      <DietMark size="sm" />
      <DietMark size="md" />
      <DietMark size="lg" />
    </div>
  ),
};

export const InContext: Story = {
  name: "in context",
  render: () => (
    <span className="flex items-center gap-2">
      <DietMark size="sm" />
      <span className="font-display text-h4 text-text-heading">Paprikaa Chilli Paneer</span>
    </span>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { DietMark, type DietMarkProps } from "./atoms/diet-mark/diet-mark";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/diet-mark packages/design-tokens/tokens/component/diet-mark.json
```

Run the gate. Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the DietMark atom — the veg mark only

The statutory green square and dot, drawn once as an SVG with a
non-scaling stroke, named Vegetarian. The design system's egg variant is
not built: the kitchen is pure veg, not even egg.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

