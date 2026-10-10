### Task 2: Field

Design-system sources: `components/molecules/Field.{jsx,d.ts,card.html,prompt.md}`. Card rows: stack + hint · required · error · success · `layout="side"` (translated to `orientation="side"`).

**Files:**

- Create: `packages/design-tokens/tokens/component/field-layout.json`
- Create: `packages/ui/src/molecules/field/field.tsx`, `field.test.tsx`, `field.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/field/field.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                               | Ruling  | Where / why                                                                                                       |
| -------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| `side` splits into two columns from 480px (`sm`) only; stacks on a 360px screen        | ADD     | `side` variant `sm:grid-cols-field-side` / `sm:pt-3.25` + side test                                               |
| label mutes while the control is disabled (`status="disabled"` on dev)                 | ADD     | CSS, no prop: `group/form-field` + `group-has-disabled/form-field:text-text-subtle` + test + `ControlModes` story |
| required marker is brand-coloured                                                      | ADD     | class assertion in the required test                                                                              |
| caller `className` replaces the root gap                                               | ADD     | test "merges a caller className…"                                                                                 |
| story states readOnly / loading / disabled / multiline notes                           | ADD     | `ControlModes` story (the modes are the control's props)                                                          |
| error message `role="alert"`; message on `default` status shown neutral                | ADD     | Task 1 `FieldMessage`                                                                                             |
| `status` values `loading` / `disabled` / `readOnly` (+ loading-diamond message)        | DROP    | contracts §1 `FieldStatus` has four values; modes are control props (spec §8.2)                                   |
| label as plain text when no `htmlFor`; `AroundABareControl` story (Field around chips) | DROP    | spec §9.2 render-prop wiring always labels one control; groups carry their own legend + message (deviation 1)     |
| `side` collapses to `stack` without a label                                            | ALREADY | `label` is required by type                                                                                       |
| `layout` / `htmlFor` props                                                             | ALREADY | renamed `orientation` / `id` (contracts §5, deviation 9)                                                          |
| hint; message replaces hint; per-status colour + one glyph; optional; hidden `*`       | ALREADY | tests "describes…", "replaces the hint…", `it.each` success/warning, "marks an optional…", "marks a required…"    |
| message id the control points at                                                       | ALREADY | wired automatically by the render prop (`aria-describedby`)                                                       |
| axe over required, error, side + optional                                              | ALREADY | axe test (rest + error)                                                                                           |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `FieldMessage`, `hasFieldMessage` (Task 1); `FieldStatus` (Plan 2b); `fakeRegister` (Plan 2b, `vitest.setup.ts`); `Input`, `Select` (Plan 2b, tests and stories only).
- Produces: `Field`, `FieldProps`, `FieldControlProps` — contract §5 (`id` names the control, deviation 9). Render prop: `children(control)` receives `{ id }` plus `"aria-describedby"`, `"aria-invalid": true` and `required: true` **only when each applies** — a key that does not apply is absent, never `undefined`, so a control that spreads the caller's props after its own (`{...own, ...props}`) never loses its own `aria-invalid` to Field's silence.

- [ ] **Step 1: Component token**

`packages/design-tokens/tokens/component/field-layout.json` (Plan 2b's `field.json` holds the field box; this file holds the Field molecule's layout):

```json
{
  "grid-template-columns": {
    "field-side": {
      "$value": "minmax(0, 160px) minmax(0, 1fr)",
      "$description": "Field orientation=\"side\": the design system's 160px label column beside the control. Utility: grid-cols-field-side."
    }
  }
}
```

(`grid-template-columns` is a Tailwind v4 theme namespace — `grid-cols-*` reads `--grid-template-columns-*` — and not one of the scale lists `component-variants.ts` declares, so no list changes.)

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && rtk proxy grep -n "grid-template-columns-field-side" packages/design-tokens/dist/theme.css`
Expected: `--grid-template-columns-field-side: minmax(0, 160px) minmax(0, 1fr);`

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/field/field.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations, fakeRegister } from "../../../vitest.setup";
import { Input } from "../../atoms/input/input";
import { Field, type FieldControlProps } from "./field";

function renderInput(control: FieldControlProps) {
  return <input {...control} />;
}

describe("Field", () => {
  it("labels the control and hands it only the keys that apply", () => {
    const children = vi.fn(renderInput);
    render(<Field label="Mobile number">{children}</Field>);
    const input = screen.getByRole("textbox", { name: "Mobile number" });
    // Keys, not values: `toHaveBeenCalledWith` would treat an `undefined` key as absent.
    expect(Object.keys(children.mock.calls[0]?.[0] ?? {})).toEqual(["id"]);
    expect(children.mock.calls[0]?.[0].id).toBe(input.id);
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toBeRequired();
  });

  it("describes the control with its hint", () => {
    render(
      <Field label="Outlet" hint="Pickup only for now.">
        {renderInput}
      </Field>
    );
    expect(screen.getByRole("textbox", { name: "Outlet" })).toHaveAccessibleDescription(
      "Pickup only for now."
    );
  });

  it("replaces the hint with the error message, marks the control invalid and shows the glyph", () => {
    const { container } = render(
      <Field
        label="How spicy?"
        hint="You can change this later."
        status="error"
        message="Pick a heat level."
      >
        {renderInput}
      </Field>
    );
    const input = screen.getByRole("textbox", { name: "How spicy?" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Pick a heat level.");
    expect(screen.queryByText("You can change this later.")).not.toBeInTheDocument();
    expect(container.querySelector("p svg")).toBeInTheDocument();
  });

  it.each(["success", "warning"] as const)(
    "shows a %s message without marking the control invalid",
    (status) => {
      render(
        <Field label="Promo code" status={status} message="PAPRIKAA50 applied.">
          {renderInput}
        </Field>
      );
      const input = screen.getByRole("textbox", { name: "Promo code" });
      expect(input).not.toHaveAttribute("aria-invalid");
      expect(input).toHaveAccessibleDescription("PAPRIKAA50 applied.");
    }
  );

  it("keeps the hint when a status has no message — never a colour without words", () => {
    render(
      <Field label="Outlet" hint="Pickup only for now." status="error">
        {renderInput}
      </Field>
    );
    expect(screen.getByRole("textbox", { name: "Outlet" })).toHaveAccessibleDescription(
      "Pickup only for now."
    );
  });

  it("marks a required control without reading the star aloud", () => {
    render(
      <Field label="Mobile number" isRequired>
        {renderInput}
      </Field>
    );
    expect(screen.getByRole("textbox", { name: "Mobile number" })).toBeRequired();
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("*")).toHaveClass("text-text-brand");
  });

  it("marks an optional control in its label", () => {
    render(
      <Field label="Promo code" isOptional>
        {renderInput}
      </Field>
    );
    expect(screen.getByRole("textbox", { name: "Promo code optional" })).not.toBeRequired();
  });

  it("gives the control the id it is asked for", () => {
    render(
      <Field label="Outlet" id="outlet">
        {renderInput}
      </Field>
    );
    expect(screen.getByRole("textbox", { name: "Outlet" })).toHaveAttribute("id", "outlet");
  });

  it("puts the label in a column beside the control from 480px up when orientation is side", () => {
    const { container } = render(
      <Field label="Outlet" orientation="side">
        {renderInput}
      </Field>
    );
    // Below `sm` it stacks: a 160px label column leaves a 360px screen's control too narrow.
    expect(container.firstElementChild).toHaveClass("sm:grid-cols-field-side");
    expect(container.firstElementChild).not.toHaveClass("grid-cols-field-side");
    expect(screen.getByText("Outlet").closest("label")).toHaveClass("sm:pt-3.25");
  });

  it("mutes the label while the control it labels is disabled", () => {
    const { container } = render(
      <Field label="Pickup time">{(control) => <input {...control} disabled />}</Field>
    );
    // jsdom cannot evaluate `:has()`; the class is the contract, the story shows the effect.
    expect(container.firstElementChild).toHaveClass("group/form-field");
    expect(screen.getByText("Pickup time").closest("label")).toHaveClass(
      "group-has-disabled/form-field:text-text-subtle"
    );
  });

  it("merges a caller className over its own gap", () => {
    const { container } = render(
      <Field label="Outlet" className="gap-6">
        {renderInput}
      </Field>
    );
    expect(container.firstElementChild).toHaveClass("gap-6");
    expect(container.firstElementChild).not.toHaveClass("gap-1.5");
  });

  it("keeps its wiring when a react-hook-form register() result is spread after it", async () => {
    const user = userEvent.setup();
    const registered = fakeRegister("phone");
    render(
      <Field label="Mobile number" status="error" message="Enter a 10-digit number." isRequired>
        {(control) => <Input {...control} {...registered} status="error" />}
      </Field>
    );
    const input = screen.getByRole("textbox", { name: "Mobile number" });
    expect(input).toHaveAttribute("name", "phone");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Enter a 10-digit number.");
    expect(input).toBeRequired();
    expect(registered.ref).toHaveBeenCalledWith(input);
    await user.type(input, "9");
    await user.tab();
    expect(registered.onChange).toHaveBeenCalled();
    expect(registered.onBlur).toHaveBeenCalled();
  });

  it("has no accessibility violations at rest or in error", async () => {
    const { container } = render(
      <>
        <Field label="Outlet" hint="Pickup only for now.">
          {renderInput}
        </Field>
        <Field label="How spicy?" status="error" message="Pick a heat level." isRequired>
          {renderInput}
        </Field>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/field 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./field`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/field/field.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { useId } from "react";

import type { FieldStatus } from "../../lib/field-status";

import { componentVariants } from "../../lib/component-variants";
import { FieldMessage, hasFieldMessage } from "../../lib/field-message";

const field = componentVariants({
  slots: {
    // `group/form-field` + `group-has-disabled/form-field:` mute the label while the control is
    // disabled (dev parity) — CSS, no prop. Named apart from Plan 2b's `group/field` (the box).
    root: "group/form-field grid min-w-0",
    label:
      "flex items-baseline gap-1.5 text-body-sm font-medium text-text-body group-has-disabled/form-field:text-text-subtle",
    required: "text-text-brand",
    optional: "font-normal text-caption text-text-subtle",
    control: "grid min-w-0 gap-1.5",
  },
  variants: {
    orientation: {
      stack: { root: "gap-1.5" },
      // Two columns from `sm` (480px) up only; below it the field stacks (dev parity).
      side: {
        root: "sm:grid-cols-field-side gap-1.5 sm:items-start sm:gap-4",
        label: "sm:pt-3.25",
      },
    },
  },
  defaultVariants: { orientation: "stack" },
});

/** What `children` receives: spread it onto the one control the field labels. */
export interface FieldControlProps {
  id: string;
  "aria-describedby"?: string | undefined;
  "aria-invalid"?: true | undefined;
  required?: true | undefined;
}

export interface FieldProps extends Omit<ComponentProps<"div">, "children" | "id"> {
  label: ReactNode;
  /** Helper text under the control. Replaced by `message` while a status is set. */
  hint?: ReactNode;
  status?: FieldStatus | undefined;
  /** The status message — react-hook-form's `fieldState.error?.message`, for instance. */
  message?: ReactNode;
  isRequired?: boolean | undefined;
  /** Mark the optional fields rather than starring the required ones. */
  isOptional?: boolean | undefined;
  /** `stack` puts the label above; `side` gives it a 160px column from 480px up (stacks below). */
  orientation?: "stack" | "side" | undefined;
  /** The control's id (default: generated). The wrapper itself takes no id. */
  id?: string | undefined;
  children: (control: FieldControlProps) => ReactNode;
}

/**
 * Label, control and hint or status message, wired by render prop (spec §9.2): `children`
 * receives the ids and flags to spread onto the control, so the field works in a server
 * component and with react-hook-form's `register()` spread after it.
 */
export function Field({
  label,
  hint,
  status = "default",
  message,
  isRequired = false,
  isOptional = false,
  orientation = "stack",
  id,
  className,
  children,
  ...props
}: FieldProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const messageId = `${controlId}-message`;
  const styles = field({ orientation });

  // Only the keys that apply: an absent key cannot override a control's own attribute.
  const control: FieldControlProps = { id: controlId };
  if (hasFieldMessage({ status, message, hint })) control["aria-describedby"] = messageId;
  if (status === "error") control["aria-invalid"] = true;
  if (isRequired) control.required = true;

  return (
    <div className={styles.root({ className })} {...props}>
      <label htmlFor={controlId} className={styles.label()}>
        <span>{label}</span>
        {isRequired ? (
          <span aria-hidden="true" className={styles.required()}>
            *
          </span>
        ) : null}
        {isOptional ? (
          <>
            {" "}
            <span className={styles.optional()}>optional</span>
          </>
        ) : null}
      </label>
      <div className={styles.control()}>
        {children(control)}
        <FieldMessage id={messageId} status={status} message={message} hint={hint} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/field 2>&1 | tail -8`
Expected: PASS (13 tests). If the react-hook-form test fails on `aria-invalid`, Task 0 Step 3's Input row was skipped — fix Input, not the test.

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/field/field.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Phone } from "lucide-react";

import { Input } from "../../atoms/input/input";
import { Select } from "../../atoms/select/select";
import { Field } from "./field";

const HEAT_LEVELS = [
  { value: "1", label: "Mild" },
  { value: "2", label: "Medium" },
  { value: "3", label: "Hot" },
  { value: "4", label: "Extra Hot" },
];

const meta = {
  title: "Molecules/Field",
  component: Field,
  args: {
    label: "Mobile number",
    children: (control) => <Input {...control} type="tel" icon={Phone} placeholder="98765 43210" />,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Label, bare control and hint or status message. Wrap any control that does not carry its own label — Input, Select, a custom widget. The control is wired by render prop: `children` receives `{ id, aria-describedby, aria-invalid, required }` (each only when it applies) to spread onto it, so Field works in server components and with react-hook-form's `register()` spread after it. A status (`error`, `success`, `warning`) shows its glyph and replaces the hint with `message` — never a status colour without words; pass the same `status` to the control for its border. Mark the *optional* fields rather than starring the required ones. Group controls (SlotPicker, RadioGroup) carry their own legend and message; do not wrap them.",
      },
    },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "stack + hint". */
export const StackWithHint: Story = {
  args: {
    label: "How spicy?",
    hint: "You can change this later.",
    children: (control) => <Select {...control} options={HEAT_LEVELS} defaultValue="3" />,
  },
};

/** Card row "required" — `isRequired`. */
export const Required: Story = {
  args: {
    label: "Mobile number",
    isRequired: true,
    children: (control) => <Input {...control} type="tel" icon={Phone} placeholder="98765 43210" />,
  },
};

/** Card row "error" — `status="error"` + `message`. */
export const WithError: Story = {
  args: {
    label: "How spicy?",
    status: "error",
    message: "Pick a heat level.",
    children: (control) => (
      <Select
        {...control}
        options={HEAT_LEVELS}
        placeholder="Pick one"
        status="error"
        defaultValue=""
      />
    ),
  },
};

/** Card row "success" — `status="success"` + `message`. */
export const WithSuccess: Story = {
  args: {
    label: "Promo code",
    status: "success",
    message: "PAPRIKAA50 applied.",
    children: (control) => <Input {...control} defaultValue="PAPRIKAA50" status="success" />,
  },
};

/** Warning — the handoff Dawat calculator's guest rule. */
export const WithWarning: Story = {
  args: {
    label: "Guests",
    status: "warning",
    message: "Full setup and service starts at 50 guests.",
    children: (control) => <Input {...control} type="number" defaultValue="30" status="warning" />,
  },
};

/** `isOptional` — the design system's preferred marker. */
export const Optional: Story = {
  args: {
    label: "Promo code",
    isOptional: true,
    children: (control) => <Input {...control} placeholder="PAPRIKAA50" />,
  },
};

/** Card row `layout="side"` — `orientation="side"`: a 160px label column from 480px up; it stacks below. */
export const Side: Story = {
  args: {
    label: "Outlet",
    orientation: "side",
    hint: "Pickup only for now.",
    children: (control) => <Input {...control} defaultValue="Sector 57" />,
  },
};

/** Dev parity: the control's own modes inside a Field — read-only, loading, disabled (label mutes). */
export const ControlModes: Story = {
  render: () => (
    <div className="flex max-w-120 flex-col gap-6">
      <Field label="Outlet" hint="Pickup only for now.">
        {(control) => <Input {...control} defaultValue="Sector 57" readOnly />}
      </Field>
      <Field label="Promo code" hint="Checking that code.">
        {(control) => <Input {...control} defaultValue="PAPRIKAA50" isLoading />}
      </Field>
      <Field label="Table size" hint="Table booking opens at 11am.">
        {(control) => <Input {...control} disabled placeholder="Choose a table size" />}
      </Field>
      <Field label="Notes for the kitchen" isOptional>
        {(control) => <Input {...control} isMultiline rows={3} placeholder="Less oil, no onion" />}
      </Field>
    </div>
  ),
};
```

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export { Field, type FieldControlProps, type FieldProps } from "./molecules/field/field";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/field packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/field packages/ui/src/index.ts packages/design-tokens/tokens/component/field-layout.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): Field molecule wired by render prop

Label, hint and status message around any bare control. The render prop
hands the control its id and only the aria-describedby, aria-invalid and
required that apply, so Field is RSC-safe and a react-hook-form register()
spread keeps them.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

