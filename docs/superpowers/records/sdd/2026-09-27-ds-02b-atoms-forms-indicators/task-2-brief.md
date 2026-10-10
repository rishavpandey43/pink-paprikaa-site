### Task 2: Input — and the shared field box

**Files:**

- Create: `packages/design-tokens/tokens/component/field.json`, `packages/design-tokens/tokens/component/control.json`
- Create: `packages/ui/src/lib/field-control.tsx`
- Create: `packages/ui/src/atoms/input/input.tsx`, `input.test.tsx`, `input.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/atoms/input/input.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                              | Ruling  | Where / clause                                                                                                             |
| --------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------- |
| input `type` defaults to `"text"`                                     | ADD     | Step 4 `input.tsx` (`type="text"` before the spread); Step 2 first test                                                    |
| typing reaches `onChange`                                             | ALREADY | Step 2 register() test                                                                                                     |
| no typing while disabled (`onChange` silent)                          | ADD     | Step 2 disabled test                                                                                                       |
| fixed heights 40 / 48 / 56                                            | ALREADY | Step 2 size test (`h-field-*`)                                                                                             |
| status: 2px border + trailing glyph                                   | ALREADY | Step 2 status test                                                                                                         |
| `aria-invalid` on error only                                          | ALREADY | Step 2                                                                                                                     |
| leading icon, mono suffix, `trailing` slot                            | ALREADY | Step 2                                                                                                                     |
| multiline: textarea, `rows`, drag-resizable                           | ALREADY | Step 2                                                                                                                     |
| loading: pulsing mark on the trailing edge                            | ALREADY | Step 2 (SymbolMark + `aria-busy`)                                                                                          |
| read-only: lock + sunken fill                                         | ALREADY | Step 2                                                                                                                     |
| disabled: real grey fill, never opacity                               | ALREADY | Step 2 (+ no-`opacity-` assertion added)                                                                                   |
| disabled wins over a status (dev: 1px subtle border)                  | ALREADY | `has-disabled:border-border-subtle` out-specifies the status colour; the width stays 2px as `Input.jsx` draws it (spec D2) |
| caller `className` replaces a conflicting class                       | ALREADY | Step 2 (`w-60` replaces `w-full`)                                                                                          |
| glyphs and mark shrink to 16px at size sm                             | DROP    | `Input.jsx` draws the icon, glyph and 18px mark at one size for every field size (spec D2)                                 |
| axe over rest, error, read-only and multiline                         | ADD     | Step 2 second a11y test                                                                                                    |
| `icon` / `trailing` controls off in Storybook                         | ADD     | Step 6 `argTypes`                                                                                                          |
| stories: sizes, statuses, icons, suffix + trailing, states, multiline | ALREADY | Step 6 (one story per card row)                                                                                            |
| docs: the control is label-less, Field owns label / hint / message    | ALREADY | Step 6 docs                                                                                                                |
| `onChange` typed for input and textarea                               | ALREADY | discriminated `InputProps` union                                                                                           |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `FieldStatus`, `FIELD_STATUS_ICON`, `fakeRegister` (Task 1); `SymbolMark`, `OnSurfaces`, `transition-control` (Plan 2a); `Icon`, `IconComponent`; `componentVariants`; `expectNoA11yViolations`.
- Produces: `Input`, `InputProps` exactly as contract §3; `FieldControl`, `FieldControlProps`, `fieldControlVariants` (`lib/field-control.tsx`: `children: (controlClassName: string) => ReactNode`, props `size`, `status`, `control: "input" | "select"`, `icon`, `suffix`, `trailing`, `isLoading`, `isReadOnly`, `isMultiline`, `affordance`, `className`) — Select uses it in Task 3.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/field.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "field-sm": { "$value": "40px", "$description": "Field height, size sm." },
    "field-md": {
      "$value": "48px",
      "$description": "Field height, size md — the system's field (readme §3.10)."
    },
    "field-lg": { "$value": "56px", "$description": "Field height, size lg." },
    "field-spinner": {
      "$value": "18px",
      "$description": "The pulsing mark while a field validates."
    }
  },
  "text": {
    "$type": "typography",
    "field-suffix": {
      "$value": { "fontSize": "12px" },
      "$description": "A field's trailing unit or count, set in Space Mono."
    }
  },
  "shadow": {
    "$type": "shadow",
    "field-ring-danger": {
      "$value": "0 0 0 3px {color.status.danger-soft}",
      "$description": "Focus ring of a field in error."
    },
    "field-ring-success": {
      "$value": "0 0 0 3px {color.status.success-soft}",
      "$description": "Focus ring of a field in success."
    },
    "field-ring-warning": {
      "$value": "0 0 0 3px {color.status.warning-soft}",
      "$description": "Focus ring of a field in warning."
    }
  }
}
```

`packages/design-tokens/tokens/component/control.json`:

```json
{
  "text": {
    "$type": "typography",
    "control": {
      "$value": { "fontSize": "15px" },
      "$description": "Text in a md or lg field, and the label of a checkbox, radio or switch."
    }
  }
}
```

In `packages/ui/src/lib/component-variants.ts` append to `SPACING`: `"field-sm", "field-md", "field-lg", "field-spinner"`; to `TEXT`: `"control", "field-suffix"`; to `SHADOW`: `"field-ring-danger", "field-ring-success", "field-ring-warning"`.

The box's paddings and gaps are quarter steps: 14px inline padding `px-3.5`, 10px between icon, text and glyphs `gap-2.5`, and Select's 44px text inset that clears a leading icon (14 + 20 + 10) `ps-11` / `pe-11`.

Contrast: no new pair. A field paints `text-text-body`, `text-text-subtle` (placeholder, suffix) on `bg-surface-card` / `bg-surface-sunken` inside its own light island — already in the `light-text` group. Disabled text (`ink-400` on `ink-100`) is exempt (WCAG 1.4.3).

Run `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache` and confirm `dist/theme.css` contains `--spacing-field-md: 48px;`, `--text-control: 15px;` and `--shadow-field-ring-danger: 0 0 0 3px #FCE9E9;`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/input/input.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Phone } from "lucide-react";

import { expectNoA11yViolations, fakeRegister } from "../../../vitest.setup";
import { ARTWORK } from "../../lib/brand-artwork";
import { Input } from "./input";

/** The brand mark (Plan 2a's SymbolMark) is the only SVG drawn with the symbol's viewBox. */
const markIn = (root: HTMLElement) =>
  root.querySelector(`svg[viewBox="${ARTWORK.symbol.viewBox}"]`);

describe("Input", () => {
  it("is a md text field on its own light island by default", () => {
    render(<Input aria-label="Full name" />);
    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveAttribute("type", "text");
    const box = screen.getByRole("textbox", { name: "Full name" }).parentElement;
    expect(box).toHaveAttribute("data-surface", "light");
    expect(box).toHaveClass("h-field-md", "text-control", "border", "border-border-default");
  });

  it.each([
    ["sm", "h-field-sm", "text-body-sm"],
    ["md", "h-field-md", "text-control"],
    ["lg", "h-field-lg", "text-control"],
  ] as const)("renders size %s at %s with %s text", (size, height, text) => {
    render(<Input aria-label="Guests" size={size} />);
    expect(screen.getByRole("textbox").parentElement).toHaveClass(height, text);
  });

  it("takes react-hook-form's register(): ref, name, onChange and onBlur reach the native input", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("mobile");
    render(<Input aria-label="Mobile number" {...field} />);
    const input = screen.getByRole("textbox", { name: "Mobile number" });

    expect(field.ref).toHaveBeenCalledWith(input);
    expect(input).toHaveAttribute("name", "mobile");
    await user.type(input, "98");
    expect(field.onChange).toHaveBeenCalledTimes(2);
    await user.tab();
    expect(field.onBlur).toHaveBeenCalledTimes(1);
  });

  it("puts Field's wiring and native attributes on the input, and className on the box", () => {
    render(
      <Input
        id="mobile"
        aria-describedby="mobile-hint"
        type="tel"
        required
        placeholder="98765 43210"
        className="w-60"
      />
    );
    const input = screen.getByPlaceholderText("98765 43210");
    expect(input).toHaveAttribute("id", "mobile");
    expect(input).toHaveAttribute("aria-describedby", "mobile-hint");
    expect(input).toHaveAttribute("type", "tel");
    expect(input).toBeRequired();
    expect(input).not.toHaveClass("w-60");
    expect(input.parentElement).toHaveClass("w-60");
    expect(input.parentElement).not.toHaveClass("w-full");
  });

  it.each([
    ["error", "border-status-danger", ".lucide-circle-alert"],
    ["success", "border-status-success", ".lucide-circle-check"],
    ["warning", "border-status-warning", ".lucide-triangle-alert"],
  ] as const)(
    "shows %s with a 2px border and its glyph — never by colour alone",
    (status, border, glyph) => {
      const { container } = render(<Input aria-label="Promo code" status={status} />);
      expect(screen.getByRole("textbox").parentElement).toHaveClass("border-2", border);
      expect(container.querySelector(glyph)).toBeInTheDocument();
    }
  );

  it("marks only an error invalid for assistive tech", () => {
    render(
      <>
        <Input aria-label="Card" status="error" />
        <Input aria-label="Promo code" status="success" />
      </>
    );
    expect(screen.getByRole("textbox", { name: "Card" })).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("textbox", { name: "Promo code" })).not.toHaveAttribute("aria-invalid");
  });

  it("locks a read-only field with a sunken fill and a lock, still focusable and readable", async () => {
    const user = userEvent.setup();
    const { container } = render(<Input aria-label="Outlet" defaultValue="Sector 57" readOnly />);
    const input = screen.getByRole("textbox", { name: "Outlet" });
    expect(input.parentElement).toHaveClass("bg-surface-sunken");
    expect(container.querySelector(".lucide-lock")).toBeInTheDocument();
    await user.tab();
    expect(input).toHaveFocus();
    expect(input).toHaveValue("Sector 57");
  });

  it("lets a status glyph win over the lock", () => {
    const { container } = render(<Input aria-label="Outlet" readOnly status="warning" />);
    expect(container.querySelector(".lucide-triangle-alert")).toBeInTheDocument();
    expect(container.querySelector(".lucide-lock")).not.toBeInTheDocument();
  });

  it("pulses the brand mark in place of the glyph while loading, and reports busy", () => {
    const { container } = render(<Input aria-label="Promo code" status="error" isLoading />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-busy", "true");
    expect(markIn(container)).toHaveClass(
      "size-field-spinner",
      "text-pink-500",
      "motion-safe:animate-mark-pulse"
    );
    expect(container.querySelector(".lucide-circle-alert")).not.toBeInTheDocument();
  });

  it("disables through the native attribute, painted with a real fill (never opacity)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input aria-label="Delivery address" disabled onChange={onChange} />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
    expect(input.parentElement).toHaveClass("has-disabled:bg-ink-100", "has-disabled:text-ink-400");
    expect(input.parentElement?.className).not.toMatch(/opacity-/);
    await user.type(input, "98");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders a leading icon, a mono suffix and a trailing slot", () => {
    const { container } = render(
      <Input
        aria-label="Table size"
        icon={Phone}
        suffix="guests"
        trailing={<button type="button">Check</button>}
      />
    );
    expect(container.querySelector(".lucide-phone")).toBeInTheDocument();
    expect(screen.getByText("guests")).toHaveClass("font-mono", "text-field-suffix");
    expect(screen.getByRole("button", { name: "Check" })).toBeInTheDocument();
  });

  it("becomes a vertically resizable textarea, four rows by default", () => {
    render(<Input aria-label="Notes for the kitchen" isMultiline />);
    const textarea = screen.getByRole("textbox", { name: "Notes for the kitchen" });
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveAttribute("rows", "4");
    expect(textarea).toHaveClass("resize-y");
    expect(textarea.parentElement).toHaveClass("h-auto", "items-start");
  });

  it("takes register() on the textarea too", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("notes");
    render(<Input aria-label="Notes" isMultiline rows={3} {...field} />);
    const textarea = screen.getByRole("textbox", { name: "Notes" });
    expect(field.ref).toHaveBeenCalledWith(textarea);
    expect(textarea).toHaveAttribute("rows", "3");
    await user.type(textarea, "x");
    expect(field.onChange).toHaveBeenCalledTimes(1);
  });

  it("has no accessibility violations in its richest state", async () => {
    const { container } = render(
      <Input aria-label="Mobile number" icon={Phone} status="error" suffix="+91" isLoading />
    );
    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations at rest, read-only and multiline", async () => {
    const { container } = render(
      <>
        <Input aria-label="Full name" />
        <Input aria-label="Outlet" defaultValue="Sector 57" readOnly />
        <Input aria-label="Notes for the kitchen" isMultiline />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './input'`.

- [ ] **Step 4: Implement**

`packages/ui/src/lib/field-control.tsx`:

```tsx
import type { ReactNode } from "react";

import { Lock } from "lucide-react";

import { Icon, type IconComponent } from "../atoms/icon/icon";
import { componentVariants } from "./component-variants";
import { FIELD_STATUS_ICON, type FieldStatus } from "./field-status";
import { SymbolMark } from "./symbol-mark";

/**
 * The one field box (readme §3.8, guidelines/form-states.card.html). Input and Select render their
 * native control inside it — and SearchField can — so heights, radius, the status border, the focus
 * ring, the disabled and read-only fills and the trailing glyph are shared by construction.
 *
 * Disabled is styled off the native element (`has-disabled:`), so a disabled `<fieldset>` greys
 * its fields too. Read-only cannot be (`:read-only` matches every non-editable element), so it
 * is a variant.
 */
export const fieldControlVariants = componentVariants({
  slots: {
    root: [
      "group/field transition-control relative flex w-full min-w-0 items-center gap-2.5 rounded-md border border-border-default bg-surface-card px-3.5 font-body text-text-body",
      "has-disabled:cursor-not-allowed has-disabled:border-border-subtle has-disabled:bg-ink-100 has-disabled:text-ink-400",
    ],
    icon: "text-ink-500 group-has-disabled/field:text-ink-400",
    control: "bg-transparent outline-none disabled:cursor-not-allowed",
    glyph: "ms-auto",
    spinner: "size-field-spinner ms-auto shrink-0 text-pink-500 motion-safe:animate-mark-pulse",
    suffix: "text-field-suffix shrink-0 font-mono text-text-subtle",
  },
  variants: {
    size: {
      sm: { root: "h-field-sm text-body-sm" },
      md: { root: "h-field-md text-control" },
      lg: { root: "h-field-lg text-control" },
    },
    control: {
      input: {
        control:
          "min-w-0 flex-1 self-stretch placeholder:text-text-subtle read-only:cursor-default",
      },
      select: {
        // Overlays the whole box, so a click anywhere opens it and a long option label can
        // never widen the layout — it truncates inside the box.
        control:
          "absolute inset-0 size-full cursor-pointer appearance-none truncate rounded-md ps-3.5 pe-11",
      },
    },
    isMultiline: { true: { root: "h-auto items-start py-3", control: "resize-y" } },
    isReadOnly: { true: { root: "bg-surface-sunken" } },
    hasIcon: { true: "" },
    status: {
      default: {
        root: "focus-within:border-2 focus-within:border-border-brand focus-within:shadow-focus-ring",
        icon: "group-focus-within/field:text-pink-500",
        glyph: "text-ink-500 group-has-disabled/field:text-ink-400",
      },
      error: {
        root: "focus-within:shadow-field-ring-danger border-2 border-status-danger",
        icon: "text-status-danger",
        glyph: "text-status-danger",
      },
      success: {
        root: "focus-within:shadow-field-ring-success border-2 border-status-success",
        icon: "text-status-success",
        glyph: "text-status-success",
      },
      warning: {
        root: "focus-within:shadow-field-ring-warning border-2 border-status-warning",
        icon: "text-status-warning",
        glyph: "text-status-warning",
      },
    },
  },
  compoundVariants: [
    // A select's text clears a leading icon: 14px inset + 20px icon + 10px gap.
    { control: "select", hasIcon: true, class: { control: "ps-11" } },
    { status: "default", isReadOnly: true, class: { glyph: "text-ink-400" } },
  ],
  defaultVariants: {
    size: "md",
    control: "input",
    isMultiline: false,
    isReadOnly: false,
    hasIcon: false,
    status: "default",
  },
});

interface TrailingGlyph {
  icon: IconComponent;
  size: "sm" | "md";
}

/** One precedence for every field: a status beats the lock, the lock beats a resting affordance. */
function trailingGlyph(
  status: FieldStatus,
  isReadOnly: boolean,
  affordance: IconComponent | undefined
): TrailingGlyph | undefined {
  if (status !== "default") return { icon: FIELD_STATUS_ICON[status], size: "md" };
  if (isReadOnly) return { icon: Lock, size: "sm" };
  return affordance === undefined ? undefined : { icon: affordance, size: "md" };
}

export interface FieldControlProps {
  size?: "sm" | "md" | "lg" | undefined;
  status?: FieldStatus | undefined;
  /** The native control inside: an input/textarea in the flow, or a select overlaying the box. */
  control?: "input" | "select" | undefined;
  icon?: IconComponent | undefined;
  suffix?: string | undefined;
  trailing?: ReactNode;
  /** Pulses the brand mark in place of the trailing glyph. */
  isLoading?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  isMultiline?: boolean | undefined;
  /** A resting trailing glyph (Select's chevron); a status, the lock or the loading mark replace it. */
  affordance?: IconComponent | undefined;
  className?: string | undefined;
  /** Renders the native control, given the class the box assigns it. */
  children: (controlClassName: string) => ReactNode;
}

/**
 * Sets `data-surface="light"`: a white field inside a pink or ink section restores the light tokens
 * (spec §3.2.3), so its text and its focus ring are never the dark surface's.
 */
export function FieldControl({
  size = "md",
  status = "default",
  control = "input",
  icon,
  suffix,
  trailing,
  isLoading = false,
  isReadOnly = false,
  isMultiline = false,
  affordance,
  className,
  children,
}: FieldControlProps) {
  const styles = fieldControlVariants({
    size,
    status,
    control,
    isMultiline,
    isReadOnly,
    hasIcon: icon !== undefined,
  });
  const glyph = isLoading ? undefined : trailingGlyph(status, isReadOnly, affordance);

  return (
    <div data-surface="light" className={styles.root({ className })}>
      {icon === undefined ? null : <Icon icon={icon} size="md" className={styles.icon()} />}
      {children(styles.control())}
      {isLoading ? <SymbolMark className={styles.spinner()} /> : null}
      {glyph === undefined ? null : (
        <Icon icon={glyph.icon} size={glyph.size} className={styles.glyph()} />
      )}
      {suffix === undefined ? null : <span className={styles.suffix()}>{suffix}</span>}
      {trailing}
    </div>
  );
}
```

`packages/ui/src/atoms/input/input.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import type { FieldStatus } from "../../lib/field-status";
import type { IconComponent } from "../icon/icon";

import { FieldControl } from "../../lib/field-control";

interface InputOwnProps {
  size?: "sm" | "md" | "lg" | undefined;
  /** A status raises the border to 2px, tints the icon and shows its glyph. Field shows the message. */
  status?: FieldStatus | undefined;
  /** Leading icon: the status colour, or pink while focused. */
  icon?: IconComponent | undefined;
  /** Trailing static text — a unit or a count — in Space Mono. */
  suffix?: string | undefined;
  /** Trailing element, e.g. a small button. */
  trailing?: ReactNode;
  /** Pulses the brand mark in place of the trailing glyph while the value is checked. */
  isLoading?: boolean | undefined;
}

/**
 * The text field (spec §9.1): one line, or a textarea with `isMultiline`. `readOnly` gives the
 * sunken fill and a lock; `status="error"` sets `aria-invalid`. Label, hint and message are Field's.
 * `className` styles the box; every other prop — `register()` included — lands on the native control.
 */
export type InputProps = InputOwnProps &
  (
    | ({ isMultiline?: false | undefined } & Omit<ComponentProps<"input">, "size">)
    | ({ isMultiline: true; rows?: number | undefined } & ComponentProps<"textarea">)
  );

export function Input({
  size = "md",
  status = "default",
  icon,
  suffix,
  trailing,
  isLoading = false,
  className,
  ...control
}: InputProps) {
  const box = {
    size,
    status,
    icon,
    suffix,
    trailing,
    isLoading,
    className,
    isReadOnly: control.readOnly === true,
  };
  const state = {
    "aria-invalid": status === "error" ? true : undefined,
    "aria-busy": isLoading ? true : undefined,
  };

  if (control.isMultiline === true) {
    const { isMultiline, rows = 4, ...textarea } = control;
    return (
      <FieldControl {...box} isMultiline={isMultiline}>
        {(controlClassName) => (
          <textarea rows={rows} className={controlClassName} {...state} {...textarea} />
        )}
      </FieldControl>
    );
  }

  const { isMultiline = false, ...input } = control;
  return (
    <FieldControl {...box} isMultiline={isMultiline}>
      {(controlClassName) => (
        <input type="text" className={controlClassName} {...state} {...input} />
      )}
    </FieldControl>
  );
}
```

(`isMultiline` is destructured in each branch so it never reaches the DOM; the union narrows on `control.isMultiline`, which is why the narrowing happens before the destructure.)

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS (and `component-variants.spec.ts` still passes — the new names are listed).

- [ ] **Step 6: Stories (card parity with `Input.card.html`; docs from `Input.prompt.md`)**

`packages/ui/src/atoms/input/input.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { CreditCard, Phone } from "lucide-react";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Input } from "./input";

const meta = {
  title: "Atoms/Input",
  component: Input,
  args: { "aria-label": "Full name", placeholder: "Your full name" },
  argTypes: { icon: { control: false }, trailing: { control: false } },
  render: (args) => (
    <div className="max-w-text-measure-prose w-full">
      <Input {...args} />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Single-line or multiline text field — 48px tall (40 sm / 56 lg), 10px radius, 2px status border. States: rest, hover, focus (2px pink + ring), filled, `disabled`, `readOnly` (sunken fill + lock), `isLoading` (the pulsing mark), and `status` error / success / warning — a status raises the border to 2px, tints the leading icon and shows its glyph on the right. The label, hint and status message belong to **Field** (Molecules/Field), where the message replaces the hint; labels are sentence case and error copy says what to do next, never a code. `className` sizes the box; every other prop, `register()` included, lands on the native input.",
      },
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Rest: Story = { name: "rest" };

export const FilledWithIcon: Story = {
  name: "filled + icon",
  args: { "aria-label": "Mobile number", icon: Phone, type: "tel", defaultValue: "98765 43210" },
};

export const StatusError: Story = {
  name: "error",
  args: { "aria-label": "Card", icon: CreditCard, defaultValue: "4242 4242", status: "error" },
};

export const StatusSuccess: Story = {
  name: "success",
  args: { "aria-label": "Promo code", defaultValue: "PAPRIKAA50", status: "success" },
};

export const StatusWarning: Story = {
  name: "warning",
  args: { "aria-label": "Pickup time", defaultValue: "11:25pm", status: "warning" },
};

export const Loading: Story = {
  name: "loading",
  args: { "aria-label": "Promo code", defaultValue: "CHAI20", isLoading: true },
};

export const ReadOnly: Story = {
  name: "readOnly",
  args: { "aria-label": "Outlet", defaultValue: "Sector 57", readOnly: true },
};

export const Disabled: Story = {
  name: "disabled",
  args: {
    "aria-label": "Delivery address",
    placeholder: "Delivery starts in 2027",
    disabled: true,
  },
};

export const SuffixAndTrailing: Story = {
  name: "suffix / trailing",
  args: {
    "aria-label": "Table size",
    suffix: "guests",
    placeholder: "4",
    trailing: (
      <button
        type="button"
        className="shrink-0 rounded-pill px-3 py-1 font-display text-body-sm font-bold text-text-link hover:bg-pink-50"
      >
        Check
      </button>
    ),
  },
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="max-w-text-measure-prose grid w-full gap-3">
      <Input aria-label="Small" size="sm" placeholder="sm — 40px" />
      <Input aria-label="Medium" size="md" placeholder="md — 48px" />
      <Input aria-label="Large" size="lg" placeholder="lg — 56px" />
    </div>
  ),
};

export const Multiline: Story = {
  name: "multiline",
  args: {
    "aria-label": "Any notes for the kitchen?",
    isMultiline: true,
    rows: 3,
    placeholder: "No onion, extra hot.",
  },
};

/** A field is its own light island: white, dark text and a light focus ring on every ground. */
export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Input aria-label="Mobile number" icon={Phone} placeholder="98765 43210" />
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

Add to `packages/ui/src/index.ts`:

```ts
export { Input, type InputProps } from "./atoms/input/input";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/input packages/ui/src/lib/field-control.tsx packages/ui/src/lib/component-variants.ts packages/design-tokens/tokens/component
```

Then run the gate. Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the Input atom on a shared field box

FieldControl is the one field chrome (heights, radius, 2px status border,
focus ring, disabled and read-only fills, one trailing-glyph precedence)
that Input renders its native input or textarea inside, and Select will.
Every prop but className lands on the native control, so register() works
unmodified; the box sets data-surface=light so a field on pink or ink keeps
its own tokens.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

