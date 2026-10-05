### Task 10: Molecules A — native props + ref for the compound components

**Files:** `packages/ui/src/molecules/{tabs,toast,snackbar,chip-group,filter-bar,otp-input,quantity-stepper,search-field,slot-picker}/*`, `packages/ui/src/organisms/dialog/*`

These do not extend native props today. Each gains `BaseProps<"div">` (or its real root element) + `sx`, with native props spread on the root and `ref` passed through.

- [ ] **Step 1: Failing test per component:**

```tsx
it("forwards id, data-*, aria-* and ref to its root, and takes sx", () => {
  const ref = createRef<HTMLDivElement>();
  render(<Tabs ref={ref} id="menu-tabs" data-section="mains" aria-describedby="hint" sx={{ mt: 4 }} /* + required props */ />);
  expect(ref.current).toHaveAttribute("id", "menu-tabs");
  expect(ref.current).toHaveAttribute("data-section", "mains");
  expect(ref.current).toHaveClass("mt-4");
});
```
Run → FAIL.
- [ ] **Step 2: Implement.** Radix roots accept native props: spread `...props` onto `RadixX.Root`. For components with a hidden-input or wrapper root (ChipGroup, OtpInput, QuantityStepper), the root is the outer wrapper. Keep every existing prop. Run → PASS, then each component's `storybook:test` → PASS.
- [ ] **Step 3: Commit** per component: `refactor(ui): let <name> take native props, ref and sx`.

---

