### Task 9: Atoms C — form and remaining atoms get `sx` + native props

**Files:** `packages/ui/src/atoms/{checkbox,radio,switch,slider,input,select,rating,spice-level,diet-mark,countdown,icon,tooltip}/*`

No renames. Each component gains `sx` on its OUTERMOST element. For input-rooted components that render a wrapper label/div, that is the wrapper. Tooltip takes `sx` on its content.

- [ ] **Step 1: Failing test per component:**

```tsx
it("takes sx on its outermost element", () => {
  const { container } = render(<Checkbox label="Jain (no onion, garlic)" sx={{ mt: 4 }} />);
  expect(container.firstElementChild).toHaveClass("mt-4");
});
```
Run → FAIL.
- [ ] **Step 2: Implement** with `withSx` on the outermost class call → PASS.
- [ ] **Step 3: Commit** per component, or one commit `refactor(ui): give the form atoms sx`.
- [ ] **Step 4: Batch gate 2** → ledger.

---

