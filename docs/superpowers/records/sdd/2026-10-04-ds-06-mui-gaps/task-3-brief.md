### Task 3: Typography (rename Text) and Link inherits it

**Files:**
- Move: `packages/ui/src/atoms/text/` → `packages/ui/src/atoms/typography/` (`typography.tsx`, `.test.tsx`, `.stories.tsx`), using `git mv`
- Modify: `packages/ui/src/atoms/link/link.{tsx,test.tsx,stories.tsx}`
- Modify: `packages/ui/src/index.ts`, and every import of `atoms/text/text` (`grep -rl "atoms/text/text" packages apps`)
- Modify: `packages/design-tokens/tokens/component/link.json`: no change, since `text-link-sm/md/lg` already exist and become Typography variants

**Interfaces:**
- Consumes: `Sx`, `withSx` (Task 1).
- Produces:
```ts
export type TypographyVariant = "display-1" | "display-2" | "h1" | "h2" | "h3" | "h4" | "body-lg" | "body" | "body-sm" | "caption" | "overline" | "mono" | "link-sm" | "link-md" | "link-lg";
export type TypographyColor = "heading" | "body" | "muted" | "subtle" | "brand" | "on-brand" | "inverse" | "danger" | "success" | "link";
export interface TypographyProps extends Omit<ComponentProps<"p">, "color"> {
  variant?: TypographyVariant | undefined;  // default "body"
  color?: TypographyColor | undefined;      // replaces `tone`
  weight?: "regular" | "medium" | "semibold" | "bold" | "black" | undefined;
  align?: "start" | "center" | "end" | undefined;
  noWrap?: boolean | undefined;             // new: one line + ellipsis (`truncate`)
  lineClamp?: 1 | 2 | 3 | 4 | 5 | 6 | undefined;
  measure?: "prose" | "narrow" | undefined;
  isBalanced?: boolean | undefined;
  isFluid?: boolean | undefined;
  as?: TypographyElement | undefined;      // today's TextElement union + "a"
  sx?: Sx | undefined;
}
export function Typography(props: TypographyProps): JSX.Element;
export { Typography as Text }; export type { TypographyProps as TextProps };
export interface LinkProps extends Omit<TypographyProps, "as" | "variant" | "color">, Omit<ComponentProps<"a">, "color"> {
  variant?: TypographyVariant | "inherit" | undefined;  // default "link-md"
  color?: TypographyColor | "quiet" | undefined;        // default "link"
  underline?: "always" | "hover" | "none" | undefined;  // default "always"
  icon?: IconComponent | undefined; iconAfter?: IconComponent | undefined;
  isExternal?: boolean | undefined; asChild?: boolean | undefined;
}
```

- [ ] **Step 1: `git mv` the folder and rename the symbol.** `git mv packages/ui/src/atoms/text packages/ui/src/atoms/typography`, rename the files, and rename `Text` → `Typography`, `TextProps` → `TypographyProps` and `tone` → `color` inside them. Story title `Atoms/Typography`. In `index.ts`, export `Typography, type TypographyProps` and keep `Typography as Text, type TypographyProps as TextProps` with a `/** @deprecated use Typography (2026-10-04) */` JSDoc.

- [ ] **Step 2: Write the failing tests** (append to `typography.test.tsx`):

```tsx
it("takes color (the old tone) and sx", () => {
  render(<Typography color="muted" sx={{ mt: 4 }}>Thali of the day</Typography>);
  const p = screen.getByText("Thali of the day");
  expect(p).toHaveClass("text-text-muted", "mt-4");
});
it("noWrap keeps one line with an ellipsis", () => {
  render(<Typography noWrap>Paneer Butter Masala with Garlic Naan</Typography>);
  expect(screen.getByText(/Paneer Butter Masala/)).toHaveClass("truncate");
});
it.each([["link-sm", "text-link-sm"], ["link-md", "text-link-md"], ["link-lg", "text-link-lg"]] as const)(
  "variant %s uses the link text style",
  (variant, cls) => {
    render(<Typography variant={variant}>Menu</Typography>);
    expect(screen.getByText("Menu")).toHaveClass(cls);
  }
);
it("className still beats sx", () => {
  render(<Typography sx={{ mt: 4 }} className="mt-2">Kulfi</Typography>);
  const p = screen.getByText("Kulfi");
  expect(p).toHaveClass("mt-2");
  expect(p).not.toHaveClass("mt-4");
});
```
Run `pnpm nx test ui -- typography`. Expected: FAIL (`color`, `noWrap` and the link variants are unknown).

- [ ] **Step 3: Implement in `typography.tsx`.** Rename the `tone` variant key to `color` and add `success: "text-text-success"` and `link: "text-text-link"`. Add to `variant`: `"link-sm": "font-body text-link-sm", "link-md": "font-body text-link-md", "link-lg": "font-body text-link-lg"`. Add `noWrap: { true: "truncate" }`. Pass `className: withSx(sx, className)` into the variant call. Destructure `sx` and `noWrap` so they don't reach the DOM. Run the tests. Expected: PASS.

- [ ] **Step 4: Link tests first** (replace the old variant/size tests in `link.test.tsx` with the mapping table; visual parity is the contract):

```tsx
it.each([
  [{}, ["text-text-link", "underline", "decoration-link-underline", "text-link-md"]],
  [{ variant: "link-sm" }, ["text-link-sm"]],
  [{ variant: "link-lg" }, ["text-link-lg"]],
  [{ color: "muted", underline: "hover" }, ["text-text-muted", "decoration-transparent", "hover:decoration-border-default"]],
  [{ color: "inverse" }, ["text-ink-000", "decoration-white-alpha-40"]],
  [{ color: "quiet", underline: "hover" }, ["text-link-quiet", "decoration-transparent", "hover:text-text-link"]],
  [{ underline: "none" }, ["no-underline"]],
] as const)("%o renders the old classes", (props, classes) => {
  render(<Link href="/menu" {...props}>Menu</Link>);
  expect(screen.getByRole("link", { name: "Menu" })).toHaveClass(...classes);
});
it("inherits Typography props", () => {
  render(<Link href="/menu" weight="bold" align="center" sx={{ mt: 2 }} variant="inherit">Menu</Link>);
  const a = screen.getByRole("link", { name: "Menu" });
  expect(a).toHaveClass("font-bold", "text-center", "mt-2");
  expect(a.className).not.toMatch(/text-link-(sm|md|lg)/);
});
```
Read today's `link.tsx` variant classes (lines 30–42) and copy them exactly into the new `color` × `underline` compound variants so the strings above hold. Run. Expected: FAIL.

- [ ] **Step 5: Implement Link through Typography.** The Link root renders `<Typography as="a" …>`, or `Slot` when `asChild`. Its classes come from a `link` componentVariants recipe keyed on `color` and `underline`: `link` color = `text-text-link decoration-link-underline hover:text-text-link-hover hover:decoration-current`, `muted` + `hover` = `text-text-muted decoration-transparent hover:text-text-heading hover:decoration-border-default`, `inverse` = `text-ink-000 decoration-white-alpha-40 hover:decoration-white-alpha-90`, `quiet` = `text-link-quiet decoration-transparent hover:text-text-link`, `underline: none` = `no-underline`. Any other Typography color gets `decoration-current`. `variant="inherit"` passes no variant to Typography and sets `text-inherit` (font-size/line-height inherit). Keep `isExternal` (R44 sr-only "(Opens in a new tab)"), the icons and `asChild` exactly as today. Run the tests. Expected: PASS.

- [ ] **Step 6: Update every old call site.** Run `grep -rnE "<Link[^>]*(size=|variant=\"(default|subtle|inverse|quiet)\")" packages apps --include=*.tsx --include=*.mdx` and rewrite each per the table in spec §5. Do the same for `<Text`: `grep -rln "<Text\b\|atoms/text/text" packages apps` → `Typography` + `tone=`→`color=`. Run `pnpm nx run-many -t typecheck -p @pink-paprikaa-web/ui @pink-paprikaa-web/storybook`. Expected: PASS.

- [ ] **Step 7: Stories.** Typography: add `Colors` (all ten), `NoWrap` (360px play: `scrollWidth > clientWidth` and `textOverflow === "ellipsis"`) and `LinkVariants`. Link: replace `Variants`/`Sizes` with `Colors`, `Underline` (always/hover/none) and `InheritsParagraph` (Link inside a `body-sm` paragraph with `variant="inherit"`; play: computed `fontSize` equals the paragraph's). Run `pnpm nx run storybook:test -- typography.stories link.stories`. Expected: PASS.

- [ ] **Step 8: Commit** `refactor(ui): rename text to typography and let link inherit it`

---

