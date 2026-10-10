### Task 8: Atoms B — PriceTag, Stat-like colours, Spinner, ProgressBar, StatusDot, Logo, ImageSlot, PatternField, SocialHeadline

**Files:** `packages/ui/src/atoms/{price-tag,spinner,progress-bar,status-dot,logo,image-slot,pattern-field,social-headline}/*`

Same steps as Task 7, with these exact renames (Task 6): PriceTag/Spinner `tone`→`color` (ink→neutral), ProgressBar `tone`→`color` (mint→success), StatusDot `tone`→`status`, Logo `tone`→`color` (pink→brand, white→inverse, badge→badge), ImageSlot `tone`→`fill`, PatternField `tone`→`surface` (light→page), SocialHeadline `size`→`variant`.

- [ ] **Step 1: Failing tests** for each: (a) sx on root; (b) each old value's classes under the new prop. Example:

```tsx
it.each([["open"], ["busy"], ["closed"], ["live"], ["danger"]] as const)("status %s keeps its colour", (status) => {
  render(<StatusDot status={status} label="Open now" />);
  // copy the old tone[status] classes here before editing status-dot.tsx
});
```
Run → FAIL.
- [ ] **Step 2: Implement** per component (rename the key and values, `withSx`, `BaseProps`) → PASS.
- [ ] **Step 3: Call sites:** `grep -rnE "<(PriceTag|Spinner|ProgressBar|StatusDot|Logo|ImageSlot|PatternField)[^>]*tone=|<SocialHeadline[^>]*size=" packages apps --include=*.tsx --include=*.mdx` → rewrite → typecheck PASS.
- [ ] **Step 4: Stories** renamed → `storybook:test` for these atoms PASS.
- [ ] **Step 5: Commit** per component.

---

