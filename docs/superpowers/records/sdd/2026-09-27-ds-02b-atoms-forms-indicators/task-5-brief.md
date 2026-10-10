### Task 5: Radio and RadioGroup

**Files:**

- Create: `packages/ui/src/atoms/radio/radio.tsx`, `radio.test.tsx`, `radio.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/atoms/radio/radio.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                       | Ruling  | Where / clause                                                                            |
| ------------------------------------------------------------------------------ | ------- | ----------------------------------------------------------------------------------------- |
| Radix RadioGroup (roving focus; `defaultValue` / `onValueChange` on the group) | DROP    | D7, D17, contract §3: native radios sharing a `name`; RadioGroup is `fieldset` + `legend` |
| group named by `aria-label`                                                    | ALREADY | required `legend` + `isLegendHidden` (contract §3)                                        |
| the chosen option is checked; a click moves the choice and unchecks the last   | ADD     | Step 2 new click test                                                                     |
| price folded into the name (`₹280`, absolute)                                  | ALREADY | Step 2                                                                                    |
| arrow keys move the choice                                                     | ALREADY | Step 2 (native)                                                                           |
| second line as the description                                                 | ALREADY | Step 2                                                                                    |
| a disabled option ignores clicks                                               | ADD     | Step 2 new disabled test                                                                  |
| chosen = 6px pink ring, never a filled disc                                    | ALREADY | Step 2                                                                                    |
| one option invalid (`hasError`)                                                | ADD     | contract `isInvalid`; Step 2 new test (the group-level error is already tested)           |
| disabled: real grey fill, never opacity                                        | ADD     | Step 2 same disabled test                                                                 |
| horizontal orientation                                                         | ALREADY | Step 2                                                                                    |
| caller `className` on the group and on an option                               | ADD     | Step 2 new tests                                                                          |
| axe incl. a horizontal group with a disabled option                            | ADD     | Step 2 a11y test                                                                          |
| stories default / prices / horizontal                                          | ALREADY | Step 6 group, no price, horizontal                                                        |
| story: states (chosen, not chosen, invalid, disabled)                          | ADD     | Step 6 `States`                                                                           |
| story: portion picker — visible legend, priced, described, a disabled option   | ADD     | Step 6 `PortionPicker`                                                                    |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `ChoiceControl`, `joinIds` (Task 4); `FIELD_STATUS_ICON`, `FieldStatus`; `formatRupees`; `Icon`; `OnSurfaces` (Plan 2a).
- Produces: `Radio`, `RadioProps`, `RadioGroup`, `RadioGroupProps` as contract §3, plus `RadioGroupProps.message` (deviation 2). `RadioGroup` renders `<fieldset role="radiogroup">` + `<legend>`; `status="error"` sets `aria-invalid` on the group and every radio's ring turns red through `in-aria-invalid:`; a `disabled` group disables every radio natively.

- [ ] **Step 1: Component tokens**

None new: the ring reuses `choice-box`; `border-6` is the design system's 6px checked ring. The group message paints `text-text-danger` / `-success` / `-warning` / `-subtle` on light grounds — already in the `light-text` contrast group. No list names.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/radio/radio.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations, fakeRegister } from "../../../vitest.setup";
import { Radio, RadioGroup, type RadioGroupProps } from "./radio";

const ringOf = (input: HTMLElement) => input.nextElementSibling?.firstElementChild;

/** The card's "group" row as a fixture: the legend and options are fixed, the rest is the test's. */
function Portion(props: Omit<RadioGroupProps, "legend" | "children">) {
  return (
    <RadioGroup legend="Portion" {...props}>
      <Radio name="size" value="regular" label="Regular" price={280} defaultChecked />
      <Radio name="size" value="sharing" label="Sharing" price={440} description="Feeds two." />
    </RadioGroup>
  );
}

describe("Radio", () => {
  it("is a native radio named by its label and absolute price", () => {
    render(<Radio name="size" value="regular" label="Regular" price={280} />);
    expect(screen.getByRole("radio", { name: "Regular ₹280" })).toBeInTheDocument();
  });

  it("draws checked as a 6px pink ring, not a filled dot", () => {
    render(<Radio name="heat" value="hot" label="Hot" defaultChecked />);
    expect(ringOf(screen.getByRole("radio"))).toHaveClass(
      "group-has-checked/choice:border-6",
      "group-has-checked/choice:border-pink-500"
    );
  });

  it("describes an option with its description", () => {
    render(<Portion />);
    expect(screen.getByRole("radio", { name: "Sharing ₹440" })).toHaveAccessibleDescription(
      "Feeds two."
    );
  });

  it("moves the choice with the arrow keys, as native radios do", async () => {
    const user = userEvent.setup();
    render(<Portion />);
    await user.tab();
    expect(screen.getByRole("radio", { name: "Regular ₹280" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Sharing ₹440" })).toBeChecked();
  });

  it("moves the choice on click and unchecks the last one", async () => {
    const user = userEvent.setup();
    render(<Portion />);
    await user.click(screen.getByRole("radio", { name: "Sharing ₹440" }));
    expect(screen.getByRole("radio", { name: "Sharing ₹440" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Regular ₹280" })).not.toBeChecked();
  });

  it("ignores clicks on a disabled option, painted with a real fill (never opacity)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <Radio
        name="platter"
        value="family"
        label="Family platter"
        description="Weekends only."
        disabled
        onChange={onChange}
      />
    );
    const radio = screen.getByRole("radio", { name: "Family platter" });
    await user.click(screen.getByText("Family platter"));
    expect(radio).not.toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
    expect(ringOf(radio)).toHaveClass("group-has-disabled/choice:bg-ink-200");
    expect(container.innerHTML).not.toMatch(/opacity-/);
  });

  it("marks one option invalid and rings it red", () => {
    render(<Radio name="size" value="regular" label="Regular" isInvalid />);
    const radio = screen.getByRole("radio", { name: "Regular" });
    expect(radio).toHaveAttribute("aria-invalid", "true");
    expect(ringOf(radio)).toHaveClass("group-has-aria-invalid/choice:border-status-danger");
  });

  it("puts className on the option's row, replacing a conflicting class", () => {
    render(<Radio name="heat" value="hot" label="Hot" className="gap-6" />);
    const row = screen.getByRole("radio").closest("label");
    expect(row).toHaveClass("gap-6");
    expect(row).not.toHaveClass("gap-3");
  });

  it("takes react-hook-form's register() on every option of the field", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("size");
    render(
      <RadioGroup legend="Portion">
        <Radio value="regular" label="Regular" {...field} />
        <Radio value="sharing" label="Sharing" {...field} />
      </RadioGroup>
    );
    const [regular, sharing] = screen.getAllByRole("radio");

    expect(field.ref).toHaveBeenCalledWith(regular);
    expect(field.ref).toHaveBeenCalledWith(sharing);
    expect(sharing).toHaveAttribute("name", "size");
    await user.click(screen.getByText("Sharing"));
    expect(field.onChange).toHaveBeenCalledTimes(1);
    await user.tab();
    expect(field.onBlur).toHaveBeenCalledTimes(1);
  });
});

describe("RadioGroup", () => {
  it("is a radiogroup named by its legend", () => {
    render(<Portion />);
    expect(screen.getByRole("radiogroup", { name: "Portion" })).toBeInTheDocument();
  });

  it("can hide the legend visually and keep the name", () => {
    render(<Portion isLegendHidden />);
    expect(screen.getByText("Portion")).toHaveClass("sr-only");
    expect(screen.getByRole("radiogroup", { name: "Portion" })).toBeInTheDocument();
  });

  it.each([
    ["vertical", "flex-col"],
    ["horizontal", "flex-row"],
  ] as const)("lays options out %s", (orientation, layout) => {
    render(<Portion orientation={orientation} />);
    expect(
      screen.getByRole("radio", { name: "Regular ₹280" }).closest("label")?.parentElement
    ).toHaveClass(layout);
  });

  it("carries an error for the whole group: aria-invalid, red rings, glyph and message", () => {
    const { container } = render(<Portion status="error" message="Pick a portion to continue." />);
    const group = screen.getByRole("radiogroup", { name: "Portion" });
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAccessibleDescription("Pick a portion to continue.");
    expect(container.querySelector(".lucide-circle-alert")).toBeInTheDocument();
    expect(ringOf(screen.getByRole("radio", { name: "Regular ₹280" }))).toHaveClass(
      "in-aria-invalid:border-status-danger"
    );
  });

  it("shows a message without a status as a plain hint", () => {
    const { container } = render(<Portion message="Both come with rice." />);
    expect(screen.getByRole("radiogroup")).not.toHaveAttribute("aria-invalid");
    expect(screen.getByText("Both come with rice.")).toHaveClass("text-text-subtle");
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("disables every option at once through the fieldset", () => {
    render(<Portion disabled />);
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
  });

  it("puts className on the fieldset", () => {
    render(<Portion className="mt-6" />);
    expect(screen.getByRole("radiogroup")).toHaveClass("mt-6", "min-w-0");
  });

  it("has no accessibility violations with an error and a message, or in a row with a disabled option", async () => {
    const { container } = render(
      <>
        <Portion status="error" message="Pick a portion to continue." />
        <RadioGroup legend="Heat" orientation="horizontal">
          <Radio name="heat" value="hot" label="Hot" />
          <Radio name="heat" value="extra-hot" label="Extra Hot" />
          <Radio
            name="heat"
            value="kitchen-special"
            label="Kitchen special"
            description="Weekends only."
            disabled
          />
        </RadioGroup>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './radio'`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/radio/radio.tsx`:

```tsx
import { type ComponentProps, type ReactNode, useId } from "react";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { ChoiceControl, joinIds } from "../../lib/choice-control";
import { componentVariants } from "../../lib/component-variants";
import { FIELD_STATUS_ICON, type FieldStatus } from "../../lib/field-status";
import { Icon } from "../icon/icon";

/** 22px circle; checked is a 6px pink ring around a white centre — never a filled dot. */
const ring = componentVariants({
  base: [
    "size-choice-box rounded-pill border-2 border-border-default bg-ink-000 transition-all duration-fast ease-out",
    "group-has-checked/choice:border-6 group-has-checked/choice:border-pink-500",
    "group-has-focus-visible/choice:outline-2 group-has-focus-visible/choice:outline-offset-2 group-has-focus-visible/choice:outline-focus",
    "group-has-disabled/choice:border-ink-200 group-has-disabled/choice:bg-ink-200 group-has-checked/choice:group-has-disabled/choice:border-ink-400",
    "group-has-aria-invalid/choice:border-status-danger in-aria-invalid:border-status-danger",
  ],
});

const radioGroup = componentVariants({
  slots: {
    root: "min-w-0",
    legend: "mb-3 font-body text-body-sm font-medium text-text-body",
    options: "flex gap-3",
    message: "mt-2 mb-0 flex max-w-none items-center gap-1.5 font-body text-caption",
  },
  variants: {
    orientation: {
      vertical: { options: "flex-col" },
      horizontal: { options: "flex-row flex-wrap gap-x-6" },
    },
    status: {
      default: { message: "text-text-subtle" },
      error: { message: "text-text-danger" },
      success: { message: "text-text-success" },
      warning: { message: "text-text-warning" },
    },
    isLegendHidden: { true: { legend: "sr-only" } },
  },
  defaultVariants: { orientation: "vertical", status: "default", isLegendHidden: false },
});

export interface RadioProps extends Omit<ComponentProps<"input">, "type" | "size"> {
  label: ReactNode;
  description?: ReactNode;
  /** Absolute price of this option in whole rupees; renders as "₹280". */
  price?: number | undefined;
  isInvalid?: boolean | undefined;
}

/** Exactly-one choice — portion size, spice level, payment method. Give a group one shared `name`. */
export function Radio({ price, ...props }: RadioProps) {
  return (
    <ChoiceControl
      type="radio"
      control={<span className={ring()} />}
      price={price === undefined ? undefined : formatRupees(price)}
      {...props}
    />
  );
}

export interface RadioGroupProps extends ComponentProps<"fieldset"> {
  legend: ReactNode;
  isLegendHidden?: boolean | undefined;
  orientation?: "vertical" | "horizontal" | undefined;
  /** `error` marks the group invalid and turns every ring red. */
  status?: FieldStatus | undefined;
  /** Shown under the options with the status glyph, and read as the group's description. */
  message?: ReactNode;
}

/** A `<fieldset>` + `<legend>` around Radios, exposed as a radiogroup. */
export function RadioGroup({
  legend,
  isLegendHidden = false,
  orientation = "vertical",
  status = "default",
  message,
  className,
  children,
  "aria-describedby": describedBy,
  ...props
}: RadioGroupProps) {
  const messageId = useId();
  const styles = radioGroup({ orientation, status, isLegendHidden });
  const statusIcon = status === "default" ? undefined : FIELD_STATUS_ICON[status];

  return (
    <fieldset
      role="radiogroup"
      aria-invalid={status === "error" ? true : undefined}
      aria-describedby={joinIds(message === undefined ? undefined : messageId, describedBy)}
      className={styles.root({ className })}
      {...props}
    >
      <legend className={styles.legend()}>{legend}</legend>
      <div className={styles.options()}>{children}</div>
      {message === undefined ? null : (
        <p id={messageId} className={styles.message()}>
          {statusIcon === undefined ? null : <Icon icon={statusIcon} size="xs" />}
          {message}
        </p>
      )}
    </fieldset>
  );
}
```

(`role="radiogroup"` on a fieldset is allowed by ARIA in HTML and by jsx-a11y's recommended mapping; it is what lets `aria-invalid` sit on the group.)

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories (card parity with `Radio.card.html`; docs from `Radio.prompt.md`)**

`packages/ui/src/atoms/radio/radio.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Radio, RadioGroup } from "./radio";

const meta = {
  title: "Atoms/Radio",
  component: Radio,
  subcomponents: { RadioGroup },
  args: { name: "playground", value: "regular", label: "Regular", price: 280 },
  parameters: {
    docs: {
      description: {
        component:
          "Exactly-one choice — portion size, spice level, payment method. Put radios in a **RadioGroup** (a `fieldset` + `legend`, 12px apart) and always give them a shared `name`. The dot is drawn as a 6px pink ring — do not swap in a filled circle. `price` is the option's absolute price. A group `status` marks every ring and reads its `message` as the group's description; a disabled group disables every option.",
      },
    },
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Group: Story = {
  name: "group",
  render: () => (
    <RadioGroup legend="Portion" isLegendHidden>
      <Radio name="size" value="regular" label="Regular" price={280} defaultChecked />
      <Radio name="size" value="sharing" label="Sharing" price={440} description="Feeds two." />
    </RadioGroup>
  ),
};

export const NoPrice: Story = {
  name: "no price",
  render: () => (
    <RadioGroup legend="Spice" isLegendHidden>
      <Radio name="heat" value="hot" label="Hot" defaultChecked />
      <Radio name="heat" value="extra-hot" label="Extra Hot" />
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  name: "disabled",
  render: () => (
    <Radio
      name="platter"
      value="family"
      label="Family platter"
      description="Weekends only."
      disabled
    />
  ),
};

export const GroupError: Story = {
  name: "group status + message",
  render: () => (
    <RadioGroup legend="Portion" status="error" message="Pick a portion to continue.">
      <Radio name="portion" value="regular" label="Regular" price={280} />
      <Radio name="portion" value="sharing" label="Sharing" price={440} />
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  name: "orientation horizontal",
  render: () => (
    <RadioGroup legend="Spice" orientation="horizontal">
      <Radio name="spice-row" value="mild" label="Mild" defaultChecked />
      <Radio name="spice-row" value="medium" label="Medium" />
      <Radio name="spice-row" value="hot" label="Hot" />
    </RadioGroup>
  ),
};

/** Every option state in one group: chosen, not chosen, invalid, disabled. */
export const States: Story = {
  name: "states",
  render: () => (
    <RadioGroup legend="States" isLegendHidden>
      <Radio name="states" value="chosen" label="Chosen" defaultChecked />
      <Radio name="states" value="not-chosen" label="Not chosen" />
      <Radio name="states" value="invalid" label="Group unanswered" isInvalid />
      <Radio
        name="states"
        value="family"
        label="Family platter"
        description="Weekends only."
        disabled
      />
    </RadioGroup>
  ),
};

/** The real shape: the portion step of an item sheet — a visible legend, priced and described. */
export const PortionPicker: Story = {
  name: "portion picker",
  render: () => (
    <RadioGroup legend="Choose a portion">
      <Radio
        name="portion-pick"
        value="regular"
        label="Regular"
        price={280}
        description="One plate."
        defaultChecked
      />
      <Radio
        name="portion-pick"
        value="sharing"
        label="Sharing"
        price={440}
        description="Feeds two."
      />
      <Radio
        name="portion-pick"
        value="family"
        label="Family platter"
        price={720}
        description="Weekends only."
        disabled
      />
    </RadioGroup>
  ),
};

/** Unnamed radios, so each of the five grounds keeps its own checked option. */
export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Radio value="regular" label="Regular" price={280} defaultChecked />
      <Radio value="sharing" label="Sharing" price={440} />
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { Radio, RadioGroup, type RadioGroupProps, type RadioProps } from "./atoms/radio/radio";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/radio
```

Run the gate. Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui
git commit -m "feat(ui): add the Radio and RadioGroup atoms

Radio is the shared choice row with the design system's 6px ring and an
absolute price. RadioGroup is a fieldset exposed as a radiogroup, so a
group error sets aria-invalid once and every ring turns red through CSS; its
message carries the status glyph and is read as the group's description.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

