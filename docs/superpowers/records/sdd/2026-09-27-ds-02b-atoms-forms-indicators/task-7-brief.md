### Task 7: Slider (handoff)

Derived from the handoff calculators, which have no design-system card: `DawatCalculator.dc.html` (guests, `min 15 max 300 step 5`, white card) and `OfficeLunch.dc.html` (meals a day, `min 20 max 300 step 5`, ink section). Both are `<input type="range">`, full width, 32px tall, `accent-color: var(--pink-500)`, named by `aria-label`.

**Files:**

- Create: `packages/ui/src/atoms/slider/slider.tsx`, `slider.test.tsx`, `slider.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** none (handoff component)

**Interfaces:**

- Consumes: `componentVariants`, `fakeRegister`.
- Produces: `Slider`, `SliderProps` exactly as contract §3 (`extends Omit<ComponentProps<"input">, "type"> { label: string }`, `label` → `aria-label`).

- [ ] **Step 1: Component tokens**

None: 32px is `h-8` (scale step 8), the accent is `accent-pink-500`. No list names, no contrast pair (no text).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/slider/slider.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations, fakeRegister } from "../../../vitest.setup";
import { Slider } from "./slider";

describe("Slider", () => {
  it("is a native range named by its label", () => {
    render(<Slider label="Guests" min={15} max={300} step={5} defaultValue={60} />);
    const slider = screen.getByRole("slider", { name: "Guests" });
    expect(slider).toHaveAttribute("type", "range");
    expect(slider).toHaveAttribute("min", "15");
    expect(slider).toHaveAttribute("max", "300");
    expect(slider).toHaveAttribute("step", "5");
    expect(slider).toHaveValue("60");
  });

  it("is full width, 32px tall and brand-accented", () => {
    render(<Slider label="Guests" />);
    expect(screen.getByRole("slider")).toHaveClass("w-full", "h-8", "accent-pink-500");
  });

  it("takes react-hook-form's register(): ref, name, onChange and onBlur reach the native range", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("guests");
    render(<Slider label="Guests" min={15} max={300} step={5} {...field} />);
    const slider = screen.getByRole("slider");

    expect(field.ref).toHaveBeenCalledWith(slider);
    expect(slider).toHaveAttribute("name", "guests");
    fireEvent.change(slider, { target: { value: "120" } });
    expect(field.onChange).toHaveBeenCalledTimes(1);
    await user.tab();
    expect(slider).toHaveFocus();
    await user.tab();
    expect(field.onBlur).toHaveBeenCalledTimes(1);
  });

  it("merges a consumer className", () => {
    render(<Slider label="Meals a day" className="max-w-text-measure-prose" />);
    expect(screen.getByRole("slider")).toHaveClass("max-w-text-measure-prose", "w-full");
  });

  it("disables natively", () => {
    render(<Slider label="Guests" disabled />);
    expect(screen.getByRole("slider")).toBeDisabled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Slider label="Guests" min={15} max={300} defaultValue={60} />);
    await expectNoA11yViolations(container);
  });
});
```

(Arrow-key stepping is the platform's — a native range — so it is not re-tested here; jsdom and synthetic key events cannot drive it.)

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './slider'`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/slider/slider.tsx`:

```tsx
import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";

/** The handoff's range: full width, 32px tall, brand accent (DawatCalculator, OfficeLunch). */
const slider = componentVariants({
  base: "h-8 w-full cursor-pointer accent-pink-500 disabled:cursor-not-allowed",
});

export interface SliderProps extends Omit<ComponentProps<"input">, "type"> {
  /** Accessible name. Show the value beside it (a number or a QuantityStepper). */
  label: string;
}

/** A native `<input type="range">` (spec D7): keyboard, touch and `register()` come with it. */
export function Slider({ label, className, ...props }: SliderProps) {
  return <input type="range" aria-label={label} className={slider({ className })} {...props} />;
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories (parity with the two handoff call sites)**

`packages/ui/src/atoms/slider/slider.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Slider } from "./slider";

const meta = {
  title: "Atoms/Slider",
  component: Slider,
  args: { label: "Guests", min: 15, max: 300, step: 5, defaultValue: 60 },
  render: (args) => (
    <div className="max-w-text-measure-prose w-full">
      <Slider {...args} />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "From the handoff calculators: a native range for a number picked by feel — guests for a Dawat, meals a day for an office. Full width, 32px tall, the brand pink as its accent. Always show the value next to it (the number, or a QuantityStepper for exact entry); `label` names it for assistive tech. Keyboard and touch are the platform's.",
      },
    },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** DawatCalculator.dc.html — the guests range inside the white calculator card. */
export const DawatGuests: Story = {
  name: "dawat guests (white card)",
  render: (args) => (
    <div className="max-w-text-measure-prose grid w-full gap-2.5 rounded-lg border border-border-subtle bg-surface-card p-6 shadow-1">
      <span className="font-display text-body-sm font-bold text-text-heading">1. Guests</span>
      <Slider {...args} />
      <span className="font-body text-caption text-text-muted">
        Minimum 15 guests · Royal Dawat from 50
      </span>
    </div>
  ),
};

/** OfficeLunch.dc.html — the meals-a-day range on the ink cost section. */
export const OfficeMealsOnInk: Story = {
  name: "office meals a day (ink section)",
  args: { label: "Meals a day", min: 20, max: 300, step: 5, defaultValue: 40 },
  render: (args) => (
    <div
      data-surface="ink"
      className="max-w-text-measure-prose grid w-full gap-2 rounded-lg bg-surface-inverse p-6"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display font-bold text-text-heading">Meals a day</span>
        <span className="font-display text-h3 font-black text-text-brand">40</span>
      </div>
      <Slider {...args} />
    </div>
  ),
};

export const Disabled: Story = { name: "disabled", args: { disabled: true } };
```

- [ ] **Step 7: Export**

```ts
export { Slider, type SliderProps } from "./atoms/slider/slider";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/slider
```

Run the gate. Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui
git commit -m "feat(ui): add the Slider atom from the handoff calculators

The Dawat guests and office meals-a-day range, promoted into the system: a
native range, full width, 32px, brand accent, named by label. Native props
pass straight through, so register() works and keyboard and touch are the
platform's.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

