### Task 4: QuantityStepper (client)

Design-system sources: `components/molecules/QuantityStepper.*`; handoff `PlanCalculator.dc.html` (people 1–40) and `DawatCalculator.dc.html` (guests 15–2000). Card rows: size (md + sm) · at min · `min={0}` · at max.

**Files:**

- Create: `packages/design-tokens/tokens/component/quantity-stepper.json`
- Create: `packages/ui/src/molecules/quantity-stepper/quantity-stepper.tsx`, `quantity-stepper.test.tsx`, `quantity-stepper.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/quantity-stepper/quantity-stepper.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                 | Ruling  | Where / why                                                                                                    |
| ------------------------------------------------------------------------ | ------- | -------------------------------------------------------------------------------------------------------------- |
| count announced as it changes (`aria-live="polite"`)                     | ADD     | `role="status"` `sr-only` region, filled after a button press, cleared when the spin button takes focus + test |
| `min={0}` reaches zero (removes the line)                                | ADD     | test "reaches zero…"                                                                                           |
| fixed size per `size`                                                    | ADD     | `it.each` size test (`size-8` / `size-10`)                                                                     |
| end-of-range button is a real grey glyph, never opacity                  | ADD     | test "greys a button…"                                                                                         |
| caller `className` merges                                                | ADD     | test "merges a caller className…"                                                                              |
| `InACartRow` story                                                       | ADD     | `InACartRow` story                                                                                             |
| `decrementLabel` / `incrementLabel` overrides (name the dish)            | DELTA   | not in contracts §5; fixed names per deviation 15 — proposed contract delta, see the 3a audit                  |
| default `label` "Quantity"                                               | DROP    | spec D9; contracts §5 makes `label` required                                                                   |
| `max` default 20                                                         | DROP    | contracts §5 gives defaults for `min` (0) and `step` (1) only; calculators pass their own `max`                |
| 36 / 44px buttons (dev's hit-target bump)                                | DROP    | spec D2: the design system's `QuantityStepper.jsx` sizes are 32 / 40; §5.5 floor ≥24px holds                   |
| native `<div>` props spread on the root                                  | DROP    | contracts §5 `QuantityStepperProps` takes `className` only                                                     |
| `onChange(value)`                                                        | ALREADY | `onValueChange` (spec §8.2)                                                                                    |
| named group; counts up/down; controlled; stops + disables at min and max | ALREADY | tests "is a named spin button…", "steps up and down…", "reports but keeps…", "disables − at the minimum…"      |
| `Sizes`, `AtTheEndsOfTheRange` stories                                   | ALREADY | `Sizes`, `AtMin`, `MinZero`, `AtMax`                                                                           |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `useControllableState` (Task 1); `Icon`; the `transition-control` utility (Plan 2a).
- Produces: `QuantityStepper`, `QuantityStepperProps` — contract §5 + `ref` (deviation 2). The count is `<input role="spinbutton">`: typed entry commits on blur or Enter, snapped to `step` from `min` and clamped to `[min, max]`; ArrowUp/Down step, Home/End jump; Escape or an emptied entry restores the value.

- [ ] **Step 1: Component token**

`packages/design-tokens/tokens/component/quantity-stepper.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "quantity-stepper-count": {
      "$value": "22px",
      "$description": "Minimum width of the count between − and +. A longer count widens with its digits (the input's size attribute)."
    }
  }
}
```

In `packages/ui/src/lib/component-variants.ts`, append `"quantity-stepper-count"` to `SPACING`. Rebuild tokens; the variant spec must pass:

```bash
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/lib/component-variants 2>&1 | tail -5
```

(Button sizes are design-system steps: `size-10` = 40, `size-8` = 32. The count's heading colour on the pink-50 pill is already in Plan 1's `light-text` group.)

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/quantity-stepper/quantity-stepper.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { QuantityStepper } from "./quantity-stepper";

const DAWAT = { min: 15, max: 2000, step: 5 } as const;

describe("QuantityStepper", () => {
  it("is a named spin button inside a named group, with its range", () => {
    render(<QuantityStepper label="Guests" defaultValue={50} {...DAWAT} />);
    const input = screen.getByRole("spinbutton", { name: "Guests" });
    expect(input).toHaveValue("50");
    expect(input).toHaveAttribute("aria-valuenow", "50");
    expect(input).toHaveAttribute("aria-valuemin", "15");
    expect(input).toHaveAttribute("aria-valuemax", "2000");
    expect(screen.getByRole("group", { name: "Guests" })).toBeInTheDocument();
  });

  it("starts at min when no value is given", () => {
    render(<QuantityStepper label="Plates" min={1} />);
    expect(screen.getByRole("spinbutton", { name: "Plates" })).toHaveValue("1");
  });

  it("steps up and down by one and reports each value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <QuantityStepper label="Plates" defaultValue={2} min={1} onValueChange={onValueChange} />
    );
    await user.click(screen.getByRole("button", { name: "Add one" }));
    expect(screen.getByRole("spinbutton")).toHaveValue("3");
    await user.click(screen.getByRole("button", { name: "Remove one" }));
    await user.click(screen.getByRole("button", { name: "Remove one" }));
    expect(screen.getByRole("spinbutton")).toHaveValue("1");
    expect(onValueChange.mock.calls).toEqual([[3], [2], [1]]);
  });

  it("announces the count after a button press (focus stays on the button)", async () => {
    const user = userEvent.setup();
    render(<QuantityStepper label="Plates" defaultValue={2} min={1} />);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    await user.click(screen.getByRole("button", { name: "Add one" }));
    expect(screen.getByRole("status")).toHaveTextContent("3");
    // Typing or arrowing in the spin button announces itself; the region steps aside.
    await user.click(screen.getByRole("spinbutton"));
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("reaches zero when zero removes the line item (min defaults to 0)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<QuantityStepper label="Plates" value={1} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Remove one" }));
    expect(onValueChange).toHaveBeenCalledWith(0);
  });

  it.each([
    ["sm", "size-8"],
    ["md", "size-10"],
  ] as const)("renders the %s buttons at their fixed size", (size, expected) => {
    render(<QuantityStepper label="Plates" size={size} />);
    expect(screen.getByRole("button", { name: "Add one" })).toHaveClass(expected);
  });

  it("greys a button at the end of the range with a real colour, never opacity", () => {
    render(<QuantityStepper label="Plates" value={1} min={1} onValueChange={vi.fn()} />);
    const minus = screen.getByRole("button", { name: "Remove one" });
    expect(minus).toHaveClass("disabled:text-ink-400");
    expect(minus.className).not.toMatch(/opacity-/);
  });

  it("merges a caller className over its own", () => {
    render(<QuantityStepper label="Plates" className="rounded-md" />);
    const group = screen.getByRole("group", { name: "Plates" });
    expect(group).toHaveClass("rounded-md");
    expect(group).not.toHaveClass("rounded-pill");
  });

  it("names its buttons by the step they take", async () => {
    const user = userEvent.setup();
    render(<QuantityStepper label="Guests" defaultValue={50} {...DAWAT} />);
    await user.click(screen.getByRole("button", { name: "Add 5" }));
    expect(screen.getByRole("spinbutton")).toHaveValue("55");
    expect(screen.getByRole("button", { name: "Remove 5" })).toBeEnabled();
  });

  it("disables − at the minimum and + at the maximum", () => {
    const { rerender } = render(
      <QuantityStepper label="Plates" value={1} min={1} max={5} onValueChange={vi.fn()} />
    );
    expect(screen.getByRole("button", { name: "Remove one" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Add one" })).toBeEnabled();
    rerender(<QuantityStepper label="Plates" value={5} min={1} max={5} onValueChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Add one" })).toBeDisabled();
  });

  it("reports but keeps the caller's value when controlled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<QuantityStepper label="Plates" value={2} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Add one" }));
    expect(onValueChange).toHaveBeenCalledWith(3);
    expect(screen.getByRole("spinbutton")).toHaveValue("2");
  });

  it.each([
    ["350", "350"],
    ["5000", "2000"],
    ["3", "15"],
    ["17", "15"],
    ["18", "20"],
  ])("commits a typed %s as %s on blur (15–2000 guests, step 5)", async (typed, committed) => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <QuantityStepper label="Guests" defaultValue={50} {...DAWAT} onValueChange={onValueChange} />
    );
    const input = screen.getByRole("spinbutton", { name: "Guests" });
    await user.clear(input);
    await user.type(input, typed);
    await user.tab();
    expect(input).toHaveValue(committed);
    expect(onValueChange).toHaveBeenLastCalledWith(Number(committed));
  });

  it("keeps only digits while typing", async () => {
    const user = userEvent.setup();
    render(<QuantityStepper label="Guests" defaultValue={50} {...DAWAT} />);
    const input = screen.getByRole("spinbutton");
    await user.clear(input);
    await user.type(input, "4a2-");
    expect(input).toHaveValue("42");
  });

  it("restores the value when the entry is emptied or escaped", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<QuantityStepper label="Plates" defaultValue={4} onValueChange={onValueChange} />);
    const input = screen.getByRole("spinbutton");
    await user.clear(input);
    await user.tab();
    expect(input).toHaveValue("4");
    await user.type(input, "9");
    expect(input).toHaveValue("49");
    await user.keyboard("{Escape}");
    expect(input).toHaveValue("4");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("commits a typed value on Enter", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <QuantityStepper label="Guests" defaultValue={50} {...DAWAT} onValueChange={onValueChange} />
    );
    const input = screen.getByRole("spinbutton");
    await user.clear(input);
    await user.type(input, "120{Enter}");
    expect(onValueChange).toHaveBeenCalledWith(120);
    expect(input).toHaveFocus();
  });

  it("steps with the arrow keys and jumps with Home and End", async () => {
    const user = userEvent.setup();
    render(<QuantityStepper label="Guests" defaultValue={50} {...DAWAT} />);
    const input = screen.getByRole("spinbutton");
    await user.click(input);
    await user.keyboard("{ArrowUp}");
    expect(input).toHaveValue("55");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(input).toHaveValue("45");
    await user.keyboard("{Home}");
    expect(input).toHaveValue("15");
    await user.keyboard("{End}");
    expect(input).toHaveValue("2000");
  });

  it("gives react-hook-form's Controller a name, onBlur and a focusable ref", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLInputElement>();
    const onBlur = vi.fn();
    render(
      <QuantityStepper
        label="Guests"
        name="guests"
        ref={ref}
        onBlur={onBlur}
        defaultValue={20}
        {...DAWAT}
      />
    );
    const input = screen.getByRole("spinbutton");
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute("name", "guests");
    await user.click(input);
    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("disables the buttons and the field when disabled", () => {
    render(<QuantityStepper label="Plates" defaultValue={2} disabled />);
    expect(screen.getByRole("spinbutton")).toBeDisabled();
    for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <QuantityStepper label="Plates" defaultValue={1} min={1} />
        <QuantityStepper label="Guests" size="sm" defaultValue={50} {...DAWAT} />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/quantity-stepper 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./quantity-stepper`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/quantity-stepper/quantity-stepper.tsx`:

```tsx
"use client";

import type { KeyboardEvent, Ref } from "react";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import { useControllableState } from "../../lib/use-controllable-state";

const quantityStepper = componentVariants({
  slots: {
    root: "inline-flex items-center rounded-pill border border-border-brand-soft bg-surface-page-alt",
    button:
      "transition-control grid shrink-0 place-items-center rounded-pill text-text-brand not-disabled:hover:bg-surface-brand-soft not-disabled:active:press-scale disabled:cursor-not-allowed disabled:text-ink-400",
    count:
      "min-w-quantity-stepper-count rounded-xs border-0 bg-transparent p-0 text-center font-display font-bold text-text-heading tabular-nums disabled:text-ink-400",
  },
  variants: {
    size: {
      sm: { button: "size-8", count: "text-body-sm" },
      md: { button: "size-10", count: "text-body" },
    },
  },
  defaultVariants: { size: "md" },
});

export interface QuantityStepperProps {
  /** Accessible name of the stepper and its number field, e.g. "Guests". */
  label: string;
  value?: number | undefined;
  defaultValue?: number | undefined;
  onValueChange?: ((value: number) => void) | undefined;
  onBlur?: (() => void) | undefined;
  /** Lowest value (default 0 — reaching it removes a cart line; use 1 where it should not). */
  min?: number | undefined;
  max?: number | undefined;
  step?: number | undefined;
  size?: "sm" | "md" | undefined;
  name?: string | undefined;
  disabled?: boolean | undefined;
  className?: string | undefined;
  /** The number field — react-hook-form's Controller focuses it on error. */
  ref?: Ref<HTMLInputElement> | undefined;
}

interface Bounds {
  min: number;
  max: number | undefined;
  step: number;
}

/** Snap to the nearest step counted from `min`, then keep inside `[min, max]`. */
function toAllowed(raw: number, { min, max, step }: Bounds): number {
  const snapped = min + Math.round((raw - min) / step) * step;
  const highest = max === undefined ? snapped : max - ((max - min) % step);
  return Math.max(min, Math.min(snapped, highest));
}

/** −/+ quantity with typed entry: cart rows, item detail, calculator guest counts. */
export function QuantityStepper({
  label,
  value,
  defaultValue,
  onValueChange,
  onBlur,
  min = 0,
  max,
  step = 1,
  size = "md",
  name,
  disabled = false,
  className,
  ref,
}: QuantityStepperProps) {
  const bounds: Bounds = { min, max, step };
  const [quantity, setQuantity] = useControllableState({
    value,
    defaultValue: defaultValue ?? min,
    onChange: onValueChange,
  });
  const [draft, setDraft] = useState<string | null>(null);
  // A button press keeps focus on the button, so the new count is announced (dev parity); the
  // spin button speaks for itself once focused, so focusing it clears the region.
  const [hasStepped, setHasStepped] = useState(false);
  const styles = quantityStepper({ size });
  const stepName = step === 1 ? "one" : String(step);

  /** What the field stands for right now: a typed draft that parses, else the value. */
  function settled(): number {
    return draft === null || draft === "" ? quantity : toAllowed(Number(draft), bounds);
  }

  function commit(next: number): void {
    setDraft(null);
    setQuantity(toAllowed(next, bounds));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        commit(settled() + step);
        break;
      case "ArrowDown":
        event.preventDefault();
        commit(settled() - step);
        break;
      case "Home":
        event.preventDefault();
        commit(min);
        break;
      case "End":
        if (max !== undefined) {
          event.preventDefault();
          commit(max);
        }
        break;
      case "Enter":
        // First Enter commits the typed value; the next one is free to submit the form.
        if (draft !== null) {
          event.preventDefault();
          commit(settled());
        }
        break;
      case "Escape":
        setDraft(null);
        break;
      default:
        break;
    }
  }

  function handleBlur(): void {
    if (draft !== null) commit(settled());
    onBlur?.();
  }

  function stepBy(delta: number): void {
    commit(settled() + delta);
    setHasStepped(true);
  }

  return (
    <div
      role="group"
      aria-label={label}
      data-surface="light"
      className={styles.root({ className })}
    >
      <button
        type="button"
        aria-label={`Remove ${stepName}`}
        disabled={disabled || quantity <= min}
        onClick={() => {
          stepBy(-step);
        }}
        className={styles.button()}
      >
        <Icon icon={Minus} size={size} />
      </button>
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        role="spinbutton"
        aria-label={label}
        aria-valuenow={quantity}
        aria-valuemin={min}
        aria-valuemax={max}
        name={name}
        size={Math.max(2, String(max ?? quantity).length)}
        value={draft ?? String(quantity)}
        disabled={disabled}
        onChange={(event) => {
          setDraft(event.currentTarget.value.replace(/\D/g, ""));
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setHasStepped(false);
        }}
        onBlur={handleBlur}
        className={styles.count()}
      />
      <button
        type="button"
        aria-label={`Add ${stepName}`}
        disabled={disabled || (max !== undefined && quantity >= max)}
        onClick={() => {
          stepBy(step);
        }}
        className={styles.button()}
      >
        <Icon icon={Plus} size={size} />
      </button>
      <span role="status" className="sr-only">
        {hasStepped ? String(quantity) : null}
      </span>
    </div>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/quantity-stepper 2>&1 | tail -8`
Expected: PASS (24 tests, the typed-entry and size tables included).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/quantity-stepper/quantity-stepper.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn } from "storybook/test";

import { QuantityStepper } from "./quantity-stepper";

const meta = {
  title: "Molecules/QuantityStepper",
  component: QuantityStepper,
  args: { label: "Quantity", defaultValue: 2, min: 1, onValueChange: fn() },
  parameters: {
    docs: {
      description: {
        component:
          "Quantity control for cart rows, item detail, add-ons and calculator guest counts. Pill on pink-50 with a pink-200 hairline; the count is Poppins 700 and can be typed — a typed value commits on blur or Enter, snapped to `step` and clamped to `min`/`max`; ArrowUp/Down step, Home/End jump, Escape restores. Use `min={0}` where reaching zero removes the line item, `min={1}` where it shouldn't. Controlled (`value` + `onValueChange`) or uncontrolled; `name`, `onBlur` and `ref` plug into react-hook-form's Controller.",
      },
    },
  },
} satisfies Meta<typeof QuantityStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add one" }));
    await expect(canvas.getByRole("spinbutton", { name: "Quantity" })).toHaveValue("3");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(3);
  },
};

/** Card row "size" — md and sm. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <QuantityStepper {...args} />
      <QuantityStepper {...args} size="sm" />
    </div>
  ),
};

/** Card row "at min" — minus disabled. */
export const AtMin: Story = { args: { defaultValue: 1, min: 1 } };

/** Card row `min={0}` — zero removes the line. */
export const MinZero: Story = { args: { defaultValue: 0, min: 0 } };

/** Card row "at max". */
export const AtMax: Story = { args: { defaultValue: 5, min: 0, max: 5 } };

/** Dev parity: in a cart row — the stepper holds its width while the dish name takes the rest. */
export const InACartRow: Story = {
  args: { label: "Paneer Butter Masala quantity" },
  render: (args) => (
    <div className="flex w-full max-w-120 items-center gap-4 rounded-lg bg-surface-card p-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="font-display text-body font-bold text-text-heading">
          Paneer Butter Masala
        </span>
        <span className="text-body-sm text-text-muted">Medium · ₹280</span>
      </div>
      <QuantityStepper {...args} className="ms-auto" />
    </div>
  ),
};

/** Handoff Dawat calculator: 15–2000 guests in fives — a typed 5000 settles at 2000. */
export const TypedGuests: Story = {
  args: { label: "Guests", defaultValue: 50, min: 15, max: 2000, step: 5 },
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("spinbutton", { name: "Guests" });
    await userEvent.clear(input);
    await userEvent.type(input, "5000");
    await userEvent.tab();
    await expect(input).toHaveValue("2000");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(2000);
  },
};
```

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export {
  QuantityStepper,
  type QuantityStepperProps,
} from "./molecules/quantity-stepper/quantity-stepper";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/quantity-stepper packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/quantity-stepper packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/quantity-stepper.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): QuantityStepper molecule with typed entry

−/+ pill whose count is a spin button: a typed value commits on blur or
Enter, snapped to step and clamped to min/max, so a typed 5000 on the Dawat
guest count settles at 2000. Name, onBlur and ref serve react-hook-form.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

