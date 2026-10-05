### Task 2: Global interactions and native-UI policy

**Files:** `packages/ui/src/styles.css`, `packages/ui/src/lib/use-press.ts` (+ spec), `packages/ui/src/lib/field-control.tsx`, `packages/ui/src/lib/control-states.ts`, `packages/ui/src/molecules/field/field.tsx`, `packages/ui/src/atoms/input/input.tsx`, `packages/ui/src/atoms/avatar/avatar.tsx`, `tools/eslint-config/*` (+ its test).
**Source:** audit-foundations §Global interactions (all 12 gaps) · audit-atoms §Cross-cutting (field hover, per-variant disabled) · audit-molecules X1, X2, X5, X6.

- [ ] **Step 1: `use-press` (R139). Failing spec:**

```tsx
it("marks press on pointer and on Space/Enter, clears on release/leave/blur", async () => {
  const user = userEvent.setup();
  function T() { const p = usePress<HTMLButtonElement>(); return <button {...p.pressProps}>Add</button>; }
  render(<T />);
  const b = screen.getByRole("button", { name: "Add" });
  b.focus();
  fireEvent.keyDown(b, { key: "Enter" }); expect(b).toHaveAttribute("data-pressed");
  fireEvent.keyUp(b, { key: "Enter" });   expect(b).not.toHaveAttribute("data-pressed");
  fireEvent.keyDown(b, { key: " " });     expect(b).toHaveAttribute("data-pressed");
  fireEvent.blur(b);                       expect(b).not.toHaveAttribute("data-pressed");
  fireEvent.pointerDown(b);                expect(b).toHaveAttribute("data-pressed");
  fireEvent.pointerLeave(b);               expect(b).not.toHaveAttribute("data-pressed");
});
```
Implement: `usePress<E>()` returns `{ pressProps: { onPointerDown, onPointerUp, onPointerLeave, onKeyDown, onKeyUp, onBlur, "data-pressed": pressed ? "" : undefined } }`, composing the caller's handlers (call theirs too). It does not preventDefault. → PASS. Commit `feat(ui): add the press hook for space and enter feedback`.
- [ ] **Step 2: Base layer** (`@layer base`), each with a unit/spec or play:
  - scrollbars on `*` (`scrollbar-width: thin; scrollbar-color: var(--color-scrollbar-thumb) var(--color-scrollbar-track)`) + `::-webkit-scrollbar` rules (size, thumb, hover), from `DS/tokens/base.css:30-34`;
  - `::selection { background: var(--color-pink-100); color: var(--color-pink-800) }`;
  - search cancel/decoration hidden globally on `input[type=search]` (move them out of `@utility search-reset`);
  - number spinners hidden (`appearance: textfield` + spin buttons none).

  Play (`Foundations/Interactions`, new story `GlobalBase`): computed `scrollbarColor` on a scroll box, and the `::selection` rule present in `document.styleSheets`.
- [ ] **Step 3: Field hover + leading-icon accent (X1, X2)** in `field-control.tsx`:
  - the root gets `not-focus-within:hover:border-border-strong`, only for `status="default"` and not disabled/read-only;
  - the leading icon gets `group-focus-within/field:text-pink-500` (+ the per-status accent).

  Tests: class presence per status; none when disabled. Plays (pseudo hover, after Task 3) come later.
- [ ] **Step 4: Per-variant disabled.** `control-states.ts:13-14` stops painting `bg-ink-200` for every variant and exposes only the cursor/aria part. Each recipe (Button, IconButton, Tag; Tasks 4–5) owns its disabled paint per the audit. Test: `controlStates.disabled` has no `bg-` class.
- [ ] **Step 5: No native validation / input types / title:**
  - `field.tsx:95`: `control.required = true` → `control["aria-required"] = true` (test: no `required` attribute, `aria-required="true"`).
  - `input.tsx`: narrow `type?: "text" | "email" | "tel" | "url" | "password" | "search" | "number"`, where `number` renders `type="text" inputMode="decimal" pattern="[0-9]*[.,]?[0-9]*"` (`DS/handoff/README.md:94-95`). Tests: `type="number"` → `type="text"` + `inputmode="decimal"`; `// @ts-expect-error` for `type="date"`.
  - `avatar.tsx:71`: remove `title`; add `tooltip?: ReactNode` wrapping our Tooltip, only when the avatar is focusable (`asChild`/interactive) or `tooltip` is given. Test: no `title` attribute; with `tooltip` + focus → tooltip text appears.
- [ ] **Step 6: Lint gate.** In `tools/eslint-config`, add a workspace-wide `no-restricted-syntax` rule set (like `no-raw-hex`, with a probe test in `react.test.mjs` style) banning:
  - JSX `<select>` outside `packages/ui/src/lib/*` (Radix renders its own hidden one; ours never does);
  - `type` attribute values `date|time|datetime-local|month|week|color|file|range` on `<input>` outside `atoms/slider`;
  - the `required` attribute on DOM controls;
  - `title` on DOM elements (except `<svg><title>`);
  - `<form>` without `noValidate`.

  Probe test: each banned snippet errors; each allowed one passes. Fix every hit (`apps/storybook/src/patterns/enquiry-form.tsx` date → Task 7).
- [ ] **Step 7: Commit** per step (5 commits). **Batch gate 1.**

