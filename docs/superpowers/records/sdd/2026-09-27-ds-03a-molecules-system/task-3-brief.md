### Task 3: SearchField (client)

Design-system sources: `components/molecules/SearchField.*`. Card rows: empty · with value · loading · no results · disabled · `size="sm"`.

SearchField renders inside Plan 2b's `FieldControl` — the one field box every control shares (heights, status border, focus ring, disabled and read-only fills, the status glyph and the pulsing loading mark) — made pill-shaped with the design system's 16px inset. It adds only what a search box has that a field does not: the clear button and the controlled query.

**Files:**

- Create: `packages/ui/src/molecules/search-field/search-field.tsx`, `search-field.test.tsx`, `search-field.stories.tsx`
- Modify: `packages/ui/src/styles.css` (`@utility search-reset`), `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/search-field/search-field.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                    | Ruling  | Where / why                                                                                            |
| --------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| clear button hit area 40px (`min-h-10 min-w-10`)                            | ADD     | `clear` slot `relative before:absolute before:-inset-2` (24px glyph, 40px hit) + assertion             |
| fixed heights per size (40 / 48)                                            | ADD     | `it.each` size test (`h-field-sm` / `h-field-md`, Plan 2b)                                             |
| status raises the border to 2px and hangs a trailing glyph                  | ADD     | assertions in the status test (drawn by Plan 2b's `FieldControl`)                                      |
| disabled takes no typing, grey fill, never opacity                          | ADD     | disabled test                                                                                          |
| loading shows the pulsing diamond                                           | ADD     | assertion in the loading test                                                                          |
| read-only hides the clear button                                            | ADD     | test "never offers to clear a read-only box"                                                           |
| caller `className` merges                                                   | ADD     | test "merges a caller className…"                                                                      |
| axe over a disabled `sm` box                                                | ADD     | axe test                                                                                               |
| stories: success / error / read-only statuses; `Narrow` (w-80, long query)  | ADD     | `Statuses`, `Narrow` stories                                                                           |
| `clearLabel` override (default "Clear Search")                              | DELTA   | not in contracts §5; fixed "Clear search" per deviation 15 — proposed contract delta, see the 3a audit |
| default `label` "Search the menu" and dish placeholder                      | DROP    | spec D9 (no content defaults); contracts §5 makes `label` required                                     |
| `status` `loading` / `disabled` / `readOnly`                                | DROP    | contracts §1 `FieldStatus`; `isLoading`, `disabled`, `readOnly` props cover them                       |
| separate `message` prop beside `hint`                                       | DROP    | contracts §5 SearchField has one `hint` line that becomes the status message                           |
| native `onChange` as the value API                                          | ALREADY | `onValueChange` (spec §8.2, D17)                                                                       |
| clear only with a query; `onClear` called; hidden while loading             | ALREADY | tests "offers a clear button only…", "clears, reports…", "is busy…" (shows without `onClear`, dev. 10) |
| `aria-invalid` only on error; hint replaced; describedby → the showing line | ALREADY | status and describedby tests                                                                           |
| glass turns brand on focus                                                  | ALREADY | Plan 2b `FieldControl` (`group-focus-within/field:text-pink-500`)                                      |
| `Default`, `Interactive`, `Sizes` stories                                   | ALREADY | `Playground`, `WithValue` (play), `Small`                                                              |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `useControllableState`, `assignRef`, `FieldMessage`, `hasFieldMessage` (Task 1); `FieldControl` (`lib/field-control.tsx`), `joinIds` (`lib/choice-control.tsx`) — both Plan 2b; `Icon`.
- Produces: `SearchField`, `SearchFieldProps` — contract §5 (deviation 10). Native input props (`name`, `onBlur`, `ref`, `placeholder`, `disabled`, `readOnly`, `aria-describedby`) reach the `<input type="search">`; a caller's `aria-describedby` is kept beside the hint's id.

- [ ] **Step 1: No new tokens — one named utility**

Heights are Plan 2b's field tokens (`sm` 40, `md` 48 — the design system's SearchField sizes); the clear button is `size-6` (24px, WCAG 2.5.8). Native search inputs draw their own clear button and decorations, which would double SearchField's. Append to `packages/ui/src/styles.css`, after the `z-toast` utility:

```css
/* A search input without the browser's own clear button and decorations (SearchField draws its own). */
@utility search-reset {
  appearance: none;

  &::-webkit-search-decoration,
  &::-webkit-search-cancel-button,
  &::-webkit-search-results-button,
  &::-webkit-search-results-decoration {
    appearance: none;
  }
}
```

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/search-field/search-field.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { SearchField } from "./search-field";

describe("SearchField", () => {
  it("is a named, empty search box in a pill-shaped light field", () => {
    render(<SearchField label="Search the menu" />);
    const box = screen.getByRole("searchbox", { name: "Search the menu" });
    expect(box).toHaveValue("");
    expect(box.parentElement).toHaveClass("rounded-pill", "px-4");
    expect(box.parentElement).toHaveAttribute("data-surface", "light");
  });

  it.each([
    ["sm", "h-field-sm"],
    ["md", "h-field-md"],
  ] as const)("renders the %s size at its fixed height", (size, height) => {
    render(<SearchField label="Search the menu" size={size} />);
    expect(screen.getByRole("searchbox").parentElement).toHaveClass(height);
  });

  it("keeps and reports what is typed when uncontrolled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<SearchField label="Search the menu" onValueChange={onValueChange} />);
    await user.type(screen.getByRole("searchbox"), "paneer");
    expect(screen.getByRole("searchbox")).toHaveValue("paneer");
    expect(onValueChange).toHaveBeenLastCalledWith("paneer");
  });

  it("shows the caller's value when controlled and only reports keystrokes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<SearchField label="Search the menu" value="chai" onValueChange={onValueChange} />);
    await user.type(screen.getByRole("searchbox"), "s");
    expect(onValueChange).toHaveBeenCalledWith("chais");
    expect(screen.getByRole("searchbox")).toHaveValue("chai");
  });

  it("offers a clear button only when there is something to clear", async () => {
    const user = userEvent.setup();
    render(<SearchField label="Search the menu" />);
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
    await user.type(screen.getByRole("searchbox"), "kulfi");
    const clear = screen.getByRole("button", { name: "Clear search" });
    // A 24px glyph button with a 40px hit area (dev parity; spec §5.5 floor is 24px).
    expect(clear).toHaveClass("size-6", "before:-inset-2");
  });

  it("clears, reports, notifies onClear and puts focus back in the box", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onClear = vi.fn();
    render(
      <SearchField
        label="Search the menu"
        defaultValue="paneer"
        onValueChange={onValueChange}
        onClear={onClear}
      />
    );
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    const box = screen.getByRole("searchbox");
    expect(box).toHaveValue("");
    expect(box).toHaveFocus();
    expect(onValueChange).toHaveBeenCalledWith("");
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
  });

  it("is busy, pulses the brand mark and offers no clear button while results load", () => {
    const { container } = render(
      <SearchField label="Search the menu" defaultValue="kulfi" isLoading />
    );
    expect(screen.getByRole("searchbox")).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector('[class*="animate-mark-pulse"]')).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
  });

  it("turns the hint into a status message with its glyph, and marks an error invalid", () => {
    const { container, rerender } = render(
      <SearchField
        label="Search the menu"
        defaultValue="pizza"
        status="warning"
        hint="Nothing matches that. Try another dish."
      />
    );
    const box = screen.getByRole("searchbox");
    expect(box).toHaveAccessibleDescription("Nothing matches that. Try another dish.");
    expect(box).not.toHaveAttribute("aria-invalid");
    expect(container.querySelectorAll("p svg")).toHaveLength(1);
    // The box raises its border to 2px and hangs the status glyph: glass, glyph and clear X.
    expect(box.parentElement).toHaveClass("border-2", "border-status-warning");
    expect(box.parentElement?.querySelectorAll("svg")).toHaveLength(3);
    rerender(
      <SearchField
        label="Search the menu"
        defaultValue="pizza"
        status="error"
        hint="Search is down. Try again."
      />
    );
    expect(screen.getByRole("searchbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("keeps a caller's own aria-describedby beside the hint", () => {
    render(
      <>
        <p id="scope">Searches the Sector 57 menu.</p>
        <SearchField label="Search the menu" aria-describedby="scope" hint="Try a dish name." />
      </>
    );
    expect(screen.getByRole("searchbox")).toHaveAccessibleDescription(
      "Searches the Sector 57 menu. Try a dish name."
    );
  });

  it("takes no typing and never offers to clear a disabled box, greyed by a fill, not opacity", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SearchField
        label="Search the menu"
        defaultValue="chai"
        disabled
        onValueChange={onValueChange}
      />
    );
    const box = screen.getByRole("searchbox");
    await user.type(box, "paneer");
    expect(box).toBeDisabled();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(box.parentElement?.className).not.toMatch(/opacity-/);
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
  });

  it("never offers to clear a read-only box", () => {
    render(<SearchField label="Search the menu" defaultValue="chai" readOnly />);
    expect(screen.getByRole("searchbox")).toHaveAttribute("readonly");
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
  });

  it("merges a caller className over its own gap", () => {
    const { container } = render(<SearchField label="Search the menu" className="gap-4" />);
    expect(container.firstElementChild).toHaveClass("gap-4");
    expect(container.firstElementChild).not.toHaveClass("gap-1.5");
  });

  it("forwards ref, name and onBlur for react-hook-form's Controller", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLInputElement>();
    const onBlur = vi.fn();
    render(<SearchField label="Search the menu" name="q" ref={ref} onBlur={onBlur} />);
    const box = screen.getByRole("searchbox");
    expect(ref.current).toBe(box);
    expect(box).toHaveAttribute("name", "q");
    await user.click(box);
    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("has no accessibility violations empty or with a value and a hint", async () => {
    const { container } = render(
      <>
        <SearchField label="Search the menu" />
        <SearchField
          label="Search outlets"
          size="sm"
          defaultValue="pizza"
          status="warning"
          hint="Nothing matches that."
        />
        <SearchField label="Search unavailable" size="sm" disabled />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/search-field 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./search-field`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/search-field/search-field.tsx`:

```tsx
"use client";

import type { ComponentProps, ReactNode } from "react";

import { Search, X } from "lucide-react";
import { useId, useRef } from "react";

import type { FieldStatus } from "../../lib/field-status";

import { Icon } from "../../atoms/icon/icon";
import { assignRef } from "../../lib/assign-ref";
import { joinIds } from "../../lib/choice-control";
import { componentVariants } from "../../lib/component-variants";
import { FieldControl } from "../../lib/field-control";
import { FieldMessage, hasFieldMessage } from "../../lib/field-message";
import { useControllableState } from "../../lib/use-controllable-state";

const searchField = componentVariants({
  slots: {
    root: "grid min-w-0 gap-1.5",
    /** The design system's search box is a pill with a 16px inset, not the 10px-radius field. */
    box: "rounded-pill px-4",
    input: "search-reset",
    // 24px to see, 40px to hit (`before:-inset-2`, dev parity): the pseudo-element takes the tap.
    clear:
      "relative grid size-6 shrink-0 place-items-center rounded-pill text-text-subtle transition-colors duration-fast ease-out before:absolute before:-inset-2 hover:text-text-heading",
    message: "px-4",
  },
});

export interface SearchFieldProps extends Omit<
  ComponentProps<"input">,
  "size" | "type" | "value" | "defaultValue" | "onChange"
> {
  /** Accessible name of the search box, e.g. "Search the menu". */
  label: string;
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  /** Called after the clear button empties the box. */
  onClear?: (() => void) | undefined;
  size?: "sm" | "md" | undefined;
  /** Border and glyph colour; the hint becomes the status message. */
  status?: FieldStatus | undefined;
  /** Pulses the brand mark while results load (hides the clear button). */
  isLoading?: boolean | undefined;
  /** One short line under the field, e.g. "Nothing matches that. Try another dish." */
  hint?: ReactNode;
}

/** The pill search box the site and the app share. Placeholder names real dishes, never "Search…". */
export function SearchField({
  label,
  value,
  defaultValue,
  onValueChange,
  onClear,
  size = "md",
  status = "default",
  isLoading = false,
  hint,
  disabled,
  readOnly,
  className,
  ref,
  "aria-describedby": describedBy,
  ...props
}: SearchFieldProps) {
  const [query, setQuery] = useControllableState({
    value,
    defaultValue: defaultValue ?? "",
    onChange: onValueChange,
  });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messageId = `${useId()}-message`;
  const hasMessage = hasFieldMessage({ status, message: hint, hint });
  const canClear = query !== "" && !isLoading && disabled !== true && readOnly !== true;
  const styles = searchField();

  function handleClear(): void {
    setQuery("");
    onClear?.();
    inputRef.current?.focus();
  }

  return (
    <div className={styles.root({ className })}>
      <FieldControl
        size={size}
        status={status}
        icon={Search}
        isLoading={isLoading}
        isReadOnly={readOnly === true}
        trailing={
          canClear ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={handleClear}
              className={styles.clear()}
            >
              <Icon icon={X} size="sm" />
            </button>
          ) : null
        }
        className={styles.box()}
      >
        {(controlClassName) => (
          <input
            {...props}
            ref={(node) => {
              inputRef.current = node;
              assignRef(ref, node);
            }}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.currentTarget.value);
            }}
            disabled={disabled}
            readOnly={readOnly}
            aria-label={label}
            aria-describedby={joinIds(describedBy, hasMessage ? messageId : undefined)}
            aria-invalid={status === "error" ? true : undefined}
            aria-busy={isLoading ? true : undefined}
            className={styles.input({ className: controlClassName })}
          />
        )}
      </FieldControl>
      <FieldMessage
        id={messageId}
        status={status}
        message={hint}
        hint={hint}
        className={styles.message()}
      />
    </div>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/search-field 2>&1 | tail -8`
Expected: PASS (14 tests).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/search-field/search-field.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn } from "storybook/test";

import { SearchField } from "./search-field";

const meta = {
  title: "Molecules/SearchField",
  component: SearchField,
  args: {
    label: "Search the menu",
    placeholder: "Search chai, paneer, kulfi…",
    onValueChange: fn(),
    onClear: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          'Menu search — pill-shaped, unlike the 10px-radius Input, on the same field box (status border, focus ring, loading mark). Controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`); the clear button appears whenever there is text, empties the box, calls `onClear` and returns focus to the input. Always full-width in its container with `min-width: 0`, so it never pushes a flex row wider. The placeholder names real dishes, not "Search…". `hint` sits under the field; with a `status` it becomes the status message with its glyph.',
      },
    },
  },
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "empty". */
export const Playground: Story = {};

/** Card row "with value" — type, then clear. */
export const WithValue: Story = {
  args: { defaultValue: "paneer" },
  play: async ({ args, canvas, userEvent }) => {
    const box = canvas.getByRole("searchbox", { name: "Search the menu" });
    await userEvent.type(box, " tikka");
    await expect(box).toHaveValue("paneer tikka");
    await userEvent.click(canvas.getByRole("button", { name: "Clear search" }));
    await expect(box).toHaveValue("");
    await expect(box).toHaveFocus();
    await expect(args.onClear).toHaveBeenCalledTimes(1);
  },
};

/** Card row "loading" — `isLoading`. */
export const Loading: Story = { args: { defaultValue: "kulfi", isLoading: true } };

/** Card row "no results" — `status="warning"` + `hint`. */
export const NoResults: Story = {
  args: {
    defaultValue: "pizza",
    status: "warning",
    hint: "Nothing matches that. Try another dish.",
  },
};

/** Card row "disabled". */
export const Disabled: Story = { args: { disabled: true, placeholder: "Search unavailable" } };

/** Card row `size="sm"`. */
export const Small: Story = {
  args: { size: "sm", label: "Search outlets", placeholder: "Search outlets" },
};

/** Dev parity: every status carries a sentence — success, error and read-only beside the card's warning. */
export const Statuses: Story = {
  render: (args) => (
    <div className="flex max-w-120 flex-col gap-5">
      <SearchField {...args} defaultValue="kulfi" status="success" hint="Showing 6 matches." />
      <SearchField
        {...args}
        defaultValue="chai"
        status="error"
        hint="Search is down for a moment."
      />
      <SearchField
        {...args}
        defaultValue="paneer"
        readOnly
        hint="Filtered by the outlet you picked."
      />
    </div>
  ),
};

/** Dev parity: the narrowest supported width — the pill keeps its height and a long query scrolls inside it. */
export const Narrow: Story = {
  args: { defaultValue: "paneer butter masala with extra gravy", hint: "34 dishes match." },
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
export { SearchField, type SearchFieldProps } from "./molecules/search-field/search-field";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/search-field packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/search-field packages/ui/src/index.ts packages/ui/src/styles.css
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green (the styles spec still finds no literal colour).

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui
git commit -m "feat(ui): SearchField molecule on the shared field box

Pill-shaped FieldControl with a controlled query, a clear button that
returns focus to the input, the pulsing loading mark and a status hint.
Ref, name and onBlur reach the input for react-hook-form.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

