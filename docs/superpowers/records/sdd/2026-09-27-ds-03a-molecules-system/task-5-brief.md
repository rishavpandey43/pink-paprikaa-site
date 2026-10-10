### Task 5: OtpInput (client)

Design-system sources: `components/molecules/OtpInput.*`. Card rows: partial · complete · success · error · disabled.

One `<input autocomplete="one-time-code" inputmode="numeric">` sits transparently over `length` decorative cells (`aria-hidden`). The platform then does the hard parts: iOS/Android SMS autofill, paste, Backspace, selection — and a screen reader meets one labelled field, not six. `onChange` strips non-digits **before** truncating to `length`, and the input has no `maxLength`, so a pasted `48-21 93` is never cut to `48-21 ` first.

**Files:**

- Create: `packages/design-tokens/tokens/component/otp-input.json`
- Create: `packages/ui/src/molecules/otp-input/otp-input.tsx`, `otp-input.test.tsx`, `otp-input.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`), `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/otp-input/otp-input.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                 | Ruling  | Where / why                                                                                                          |
| ------------------------------------------------------------------------ | ------- | -------------------------------------------------------------------------------------------------------------------- |
| filled cell takes the 2px brand border; empty stays thin                 | ADD     | test "gives a filled cell the brand border…"                                                                         |
| a status border outranks the filled border                               | ADD     | same test (the compound only paints brand on `default`)                                                              |
| `hint` line under the cells ("The code lasts 10 minutes.")               | ADD     | via `message` on the default status (Task 1 `FieldMessage`) + test + `WithHint` story; no `hint` prop (contracts §5) |
| disabled takes no typing; grey fill, never opacity                       | ADD     | disabled test                                                                                                        |
| caller `className` merges                                                | ADD     | test "merges a caller className…"                                                                                    |
| axe over a disabled code                                                 | ADD     | axe test                                                                                                             |
| `Narrow` story (six cells wrap at 360px)                                 | ADD     | `Narrow` story                                                                                                       |
| error message announced (`role="alert"`)                                 | ADD     | Task 1 `FieldMessage`                                                                                                |
| default `label` "One-time code"                                          | DROP    | spec D9; contracts §5 makes `label` required                                                                         |
| `status` `readOnly` / `disabled` / `loading` (+ loading story)           | DROP    | contracts §1 `FieldStatus`; contracts §5 has `disabled` only                                                         |
| one input per digit, "Digit N of M" names, ArrowLeft/Right between cells | DROP    | deviation 3: one `one-time-code` input behind decorative cells — one labelled field, caret moves natively            |
| native `<div>` props on the root                                         | DROP    | contracts §5 `OtpInputProps` takes `className` only                                                                  |
| `onChange(code)`                                                         | ALREADY | `onValueChange` (spec §8.2)                                                                                          |
| 6 / 4 cells; one digit per cell; whole code reported; uncontrolled       | ALREADY | tests "is one labelled code field…", "fills the cells…", "renders four cells…", "shows the caller's code…"           |
| paste spills across cells; non-digits ignored; Backspace walks back      | ALREADY | paste, letters and Backspace tests (Review Focus 1)                                                                  |
| `aria-invalid` only on error; describedby → the showing line             | ALREADY | status test                                                                                                          |
| `Default`, `FourDigits`, `PartlyEntered`, `Statuses` stories             | ALREADY | `Playground`, `Complete`, `Partial`, `Verified` / `Expired` / `Disabled`                                             |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `useControllableState`, `FieldMessage`, `hasFieldMessage` (Task 1); `fieldControlVariants` (Plan 2b — each cell is the shared field box at `size="lg"`, 56px tall, so status borders, radius, fill and transitions match every other field).
- Produces: `OtpInput`, `OtpInputProps` — contract §5 + `ref`, `onBlur` (deviation 3). Cells expose `data-state="empty" | "filled" | "active"`.

- [ ] **Step 1: Component token**

`packages/design-tokens/tokens/component/otp-input.json`:

```json
{
  "text": {
    "$type": "typography",
    "otp-digit": {
      "$value": { "fontSize": "20px", "lineHeight": 1 },
      "$description": "OtpInput cell digit, set in Space Mono (font-mono)."
    }
  }
}
```

Append `"otp-digit"` to `TEXT` in `packages/ui/src/lib/component-variants.ts`. Cells are the field box at `size="lg"` (`h-field-lg`, 56px) narrowed to `w-12` (48px, a spacing step). Rebuild tokens and run the variant spec (as in Task 4 Step 1).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/otp-input/otp-input.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { OtpInput } from "./otp-input";

function cells(container: HTMLElement): Element[] {
  return [...container.querySelectorAll("[data-state]")];
}

function cellDigits(container: HTMLElement): string[] {
  return cells(container).map((cell) => cell.textContent ?? "");
}

describe("OtpInput", () => {
  it("is one labelled code field that phones can autofill", () => {
    const { container } = render(<OtpInput label="Login code" />);
    const input = screen.getByRole("textbox", { name: "Login code" });
    expect(input).toHaveAttribute("autocomplete", "one-time-code");
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input).not.toHaveAttribute("maxlength");
    expect(cellDigits(container)).toEqual(["", "", "", "", "", ""]);
  });

  it("fills the cells in order as digits are typed, and reports the code", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(<OtpInput label="Login code" onValueChange={onValueChange} />);
    await user.type(screen.getByRole("textbox"), "482");
    expect(cellDigits(container)).toEqual(["4", "8", "2", "", "", ""]);
    expect(onValueChange).toHaveBeenLastCalledWith("482");
  });

  it("fills every cell from a pasted code, ignoring spaces and dashes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(<OtpInput label="Login code" onValueChange={onValueChange} />);
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.paste("48-21 93");
    expect(input).toHaveValue("482193");
    expect(cellDigits(container)).toEqual(["4", "8", "2", "1", "9", "3"]);
    expect(onValueChange).toHaveBeenLastCalledWith("482193");
  });

  it("drops digits past the code length from a paste", async () => {
    const user = userEvent.setup();
    render(<OtpInput label="Login code" length={4} />);
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.paste("4821 93");
    expect(input).toHaveValue("4821");
  });

  it("ignores letters and symbols typed into the field", async () => {
    const user = userEvent.setup();
    render(<OtpInput label="Login code" />);
    const input = screen.getByRole("textbox");
    await user.type(input, "4a8$");
    expect(input).toHaveValue("48");
  });

  it("deletes back across the cells with Backspace", async () => {
    const user = userEvent.setup();
    const { container } = render(<OtpInput label="Login code" length={4} />);
    await user.type(screen.getByRole("textbox"), "4821{Backspace}{Backspace}");
    expect(cellDigits(container)).toEqual(["4", "8", "", ""]);
  });

  it("marks the next empty cell active only while the field has focus", async () => {
    const user = userEvent.setup();
    const { container } = render(<OtpInput label="Login code" length={4} />);
    await user.type(screen.getByRole("textbox"), "48");
    expect(cells(container).map((cell) => cell.getAttribute("data-state"))).toEqual([
      "filled",
      "filled",
      "active",
      "empty",
    ]);
    await user.tab();
    expect(cells(container).map((cell) => cell.getAttribute("data-state"))).toEqual([
      "filled",
      "filled",
      "empty",
      "empty",
    ]);
  });

  it("shows the caller's code when controlled and only reports input", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<OtpInput label="Login code" value="12" onValueChange={onValueChange} />);
    await user.type(screen.getByRole("textbox"), "3");
    expect(onValueChange).toHaveBeenCalledWith("123");
    expect(screen.getByRole("textbox")).toHaveValue("12");
  });

  it("describes the field with its status message and marks only an error invalid", () => {
    const { rerender } = render(
      <OtpInput
        label="Login code"
        length={4}
        defaultValue="1234"
        status="error"
        message="That code has expired. Send a new one?"
      />
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("That code has expired. Send a new one?");
    rerender(
      <OtpInput
        label="Login code"
        length={4}
        defaultValue="4821"
        status="success"
        message="Verified. Signing you in."
      />
    );
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
    expect(screen.getByRole("textbox")).toHaveAccessibleDescription("Verified. Signing you in.");
  });

  it("renders four cells for a four-digit code", () => {
    const { container } = render(<OtpInput label="Login code" length={4} />);
    expect(cells(container)).toHaveLength(4);
  });

  it("gives a filled cell the brand border, and lets a status outrank it", () => {
    const { container, rerender } = render(
      <OtpInput label="Login code" length={4} defaultValue="4" />
    );
    const [first, second] = cells(container);
    expect(first).toHaveClass("border-2", "border-border-brand");
    expect(second).not.toHaveClass("border-border-brand");
    // The whole code is wrong, not one cell: the status colour wins over the filled border.
    rerender(
      <OtpInput
        label="Login code"
        length={4}
        defaultValue="4"
        status="error"
        message="That code has expired."
      />
    );
    expect(cells(container)[0]).toHaveClass("border-status-danger");
    expect(cells(container)[0]).not.toHaveClass("border-border-brand");
  });

  it("shows a hint as its message on the default status, describing the field politely", () => {
    render(<OtpInput label="Login code" message="The code lasts 10 minutes." />);
    expect(screen.getByRole("textbox")).toHaveAccessibleDescription("The code lasts 10 minutes.");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("merges a caller className over its own gap", () => {
    const { container } = render(<OtpInput label="Login code" className="gap-6" />);
    expect(container.firstElementChild).toHaveClass("gap-6");
    expect(container.firstElementChild).not.toHaveClass("gap-2");
  });

  it("gives react-hook-form's Controller a name, onBlur and a focusable ref", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLInputElement>();
    const onBlur = vi.fn();
    render(<OtpInput label="Login code" name="otp" ref={ref} onBlur={onBlur} />);
    const input = screen.getByRole("textbox");
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute("name", "otp");
    await user.click(input);
    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("takes no typing and greys every cell with a fill, never opacity, when disabled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <OtpInput
        label="Login code"
        length={4}
        defaultValue="48"
        disabled
        onValueChange={onValueChange}
      />
    );
    const input = screen.getByRole("textbox");
    await user.type(input, "2");
    expect(input).toBeDisabled();
    expect(onValueChange).not.toHaveBeenCalled();
    for (const cell of cells(container)) {
      expect(cell).toHaveClass("bg-ink-100");
      expect(cell.className).not.toMatch(/opacity-/);
    }
  });

  it("has no accessibility violations empty or in error", async () => {
    const { container } = render(
      <>
        <OtpInput label="Login code" />
        <OtpInput
          label="Confirm code"
          length={4}
          defaultValue="1234"
          status="error"
          message="That code has expired. Send a new one?"
        />
        <OtpInput label="Expired code" length={4} defaultValue="48" disabled />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/otp-input 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./otp-input`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/otp-input/otp-input.tsx`:

```tsx
"use client";

import type { ReactNode, Ref } from "react";

import { useId, useState } from "react";

import type { FieldStatus } from "../../lib/field-status";

import { componentVariants } from "../../lib/component-variants";
import { fieldControlVariants } from "../../lib/field-control";
import { FieldMessage, hasFieldMessage } from "../../lib/field-message";
import { useControllableState } from "../../lib/use-controllable-state";

const otpInput = componentVariants({
  slots: {
    root: "grid gap-2",
    field: "relative w-fit max-w-full",
    cells: "flex flex-wrap gap-2.5",
    /** Layered over the shared field box (Plan 2b): a 48×56 cell with a centred mono digit. */
    cell: "text-otp-digit w-12 justify-center px-0 font-mono text-text-heading",
    input:
      "absolute inset-0 size-full cursor-text appearance-none border-0 bg-transparent p-0 text-body text-transparent caret-transparent outline-hidden selection:bg-transparent disabled:cursor-not-allowed",
  },
  variants: {
    state: {
      empty: {},
      filled: { cell: "border-2" },
      active: { cell: "border-2 shadow-focus-ring" },
    },
    // The box's status borders come from fieldControlVariants; this only gates the compound below.
    status: { default: {}, error: {}, success: {}, warning: {} },
    isDisabled: { true: { cell: "bg-ink-100 text-ink-400" } },
  },
  compoundVariants: [
    { status: "default", state: ["filled", "active"], class: { cell: "border-border-brand" } },
  ],
  defaultVariants: { state: "empty", status: "default", isDisabled: false },
});

type CellState = "empty" | "filled" | "active";

export interface OtpInputProps {
  /** Accessible name of the code field, e.g. "Login code". */
  label: string;
  length?: 4 | 6 | undefined;
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  onBlur?: (() => void) | undefined;
  status?: FieldStatus | undefined;
  /**
   * The line under the cells: on the default status a neutral hint ("The code lasts 10
   * minutes."), with a status its message and glyph ("Verified. Signing you in.").
   */
  message?: ReactNode;
  disabled?: boolean | undefined;
  name?: string | undefined;
  className?: string | undefined;
  /** The code field — react-hook-form's Controller focuses it on error. */
  ref?: Ref<HTMLInputElement> | undefined;
}

/**
 * The mobile-OTP code — the app's only sign-in. One real input behind decorative cells: SMS
 * autofill, paste, Backspace and selection are the platform's, and assistive tech meets one field.
 * Filled cells take a 2px pink border; the cells wrap to a second row rather than overflow at 360px.
 */
export function OtpInput({
  label,
  length = 6,
  value,
  defaultValue,
  onValueChange,
  onBlur,
  status = "default",
  message,
  disabled = false,
  name,
  className,
  ref,
}: OtpInputProps) {
  const [code, setCode] = useControllableState({
    value,
    defaultValue: defaultValue ?? "",
    onChange: onValueChange,
  });
  const [isFocused, setIsFocused] = useState(false);
  const messageId = `${useId()}-message`;
  const styles = otpInput({ status, isDisabled: disabled });
  const box = fieldControlVariants({ size: "lg", status });
  const activeIndex = isFocused ? Math.min(code.length, length - 1) : -1;

  function stateOf(index: number): CellState {
    if (index === activeIndex) return "active";
    return index < code.length ? "filled" : "empty";
  }

  return (
    <div className={styles.root({ className })}>
      <div className={styles.field()}>
        <div aria-hidden="true" data-surface="light" className={styles.cells()}>
          {Array.from({ length }, (_, index) => {
            const state = stateOf(index);
            return (
              <span
                key={index}
                data-state={state}
                className={box.root({ className: styles.cell({ state }) })}
              >
                {code[index]}
              </span>
            );
          })}
        </div>
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          aria-label={label}
          aria-describedby={hasFieldMessage({ status, message }) ? messageId : undefined}
          aria-invalid={status === "error" ? true : undefined}
          name={name}
          value={code}
          disabled={disabled}
          onChange={(event) => {
            setCode(event.currentTarget.value.replace(/\D/g, "").slice(0, length));
          }}
          onFocus={() => {
            setIsFocused(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          className={styles.input()}
        />
      </div>
      <FieldMessage id={messageId} status={status} message={message} />
    </div>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/otp-input 2>&1 | tail -8`
Expected: PASS (16 tests).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/otp-input/otp-input.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn } from "storybook/test";

import { OtpInput } from "./otp-input";

const meta = {
  title: "Molecules/OtpInput",
  component: OtpInput,
  args: { label: "Login code", onValueChange: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'Mobile-OTP login code — the app\'s only sign-in method. 48×56 cells, Space Mono digits; filled cells take a 2px pink border, the next cell shows the focus ring. It is one real input (`autocomplete="one-time-code"`) behind the cells, so SMS autofill, paste (spaces and dashes are dropped) and Backspace just work. Wraps to a second row rather than overflowing on a 360px screen. `status` + `message` for verified/expired.',
      },
    },
  },
} satisfies Meta<typeof OtpInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Paste a formatted code: every cell fills with digits only. */
export const Playground: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Login code" });
    await userEvent.click(input);
    await userEvent.paste("48-21 93");
    await expect(input).toHaveValue("482193");
    await userEvent.keyboard("{Backspace}");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("48219");
  },
};

/** Card row "partial". */
export const Partial: Story = { args: { defaultValue: "482" } };

/** Card row "complete" — `length={4}`. */
export const Complete: Story = { args: { length: 4, defaultValue: "4821" } };

/** Card row "success". */
export const Verified: Story = {
  args: {
    length: 4,
    defaultValue: "4821",
    status: "success",
    message: "Verified. Signing you in.",
  },
};

/** Card row "error". */
export const Expired: Story = {
  args: {
    length: 4,
    defaultValue: "1234",
    status: "error",
    message: "That code has expired. Send a new one?",
  },
};

/** Card row "disabled". */
export const Disabled: Story = { args: { length: 4, defaultValue: "48", disabled: true } };

/** Dev parity: a neutral hint under the cells — `message` on the default status. */
export const WithHint: Story = { args: { length: 4, message: "The code lasts 10 minutes." } };

/** Dev parity: a 360px screen less its gutters (320px) — six cells wrap to a second row, never overflow. */
export const Narrow: Story = {
  args: { defaultValue: "4821" },
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
export { OtpInput, type OtpInputProps } from "./molecules/otp-input/otp-input";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/otp-input packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/otp-input packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/otp-input.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): OtpInput molecule on a single one-time-code input

One real input behind decorative cells, so SMS autofill, paste and
Backspace are the platform's. Digits are extracted before the code is cut
to length: a pasted 48-21 93 fills all six cells.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

