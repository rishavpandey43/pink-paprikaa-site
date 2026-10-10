### Task 3: Select

**Files:**

- Create: `packages/ui/src/atoms/select/select.tsx`, `select.test.tsx`, `select.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/atoms/select/select.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                                | Ruling  | Where / clause                                                |
| --------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------- |
| Radix Select popover (portalled listbox, item tick, scroll buttons, `contentClassName`) | DROP    | spec §3.3 (Radix Select rejected), D7 (native `<select>`)     |
| `onValueChange(value)`                                                                  | DROP    | D17 + contracts §0: native `onChange`, so `register()` works  |
| `placeholder` defaults to "Choose one"                                                  | DROP    | D9 (no content defaults)                                      |
| bare-string options                                                                     | DROP    | spec §8.2 (object lists only)                                 |
| option `disabled`                                                                       | ALREADY | contract `SelectOption.isDisabled`; Step 2 first test         |
| placeholder until chosen; a value wins                                                  | ALREADY | Step 2                                                        |
| opens and picks from pointer and keyboard                                               | ALREADY | native select; Step 2 register() test (Tab + `selectOptions`) |
| fixed heights                                                                           | ALREADY | Task 2's `FieldControl`                                       |
| status border; its glyph replaces the chevron                                           | ALREADY | Step 2                                                        |
| `aria-invalid` on error only (warning is not invalid)                                   | ADD     | Step 2 invalid test                                           |
| leading icon                                                                            | ALREADY | Step 2                                                        |
| read-only cannot open + lock                                                            | ALREADY | Step 2 (disabled + lock)                                      |
| disabled: real grey fill, never opacity                                                 | ADD     | Step 2 new test                                               |
| `id` for Field's label (`htmlFor`), plus describedby / required                         | ADD     | Step 2 new test                                               |
| caller `className` on the box, replacing a conflict                                     | ADD     | Step 2 new test                                               |
| axe over placeholder, icon + error, disabled                                            | ADD     | Step 2 a11y test (adds disabled and read-only)                |
| `icon` control off in Storybook                                                         | ADD     | Step 6 `argTypes`                                             |
| sizes story shows md too                                                                | ADD     | Step 6 `Sizes`                                                |
| a disabled option in a story                                                            | ADD     | Step 6 `SLOTS`                                                |
| stories chosen / statuses / read-only + disabled                                        | ALREADY | Step 6                                                        |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `FieldControl` (Task 2), `FieldStatus`, `IconComponent`, `fakeRegister`, `OnSurfaces` (Plan 2a).
- Produces: `Select`, `SelectProps`, `SelectOption` as contract §3, plus `readOnly?: boolean` (deviation 1).

- [ ] **Step 1: Component tokens**

None new: Select sits in Task 2's field box (`field.json`, `control.json`). No new list names, no new contrast pair.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/select/select.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Users } from "lucide-react";

import { expectNoA11yViolations, fakeRegister } from "../../../vitest.setup";
import { Select } from "./select";

const SLOTS = [
  { value: "19:30", label: "7:30pm" },
  { value: "20:00", label: "8:00pm" },
  { value: "20:30", label: "8:30pm", isDisabled: true },
];

describe("Select", () => {
  it("is a native select inside Input's field box", () => {
    render(<Select aria-label="Pickup time" options={SLOTS} />);
    const select = screen.getByRole("combobox", { name: "Pickup time" });
    expect(select.tagName).toBe("SELECT");
    expect(select.parentElement).toHaveAttribute("data-surface", "light");
    expect(select.parentElement).toHaveClass("h-field-md", "rounded-md", "border-border-default");
    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
      "7:30pm",
      "8:00pm",
      "8:30pm",
    ]);
    expect(screen.getByRole("option", { name: "8:30pm" })).toBeDisabled();
  });

  it("starts on a disabled placeholder until the guest chooses", () => {
    render(<Select aria-label="Guests" placeholder="Choose a size" options={SLOTS} />);
    expect(screen.getByRole("option", { name: "Choose a size" })).toBeDisabled();
    expect(screen.getByRole("combobox")).toHaveValue("");
  });

  it("keeps a given value over the placeholder", () => {
    render(
      <Select
        aria-label="Pickup time"
        placeholder="Choose a slot"
        defaultValue="20:00"
        options={SLOTS}
      />
    );
    expect(screen.getByRole("combobox")).toHaveValue("20:00");
  });

  it("takes react-hook-form's register(): ref, name, onChange and onBlur reach the native select", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("slot");
    render(<Select aria-label="Pickup time" options={SLOTS} {...field} />);
    const select = screen.getByRole("combobox", { name: "Pickup time" });

    expect(field.ref).toHaveBeenCalledWith(select);
    expect(select).toHaveAttribute("name", "slot");
    await user.tab();
    expect(select).toHaveFocus();
    await user.selectOptions(select, "8:00pm");
    expect(field.onChange).toHaveBeenCalledTimes(1);
    expect(select).toHaveValue("20:00");
    await user.tab();
    expect(field.onBlur).toHaveBeenCalledTimes(1);
  });

  it("rests with a chevron", () => {
    const { container } = render(<Select aria-label="Outlet" options={SLOTS} />);
    expect(container.querySelector(".lucide-chevron-down")).toBeInTheDocument();
  });

  it.each([
    ["error", "border-status-danger", ".lucide-circle-alert"],
    ["success", "border-status-success", ".lucide-circle-check"],
    ["warning", "border-status-warning", ".lucide-triangle-alert"],
  ] as const)("shows %s with its glyph in place of the chevron", (status, border, glyph) => {
    const { container } = render(<Select aria-label="Outlet" status={status} options={SLOTS} />);
    expect(screen.getByRole("combobox").parentElement).toHaveClass("border-2", border);
    expect(container.querySelector(glyph)).toBeInTheDocument();
    expect(container.querySelector(".lucide-chevron-down")).not.toBeInTheDocument();
  });

  it("marks only an error invalid", () => {
    render(
      <>
        <Select aria-label="Pickup time" status="error" options={SLOTS} />
        <Select aria-label="Outlet" status="warning" options={SLOTS} />
      </>
    );
    expect(screen.getByRole("combobox", { name: "Pickup time" })).toHaveAttribute(
      "aria-invalid",
      "true"
    );
    expect(screen.getByRole("combobox", { name: "Outlet" })).not.toHaveAttribute("aria-invalid");
  });

  it("disables with a real fill, never opacity", () => {
    render(<Select aria-label="Delivery slot" disabled options={SLOTS} />);
    const select = screen.getByRole("combobox");
    expect(select).toBeDisabled();
    expect(select.parentElement).toHaveClass(
      "has-disabled:bg-ink-100",
      "has-disabled:text-ink-400"
    );
    expect(select.parentElement?.className).not.toMatch(/opacity-/);
  });

  it("puts Field's wiring on the select and className on the box", () => {
    render(
      <Select
        id="slot"
        aria-label="Pickup time"
        aria-describedby="slot-hint"
        required
        className="w-60"
        options={SLOTS}
      />
    );
    const select = screen.getByRole("combobox", { name: "Pickup time" });
    expect(select).toHaveAttribute("id", "slot");
    expect(select).toHaveAttribute("aria-describedby", "slot-hint");
    expect(select).toBeRequired();
    expect(select).not.toHaveClass("w-60");
    expect(select.parentElement).toHaveClass("w-60");
    expect(select.parentElement).not.toHaveClass("w-full");
  });

  it("locks when read-only: sunken fill, a lock, and the value cannot change", () => {
    const { container } = render(
      <Select aria-label="Outlet" readOnly defaultValue="20:00" options={SLOTS} />
    );
    const select = screen.getByRole("combobox");
    expect(select).toBeDisabled();
    expect(select).toHaveValue("20:00");
    expect(select.parentElement).toHaveClass("bg-surface-sunken");
    expect(container.querySelector(".lucide-lock")).toBeInTheDocument();
    expect(container.querySelector(".lucide-chevron-down")).not.toBeInTheDocument();
  });

  it("clears a leading icon with its text inset", () => {
    const { container } = render(<Select aria-label="Guests" icon={Users} options={SLOTS} />);
    expect(container.querySelector(".lucide-users")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveClass("ps-11");
    expect(screen.getByRole("combobox")).not.toHaveClass("ps-3.5");
  });

  it("never lets a long option label widen its box: it overlays the box and truncates", () => {
    render(
      <Select
        aria-label="Outlet"
        options={[
          {
            value: "57",
            label: "Sector 57, HSVP Market (MKM Market), Gurgaon 122003 — the pickup counter",
          },
        ]}
      />
    );
    const select = screen.getByRole("combobox");
    expect(select).toHaveClass("absolute", "inset-0", "size-full", "truncate");
    expect(select.parentElement).toHaveClass("w-full", "min-w-0");
  });

  it("has no accessibility violations with an icon, a placeholder and an error, disabled or read-only", async () => {
    const { container } = render(
      <>
        <Select
          aria-label="Guests"
          icon={Users}
          placeholder="Choose a size"
          status="error"
          options={SLOTS}
        />
        <Select aria-label="Delivery slot" disabled options={SLOTS} />
        <Select aria-label="Outlet" readOnly defaultValue="20:00" options={SLOTS} />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './select'`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/select/select.tsx`:

```tsx
import type { ComponentProps } from "react";

import { ChevronDown } from "lucide-react";

import type { FieldStatus } from "../../lib/field-status";
import type { IconComponent } from "../icon/icon";

import { FieldControl } from "../../lib/field-control";

export interface SelectOption {
  value: string;
  label: string;
  isDisabled?: boolean | undefined;
}

export interface SelectProps extends Omit<ComponentProps<"select">, "size" | "children"> {
  options: SelectOption[];
  /** A disabled first option, shown until something is chosen. */
  placeholder?: string | undefined;
  size?: "sm" | "md" | "lg" | undefined;
  /** The status glyph replaces the chevron; Field shows the message. */
  status?: FieldStatus | undefined;
  icon?: IconComponent | undefined;
  /**
   * Locked but readable: sunken fill and a lock. A native select cannot be read-only, so it is
   * rendered disabled — and, like any disabled control, not submitted.
   */
  readOnly?: boolean | undefined;
}

/**
 * The platform `<select>` in Input's field box (spec D7): same heights, radius, status colours and
 * glyphs. For short, known lists — outlet, table size, pickup slot. `className` styles the box;
 * every other prop, `register()` included, lands on the native select.
 */
export function Select({
  options,
  placeholder,
  size = "md",
  status = "default",
  icon,
  readOnly = false,
  disabled,
  value,
  defaultValue,
  className,
  ...props
}: SelectProps) {
  const initialValue =
    value === undefined && defaultValue === undefined && placeholder !== undefined
      ? ""
      : defaultValue;

  return (
    <FieldControl
      control="select"
      size={size}
      status={status}
      icon={icon}
      isReadOnly={readOnly}
      affordance={ChevronDown}
      className={className}
    >
      {(controlClassName) => (
        <select
          className={controlClassName}
          value={value}
          defaultValue={initialValue}
          disabled={disabled === true || readOnly}
          aria-invalid={status === "error" ? true : undefined}
          {...props}
        >
          {placeholder === undefined ? null : (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.isDisabled}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldControl>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories (card parity with `Select.card.html`; docs from `Select.prompt.md`)**

`packages/ui/src/atoms/select/select.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Users } from "lucide-react";
import { expect } from "storybook/test";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Select } from "./select";

const OUTLETS = [{ value: "sector-57", label: "Sector 57, Gurgaon" }];
const GUESTS = [
  { value: "2", label: "2 guests" },
  { value: "4", label: "4 guests" },
  { value: "6", label: "6 guests" },
];
const SLOTS = [
  { value: "19:30", label: "7:30pm" },
  { value: "20:00", label: "8:00pm" },
  { value: "20:30", label: "8:30pm", isDisabled: true },
];

const meta = {
  title: "Atoms/Select",
  component: Select,
  args: { "aria-label": "Pick your outlet", options: OUTLETS },
  argTypes: { icon: { control: false } },
  render: (args) => (
    <div className="max-w-text-measure-prose w-full">
      <Select {...args} />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Dropdown for short, known lists — outlet, table size, pickup slot. Matches Input exactly: the same heights, radius, status colours and glyphs (the status glyph replaces the chevron), `disabled`, and `readOnly` (sunken fill + lock). It is the platform's `<select>`, so phones get their own picker. For more than ~12 options use a searchable list instead. Label and message belong to Field.",
      },
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Rest: Story = { name: "rest", args: { defaultValue: "sector-57" } };

export const PlaceholderAndIcon: Story = {
  name: "placeholder + icon",
  args: { "aria-label": "Guests", icon: Users, placeholder: "Choose a size", options: GUESTS },
};

export const StatusError: Story = {
  name: "error",
  args: { "aria-label": "Time", placeholder: "Choose a slot", status: "error", options: SLOTS },
};

export const StatusSuccess: Story = {
  name: "success",
  args: { "aria-label": "Outlet", status: "success" },
};

export const StatusWarning: Story = {
  name: "warning",
  args: { "aria-label": "Outlet", status: "warning" },
};

export const ReadOnlyAndDisabled: Story = {
  name: "readOnly / disabled",
  render: () => (
    <div className="max-w-text-measure-prose grid w-full gap-3">
      <Select aria-label="Outlet" readOnly options={OUTLETS} />
      <Select
        aria-label="Delivery slot"
        disabled
        options={[{ value: "none", label: "Not available yet" }]}
      />
    </div>
  ),
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="max-w-text-measure-prose grid w-full gap-3">
      <Select aria-label="Outlet, small" size="sm" options={OUTLETS} />
      <Select aria-label="Outlet, medium" size="md" options={OUTLETS} />
      <Select aria-label="Outlet, large" size="lg" options={OUTLETS} />
    </div>
  ),
};

/** Review focus 2: a long label truncates inside the box; the box never outgrows a 360px phone. */
export const LongLabelAt360: Story = {
  name: "long option label at 360px",
  args: {
    "aria-label": "Pick your outlet",
    options: [
      {
        value: "57",
        label: "Sector 57, HSVP Market (MKM Market), Gurgaon 122003 — the pickup counter",
      },
    ],
  },
  render: (args) => (
    <div data-testid="frame" className="w-90">
      <Select {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const frame = canvas.getByTestId("frame");
    const box = canvas.getByRole("combobox", { name: "Pick your outlet" }).parentElement;
    await expect(box?.getBoundingClientRect().width).toBeLessThanOrEqual(
      frame.getBoundingClientRect().width
    );
    await expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth);
  },
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Select aria-label="Guests" icon={Users} placeholder="Choose a size" options={GUESTS} />
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { Select, type SelectOption, type SelectProps } from "./atoms/select/select";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/select
```

Run the gate, then the story tests (this task adds a `play`): `pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache 2>&1 | tail -10`. Expected: both green; `Atoms/Select › long option label at 360px` passes.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui
git commit -m "feat(ui): add the Select atom in Input's field box

A native select overlaying the shared field box: a click anywhere opens it,
a long option label truncates instead of widening the layout (measured at
360px by a story play), and the status glyph replaces the chevron. readOnly
renders the lock and the sunken fill; a native select cannot be read-only,
so it is disabled.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

