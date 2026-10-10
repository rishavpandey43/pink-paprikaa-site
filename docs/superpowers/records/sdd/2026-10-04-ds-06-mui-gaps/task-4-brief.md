### Task 4: Box and Grid on the new API

**Files:**
- Modify: `packages/ui/src/layouts/box/box.{tsx,test.tsx,stories.tsx}`
- Finish: `packages/ui/src/layouts/grid/grid.{tsx,test.tsx}` (Task 0's WIP); Create `grid.stories.tsx`
- Modify: `packages/ui/src/index.ts`, `packages/ui/src/lib/component-variants.ts` (only if Grid adds token classes)

**Interfaces:**
- Consumes: `withSx`, `Sx` (Task 1); `SurfaceProp`, `SURFACE_DATA`, `SURFACE_BG` (Task 2).
- Produces:
```ts
type BoxElement = "div" | "section" | "article" | "aside" | "header" | "footer" | "main" | "nav" | "span" | "ul" | "ol" | "li";
export interface BoxProps extends ComponentProps<"div"> { as?: BoxElement | undefined; surface?: SurfaceProp | undefined; sx?: Sx | undefined }
export type GridSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "full";
export type GridStart = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type GridResponsive<T> = T | Partial<Record<"base" | "sm" | "md" | "lg" | "xl", T | undefined>>;
export interface GridProps extends ComponentProps<"div"> { columns?: 12 | 6 | 4 | undefined; gap?: SpaceStep | undefined; as?: "div" | "section" | "ul" | "ol" | undefined; sx?: Sx | undefined }
export interface GridItemProps extends ComponentProps<"div"> { span?: GridResponsive<GridSpan> | undefined; start?: GridResponsive<GridStart> | undefined; as?: "div" | "li" | "article" | "section" | undefined; sx?: Sx | undefined }
```

- [ ] **Step 1: Box tests (rewrite for the new API; the padding/radius/shadow/hasBorder props are removed in favour of `sx`):**

```tsx
it("renders the chosen element with sx on it", () => {
  render(<Box as="section" aria-label="Offers" sx={{ p: 6, radius: "lg", border: true }}>x</Box>);
  const box = screen.getByRole("region", { name: "Offers" });
  expect(box).toHaveClass("p-6", "rounded-lg", "border-default", "border-border-default");
});
it.each(["page", "alt", "sunken", "soft", "brand", "ink"] as const)("surface %s sets the ground and data-surface", (surface) => {
  render(<Box data-testid="b" surface={surface}>x</Box>);
  const b = screen.getByTestId("b");
  expect(b).toHaveClass(SURFACE_BG[surface]);
  expect(b).toHaveAttribute("data-surface", SURFACE_DATA[surface]);
});
it("sets no data-surface without a surface", () => {
  render(<Box data-testid="b">x</Box>);
  expect(screen.getByTestId("b")).not.toHaveAttribute("data-surface");
});
it("forwards native props and ref", () => {
  const ref = createRef<HTMLDivElement>();
  render(<Box ref={ref} id="hero" data-x="1">x</Box>);
  expect(ref.current).toHaveAttribute("id", "hero");
});
```
Run → FAIL.

- [ ] **Step 2: Implement Box.** Delete the PADDING/PADDING_X/PADDING_Y maps and the radius/shadow/hasBorder variants. `componentVariants({ variants: { surface: SURFACE_BG } })`. Root: `<Element data-surface={surface === undefined ? undefined : SURFACE_DATA[surface]} className={box({ surface, className: withSx(sx, className) })} {...props} />`. Update the JSDoc: "A polymorphic wrapper: `as`, `surface` and `sx`. MUI's Box, token-only." Run → PASS.

- [ ] **Step 3: Box stories.** `Playground` (`sx={{ p: 6, radius: "lg", border: true }}`), `Surfaces` (all six, each with a Typography heading and body, so contrast is visible; axe runs on it), `AsElement` (`as="ul"` with `li` children, `role="list"`) and `Responsive` (`sx={{ p: { base: 4, md: 8 }, display: { base: "block", md: "flex" } }}`; play at the default viewport asserts computed `padding` = 16px). Run → PASS. Commit `refactor(ui): move box onto surface and sx`.

- [ ] **Step 4: Grid tests.** First read the WIP `grid.test.tsx` and keep every case that matches the interfaces above. Make sure these exist:

```tsx
it("is a 12-column grid with the default grid gap", () => {
  render(<Grid data-testid="g"><GridItem>a</GridItem></Grid>);
  expect(screen.getByTestId("g")).toHaveClass("grid", "grid-cols-12", "gap-grid-gap");
});
it.each([[6, "grid-cols-6"], [4, "grid-cols-4"]] as const)("columns %i", (columns, cls) => {
  render(<Grid data-testid="g" columns={columns} />);
  expect(screen.getByTestId("g")).toHaveClass(cls);
});
it("an item without span is full width (mobile first)", () => {
  render(<GridItem data-testid="i">a</GridItem>);
  expect(screen.getByTestId("i")).toHaveClass("col-span-full");
});
it("maps scalar and responsive span/start to literal classes", () => {
  render(<GridItem data-testid="i" span={{ base: 12, md: 6, lg: 4 }} start={{ lg: 2 }}>a</GridItem>);
  expect(screen.getByTestId("i")).toHaveClass("col-span-12", "md:col-span-6", "lg:col-span-4", "lg:col-start-2");
});
it("takes sx and a gap step", () => {
  render(<Grid data-testid="g" gap={8} sx={{ mt: 4 }} />);
  expect(screen.getByTestId("g")).toHaveClass("gap-8", "mt-4");
});
```
Run → FAIL wherever the WIP falls short.

- [ ] **Step 5: Implement Grid.** The span and start classes MUST be complete literals in static maps, one map per breakpoint, e.g. `const SPAN = { base: { 1: "col-span-1", …, 12: "col-span-12", full: "col-span-full" }, sm: { 1: "sm:col-span-1", … }, md: {…}, lg: {…}, xl: {…} }`, written out in full (the scanner must see every string; never `${bp}:col-span-${n}`). Do the same for START (`col-start-N`). `gap` reuses `GAP_CLASS` from `lib/space`; the default is the AutoGrid gap class `gap-grid-gap`. `columns`: `12: "grid-cols-12", 6: "grid-cols-6", 4: "grid-cols-4"`. Both components merge `withSx`. Run → PASS.

- [ ] **Step 6: Grid stories (`Layouts/Grid`).** `Playground`, `TwelveColumn` (rows of 12 / 6+6 / 4+4+4 / 3×4 with labelled tinted cells), `Responsive` (span `{ base: 12, sm: 6, lg: 4 }` × 6 items), `Asymmetric` (8 + 4 page layout: menu list + cart summary), `Offset` (`start={{ md: 3 }} span={{ md: 8 }}`), `Nested` (a Grid inside a GridItem) and `At360` (floor360; play: `canvasElement.scrollWidth <= canvasElement.clientWidth`). Run `pnpm nx run storybook:test -- grid.stories` → PASS.

- [ ] **Step 7: Export and commit.** Add `export { Grid, GridItem, type GridProps, type GridItemProps } from "./layouts/grid/grid";` to index.ts (alphabetical with the other layouts). Commit `feat(ui): add the 12-column grid layout`.

---

