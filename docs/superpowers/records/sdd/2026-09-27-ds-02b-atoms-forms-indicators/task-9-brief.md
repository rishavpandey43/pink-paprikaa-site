### Task 9: Skeleton

**Files:**

- Create: `packages/ui/src/atoms/skeleton/skeleton.tsx`, `skeleton.test.tsx`, `skeleton.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/atoms/skeleton/skeleton.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                   | Ruling                | Where / clause                                                                                                                                                              |
| ---------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| soft pink, a straight pulse, never grey or a gradient      | ALREADY               | Step 2                                                                                                                                                                      |
| hidden from assistive tech without a label                 | ALREADY               | always `aria-hidden`                                                                                                                                                        |
| `label` → `role="status"`, announced                       | ALREADY (differently) | contract §3 `SkeletonProps` has no `label`: the loading region is named once and its placeholders stay hidden. ADD that pattern to the `card shape` story and the a11y test |
| variants text / block / circle                             | ALREADY               | Step 2                                                                                                                                                                      |
| block floor `h-20 rounded-3`                               | DROP                  | `Skeleton.jsx` default 16px, `radius-sm` (spec D2); height comes from `className`                                                                                           |
| stacked lines, varied widths, cycling past four            | ALREADY               | Step 2                                                                                                                                                                      |
| `lines` forces the text shape                              | ALREADY               | `lines` belongs to `variant="text"` (contract §3)                                                                                                                           |
| caller `className` on a single block                       | ALREADY               | Step 2                                                                                                                                                                      |
| caller `className` on the stack (`gap-6` replaces `gap-2`) | ADD                   | Step 2 new test                                                                                                                                                             |
| axe over block, lines and circle                           | ADD                   | Step 2 a11y test                                                                                                                                                            |
| stories block / lines / circle / menu row                  | ALREADY               | Step 6 (`card shape` is the menu row)                                                                                                                                       |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `animate-skeleton` (Plan 1), `componentVariants`.
- Produces: `Skeleton`, `SkeletonProps` as contract §3 (variant block/circle/text, `lines` 1–6, default 3; sized by `className`; `aria-hidden`).

- [ ] **Step 1: Component tokens**

None: 16px lines are `h-4`, the 8px line gap `gap-2`, the circle `size-10`, the fill `bg-pink-100` — all on the scale. No list names, no contrast pair.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/skeleton/skeleton.test.tsx`:

```tsx
import { render } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Skeleton } from "./skeleton";

const WIDTHS = ["w-full", "w-11/12", "w-2/3", "w-5/6"];
const widthOf = (element: Element) => WIDTHS.find((width) => element.classList.contains(width));

describe("Skeleton", () => {
  it("is hidden from assistive tech — the container announces loading, not the placeholder", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("is a 16px light-pink block by default, pulsing only when motion is allowed", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild).toHaveClass(
      "h-4",
      "w-full",
      "rounded-sm",
      "bg-pink-100",
      "motion-safe:animate-skeleton"
    );
  });

  it("is sized and shaped by className", () => {
    const { container } = render(<Skeleton className="h-18 rounded-lg" />);
    expect(container.firstElementChild).toHaveClass("h-18", "rounded-lg");
    expect(container.firstElementChild).not.toHaveClass("h-4", "rounded-sm");
  });

  it("draws a circle", () => {
    const { container } = render(<Skeleton variant="circle" className="size-8" />);
    expect(container.firstElementChild).toHaveClass("rounded-pill", "size-8");
  });

  it("draws three text lines by default", () => {
    const { container } = render(<Skeleton variant="text" />);
    expect(container.firstElementChild?.children).toHaveLength(3);
  });

  it("varies the line widths, cycling, so a paragraph never reads as a grid of bars", () => {
    const { container } = render(<Skeleton variant="text" lines={6} />);
    const lines = [...(container.firstElementChild?.children ?? [])];
    expect(lines.map(widthOf)).toEqual([
      "w-full",
      "w-11/12",
      "w-2/3",
      "w-5/6",
      "w-full",
      "w-11/12",
    ]);
  });

  it("spaces text lines by className too", () => {
    const { container } = render(<Skeleton variant="text" lines={2} className="gap-6" />);
    expect(container.firstElementChild).toHaveClass("gap-6");
    expect(container.firstElementChild).not.toHaveClass("gap-2");
  });

  it("has no accessibility violations as block, lines and circle in a named loading region", async () => {
    const { container } = render(
      <div role="status" aria-label="Loading the menu" aria-busy="true">
        <Skeleton className="h-18 rounded-lg" />
        <Skeleton variant="text" lines={3} />
        <Skeleton variant="circle" />
      </div>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './skeleton'`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/skeleton/skeleton.tsx`:

```tsx
import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";

/** The design system's line widths (100 / 92 / 68 / 84%) on Tailwind's fraction steps, cycling. */
const LINE_WIDTHS = ["w-full", "w-11/12", "w-2/3", "w-5/6"] as const;

/** Light-pink placeholders — never grey, never a gradient (readme §3.8). */
const skeleton = componentVariants({
  slots: {
    root: "",
    line: "block h-4 rounded-sm bg-pink-100 motion-safe:animate-skeleton",
  },
  variants: {
    variant: {
      block: { root: "block h-4 w-full rounded-sm bg-pink-100 motion-safe:animate-skeleton" },
      circle: { root: "block size-10 rounded-pill bg-pink-100 motion-safe:animate-skeleton" },
      text: { root: "grid gap-2" },
    },
  },
  defaultVariants: { variant: "block" },
});

export interface SkeletonProps extends ComponentProps<"div"> {
  /** = "block" */
  variant?: "text" | "block" | "circle" | undefined;
  /** Number of text lines (variant `text`). = 3 */
  lines?: 1 | 2 | 3 | 4 | 5 | 6 | undefined;
}

/** Loading placeholder, sized with `className` (`h-18 rounded-lg`, `size-8`). */
export function Skeleton({ variant = "block", lines = 3, className, ...props }: SkeletonProps) {
  const styles = skeleton({ variant });
  return (
    <div aria-hidden="true" className={styles.root({ className })} {...props}>
      {variant === "text"
        ? Array.from({ length: lines }, (_, index) => (
            <div
              key={index}
              className={styles.line({ className: LINE_WIDTHS[index % LINE_WIDTHS.length] })}
            />
          ))
        : null}
    </div>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories (card parity with `Skeleton.card.html`; docs from `Skeleton.prompt.md`)**

`packages/ui/src/atoms/skeleton/skeleton.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Skeleton } from "./skeleton";

const meta = {
  title: "Atoms/Skeleton",
  component: Skeleton,
  render: (args) => (
    <div className="max-w-text-measure-prose w-full">
      <Skeleton {...args} />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Loading placeholder — light-pink blocks, never grey, never a gradient spinner. Size and shape it with `className` (`h-18 rounded-lg`); `variant="text"` draws `lines` of varied width; `variant="circle"` for avatars and chips. It is hidden from assistive tech — mark the loading region `aria-busy` instead. For whole-page loads use the pulsing Spinner.',
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Block: Story = { name: "block", args: { className: "h-18 rounded-lg" } };

export const Lines: Story = { name: "lines", args: { variant: "text", lines: 3 } };

export const Circle: Story = {
  name: "circle",
  render: () => (
    <div className="flex items-center gap-3">
      <Skeleton variant="circle" />
      <Skeleton variant="circle" className="size-8" />
    </div>
  ),
};

/** The loading region is named once (`role="status"`); its placeholders stay hidden. */
export const CardShape: Story = {
  name: "card shape",
  render: () => (
    <div
      role="status"
      aria-label="Loading the menu"
      aria-busy="true"
      className="max-w-text-measure-prose flex w-full gap-3"
    >
      <Skeleton className="h-17 w-23 shrink-0 rounded-md" />
      <Skeleton variant="text" lines={3} className="flex-1" />
    </div>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { Skeleton, type SkeletonProps } from "./atoms/skeleton/skeleton";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/skeleton
```

Run the gate. Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui
git commit -m "feat(ui): add the Skeleton atom

Light-pink block, circle and text placeholders whose lines vary in width,
sized by className, hidden from assistive tech, still under reduced motion.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

