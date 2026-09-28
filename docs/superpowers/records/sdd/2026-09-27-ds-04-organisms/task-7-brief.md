### Task 7: OrderTracker

**Dev reference:** `git show dev:packages/ui/src/organisms/order-tracker/order-tracker.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                              | Ruling                         | Where / clause                                                               |
| ----------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------- |
| Leads with the current step's label and note          | ALREADY                        | test "heads the screen with the current step…" (and a `status` live region)  |
| The heading moves as the kitchen works                | ALREADY                        | same test at `current={1}`                                                   |
| "Preparing" until the last step, then "Ready"         | DROP                           | D9 — status copy is the `badge` slot (Contract deviations)                   |
| Clamps an index past the end                          | ALREADY                        | test "clamps a current index past the end…"                                  |
| Code and outlet on one line                           | ALREADY                        | test "prints the order code with its label and the outlet"                   |
| StepTracker composed, current step marked             | ALREADY                        | test "marks the current step in the tracker"                                 |
| The tracker list is named ("Order progress")          | ADD — pending contract delta 3 | not built until ruled (report)                                               |
| Bare-string steps                                     | DROP                           | spec §8.2 — object lists only                                                |
| What was paid and how                                 | ALREADY                        | test "formats the total beside the payment line"                             |
| No action when there is nowhere to go                 | ADD                            | test "renders no action when none is given"                                  |
| `onDone` / `doneLabel`                                | DROP                           | spec §8.1 — slots, not callbacks (`action`)                                  |
| Card frame rounds and clips                           | ALREADY                        | test "frames itself as a light card with variant=card"                       |
| Merges a caller `className`                           | ADD                            | test "merges a caller className"                                             |
| axe                                                   | ALREADY                        | test "has no accessibility violations"                                       |
| Default steps, code, outlet, payment, total           | DROP                           | D9                                                                           |
| Stories Default · EveryState · WithAction · CardFrame | ALREADY                        | Playground · OrderIn/OnTheTandoor/Ready · Playground (`action` arg) · AsCard |
| Story DeliverySteps                                   | ADD                            | `DeliverySteps`                                                              |
| Story Smallest                                        | ADD                            | `Mobile`                                                                     |

Implementer: copy this table into your report, extended with anything the plan missed.

**Files:**

- Create: `packages/ui/src/organisms/order-tracker/order-tracker.tsx`, `order-tracker.test.tsx`, `order-tracker.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Card`, `Divider`, `PatternField`, `Text`, `StepTracker`/`TrackerStep`, `formatRupees` (`@pink-paprikaa-web/utils`), `componentVariants`, `headingTag`; stories: `Badge`, `Button`.
- Produces: `OrderTracker`, `OrderTrackerProps`.

No component tokens: every dimension is on the 4px scale (18px = `4.5`, 30px = `7.5`).

- [ ] **Step 1: Write the failing test**

`packages/ui/src/organisms/order-tracker/order-tracker.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";

import type { TrackerStep } from "../../molecules/step-tracker/step-tracker";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { OrderTracker } from "./order-tracker";

const STEPS: TrackerStep[] = [
  { label: "Order in", note: "Kitchen's on it." },
  { label: "On the tandoor", note: "Chilli paneer is charring." },
  { label: "Ready for pickup", note: "Counter 2, ask for Paprikaa." },
];

describe("OrderTracker", () => {
  it("heads the screen with the current step and its note, in a live status region", () => {
    render(<OrderTracker steps={STEPS} current={1} code="PPK-4821" />);
    const status = screen.getByRole("status");
    expect(
      within(status).getByRole("heading", { level: 2, name: "On the tandoor" })
    ).toBeInTheDocument();
    expect(status).toHaveTextContent("Chilli paneer is charring.");
  });

  it("clamps a current index past the end to the last step", () => {
    render(<OrderTracker steps={STEPS} current={7} code="PPK-4821" />);
    expect(screen.getByRole("heading", { level: 2, name: "Ready for pickup" })).toBeInTheDocument();
  });

  it("marks the current step in the tracker", () => {
    render(<OrderTracker steps={STEPS} current={1} code="PPK-4821" />);
    const tracker = screen.getByRole("list");
    expect(
      within(tracker).getByText("On the tandoor").closest('[aria-current="step"]')
    ).not.toBeNull();
  });

  it("prints the order code with its label and the outlet", () => {
    render(<OrderTracker steps={STEPS} current={0} code="PPK-4821" outlet="Sector 57, Gurgaon" />);
    expect(screen.getByText("Order #PPK-4821 · Sector 57, Gurgaon")).toBeInTheDocument();
  });

  it("formats the total beside the payment line", () => {
    render(<OrderTracker steps={STEPS} current={0} code="PPK-4821" total={1239} payment="UPI" />);
    expect(screen.getByText("Paid · UPI")).toBeInTheDocument();
    expect(screen.getByText("₹1,239")).toBeInTheDocument();
  });

  it("renders the badge and action slots", () => {
    render(
      <OrderTracker
        steps={STEPS}
        current={0}
        code="PPK-4821"
        badge={<span>Preparing</span>}
        action={<a href="#home">Back to Home</a>}
      />
    );
    expect(within(screen.getByRole("status")).getByText("Preparing")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Home" })).toBeInTheDocument();
  });

  it("renders no action when none is given", () => {
    render(<OrderTracker steps={STEPS} current={0} code="PPK-4821" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("merges a caller className", () => {
    const { container } = render(
      <OrderTracker steps={STEPS} current={0} code="PPK-4821" className="bg-surface-page" />
    );
    expect(container.firstElementChild).toHaveClass("flex", "bg-surface-page");
  });

  it("frames itself as a light card with variant=card", () => {
    const { container } = render(
      <OrderTracker steps={STEPS} current={0} code="PPK-4821" variant="card" />
    );
    expect(container.firstElementChild).toHaveAttribute("data-surface", "light");
    expect(container.firstElementChild).toHaveClass("rounded-xl");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <OrderTracker
        steps={STEPS}
        current={1}
        code="PPK-4821"
        outlet="Sector 57, Gurgaon"
        total={1239}
        payment="UPI"
        badge={<span>Preparing</span>}
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- order-tracker 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./order-tracker`.

- [ ] **Step 3: Implement**

`packages/ui/src/organisms/order-tracker/order-tracker.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { Card } from "../../atoms/card/card";
import { Divider } from "../../atoms/divider/divider";
import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { Text } from "../../atoms/text/text";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { StepTracker, type TrackerStep } from "../../molecules/step-tracker/step-tracker";

const orderTracker = componentVariants({
  slots: {
    root: "flex flex-col",
    header: "px-5 pt-4.5 pb-7.5",
    status: "flex flex-col items-start gap-1.5",
    title: "mt-1.5",
    code: "mt-4.5 uppercase",
    body: "grid gap-3.5 p-5",
    divider: "my-1.5",
    receipt: "flex justify-between gap-3",
    total: "font-display",
  },
  variants: {
    variant: {
      flush: { root: "min-h-0 flex-1 overflow-y-auto" },
      card: {
        root: "overflow-hidden rounded-xl border border-border-subtle bg-surface-card shadow-1",
      },
    },
  },
  defaultVariants: { variant: "flush" },
});

export interface OrderTrackerProps
  extends ComponentProps<"section">, Pick<VariantProps<typeof orderTracker>, "variant"> {
  /** Brand-voice steps ("Kitchen's on it."), never system status. */
  steps: TrackerStep[];
  /** Index of the current step; clamped to the steps given. */
  current: number;
  /** Order code, uppercase, without the hash. */
  code: string;
  /** The word before the code: "Order #PPK-4821". */
  codeLabel?: string | undefined;
  outlet?: string | undefined;
  total?: number | undefined;
  /** The payment method, e.g. "UPI" — the line reads "Paid · UPI". */
  payment?: string | undefined;
  /** The word before the method. */
  paymentLabel?: string | undefined;
  /** The status chip in the header, e.g. `<Badge tone="ink">Preparing</Badge>`. */
  badge?: ReactNode;
  /** Usually one full-width secondary Button ("Back to Home"). */
  action?: ReactNode;
  headingLevel?: HeadingLevel | undefined;
}

/**
 * The screen a guest watches while the kitchen cooks: a flooded-pink header announcing the
 * current step (a polite live region, so updates are read out), the step tracker and the receipt.
 */
export function OrderTracker({
  steps,
  current,
  code,
  codeLabel = "Order",
  outlet,
  total,
  payment,
  paymentLabel = "Paid",
  badge,
  action,
  variant = "flush",
  headingLevel = 2,
  className,
  ...props
}: OrderTrackerProps) {
  const slots = orderTracker({ variant });
  const index = Math.min(Math.max(current, 0), steps.length - 1);
  const step = steps[index];
  const hasReceipt = payment !== undefined || total !== undefined;
  return (
    <section
      data-surface={variant === "card" ? "light" : undefined}
      className={slots.root({ className })}
      {...props}
    >
      <PatternField tone="brand" tile={56} className={slots.header()}>
        <div role="status" className={slots.status()}>
          {badge}
          <Text as={headingTag(headingLevel)} variant="h2" className={slots.title()}>
            {step?.label}
          </Text>
          {step?.note ? (
            <Text as="div" tone="muted">
              {step.note}
            </Text>
          ) : null}
        </div>
        <Text as="div" variant="mono" tone="muted" className={slots.code()}>
          {codeLabel} #{code}
          {outlet ? ` · ${outlet}` : null}
        </Text>
      </PatternField>
      <div className={slots.body()}>
        <StepTracker steps={steps} current={index} />
        <Divider variant="diamond" className={slots.divider()} />
        {hasReceipt ? (
          <Card variant="quiet" padding="sm">
            <div className={slots.receipt()}>
              <Text as="span" variant="body-sm" tone="muted">
                {payment === undefined ? null : `${paymentLabel} · ${payment}`}
              </Text>
              {total === undefined ? null : (
                <Text as="span" variant="body-sm" weight="bold" className={slots.total()}>
                  {formatRupees(total)}
                </Text>
              )}
            </div>
          </Card>
        ) : null}
        {action}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- order-tracker 2>&1 | tail -8`
Expected: PASS (10 tests).

- [ ] **Step 5: Stories (card parity with `OrderTracker.card.html`)**

`packages/ui/src/organisms/order-tracker/order-tracker.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import type { TrackerStep } from "../../molecules/step-tracker/step-tracker";

import { Badge } from "../../atoms/badge/badge";
import { Button } from "../../atoms/button/button";
import { VIEWPORT_360 } from "../story-fixtures";
import { OrderTracker } from "./order-tracker";

/** The design system's brand-voice steps. */
const STEPS: TrackerStep[] = [
  { label: "Order in", note: "Kitchen's on it." },
  { label: "On the tandoor", note: "Chilli paneer is charring." },
  { label: "Ready for pickup", note: "Counter 2, ask for Paprikaa." },
];

const BACK_HOME = (
  <Button asChild variant="secondary" isFullWidth>
    <a href="#home">Back to Home</a>
  </Button>
);

const meta = {
  title: "Organisms/OrderTracker",
  component: OrderTracker,
  args: {
    steps: STEPS,
    current: 0,
    code: "PPK-4821",
    outlet: "Sector 57, Gurgaon",
    total: 1239,
    payment: "UPI",
    badge: <Badge tone="ink">Preparing</Badge>,
    action: BACK_HOME,
  },
  decorators: [
    (Story) => (
      <div className="flex h-165 w-85 flex-col overflow-hidden rounded-lg border border-border-subtle">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Live order status after checkout — the screen a guest watches while the kitchen cooks. Step copy is brand voice ("Kitchen\'s on it."), never system status. The header is a flooded pink field and a polite live region, so each step change is read out.',
      },
    },
  },
} satisfies Meta<typeof OrderTracker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: the start — order in. */
export const OrderIn: Story = { args: { current: 0 } };

export const OnTheTandoor: Story = { args: { current: 1 } };

/** Card row: ready for pickup. */
export const Ready: Story = { args: { current: 2, badge: <Badge tone="ink">Ready</Badge> } };

export const AsCard: Story = {
  args: { variant: "card", current: 1 },
  decorators: [
    (Story) => (
      <div className="w-100">
        <Story />
      </div>
    ),
  ],
};

/** Delivery runs its own two steps — as short as the tracker is worth drawing. */
export const DeliverySteps: Story = {
  args: {
    current: 1,
    steps: [
      { label: "Order in", note: "Kitchen's on it." },
      { label: "On its way", note: "Riding out to you now." },
    ],
  },
};

/** The smallest supported viewport: the header copy wraps, nothing clips. */
export const Mobile: Story = { args: { current: 1 }, globals: VIEWPORT_360 };
```

- [ ] **Step 6: Export**

```ts
export { OrderTracker, type OrderTrackerProps } from "./organisms/order-tracker/order-tracker";
```

- [ ] **Step 7: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/order-tracker packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/ui/src/organisms/order-tracker packages/ui/src/index.ts
git commit -m "feat(ui): OrderTracker organism

A flooded-pink status header that announces the current step politely,
the step tracker, and the receipt with the total in rupees; flush for the
app screen or framed as a light card. Status chip, code label and payment
line are the app's copy.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

