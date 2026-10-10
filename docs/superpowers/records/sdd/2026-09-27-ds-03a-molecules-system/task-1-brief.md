### Task 1: Shared internals — controllable state, field message, ref hand-off

**Files:**

- Create: `packages/ui/src/lib/use-controllable-state.ts`, `packages/ui/src/lib/use-controllable-state.test.tsx`
- Create: `packages/ui/src/lib/assign-ref.ts`, `packages/ui/src/lib/assign-ref.spec.ts`
- Create: `packages/ui/src/lib/field-message.tsx`, `packages/ui/src/lib/field-message.test.tsx`

**Dev reference:** `FieldMessage` lives in `git show dev:packages/ui/src/molecules/field/field.{tsx,test.tsx}`; `useControllableState` and `assignRef` have no dev counterpart (dev's molecules each kept their own `useState`).

**Dev parity (FieldMessage):**

| Dev item                                                                        | Ruling  | Where / why                                                                                   |
| ------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------- |
| error message is `role="alert"` (announced without focus)                       | ADD     | `FieldMessage` + test "announces an error message…"                                           |
| a `message` on the `default` status still shows, neutral, no glyph, over a hint | ADD     | `FieldMessage` / `hasFieldMessage` + test "shows a message on the default status…"            |
| renders nothing without hint or message                                         | ALREADY | test "renders nothing without a hint or a status message"                                     |
| per-status colour + glyph; message replaces hint                                | ALREADY | `it.each` status test                                                                         |
| `loading` status → Spinner beside the message; `disabled`/`readOnly` statuses   | DROP    | contracts §1 `FieldStatus` has four values; modes are control props (spec §8.2, Input/Select) |
| exported `FIELD_STATUS_TONE` map                                                | DROP    | contracts §1 exports only `FieldStatus` + `FIELD_STATUS_ICON`; tone lives in the variant      |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `componentVariants` (Plan 1), `Icon` (Plan 1), `FieldStatus` / `FIELD_STATUS_ICON` (Plan 2b).
- Produces (internal, never exported from `src/index.ts`):
  - `useControllableState<T>({ value: T | undefined; defaultValue: T; onChange?: ((value: T) => void) | undefined }): readonly [T, (next: T) => void]`
  - `assignRef<T>(ref: Ref<T> | undefined, node: T | null): void`
  - `FieldMessage({ id, status?, message?, hint?, className? })` and `hasFieldMessage({ status?, message?, hint? }): boolean`

Why these exist (handbook 03 §7 — a hook earns existence by owning a rule): `useControllableState` owns _a controlled value is never copied into state, and a change is reported once, synchronously, only when it is real_ for six molecules; `FieldMessage` owns _a status always shows its glyph and words, and replaces the hint_ (spec §3.8) for four. Radix ships a `useControllableState` in `radix-ui/internal`, but that entry point is not a public API and its uncontrolled callback fires from an effect, one render late. Everything else these molecules share already exists in the lower tiers and is reused, not redrawn (Task 0 Step 2).

- [ ] **Step 1: Write the failing tests**

`packages/ui/src/lib/use-controllable-state.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useControllableState } from "./use-controllable-state";

interface HarnessProps {
  value?: string | undefined;
  defaultValue?: string | undefined;
  onChange?: ((value: string) => void) | undefined;
}

/** One value, two buttons: one flips it, one sets it to what it already is. */
function Harness({ value, defaultValue = "off", onChange }: HarnessProps) {
  const [current, setCurrent] = useControllableState({ value, defaultValue, onChange });
  return (
    <>
      <output>{current}</output>
      <button
        type="button"
        onClick={() => {
          setCurrent(current === "off" ? "on" : "off");
        }}
      >
        Flip
      </button>
      <button
        type="button"
        onClick={() => {
          setCurrent(current);
        }}
      >
        Keep
      </button>
    </>
  );
}

describe("useControllableState", () => {
  it("keeps its own value when uncontrolled, starting from defaultValue", async () => {
    const user = userEvent.setup();
    render(<Harness defaultValue="on" />);
    expect(screen.getByRole("status")).toHaveTextContent("on");
    await user.click(screen.getByRole("button", { name: "Flip" }));
    expect(screen.getByRole("status")).toHaveTextContent("off");
  });

  it("reports every change when uncontrolled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Flip" }));
    await user.click(screen.getByRole("button", { name: "Flip" }));
    expect(onChange.mock.calls).toEqual([["on"], ["off"]]);
  });

  it("only reports when controlled — the caller's value wins until it changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<Harness value="off" onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Flip" }));
    expect(onChange).toHaveBeenCalledWith("on");
    expect(screen.getByRole("status")).toHaveTextContent("off");
    rerender(<Harness value="on" onChange={onChange} />);
    expect(screen.getByRole("status")).toHaveTextContent("on");
  });

  it.each([
    ["uncontrolled", undefined],
    ["controlled", "off"],
  ] as const)("never reports a set to the value it already holds (%s)", async (_mode, value) => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness value={value} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Keep" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
```

`packages/ui/src/lib/assign-ref.spec.ts`:

```ts
import { createRef } from "react";

import { assignRef } from "./assign-ref";

describe("assignRef", () => {
  it("calls a callback ref with the node", () => {
    const ref = vi.fn();
    const node = document.createElement("input");
    assignRef(ref, node);
    expect(ref).toHaveBeenCalledWith(node);
  });

  it("sets an object ref's current", () => {
    const ref = createRef<HTMLInputElement>();
    const node = document.createElement("input");
    assignRef(ref, node);
    expect(ref.current).toBe(node);
  });

  it("does nothing without a ref", () => {
    expect(() => {
      assignRef(undefined, null);
    }).not.toThrow();
  });
});
```

`packages/ui/src/lib/field-message.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { FieldMessage, hasFieldMessage } from "./field-message";

describe("FieldMessage", () => {
  it("renders nothing without a hint or a status message", () => {
    const { container } = render(<FieldMessage id="m" />);
    expect(container).toBeEmptyDOMElement();
    expect(hasFieldMessage({})).toBe(false);
  });

  it("renders the hint, muted, under the id a control references", () => {
    render(<FieldMessage id="m" hint="You can change this later." />);
    const hint = screen.getByText("You can change this later.");
    expect(hint).toHaveAttribute("id", "m");
    expect(hint).toHaveClass("text-text-subtle");
    expect(hasFieldMessage({ hint: "You can change this later." })).toBe(true);
  });

  it.each([
    ["error", "text-text-danger"],
    ["success", "text-text-success"],
    ["warning", "text-text-warning"],
  ] as const)("replaces the hint with the %s message and its glyph", (status, colour) => {
    const { container } = render(
      <FieldMessage id="m" status={status} message="Pick a heat level." hint="Hint." />
    );
    expect(screen.queryByText("Hint.")).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass(colour);
    expect(container.firstElementChild).toHaveAttribute("id", "m");
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("announces an error message without waiting for focus; success and warning stay polite", () => {
    const { rerender } = render(
      <FieldMessage id="m" status="error" message="That code has expired." />
    );
    expect(screen.getByRole("alert")).toHaveTextContent("That code has expired.");
    rerender(<FieldMessage id="m" status="success" message="PAPRIKAA50 applied." />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows a message on the default status in the neutral tone, without a glyph, over the hint", () => {
    const { container } = render(
      <FieldMessage id="m" message="Two slots left at 7:30pm." hint="Hint." />
    );
    expect(screen.getByText("Two slots left at 7:30pm.")).toHaveClass("text-text-subtle");
    expect(screen.queryByText("Hint.")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeInTheDocument();
    expect(hasFieldMessage({ message: "Two slots left at 7:30pm." })).toBe(true);
  });

  it("falls back to the hint when a status has no message — never a colour without words", () => {
    render(<FieldMessage id="m" status="error" hint="You can change this later." />);
    expect(screen.getByText("You can change this later.")).toHaveClass("text-text-subtle");
    expect(hasFieldMessage({ status: "error" })).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/lib 2>&1 | tail -12`
Expected: FAIL — cannot resolve `./use-controllable-state`, `./assign-ref`, `./field-message`.

- [ ] **Step 3: Implement**

`packages/ui/src/lib/use-controllable-state.ts`:

```ts
import { useState } from "react";

export interface ControllableStateOptions<T> {
  /** The caller's value. Defined = controlled: the caller owns it and the setter only reports. */
  value: T | undefined;
  /** The starting value when uncontrolled. */
  defaultValue: T;
  /** Called with every new value, controlled or not — never for a set to the current value. */
  onChange?: ((value: T) => void) | undefined;
}

/**
 * One value, controlled or uncontrolled — the Radix convention every value-based molecule follows
 * (`value` / `defaultValue` / `onValueChange`, spec §8.1). The rule it owns: a controlled value is
 * never copied into local state, an uncontrolled one is, and the change is reported synchronously,
 * once, only when the value actually changes.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: ControllableStateOptions<T>): readonly [T, (next: T) => void] {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : uncontrolled;

  function setValue(next: T): void {
    if (Object.is(next, current)) return;
    if (!isControlled) setUncontrolled(next);
    onChange?.(next);
  }

  return [current, setValue] as const;
}
```

`packages/ui/src/lib/assign-ref.ts`:

```ts
import type { Ref } from "react";

/**
 * Hands `node` to a consumer's ref, callback or object. For a component that keeps a ref of its
 * own and must still forward the caller's (React 19: `ref` is a plain prop) — SearchField returns
 * focus to its input, and react-hook-form's Controller focuses the same input on error.
 */
export function assignRef<T>(ref: Ref<T> | undefined, node: T | null): void {
  if (typeof ref === "function") {
    ref(node);
  } else if (ref !== null && ref !== undefined) {
    ref.current = node;
  }
}
```

`packages/ui/src/lib/field-message.tsx`:

```tsx
import type { ReactNode } from "react";

import { Icon } from "../atoms/icon/icon";
import { componentVariants } from "./component-variants";
import { FIELD_STATUS_ICON, type FieldStatus } from "./field-status";

const fieldMessage = componentVariants({
  base: "m-0 flex min-w-0 items-start gap-1.5 text-caption",
  variants: {
    status: {
      default: "text-text-subtle",
      error: "text-text-danger",
      success: "text-text-success",
      warning: "text-text-warning",
    },
  },
  defaultVariants: { status: "default" },
});

export interface FieldMessageContent {
  status?: FieldStatus | undefined;
  message?: ReactNode;
  hint?: ReactNode;
}

export interface FieldMessageProps extends FieldMessageContent {
  /** The id the control lists in `aria-describedby`. */
  id: string;
  className?: string | undefined;
}

function isShown(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false && node !== "";
}

/** True when `FieldMessage` renders a line — a control references its id only then. */
export function hasFieldMessage({ message, hint }: FieldMessageContent): boolean {
  return isShown(message) || isShown(hint);
}

/**
 * The line under a control — one system for every control (spec §3.8): a status (error, success,
 * warning) shows its glyph and its message in the status colour and replaces the hint; an error
 * is `role="alert"`, so it is announced without waiting for focus (dev parity). Otherwise the
 * message (or else the hint) shows, muted. A status without a message keeps the hint: never a
 * colour without words.
 */
export function FieldMessage({
  id,
  status = "default",
  message,
  hint,
  className,
}: FieldMessageProps) {
  if (status !== "default" && isShown(message)) {
    return (
      <p
        id={id}
        role={status === "error" ? "alert" : undefined}
        className={fieldMessage({ status, className })}
      >
        <Icon icon={FIELD_STATUS_ICON[status]} size="xs" className="mt-px" />
        <span className="min-w-0">{message}</span>
      </p>
    );
  }
  const text = isShown(message) ? message : hint;
  if (isShown(text)) {
    return (
      <p id={id} className={fieldMessage({ className })}>
        {text}
      </p>
    );
  }
  return null;
}
```

- [ ] **Step 4: Run to verify they pass**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/lib 2>&1 | tail -12`
Expected: PASS (the three new files plus the existing lib suites).

- [ ] **Step 5: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/lib && pnpm exec prettier --write packages/ui/src/lib
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 6: Commit**

```bash
git add -A packages/ui
git commit -m "feat(ui): shared internals for the molecules

useControllableState owns controlled/uncontrolled values for every
value-based molecule (reports once, synchronously, only on a real change);
FieldMessage owns the hint-or-status line under every control; assignRef
forwards a consumer's ref beside a component's own.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

