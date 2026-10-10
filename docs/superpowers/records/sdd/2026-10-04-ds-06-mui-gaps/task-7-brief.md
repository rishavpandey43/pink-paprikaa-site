### Task 7: Atoms A — Button, IconButton, Badge, Tag, Card, Avatar, Divider, Skeleton

**Files:** `packages/ui/src/atoms/{button,icon-button,badge,tag,card,avatar,divider,skeleton}/*.{tsx,test.tsx,stories.tsx}`

**Interfaces:** Consumes `withSx`, `Sx`, `ColorProp`, `SurfaceProp`, `SURFACE_*`. Produces: each props interface `extends BaseProps<"root">` (or `BasePropsWithColor` for Badge and Tag), with renames per Task 6.

- [ ] **Step 1: Failing tests, one block per component.** The pattern, shown for Button and Badge. Write the same three kinds of assertion for every component in the list: (a) `sx` lands on the root; (b) `sx` beats a default class of the same group; (c) every renamed value renders the old classes.

```tsx
// button.test.tsx
it("sx lands on the button and beats its own padding", () => {
  render(<Button sx={{ px: 8, mt: 4 }}>Order now</Button>);
  const b = screen.getByRole("button", { name: "Order now" });
  expect(b).toHaveClass("px-8", "mt-4");
  expect(b.className).not.toMatch(/\bpx-5\b/); // replace px-5 with Button md's actual default px class
});
// badge.test.tsx
it.each([
  [{ color: "brand", variant: "solid" }, "<old tone=brand classes>"],
  [{ color: "brand", variant: "soft" }, "<old tone=soft classes>"],
  [{ color: "neutral", variant: "solid" }, "<old tone=ink classes>"],
] as const)("%o renders the old tone's classes", (props, classes) => {
  render(<Badge {...props}>Bestseller</Badge>);
  expect(screen.getByText("Bestseller").closest("span")).toHaveClass(...classes.split(" "));
});
```
Fill each `<old … classes>` placeholder by copying the class string from the component's CURRENT variant map before you edit it. That copy is the parity contract. Run `pnpm nx test ui -- button icon-button badge tag card avatar divider skeleton` → FAIL.

- [ ] **Step 2: Implement per component.** Extend `BaseProps<…>`, destructure `sx`, pass `className: withSx(sx, className)` into the root slot call, and rename variant keys/values per Task 6 (Badge gains a `variant` axis built as `compoundVariants` from the old tone strings; Card moves brand/ink into `surface` and sets `data-surface`). Run → PASS.

- [ ] **Step 3: Call sites.** For each renamed prop: `grep -rnE "<(Badge|Tag|Card)[^>]*(tone|variant)=\"(brand|soft|ink|success|warning|danger|neutral|default)\"" packages apps --include=*.tsx --include=*.mdx` and rewrite. Run typecheck for ui + storybook → PASS.

- [ ] **Step 4: Stories.** Rename args/controls. Add an `Sx` story to Button (`sx={{ mt: 4 }}` and `sx={{ w: "full" }}`), and rename Badge's `Tones` → `Colors` (color × variant grid). Run `pnpm nx run storybook:test -- atoms/(button|icon-button|badge|tag|card|avatar|divider|skeleton)` → PASS.

- [ ] **Step 5: Commit** one commit per component: `refactor(ui): give <name> sx and the shared prop names`.

---

