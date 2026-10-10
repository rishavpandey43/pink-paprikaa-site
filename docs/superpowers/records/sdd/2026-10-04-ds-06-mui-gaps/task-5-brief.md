### Task 5: Every other layout takes `sx` and `surface`

**Files (modify each `.tsx`, `.test.tsx`, `.stories.tsx`):** `layouts/stack`, `layouts/cluster`, `layouts/auto-grid`, `layouts/container`, `layouts/section`, `layouts/post-frame`, `layouts/app-shell`

**Interfaces:**
- Consumes: `withSx`, `Sx`, `SurfaceProp`, `SURFACE_DATA`, `SURFACE_BG`.
- Produces: every layout prop interface gains `sx?: Sx | undefined`. Section and PostFrame: `tone` → `surface`. AppShell: `size` → `frame`.

| Layout | Change |
| --- | --- |
| Stack, Cluster, AutoGrid, Container | + `sx` on root |
| Section | `tone?: SectionTone` → `surface?: SurfaceProp` (same six values, same classes), + `sx` |
| PostFrame | `tone?: "brand" \| "ink" \| "soft" \| "light" \| "alt"` → `surface?: "brand" \| "ink" \| "soft" \| "page" \| "alt"` (`light` → `page`), + `sx` |
| AppShell | `size?: "phone" \| "phone-sm"` → `frame?: "phone" \| "phone-sm"`, + `sx` |

- [ ] **Step 1: Failing tests.** In each layout's test file add:

```tsx
it("takes sx on its root", () => {
  render(<Stack data-testid="root" sx={{ mt: 6, px: { md: 4 } }}>x</Stack>); // use the layout under test
  expect(screen.getByTestId("root")).toHaveClass("mt-6", "md:px-4");
});
```
Section additionally gets: `render(<Section surface="brand" data-testid="s">x</Section>)` → `toHaveAttribute("data-surface", "brand")` and `toHaveClass("bg-surface-brand")`. PostFrame: `surface="page"` gives the classes `tone="light"` gave before (copy them from the current variant map into the assertion). AppShell: `frame="phone-sm"` gives the classes `size="phone-sm"` gave. Run `pnpm nx test ui -- stack cluster auto-grid container section post-frame app-shell` → FAIL.

- [ ] **Step 2: Implement.** In each root call, `className` → `className: withSx(sx, className)`, and destructure `sx`. Section: delete `SectionTone`, rename the prop and variant key to `surface`, and use `SURFACE_BG`/`SURFACE_DATA`. PostFrame: rename the key and value `light` → `page`. AppShell: rename `size` → `frame` in the props, the variant key and the JSDoc. Run → PASS.

- [ ] **Step 3: Call sites.** `grep -rnE "<Section[^>]*tone=|<PostFrame[^>]*tone=|<AppShell[^>]*size=" packages apps --include=*.tsx --include=*.mdx` → rewrite every hit. Run `pnpm nx run-many -t typecheck -p @pink-paprikaa-web/ui @pink-paprikaa-web/storybook` → PASS.

- [ ] **Step 4: Stories.** Rename the `tone`/`size` args and controls in the three stories. Add one `WithSx` story to Stack (`sx={{ p: 6, bg: "soft", radius: "lg" }}`). Run `pnpm nx run storybook:test -- layouts` → PASS.

- [ ] **Step 5: Commit** `refactor(ui): give every layout sx and a surface prop`.

- [ ] **Step 6: Batch gate 1** (see Execution in Cursor). All green → ledger line.

---

