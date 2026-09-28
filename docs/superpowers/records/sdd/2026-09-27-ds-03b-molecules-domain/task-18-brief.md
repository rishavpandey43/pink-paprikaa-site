### Task 18: StickyActionBar

**Files:**

- Create: `packages/design-tokens/tokens/component/sticky-action-bar.json`
- Create: `packages/ui/src/molecules/sticky-action-bar/sticky-action-bar.tsx`, `sticky-action-bar.test.tsx`, `sticky-action-bar.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`), `packages/ui/src/index.ts`

**Dev reference:** none (handoff component)

**Interfaces:**

- Consumes: `--spacing-dock-clearance` (Plan 1: 84px, the handoff's `bottom: 84px`), the `z-raised` utility (the handoff's `z-index: 5`), the ink surface.
- Produces: `StickyActionBar`, `type StickyActionBarProps` (contract §6). Default `hideFrom = "lg"` (the calculators go two-column above it). Sets `data-surface="ink"`.

- [ ] **Step 1: Component tokens**

Create `packages/design-tokens/tokens/component/sticky-action-bar.json`:

```json
{
  "text": {
    "$type": "typography",
    "sticky-action-bar-amount": {
      "$value": { "fontSize": "18px", "lineHeight": 1.2, "fontWeight": "{font-weight.black}" },
      "$description": "The running total in the calculators' sticky pill."
    }
  }
}
```

Append `"sticky-action-bar-amount",` to `TEXT`. Run `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/sticky-action-bar/sticky-action-bar.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { StickyActionBar } from "./sticky-action-bar";

const BAR = {
  amount: "₹3,276",
  caption: "₹130/meal · Classic · Weekday plan · Lunch",
  action: <a href="#send">Send plan</a>,
} as const;

describe("StickyActionBar", () => {
  it("shows the amount, the caption and the action", () => {
    render(<StickyActionBar {...BAR} />);
    expect(screen.getByText("₹3,276")).toBeInTheDocument();
    expect(screen.getByText(BAR.caption)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Send plan" })).toBeInTheDocument();
  });

  it("is an ink pill on every surface", () => {
    const { container } = render(<StickyActionBar {...BAR} />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", "ink");
    expect(container.firstElementChild).toHaveClass("rounded-pill", "bg-surface-inverse");
  });

  it("sticks just above the mobile action dock", () => {
    const { container } = render(<StickyActionBar {...BAR} />);
    expect(container.firstElementChild).toHaveClass("sticky", "bottom-dock-clearance", "z-raised");
  });

  it("hides from the two-column breakpoint by default, or never", () => {
    const { container, rerender } = render(<StickyActionBar {...BAR} />);
    expect(container.firstElementChild).toHaveClass("lg:hidden");
    rerender(<StickyActionBar {...BAR} hideFrom="never" />);
    expect(container.firstElementChild).not.toHaveClass("lg:hidden");
  });

  it("truncates a long caption instead of wrapping the pill", () => {
    render(<StickyActionBar {...BAR} />);
    expect(screen.getByText(BAR.caption)).toHaveClass("truncate");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<StickyActionBar {...BAR} />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- sticky-action-bar 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./sticky-action-bar`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/sticky-action-bar/sticky-action-bar.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { componentVariants } from "../../lib/component-variants";

const stickyActionBar = componentVariants({
  slots: {
    root: "sticky bottom-dock-clearance z-raised mt-3 flex items-center justify-between gap-3 rounded-pill bg-surface-inverse py-2 pr-2 pl-5 text-text-body shadow-4",
    summary: "flex min-w-0 flex-col",
    amount: "text-sticky-action-bar-amount font-display text-text-heading",
    caption: "truncate text-caption text-text-muted",
    action: "shrink-0",
  },
  variants: {
    hideFrom: { lg: { root: "lg:hidden" }, never: {} },
  },
});

export interface StickyActionBarProps extends ComponentProps<"div"> {
  /** The running total, formatted. */
  amount: ReactNode;
  /** One line under it; truncates rather than wrapping. */
  caption?: ReactNode | undefined;
  /** The primary action (a Button). */
  action: ReactNode;
  /** `lg`: hidden once the calculator is two-column. `never`: always shown. */
  hideFrom?: "lg" | "never" | undefined;
}

/** The calculators' ink pill: total, a caption and the send action, stuck above the mobile dock. */
export function StickyActionBar({
  amount,
  caption,
  action,
  hideFrom = "lg",
  className,
  ...props
}: StickyActionBarProps) {
  const styles = stickyActionBar({ hideFrom });
  return (
    <div data-surface="ink" className={styles.root({ className })} {...props}>
      <div className={styles.summary()}>
        <span className={styles.amount()}>{amount}</span>
        {caption ? <span className={styles.caption()}>{caption}</span> : null}
      </div>
      <div className={styles.action()}>{action}</div>
    </div>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- sticky-action-bar 2>&1 | tail -8`
Expected: PASS (6 tests).

- [ ] **Step 6: Stories — the Plan and Dawat calculator bars, and the bar sticking in a scrolling page**

`packages/ui/src/molecules/sticky-action-bar/sticky-action-bar.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { Button } from "../../atoms/button/button";
import { StickyActionBar } from "./sticky-action-bar";

/** Classic, launch price, Weekday plan, lunch: 24 × ₹130 + 5% GST. */
const PLAN_TOTAL = 24 * 130 + Math.round(24 * 130 * 0.05);
/** Signature Dawat for 30 guests + 5% GST. */
const DAWAT_TOTAL = 30 * 199 + Math.round(30 * 199 * 0.05);

const meta = {
  title: "Molecules/StickyActionBar",
  component: StickyActionBar,
  args: {
    amount: formatRupees(PLAN_TOTAL),
    caption: `${formatRupees(130)}/meal · Classic · Weekday plan · Lunch`,
    action: <Button size="md">Send plan</Button>,
    hideFrom: "never",
  },
  decorators: [
    (Story) => (
      <div className="w-90">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'The calculators\' ink pill: the running total, one caption line and the send action. `position: sticky` at `--spacing-dock-clearance` above the viewport bottom, so the mobile ActionDock never covers it. Hidden from `lg` up (`hideFrom="lg"`, default), where the quote panel sits beside the form.',
      },
    },
  },
} satisfies Meta<typeof StickyActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** PlanCalculator bar. */
export const PlanCalculator: Story = {};

/** DawatCalculator bar. */
export const DawatCalculator: Story = {
  args: {
    amount: formatRupees(DAWAT_TOTAL),
    caption: `${formatRupees(DAWAT_TOTAL / 30)}/head · 30 guests`,
    action: <Button size="md">Check date</Button>,
  },
};

/** The bar sticks at the dock clearance while the form scrolls under it. */
export const InAScrollingPage: Story = {
  render: (args) => (
    <div className="h-100 overflow-y-auto rounded-lg border border-border-subtle">
      <div className="grid h-250 content-start gap-3 p-4">
        {[
          "1. Your plate",
          "2. Which meals",
          "3. How many meals",
          "4. People at one address",
          "5. Make it yours",
        ].map((step) => (
          <p key={step} className="m-0 font-display text-body font-bold text-text-heading">
            {step}
          </p>
        ))}
      </div>
      <StickyActionBar {...args} />
    </div>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export {
  StickyActionBar,
  type StickyActionBarProps,
} from "./molecules/sticky-action-bar/sticky-action-bar";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/design-tokens/tokens/component/sticky-action-bar.json packages/ui/src/molecules/sticky-action-bar packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/design-tokens/tokens/component/sticky-action-bar.json packages/ui/src/molecules/sticky-action-bar packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): StickyActionBar molecule

The calculators' ink pill (total, caption, action), sticky at the dock
clearance so the mobile ActionDock never covers it, hidden once the
calculator is two-column.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

