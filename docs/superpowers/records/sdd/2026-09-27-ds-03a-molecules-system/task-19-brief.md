### Task 19: StepTracker

Design-system sources: `components/molecules/StepTracker.*`; organism `OrderTracker.jsx`. Card rows: vertical (order tracking, current 1) · horizontal (checkout, current 1) · inverse (horizontal on pink, current 2).

**Files:**

- Create: `packages/design-tokens/tokens/component/step-tracker.json`
- Create: `packages/ui/src/molecules/step-tracker/step-tracker.tsx`, `step-tracker.test.tsx`, `step-tracker.stories.tsx`
- Modify: `packages/design-tokens/tokens/surface/{brand,ink,light}.json`, `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/step-tracker/step-tracker.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                                      | Ruling  | Where / why                                                                                           |
| --------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| each step's state spelled out for screen readers ("Done" / "In progress" / "Not started yet") | ADD     | `sr-only` `STATE_TEXT` per step + test; strings added to the accessible-defaults table (deviation 15) |
| nothing started (`current={-1}`) → all upcoming                                               | ADD     | test "leaves every step upcoming…" + `NotStarted` story                                               |
| the list takes an accessible name                                                             | ADD     | native `aria-label` asserted in the state-text test (dev: `label` default "Progress")                 |
| caller `className` merges                                                                     | ADD     | test "merges a caller className…"                                                                     |
| vertical tracker on a brand field; `Narrow` story                                             | ADD     | `VerticalSurfaces`, `Narrow` stories                                                                  |
| `tone="inverse"` (white markers and bars on brand)                                            | DROP    | spec D5, deviation 7 — the bar is a surface-overridden token; markers keep their own fills            |
| bare-string steps (`["Cart", "Details"]`)                                                     | DROP    | spec §8.2: object lists only                                                                          |
| `label` prop default "Progress"                                                               | DROP    | spec D9 / deviation 15: no default copy; the native `aria-label` names it when a page needs it        |
| named `<ol>`; `aria-current="step"`; notes vertical only; check on done                       | ALREADY | tests "is an ordered list…", "draws a diamond per step…", "shows the notes…", "draws the horizontal…" |
| flood up to the current step                                                                  | ALREADY | `data-state` + state variants                                                                         |
| `Default`, `Complete`, `Horizontal`, `OnBrand`, `HorizontalOnBrand` stories                   | ALREADY | `Playground`, `Complete`, `Horizontal`, `OnBrand` (horizontal on pink), `Surfaces`                    |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Icon`; `SymbolMark` (Plan 2a — the shared `mask-symbol` CSS mask, ruling R19); `OnSurfaces` (Plan 2a, stories).
- Produces: `StepTracker`, `StepTrackerProps`, `TrackerStep` — contract §5 without `tone` (deviation 7). An `<ol>`; earlier steps are complete, `current` carries `aria-current="step"`; every step exposes `data-state="complete" | "current" | "upcoming"`. Vertical markers are brand diamonds (a filled diamond has its own fill, so it uses fixed primitives and looks the same on every field — Plan 2a's skin rule); the horizontal bar has no fill of its own to hide behind, so its colours are component tokens that flip on pink and ink (on the design system's own pink card row, pink segments on the pink field vanished).

- [ ] **Step 1: Component tokens and the surface skin**

`packages/design-tokens/tokens/component/step-tracker.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "step-tracker-marker": {
      "$value": "22px",
      "$description": "Vertical StepTracker marker: a 22px square turned 45°."
    },
    "step-tracker-mark": {
      "$value": "16px",
      "$description": "The brand mark inside a marker (74% of the marker)."
    }
  },
  "color": {
    "$type": "color",
    "step-tracker-bar-on": {
      "$value": "{color.pink.500}",
      "$description": "Horizontal StepTracker: a reached segment. White on a pink field."
    },
    "step-tracker-bar-off": {
      "$value": "{color.ink.200}",
      "$description": "Horizontal StepTracker: a segment still to come. White at 25% on pink and ink fields."
    }
  }
}
```

Inside `surface-brand` → `color` (`tokens/surface/brand.json`) add:

```json
"step-tracker-bar-on": { "$value": "{color.ink.000}" },
"step-tracker-bar-off": { "$value": "{color.white-alpha.25}" }
```

Inside `surface-ink` → `color` (`tokens/surface/ink.json`) add:

```json
"step-tracker-bar-off": { "$value": "{color.white-alpha.25}" }
```

Inside `surface-light` → `color` (`tokens/surface/light.json`) add:

```json
"step-tracker-bar-on": { "$value": "{color.pink.500}" },
"step-tracker-bar-off": { "$value": "{color.ink.200}" }
```

Append `"step-tracker-marker"`, `"step-tracker-mark"` to `SPACING`. Rebuild and run the token tests (light-restore and surface-alias suites cover the new overrides). No contrast pair: the bars and markers are graphics next to labelled text, and the labels are semantic text already measured on every surface.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/step-tracker/step-tracker.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { StepTracker, type TrackerStep } from "./step-tracker";

const ORDER: TrackerStep[] = [
  { label: "Order in", note: "Kitchen's on it." },
  { label: "On the tandoor", note: "Chilli paneer is charring." },
  { label: "Ready for pickup", note: "Counter 2, ask for Paprikaa." },
];

const CHECKOUT: TrackerStep[] = [
  { label: "Cart" },
  { label: "Details" },
  { label: "Pay" },
  { label: "Done" },
];

function states(): (string | null)[] {
  return screen.getAllByRole("listitem").map((step) => step.getAttribute("data-state"));
}

describe("StepTracker", () => {
  it("is an ordered list whose current step is marked for assistive tech", () => {
    render(<StepTracker steps={ORDER} current={1} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("On the tandoor").closest("li")).toHaveAttribute(
      "aria-current",
      "step"
    );
    expect(states()).toEqual(["complete", "current", "upcoming"]);
  });

  it("completes every step when current is past the last", () => {
    render(<StepTracker steps={ORDER} current={3} />);
    expect(states()).toEqual(["complete", "complete", "complete"]);
    expect(screen.queryByRole("listitem", { current: "step" })).not.toBeInTheDocument();
  });

  it("leaves every step upcoming when nothing has started", () => {
    render(<StepTracker steps={ORDER} current={-1} />);
    expect(states()).toEqual(["upcoming", "upcoming", "upcoming"]);
    expect(screen.getAllByText("Not started yet")).toHaveLength(3);
  });

  it("spells each step's state out for assistive tech — never by colour alone", () => {
    render(<StepTracker steps={ORDER} current={1} aria-label="Order progress" />);
    expect(screen.getByRole("list", { name: "Order progress" })).toBeInTheDocument();
    expect(screen.getByText("Done")).toHaveClass("sr-only");
    expect(screen.getByText("In progress")).toHaveClass("sr-only");
    expect(screen.getByText("Not started yet")).toHaveClass("sr-only");
    expect(screen.getByText("On the tandoor").closest("li")).toHaveTextContent(
      "In progressOn the tandoor"
    );
  });

  it("merges a caller className over its own gap", () => {
    render(<StepTracker steps={ORDER} current={0} className="gap-8" />);
    const list = screen.getByRole("list");
    expect(list).toHaveClass("gap-8");
    expect(list).not.toHaveClass("gap-3.5");
  });

  it("draws a diamond per step with a check on the completed ones, all decorative", () => {
    const { container } = render(<StepTracker steps={ORDER} current={2} />);
    expect(container.querySelectorAll(".mask-symbol")).toHaveLength(3);
    expect(container.querySelectorAll("svg.lucide-check")).toHaveLength(2);
    for (const marker of container.querySelectorAll("li > span:first-child")) {
      expect(marker).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("shows the notes in the vertical layout", () => {
    render(<StepTracker steps={ORDER} current={1} />);
    expect(screen.getByText("Chilli paneer is charring.")).toHaveClass("text-text-muted");
  });

  it("draws the horizontal layout as a segmented bar without notes", () => {
    const { container } = render(
      <StepTracker
        steps={[{ label: "Cart", note: "2 items" }, ...CHECKOUT.slice(1)]}
        current={1}
        orientation="horizontal"
      />
    );
    expect(container.firstElementChild).toHaveClass("flex");
    expect(container.querySelectorAll(".bg-step-tracker-bar-on")).toHaveLength(2);
    expect(container.querySelectorAll(".bg-step-tracker-bar-off")).toHaveLength(2);
    expect(screen.queryByText("2 items")).not.toBeInTheDocument();
  });

  it("sets reached labels in heading ink, the current one bold, the rest subtle", () => {
    render(<StepTracker steps={CHECKOUT} current={1} orientation="horizontal" />);
    expect(screen.getByText("Cart")).toHaveClass("text-text-heading", "font-medium");
    expect(screen.getByText("Details")).toHaveClass("text-text-heading", "font-bold");
    expect(screen.getByText("Pay")).toHaveClass("text-text-subtle");
  });

  it("has no accessibility violations in either orientation", async () => {
    const { container } = render(
      <>
        <StepTracker steps={ORDER} current={1} />
        <StepTracker steps={CHECKOUT} current={1} orientation="horizontal" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/step-tracker 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./step-tracker`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/step-tracker/step-tracker.tsx`:

```tsx
import type { ComponentProps } from "react";

import { Check } from "lucide-react";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import { SymbolMark } from "../../lib/symbol-mark";

type StepState = "complete" | "current" | "upcoming";

const stepTracker = componentVariants({
  slots: {
    root: "m-0 list-none p-0",
    step: "flex min-w-0",
    marker: "size-step-tracker-marker relative mt-0.5 shrink-0",
    diamond: "absolute inset-0 grid rotate-45 place-items-center overflow-hidden rounded-xs",
    mark: "size-step-tracker-mark -rotate-45 opacity-50",
    check: "absolute inset-0 grid place-items-center text-ink-000",
    bar: "h-1.25 rounded-pill transition-colors duration-base ease-out",
    copy: "grid min-w-0",
    label: "font-display",
    note: "text-caption text-text-muted",
  },
  variants: {
    orientation: {
      vertical: { root: "grid gap-3.5", step: "gap-3.5", label: "text-body-sm" },
      horizontal: { root: "flex gap-2", step: "flex-1 flex-col gap-2", label: "text-caption" },
    },
    state: {
      complete: {
        diamond: "bg-pink-500",
        mark: "text-ink-000",
        bar: "bg-step-tracker-bar-on",
        label: "font-medium text-text-heading",
      },
      current: {
        diamond: "bg-pink-500",
        mark: "text-ink-000",
        bar: "bg-step-tracker-bar-on",
        label: "font-bold text-text-heading",
      },
      upcoming: {
        diamond: "bg-ink-200",
        mark: "text-pink-500",
        bar: "bg-step-tracker-bar-off",
        label: "font-medium text-text-subtle",
      },
    },
  },
  defaultVariants: { orientation: "vertical", state: "upcoming" },
});

function stateOf(index: number, current: number): StepState {
  if (index < current) return "complete";
  return index === current ? "current" : "upcoming";
}

/** What a screen reader hears before each step's label (dev parity: state never by colour alone). */
const STATE_TEXT: Readonly<Record<StepState, string>> = {
  complete: "Done",
  current: "In progress",
  upcoming: "Not started yet",
};

export interface TrackerStep {
  label: string;
  /** Vertical only: one line of brand voice, e.g. "Chilli paneer is charring." */
  note?: string | undefined;
}

export interface StepTrackerProps extends ComponentProps<"ol"> {
  steps: TrackerStep[];
  /** Index of the current step; earlier steps are complete. */
  current: number;
  /** `vertical` for order tracking, `horizontal` for checkout progress. */
  orientation?: "vertical" | "horizontal" | undefined;
}

/**
 * Progress through named steps. Vertical: brand diamonds, checked when complete. Horizontal: a
 * segmented bar. Step copy is the brand voice, not system status text.
 */
export function StepTracker({
  steps,
  current,
  orientation = "vertical",
  className,
  ...props
}: StepTrackerProps) {
  const isVertical = orientation === "vertical";
  const styles = stepTracker({ orientation });

  return (
    <ol className={styles.root({ className })} {...props}>
      {steps.map((step, index) => {
        const state = stateOf(index, current);
        return (
          <li
            key={index}
            data-state={state}
            aria-current={state === "current" ? "step" : undefined}
            className={styles.step()}
          >
            {isVertical ? (
              <span aria-hidden="true" className={styles.marker()}>
                <span className={styles.diamond({ state })}>
                  <SymbolMark className={styles.mark({ state })} />
                </span>
                {state === "complete" ? (
                  <span className={styles.check()}>
                    <Icon icon={Check} size="xs" className="size-3" />
                  </span>
                ) : null}
              </span>
            ) : (
              <span aria-hidden="true" className={styles.bar({ state })} />
            )}
            <span className="sr-only">{STATE_TEXT[state]}</span>
            <span className={styles.copy()}>
              <span className={styles.label({ state })}>{step.label}</span>
              {isVertical && step.note !== undefined ? (
                <span className={styles.note()}>{step.note}</span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/step-tracker 2>&1 | tail -8`
Expected: PASS (10 tests).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/step-tracker/step-tracker.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { StepTracker, type TrackerStep } from "./step-tracker";

const ORDER: TrackerStep[] = [
  { label: "Order in", note: "Kitchen's on it." },
  { label: "On the tandoor", note: "Chilli paneer is charring." },
  { label: "Ready for pickup", note: "Counter 2, ask for Paprikaa." },
];

const CHECKOUT: TrackerStep[] = [
  { label: "Cart" },
  { label: "Details" },
  { label: "Pay" },
  { label: "Done" },
];

const meta = {
  title: "Molecules/StepTracker",
  component: StepTracker,
  args: { steps: ORDER, current: 1 },
  parameters: {
    docs: {
      description: {
        component:
          'Order tracking and multi-step checkout. Vertical markers are brand diamonds with a check when complete; horizontal renders as a segmented bar. The current step carries `aria-current="step"`. Step copy is the brand voice, not system status text. On a pink or ink field it follows the surface — the bar turns white — so there is no `tone` prop.',
      },
    },
  },
} satisfies Meta<typeof StepTracker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "vertical". */
export const Playground: Story = {};

/** Card row "horizontal". */
export const Horizontal: Story = {
  args: { steps: CHECKOUT, current: 1, orientation: "horizontal" },
};

/** Card row "inverse" — horizontal on a pink field. */
export const OnBrand: Story = {
  args: { steps: CHECKOUT, current: 2, orientation: "horizontal" },
  render: (args) => (
    <div data-surface="brand" className="rounded-lg bg-surface-brand p-6">
      <StepTracker {...args} />
    </div>
  ),
};

/** Every step complete. */
export const Complete: Story = { args: { current: 3 } };

export const Surfaces: Story = {
  args: { steps: CHECKOUT, current: 2, orientation: "horizontal" },
  render: (args) => (
    <OnSurfaces>
      <StepTracker {...args} className="w-full" />
    </OnSurfaces>
  ),
};

/** Dev parity: nothing has started yet — every diamond stays grey. */
export const NotStarted: Story = { args: { current: -1 } };

/** Dev parity: the vertical markers on every field — filled diamonds keep their own colours. */
export const VerticalSurfaces: Story = {
  render: (args) => (
    <OnSurfaces>
      <StepTracker {...args} />
    </OnSurfaces>
  ),
};

/** Dev parity: the smallest supported width — labels wrap, the diamonds hold their column. */
export const Narrow: Story = {
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
export {
  StepTracker,
  type StepTrackerProps,
  type TrackerStep,
} from "./molecules/step-tracker/step-tracker";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/step-tracker packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/step-tracker packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): StepTracker molecule

Vertical brand-diamond markers (checked when complete) or a segmented
horizontal bar, in an ordered list with aria-current on the current step.
The bar's colours flip on pink and ink fields, which the design system's
own pink row lost; there is no tone prop.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

