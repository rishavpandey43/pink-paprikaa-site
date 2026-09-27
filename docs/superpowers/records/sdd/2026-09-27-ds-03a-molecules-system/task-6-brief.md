### Task 6: SlotPicker (native radios, server-safe)

Design-system sources: `components/molecules/SlotPicker.*`. Card rows: auto-fit · error · disabled · `columns={3}`.

**Files:**

- Create: `packages/design-tokens/tokens/component/slot-picker.json`
- Create: `packages/ui/src/molecules/slot-picker/slot-picker.tsx`, `slot-picker.test.tsx`, `slot-picker.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`), `packages/design-tokens/contrast-pairs.json`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/slot-picker/slot-picker.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                  | Ruling  | Where / why                                                                                           |
| ------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| arrow keys move between slots (and skip sold-out)                         | ADD     | test "moves between slots with the arrow keys…" (native radio group behaviour)                        |
| clicking a sold-out slot reports nothing; disabled is a fill, not opacity | ADD     | sold-out test                                                                                         |
| label mutes when the group is disabled                                    | ADD     | `group/slot-picker` + legend `group-disabled/slot-picker:text-text-subtle` + disabled test            |
| success / warning paint the slot border (dev: all three statuses)         | ADD     | `status` variant + `it.each` border test                                                              |
| invalid only on error; error announced (`role="alert"`)                   | ADD     | test "marks the slots invalid only on the error status" + alert assertion (Task 1 `FieldMessage`)     |
| `hint` line under the grid                                                | ADD     | via `message` on the default status (Task 1) + test + `Statuses` story; no `hint` prop (contracts §5) |
| caller `className` merges                                                 | ADD     | test "merges a caller className…"                                                                     |
| axe over a disabled group                                                 | ADD     | axe test                                                                                              |
| `Statuses` and `Narrow` stories                                           | ADD     | `Statuses`, `Narrow` stories                                                                          |
| bare-string slots (`"7:30pm"`)                                            | DROP    | spec §8.2: object lists only                                                                          |
| Radix RadioGroup (`role="radiogroup"`, roving focus)                      | DROP    | spec D7 / §9.2: native radios in a `<fieldset>`                                                       |
| `status` `disabled` / `readOnly` / `loading`                              | DROP    | contracts §1 `FieldStatus`; the native `disabled` prop covers disabled                                |
| `InsideAField` story                                                      | DROP    | deviation 1: a fieldset cannot sit inside `Field` (a `<label>` cannot name a group)                   |
| optional visible `label`                                                  | ALREADY | required `legend` + `isLegendHidden` (deviation 1)                                                    |
| name "ASAP, 12 min"                                                       | ALREADY | named "ASAP", described "12 min"                                                                      |
| chosen slot; reports pick; uncontrolled; group disabled; columns/auto-fit | ALREADY | tests "starts at defaultValue…", "reports the picked slot…", "disables every slot…", "lays slots…"    |
| `Default`, `FixedColumns`, `SoldOut` stories                              | ALREADY | `Playground` (sold-out 9:00pm included), `Columns`                                                    |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `FieldMessage`, `hasFieldMessage` (Task 1); `joinIds` (Plan 2b, `lib/choice-control.tsx`).
- Produces: `SlotPicker`, `SlotPickerProps`, `SlotOption` — contract §5 + `message`, `isLegendHidden` (deviation 1). A `<fieldset>` of real radios sharing `name`: selection styling is CSS (`has-checked:`), so a server-rendered picker with `defaultValue` works with no JavaScript and posts in a native form. The change handler exists only when `onValueChange` is given (i.e. inside a client tree); react-hook-form binds it with `<Controller>` (`value`, `onValueChange`, `name`, `onBlur` on the fieldset).

- [ ] **Step 1: Component tokens and contrast pairs**

`packages/design-tokens/tokens/component/slot-picker.json`:

```json
{
  "grid-template-columns": {
    "slot-picker": {
      "$value": "repeat(auto-fit, minmax(min(96px, 100%), 1fr))",
      "$description": "SlotPicker without columns: auto-fit at the design system's 96px minimum, never a bare 1fr. Utility: grid-cols-slot-picker."
    }
  },
  "text": {
    "$type": "typography",
    "slot-picker-note": {
      "$value": { "fontSize": "11.5px", "lineHeight": 1.3 },
      "$description": "The small line under a slot label, e.g. \"12 min\" (DM Sans 400)."
    }
  }
}
```

Append `"slot-picker-note"` to `TEXT` in `component-variants.ts`. Append to `groups` in `packages/design-tokens/contrast-pairs.json`:

```json
{
  "id": "slot-picker",
  "surface": null,
  "pairs": [
    ["color-ink-700", "color-surface-card"],
    ["color-pink-700", "color-surface-page-alt"],
    ["color-text-subtle", "color-surface-page-alt"]
  ],
  "min": 4.5
}
```

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -6`
Expected: PASS (ink-700 on white ≈ 11.2, pink-700 on pink-50 ≈ 6.2, ink-600 on pink-50 ≈ 6.0).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/slot-picker/slot-picker.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { type SlotOption, SlotPicker } from "./slot-picker";

const SLOTS: SlotOption[] = [
  { value: "asap", label: "ASAP", note: "12 min" },
  { value: "7:30pm", label: "7:30pm" },
  { value: "8:00pm", label: "8:00pm" },
  { value: "8:30pm", label: "8:30pm" },
  { value: "9pm", label: "9:00pm", isDisabled: true },
];

describe("SlotPicker", () => {
  it("is a named group of radios sharing one name", () => {
    render(<SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} />);
    const radios = within(screen.getByRole("group", { name: "Pickup time" })).getAllByRole("radio");
    expect(radios).toHaveLength(5);
    for (const radio of radios) expect(radio).toHaveAttribute("name", "pickup");
  });

  it("names each slot by its label and describes it with its note", () => {
    render(<SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} />);
    expect(screen.getByRole("radio", { name: "ASAP" })).toHaveAccessibleDescription("12 min");
  });

  it("starts at defaultValue and moves with a click when uncontrolled", async () => {
    const user = userEvent.setup();
    render(<SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} defaultValue="7:30pm" />);
    expect(screen.getByRole("radio", { name: "7:30pm" })).toBeChecked();
    await user.click(screen.getByText("8:00pm"));
    expect(screen.getByRole("radio", { name: "8:00pm" })).toBeChecked();
  });

  it("reports the picked slot and follows the caller when controlled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <SlotPicker
        name="pickup"
        legend="Pickup time"
        slots={SLOTS}
        value="7:30pm"
        onValueChange={onValueChange}
      />
    );
    await user.click(screen.getByText("8:30pm"));
    expect(onValueChange).toHaveBeenCalledWith("8:30pm");
    expect(screen.getByRole("radio", { name: "7:30pm" })).toBeChecked();
    rerender(
      <SlotPicker
        name="pickup"
        legend="Pickup time"
        slots={SLOTS}
        value="8:30pm"
        onValueChange={onValueChange}
      />
    );
    expect(screen.getByRole("radio", { name: "8:30pm" })).toBeChecked();
  });

  it("picks from the keyboard", async () => {
    const user = userEvent.setup();
    render(<SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} />);
    await user.tab();
    await user.keyboard(" ");
    expect(screen.getByRole("radio", { name: "ASAP" })).toBeChecked();
  });

  it("moves between slots with the arrow keys, skipping a sold-out one", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SlotPicker
        name="pickup"
        legend="Pickup time"
        slots={SLOTS}
        defaultValue="8:30pm"
        onValueChange={onValueChange}
      />
    );
    await user.click(screen.getByRole("radio", { name: "8:30pm" }));
    await user.keyboard("{ArrowRight}");
    // 9:00pm is sold out, so the native group wraps round to the first slot.
    expect(screen.getByRole("radio", { name: "ASAP" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "ASAP" })).toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith("asap");
  });

  it("strikes through and disables a sold-out slot — never hides it, never fades it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} onValueChange={onValueChange} />
    );
    const soldOut = screen.getByRole("radio", { name: "9:00pm" });
    expect(soldOut).toBeDisabled();
    expect(soldOut.closest("label")).toHaveClass("line-through");
    expect(soldOut.closest("label")?.className).not.toMatch(/opacity-/);
    await user.click(screen.getByText("9:00pm"));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("disables every slot and mutes the legend when the group is disabled", () => {
    render(<SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} disabled />);
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
    // jsdom cannot evaluate `:disabled` on the fieldset for styling; the class is the contract.
    expect(screen.getByText("Pickup time")).toHaveClass(
      "group-disabled/slot-picker:text-text-subtle"
    );
  });

  it.each([
    ["error", "border-status-danger"],
    ["success", "border-status-success"],
    ["warning", "border-status-warning"],
  ] as const)("paints the slots with the %s border", (status, border) => {
    render(
      <SlotPicker
        name="pickup"
        legend="Pickup time"
        slots={SLOTS}
        status={status}
        message="Pick a slot to continue."
      />
    );
    expect(screen.getByRole("radio", { name: "7:30pm" }).closest("label")).toHaveClass(border);
  });

  it("shows a hint as its message on the default status, describing the group politely", () => {
    render(
      <SlotPicker
        name="pickup"
        legend="Pickup time"
        slots={SLOTS}
        message="Slots open 30 minutes ahead."
      />
    );
    expect(screen.getByRole("group", { name: "Pickup time" })).toHaveAccessibleDescription(
      "Slots open 30 minutes ahead."
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("merges a caller className over its own gap", () => {
    render(<SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} className="gap-6" />);
    const group = screen.getByRole("group", { name: "Pickup time" });
    expect(group).toHaveClass("gap-6");
    expect(group).not.toHaveClass("gap-2.5");
  });

  it("describes the group with its error message and marks the slots invalid", () => {
    render(
      <SlotPicker
        name="pickup"
        legend="Pickup time"
        slots={SLOTS}
        status="error"
        message="Pick a slot to continue."
      />
    );
    expect(screen.getByRole("group", { name: "Pickup time" })).toHaveAccessibleDescription(
      "Pick a slot to continue."
    );
    expect(screen.getByRole("radio", { name: "ASAP" })).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Pick a slot to continue.");
  });

  it("marks the slots invalid only on the error status", () => {
    render(
      <SlotPicker
        name="pickup"
        legend="Pickup time"
        slots={SLOTS}
        status="warning"
        message="That slot is nearly full."
      />
    );
    expect(screen.getByRole("radio", { name: "ASAP" })).not.toHaveAttribute("aria-invalid");
  });

  it("lays slots in fixed columns, or auto-fits them without columns", () => {
    const { container, rerender } = render(
      <SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} columns={3} />
    );
    expect(container.querySelector(".grid-cols-3")).toBeInTheDocument();
    rerender(<SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} />);
    expect(container.querySelector(".grid-cols-slot-picker")).toBeInTheDocument();
  });

  it("keeps the group named when its legend is visually hidden", () => {
    render(<SlotPicker name="guests" legend="Guests" slots={SLOTS} isLegendHidden />);
    expect(screen.getByRole("group", { name: "Guests" })).toBeInTheDocument();
    expect(screen.getByText("Guests")).toHaveClass("sr-only");
  });

  it("has no accessibility violations at rest or in error", async () => {
    const { container } = render(
      <>
        <SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} defaultValue="7:30pm" />
        <SlotPicker
          name="table"
          legend="Table time"
          slots={SLOTS}
          status="error"
          message="Pick a slot to continue."
        />
        <SlotPicker
          name="booking"
          legend="Booking time"
          slots={SLOTS}
          disabled
          message="Table booking opens at 11am."
        />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/slot-picker 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./slot-picker`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/slot-picker/slot-picker.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { useId } from "react";

import type { FieldStatus } from "../../lib/field-status";

import { joinIds } from "../../lib/choice-control";
import { componentVariants } from "../../lib/component-variants";
import { FieldMessage, hasFieldMessage } from "../../lib/field-message";

const slotPicker = componentVariants({
  slots: {
    // `group/slot-picker` lets the legend mute while the fieldset is disabled (dev parity).
    root: "group/slot-picker m-0 grid min-w-0 gap-2.5 border-0 p-0",
    legend:
      "mb-2.5 p-0 text-body-sm font-medium text-text-body group-disabled/slot-picker:text-text-subtle",
    grid: "grid gap-2.5",
    slot: "grid min-h-hit min-w-0 cursor-pointer place-items-center gap-0.5 rounded-md border border-border-default bg-surface-card px-2.5 py-2 text-center font-display text-body-sm font-bold text-ink-700 transition-colors duration-fast ease-out has-checked:border-2 has-checked:border-border-brand has-checked:bg-surface-page-alt has-checked:text-pink-700 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus has-disabled:cursor-not-allowed has-disabled:bg-surface-sunken has-disabled:text-ink-400",
    input: "sr-only",
    note: "text-slot-picker-note font-normal font-body text-text-subtle",
  },
  variants: {
    status: {
      default: {},
      error: { slot: "border-status-danger" },
      // The design system draws only the error border; dev parity paints all three statuses.
      success: { slot: "border-status-success" },
      warning: { slot: "border-status-warning" },
    },
    isSoldOut: { true: { slot: "line-through" } },
    isLegendHidden: { true: { legend: "sr-only" } },
  },
  defaultVariants: { status: "default", isSoldOut: false, isLegendHidden: false },
});

/** Full literal classes, so Tailwind finds them. `undefined` columns auto-fit instead. */
const COLUMN_CLASS = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
} as const;

export interface SlotOption {
  value: string;
  label: string;
  /** A second line, e.g. "12 min". */
  note?: string | undefined;
  /** Sold out: struck through, not hidden. */
  isDisabled?: boolean | undefined;
}

export interface SlotPickerProps extends Omit<
  ComponentProps<"fieldset">,
  "onChange" | "defaultValue"
> {
  /** The radios' shared name — what a native form posts. */
  name: string;
  legend: ReactNode;
  isLegendHidden?: boolean | undefined;
  slots: SlotOption[];
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  /** Fixed column count; omit to auto-fit at a 96px minimum. */
  columns?: keyof typeof COLUMN_CLASS | undefined;
  status?: FieldStatus | undefined;
  /**
   * The line under the slots: on the default status a neutral hint ("Slots open 30 minutes
   * ahead."), with a status its message and glyph ("Pick a slot to continue.").
   */
  message?: ReactNode;
}

/** Pickup and table-booking time slots: a grid of real radios that reflows at any width. */
export function SlotPicker({
  name,
  legend,
  isLegendHidden = false,
  slots,
  value,
  defaultValue,
  onValueChange,
  columns,
  status = "default",
  message,
  className,
  "aria-describedby": describedBy,
  ...props
}: SlotPickerProps) {
  const baseId = useId();
  const messageId = `${baseId}-message`;
  const isControlled = value !== undefined;
  const styles = slotPicker({ status, isLegendHidden });

  return (
    <fieldset
      {...props}
      aria-describedby={joinIds(
        describedBy,
        hasFieldMessage({ status, message }) ? messageId : undefined
      )}
      className={styles.root({ className })}
    >
      <legend className={styles.legend()}>{legend}</legend>
      <div
        className={styles.grid({
          className: columns === undefined ? "grid-cols-slot-picker" : COLUMN_CLASS[columns],
        })}
      >
        {slots.map((slot, index) => {
          const labelId = `${baseId}-slot-${String(index)}`;
          const noteId = `${baseId}-note-${String(index)}`;
          return (
            <label
              key={slot.value}
              data-surface="light"
              className={styles.slot({ isSoldOut: slot.isDisabled === true })}
            >
              <input
                type="radio"
                name={name}
                value={slot.value}
                disabled={slot.isDisabled}
                aria-labelledby={labelId}
                aria-describedby={slot.note === undefined ? undefined : noteId}
                aria-invalid={status === "error" ? true : undefined}
                {...(isControlled
                  ? { checked: value === slot.value }
                  : { defaultChecked: defaultValue === slot.value })}
                onChange={
                  onValueChange === undefined
                    ? undefined
                    : (event) => {
                        onValueChange(event.currentTarget.value);
                      }
                }
                className={styles.input()}
              />
              <span id={labelId}>{slot.label}</span>
              {slot.note === undefined ? null : (
                <span id={noteId} className={styles.note()}>
                  {slot.note}
                </span>
              )}
            </label>
          );
        })}
      </div>
      <FieldMessage id={messageId} status={status} message={message} />
    </fieldset>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/slot-picker 2>&1 | tail -8`
Expected: PASS (16 tests).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/slot-picker/slot-picker.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn } from "storybook/test";

import { type SlotOption, SlotPicker } from "./slot-picker";

const PICKUP: SlotOption[] = [
  { value: "asap", label: "ASAP", note: "12 min" },
  { value: "7:30pm", label: "7:30pm" },
  { value: "8:00pm", label: "8:00pm" },
  { value: "8:30pm", label: "8:30pm" },
  { value: "9pm", label: "9:00pm", isDisabled: true },
];

const meta = {
  title: "Molecules/SlotPicker",
  component: SlotPicker,
  args: { name: "pickup", legend: "Pickup time", slots: PICKUP },
  parameters: {
    docs: {
      description: {
        component:
          'Pickup and table-booking time slots — a fieldset of real radios, so it works server-rendered, posts in a native form and keeps arrow-key selection. Auto-fit grid at a 96px minimum, so it reflows on any width; `columns` fixes the count. Sold-out slots (`isDisabled`) are struck through, not hidden. `status` + `message` for "Pick a slot to continue." 44px minimum hit height. Controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`); react-hook-form binds it with `<Controller>`.',
      },
    },
  },
} satisfies Meta<typeof SlotPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "auto-fit". */
export const Playground: Story = {
  args: { defaultValue: "7:30pm", onValueChange: fn() },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByText("8:00pm"));
    await expect(canvas.getByRole("radio", { name: "8:00pm" })).toBeChecked();
    await expect(args.onValueChange).toHaveBeenCalledWith("8:00pm");
  },
};

/** Card row "error". */
export const WithError: Story = { args: { status: "error", message: "Pick a slot to continue." } };

/** Card row "disabled". */
export const Disabled: Story = { args: { disabled: true } };

/** Card row `columns={3}` — the card shows no label, so the legend is visually hidden. */
export const Columns: Story = {
  args: {
    name: "guests",
    legend: "Guests",
    isLegendHidden: true,
    columns: 3,
    defaultValue: "2",
    slots: [
      { value: "2", label: "2 guests" },
      { value: "4", label: "4 guests" },
      { value: "6", label: "6 guests" },
    ],
  },
};

/** Dev parity: every status carries a sentence — hint, warning and success beside the card's error. */
export const Statuses: Story = {
  render: (args) => (
    <div className="flex max-w-120 flex-col gap-6">
      <SlotPicker {...args} name="pickup-hint" message="Slots open 30 minutes ahead." />
      <SlotPicker
        {...args}
        name="pickup-warning"
        status="warning"
        message="That slot is nearly full."
      />
      <SlotPicker
        {...args}
        name="pickup-success"
        status="success"
        defaultValue="7:30pm"
        message="Held for you until 7:15pm."
      />
    </div>
  ),
};

/** Dev parity: the narrowest supported width — the grid reflows instead of overflowing. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-80">
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
  type SlotOption,
  SlotPicker,
  type SlotPickerProps,
} from "./molecules/slot-picker/slot-picker";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/slot-picker packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/slot-picker packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/slot-picker.json packages/design-tokens/contrast-pairs.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): SlotPicker molecule on native radios

A fieldset of real radios styled by has-checked, so a server-rendered
picker selects and posts with no JavaScript. Sold-out slots are struck
through, not hidden; a status shows its message under the grid.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

