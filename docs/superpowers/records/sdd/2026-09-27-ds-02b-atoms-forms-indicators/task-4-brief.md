### Task 4: Checkbox — and the shared choice row

**Files:**

- Create: `packages/design-tokens/tokens/component/choice.json`
- Modify: `packages/design-tokens/tokens/component/control.json`
- Create: `packages/ui/src/lib/choice-control.tsx`
- Create: `packages/ui/src/atoms/checkbox/checkbox.tsx`, `checkbox.test.tsx`, `checkbox.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/atoms/checkbox/checkbox.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                       | Ruling                          | Where / clause                                                                                                                                                                               |
| ------------------------------------------------------------------------------ | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Radix Checkbox + `onCheckedChange(checked)`                                    | DROP                            | D7, D17, contract §3: native `checked` / `onChange` (see "Reconciliations")                                                                                                                  |
| indeterminate (`checked="indeterminate"`, `aria-checked="mixed"`, minus glyph) | DROP — contract delta P1 raised | not in `Checkbox.d.ts` / `.card.html` (spec D2) or contract §3; a native mixed state is a DOM property only JS can set, so every checkbox would turn client (D6). The controller rules on P1 |
| unchecked, named by its label                                                  | ALREADY                         | Step 2                                                                                                                                                                                       |
| add-on price folded into the name (`+₹40`)                                     | ALREADY                         | Step 2                                                                                                                                                                                       |
| click toggles and reports the state                                            | ALREADY                         | Step 2 first + register() tests                                                                                                                                                              |
| space bar after Tab                                                            | ALREADY                         | Step 2                                                                                                                                                                                       |
| disabled ignores clicks                                                        | ADD                             | Step 2 disabled test                                                                                                                                                                         |
| second line as the accessible description                                      | ALREADY                         | Step 2                                                                                                                                                                                       |
| checked floods the box pink                                                    | ALREADY                         | Step 2                                                                                                                                                                                       |
| error (`hasError`)                                                             | ALREADY                         | contract `isInvalid`; Step 2                                                                                                                                                                 |
| disabled: real grey fill, never opacity                                        | ALREADY                         | Step 2                                                                                                                                                                                       |
| caller `className` on the row, replacing a conflict                            | ADD                             | Step 2 className test (`gap-6` replaces `gap-3`)                                                                                                                                             |
| axe over plain, priced + described + checked, disabled, invalid                | ADD                             | Step 2 a11y test (adds a disabled row)                                                                                                                                                       |
| `label` typed `string`                                                         | ALREADY                         | `ReactNode` (wider)                                                                                                                                                                          |
| stories default / checked / price / description / states                       | ALREADY                         | Step 6                                                                                                                                                                                       |
| story: add-on list in a fieldset, with a disabled priced row                   | ADD                             | Step 6 `AddOnList`                                                                                                                                                                           |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `formatRupees` (`@pink-paprikaa-web/utils`), `Icon`, `componentVariants`, `fakeRegister`; `transition-control`, `OnSurfaces` (Plan 2a).
- Produces: `Checkbox`, `CheckboxProps` as contract §3; `ChoiceControl`, `ChoiceControlProps`, `choiceVariants`, `joinIds(...ids)` (`lib/choice-control.tsx` — Radio and Switch use them in Tasks 5–6: props `type: "checkbox" | "radio"`, `control: ReactNode`, `label`, `description`, `price: string` (pre-formatted), `isInvalid`, `placement: "start" | "end"`, `isLabelHidden`, plus every native input prop).

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/choice.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "choice-box": { "$value": "22px", "$description": "The drawn box of a checkbox or a radio." }
  }
}
```

`packages/design-tokens/tokens/component/control.json` (full file after the change):

```json
{
  "text": {
    "$type": "typography",
    "control": {
      "$value": { "fontSize": "15px" },
      "$description": "Text in a md or lg field, and the label of a checkbox, radio or switch."
    },
    "control-description": {
      "$value": { "fontSize": "13px" },
      "$description": "The secondary line under a checkbox, radio or switch label."
    }
  }
}
```

In `component-variants.ts` append to `SPACING`: `"choice-box"`; to `TEXT`: `"control-description"`. Gaps are quarter steps: 12px control-to-text `gap-3`, 14px text-to-trailing-control (Switch) `gap-3.5`, 2px label-to-description `gap-0.5`.

Contrast: no new pair — labels paint `text-text-body`, descriptions `text-text-muted`, prices `text-text-heading`, all already asserted on every surface group (light, soft, ink, brand).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/checkbox/checkbox.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations, fakeRegister } from "../../../vitest.setup";
import { Checkbox } from "./checkbox";

/** The drawn box: the input's next sibling is the decorative control slot, the box sits inside. */
const boxOf = (input: HTMLElement) => input.nextElementSibling?.firstElementChild;

describe("Checkbox", () => {
  it("is a native checkbox named by its label, toggled by clicking the row", async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Masala fries on the side" />);
    const checkbox = screen.getByRole("checkbox", { name: "Masala fries on the side" });
    expect(checkbox).not.toBeChecked();
    await user.click(screen.getByText("Masala fries on the side"));
    expect(checkbox).toBeChecked();
  });

  it("toggles with the space bar and rings its box on keyboard focus", async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Order updates by SMS" />);
    await user.tab();
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveFocus();
    await user.keyboard(" ");
    expect(checkbox).toBeChecked();
    expect(boxOf(checkbox)).toHaveClass("group-has-focus-visible/choice:outline-2");
  });

  it("draws the checked state as a pink box with a white tick (CSS off the native state)", () => {
    render(<Checkbox label="Extra burnt chilli mayo" defaultChecked />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
    expect(boxOf(checkbox)).toHaveClass(
      "group-has-checked/choice:bg-pink-500",
      "group-has-checked/choice:text-ink-000"
    );
    expect(boxOf(checkbox)?.querySelector(".lucide-check")).toBeInTheDocument();
  });

  it("prints an add-on price as +₹ and includes it in the accessible name", () => {
    render(<Checkbox label="Extra burnt chilli mayo" price={40} />);
    expect(
      screen.getByRole("checkbox", { name: "Extra burnt chilli mayo +₹40" })
    ).toBeInTheDocument();
    expect(screen.getByText("+₹40")).toHaveClass("font-display", "font-bold");
  });

  it("announces the description as a description, not as part of the name", () => {
    render(
      <Checkbox label="Make it a meal" description="Adds fries and a kulhad chai." price={120} />
    );
    const checkbox = screen.getByRole("checkbox", { name: "Make it a meal +₹120" });
    expect(checkbox).toHaveAccessibleDescription("Adds fries and a kulhad chai.");
  });

  it("keeps Field's aria-describedby next to its own description", () => {
    render(
      <Checkbox
        label="I agree to the terms"
        description="Read them first."
        aria-describedby="terms-error"
      />
    );
    const ids = screen.getByRole("checkbox").getAttribute("aria-describedby")?.split(" ");
    expect(ids).toHaveLength(2);
    expect(ids).toContain("terms-error");
  });

  it("marks itself invalid and paints the box as an error", () => {
    render(<Checkbox label="I agree to the terms" isInvalid />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(boxOf(checkbox)).toHaveClass("group-has-aria-invalid/choice:border-status-danger");
  });

  it("takes react-hook-form's register(): ref, name, onChange and onBlur reach the native input", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("mayo");
    render(<Checkbox label="Extra burnt chilli mayo" {...field} />);
    const checkbox = screen.getByRole("checkbox");

    expect(field.ref).toHaveBeenCalledWith(checkbox);
    expect(checkbox).toHaveAttribute("name", "mayo");
    await user.click(checkbox);
    expect(field.onChange).toHaveBeenCalledTimes(1);
    await user.tab();
    expect(field.onBlur).toHaveBeenCalledTimes(1);
  });

  it("disables the whole row with a real fill, never opacity, and ignores clicks", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Checkbox label="Truffle oil" description="Sold out today." disabled onChange={onChange} />
    );
    const checkbox = screen.getByRole("checkbox", { name: "Truffle oil" });
    expect(checkbox).toBeDisabled();
    expect(checkbox.closest("label")).toHaveClass(
      "has-disabled:cursor-not-allowed",
      "has-disabled:text-ink-400"
    );
    expect(boxOf(checkbox)).toHaveClass("group-has-disabled/choice:bg-ink-200");
    await user.click(screen.getByText("Truffle oil"));
    expect(checkbox).not.toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("puts className on the row, not the input, replacing a conflicting class", () => {
    render(<Checkbox label="Extra mayo" className="w-full gap-6" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toHaveClass("w-full");
    expect(checkbox.closest("label")).toHaveClass("w-full", "gap-6");
    expect(checkbox.closest("label")).not.toHaveClass("gap-3");
  });

  it("has no accessibility violations checked, priced, described, invalid and disabled", async () => {
    const { container } = render(
      <>
        <Checkbox
          label="Make it a meal"
          description="Adds fries and a kulhad chai."
          price={120}
          defaultChecked
          isInvalid
        />
        <Checkbox label="Truffle oil" description="Sold out today." price={60} disabled />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './checkbox'`.

- [ ] **Step 4: Implement**

`packages/ui/src/lib/choice-control.tsx`:

```tsx
import { type ComponentProps, type ReactNode, useId } from "react";

import { componentVariants } from "./component-variants";

/**
 * The one choice row — Checkbox, Radio and Switch. A <label> holds a visually hidden native input,
 * the drawn control, the label, an optional description and an optional price. Every state is CSS
 * off that input (`group-has-checked/choice:`, `group-has-focus-visible/choice:`,
 * `group-has-disabled/choice:`, `group-has-aria-invalid/choice:`), so the controls stay server
 * components and work controlled, uncontrolled or through react-hook-form alike.
 */
export const choiceVariants = componentVariants({
  slots: {
    root: "group/choice relative flex cursor-pointer font-body text-text-body has-disabled:cursor-not-allowed has-disabled:text-ink-400",
    input: "sr-only",
    control: "flex shrink-0",
    text: "text-control flex min-w-0 flex-1 flex-col gap-0.5 font-medium",
    description:
      "text-control-description font-regular text-text-muted group-has-disabled/choice:text-ink-400",
    price:
      "shrink-0 font-display text-body-sm font-bold text-text-heading group-has-disabled/choice:text-ink-400",
  },
  variants: {
    /** Where the drawn control sits: before the text (checkbox, radio) or after it (switch). */
    placement: {
      start: { root: "items-start gap-3", control: "mt-px" },
      end: { root: "items-center gap-3.5", control: "order-last" },
    },
    isLabelHidden: { true: { text: "sr-only" } },
  },
  defaultVariants: { placement: "start", isLabelHidden: false },
});

/** A space-separated id list for `aria-describedby`, or undefined when there is none. */
export function joinIds(...ids: (string | undefined)[]): string | undefined {
  const joined = ids.filter((id) => id !== undefined && id !== "").join(" ");
  return joined === "" ? undefined : joined;
}

export interface ChoiceControlProps extends Omit<ComponentProps<"input">, "size" | "type"> {
  type: "checkbox" | "radio";
  /** The drawn box, ring or track. Decorative: the native input carries every semantic. */
  control: ReactNode;
  label: ReactNode;
  /** Announced as the input's description and kept out of its name. */
  description?: ReactNode;
  /** Already formatted ("+₹60", "₹280"); part of the accessible name. */
  price?: string | undefined;
  /** Sets `aria-invalid`; the box turns red through CSS. */
  isInvalid?: boolean | undefined;
  /** Where the drawn control sits: before the text (checkbox, radio) or after it (switch). */
  placement?: "start" | "end" | undefined;
  /** Hides the text visually; it stays the accessible name. */
  isLabelHidden?: boolean | undefined;
}

/** `className` styles the row; every other prop lands on the native input. */
export function ChoiceControl({
  type,
  control,
  label,
  description,
  price,
  isInvalid = false,
  placement,
  isLabelHidden,
  className,
  "aria-describedby": describedBy,
  ...props
}: ChoiceControlProps) {
  const descriptionId = useId();
  const styles = choiceVariants({ placement, isLabelHidden });

  return (
    <label className={styles.root({ className })}>
      <input
        type={type}
        className={styles.input()}
        aria-invalid={isInvalid ? true : undefined}
        aria-describedby={joinIds(
          description === undefined ? undefined : descriptionId,
          describedBy
        )}
        {...props}
      />
      <span aria-hidden="true" className={styles.control()}>
        {control}
      </span>
      <span className={styles.text()}>
        {label}
        {description === undefined ? null : (
          // aria-hidden keeps the description out of the label's name; the input's
          // aria-describedby still announces it (a referenced node is read even when hidden).
          <span id={descriptionId} aria-hidden="true" className={styles.description()}>
            {description}
          </span>
        )}
      </span>
      {price === undefined ? null : (
        <>
          {" "}
          <span className={styles.price()}>{price}</span>
        </>
      )}
    </label>
  );
}
```

(The `{" "}` before the price is what makes the accessible name "Extra mayo +₹40" rather than "Extra mayo+₹40"; a whitespace-only text node in a flex row is not rendered.)

`packages/ui/src/atoms/checkbox/checkbox.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { Check } from "lucide-react";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { ChoiceControl } from "../../lib/choice-control";
import { componentVariants } from "../../lib/component-variants";
import { Icon } from "../icon/icon";

/** 22px, 6px radius, 2px border; checked is pink with a white 14px tick. */
const box = componentVariants({
  base: [
    "size-choice-box transition-control grid place-items-center rounded-sm border-2 border-border-default bg-ink-000 text-transparent",
    "group-has-checked/choice:border-pink-500 group-has-checked/choice:bg-pink-500 group-has-checked/choice:text-ink-000",
    "group-has-focus-visible/choice:outline-2 group-has-focus-visible/choice:outline-offset-2 group-has-focus-visible/choice:outline-focus",
    "group-has-disabled/choice:border-ink-200 group-has-disabled/choice:bg-ink-200 group-has-checked/choice:group-has-disabled/choice:text-ink-400",
    "group-has-aria-invalid/choice:border-status-danger",
  ],
});

export interface CheckboxProps extends Omit<ComponentProps<"input">, "type" | "size"> {
  label: ReactNode;
  /** Secondary line under the label, announced as the description. */
  description?: ReactNode;
  /** Add-on price in whole rupees; renders as "+₹60". */
  price?: number | undefined;
  /** Paints the box as an error and sets `aria-invalid`. Field shows what to do next. */
  isInvalid?: boolean | undefined;
}

/** Multi-select choice — menu add-ons, dietary preferences, consent. */
export function Checkbox({ price, ...props }: CheckboxProps) {
  return (
    <ChoiceControl
      type="checkbox"
      control={
        <span className={box()}>
          <Icon icon={Check} size="xs" />
        </span>
      }
      price={price === undefined ? undefined : `+${formatRupees(price)}`}
      {...props}
    />
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories (card parity with `Checkbox.card.html`; docs from `Checkbox.prompt.md`)**

`packages/ui/src/atoms/checkbox/checkbox.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Checkbox } from "./checkbox";

const meta = {
  title: "Atoms/Checkbox",
  component: Checkbox,
  args: { label: "Extra burnt chilli mayo" },
  parameters: {
    docs: {
      description: {
        component:
          "Multi-select choice — menu add-ons, dietary preferences, consent. Pass `price` for add-ons; it right-aligns as `+₹40` in Poppins 700 and is part of the accessible name. `description` is announced as the description. `isInvalid` paints the box red and sets `aria-invalid`; the message that says what to do next belongs to Field. Disabled is a real fill, never opacity. Use Radio when exactly one option must be chosen.",
      },
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { args: { price: 40 } };

export const CheckedAndUnchecked: Story = {
  name: "checked / not",
  render: () => (
    <div className="grid gap-3">
      <Checkbox label="Extra burnt chilli mayo" defaultChecked />
      <Checkbox label="Masala fries on the side" />
    </div>
  ),
};

export const Price: Story = { name: "price", args: { price: 40, defaultChecked: true } };

export const Description: Story = {
  name: "description",
  args: {
    label: "Make it a meal",
    description: "Adds fries and a kulhad chai.",
    price: 120,
  },
};

export const Invalid: Story = {
  name: "error",
  args: { label: "I agree to the terms", isInvalid: true },
};

export const Disabled: Story = {
  name: "disabled",
  args: { label: "Truffle oil", description: "Sold out today.", disabled: true },
};

/** The real shape: an add-on list in an item sheet (a plain fieldset — an atom story composes no atom). */
export const AddOnList: Story = {
  name: "add-on list",
  render: () => (
    <fieldset className="grid gap-3 rounded-lg border border-border-subtle p-5">
      <legend className="px-1 font-display text-h4 font-bold text-text-heading">
        Add to your order
      </legend>
      <Checkbox label="Extra burnt chilli mayo" price={40} defaultChecked />
      <Checkbox label="Masala fries on the side" price={90} />
      <Checkbox
        label="Make it a meal"
        description="Adds masala fries and a kulhad chai."
        price={120}
      />
      <Checkbox label="Truffle oil" description="Sold out today." price={60} disabled />
    </fieldset>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Checkbox
        label="Make it a meal"
        description="Adds fries and a kulhad chai."
        price={120}
        defaultChecked
      />
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { Checkbox, type CheckboxProps } from "./atoms/checkbox/checkbox";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/checkbox packages/ui/src/lib/choice-control.tsx packages/design-tokens/tokens/component
```

Run the gate. Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the Checkbox atom on a shared choice row

ChoiceControl is the one label row Checkbox, Radio and Switch share: a
hidden native input, the drawn control, label, description and price.
Checked, focus, disabled and invalid are CSS off the native input, so the
controls stay server components and register() works unmodified. The
description is announced as a description, not folded into the name.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

