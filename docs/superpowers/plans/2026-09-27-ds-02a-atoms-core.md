# Design System — Plan 2a of 5: Atoms (core)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the thirteen core atoms — Text, Link, PatternField, SocialHeadline, Button, IconButton, Tag, Card, Divider, ImageSlot, Badge, StatusDot, Avatar — plus the shared `lib/heading.ts` and `lib/link-as.ts` contracts, each pixel-faithful to its design-system `.jsx`, token-only, server-safe, tested (behaviour + axe) and shown in Storybook with card parity.

**Architecture:** Every visual value is a token first: control sizes, glyph sizes and label type become component tokens in `packages/design-tokens/tokens/component/<name>.json`; skins that must flip on a pink or ink field are component colour tokens overridden in `surface/{brand,ink}.json` and restored in `surface/light.json`. Components are small React 19 function components built on `componentVariants` (slots where multi-part). `asChild` is Radix `Slot.Root` + `Slot.Slottable`, so glyphs are injected into a consumer's `<a>`/`next/link` too. Nothing here needs `"use client"`.

**Tech Stack:** React 19.2 · TypeScript 6 · Tailwind 4.3 · tailwind-variants 3.3 (`componentVariants`) · radix-ui 1.6.7 (`Slot`) · lucide-react 1.30 · Style Dictionary 5.5 · Vitest 4 + Testing Library + axe-core · Storybook 10.5 (`storybook/test`).

**Spec:** `docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md` (§4 conflicts, §5 contrast policy, §6 tokens, §8 component rules, §9.1 inventory, §10.2 stories, §11.1 DoD).
**Contracts:** `docs/superpowers/plans/2026-09-27-ds-00-contracts.md` (§1 shared lib, §2 atoms — binding).
**Depends on:** Plan 1 (`docs/superpowers/plans/2026-09-27-ds-01-foundation.md`) done — tokens, `styles.css`, `componentVariants`, `vitest.setup.ts`, Icon, Logo, `brand-artwork.ts`, lint gates, Storybook on the consumer contract.

## Global Constraints

- Package manager **pnpm only**; install with `pnpm add` (never hand-write a version in `package.json`). Workspace deps: `pnpm add <pkg> --workspace --filter <project>`.
- TypeScript stays on **6.x** (typescript-eslint caps `<6.1.0`). Node ≥ 24.
- **Never write a literal hex colour** in `.ts/.tsx/.js/.jsx` (`pink-paprikaa/no-raw-hex`, error). Test fixtures that need hex live in `.json` files.
- `#EE2C68` exists once: `packages/design-tokens/tokens/primitive/color.json`.
- **`Pink Paprikaa`** — two `a`s, everywhere. **No founder names** anywhere (source, comments, fixtures, output) — `scripts/check-founder-names.mjs` regex is `/rishav|pandey|anand/i`.
- **Pure veg brand:** nothing non-veg, not even egg (owner, 2026-09-27). Founded **2025**.
- Nx inferred tasks only — **no `project.json`**; per-project overrides go in `package.json` → `"nx"`.
- Named exports, function declarations, **no default exports** (except framework/tool config files). `ref` is a prop (React 19) — **no `forwardRef`**. No TS `enum`; use `as const`.
- Files kebab-case; one primary export per file; booleans prefixed `is/has/should/can/did/will/does`.
- Imports inside `packages/{utils,content,design-tokens}` use `nodenext` resolution → relative imports end in `.js`. Inside `packages/ui` (bundler resolution) relative imports have **no** extension.
- Class names: **only token-backed utilities** — no arbitrary values (`h-[13px]`, `bg-[#…]`, `w-(--x)`); a missing value becomes a token first.
- Commits: Conventional Commits, author with `git commit -m` (commitlint runs in the `commit-msg` hook). Allowed scopes: `web blog storybook ui tokens content seo utils tools ci deps`. Every commit message ends with the `Co-Authored-By:` trailer the harness supplies for the model actually running (the `Claude <model>` in the examples below is a placeholder — substitute it, never commit it literally). **Never `--no-verify`**, never `eslint-disable` a LAW rule.
- Verify APIs against the **installed** package (`node_modules/<pkg>`), never memory.
- A task is done only when its gate command output is green and pasted in the report.

**Atom-tier rules (this plan):**

- **Imports.** An atom file — component, test **and story** — imports only `../icon/*`, `../../lib/*`, `../../../vitest.setup`, its own folder and packages. Stories never compose another atom; they use plain elements with token classes (a raw `<h4>` or `<p>` gets its type and surface colour from the base layer).
- **Skins on surfaces.** A skin with its own fill (white Tag, inverse Button, soft Badge) uses **fixed primitives** and looks the same on every field. A transparent or text-only skin (ghost, link, divider, outline) paints with **semantic tokens**, which follow `data-surface` for free. Only a flip no semantic token describes (primary Button on pink → white) gets a **component colour token**, overridden in `surface/brand.json` / `surface/ink.json` and restored in `surface/light.json`. A component token never aliases a semantic token that a surface overrides: an alias resolves once, where it is declared (`:root`). Task 1's `surface-aliases.spec.ts` fails the build if one does.
- **Dimensions.** Sizes the design system names for a component (control heights, glyph sizes, label type, off-scale radii) are component tokens. Paddings, gaps and offsets use quarter steps of the 4px `--spacing` multiplier (`px-3.5`, `gap-1.25`).
- **Props.** Public `…Props` interfaces spell every variant union out, exactly as in the contract. Never `extends VariantProps<…>`: Storybook's docgen filters out types declared in `node_modules`, so those props would vanish from the tables. `exactOptionalPropertyTypes` is on: use a defaulted parameter (`disabled = false`), not `x || y` on an optional boolean. `prefer-nullish-coalescing` would flag it, and `??` changes the meaning.
- **`asChild`.** `const Component: ElementType = asChild ? Slot.Root : "<el>"`. When the component injects glyphs, the content goes through `<Slot.Slottable child={children}>{(content) => …}</Slot.Slottable>` (verified in `@radix-ui/react-slot@1.3.3`). `type` and `disabled` never reach a slotted child; use `aria-disabled` instead. Put classes on the component, never on the slotted child: `Slot` joins the child's `className` onto the component's without tailwind-merge, so `<Card asChild><a className="rounded-xl">` would ship both `rounded-lg` and `rounded-xl`.
- **Pills** (Button, Tag, Badge): `whitespace-nowrap max-w-full shrink-0` on the root and `min-w-0 truncate` on the label span, so a label never wraps and never pushes the page sideways.
- **Before each gate,** run `pnpm exec prettier --write <the task's files>`: Prettier owns class order (D18), so do not hand-sort classes to match. If lint reports only `perfectionist/*` import order, run `pnpm nx lint @pink-paprikaa-web/ui --fix`.

## Review Focus

1. **Long labels in pills at 360px.** A long label must not wrap, clip mid-glyph or push the page sideways. The pill caps at its container (`max-w-full`), the label ellipsises (`min-w-0 truncate`), the glyphs keep their size (`shrink-0`), and the accessible name stays the full text. Pinned in **Task 6** (Button unit test + `LongLabel` story `play` that measures layout in Chromium), plus **Task 8** (Tag) and **Task 12** (Badge).
2. **Controls and indicators without a name.** `IconButton.label` is required by type (a `@ts-expect-error` test fails if it ever turns optional), and the cart count joins the name ("Your order (3)"). A bare StatusDot is announced by its tone ("Open"). A named Avatar is `role="img"`, an unnamed one is hidden. Pinned in **Task 7**, plus **Task 13** and **Task 14**.
3. **`asChild` with an `<a>`.** The anchor gets the classes and glyphs, but no `type="button"` or `disabled`. A loading link is `aria-busy` + `aria-disabled` and stops the pointer. A router-link component (not only a literal `<a>`) must slot. Pinned in **Task 6** (Button), plus **Task 3** (Link), **Task 7** (IconButton) and **Task 9** (Card).
4. **ImageSlot with no photo keeps its aspect box.** The placeholder has an `aspect-*` class and `w-full`. `isFill` swaps the aspect for `h-full`, with exactly one aspect class. A real photo carries intrinsic `width`/`height`, `loading="lazy"` and `decoding="async"`. A photo without `alt`/`width`/`height` does not compile. Pinned in **Task 11**.
5. **Surface-aware skins on nested surfaces.** A secondary Button on a pink field is transparent, but the same Button on a white card inside that field must be white again. A component token aliasing a surface-overridden semantic token would silently keep its `:root` value. Pinned in **Task 1** (`surface-aliases.spec.ts`), **Task 6** (`NestedSurfaces` story `play` reads the computed background in Chromium) and **Task 9** (Card's `LightIsland` story `play` + unit test for `data-surface="light"` inside a brand field). Plan 1's `theme.spec.ts` already asserts that `light` restores every override.

## Contract deviations

1. **`IconButtonProps` keeps `children?: ReactElement`.** The contract omits `"children"` while also offering `asChild`, but `Slot` needs the element to slot onto (`<IconButton asChild …><RouterLink href="/cart" /></IconButton>`). `children` is documented as "only with `asChild`: the element to render as". Its content is replaced by the glyph.
2. **Internal additions** (not in the contract, never exported from the barrel), all created in Task 1:
   - `lib/symbol-mark.tsx` → `SymbolMark`: the diamond symbol as inline SVG in `currentColor`. Divider and StatusDot use it here; **Plan 2b's Spinner, Rating and SpiceLevel should reuse it** rather than redraw the mark.
   - `lib/control-states.ts` → `controlStates`: the pill-control transition and disabled look.
   - `lib/story-surfaces.tsx` → `OnSurfaces`, for stories only.
3. **Tooling.** `tools/eslint-config/rules/naming-convention.js` gains a `requiresQuotes` escape for `typeProperty`. Without it the contract's own `LinkAsProps["aria-current"]` (and Plan 3a's `FieldControlProps["aria-describedby"]`) fail `@typescript-eslint/naming-convention`, which Plan 1 promotes to `error`. Probe-verified in Task 1.
4. **Defaults the contract left open** (specified here, not deviations):
   - StatusDot `size = "sm"` (14px, the design-system default), `md` = 16px.
   - SocialHeadline `measure` = tight 12ch / default 18ch / wide 30ch, from the medians of every `max` the kits pass. Its default element is `h2` for hero/h1/h2 and `p` for body/caption/overline.
   - Divider's `label` is also its `aria-label`, because a separator's children are presentational.
5. **Text re-point (spec §5.3 extended).** ImageSlot `tone="ink"` label ink-500 → **ink-600**: ink-500 on ink-200 measures 3.07, ink-600 measures 5.22.

---

## File map (this plan)

```
packages/design-tokens/
  tokens/primitive/color.json          M  white-alpha 16 / 40 / 90
  tokens/primitive/typography.json     M  canvas-* composites gain line-height, tracking, weight
  tokens/surface/{brand,ink,light}.json M  component skin overrides + light restores
  tokens/component/{text,link,social-headline,button,icon-button,tag,divider,image-slot,badge,status-dot,avatar}.json   C
  contrast-pairs.json                  M  one group per component pair set
  src/surface-aliases.spec.ts          C  stale-alias guard
packages/ui/
  src/styles.css                       M  transition-control, pattern-tile-*, pattern-opacity-*
  src/index.ts                         M  exports
  src/lib/{heading.ts,heading.spec.ts,link-as.ts,link-as.test.tsx,symbol-mark.tsx,symbol-mark.test.tsx,control-states.ts,story-surfaces.tsx}   C
  src/lib/component-variants.ts        M  twMerge scale lists
  src/atoms/{text,link,pattern-field,social-headline,button,icon-button,tag,card,divider,image-slot,badge,status-dot,avatar}/<name>.{tsx,test.tsx,stories.tsx}   C
  AUTHORING.md                         M  surface-skin rule
tools/eslint-config/rules/naming-convention.js   M  requiresQuotes escape
```

---

### Task 0: Reconcile with the code as built

Plan 1 was executed in parallel with the writing of this plan. Every interface this plan consumes is checked here against the tree. If anything differs, patch the later tasks of **this plan** to match reality before starting Task 1, and list each patch in your report.

**Files:** none (read-only).

- [ ] **Step 1: Plan 1 is in the branch**

Run:

```bash
git log --oneline -40 | rtk proxy grep -E "rebuild the token system|library core|token-only classes|brand artwork, Icon and Logo|consume the design system like an app"
```

Expected: all five commits listed. If any is missing, stop — Plan 1 is not done.

- [ ] **Step 2: Barrel, variant builder, test helper, Icon, artwork**

Run:

```bash
cat packages/ui/src/index.ts
rtk proxy grep -nE "^const (TEXT|SPACING|RADIUS|SHADOW|ANIMATE) = |export const (componentVariants|twMergeConfig)|export type \{ VariantProps \}" packages/ui/src/lib/component-variants.ts
rtk proxy grep -n "export async function expectNoA11yViolations" packages/ui/vitest.setup.ts
rtk proxy grep -nE "export (type IconComponent|interface IconProps|function Icon)|xs: \"size-icon-xs\"" packages/ui/src/atoms/icon/icon.tsx
rtk proxy grep -nE "export (type Mark|interface Artwork|const ARTWORK)" packages/ui/src/lib/brand-artwork.ts
rtk proxy grep -n "@utility mask-symbol\|--pp-symbol-mask" packages/ui/src/lib/brand-artwork.css
```

Expected: the barrel exports `Icon`, `IconComponent`, `IconProps`, the three glyphs, `Logo`, `LogoProps` and `RevealObserver`. The five list constants and three exports exist. `expectNoA11yViolations(container: Element, options: RunOptions = {})` is present. `Icon` takes `size: "xs"|"sm"|"md"|"lg"|"xl"` and renders `size-icon-*` classes. `ARTWORK` is exported (there is no JS data-URI export — ruling R25); `brand-artwork.css` defines `--pp-symbol-mask` and `@utility mask-symbol` (R19). (Task 1's `symbol-mark.test.tsx` asserts that the symbol markup carries no `id=`. If that assertion ever fails, `SymbolMark` must replace `__ID__` with a `useId`-derived prefix, as `Logo` does.)

- [ ] **Step 3: Every token and utility this plan consumes exists**

Run:

```bash
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache
node -e '
const c = require("./packages/design-tokens/dist/tokens.json");
const base = new Set(c.filter((e) => e.surface === null).map((e) => e.name));
const need = ["color-pink-50","color-pink-100","color-pink-200","color-pink-500","color-pink-600","color-pink-700","color-pink-800",
 "color-ink-000","color-ink-100","color-ink-200","color-ink-300","color-ink-400","color-ink-600","color-ink-700","color-ink-900",
 "color-white-alpha-70","color-white-alpha-85","color-surface-page","color-surface-page-alt","color-surface-card","color-surface-sunken",
 "color-surface-brand","color-surface-brand-soft","color-surface-inverse","color-surface-glass","color-text-heading","color-text-body",
 "color-text-muted","color-text-subtle","color-text-brand","color-text-on-brand","color-text-on-inverse","color-text-link",
 "color-text-link-hover","color-text-success","color-text-warning","color-text-danger","color-border-subtle","color-border-default",
 "color-brand-hover","color-brand-active","color-status-success","color-status-success-soft","color-status-warning",
 "color-status-warning-soft","color-status-danger","color-status-danger-soft","text-display-1","text-h1","text-h1-fluid","text-body",
 "text-overline","text-mono","text-caption","text-canvas-hero","text-canvas-overline","container-prose","container-prose-narrow",
 "aspect-square","aspect-4-3","aspect-3-4","aspect-4-5","aspect-16-9","aspect-16-10","aspect-wide","radius-md","radius-lg","radius-xl",
 "radius-pill","shadow-1","shadow-2","shadow-3","shadow-brand","blur-glass","pattern-tile-56","pattern-tile-64","pattern-tile-72",
 "pattern-tile-80","pattern-tile-86","pattern-tile-96","pattern-opacity-default","pattern-opacity-light","pattern-opacity-faint",
 "duration-fast","duration-instant","ease-out","motion-press-scale","motion-lift-y"];
const missing = need.filter((n) => !base.has(n));
console.log(missing.length ? "MISSING: " + missing.join(", ") : "all consumed tokens present");
for (const f of ["brand","ink","soft","light"]) { const j = require(`./packages/design-tokens/tokens/surface/${f}.json`); const root = Object.keys(j)[0]; console.log(f, root, Object.keys(j[root])); }
'
rtk proxy grep -nE "@utility (duration-fast|duration-base|press-scale|lift)|--animate-(rotate|dot-pulse):" packages/ui/src/styles.css
```

Expected: `all consumed tokens present`. Each surface file prints `surface-<name>` with keys `[ 'color', 'shadow' ]` (soft: `[ 'color' ]`). The styles grep lists `duration-fast`, `duration-base`, `press-scale`, `lift`, `--animate-rotate` and `--animate-dot-pulse`. A renamed token means updating every class in the tasks below that uses it. A surface file with a different shape means rewriting the surface fragments in Tasks 3, 6, 7, 8, 10 and 12 to that shape.

- [ ] **Step 4: Parallel plans have not already created what this plan creates**

Run:

```bash
ls packages/ui/src/lib packages/ui/src/atoms packages/design-tokens/tokens/component
node -e 'const c=require("./packages/design-tokens/dist/tokens.json"); console.log(c.filter((e)=>/^(radius-diamond|color-white-alpha-(16|40|90))$/.test(e.name)).map((e)=>e.name))'
```

Expected: no `heading.ts`, `link-as.ts`, `symbol-mark.tsx`, `control-states.ts`, `story-surfaces.tsx`, and none of this plan's 13 atom folders. If Plan 2b already landed `symbol-mark.tsx`, `control-states.ts` or `white-alpha-16/40/90`, **reuse theirs** and delete the matching creation step here. If a `radius-diamond` token exists, use `rounded-diamond` in StatusDot (Task 13) instead of adding `radius.status-dot`.

- [ ] **Step 5: Baseline is green**

Run:

```bash
pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -3
```

Expected: `Successfully ran targets typecheck, lint, test for 2 projects` and a finished Storybook build. Plan 1's `icon.tsx` imports `../../lib/component-variants` and its test imports `../../../vitest.setup`, so a green lint here proves those import shapes pass the atom layering rule.

- [ ] **Step 6: Dev parity tables present on every ported-component task**

Contracts §0.0: every atom here is ported from the `dev` branch. Run:

```bash
rtk proxy grep -c '^\*\*Dev parity:\*\*' docs/superpowers/plans/2026-09-27-ds-02a-atoms-core.md
```

Expected: `13` — one table in each of Tasks 2–14 (Icon and Logo are Plan 1). If a task lacks one, stop and audit it against `git show dev:packages/ui/src/atoms/<name>/<name>.{tsx,test.tsx,stories.tsx}` before it runs.

- [ ] **Step 7: Record**

In the report, list every difference found and the task you patched, or write "Plan 1 matched this plan's assumptions".

---

### Task 1: Shared library — heading, link-as, the symbol mark, control states, story surfaces

**Dev reference:** none (shared-library task; dev's `lib/` has no `heading`, `link-as`, `symbol-mark`, `control-states` or `story-surfaces`).

**Files:**

- Create: `packages/ui/src/lib/heading.ts`, `packages/ui/src/lib/heading.spec.ts`
- Create: `packages/ui/src/lib/link-as.ts`, `packages/ui/src/lib/link-as.test.tsx`
- Create: `packages/ui/src/lib/symbol-mark.tsx`, `packages/ui/src/lib/symbol-mark.test.tsx`
- Create: `packages/ui/src/lib/control-states.ts`, `packages/ui/src/lib/story-surfaces.tsx`
- Create: `packages/design-tokens/src/surface-aliases.spec.ts`
- Modify: `packages/ui/src/styles.css`, `packages/ui/src/index.ts`, `packages/ui/AUTHORING.md`, `tools/eslint-config/rules/naming-convention.js`

**Interfaces:**

- Consumes: `componentVariants` (`lib/component-variants`), `ARTWORK` (`lib/brand-artwork`), `dist/tokens.json` catalogue (`name`, `reference`, `surface`).
- Produces (public): `type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6`; `headingTag(level: HeadingLevel): "h1" | "h2" | "h3" | "h4" | "h5" | "h6"`; `interface LinkAsProps { href: string; className?: string; children?: ReactNode; "aria-current"?: "page" | "step" | "true"; onClick?: MouseEventHandler<HTMLAnchorElement> }`; `type LinkAs = ElementType<LinkAsProps>`.
- Produces (internal): `SymbolMark(props: SymbolMarkProps)`, `type SymbolMarkProps = Omit<ComponentProps<"svg">, "children" | "viewBox" | "dangerouslySetInnerHTML">`; `controlStates` (a `componentVariants` instance, call `controlStates()`); `OnSurfaces({ children })`; the utility `transition-control`.

- [ ] **Step 1: Prove the naming rule rejects the contract's quoted ARIA key, then allow quoted names**

Create `packages/utils/src/probe.ts`:

```ts
export interface Probe {
  "aria-current"?: "page";
  bad_Name?: string;
}
```

Run: `pnpm nx lint @pink-paprikaa-web/utils --skip-nx-cache 2>&1 | rtk proxy grep -E "naming-convention|aria-current|bad_Name"`
Expected: two `@typescript-eslint/naming-convention` errors, one for `"aria-current"` and one for `bad_Name`. (If only `bad_Name` is reported, the installed typescript-eslint already skips quoted names. In that case skip the edit below, delete the probe and note it in the report.)

In `tools/eslint-config/rules/naming-convention.js`, add this entry directly after the `typeProperty` entry:

```js
  {
    // Quoted names mirror DOM attributes a prop forwards verbatim ("aria-current",
    // "aria-describedby"); they cannot be camelCase. Unquoted properties stay strict.
    selector: "typeProperty",
    modifiers: ["requiresQuotes"],
    format: null,
  },
```

Rerun the same command. Expected: exactly one error, for `bad_Name`. Delete `packages/utils/src/probe.ts` (`git status` shows no probe). Paste both outputs in the report.

- [ ] **Step 2: Write the failing library tests**

`packages/ui/src/lib/heading.spec.ts`:

```ts
import { headingTag } from "./heading";

describe("headingTag", () => {
  it.each([
    [1, "h1"],
    [2, "h2"],
    [3, "h3"],
    [4, "h4"],
    [5, "h5"],
    [6, "h6"],
  ] as const)("maps level %i to <%s>", (level, tag) => {
    expect(headingTag(level)).toBe(tag);
  });
});
```

`packages/ui/src/lib/link-as.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import type { LinkAs, LinkAsProps } from "./link-as";

function RouterLink({ children, ...props }: LinkAsProps) {
  return (
    <a data-router="" {...props}>
      {children}
    </a>
  );
}

function NavItem({ linkAs: Anchor }: { linkAs: LinkAs }) {
  return (
    <Anchor href="/menu" aria-current="page" className="font-body">
      Menu
    </Anchor>
  );
}

describe("LinkAs", () => {
  it("accepts the native anchor", () => {
    render(<NavItem linkAs="a" />);
    const link = screen.getByRole("link", { name: "Menu" });
    expect(link).toHaveAttribute("href", "/menu");
    expect(link).toHaveAttribute("aria-current", "page");
  });

  it("accepts a router's link component, so an app can pass next/link", () => {
    render(<NavItem linkAs={RouterLink} />);
    expect(screen.getByRole("link", { name: "Menu" })).toHaveAttribute("data-router");
  });
});
```

`packages/ui/src/lib/symbol-mark.test.tsx`:

```tsx
import { render } from "@testing-library/react";

import { ARTWORK } from "./brand-artwork";
import { SymbolMark } from "./symbol-mark";

describe("SymbolMark", () => {
  it("draws the brand symbol in currentColor, hidden from assistive tech", () => {
    const { container } = render(<SymbolMark className="size-4" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", ARTWORK.symbol.viewBox);
    expect(svg).toHaveAttribute("fill", "currentColor");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveClass("size-4");
    expect(svg?.childElementCount).toBeGreaterThan(0);
  });

  it("carries no element ids, so any number of marks can share a page", () => {
    expect(ARTWORK.symbol.markup).not.toMatch(/\bid="/);
  });
});
```

`packages/design-tokens/src/surface-aliases.spec.ts`:

```ts
import { readFileSync } from "node:fs";

interface CatalogueEntry {
  name: string;
  reference: string | null;
  surface: string | null;
}

const catalogue = JSON.parse(
  readFileSync(new URL("../dist/tokens.json", import.meta.url), "utf8")
) as CatalogueEntry[];

/**
 * A custom property that aliases another is resolved where it is declared. A base token declared on
 * `:root` as `var(--color-text-link)` keeps the root value inside `[data-surface="brand"]` even
 * though that surface redefines `--color-text-link` — unless the alias is redefined there too.
 * This finds every alias that would silently go stale on a surface (plan 2a, Review Focus 5).
 */
describe.each(["brand", "ink", "soft", "light"])("on the %s surface", (surface) => {
  it("re-declares every alias of a token the surface overrides", () => {
    const overridden = new Set(catalogue.filter((e) => e.surface === surface).map((e) => e.name));
    const stale = catalogue
      .filter((e) => e.surface === null && e.reference !== null)
      .filter((e) => {
        const target = (e.reference ?? "").split(".").join("-");
        return overridden.has(target) && !overridden.has(e.name);
      })
      .map((e) => `${e.name} → ${e.reference ?? ""}`);
    expect(stale).toEqual([]);
  });
});
```

- [ ] **Step 3: Run them to verify they fail**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -12`
Expected: FAIL. `Failed to resolve import "./heading"` (and `./link-as`, `./symbol-mark`).

Run: `pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -8`
Expected: PASS, because no component token exists yet. The guard is proven to bite in Step 5.

- [ ] **Step 4: Implement the library files**

`packages/ui/src/lib/heading.ts`:

```ts
/**
 * Heading levels. Every titled component takes `headingLevel?: HeadingLevel`, so a page keeps one
 * `h1` and a correct outline wherever the component lands (spec §5.5, §8.1).
 */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const HEADING_TAG = { 1: "h1", 2: "h2", 3: "h3", 4: "h4", 5: "h5", 6: "h6" } as const;

/** The element for a heading level: `headingTag(2)` → `"h2"`. */
export function headingTag(level: HeadingLevel): "h1" | "h2" | "h3" | "h4" | "h5" | "h6" {
  return HEADING_TAG[level];
}
```

`packages/ui/src/lib/link-as.ts`:

```ts
import type { ElementType, MouseEventHandler, ReactNode } from "react";

/**
 * What a link-list component (footer, header, breadcrumb, tab bar) hands to each link it renders.
 * Only props a plain `<a>` and every router link both accept, so the system never knows routers.
 */
export interface LinkAsProps {
  href: string;
  className?: string;
  children?: ReactNode;
  "aria-current"?: "page" | "step" | "true";
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

/** The element or component a link list renders its links with — `"a"` by default, or `next/link`. */
export type LinkAs = ElementType<LinkAsProps>;
```

`packages/ui/src/lib/symbol-mark.tsx`:

```tsx
import type { ComponentProps } from "react";

import { ARTWORK } from "./brand-artwork";

export type SymbolMarkProps = Omit<
  ComponentProps<"svg">,
  "children" | "viewBox" | "dangerouslySetInnerHTML"
>;

/**
 * The brand's diamond symbol as inline SVG, painted with `currentColor` — the mark every small
 * diamond in the system carries (Divider, StatusDot here; Spinner, Rating, SpiceLevel reuse it).
 * Always decorative: the component that places it owns the accessible name.
 *
 * The markup is build-time artwork compiled from the committed SVGs, never user input, so
 * `dangerouslySetInnerHTML` is safe. The symbol has no element ids (pinned by the test), so any
 * number of marks can share a page without `useId`.
 */
export function SymbolMark(props: SymbolMarkProps) {
  return (
    <svg
      viewBox={ARTWORK.symbol.viewBox}
      fill="currentColor"
      aria-hidden
      focusable="false"
      {...props}
      dangerouslySetInnerHTML={{ __html: ARTWORK.symbol.markup }}
    />
  );
}
```

`packages/ui/src/lib/control-states.ts`:

```ts
import { componentVariants } from "./component-variants";

/**
 * Shared by every pill control (Button, IconButton, interactive Tag): the control transition
 * (colours over --duration-fast, the press scale over --duration-instant) and the disabled look —
 * a real grey fill, never an opacity fade (design system readme §3.8). The `aria-disabled` twins
 * cover `asChild` links, which cannot be `:disabled`; they also stop the pointer, so a busy link
 * cannot be followed.
 */
export const controlStates = componentVariants({
  base: [
    "transition-control",
    "disabled:cursor-not-allowed disabled:border-transparent disabled:bg-ink-200 disabled:text-ink-400 disabled:shadow-none",
    "aria-disabled:pointer-events-none aria-disabled:border-transparent aria-disabled:bg-ink-200 aria-disabled:text-ink-400 aria-disabled:shadow-none",
  ],
});
```

`packages/ui/src/lib/story-surfaces.tsx`:

```tsx
import type { ReactNode } from "react";

import { componentVariants } from "./component-variants";

/**
 * Stories only — never exported from the barrel. Renders its children on each ground a
 * surface-aware component must survive (spec §10.2: page, alt, brand, ink, soft). Brand, ink and
 * soft set `data-surface`, exactly as Section, Card and PatternField do in product code.
 */
const GROUNDS = [
  { ground: "page", surface: undefined },
  { ground: "alt", surface: undefined },
  { ground: "brand", surface: "brand" },
  { ground: "ink", surface: "ink" },
  { ground: "soft", surface: "soft" },
] as const;

const stage = componentVariants({
  slots: {
    row: "flex flex-wrap items-center gap-3 rounded-lg p-4",
    label: "w-12 shrink-0 font-mono text-mono text-text-subtle",
  },
  variants: {
    ground: {
      page: { row: "bg-surface-page" },
      alt: { row: "bg-surface-page-alt" },
      brand: { row: "bg-surface-brand" },
      ink: { row: "bg-surface-inverse" },
      soft: { row: "bg-surface-brand-soft" },
    },
  },
});

export function OnSurfaces({ children }: { children: ReactNode }) {
  return (
    <div className="grid w-full gap-3">
      {GROUNDS.map(({ ground, surface }) => {
        const slots = stage({ ground });
        return (
          <div key={ground} data-surface={surface} className={slots.row()}>
            <span className={slots.label()}>{ground}</span>
            {children}
          </div>
        );
      })}
    </div>
  );
}
```

Append to `packages/ui/src/styles.css`, after the `lift` utility:

```css
/* Pill controls (Button, IconButton, Tag): colours and shadow ease over --duration-fast; the press
   scale snaps in --duration-instant (design system readme §3.8). */
@utility transition-control {
  transition-property:
    color, background-color, border-color, text-decoration-color, box-shadow, scale;
  transition-timing-function: var(--ease-out);
  transition-duration:
    var(--duration-fast), var(--duration-fast), var(--duration-fast), var(--duration-fast),
    var(--duration-fast), var(--duration-instant);
}
```

In `packages/ui/src/index.ts`, add after the `RevealObserver` line:

```ts
export { type HeadingLevel, headingTag } from "./lib/heading";
export type { LinkAs, LinkAsProps } from "./lib/link-as";
```

Append to `packages/ui/AUTHORING.md`, at the end of its surfaces section:

```md
**Skins on surfaces.** A skin with its own fill (white Tag, inverse Button, soft Badge) uses fixed
primitives, so it looks the same on every field. A transparent or text-only skin (ghost, link,
divider, outline) paints with semantic tokens, which follow `data-surface` for free. Only a flip no
semantic token describes (primary Button on pink → white) gets a component colour token, overridden
in `surface/{brand,ink}.json` and restored in `surface/light.json`. A component token never aliases a
semantic token a surface overrides — the alias resolves once, at `:root`
(`packages/design-tokens/src/surface-aliases.spec.ts` fails the build).
```

- [ ] **Step 5: Run to verify they pass, and probe the alias guard**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS (heading 6, link-as 2, symbol-mark 2, plus Plan 1's suites).

Probe: create `packages/design-tokens/tokens/component/probe.json`:

```json
{ "color": { "$type": "color", "probe": { "$value": "{color.text.link}" } } }
```

Run: `pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | rtk proxy grep -E "color-probe|passed|failed"`
Expected: FAIL on brand, ink, soft and light with `color-probe → color.text.link`. Delete `probe.json`, rerun and expect PASS. Paste both outputs.

- [ ] **Step 6: Stories** — none. `OnSurfaces` is exercised by every later `OnSurfaces` story.

- [ ] **Step 7: Exports** — done in Step 4 (`HeadingLevel`, `headingTag`, `LinkAs`, `LinkAsProps`). `SymbolMark`, `controlStates` and `OnSurfaces` stay internal.

- [ ] **Step 8: Gate**

```bash
pnpm exec prettier --write packages/ui/src/lib packages/ui/src/styles.css packages/ui/src/index.ts packages/ui/AUTHORING.md packages/design-tokens/src tools/eslint-config/rules
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: `Successfully ran targets typecheck, lint, test for 2 projects`; Storybook build finishes.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens tools/eslint-config
git commit -m "feat(ui): shared heading, link-as and symbol-mark library for the atoms

headingTag and LinkAs are the contracts every titled and link-list component
consumes. SymbolMark draws the brand diamond once for every small diamond;
controlStates is the pill controls' shared transition and disabled look.
A new token test fails the build when an alias would go stale on a surface.
Quoted ARIA keys in prop types are exempt from camelCase (probe outputs below).

<paste the two naming-rule probe outputs and the two alias-guard probe outputs>

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 2: Text

**Dev reference:** `git show dev:packages/ui/src/atoms/text/text.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                                                                                  | Ruling  | Where / reason                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| Step names `display1`, `subtitle1/2`, `body1/2`                                                                                           | DROP    | D4 (token names mirror the design system: `display-1`, `h4`, `body-lg`, `body-sm`)                           |
| `caption` and `overline` default to the `muted` tone                                                                                      | DROP    | contracts §2 (`tone` = heading for display/h steps, body otherwise), as `Text.jsx`                           |
| `as?: ElementType` (any element)                                                                                                          | DROP    | contracts §2 fixes the `as` union                                                                            |
| `align` left/right; `measure` via `max-w-(--measure-*)`                                                                                   | DROP    | contracts §2 (`start`/`center`/`end`); AUTHORING §6 (no arbitrary shorthand). The measure tokens replace it  |
| Display steps render `<p>`                                                                                                                | ALREADY | the plan follows `Text.jsx` (`span`); `as` overrides it                                                      |
| Native props not forwarded                                                                                                                | ALREADY | the plan extends `ComponentProps<"p">` and spreads them                                                      |
| `isBalanced={false}` opts a heading out of balance (`text-pretty`)                                                                        | ADD     | Step 2 test; Step 4 `className` merge (an unset boolean variant reads as `false`, so it cannot be a variant) |
| Test: `as="h1" variant="h2"` is a level-1 heading on the h2 step                                                                          | ADD     | Step 2                                                                                                       |
| Test: no alignment or measure class unless asked                                                                                          | ADD     | Step 2                                                                                                       |
| Tests: caller tone replaces the default, fluid swap, steps without a fluid twin, balance/pretty, measure, `lineClamp`, overline caps, axe | ALREADY | Step 2 existing cases                                                                                        |
| Story `Tones`: `onBrand` on a pink panel                                                                                                  | ADD     | Step 6 `ToneOnBrand`                                                                                         |
| Story `Fluid`: all seven fluid steps                                                                                                      | ADD     | Step 6 `Fluid`                                                                                               |
| Story `Measure`: prose and narrow                                                                                                         | ADD     | Step 6 `Measure`                                                                                             |
| Stories `Default`, `Ramp`, `Truncated`                                                                                                    | ALREADY | `Playground`; the five ramp-row stories; `LineClamp`                                                         |
| `Ramp` metric captions (px / line height / tracking)                                                                                      | DROP    | the Type foundation pages own the metrics, read from `tokens.json` (spec §10.1)                              |

Implementer: copy this table into your report, extended with anything the plan missed.

Source: `components/atoms/Text.{jsx,d.ts,card.html,prompt.md}`. Sizes, line heights, tracking and weights all come from Plan 1's `text-*` typography composites. The only new values are the two measures.

**Files:**

- Create: `packages/design-tokens/tokens/component/text.json`
- Create: `packages/ui/src/atoms/text/text.tsx`, `text.test.tsx`, `text.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`
- `contrast-pairs.json`: unchanged. Every tone is a semantic text token already measured on every surface by Plan 1's groups.

**Interfaces:**

- Consumes: `componentVariants`; utilities `font-{display,body,mono}`, `text-{display-1…mono}`, `text-{display-1,display-2,h1,h2,h3,h4,body}-fluid`, `text-text-*`, `font-{regular,medium,semibold,bold,black}`, `line-clamp-*`, `text-balance`, `text-pretty`.
- Produces: `Text`, `interface TextProps extends ComponentProps<"p">`, `type TextVariant`, `type TextTone` (exactly as contracts §2).

- [ ] **Step 1: Component tokens**

Tailwind 4.3's `max-w-prose` is a **static** utility (65ch) that shadows `--container-prose` (64ch). It was verified by compiling both classes against the installed `tailwindcss@4.3.3`. So the two measures become spacing tokens that alias the containers.

`packages/design-tokens/tokens/component/text.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "text-measure-prose": {
      "$value": "{container.prose}",
      "$description": "Text measure=\"prose\" (64ch). A spacing token because Tailwind's static max-w-prose (65ch) shadows --container-prose."
    },
    "text-measure-narrow": {
      "$value": "{container.prose-narrow}",
      "$description": "Text measure=\"narrow\" (44ch)."
    }
  }
}
```

In `packages/ui/src/lib/component-variants.ts`, append to `SPACING`: `"text-measure-prose", "text-measure-narrow",`.

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && rtk proxy grep -n "text-measure" packages/design-tokens/dist/theme.css`
Expected: `--spacing-text-measure-prose: var(--container-prose);` and `--spacing-text-measure-narrow: var(--container-prose-narrow);`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/text/text.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Text } from "./text";

describe("Text", () => {
  it("renders body copy as a paragraph in the body tone, wrapping pretty", () => {
    render(<Text>We roast our own masala every morning.</Text>);
    const copy = screen.getByText("We roast our own masala every morning.");
    expect(copy.tagName).toBe("P");
    expect(copy).toHaveClass("m-0", "font-body", "text-body", "text-text-body", "text-pretty");
  });

  it.each([
    ["h1", 1],
    ["h2", 2],
    ["h3", 3],
    ["h4", 4],
  ] as const)("renders the %s step as a level-%i heading in the heading tone", (variant, level) => {
    render(<Text variant={variant}>Our Menu</Text>);
    const heading = screen.getByRole("heading", { level, name: "Our Menu" });
    expect(heading).toHaveClass(
      "font-display",
      `text-${variant}`,
      "text-text-heading",
      "text-balance"
    );
  });

  it.each([
    ["display-1", "SPAN"],
    ["display-2", "SPAN"],
    ["body-lg", "P"],
    ["body-sm", "P"],
    ["caption", "SPAN"],
    ["overline", "SPAN"],
    ["mono", "SPAN"],
  ] as const)("renders the %s step as a <%s>", (variant, tag) => {
    render(<Text variant={variant}>Chai</Text>);
    expect(screen.getByText("Chai").tagName).toBe(tag);
  });

  it("sets display steps in the heading tone on the display face", () => {
    render(<Text variant="display-1">Desi at heart.</Text>);
    expect(screen.getByText("Desi at heart.")).toHaveClass(
      "font-display",
      "text-display-1",
      "text-text-heading"
    );
  });

  it("sets the overline in capitals on the display face, in the body tone", () => {
    render(<Text variant="overline">The Menu</Text>);
    expect(screen.getByText("The Menu")).toHaveClass(
      "font-display",
      "text-overline",
      "uppercase",
      "text-text-body"
    );
  });

  it("sets order codes in the mono face", () => {
    render(<Text variant="mono">PPK-4821</Text>);
    expect(screen.getByText("PPK-4821")).toHaveClass("font-mono", "text-mono");
  });

  it("lets `as` choose the element without changing the ramp step", () => {
    render(
      <Text variant="h2" as="p">
        Most ordered this week
      </Text>
    );
    const text = screen.getByText("Most ordered this week");
    expect(text.tagName).toBe("P");
    expect(text).toHaveClass("text-h2");
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it.each([
    ["heading", "text-text-heading"],
    ["body", "text-text-body"],
    ["muted", "text-text-muted"],
    ["subtle", "text-text-subtle"],
    ["brand", "text-text-brand"],
    ["on-brand", "text-text-on-brand"],
    ["inverse", "text-text-on-inverse"],
    ["danger", "text-text-danger"],
  ] as const)("paints the %s tone with %s and nothing else", (tone, colour) => {
    render(
      <Text variant="h3" tone={tone}>
        Small Plates
      </Text>
    );
    const text = screen.getByText("Small Plates");
    expect(text).toHaveClass(colour);
    expect(text.className.match(/(^|\s)text-text-/g)).toHaveLength(1);
  });

  it("keeps the font size when a tone is applied (the merge never drops a step)", () => {
    render(
      <Text variant="h1" tone="muted">
        Our Menu
      </Text>
    );
    expect(screen.getByText("Our Menu")).toHaveClass("text-h1", "text-text-muted");
  });

  it.each(["display-1", "display-2", "h1", "h2", "h3", "h4", "body"] as const)(
    "swaps %s for its fluid clamp when isFluid",
    (variant) => {
      render(
        <Text variant={variant} isFluid>
          Desi at heart.
        </Text>
      );
      const text = screen.getByText("Desi at heart.");
      expect(text).toHaveClass(`text-${variant}-fluid`);
      expect(text).not.toHaveClass(`text-${variant}`);
    }
  );

  it("keeps the fixed size on steps that have no fluid twin", () => {
    render(
      <Text variant="caption" isFluid>
        Caption
      </Text>
    );
    expect(screen.getByText("Caption")).toHaveClass("text-caption");
  });

  it("applies weight, alignment, line clamping, the narrow measure and balance", () => {
    render(
      <Text weight="bold" align="center" lineClamp={2} measure="narrow" isBalanced>
        We roast our own masala every morning.
      </Text>
    );
    const text = screen.getByText("We roast our own masala every morning.");
    expect(text).toHaveClass(
      "font-bold",
      "text-center",
      "line-clamp-2",
      "max-w-text-measure-narrow",
      "text-balance"
    );
    expect(text).not.toHaveClass("text-pretty");
  });

  it("caps prose at the 64ch measure token, never Tailwind's 65ch max-w-prose", () => {
    render(<Text measure="prose">We roast our own masala every morning.</Text>);
    const text = screen.getByText("We roast our own masala every morning.");
    expect(text).toHaveClass("max-w-text-measure-prose");
    expect(text).not.toHaveClass("max-w-prose");
  });

  it("adds neither an alignment nor a line-length class when asked for neither", () => {
    render(<Text>We roast our own masala every morning.</Text>);
    const text = screen.getByText("We roast our own masala every morning.");
    expect(text.className).not.toMatch(/(^|\s)text-(start|center|end)(\s|$)/);
    expect(text.className).not.toMatch(/(^|\s)max-w-/);
  });

  it("lets the document outline differ from the visual level", () => {
    render(
      <Text as="h1" variant="h2">
        Desi at heart.
      </Text>
    );
    expect(screen.getByRole("heading", { level: 1, name: "Desi at heart." })).toHaveClass(
      "text-h2"
    );
  });

  it("lets isBalanced={false} opt a heading out of balance", () => {
    render(
      <Text variant="h2" isBalanced={false}>
        Most ordered this week
      </Text>
    );
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveClass("text-pretty");
    expect(heading).not.toHaveClass("text-balance");
  });

  it("merges a consumer className and forwards native props", () => {
    render(
      <Text className="mt-4" id="lede" data-testid="lede">
        Lede
      </Text>
    );
    const text = screen.getByTestId("lede");
    expect(text).toHaveClass("mt-4", "m-0");
    expect(text).toHaveAttribute("id", "lede");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Text variant="h2">Chai</Text>
        <Text tone="muted">We roast our own masala every morning.</Text>
        <Text variant="overline" tone="brand">
          The Menu
        </Text>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: FAIL — `Failed to resolve import "./text" from "src/atoms/text/text.test.tsx"`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/text/text.tsx`:

```tsx
import type { ComponentProps, ElementType } from "react";

import { componentVariants } from "../../lib/component-variants";

export type TextVariant =
  | "display-1"
  | "display-2"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "body-lg"
  | "body"
  | "body-sm"
  | "caption"
  | "overline"
  | "mono";

export type TextTone =
  "heading" | "body" | "muted" | "subtle" | "brand" | "on-brand" | "inverse" | "danger";

type TextElement =
  | "p"
  | "span"
  | "div"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "label"
  | "strong"
  | "em"
  | "small"
  | "li"
  | "dt"
  | "dd"
  | "figcaption"
  | "blockquote"
  | "time";

export interface TextProps extends ComponentProps<"p"> {
  /** The type ramp step. */
  variant?: TextVariant;
  /** Semantic colour; follows the surface. Default: `heading` for display and h steps, `body` otherwise. */
  tone?: TextTone;
  /** The rendered element. The ramp step never changes with it. */
  as?: TextElement;
  weight?: "regular" | "medium" | "semibold" | "bold" | "black";
  align?: "start" | "center" | "end";
  /** Use the step's clamp() size (display-1/2, h1–h4, body) — always, in responsive layouts. */
  isFluid?: boolean;
  /** Truncate to N lines. */
  lineClamp?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Line-length cap: prose 64ch, narrow 44ch. */
  measure?: "prose" | "narrow";
  /** `text-wrap: balance` for body copy. Display and heading steps balance by default; `false` sets them `pretty`. */
  isBalanced?: boolean;
}

/** The element each step renders when `as` is not given — the design system's defaults. */
const DEFAULT_ELEMENT: Readonly<Record<TextVariant, TextElement>> = {
  "display-1": "span",
  "display-2": "span",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  "body-lg": "p",
  body: "p",
  "body-sm": "p",
  caption: "span",
  overline: "span",
  mono: "span",
};

/*
 * Each step carries its face, its ramp class (size, line height, tracking and weight in one) and
 * its default tone. `tone` is declared after `variant`, so a given tone replaces the default in
 * the merge; `componentVariants` keeps `text-h1` (a size) and `text-text-muted` (a colour) apart.
 */
const text = componentVariants({
  base: "m-0",
  variants: {
    variant: {
      "display-1": "font-display text-display-1 text-balance text-text-heading",
      "display-2": "font-display text-display-2 text-balance text-text-heading",
      h1: "font-display text-h1 text-balance text-text-heading",
      h2: "font-display text-h2 text-balance text-text-heading",
      h3: "font-display text-h3 text-balance text-text-heading",
      h4: "font-display text-h4 text-balance text-text-heading",
      "body-lg": "font-body text-body-lg text-pretty text-text-body",
      body: "font-body text-body text-pretty text-text-body",
      "body-sm": "font-body text-body-sm text-pretty text-text-body",
      caption: "font-body text-caption text-pretty text-text-body",
      overline: "font-display text-overline text-balance text-text-body uppercase",
      mono: "font-mono text-mono text-pretty text-text-body",
    },
    tone: {
      heading: "text-text-heading",
      body: "text-text-body",
      muted: "text-text-muted",
      subtle: "text-text-subtle",
      brand: "text-text-brand",
      "on-brand": "text-text-on-brand",
      inverse: "text-text-on-inverse",
      danger: "text-text-danger",
    },
    weight: {
      regular: "font-regular",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      black: "font-black",
    },
    align: { start: "text-start", center: "text-center", end: "text-end" },
    isFluid: { true: "" },
    lineClamp: {
      1: "line-clamp-1",
      2: "line-clamp-2",
      3: "line-clamp-3",
      4: "line-clamp-4",
      5: "line-clamp-5",
      6: "line-clamp-6",
    },
    measure: { prose: "max-w-text-measure-prose", narrow: "max-w-text-measure-narrow" },
    isBalanced: { true: "text-balance" },
  },
  compoundVariants: [
    { variant: "display-1", isFluid: true, class: "text-display-1-fluid" },
    { variant: "display-2", isFluid: true, class: "text-display-2-fluid" },
    { variant: "h1", isFluid: true, class: "text-h1-fluid" },
    { variant: "h2", isFluid: true, class: "text-h2-fluid" },
    { variant: "h3", isFluid: true, class: "text-h3-fluid" },
    { variant: "h4", isFluid: true, class: "text-h4-fluid" },
    { variant: "body", isFluid: true, class: "text-body-fluid" },
  ],
  defaultVariants: { variant: "body" },
});

/** Every piece of text in the system. Locks the type ramp, so nothing is ad hoc. */
export function Text({
  variant = "body",
  tone,
  as,
  weight,
  align,
  isFluid,
  lineClamp,
  measure,
  isBalanced,
  className,
  ...props
}: TextProps) {
  const Component: ElementType = as ?? DEFAULT_ELEMENT[variant];
  return (
    <Component
      className={text({
        variant,
        tone,
        weight,
        align,
        isFluid,
        lineClamp,
        measure,
        isBalanced,
        // `isBalanced={false}` opts a display or heading step out of balance. tailwind-variants
        // reads an unset boolean as `false`, so the opt-out cannot be a variant; it merges after
        // the step's `text-balance` and replaces it.
        className: [isBalanced === false ? "text-pretty" : undefined, className],
      })}
      {...props}
    />
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: PASS — all `Text` tests green.

- [ ] **Step 6: Stories**

Card rows (`Text.card.html`, one story each): `display-1`, `display-2`, `h1 h2 h3 h4`, `body-lg body body-sm`, `caption overline mono`, `tone`, `tone inverse`, `clamp={2}` (→ `lineClamp={2}`), `measure` (prose and narrow). Extras: `isFluid` (all seven fluid steps), `tone="on-brand"` and `OnSurfaces` (dev parity). The card shrinks display steps to 44/34px to fit its 700px frame; these stories show the true size.

`packages/ui/src/atoms/text/text.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Text } from "./text";

const meta = {
  title: "Atoms/Text",
  component: Text,
  args: { children: "We roast our own masala every morning.", variant: "body" },
  parameters: {
    docs: {
      description: {
        component:
          "Every string of text goes through `Text` — it is the only place the type ramp is expressed. 12 variants: display-1/2, h1–h4, body-lg/body/body-sm, caption, overline, mono. Pass `isFluid` in any responsive layout so headings clamp instead of overflowing. Display variants get `text-wrap: balance`, body gets `pretty`. Tones are semantic and follow the surface (`data-surface`), so text on a pink or ink field needs no override. `as` picks the element; the ramp step never changes with it.",
      },
    },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Display1: Story = {
  name: 'variant="display-1"',
  args: { variant: "display-1", children: "Desi at heart." },
};

export const Display2: Story = {
  name: 'variant="display-2"',
  args: { variant: "display-2", children: "Urban by nature." },
};

export const Headings: Story = {
  name: 'variant="h1" · "h2" · "h3" · "h4"',
  render: () => (
    <div className="grid gap-3">
      <Text variant="h1">Our Menu</Text>
      <Text variant="h2">Chai</Text>
      <Text variant="h3">Small Plates</Text>
      <Text variant="h4">Add-ons</Text>
    </div>
  ),
};

export const Body: Story = {
  name: 'variant="body-lg" · "body" · "body-sm"',
  render: () => (
    <div className="flex flex-wrap items-baseline gap-4">
      <Text variant="body-lg" as="span">
        Large
      </Text>
      <Text variant="body" as="span">
        Regular
      </Text>
      <Text variant="body-sm" as="span">
        Small
      </Text>
    </div>
  ),
};

export const CaptionOverlineMono: Story = {
  name: 'variant="caption" · "overline" · "mono"',
  render: () => (
    <div className="flex flex-wrap items-baseline gap-4">
      <Text variant="caption">Caption</Text>
      <Text variant="overline" tone="brand">
        Overline
      </Text>
      <Text variant="mono">PPK-4821</Text>
    </div>
  ),
};

export const Tones: Story = {
  name: "tone",
  render: () => (
    <div className="flex flex-wrap gap-4">
      {(["heading", "body", "muted", "subtle", "brand", "danger"] as const).map((tone) => (
        <Text key={tone} variant="body-sm" tone={tone} as="span">
          {tone}
        </Text>
      ))}
    </div>
  ),
};

export const ToneInverse: Story = {
  name: 'tone="inverse"',
  render: () => (
    <div data-surface="ink" className="rounded-lg bg-surface-inverse p-3.5">
      <Text variant="body-sm" tone="inverse" as="span">
        inverse
      </Text>
    </div>
  ),
};

export const ToneOnBrand: Story = {
  name: 'tone="on-brand"',
  render: () => (
    <div data-surface="brand" className="rounded-lg bg-surface-brand p-3.5">
      <Text variant="body-sm" tone="on-brand" as="span">
        on-brand
      </Text>
    </div>
  ),
};

export const LineClamp: Story = {
  name: "lineClamp={2}",
  args: {
    variant: "body-sm",
    tone: "muted",
    lineClamp: 2,
    className: "max-w-70",
    children:
      "Amritsari paneer, burnt chilli mayo, potato brioche, masala fries and a side of pickled onion that nobody asked for but everybody finishes.",
  },
};

export const Measure: Story = {
  name: 'measure="prose" · "narrow"',
  render: () => (
    <div className="grid gap-4">
      <Text measure="prose">
        We roast our own masala every morning. Before the shutters go up, the kitchen smells of
        cumin and coriander hitting a hot pan, and that is the smell the whole day is built on.
      </Text>
      <Text variant="body-sm" tone="muted" measure="narrow">
        We roast our own masala every morning, then build the rest of the day around it.
      </Text>
    </div>
  ),
};

/** Every step with a clamp() twin. Check it at the 360 viewport, the floor every layout survives. */
export const Fluid: Story = {
  name: "isFluid",
  render: () => (
    <div className="grid gap-4">
      {(["display-1", "display-2", "h1", "h2", "h3", "h4", "body"] as const).map((variant) => (
        <Text key={variant} variant={variant} isFluid>
          Desi at heart.
        </Text>
      ))}
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Text variant="h4" as="span">
        Heading
      </Text>
      <Text as="span">Body</Text>
      <Text as="span" tone="muted">
        Muted
      </Text>
      <Text as="span" variant="overline" tone="brand">
        Brand
      </Text>
    </OnSurfaces>
  ),
};
```

(The export is `OnSurfacesStory`, because `OnSurfaces` is the imported helper; `name` keeps the sidebar label `OnSurfaces`. Every later story file does the same.)

- [ ] **Step 7: Export**

In `packages/ui/src/index.ts`, add (atoms stay alphabetical by path):

```ts
export { Text, type TextProps, type TextTone, type TextVariant } from "./atoms/text/text";
```

- [ ] **Step 8: Gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/text packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/text.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: `Successfully ran targets typecheck, lint, test for 2 projects` (the variant spec confirms the two new spacing names); Storybook builds.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the Text atom, the type ramp as one component

Twelve steps, eight semantic tones that follow the surface, fluid twins,
line clamping and the two measures. Measures are spacing tokens because
Tailwind's static max-w-prose (65ch) shadows the 64ch container token.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 3: Link

**Dev reference:** `git show dev:packages/ui/src/atoms/link/link.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                                                    | Ruling  | Where / reason                                                                                     |
| ----------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| `href` required                                                                                             | DROP    | contracts §2 (`LinkProps extends ComponentProps<"a">`); with `asChild` the href lives on the child |
| Sizes on `text-body2/body1/subtitle2`, `decoration-2`, `rounded-*` names                                    | DROP    | D4; `Link.jsx` sizes 13.5/15/17 (`text-link-*`) and the base `a` rule's 1.5px underline            |
| Glyph shrinks to 14px at `sm`                                                                               | DROP    | `Link.jsx` draws `size="sm"` (16px) at every size (spec §2, rank-1 source)                         |
| `quiet` hovers pink with an underline                                                                       | DROP    | `Link.jsx` keeps it transparent; Task 15 accepted list                                             |
| `inverse` = `text-text-on-brand`                                                                            | ALREADY | `text-ink-000` + white-alpha underline, the same on pink and ink                                   |
| On-brand story sets the link at 20px bold for AA-large                                                      | DROP    | spec §5.1: white on the brand fill is the declared exception                                       |
| External arrow announced "Opens in a new tab" (`role="img"`)                                                | ADD     | Step 2 external tests; Step 4 implementation                                                       |
| Test: an internal link has no `target`/`rel`                                                                | ADD     | Step 2                                                                                             |
| Test: `onClick` fires when followed                                                                         | ADD     | Step 2                                                                                             |
| Test: caller className replaces the variant colour                                                          | ADD     | Step 2                                                                                             |
| Tests: href and name, default colour, variants, sizes, underline in every variant, glyph not announced, axe | ALREADY | Step 2 existing cases                                                                              |
| Story `WithIcons` (`iconAfter`)                                                                             | ADD     | Step 6 `Default` gains an `iconAfter` link                                                         |
| Story `OnBrand` also shows an ink panel and an external link                                                | ADD     | Step 6 `Inverse`                                                                                   |
| Story `InFooterNav` (a column of quiet links)                                                               | ADD     | Step 6                                                                                             |
| Stories `Default`, `Variants`, `Sizes`, `External`                                                          | ALREADY | `Playground`, `Default` + `SubtleQuiet`, `Sizes`, `External`                                       |

Implementer: copy this table into your report, extended with anything the plan missed.

Source: `components/atoms/Link.{jsx,d.ts,card.html,prompt.md}`. Visuals: DM Sans 500 at 13.5 / 15 / 17px, a 6px gap to the 16px glyphs, and an underline 1.5px thick at a 3px offset. The underline's rest and hover colours differ per variant. Tailwind has no 1.5px `decoration-*` utility (verified: `decoration-1.5` compiles to nothing), so the thickness and offset come from Plan 1's base `a` rule, and Link decides only colours.

**Files:**

- Create: `packages/design-tokens/tokens/component/link.json`
- Modify: `packages/design-tokens/tokens/primitive/color.json`, `tokens/surface/brand.json`, `tokens/surface/ink.json`, `tokens/surface/light.json`, `packages/design-tokens/contrast-pairs.json`
- Create: `packages/ui/src/atoms/link/link.tsx`, `link.test.tsx`, `link.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Icon`, `IconComponent`; `Slot` from `radix-ui`; `ArrowUpRight` from `lucide-react`; semantic `text-text-{link,link-hover,muted,heading}`, `decoration-border-default`.
- Produces: `Link`, `interface LinkProps extends ComponentProps<"a">` (contracts §2); tokens `text-link-{sm,md,lg}`, `color-link-underline`, `color-link-quiet`, primitives `color-white-alpha-{40,90}`.

- [ ] **Step 1: Component tokens, surface skins, contrast pairs**

In `tokens/primitive/color.json`, inside `color.white-alpha`, add these two entries (keep the keys in ascending order):

```json
"40": { "$value": "rgba(255, 255, 255, 0.4)" },
"90": { "$value": "rgba(255, 255, 255, 0.9)" },
```

`packages/design-tokens/tokens/component/link.json`:

```json
{
  "text": {
    "$type": "typography",
    "link-sm": { "$value": { "fontSize": "13.5px", "fontWeight": "{font-weight.medium}" } },
    "link-md": { "$value": { "fontSize": "15px", "fontWeight": "{font-weight.medium}" } },
    "link-lg": { "$value": { "fontSize": "17px", "fontWeight": "{font-weight.medium}" } }
  },
  "color": {
    "$type": "color",
    "link": {
      "underline": {
        "$value": "{color.pink.200}",
        "$description": "Resting underline of the default link; white at 40% on pink and ink fields."
      },
      "quiet": {
        "$value": "{color.ink.700}",
        "$description": "Nav-link text (variant quiet); white at 85% on pink and ink fields."
      }
    }
  }
}
```

(No `lineHeight`: the design system lets links inherit the surrounding line height.)

`tokens/surface/brand.json`: inside `surface-brand.color`, add:

```json
"link": {
  "underline": { "$value": "{color.white-alpha.40}" },
  "quiet": { "$value": "{color.white-alpha.85}" }
}
```

`tokens/surface/ink.json`: inside `surface-ink.color`, add the same `link` block.

`tokens/surface/light.json`: inside `surface-light.color`, add:

```json
"link": {
  "underline": { "$value": "{color.pink.200}" },
  "quiet": { "$value": "{color.ink.700}" }
}
```

`packages/design-tokens/contrast-pairs.json`: append to `groups`:

```json
{
  "id": "link",
  "surface": null,
  "pairs": [
    ["color-link-quiet", "color-surface-page"],
    ["color-link-quiet", "color-surface-page-alt"]
  ],
  "min": 4.5
},
{
  "id": "link-on-soft",
  "surface": "soft",
  "pairs": [["color-link-quiet", "color-surface-brand-soft"]],
  "min": 4.5
},
{
  "id": "link-on-ink",
  "surface": "ink",
  "pairs": [
    ["color-link-quiet", "color-surface-inverse"],
    ["color-ink-000", "color-surface-inverse"]
  ],
  "min": 4.5
},
{
  "id": "link-on-brand",
  "surface": "brand",
  "pairs": [
    ["color-link-quiet", "color-surface-brand"],
    ["color-ink-000", "color-surface-brand"]
  ],
  "min": 3,
  "exception": "brand-fill"
}
```

(Measured: ink-700 on white 11.19, on pink-50 10.48, on pink-100 ≈ 9.2; white 85% on ink-900 13.38, on pink 3.26; white on pink 4.04.)

In `component-variants.ts`, append to `TEXT`: `"link-sm", "link-md", "link-lg",`.

Run: `pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -6`
Expected: PASS. The contrast groups pass, the light-restore and alias-guard tests pass, and `surfaces.css` now declares `--color-link-underline` in the brand, ink and light blocks.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/link/link.test.tsx`:

```tsx
import type { ComponentProps, MouseEvent } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArrowRight, MapPin } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Link } from "./link";

function RouterLink({ children, ...props }: ComponentProps<"a">) {
  return (
    <a data-router="" {...props}>
      {children}
    </a>
  );
}

describe("Link", () => {
  it("is a link to its href, named by its text", () => {
    render(<Link href="/menu">See the full menu</Link>);
    expect(screen.getByRole("link", { name: "See the full menu" })).toHaveAttribute(
      "href",
      "/menu"
    );
  });

  it.each([
    ["default", "text-text-link", "decoration-link-underline"],
    ["subtle", "text-text-muted", "decoration-transparent"],
    ["inverse", "text-ink-000", "decoration-white-alpha-40"],
    ["quiet", "text-link-quiet", "decoration-transparent"],
  ] as const)("paints the %s variant with %s and a %s underline", (variant, colour, underline) => {
    render(
      <Link href="/outlets" variant={variant}>
        Outlets
      </Link>
    );
    expect(screen.getByRole("link")).toHaveClass("underline", colour, underline);
  });

  it.each([
    ["default", "hover:text-text-link-hover", "hover:decoration-current"],
    ["subtle", "hover:text-text-heading", "hover:decoration-border-default"],
    ["inverse", "text-ink-000", "hover:decoration-white-alpha-90"],
    ["quiet", "hover:text-text-link", "decoration-transparent"],
  ] as const)(
    "gives the %s variant its hover state (%s, %s)",
    (variant, hoverColour, hoverLine) => {
      render(
        <Link href="/outlets" variant={variant}>
          Outlets
        </Link>
      );
      expect(screen.getByRole("link")).toHaveClass(hoverColour, hoverLine);
    }
  );

  it.each([
    ["sm", "text-link-sm"],
    ["md", "text-link-md"],
    ["lg", "text-link-lg"],
  ] as const)("sets size %s with %s on DM Sans", (size, sizeClass) => {
    render(
      <Link href="/menu" size={size}>
        Menu
      </Link>
    );
    expect(screen.getByRole("link")).toHaveClass("font-body", sizeClass);
  });

  it("puts decorative glyphs before and after the label", () => {
    render(
      <Link href="/outlets" icon={MapPin} iconAfter={ArrowRight}>
        Find a Paprikaa
      </Link>
    );
    const link = screen.getByRole("link", { name: "Find a Paprikaa" });
    expect(link.querySelector(".lucide-map-pin")).not.toBeNull();
    expect(link.querySelector(".lucide-arrow-right")).not.toBeNull();
    expect(link.lastElementChild).toHaveClass("size-icon-sm");
  });

  it("opens an external link in a new tab with a safe rel and an announced outward arrow", () => {
    render(
      <Link href="https://www.zomato.com" isExternal>
        Zomato listing
      </Link>
    );
    const link = screen.getByRole("link", { name: /^Zomato listing/ });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer noopener");
    expect(link.querySelector(".lucide-arrow-up-right")).not.toBeNull();
    // The jump is spoken as well as drawn.
    expect(screen.getByRole("img", { name: "Opens in a new tab" })).toBeInTheDocument();
  });

  it("keeps an explicit iconAfter instead of the external arrow", () => {
    render(
      <Link href="https://www.zomato.com" isExternal iconAfter={ArrowRight}>
        Zomato
      </Link>
    );
    const link = screen.getByRole("link");
    expect(link.querySelector(".lucide-arrow-right")).not.toBeNull();
    expect(link.querySelector(".lucide-arrow-up-right")).toBeNull();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("keeps an internal link in the same tab", () => {
    render(<Link href="/menu">See the full menu</Link>);
    const link = screen.getByRole("link");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });

  it("calls onClick when followed", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });
    render(
      <Link href="/menu" onClick={onClick}>
        See the full menu
      </Link>
    );
    await user.click(screen.getByRole("link"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders a router link through asChild with the link classes and glyphs", () => {
    render(
      <Link asChild icon={MapPin}>
        <RouterLink href="/outlets">Outlets</RouterLink>
      </Link>
    );
    const link = screen.getByRole("link", { name: "Outlets" });
    expect(link).toHaveAttribute("data-router");
    expect(link).toHaveAttribute("href", "/outlets");
    expect(link).toHaveClass("text-text-link");
    expect(link.querySelector(".lucide-map-pin")).not.toBeNull();
  });

  it("is reachable from the keyboard", async () => {
    const user = userEvent.setup();
    render(<Link href="/menu">See the full menu</Link>);
    await user.tab();
    expect(screen.getByRole("link")).toHaveFocus();
  });

  it("merges a consumer className", () => {
    render(
      <Link href="/menu" className="whitespace-nowrap">
        Menu
      </Link>
    );
    expect(screen.getByRole("link")).toHaveClass("whitespace-nowrap", "inline-flex");
  });

  it("lets a consumer className replace the variant colour", () => {
    render(
      <Link href="/menu" className="text-text-muted">
        See the full menu
      </Link>
    );
    const link = screen.getByRole("link");
    expect(link).toHaveClass("text-text-muted");
    expect(link).not.toHaveClass("text-text-link");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Link href="/outlets" icon={MapPin}>
          Find a Paprikaa
        </Link>
        <Link href="https://www.zomato.com" isExternal>
          Zomato listing
        </Link>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: FAIL — `Failed to resolve import "./link"`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/link/link.tsx`:

```tsx
import type { ComponentProps, ElementType } from "react";

import { ArrowUpRight } from "lucide-react";
import { Slot } from "radix-ui";

import { componentVariants } from "../../lib/component-variants";
import { Icon, type IconComponent } from "../icon/icon";

export interface LinkProps extends ComponentProps<"a"> {
  /** default = pink underline · subtle = muted · inverse = white, on pink/ink · quiet = nav links. */
  variant?: "default" | "subtle" | "inverse" | "quiet";
  size?: "sm" | "md" | "lg";
  icon?: IconComponent;
  iconAfter?: IconComponent;
  /** Opens in a new tab with a safe `rel` and appends the outward arrow, announced "Opens in a new tab". */
  isExternal?: boolean;
  /** Render the single child (e.g. `next/link`) with Link styling. */
  asChild?: boolean;
}

/*
 * Colours only: the underline's 1.5px thickness and 3px offset come from the base `a` rule every
 * anchor gets (Tailwind has no 1.5px decoration utility). `default` and `subtle` paint with
 * semantic tokens and `quiet` with a surface-aware token, so all three follow a pink or ink field.
 */
const link = componentVariants({
  base: "inline-flex items-center gap-1.5 font-body underline transition-colors duration-fast ease-out",
  variants: {
    variant: {
      default:
        "text-text-link decoration-link-underline hover:text-text-link-hover hover:decoration-current",
      subtle:
        "text-text-muted decoration-transparent hover:text-text-heading hover:decoration-border-default",
      inverse: "text-ink-000 decoration-white-alpha-40 hover:decoration-white-alpha-90",
      quiet: "text-link-quiet decoration-transparent hover:text-text-link",
    },
    size: { sm: "text-link-sm", md: "text-link-md", lg: "text-link-lg" },
  },
  defaultVariants: { variant: "default", size: "md" },
});

const EXTERNAL = { target: "_blank", rel: "noreferrer noopener" } as const;

/** Inline or standalone link. Underline is the brand's link signal. */
export function Link({
  variant,
  size,
  icon,
  iconAfter,
  isExternal = false,
  asChild = false,
  className,
  children,
  ...props
}: LinkProps) {
  const Component: ElementType = asChild ? Slot.Root : "a";
  // The outward arrow is the one glyph that speaks: it tells a screen reader the link opens a new
  // tab. A caller's own `iconAfter` is decorative and replaces it. (Icon's `label` predates R13,
  // so the named arrow is its own element rather than `label={cond ? … : undefined}`.)
  const hasExternalArrow = isExternal && iconAfter === undefined;
  return (
    <Component
      className={link({ variant, size, className })}
      {...(isExternal ? EXTERNAL : undefined)}
      {...props}
    >
      {icon ? <Icon icon={icon} size="sm" /> : null}
      <Slot.Slottable child={children}>{(label) => label}</Slot.Slottable>
      {iconAfter ? <Icon icon={iconAfter} size="sm" /> : null}
      {hasExternalArrow ? <Icon icon={ArrowUpRight} size="sm" label="Opens in a new tab" /> : null}
    </Component>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: PASS.

- [ ] **Step 6: Stories**

Card rows (`Link.card.html`): `default` (plain + `icon`, plus `iconAfter`), `subtle quiet`, `inverse` (on brand, plus an ink panel), `size`, `external` (→ `isExternal`). Extras: `asChild`, `OnSurfaces`, `InFooterNav` (dev parity).

`packages/ui/src/atoms/link/link.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";

import { ArrowRight, MapPin } from "lucide-react";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Link } from "./link";

function DemoRouterLink({ children, ...props }: ComponentProps<"a">) {
  return (
    <a data-router="" {...props}>
      {children}
    </a>
  );
}

const meta = {
  title: "Atoms/Link",
  component: Link,
  args: { href: "/menu", children: "See the full menu", variant: "default", size: "md" },
  argTypes: { icon: { control: false }, iconAfter: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          "Text links. Never leave an `<a>` unstyled — browser blue is not in the palette. `quiet` is the header/footer nav treatment (no underline). `isExternal` adds the arrow and the safe `rel`, and opens a new tab. `default`, `subtle` and `quiet` follow the surface; `inverse` is the explicit white link for pink and ink fields. `asChild` renders your router link (e.g. `next/link`) with the same styling. In running prose a bare `<a>` already carries the link style from the base layer.",
      },
    },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Default: Story = {
  name: 'variant="default"',
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Link href="/menu">See the full menu</Link>
      <Link href="/outlets" icon={MapPin}>
        Find a Paprikaa
      </Link>
      <Link href="/about" iconAfter={ArrowRight}>
        Our story
      </Link>
    </div>
  ),
};

export const SubtleQuiet: Story = {
  name: 'variant="subtle" · "quiet"',
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Link href="/legal" variant="subtle">
        Privacy
      </Link>
      <Link href="/outlets" variant="quiet">
        Outlets
      </Link>
    </div>
  ),
};

export const Inverse: Story = {
  name: 'variant="inverse"',
  render: () => (
    <div className="grid gap-3">
      <div
        data-surface="brand"
        className="flex flex-wrap items-center gap-4 rounded-lg bg-surface-brand p-3.5"
      >
        <Link href="/legal" variant="inverse">
          FSSAI licence
        </Link>
        <Link href="https://www.zomato.com" isExternal variant="inverse">
          Zomato listing
        </Link>
      </div>
      <div
        data-surface="ink"
        className="flex flex-wrap items-center gap-4 rounded-lg bg-surface-inverse p-3.5"
      >
        <Link href="/legal" variant="inverse">
          FSSAI licence
        </Link>
        <Link href="https://www.zomato.com" isExternal variant="inverse">
          Zomato listing
        </Link>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Link href="/menu" size="sm">
        Small
      </Link>
      <Link href="/menu" size="md">
        Medium
      </Link>
      <Link href="/menu" size="lg">
        Large
      </Link>
    </div>
  ),
};

export const External: Story = {
  name: "isExternal",
  args: { href: "https://www.zomato.com", isExternal: true, children: "Zomato listing" },
};

export const AsChild: Story = {
  name: "asChild (router link)",
  render: () => (
    <Link asChild icon={MapPin}>
      <DemoRouterLink href="/outlets">Outlets</DemoRouterLink>
    </Link>
  ),
};

/** In context: a footer column, where `quiet` keeps the nav calm until it is pointed at. */
export const InFooterNav: Story = {
  name: "in context: footer nav",
  render: () => (
    <nav aria-label="Footer" className="flex flex-col items-start gap-3">
      <Link href="/menu" variant="quiet">
        Menu
      </Link>
      <Link href="/outlets" variant="quiet">
        Outlets
      </Link>
      <Link href="/catering" variant="quiet">
        Party Orders
      </Link>
      <Link href="/contact" variant="quiet">
        Contact
      </Link>
    </nav>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Link href="/menu">Default</Link>
      <Link href="/legal" variant="subtle">
        Subtle
      </Link>
      <Link href="/outlets" variant="quiet">
        Quiet
      </Link>
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { Link, type LinkProps } from "./atoms/link/link";
```

- [ ] **Step 8: Gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/link packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens packages/design-tokens/contrast-pairs.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: green; Storybook builds.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the Link atom with surface-aware underline and nav tones

Four variants, three sizes, glyphs, external links and asChild for router
links. Default and quiet links flip to white on pink and ink fields through
surface tokens restored on light islands; new pairs are in the contrast gate.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 4: PatternField

**Dev reference:** `git show dev:packages/ui/src/atoms/pattern-field/pattern-field.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                            | Ruling  | Where / reason                                                                      |
| ----------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------- |
| `tile` as a free number; an SVG `<pattern>` per instance with `useId` ids           | DROP    | spec §8.2 (numeric px → token enum); R19 (one shared CSS mask, no per-instance SVG) |
| `"use client"`                                                                      | DROP    | D6 — the mask needs no hook, so the field stays server-safe                         |
| `light` on `bg-surface-card`; `rounded-4/5`                                         | DROP    | `PatternField.jsx` (the page ground); D4 radius names                               |
| Texture colour from tokens, ≤12% per tone, `aria-hidden`, content above the texture | ALREADY | Step 2 tone, density, decorative and stacking tests                                 |
| Radii `none`/`md`/`lg`                                                              | ALREADY | Step 2 radius test (plus `xl`)                                                      |
| `isolate` on the root, so the texture's stacking context stays inside the panel     | ADD     | Step 4 `root` slot; Step 2 first test                                               |
| Test: every instance has its own paint server                                       | ALREADY | nothing to collide: the tile is one CSS custom property (R19)                       |
| Test: caller className replaces the radius                                          | ADD     | Step 2                                                                              |
| Stories `Default`, `Tones`, `TileSizes`                                             | ALREADY | `Playground`/`Brand`, the four tone stories, `Tiles`                                |
| Story `FullBleedBand` (edge to edge, no radius)                                     | ADD     | Step 6                                                                              |

Implementer: copy this table into your report, extended with anything the plan missed.

Source: `components/atoms/PatternField.{jsx,d.ts,card.html,prompt.md}`, readme §3.4, spec §7.2 and C7. The field is a flooded colour with the diamond symbol tiled over it. The zip loads `symbol-white.svg` or `symbol-pink.svg`; here one tile does both jobs. Plan 1's white-symbol data URI is used as a CSS **mask** over a tone-coloured layer, so the same tile paints white on brand/ink and pink on soft/light with no second asset and no literal colour. Opacity: 8% on dark fields, 9% on light ones, 4% for `density="faint"` (the handoff's ink sections).

**Files:**

- Modify: `packages/ui/src/styles.css` (tile and opacity utilities)
- Create: `packages/ui/src/atoms/pattern-field/pattern-field.tsx`, `pattern-field.test.tsx`, `pattern-field.stories.tsx`
- Modify: `packages/ui/src/index.ts`
- Tokens: none new. Tiles (`--pattern-tile-*`) and opacities (`--pattern-opacity-*`) are Plan 1 primitives. `contrast-pairs.json`: unchanged, because text on each field is covered by Plan 1's semantic surface groups.

**Interfaces:**

- Consumes: the CSS custom property `--pp-symbol-mask` (`lib/brand-artwork.css`, R19/R25), `Slot`, `componentVariants`; `bg-surface-{brand,inverse,brand-soft,page}`.
- Produces: `PatternField`, `interface PatternFieldProps extends ComponentProps<"div">` (contracts §2); utilities `pattern-tile-{56,64,72,80,86,96}`, `pattern-opacity-{default,light,faint}`.

- [ ] **Step 1: Named utilities for the tile tokens**

Tailwind has no token-backed `mask-size` or pattern-opacity utility (the only forms are arbitrary). Append to `packages/ui/src/styles.css`, after `transition-control`:

```css
/* PatternField (spec §7.2): the tile image is the white symbol as a mask, set by the component;
   these carry the token-backed tile size and opacity. */
@utility pattern-tile-56 {
  mask-size: var(--pattern-tile-56);
}

@utility pattern-tile-64 {
  mask-size: var(--pattern-tile-64);
}

@utility pattern-tile-72 {
  mask-size: var(--pattern-tile-72);
}

@utility pattern-tile-80 {
  mask-size: var(--pattern-tile-80);
}

@utility pattern-tile-86 {
  mask-size: var(--pattern-tile-86);
}

@utility pattern-tile-96 {
  mask-size: var(--pattern-tile-96);
}

@utility pattern-opacity-default {
  opacity: var(--pattern-opacity-default);
}

@utility pattern-opacity-light {
  opacity: var(--pattern-opacity-light);
}

@utility pattern-opacity-faint {
  opacity: var(--pattern-opacity-faint);
}
```

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/pattern-field/pattern-field.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { PatternField } from "./pattern-field";

describe("PatternField", () => {
  it("floods the brand pink by default and makes its content a brand surface", () => {
    const { container } = render(
      <PatternField>
        <h2>Flooded field</h2>
      </PatternField>
    );
    const field = container.firstElementChild;
    expect(field).toHaveAttribute("data-surface", "brand");
    expect(field).toHaveClass("relative", "isolate", "overflow-hidden", "bg-surface-brand");
  });

  it.each([
    ["brand", "bg-surface-brand", "bg-ink-000"],
    ["ink", "bg-surface-inverse", "bg-ink-000"],
    ["soft", "bg-surface-brand-soft", "bg-pink-500"],
    ["light", "bg-surface-page", "bg-pink-500"],
  ] as const)("tone %s sets data-surface, the %s field and a %s mark", (tone, field, mark) => {
    const { container } = render(<PatternField tone={tone}>Field</PatternField>);
    const root = container.firstElementChild;
    expect(root).toHaveAttribute("data-surface", tone);
    expect(root).toHaveClass(field);
    expect(root?.firstElementChild).toHaveClass(mark);
  });

  it("tiles the symbol at 64px by default and at any tile token", () => {
    const { container, rerender } = render(<PatternField>Field</PatternField>);
    expect(container.firstElementChild?.firstElementChild).toHaveClass("pattern-tile-64");
    rerender(<PatternField tile={96}>Field</PatternField>);
    expect(container.firstElementChild?.firstElementChild).toHaveClass("pattern-tile-96");
  });

  it.each([
    ["brand", "pattern-opacity-default"],
    ["ink", "pattern-opacity-default"],
    ["soft", "pattern-opacity-light"],
    ["light", "pattern-opacity-light"],
  ] as const)("uses the %s field's default density (%s) and only that one", (tone, opacity) => {
    const { container } = render(<PatternField tone={tone}>Field</PatternField>);
    const pattern = container.firstElementChild?.firstElementChild;
    expect(pattern).toHaveClass(opacity);
    expect(pattern?.className.match(/pattern-opacity-/g)).toHaveLength(1);
  });

  it("whispers at 4% when density is faint", () => {
    const { container } = render(
      <PatternField tone="ink" density="faint">
        Field
      </PatternField>
    );
    const pattern = container.firstElementChild?.firstElementChild;
    expect(pattern).toHaveClass("pattern-opacity-faint");
    expect(pattern?.className.match(/pattern-opacity-/g)).toHaveLength(1);
  });

  it("keeps the pattern decorative and out of the pointer's way", () => {
    const { container } = render(<PatternField>Field</PatternField>);
    const pattern = container.firstElementChild?.firstElementChild;
    expect(pattern).toHaveAttribute("aria-hidden", "true");
    expect(pattern).toHaveClass("pointer-events-none", "absolute", "inset-0");
  });

  it("paints the tile through the white symbol mask, rendered on the server", () => {
    const html = renderToStaticMarkup(<PatternField tone="ink">Statement</PatternField>);
    expect(html).toContain('data-surface="ink"');
    expect(html).toContain("mask-image:var(--pp-symbol-mask)");
  });

  it("stacks its content above the pattern", () => {
    render(
      <PatternField>
        <h2>Flooded field</h2>
      </PatternField>
    );
    expect(screen.getByRole("heading").parentElement).toHaveClass("relative", "h-full");
  });

  it.each([
    ["none", "rounded-none"],
    ["md", "rounded-md"],
    ["lg", "rounded-lg"],
    ["xl", "rounded-xl"],
  ] as const)("rounds %s with %s", (radius, radiusClass) => {
    const { container } = render(<PatternField radius={radius}>Field</PatternField>);
    expect(container.firstElementChild).toHaveClass(radiusClass);
  });

  it("patterns an existing element through asChild", () => {
    render(
      <PatternField asChild tone="ink">
        <section aria-label="Delivery zones">
          <h2>Delivery zones</h2>
        </section>
      </PatternField>
    );
    const section = screen.getByRole("region", { name: "Delivery zones" });
    expect(section).toHaveAttribute("data-surface", "ink");
    expect(section).toHaveClass("bg-surface-inverse");
    expect(section.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(within(section).getByRole("heading", { name: "Delivery zones" })).toBeInTheDocument();
  });

  it("merges a consumer className and forwards native props", () => {
    const { container } = render(
      <PatternField className="p-10" id="offer">
        Field
      </PatternField>
    );
    expect(container.firstElementChild).toHaveClass("p-10", "bg-surface-brand");
    expect(container.firstElementChild).toHaveAttribute("id", "offer");
  });

  it("lets a consumer className replace its radius", () => {
    const { container } = render(
      <PatternField radius="md" className="rounded-xl">
        Field
      </PatternField>
    );
    expect(container.firstElementChild).toHaveClass("rounded-xl");
    expect(container.firstElementChild).not.toHaveClass("rounded-md");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <PatternField tone="brand">
        <h2>Tonight only</h2>
        <p>Chai at 8am, chilli paneer at midnight.</p>
      </PatternField>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: FAIL — `Failed to resolve import "./pattern-field"`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/pattern-field/pattern-field.tsx`:

```tsx
import type { ComponentProps, ElementType } from "react";

import { Slot } from "radix-ui";

import { componentVariants } from "../../lib/component-variants";

export interface PatternFieldProps extends ComponentProps<"div"> {
  /** The field colour; also its `data-surface`, so everything inside follows it. */
  tone?: "brand" | "ink" | "soft" | "light";
  /** Tile size in px — 96 on a 1080 canvas, 56–72 on screen. */
  tile?: 56 | 64 | 72 | 80 | 86 | 96;
  /** default = 8% on brand/ink, 9% on soft/light · faint = 4% (the handoff's ink sections). */
  density?: "default" | "faint";
  radius?: "none" | "md" | "lg" | "xl";
  /** Pattern an existing element (e.g. a `<section>`) instead of rendering a `<div>`. */
  asChild?: boolean;
}

/** One white symbol tile, used as a mask: the colour painted through it comes from the tone. */
const PATTERN_MASK = { maskImage: "var(--pp-symbol-mask)" } as const;

const patternField = componentVariants({
  slots: {
    // `isolate`: the texture's stacking context stays inside the panel, so an overlapping card
    // cannot slide underneath it.
    root: "relative isolate overflow-hidden",
    pattern: "pointer-events-none absolute inset-0",
    content: "relative h-full",
  },
  variants: {
    tone: {
      brand: { root: "bg-surface-brand", pattern: "bg-ink-000" },
      ink: { root: "bg-surface-inverse", pattern: "bg-ink-000" },
      soft: { root: "bg-surface-brand-soft", pattern: "bg-pink-500" },
      light: { root: "bg-surface-page", pattern: "bg-pink-500" },
    },
    tile: {
      56: { pattern: "pattern-tile-56" },
      64: { pattern: "pattern-tile-64" },
      72: { pattern: "pattern-tile-72" },
      80: { pattern: "pattern-tile-80" },
      86: { pattern: "pattern-tile-86" },
      96: { pattern: "pattern-tile-96" },
    },
    density: { default: {}, faint: { pattern: "pattern-opacity-faint" } },
    radius: {
      none: { root: "rounded-none" },
      md: { root: "rounded-md" },
      lg: { root: "rounded-lg" },
      xl: { root: "rounded-xl" },
    },
  },
  // Exactly one opacity class per field: tailwind-merge cannot resolve two custom utilities.
  compoundVariants: [
    { tone: ["brand", "ink"], density: "default", class: { pattern: "pattern-opacity-default" } },
    { tone: ["soft", "light"], density: "default", class: { pattern: "pattern-opacity-light" } },
  ],
  defaultVariants: { tone: "brand", tile: 64, density: "default", radius: "none" },
});

/** The brand's only texture: the diamond symbol tiled at low opacity over a flooded field. */
export function PatternField({
  tone = "brand",
  tile,
  density,
  radius,
  asChild = false,
  className,
  children,
  ...props
}: PatternFieldProps) {
  const slots = patternField({ tone, tile, density, radius });
  const Component: ElementType = asChild ? Slot.Root : "div";
  return (
    <Component data-surface={tone} className={slots.root({ className })} {...props}>
      <span aria-hidden className={slots.pattern()} style={PATTERN_MASK} />
      <Slot.Slottable child={children}>
        {(content) => <div className={slots.content()}>{content}</div>}
      </Slot.Slottable>
    </Component>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: PASS.

- [ ] **Step 6: Stories**

Card rows (`PatternField.card.html`, all at tile 64 with radius lg): `brand`, `ink`, `soft`. Extras: `light`, `density="faint"`, `tile`, `asChild`, `FullBleedBand` (dev parity).

`packages/ui/src/atoms/pattern-field/pattern-field.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { PatternField } from "./pattern-field";

function Inner({ caption }: { caption: string }) {
  return (
    <div className="p-4">
      <h4 className="m-0">Flooded field</h4>
      <p className="m-0 font-body text-caption">{caption}</p>
    </div>
  );
}

const meta = {
  title: "Atoms/PatternField",
  component: PatternField,
  args: {
    tone: "brand",
    tile: 64,
    radius: "lg",
    children: <Inner caption="tile 64 · density default" />,
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Flooded brand panel with the diamond symbol tiled behind it — the brand's single texture. It sets `data-surface` to its tone, so headings, copy and links inside follow the field with no colour props. `tile` is 96 on a 1080 canvas, 56–72 on screen; `density=\"faint\"` (4%) is the handoff's whisper for ink sections. The pattern is a whisper, never a graphic element: no noise, grain or gradients alongside it. `asChild` patterns your own `<section>`.",
      },
    },
  },
} satisfies Meta<typeof PatternField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Brand: Story = { name: 'tone="brand"', args: { tone: "brand" } };

export const Ink: Story = { name: 'tone="ink"', args: { tone: "ink" } };

export const Soft: Story = { name: 'tone="soft"', args: { tone: "soft" } };

export const Light: Story = {
  name: 'tone="light"',
  args: { tone: "light", className: "border border-border-subtle" },
};

export const Faint: Story = {
  name: 'density="faint"',
  args: { tone: "ink", tile: 80, density: "faint", children: <Inner caption="tile 80 · faint" /> },
};

export const Tiles: Story = {
  name: "tile",
  render: () => (
    <div className="grid grid-cols-3 gap-3">
      {([56, 64, 72, 80, 86, 96] as const).map((tile) => (
        <PatternField key={tile} tone="brand" tile={tile} radius="lg" className="h-40">
          <Inner caption={`tile ${String(tile)}`} />
        </PatternField>
      ))}
    </div>
  ),
};

export const AsChild: Story = {
  name: "asChild (section)",
  render: () => (
    <PatternField asChild tone="ink" density="faint" tile={80} radius="xl" className="p-8">
      <section aria-label="Delivery zones">
        <h2 className="m-0">Delivery zones</h2>
        <p className="m-0 font-body text-body">Free within 3 km of Sector 57.</p>
      </section>
    </PatternField>
  ),
};

/** A full-bleed section band: no radius, edge to edge. */
export const FullBleedBand: Story = {
  name: 'full-bleed band (radius="none")',
  parameters: { layout: "fullscreen" },
  render: () => (
    <PatternField tone="ink" radius="none">
      <div className="container-page section-y">
        <h2 className="m-0 text-balance">Momos, chaat and North Indian plates from ₹180–₹320</h2>
      </div>
    </PatternField>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { PatternField, type PatternFieldProps } from "./atoms/pattern-field/pattern-field";
```

- [ ] **Step 8: Gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/pattern-field packages/ui/src/styles.css packages/ui/src/index.ts
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: green (`styles.spec.ts` confirms the new utilities hold no literal colour); Storybook builds.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui
git commit -m "feat(ui): add the PatternField atom, the tiled diamond texture

One white symbol tile is used as a mask over a tone colour, so the pattern
paints white on pink and ink and pink on soft and light, server-rendered with
no second asset. Tile size and opacity are named utilities over the tokens;
the field sets data-surface so its content follows it.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 5: SocialHeadline

**Dev reference:** `git show dev:packages/ui/src/atoms/social-headline/social-headline.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                                                           | Ruling  | Where / reason                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `on` prop (brand/ink/soft/light)                                                                                   | DROP    | D5 — colour follows the artboard's `data-surface`                                                                                                    |
| Body and caption at 88% white on dark grounds                                                                      | DROP    | spec §3.2.2 (`--text-body` is white on brand/ink); `/88` is not a token                                                                              |
| Soft ground ink `pink-800`                                                                                         | ALREADY | the soft surface's `text-heading`                                                                                                                    |
| Default element `p` for every size                                                                                 | DROP    | contracts §0.0 (the plan's code wins shape); plan deviation 4 defaults hero/h1/h2 to `h2`                                                            |
| Measures `narrow` 14ch / `wide` 34ch / `none`; a size-dependent default (34ch for body/caption, none for overline) | DROP    | contracts §2 (`tight`/`default`/`wide`, deviation 4) and `SocialHeadline.d.ts` (one default, 18ch). `className="max-w-none"` still frees an overline |
| `align="end"` pushes the block (`ms-auto`)                                                                         | DROP    | `SocialHeadline.jsx` moves the block only for `center`                                                                                               |
| Arbitrary `leading-[…]`, `tracking-[…]`, `max-w-[…]`                                                               | DROP    | AUTHORING §6; the canvas composites and measure tokens replace them                                                                                  |
| Tests: every size, overline caps and tracking, balance, measures, centring, `as`, axe                              | ALREADY | Step 2 (the tracking lives in `text-canvas-overline`)                                                                                                |
| Test: caller className replaces the size step                                                                      | ADD     | Step 2                                                                                                                                               |
| Stories `Ramp`, `Grounds`                                                                                          | ALREADY | the four size-row stories; `OnSurfaces`                                                                                                              |
| Story `Alignment`                                                                                                  | ADD     | Step 6                                                                                                                                               |
| Story `OnACanvas` (a whole post)                                                                                   | ADD     | Step 6, at true pixels on a brand field                                                                                                              |
| Half-scale `Artboard` wrapper                                                                                      | DROP    | Task 15 accepted difference: true canvas pixels here; PostFrame (Plan 2c) scales artboards                                                           |

Implementer: copy this table into your report, extended with anything the plan missed.

Source: `components/atoms/SocialHeadline.{jsx,d.ts,card.html,prompt.md}`, readme §4b. Canvas type: hero 132 / 0.96 / −0.035em, h1 96 / 1.0 / −0.03em, h2 72 / 1.05 / −0.025em (all Poppins 800), body 34 / 1.45 and caption 26 / 1.4 (DM Sans 500), overline 24 / 1.2 / +0.14em (Poppins 700, capitals). Always `text-wrap: balance`, capped by a measure. The `on` prop is removed (D5): colour follows the artboard's surface.

**Files:**

- Modify: `packages/design-tokens/tokens/primitive/typography.json` (the six `canvas-*` composites)
- Create: `packages/design-tokens/tokens/component/social-headline.json`
- Create: `packages/ui/src/atoms/social-headline/social-headline.tsx`, `social-headline.test.tsx`, `social-headline.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`
- `contrast-pairs.json`: unchanged (semantic heading/body tokens on every surface).

**Interfaces:**

- Consumes: `componentVariants`; `text-canvas-*`, `text-text-{heading,body}`.
- Produces: `SocialHeadline`, `interface SocialHeadlineProps extends ComponentProps<"h2">` (contracts §2); tokens `spacing-social-headline-{tight,default,wide}`; the canvas composites gain line height, tracking and weight.

- [ ] **Step 1: Tokens**

The canvas scale **is** SocialHeadline's scale (readme §4b), so the line heights, tracking and weights belong on the canvas composites themselves, not in a parallel set. In `tokens/primitive/typography.json`, replace the six `canvas-*` entries with:

```json
"canvas-hero": {
  "$value": {
    "fontSize": "132px",
    "lineHeight": 0.96,
    "letterSpacing": "-0.035em",
    "fontWeight": "{font-weight.black}"
  },
  "$description": "Marketing canvas type (1080px artboards) — never on screens. Set through SocialHeadline."
},
"canvas-h1": {
  "$value": { "fontSize": "96px", "lineHeight": 1, "letterSpacing": "-0.03em", "fontWeight": "{font-weight.black}" }
},
"canvas-h2": {
  "$value": { "fontSize": "72px", "lineHeight": 1.05, "letterSpacing": "-0.025em", "fontWeight": "{font-weight.black}" }
},
"canvas-body": {
  "$value": { "fontSize": "34px", "lineHeight": 1.45, "fontWeight": "{font-weight.medium}" }
},
"canvas-caption": {
  "$value": { "fontSize": "26px", "lineHeight": 1.4, "fontWeight": "{font-weight.medium}" }
},
"canvas-overline": {
  "$value": { "fontSize": "24px", "lineHeight": 1.2, "letterSpacing": "0.14em", "fontWeight": "{font-weight.bold}" }
}
```

`packages/design-tokens/tokens/component/social-headline.json` (the medians of every `max` the marketing kits pass: headlines 10–16ch, body 26–34ch):

```json
{
  "spacing": {
    "$type": "dimension",
    "social-headline-tight": {
      "$value": "12ch",
      "$description": "measure=\"tight\" — hero statements, 2–3 balanced lines."
    },
    "social-headline-default": {
      "$value": "18ch",
      "$description": "measure=\"default\" — the design system's default cap."
    },
    "social-headline-wide": {
      "$value": "30ch",
      "$description": "measure=\"wide\" — body and caption copy on a canvas."
    }
  }
}
```

In `component-variants.ts`, append to `SPACING`: `"social-headline-tight", "social-headline-default", "social-headline-wide",`.

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && rtk proxy grep -n "text-canvas-hero" packages/design-tokens/dist/theme.css`
Expected: four lines: `--text-canvas-hero: 132px;`, `--line-height: 0.96`, `--letter-spacing: -0.035em`, `--font-weight: 800`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/social-headline/social-headline.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { SocialHeadline } from "./social-headline";

describe("SocialHeadline", () => {
  it("sets a canvas h1 as a balanced h2 on the display face by default", () => {
    render(<SocialHeadline>Masala Cold Brew</SocialHeadline>);
    const headline = screen.getByRole("heading", { level: 2, name: "Masala Cold Brew" });
    expect(headline).toHaveClass(
      "m-0",
      "font-display",
      "text-canvas-h1",
      "text-balance",
      "text-text-heading",
      "max-w-social-headline-default"
    );
  });

  it.each([
    ["hero", "text-canvas-hero", "H2", "font-display"],
    ["h1", "text-canvas-h1", "H2", "font-display"],
    ["h2", "text-canvas-h2", "H2", "font-display"],
    ["body", "text-canvas-body", "P", "font-body"],
    ["caption", "text-canvas-caption", "P", "font-body"],
    ["overline", "text-canvas-overline", "P", "font-display"],
  ] as const)("size %s uses %s on a <%s> in %s", (size, sizeClass, tag, face) => {
    render(<SocialHeadline size={size}>Chai first</SocialHeadline>);
    const text = screen.getByText("Chai first");
    expect(text.tagName).toBe(tag);
    expect(text).toHaveClass(sizeClass, face);
  });

  it.each([
    ["body", "text-text-body"],
    ["caption", "text-text-body"],
    ["hero", "text-text-heading"],
    ["overline", "text-text-heading"],
  ] as const)("paints %s in the surface's %s token — never its own colour", (size, colour) => {
    render(<SocialHeadline size={size}>Cold brew, jaggery, cardamom.</SocialHeadline>);
    const text = screen.getByText("Cold brew, jaggery, cardamom.");
    expect(text).toHaveClass(colour);
    expect(text.className.match(/(^|\s)text-text-/g)).toHaveLength(1);
  });

  it("sets the overline in capitals", () => {
    render(<SocialHeadline size="overline">Tonight Only</SocialHeadline>);
    expect(screen.getByText("Tonight Only")).toHaveClass("uppercase");
  });

  it.each([
    ["tight", "max-w-social-headline-tight"],
    ["default", "max-w-social-headline-default"],
    ["wide", "max-w-social-headline-wide"],
  ] as const)("caps the %s measure with %s", (measure, measureClass) => {
    render(<SocialHeadline measure={measure}>One kitchen. One grinder.</SocialHeadline>);
    expect(screen.getByRole("heading")).toHaveClass(measureClass);
  });

  it("centres the block as well as its lines", () => {
    render(<SocialHeadline align="center">Chai first</SocialHeadline>);
    expect(screen.getByRole("heading")).toHaveClass("text-center", "mx-auto");
  });

  it("aligns to the end without moving the block", () => {
    render(<SocialHeadline align="end">Chai first</SocialHeadline>);
    const headline = screen.getByRole("heading");
    expect(headline).toHaveClass("text-end");
    expect(headline).not.toHaveClass("mx-auto");
  });

  it("lets `as` make it the artboard's one h1", () => {
    render(
      <SocialHeadline size="hero" as="h1">
        Chai first, decisions later.
      </SocialHeadline>
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("text-canvas-hero");
  });

  it("merges a consumer className", () => {
    render(<SocialHeadline className="mt-8">Chai first</SocialHeadline>);
    expect(screen.getByRole("heading")).toHaveClass("mt-8", "m-0");
  });

  it("lets a consumer className replace the size step", () => {
    render(<SocialHeadline className="text-canvas-h2">Masala Cold Brew</SocialHeadline>);
    const headline = screen.getByRole("heading");
    expect(headline).toHaveClass("text-canvas-h2");
    expect(headline).not.toHaveClass("text-canvas-h1");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <SocialHeadline size="overline">Tonight Only</SocialHeadline>
        <SocialHeadline size="hero">Chai first, decisions later.</SocialHeadline>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: FAIL — `Failed to resolve import "./social-headline"`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/social-headline/social-headline.tsx`:

```tsx
import type { ComponentProps, ElementType } from "react";

import { componentVariants } from "../../lib/component-variants";

export interface SocialHeadlineProps extends ComponentProps<"h2"> {
  /** Canvas px: hero 132 · h1 96 · h2 72 · body 34 · caption 26 · overline 24. */
  size?: "hero" | "h1" | "h2" | "body" | "caption" | "overline";
  align?: "start" | "center" | "end";
  /** Line-length cap: tight 12ch · default 18ch (2–3 balanced lines) · wide 30ch (body copy). */
  measure?: "tight" | "default" | "wide";
  /** Element. Default: `h2` for hero, h1 and h2; `p` for body, caption and overline. */
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

type Size = NonNullable<SocialHeadlineProps["size"]>;

const DEFAULT_ELEMENT: Readonly<Record<Size, "h2" | "p">> = {
  hero: "h2",
  h1: "h2",
  h2: "h2",
  body: "p",
  caption: "p",
  overline: "p",
};

const socialHeadline = componentVariants({
  base: "m-0 text-balance text-text-heading",
  variants: {
    size: {
      hero: "font-display text-canvas-hero",
      h1: "font-display text-canvas-h1",
      h2: "font-display text-canvas-h2",
      body: "font-body text-canvas-body text-text-body",
      caption: "font-body text-canvas-caption text-text-body",
      overline: "font-display text-canvas-overline uppercase",
    },
    align: { start: "text-start", center: "mx-auto text-center", end: "text-end" },
    measure: {
      tight: "max-w-social-headline-tight",
      default: "max-w-social-headline-default",
      wide: "max-w-social-headline-wide",
    },
  },
  defaultVariants: { size: "h1", align: "start", measure: "default" },
});

/** Canvas-scale type for marketing artboards. Balanced wrapping, never clipped. */
export function SocialHeadline({
  size = "h1",
  align,
  measure,
  as,
  className,
  ...props
}: SocialHeadlineProps) {
  const Component: ElementType = as ?? DEFAULT_ELEMENT[size];
  return <Component className={socialHeadline({ size, align, measure, className })} {...props} />;
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: PASS.

- [ ] **Step 6: Stories**

Card rows (`SocialHeadline.card.html`, shown there at 40% scale): `overline`, `hero`, `h1 / h2`, `body / caption`. These stories show true canvas pixels (PostFrame in Plan 2c does the scaling), so view them in the `xl — 1280` viewport. Extras: `OnSurfaces`, `Alignment` and `OnACanvas` (dev parity).

`packages/ui/src/atoms/social-headline/social-headline.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { SocialHeadline } from "./social-headline";

const meta = {
  title: "Atoms/SocialHeadline",
  component: SocialHeadline,
  args: { children: "Chai first, decisions later.", size: "hero", measure: "default" },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Type for marketing canvases — sized in canvas pixels, wrapped with `text-wrap: balance`. Never use screen `text-*` sizes on a 1080 canvas — they render as fine print. Keep headlines ≤ 6 words so `balance` can do its job. Colour follows the artboard's surface (PatternField and PostFrame set it); `measure` caps the line: tight 12ch · default 18ch · wide 30ch.",
      },
    },
  },
} satisfies Meta<typeof SocialHeadline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Overline: Story = {
  name: 'size="overline"',
  args: { size: "overline", className: "text-text-brand", children: "Tonight Only" },
};

export const Hero: Story = {
  name: 'size="hero"',
  args: { size: "hero", children: "Chai first, decisions later." },
};

export const H1H2: Story = {
  name: 'size="h1" · "h2"',
  render: () => (
    <div className="grid gap-4">
      <SocialHeadline size="h1">Masala Cold Brew</SocialHeadline>
      <SocialHeadline size="h2" as="h3">
        One kitchen. One grinder.
      </SocialHeadline>
    </div>
  ),
};

export const BodyCaption: Story = {
  name: 'size="body" · "caption"',
  render: () => (
    <div className="grid gap-4">
      <SocialHeadline size="body" measure="wide">
        Cold brew, jaggery, cardamom.
      </SocialHeadline>
      <SocialHeadline size="caption" measure="wide">
        Sector 57, Gurgaon · 8am – 11:30pm
      </SocialHeadline>
    </div>
  ),
};

export const Alignment: Story = {
  name: "align",
  render: () => (
    <div className="grid gap-4">
      <SocialHeadline size="h2" align="start">
        Start
      </SocialHeadline>
      <SocialHeadline size="h2" align="center">
        Center
      </SocialHeadline>
      <SocialHeadline size="h2" align="end">
        End
      </SocialHeadline>
    </div>
  ),
};

/** A whole post as the ramp is really used, at true canvas pixels (72px canvas padding). */
export const OnACanvas: Story = {
  name: "on a canvas (a whole post)",
  parameters: { layout: "fullscreen" },
  render: () => (
    <div data-surface="brand" className="grid gap-8 bg-surface-brand p-18">
      <SocialHeadline size="overline">Tonight Only</SocialHeadline>
      <SocialHeadline size="hero" measure="tight">
        Chai first, decisions later.
      </SocialHeadline>
      <SocialHeadline size="body" measure="wide">
        Kadak chai and hot momos · ₹180–₹320
      </SocialHeadline>
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <SocialHeadline size="overline">Tonight Only</SocialHeadline>
      <SocialHeadline size="body">Cold brew, jaggery, cardamom.</SocialHeadline>
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { SocialHeadline, type SocialHeadlineProps } from "./atoms/social-headline/social-headline";
```

- [ ] **Step 8: Gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/social-headline packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: green; Storybook builds.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the SocialHeadline atom on the completed canvas type scale

The canvas composites now carry the line height, tracking and weight the
design system sets for marketing type, so one class sets a canvas step. The
on prop is gone: colour follows the artboard's surface. Three measures cap
the balanced lines.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 6: Button

**Dev reference:** `git show dev:packages/ui/src/atoms/button/button.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                                                                                                             | Ruling  | Where / reason                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `on="brand"` compound skins                                                                                                                                          | DROP    | D5 — surface tokens flip primary, secondary and ghost (Step 1)                                                                                 |
| Loader is the pulsing brand diamond (`Spinner`)                                                                                                                      | DROP    | D14 (an atom imports only `atoms/icon`); spec §9.1 (loader glyph)                                                                              |
| `rounded-6`, `shadow-elevation2`, `h-(--button-h-*)`, `text-body1`                                                                                                   | DROP    | D4; AUTHORING §6                                                                                                                               |
| `not-disabled:` guards on hover and press                                                                                                                            | ALREADY | `controlStates`' `disabled:`/`aria-disabled:` classes sort after `hover:`/`active:`, and `aria-disabled:pointer-events-none` stops a busy link |
| Tests: `type="button"`, `onClick`, variants, sizes, the on-brand flip, two glyphs, loading keeps the label and disables, grey disabled fill, className override, axe | ALREADY | Step 2; the flip is proved in the `NestedSurfaces` play                                                                                        |
| Test: a disabled button does not call `onClick`                                                                                                                      | ADD     | Step 2                                                                                                                                         |
| Stories `Default`, `Variants`, `Sizes`, `WithIcons`, `OnBrand` (with ghost), `States`, `FullWidth`                                                                   | ALREADY | `Playground`, the card-row stories, `OnSurfaces` (ghost on brand), `Loading` + `Disabled`, `FullWidth`                                         |

Implementer: copy this table into your report, extended with anything the plan missed.

Source: `components/atoms/Button.{jsx,d.ts,card.html,prompt.md}`, readme §3.8, spec C9 and D8.

**Visuals** (every px from `Button.jsx`):

- Pill, Poppins 700, tracking −0.005em, line height 1, no wrap.
- Heights (and minimum widths) 36 / 44 / 54, padding 14 / 20 / 28px, gap 6 / 8 / 8, label 13 / 15 / 17px.
- `primary`: pink-500 fill, white, `--shadow-brand`.
- `secondary`: white fill, pink-600, 2px pink-500 border.
- `ghost`: transparent, pink-600.
- `inverse`: ink-900 fill, white, `--shadow-2`.
- Glyphs are 16px at sm and 20px at md/lg. The loader is 20px, or 24px at lg.
- Disabled: ink-200 fill, ink-400 text, no border, no shadow.

**States** (readme §3.8, all CSS):

- Hover darkens primary to `--brand-hover` and tints secondary/ghost to pink-50.
- Press is the 0.97 scale in 80ms, plus `--brand-active` on primary.

**On a pink field** (the zip's `on="brand"`, now surface-driven):

- primary → white fill, pink-600 text, `--shadow-2`.
- secondary → transparent, white text, 2px white-70% border.
- ghost → white text.
- inverse → stays solid ink (C9).

The handoff also passes `on="brand"` to secondary buttons **on ink** sections, so the secondary skin flips on ink too, while primary on ink stays pink.

**Files:**

- Create: `packages/design-tokens/tokens/component/button.json`
- Modify: `packages/design-tokens/tokens/primitive/color.json`, `tokens/surface/brand.json`, `tokens/surface/ink.json`, `tokens/surface/light.json`, `packages/design-tokens/contrast-pairs.json`
- Create: `packages/ui/src/atoms/button/button.tsx`, `button.test.tsx`, `button.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`, `TEXT`, `SHADOW`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Icon`, `IconComponent`; `controlStates` (`lib/control-states`); `Slot`; `LoaderCircle` from `lucide-react`; `text-text-link`; `active:press-scale`; `animate-rotate`; `OnSurfaces` (stories).
- Produces: `Button`, `interface ButtonProps extends ComponentProps<"button">` (contracts §2), `buttonVariants` (slots `root`, `label`, `loader`; variants `variant`, `size`, `isFullWidth`), shared by any Radix trigger that must look like a Button: `buttonVariants({ variant: "secondary" }).root()`. Tokens `spacing-button-h-{sm,md,lg}`, `text-button-{sm,md,lg}`, `color-button-primary-{bg,bg-hover,bg-active,fg}`, `color-button-secondary-{bg,border}`, `color-button-hover-tint`, `shadow-button-primary`, primitive `color-white-alpha-16`. **IconButton (Task 7) reuses `button-primary-*` and `button-hover-tint`.**

- [ ] **Step 1: Component tokens, surface skins, contrast pairs**

In `tokens/primitive/color.json`, inside `color.white-alpha`, add (keys ascending):

```json
"16": { "$value": "rgba(255, 255, 255, 0.16)" },
```

`packages/design-tokens/tokens/component/button.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "button-h-sm": { "$value": "36px", "$description": "Button sm height and minimum width." },
    "button-h-md": {
      "$value": "44px",
      "$description": "Button md height — the touch-target minimum."
    },
    "button-h-lg": { "$value": "54px", "$description": "Button lg height and minimum width." }
  },
  "text": {
    "$type": "typography",
    "button-sm": {
      "$value": {
        "fontSize": "13px",
        "lineHeight": 1,
        "letterSpacing": "-0.005em",
        "fontWeight": "{font-weight.bold}"
      }
    },
    "button-md": {
      "$value": {
        "fontSize": "15px",
        "lineHeight": 1,
        "letterSpacing": "-0.005em",
        "fontWeight": "{font-weight.bold}"
      }
    },
    "button-lg": {
      "$value": {
        "fontSize": "17px",
        "lineHeight": 1,
        "letterSpacing": "-0.005em",
        "fontWeight": "{font-weight.bold}"
      }
    }
  },
  "color": {
    "$type": "color",
    "button": {
      "primary": {
        "bg": { "$value": "{color.surface.brand}" },
        "bg-hover": { "$value": "{color.brand.hover}" },
        "bg-active": { "$value": "{color.brand.active}" },
        "fg": { "$value": "{color.text.on-brand}" }
      },
      "secondary": {
        "bg": { "$value": "{color.ink.000}" },
        "border": { "$value": "{color.pink.500}" }
      },
      "hover-tint": {
        "$value": "{color.pink.50}",
        "$description": "Hover fill of secondary and ghost Buttons and ghost IconButtons."
      }
    }
  },
  "shadow": {
    "$type": "shadow",
    "button-primary": {
      "$value": "{shadow.brand}",
      "$description": "The brand glow — primary CTAs only; shadow-2 on a pink field."
    }
  }
}
```

`tokens/surface/brand.json`: inside `surface-brand.color`, add:

```json
"button": {
  "primary": {
    "bg": { "$value": "{color.ink.000}" },
    "bg-hover": { "$value": "{color.pink.50}" },
    "bg-active": { "$value": "{color.ink.100}" },
    "fg": { "$value": "{color.pink.600}" }
  },
  "secondary": {
    "bg": { "$value": "transparent" },
    "border": { "$value": "{color.white-alpha.70}" }
  },
  "hover-tint": { "$value": "{color.white-alpha.16}" }
}
```

and inside `surface-brand.shadow`, add `"button-primary": { "$value": "{shadow.2}" }`.

(The pressed white button darkens to ink-100: pink-600 on it measures 4.70. Pink-100 would be the obvious "darker" step, but it measures 4.08 and fails.)

`tokens/surface/ink.json`: inside `surface-ink.color`, add (primary stays pink on ink):

```json
"button": {
  "secondary": {
    "bg": { "$value": "transparent" },
    "border": { "$value": "{color.white-alpha.70}" }
  },
  "hover-tint": { "$value": "{color.white-alpha.16}" }
}
```

`tokens/surface/light.json`: inside `surface-light.color`, add:

```json
"button": {
  "primary": {
    "bg": { "$value": "{color.surface.brand}" },
    "bg-hover": { "$value": "{color.brand.hover}" },
    "bg-active": { "$value": "{color.brand.active}" },
    "fg": { "$value": "{color.text.on-brand}" }
  },
  "secondary": {
    "bg": { "$value": "{color.ink.000}" },
    "border": { "$value": "{color.pink.500}" }
  },
  "hover-tint": { "$value": "{color.pink.50}" }
}
```

and inside `surface-light.shadow`, add `"button-primary": { "$value": "{shadow.brand}" }`.

`packages/design-tokens/contrast-pairs.json`: append to `groups`:

```json
{
  "id": "button",
  "surface": null,
  "pairs": [
    ["color-button-primary-fg", "color-button-primary-bg-hover"],
    ["color-button-primary-fg", "color-button-primary-bg-active"],
    ["color-text-link", "color-button-secondary-bg"],
    ["color-text-link", "color-button-hover-tint"],
    ["color-ink-000", "color-ink-900"]
  ],
  "min": 4.5
},
{
  "id": "button-primary-fill",
  "surface": null,
  "pairs": [["color-button-primary-fg", "color-button-primary-bg"]],
  "min": 3,
  "exception": "brand-fill"
},
{
  "id": "button-on-soft",
  "surface": "soft",
  "pairs": [
    ["color-text-link", "color-button-secondary-bg"],
    ["color-text-link", "color-button-hover-tint"]
  ],
  "min": 4.5
},
{
  "id": "button-on-brand",
  "surface": "brand",
  "pairs": [
    ["color-button-primary-fg", "color-button-primary-bg"],
    ["color-button-primary-fg", "color-button-primary-bg-hover"],
    ["color-button-primary-fg", "color-button-primary-bg-active"]
  ],
  "min": 4.5
},
{
  "id": "button-tint-on-brand",
  "surface": "brand",
  "pairs": [["color-text-link", "color-button-hover-tint"]],
  "backdrop": "color-surface-brand",
  "min": 3,
  "exception": "brand-fill"
},
{
  "id": "button-tint-on-ink",
  "surface": "ink",
  "pairs": [["color-text-link", "color-button-hover-tint"]],
  "backdrop": "color-surface-inverse",
  "min": 4.5
}
```

(Measured: white on pink-600 5.18, on pink-700 7.19; pink-600 on white 5.18, on pink-50 4.85; pink-700 on white 7.19; white on ink-900 18.39; white on pink 4.04; pink-600 on ink-100 4.70; white on a 16% white tint over pink 3.43, over ink 11.43.)

In `component-variants.ts`, append to `SPACING`: `"button-h-sm", "button-h-md", "button-h-lg",`; to `TEXT`: `"button-sm", "button-md", "button-lg",`; to `SHADOW`: `"button-primary",`.

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -6`
Expected: PASS. Contrast groups, light restore (every brand/ink button override appears in the light block with its base value) and the alias guard (`color-button-primary-bg → color.surface.brand` is not overridden anywhere) all hold.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/button/button.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArrowRight, ShoppingBag } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Button } from "./button";

describe("Button", () => {
  it("is a native button of type button, named by its label", () => {
    render(<Button>Order Now</Button>);
    expect(screen.getByRole("button", { name: "Order Now" })).toHaveAttribute("type", "button");
  });

  it("keeps a submit type when asked", () => {
    render(<Button type="submit">Pay ₹1,240</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("fires from the pointer and from Enter and Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Order Now</Button>);
    await user.click(screen.getByRole("button", { name: "Order Now" }));
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it.each([
    ["primary", "bg-button-primary-bg", "text-button-primary-fg"],
    ["secondary", "bg-button-secondary-bg", "text-text-link"],
    ["ghost", "bg-transparent", "text-text-link"],
    ["inverse", "bg-ink-900", "text-ink-000"],
  ] as const)("paints the %s variant with %s and %s", (variant, fill, text) => {
    render(<Button variant={variant}>Order</Button>);
    expect(screen.getByRole("button")).toHaveClass(fill, text);
  });

  it("paints every skin that must flip on a pink or ink field with a surface-following token", () => {
    render(
      <>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
      </>
    );
    expect(screen.getByRole("button", { name: "Primary" })).toHaveClass(
      "shadow-button-primary",
      "hover:bg-button-primary-bg-hover",
      "active:bg-button-primary-bg-active"
    );
    expect(screen.getByRole("button", { name: "Secondary" })).toHaveClass(
      "border-2",
      "border-button-secondary-border",
      "hover:bg-button-hover-tint"
    );
    expect(screen.getByRole("button", { name: "Ghost" })).toHaveClass("hover:bg-button-hover-tint");
  });

  it("keeps inverse solid ink on every surface (spec C9)", () => {
    render(<Button variant="inverse">Book</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-ink-900", "text-ink-000", "shadow-2");
    expect(button.className).not.toMatch(/(bg|shadow|border)-button-/);
  });

  it.each([
    ["sm", "h-button-h-sm", "min-w-button-h-sm", "px-3.5", "text-button-sm"],
    ["md", "h-button-h-md", "min-w-button-h-md", "px-5", "text-button-md"],
    ["lg", "h-button-h-lg", "min-w-button-h-lg", "px-7", "text-button-lg"],
  ] as const)("sizes %s with %s, %s, %s and %s", (size, height, minWidth, padding, label) => {
    render(<Button size={size}>Order</Button>);
    expect(screen.getByRole("button")).toHaveClass(
      height,
      minWidth,
      padding,
      label,
      "font-display"
    );
  });

  it.each([
    ["sm", "size-icon-sm"],
    ["md", "size-icon-md"],
    ["lg", "size-icon-md"],
  ] as const)("draws %s glyphs at %s, leading and trailing the label", (size, glyph) => {
    render(
      <Button size={size} icon={ShoppingBag} iconAfter={ArrowRight}>
        Order
      </Button>
    );
    const [leading, label, trailing] = [...screen.getByRole("button").children];
    expect(leading).toHaveClass(glyph);
    expect(label).toHaveTextContent("Order");
    expect(trailing).toHaveClass(glyph);
  });

  it("keeps its glyphs decorative, so the label alone names it", () => {
    render(
      <Button icon={ShoppingBag} iconAfter={ArrowRight}>
        Order Now
      </Button>
    );
    const button = screen.getByRole("button", { name: "Order Now" });
    for (const glyph of button.querySelectorAll("svg")) {
      expect(glyph).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("while loading, swaps the leading glyph for a spinning loader, reports busy and blocks presses", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button icon={ShoppingBag} isLoading onClick={onClick}>
        Placing order
      </Button>
    );
    const button = screen.getByRole("button", { name: "Placing order" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();
    expect(button.querySelector(".lucide-loader-circle")).not.toBeNull();
    expect(button.querySelector(".lucide-shopping-bag")).toBeNull();
    expect(button.firstElementChild).toHaveClass("animate-rotate");
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it.each([
    ["sm", "size-icon-md"],
    ["md", "size-icon-md"],
    ["lg", "size-icon-lg"],
  ] as const)("sizes the %s loader at %s", (size, glyph) => {
    render(
      <Button size={size} isLoading>
        Checking code
      </Button>
    );
    expect(screen.getByRole("button").firstElementChild).toHaveClass(glyph);
  });

  it("uses a real grey fill when disabled, never an opacity fade", () => {
    render(<Button disabled>Sold Out</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass(
      "disabled:bg-ink-200",
      "disabled:text-ink-400",
      "disabled:shadow-none",
      "disabled:cursor-not-allowed"
    );
    expect(button.className).not.toMatch(/opacity/);
  });

  it("does not fire while disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Sold Out
      </Button>
    );
    await user.click(screen.getByRole("button", { name: "Sold Out" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("presses with the brand scale and the control transition", () => {
    render(<Button>Order</Button>);
    expect(screen.getByRole("button")).toHaveClass("active:press-scale", "transition-control");
  });

  it("fills its container when isFullWidth", () => {
    render(<Button isFullWidth>Pay ₹1,240</Button>);
    expect(screen.getByRole("button")).toHaveClass("flex", "w-full");
    expect(screen.getByRole("button")).not.toHaveClass("inline-flex");
  });

  it("never wraps or overflows its container — a long label truncates inside the pill (Review Focus 1)", () => {
    const label = "Order the full Sunday thali for the whole family";
    render(<Button icon={ShoppingBag}>{label}</Button>);
    const button = screen.getByRole("button", { name: label });
    expect(button).toHaveClass("whitespace-nowrap", "max-w-full", "shrink-0");
    expect(screen.getByText(label)).toHaveClass("min-w-0", "truncate");
    expect(button.firstElementChild).toHaveClass("shrink-0");
  });

  describe("asChild (Review Focus 3)", () => {
    it("renders the child anchor with Button styling, glyphs and label — and no button-only attributes", () => {
      render(
        <Button asChild variant="secondary" icon={ShoppingBag} className="mt-2">
          <a href="https://wa.me/919090704001">Order on WhatsApp</a>
        </Button>
      );
      const link = screen.getByRole("link", { name: "Order on WhatsApp" });
      expect(link).toHaveAttribute("href", "https://wa.me/919090704001");
      expect(link).not.toHaveAttribute("type");
      expect(link).not.toHaveAttribute("disabled");
      expect(link).toHaveClass("bg-button-secondary-bg", "mt-2");
      expect(link.querySelector(".lucide-shopping-bag")).not.toBeNull();
      expect(screen.getByText("Order on WhatsApp")).toHaveClass("truncate");
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("marks a loading link busy and disabled for assistive tech, and stops the pointer", () => {
      render(
        <Button asChild isLoading>
          <a href="/order">Placing order</a>
        </Button>
      );
      const link = screen.getByRole("link", { name: "Placing order" });
      expect(link).toHaveAttribute("aria-busy", "true");
      expect(link).toHaveAttribute("aria-disabled", "true");
      expect(link).toHaveClass("aria-disabled:pointer-events-none");
    });
  });

  it("lets a consumer className override its own", () => {
    render(<Button className="px-9">Order</Button>);
    expect(screen.getByRole("button")).toHaveClass("px-9");
    expect(screen.getByRole("button")).not.toHaveClass("px-5");
  });

  it("has no accessibility violations in its default, loading, disabled and link forms", async () => {
    const { container } = render(
      <>
        <Button icon={ShoppingBag}>Order Now</Button>
        <Button isLoading>Placing order</Button>
        <Button disabled>Sold Out</Button>
        <Button asChild iconAfter={ArrowRight}>
          <a href="/menu">Full Menu</a>
        </Button>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: FAIL — `Failed to resolve import "./button"`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/button/button.tsx`:

```tsx
import type { ComponentProps, ElementType } from "react";

import { LoaderCircle } from "lucide-react";
import { Slot } from "radix-ui";

import { componentVariants } from "../../lib/component-variants";
import { controlStates } from "../../lib/control-states";
import { Icon, type IconComponent } from "../icon/icon";

export interface ButtonProps extends ComponentProps<"button"> {
  /** primary = flooded pink · secondary = pink outline · ghost = text only · inverse = ink. */
  variant?: "primary" | "secondary" | "ghost" | "inverse";
  size?: "sm" | "md" | "lg";
  /** Glyph before the label — names the action. */
  icon?: IconComponent;
  /** Glyph after the label — onward motion (arrow-right, arrow-up-right, chevron-down). */
  iconAfter?: IconComponent;
  isFullWidth?: boolean;
  /** Swaps the leading glyph for a spinner, sets `aria-busy` and blocks presses. */
  isLoading?: boolean;
  /** Render the single child (`<a href>`, `next/link`) with Button styling. */
  asChild?: boolean;
}

/**
 * The Button's classes. Exported so a Radix trigger can look like a Button:
 * `buttonVariants({ variant: "secondary" }).root()`.
 *
 * `primary`, `secondary` and the hover tint paint with surface-aware tokens (`surface/*.json`),
 * so on a pink field primary turns white and secondary a white outline with no prop; ghost and
 * secondary text use the semantic link colour, which flips too. `inverse` is solid ink everywhere.
 */
export const buttonVariants = componentVariants({
  slots: {
    root: [
      controlStates(),
      "inline-flex max-w-full shrink-0 items-center justify-center rounded-pill font-display whitespace-nowrap active:press-scale",
    ],
    label: "min-w-0 truncate",
    loader: "animate-rotate",
  },
  variants: {
    variant: {
      primary: {
        root: "bg-button-primary-bg text-button-primary-fg shadow-button-primary hover:bg-button-primary-bg-hover active:bg-button-primary-bg-active",
      },
      secondary: {
        root: "border-2 border-button-secondary-border bg-button-secondary-bg text-text-link hover:bg-button-hover-tint",
      },
      ghost: { root: "bg-transparent text-text-link hover:bg-button-hover-tint" },
      inverse: { root: "bg-ink-900 text-ink-000 shadow-2" },
    },
    size: {
      sm: { root: "h-button-h-sm min-w-button-h-sm gap-1.5 px-3.5 text-button-sm" },
      md: { root: "h-button-h-md min-w-button-h-md gap-2 px-5 text-button-md" },
      lg: { root: "h-button-h-lg min-w-button-h-lg gap-2 px-7 text-button-lg" },
    },
    isFullWidth: { true: { root: "flex w-full" } },
  },
  defaultVariants: { variant: "primary", size: "md", isFullWidth: false },
});

/** Glyph 16px at sm, 20px at md and lg; the loader 20px, 24px at lg (design system Button.jsx). */
const GLYPH_SIZE = { sm: "sm", md: "md", lg: "md" } as const;
const LOADER_SIZE = { sm: "md", md: "md", lg: "lg" } as const;

/** The brand's action button — pill, Poppins 700, Title Case label. */
export function Button({
  variant,
  size = "md",
  icon,
  iconAfter,
  isFullWidth = false,
  isLoading = false,
  asChild = false,
  disabled = false,
  type = "button",
  className,
  children,
  ...props
}: ButtonProps) {
  const slots = buttonVariants({ variant, size, isFullWidth });
  const Component: ElementType = asChild ? Slot.Root : "button";
  // A slotted <a> must not get `type` or `disabled`; it says so with aria-disabled instead.
  const state = asChild
    ? { "aria-disabled": disabled || isLoading || undefined }
    : { type, disabled: disabled || isLoading };
  const leading = isLoading ? LoaderCircle : icon;
  return (
    <Component
      className={slots.root({ className })}
      aria-busy={isLoading || undefined}
      {...state}
      {...props}
    >
      {leading ? (
        <Icon
          icon={leading}
          size={isLoading ? LOADER_SIZE[size] : GLYPH_SIZE[size]}
          className={isLoading ? slots.loader() : undefined}
        />
      ) : null}
      <Slot.Slottable child={children}>
        {(label) => <span className={slots.label()}>{label}</span>}
      </Slot.Slottable>
      {iconAfter ? <Icon icon={iconAfter} size={GLYPH_SIZE[size]} /> : null}
    </Component>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: PASS.

- [ ] **Step 6: Stories**

Card rows (`Button.card.html`), one story each: `variant`, `size`, `icon`, `iconAfter`, `both`, `icon × size`, `iconAfter × size`, `icon on brand`, `loading` (→ `isLoading`), `disabled`, `fullWidth` (→ `isFullWidth`). The card's `icon-only` row lives in `Atoms/IconButton` (story `IconOnly`, Task 7), because an atom's story may not import another atom. Extras:

- `OnSurfaces`.
- `NestedSurfaces`: Review Focus 5, `play` reads computed backgrounds.
- `asChild`.
- `LongLabel`: Review Focus 1, `play` measures layout.

`packages/ui/src/atoms/button/button.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  ChevronDown,
  MapPin,
  MessageCircle,
  Search,
  ShoppingBag,
} from "lucide-react";
import { expect, within } from "storybook/test";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Button } from "./button";

const meta = {
  title: "Atoms/Button",
  component: Button,
  args: { children: "Order Now", variant: "primary", size: "md" },
  argTypes: { icon: { control: false }, iconAfter: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          "The brand's action button — pill, Poppins 700, Title Case; use `primary` once per view. Variants: `primary` (flooded pink + the brand glow), `secondary` (2px pink outline on white), `ghost` (text only), `inverse` (ink). On a flooded pink field the skins follow the surface — primary flips to white-on-pink, secondary and ghost to white — with no prop to pass; inverse stays ink. Press = 0.97 scale + darken; disabled is a real grey fill, not opacity. Leading icons name the action (bag, pin, search); trailing icons mean onward motion (arrow-right to navigate, arrow-up-right to leave the site, chevron-down for a picker). Labels never wrap. Icon-only? Use `IconButton`. `asChild` renders an `<a>` or `next/link` as a Button.",
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: "variant",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Order Now</Button>
      <Button variant="secondary">See Menu</Button>
      <Button variant="ghost">Find Us</Button>
      <Button variant="inverse">Book</Button>
    </div>
  ),
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const LeadingIcon: Story = {
  name: "icon",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button icon={ShoppingBag}>Order Now</Button>
      <Button variant="secondary" icon={MapPin}>
        Directions
      </Button>
      <Button variant="ghost" icon={Search}>
        Search Menu
      </Button>
    </div>
  ),
};

export const TrailingIcon: Story = {
  name: "iconAfter",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button iconAfter={ArrowRight}>Full Menu</Button>
      <Button variant="secondary" iconAfter={ArrowRight}>
        Our Story
      </Button>
      <Button variant="ghost" iconAfter={ArrowUpRight}>
        Zomato
      </Button>
    </div>
  ),
};

export const BothIcons: Story = {
  name: "icon + iconAfter",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button icon={MapPin} iconAfter={ArrowUpRight}>
        Directions
      </Button>
      <Button variant="secondary" icon={Calendar} iconAfter={ChevronDown}>
        Pick a Date
      </Button>
    </div>
  ),
};

export const IconBySize: Story = {
  name: "icon × size",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm" icon={ShoppingBag}>
        Small
      </Button>
      <Button size="md" icon={ShoppingBag}>
        Medium
      </Button>
      <Button size="lg" icon={ShoppingBag}>
        Large
      </Button>
    </div>
  ),
};

export const IconAfterBySize: Story = {
  name: "iconAfter × size",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm" variant="secondary" iconAfter={ArrowRight}>
        Small
      </Button>
      <Button size="md" variant="secondary" iconAfter={ArrowRight}>
        Medium
      </Button>
      <Button size="lg" variant="secondary" iconAfter={ArrowRight}>
        Large
      </Button>
    </div>
  ),
};

export const OnBrand: Story = {
  name: "on a brand surface",
  render: () => (
    <div
      data-surface="brand"
      className="flex flex-wrap items-center gap-3 rounded-lg bg-surface-brand p-3.5"
    >
      <Button icon={ShoppingBag}>Order Now</Button>
      <Button variant="secondary" iconAfter={ArrowRight}>
        Our Story
      </Button>
      <Button variant="inverse" icon={MessageCircle}>
        Chat on WhatsApp
      </Button>
    </div>
  ),
};

export const Loading: Story = {
  name: "isLoading",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button isLoading icon={ShoppingBag}>
        Placing order
      </Button>
      <Button variant="secondary" isLoading>
        Checking code
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  name: "disabled",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button disabled icon={ShoppingBag}>
        Sold Out
      </Button>
      <Button variant="secondary" disabled iconAfter={ArrowRight}>
        Closed
      </Button>
    </div>
  ),
};

export const FullWidth: Story = {
  name: "isFullWidth",
  render: () => (
    <div className="grid w-90 gap-2.5">
      <Button isFullWidth size="lg" icon={ShoppingBag}>
        Pay ₹1,240
      </Button>
      <Button isFullWidth variant="secondary" iconAfter={ArrowRight}>
        See the Full Menu
      </Button>
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Button>Order Now</Button>
      <Button variant="secondary">See Menu</Button>
      <Button variant="ghost">Find Us</Button>
      <Button variant="inverse">Book</Button>
    </OnSurfaces>
  ),
};

export const NestedSurfaces: Story = {
  name: "nested surfaces (light island)",
  render: () => (
    <div data-surface="brand" className="grid gap-4 rounded-xl bg-surface-brand p-6">
      <Button variant="secondary">On the pink field</Button>
      <div data-surface="light" className="rounded-lg bg-surface-card p-4">
        <Button variant="secondary">On a white card inside it</Button>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const onField = canvas.getByRole("button", { name: "On the pink field" });
    const onIsland = canvas.getByRole("button", { name: "On a white card inside it" });
    await expect(getComputedStyle(onField).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    await expect(getComputedStyle(onIsland).backgroundColor).toBe("rgb(255, 255, 255)");
  },
};

export const AsChild: Story = {
  name: "asChild (a link)",
  render: () => (
    <Button asChild variant="secondary" icon={MessageCircle}>
      <a href="https://wa.me/919090704001">Order on WhatsApp</a>
    </Button>
  ),
};

export const LongLabel: Story = {
  name: "long label at 360px",
  render: () => (
    <div data-testid="frame" className="grid w-90 gap-3">
      <Button icon={ShoppingBag}>Order the full Sunday thali for the whole family</Button>
      <Button isFullWidth variant="secondary" iconAfter={ArrowRight}>
        See the full menu, every category and every price
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const frame = canvas.getByTestId("frame").getBoundingClientRect();
    for (const button of canvas.getAllByRole("button")) {
      const box = button.getBoundingClientRect();
      await expect(box.right).toBeLessThanOrEqual(frame.right + 0.5);
      await expect(box.height).toBe(44);
    }
  },
};
```

- [ ] **Step 7: Export**

```ts
export { Button, type ButtonProps, buttonVariants } from "./atoms/button/button";
```

- [ ] **Step 8: Gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/button packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens packages/design-tokens/contrast-pairs.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: green; Storybook builds.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the Button atom with surface-driven skins and asChild

Four variants, three sizes, leading and trailing glyphs, loading and a real
grey disabled fill. On a pink field primary flips to white and secondary to a
white outline through surface tokens restored on light islands; inverse stays
ink (spec C9). asChild slots glyphs into an anchor without button attributes,
and long labels truncate inside the pill instead of overflowing.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 7: IconButton

**Dev reference:** `git show dev:packages/ui/src/atoms/icon-button/icon-button.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                                                                          | Ruling  | Where / reason                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| `on="brand"` compound skins                                                                                                       | DROP    | D5 — primary and ghost follow the surface (Step 1 tokens)                                                    |
| Two-element hit target (a 44px `min-h`/`min-w` button around the drawn circle)                                                    | ALREADY | a transparent `::before` pads sm/md to 44px; lg is 48px                                                      |
| Secondary on semantic `text-text-link` / `border-border-default`                                                                  | ALREADY | a filled skin uses fixed primitives (atom-tier rule "Skins on surfaces")                                     |
| Glass carries `shadow-elevation2` and hovers to card white                                                                        | DROP    | `IconButton.jsx` gives glass no hover; the card passes the shadow (`className="shadow-2"`, `Variants` story) |
| `size-8/10/12`, `rounded-6`, `(--layout-hit-min)`                                                                                 | DROP    | D4; `icon-button-*` tokens                                                                                   |
| Tests: name from `label`, 44px target, `onClick`, disabled blocks, variants, sizes, grey disabled fill, one decorative glyph, axe | ALREADY | Step 2                                                                                                       |
| Test: caller className replaces the radius                                                                                        | ADD     | Step 2                                                                                                       |
| Stories `Default`, `Variants`, `Sizes`, `OnBrand`                                                                                 | ALREADY | `Playground`, `Variants`, `Sizes`, `OnBrand` + `OnSurfaces`                                                  |
| Story `OverPhotography` (glass on a dark ground)                                                                                  | ADD     | Step 6                                                                                                       |
| Story `States` (a disabled secondary too)                                                                                         | ADD     | Step 6 `Disabled` renders primary and secondary                                                              |

Implementer: copy this table into your report, extended with anything the plan missed.

Source: `components/atoms/IconButton.{jsx,d.ts,card.html,prompt.md}`; the count bubble is from `organisms/SiteHeader.jsx`.

**Visuals:**

- Circles of 32 / 40 / 48px with 16 / 20 / 24px glyphs.
- `ghost` (default): transparent, ink-700, hover pink-50.
- `primary`: pink-500, white.
- `secondary`: white, pink-600, 1px border-default.
- `glass`: `--surface-glass` + `--blur-glass`, ink-900.
- Count bubble: 18px pill at −2px/−2px, pink-500 fill, white Poppins 700 at 10.5px, 5px side padding.

**Deliberate differences from the zip:**

- Disabled is the grey fill (readme §3.8), not the zip's 45% opacity.
- `primary` reuses Button's primary tokens, so it turns white on a pink field (the zip left it pink-on-pink).
- sm and md keep a 44px touch target through a transparent `::before` (spec §9.1).

**Files:**

- Create: `packages/design-tokens/tokens/component/icon-button.json`
- Modify: `tokens/surface/brand.json`, `tokens/surface/ink.json`, `tokens/surface/light.json`, `packages/design-tokens/contrast-pairs.json`
- Create: `packages/ui/src/atoms/icon-button/icon-button.tsx`, `icon-button.test.tsx`, `icon-button.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`, `TEXT`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Icon`, `IconComponent`, `controlStates`, `Slot`; Button's `color-button-primary-{bg,bg-hover,bg-active,fg}` and `color-button-hover-tint` (Task 6); `OnSurfaces`.
- Produces: `IconButton`, `interface IconButtonProps extends Omit<ComponentProps<"button">, "children" | "aria-label">` with `children?: ReactElement` (contract deviation 1); tokens `spacing-icon-button-{sm,md,lg,count}`, `text-icon-button-count`, `color-icon-button-ghost-fg`.

- [ ] **Step 1: Component tokens, surface skins, contrast pairs**

`packages/design-tokens/tokens/component/icon-button.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "icon-button-sm": {
      "$value": "32px",
      "$description": "Drawn size; a ::before keeps the 44px hit area."
    },
    "icon-button-md": {
      "$value": "40px",
      "$description": "Drawn size; a ::before keeps the 44px hit area."
    },
    "icon-button-lg": { "$value": "48px", "$description": "The app size (touch surfaces)." },
    "icon-button-count": {
      "$value": "18px",
      "$description": "Cart-count bubble height and minimum width."
    }
  },
  "text": {
    "$type": "typography",
    "icon-button-count": {
      "$value": { "fontSize": "10.5px", "lineHeight": 1, "fontWeight": "{font-weight.bold}" }
    }
  },
  "color": {
    "$type": "color",
    "icon-button": {
      "ghost": {
        "fg": {
          "$value": "{color.ink.700}",
          "$description": "Ghost glyph; white on pink and ink fields."
        }
      }
    }
  }
}
```

`tokens/surface/brand.json` and `tokens/surface/ink.json`: inside `surface-<name>.color`, add:

```json
"icon-button": { "ghost": { "fg": { "$value": "{color.ink.000}" } } }
```

`tokens/surface/light.json`: inside `surface-light.color`, add:

```json
"icon-button": { "ghost": { "fg": { "$value": "{color.ink.700}" } } }
```

`packages/design-tokens/contrast-pairs.json`: append to `groups`:

```json
{
  "id": "icon-button",
  "surface": null,
  "pairs": [
    ["color-icon-button-ghost-fg", "color-surface-page"],
    ["color-icon-button-ghost-fg", "color-button-hover-tint"],
    ["color-pink-600", "color-ink-000"],
    ["color-pink-600", "color-pink-50"],
    ["color-ink-900", "color-surface-glass"]
  ],
  "min": 4.5
},
{
  "id": "icon-button-count",
  "surface": null,
  "pairs": [["color-ink-000", "color-pink-500"]],
  "min": 3,
  "exception": "brand-fill"
},
{
  "id": "icon-button-on-soft",
  "surface": "soft",
  "pairs": [["color-icon-button-ghost-fg", "color-surface-brand-soft"]],
  "min": 4.5
},
{
  "id": "icon-button-on-ink",
  "surface": "ink",
  "pairs": [["color-icon-button-ghost-fg", "color-surface-inverse"]],
  "min": 4.5
},
{
  "id": "icon-button-on-brand",
  "surface": "brand",
  "pairs": [["color-icon-button-ghost-fg", "color-surface-brand"]],
  "min": 3,
  "exception": "brand-fill"
}
```

(Glass is measured over white. Over photography the scrim, not a token pair, owns legibility: readme §3.9.)

In `component-variants.ts`, append to `SPACING`: `"icon-button-sm", "icon-button-md", "icon-button-lg", "icon-button-count",`; to `TEXT`: `"icon-button-count",`.

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -6` → PASS.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/icon-button/icon-button.test.tsx`:

```tsx
import type { ComponentProps } from "react";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Heart, ShoppingBag } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { IconButton } from "./icon-button";

function RouterLink({ children, ...props }: ComponentProps<"a">) {
  return (
    <a data-router="" {...props}>
      {children}
    </a>
  );
}

describe("IconButton", () => {
  it("is a button of type button named by its label; the glyph is decorative", () => {
    render(<IconButton icon={Heart} label="Save" />);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("type", "button");
    expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("cannot be written without a name (Review Focus 2)", () => {
    // @ts-expect-error — an icon-only control without `label` must not compile (spec §5.5)
    render(<IconButton icon={Heart} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("reads the cart count out with its label and draws the bubble (Review Focus 2)", () => {
    render(<IconButton icon={ShoppingBag} label="Your order" count={3} />);
    const button = screen.getByRole("button", { name: "Your order (3)" });
    const bubble = within(button).getByText("3");
    expect(bubble).toHaveAttribute("aria-hidden", "true");
    expect(bubble).toHaveClass(
      "absolute",
      "h-icon-button-count",
      "min-w-icon-button-count",
      "text-icon-button-count"
    );
  });

  it.each([0, undefined])("draws no bubble for a count of %s", (count) => {
    render(
      <IconButton
        icon={ShoppingBag}
        label="Your order"
        {...(count === undefined ? {} : { count })}
      />
    );
    const button = screen.getByRole("button", { name: "Your order" });
    expect(button.querySelector(".absolute")).toBeNull();
  });

  it.each([
    ["ghost", "bg-transparent", "text-icon-button-ghost-fg"],
    ["primary", "bg-button-primary-bg", "text-button-primary-fg"],
    ["secondary", "bg-ink-000", "text-pink-600"],
    ["glass", "bg-surface-glass", "backdrop-blur-glass"],
  ] as const)("paints the %s variant with %s and %s", (variant, fill, detail) => {
    render(<IconButton icon={Heart} label="Save" variant={variant} />);
    expect(screen.getByRole("button")).toHaveClass(fill, detail);
  });

  it("is ghost by default and tints on hover with the shared, surface-aware tint", () => {
    render(<IconButton icon={Heart} label="Save" />);
    expect(screen.getByRole("button")).toHaveClass("bg-transparent", "hover:bg-button-hover-tint");
  });

  it.each([
    ["sm", "size-icon-button-sm", "size-icon-sm", "before:-inset-1.5"],
    ["md", "size-icon-button-md", "size-icon-md", "before:-inset-0.5"],
  ] as const)(
    "draws %s at %s with a %s glyph and pads the hit area to 44px (%s)",
    (size, box, glyph, hitArea) => {
      render(<IconButton icon={Heart} label="Save" size={size} />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("relative", box, "before:absolute", hitArea);
      expect(button.firstElementChild).toHaveClass(glyph);
    }
  );

  it("draws lg at 48px with a 24px glyph and needs no hit-area pad", () => {
    render(<IconButton icon={Heart} label="Save" size="lg" />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("size-icon-button-lg");
    expect(button.className).not.toMatch(/before:/);
    expect(button.firstElementChild).toHaveClass("size-icon-lg");
  });

  it("fires from the pointer and the keyboard", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<IconButton icon={Heart} label="Save" onClick={onClick} />);
    await user.click(screen.getByRole("button"));
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("uses the grey disabled fill and blocks presses", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<IconButton icon={Heart} label="Save" variant="primary" disabled onClick={onClick} />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:bg-ink-200", "disabled:text-ink-400");
    expect(button.className).not.toMatch(/opacity/);
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders a router link through asChild with the glyph and the name, never a button type (Review Focus 3)", () => {
    render(
      <IconButton asChild icon={ShoppingBag} label="Your order" count={2}>
        <RouterLink href="/cart" />
      </IconButton>
    );
    const link = screen.getByRole("link", { name: "Your order (2)" });
    expect(link).toHaveAttribute("href", "/cart");
    expect(link).toHaveAttribute("data-router");
    expect(link).not.toHaveAttribute("type");
    expect(link.querySelector(".lucide-shopping-bag")).not.toBeNull();
  });

  it("lets a consumer className replace its radius", () => {
    render(<IconButton icon={Heart} label="Save" className="rounded-md" />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("rounded-md");
    expect(button).not.toHaveClass("rounded-pill");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <IconButton icon={Heart} label="Save" />
        <IconButton icon={ShoppingBag} label="Your order" count={3} variant="primary" />
        <IconButton icon={Heart} label="Save" disabled />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: FAIL — `Failed to resolve import "./icon-button"`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/icon-button/icon-button.tsx`:

```tsx
import type { ComponentProps, ElementType, ReactElement } from "react";

import { Slot } from "radix-ui";

import { componentVariants } from "../../lib/component-variants";
import { controlStates } from "../../lib/control-states";
import { Icon, type IconComponent } from "../icon/icon";

export interface IconButtonProps extends Omit<ComponentProps<"button">, "children" | "aria-label"> {
  icon: IconComponent;
  /** The accessible name — required: an icon-only control has no other (spec §5.5). */
  label: string;
  /** ghost (default) · primary · secondary · glass (over photography). */
  variant?: "primary" | "secondary" | "ghost" | "glass";
  /** Drawn at 32 / 40 / 48px; sm and md keep a 44px touch target. */
  size?: "sm" | "md" | "lg";
  /** Cart-style count bubble, read out with the label ("Your order (3)"). Hidden at 0. */
  count?: number;
  /** Render as the single child element (e.g. `<Link href="/cart" />`); the glyph replaces its content. */
  asChild?: boolean;
  /** Only with `asChild`: the element to render as. */
  children?: ReactElement;
}

const iconButton = componentVariants({
  slots: {
    root: [
      controlStates(),
      "relative inline-flex shrink-0 items-center justify-center rounded-pill active:press-scale",
    ],
    count:
      "pointer-events-none absolute -top-0.5 -right-0.5 grid h-icon-button-count min-w-icon-button-count place-items-center rounded-pill bg-pink-500 px-1.25 font-display text-icon-button-count text-ink-000",
  },
  variants: {
    variant: {
      // Primary shares Button's surface-aware primary skin: white on a pink field.
      primary: {
        root: "bg-button-primary-bg text-button-primary-fg hover:bg-button-primary-bg-hover active:bg-button-primary-bg-active",
      },
      secondary: { root: "border border-ink-300 bg-ink-000 text-pink-600 hover:bg-pink-50" },
      ghost: { root: "bg-transparent text-icon-button-ghost-fg hover:bg-button-hover-tint" },
      glass: { root: "bg-surface-glass text-ink-900 backdrop-blur-glass" },
    },
    size: {
      // A transparent ::before pads the drawn circle out to the 44px touch target.
      sm: { root: "size-icon-button-sm before:absolute before:-inset-1.5" },
      md: { root: "size-icon-button-md before:absolute before:-inset-0.5" },
      lg: { root: "size-icon-button-lg" },
    },
  },
  defaultVariants: { variant: "ghost", size: "md" },
});

/** Circular, icon-only button for toolbars, card overlays and app headers. */
export function IconButton({
  icon,
  label,
  variant,
  size = "md",
  count,
  asChild = false,
  disabled = false,
  type = "button",
  className,
  children,
  ...props
}: IconButtonProps) {
  const slots = iconButton({ variant, size });
  const Component: ElementType = asChild ? Slot.Root : "button";
  const hasCount = count !== undefined && count > 0;
  const state = asChild ? { "aria-disabled": disabled || undefined } : { type, disabled };
  return (
    <Component
      className={slots.root({ className })}
      aria-label={hasCount ? `${label} (${String(count)})` : label}
      {...state}
      {...props}
    >
      <Slot.Slottable child={children}>{() => <Icon icon={icon} size={size} />}</Slot.Slottable>
      {hasCount ? (
        <span aria-hidden className={slots.count()}>
          {String(count)}
        </span>
      ) : null}
    </Component>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: PASS.

- [ ] **Step 6: Stories**

Card rows (`IconButton.card.html`): `variant` (ghost, primary, secondary, glass with `shadow-2`), `size`, `on="brand"` (→ a brand surface), `disabled`. Extras:

- `count`, from SiteHeader.
- `OverPhotography`: glass on a dark ground (dev parity); `disabled` shows primary and secondary.
- `IconOnly`: the Button card's "icon-only" row.
- `OnSurfaces`.
- `asChild`.

`packages/ui/src/atoms/icon-button/icon-button.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";

import { ArrowLeft, Heart, Plus, Search, Share2, ShoppingBag } from "lucide-react";

import { OnSurfaces } from "../../lib/story-surfaces";
import { IconButton } from "./icon-button";

function DemoRouterLink({ children, ...props }: ComponentProps<"a">) {
  return (
    <a data-router="" {...props}>
      {children}
    </a>
  );
}

const meta = {
  title: "Atoms/IconButton",
  component: IconButton,
  args: { icon: Heart, label: "Save", variant: "ghost", size: "md" },
  argTypes: { icon: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          'Circular icon-only button for toolbars, card overlays and app headers. Always pass `label` — it is the accessible name, and the type system requires it. `glass` is for buttons floating over food photography (translucent white + blur). sm and md draw at 32/40px but keep a 44px touch target; use `size="lg"` in the app. `count` draws the cart bubble and is read out with the label. On a pink field the ghost glyph turns white and primary turns white-on-pink, with no prop.',
      },
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: "variant",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton icon={Heart} label="Save" variant="ghost" />
      <IconButton icon={Plus} label="Add" variant="primary" />
      <IconButton icon={Search} label="Search" variant="secondary" />
      <IconButton icon={ArrowLeft} label="Back" variant="glass" className="shadow-2" />
    </div>
  ),
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton icon={Plus} label="Add" variant="primary" size="sm" />
      <IconButton icon={Plus} label="Add" variant="primary" size="md" />
      <IconButton icon={Plus} label="Add" variant="primary" size="lg" />
    </div>
  ),
};

export const OnBrand: Story = {
  name: "on a brand surface",
  render: () => (
    <div
      data-surface="brand"
      className="flex flex-wrap items-center gap-3 rounded-lg bg-surface-brand p-3.5"
    >
      <IconButton icon={Heart} label="Save" />
      <IconButton icon={Share2} label="Share" />
    </div>
  ),
};

export const Disabled: Story = {
  name: "disabled",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton icon={Plus} label="Add" variant="primary" disabled />
      <IconButton icon={Search} label="Search" variant="secondary" disabled />
    </div>
  ),
};

/** `glass` is the treatment for buttons floating over food photography (a dark stand-in here). */
export const OverPhotography: Story = {
  name: 'variant="glass" over a dark photo',
  render: () => (
    <div className="flex flex-wrap items-center gap-3 rounded-lg bg-surface-inverse p-6">
      <IconButton icon={ArrowLeft} label="Back" variant="glass" />
      <IconButton icon={Heart} label="Save" variant="glass" />
      <IconButton icon={Share2} label="Share" variant="glass" />
    </div>
  ),
};

export const Count: Story = {
  name: "count",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton icon={ShoppingBag} label="Your order" count={3} />
      <IconButton icon={ShoppingBag} label="Your order" count={12} />
    </div>
  ),
};

export const IconOnly: Story = {
  name: "icon-only (not a Button)",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton icon={ShoppingBag} label="Your order" variant="primary" size="lg" />
      <IconButton icon={Search} label="Search" variant="secondary" />
      <IconButton icon={Heart} label="Save" variant="ghost" />
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <IconButton icon={Heart} label="Save" />
      <IconButton icon={Plus} label="Add" variant="primary" />
      <IconButton icon={Search} label="Search" variant="secondary" />
    </OnSurfaces>
  ),
};

export const AsChild: Story = {
  name: "asChild (a link)",
  render: () => (
    <IconButton asChild icon={ShoppingBag} label="Your order" count={2}>
      <DemoRouterLink href="/cart" />
    </IconButton>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { IconButton, type IconButtonProps } from "./atoms/icon-button/icon-button";
```

- [ ] **Step 8: Gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/icon-button packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens packages/design-tokens/contrast-pairs.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: green; Storybook builds.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the IconButton atom with a required name and a 44px target

Four variants and three sizes; sm and md pad their hit area to 44px with a
transparent ::before. The label is required by type and the cart count joins
the accessible name. Primary and the hover tint reuse Button's surface tokens;
the ghost glyph turns white on pink and ink. Disabled is the grey fill.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 8: Tag

**Dev reference:** `git show dev:packages/ui/src/atoms/tag/tag.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                                       | Ruling  | Where / reason                                                                                                                  |
| ---------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Always a `<button aria-pressed>`                                                               | DROP    | spec §9.1 (`<button>` with `onClick`, `<span>` without)                                                                         |
| `h-9.5`, `rounded-6`, `text-body2`, `bg-brand-primary`                                         | DROP    | D4; `tag-h` / `text-tag` tokens                                                                                                 |
| Unselected hover also tints the border (`border-brand-soft`)                                   | DROP    | `Tag.jsx` keeps the border; readme §3.8 tints the fill only                                                                     |
| A selected, pressable tag darkens on hover                                                     | ADD     | readme §3.8 ("darken pink one step"); Step 1 `color-tag-selected-hover` (ink-800 on a pink field); Step 4 compound; Step 2 test |
| Press scale (`active:scale`)                                                                   | ADD     | readme §3.8 and `controlStates`' own contract ("interactive Tag"); Step 4 `isInteractive`; Step 2 test                          |
| Tests: pressed state, selected fill, 38px, `onClick`, disabled blocks, grey disabled fill, axe | ALREADY | Step 2                                                                                                                          |
| Test: the glyph is not announced twice                                                         | ADD     | Step 2                                                                                                                          |
| Test: caller className replaces the radius                                                     | ADD     | Step 2                                                                                                                          |
| Stories `Default`, `Selection`, `WithIcons`                                                    | ALREADY | `Playground`, `Selectable`, `WithIcon`                                                                                          |
| Story `Disabled` includes a disabled selected tag                                              | ADD     | Step 6                                                                                                                          |
| Story `CategoryFilterRail` (six categories, wrapping at 360px)                                 | ADD     | Step 6                                                                                                                          |

Implementer: copy this table into your report, extended with anything the plan missed.

Source: `components/atoms/Tag.{jsx,d.ts,card.html,prompt.md}`; static tones from the handoff's delivery-zone chips (`design/Contact.dc.html`).

**Visuals:**

- A 38px pill, 16px side padding, a 6px gap to a 16px glyph, DM Sans 500 at 14px with line height 1, no wrap.
- Unselected: white, 1px border-default, ink-700; hover pink-50 when pressable.
- Selected: pink-500 fill and border, white text.
- Static tones: `success` is mint-soft fill, mint border and mint-strong text. `brand` is white fill, pink-200 border and pink-700 text.

**Behaviour:**

- With `onClick` it is `<button type="button" aria-pressed>`; without, a `<span>` (spec §9.1). The zip was always a button.
- Disabled is the grey fill (readme §3.8), not the zip's 50% opacity.
- On a pink field a selected tag would vanish (pink on pink), so the selected fill turns ink there. That is the one surface skin, `color-tag-selected`, with its hover twin `color-tag-selected-hover` (brand-hover pink-600; ink-800 on a pink field).
- A pressable tag presses with the 0.97 scale, and a pressable selected tag darkens one step on hover (readme §3.8; dev parity).

**Files:**

- Create: `packages/design-tokens/tokens/component/tag.json`
- Modify: `tokens/surface/brand.json`, `tokens/surface/light.json`, `packages/design-tokens/contrast-pairs.json`
- Create: `packages/ui/src/atoms/tag/tag.tsx`, `tag.test.tsx`, `tag.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`, `TEXT`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Icon`, `IconComponent`, `controlStates`; `OnSurfaces`.
- Produces: `Tag`, `interface TagProps extends ComponentProps<"button">` (contracts §2), `tagVariants` (slots `root`, `label`; variants `tone`, `isSelected`, `isInteractive`). ChipGroup and FilterBar (Plan 3b) call it for Radix ToggleGroup items: `tagVariants({ isSelected, isInteractive: true }).root()`. Tokens `spacing-tag-h`, `text-tag`, `color-tag-selected`, `color-tag-selected-hover`.

- [ ] **Step 1: Component tokens, surface skin, contrast pairs**

`packages/design-tokens/tokens/component/tag.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "tag-h": { "$value": "38px", "$description": "Tag height — fixed; tags never wrap." }
  },
  "text": {
    "$type": "typography",
    "tag": {
      "$value": { "fontSize": "14px", "lineHeight": 1, "fontWeight": "{font-weight.medium}" }
    }
  },
  "color": {
    "$type": "color",
    "tag": {
      "selected": {
        "$value": "{color.pink.500}",
        "$description": "Selected fill and border; ink on a pink field, where pink would vanish."
      },
      "selected-hover": {
        "$value": "{color.brand.hover}",
        "$description": "Hover fill and border of a pressable selected tag (readme §3.8); ink-800 on a pink field."
      }
    }
  }
}
```

(`color.brand.hover` is not overridden by any surface, so the alias guard holds.)

`tokens/surface/brand.json`: inside `surface-brand.color`, add `"tag": { "selected": { "$value": "{color.ink.900}" }, "selected-hover": { "$value": "{color.ink.800}" } }`.
`tokens/surface/light.json`: inside `surface-light.color`, add `"tag": { "selected": { "$value": "{color.pink.500}" }, "selected-hover": { "$value": "{color.brand.hover}" } }`.

`packages/design-tokens/contrast-pairs.json`: append to `groups`:

```json
{
  "id": "tag",
  "surface": null,
  "pairs": [
    ["color-ink-700", "color-ink-000"],
    ["color-ink-700", "color-pink-50"],
    ["color-pink-700", "color-ink-000"],
    ["color-pink-700", "color-pink-50"],
    ["color-text-success", "color-status-success-soft"],
    ["color-ink-000", "color-tag-selected-hover"]
  ],
  "min": 4.5
},
{
  "id": "tag-selected",
  "surface": null,
  "pairs": [["color-ink-000", "color-tag-selected"]],
  "min": 3,
  "exception": "brand-fill"
},
{
  "id": "tag-selected-on-brand",
  "surface": "brand",
  "pairs": [
    ["color-ink-000", "color-tag-selected"],
    ["color-ink-000", "color-tag-selected-hover"]
  ],
  "min": 4.5
}
```

(Measured: ink-700 on white 11.19, on pink-50 10.48; pink-700 on white 7.19, on pink-50 6.73; mint-strong on mint-soft 5.57; white on ink-900 18.39; white on pink-600 5.18; white on ink-800 16.1.)

In `component-variants.ts`, append to `SPACING`: `"tag-h",`; to `TEXT`: `"tag",`.

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -6` → PASS.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/tag/tag.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Clock, Flame, Leaf } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Tag } from "./tag";

const noop = () => undefined;

describe("Tag", () => {
  it("is a static chip, not a button, when it has no onClick", () => {
    render(<Tag>Static, no onClick</Tag>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    const chip = screen.getByText("Static, no onClick").parentElement;
    expect(chip?.tagName).toBe("SPAN");
    expect(chip).not.toHaveAttribute("aria-pressed");
    expect(chip).not.toHaveAttribute("type");
  });

  it("is a toggle button that reports its pressed state when it has onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Tag onClick={onClick}>Sweets</Tag>);
    const tag = screen.getByRole("button", { name: "Sweets" });
    expect(tag).toHaveAttribute("type", "button");
    expect(tag).toHaveAttribute("aria-pressed", "false");
    await user.click(tag);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("toggles from the keyboard", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Tag onClick={onClick}>Sweets</Tag>);
    await user.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await user.keyboard(" ");
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("floods pink and reports pressed when selected", () => {
    render(
      <Tag isSelected onClick={noop}>
        All
      </Tag>
    );
    const tag = screen.getByRole("button", { name: "All" });
    expect(tag).toHaveAttribute("aria-pressed", "true");
    expect(tag).toHaveClass("bg-tag-selected", "border-tag-selected", "text-ink-000");
  });

  it("shows a static selected chip without claiming to be pressable", () => {
    render(<Tag isSelected>Hot</Tag>);
    const chip = screen.getByText("Hot").parentElement;
    expect(chip).toHaveClass("bg-tag-selected");
    expect(chip).not.toHaveAttribute("aria-pressed");
  });

  it("tints on hover only when it can be pressed and is not already selected", () => {
    render(
      <>
        <Tag onClick={noop}>All</Tag>
        <Tag onClick={noop} isSelected>
          Hot
        </Tag>
        <Tag>Static</Tag>
      </>
    );
    expect(screen.getByRole("button", { name: "All" })).toHaveClass(
      "hover:bg-pink-50",
      "cursor-pointer"
    );
    expect(screen.getByRole("button", { name: "Hot" })).not.toHaveClass("hover:bg-pink-50");
    expect(screen.getByText("Static").parentElement).not.toHaveClass("hover:bg-pink-50");
    expect(screen.getByText("Static").parentElement).not.toHaveClass("cursor-pointer");
  });

  it("presses with the brand scale and darkens a selected tag on hover, only when pressable (readme §3.8)", () => {
    render(
      <>
        <Tag onClick={noop} isSelected>
          Hot
        </Tag>
        <Tag isSelected>Static</Tag>
      </>
    );
    expect(screen.getByRole("button", { name: "Hot" })).toHaveClass(
      "active:press-scale",
      "hover:bg-tag-selected-hover",
      "hover:border-tag-selected-hover"
    );
    const chip = screen.getByText("Static").parentElement;
    expect(chip).not.toHaveClass("active:press-scale");
    expect(chip).not.toHaveClass("hover:bg-tag-selected-hover");
  });

  it("keeps its glyph decorative, so the label alone names it", () => {
    render(
      <Tag icon={Leaf} onClick={noop}>
        Jain
      </Tag>
    );
    const glyphs = screen.getByRole("button", { name: "Jain" }).querySelectorAll("svg");
    expect(glyphs).toHaveLength(1);
    expect(glyphs[0]).toHaveAttribute("aria-hidden", "true");
  });

  it("lets a consumer className replace its radius", () => {
    render(<Tag className="rounded-md">Sweets</Tag>);
    const chip = screen.getByText("Sweets").parentElement;
    expect(chip).toHaveClass("rounded-md");
    expect(chip).not.toHaveClass("rounded-pill");
  });

  it.each([
    ["default", "bg-ink-000", "border-ink-300", "text-ink-700"],
    ["success", "bg-status-success-soft", "border-status-success", "text-text-success"],
    ["brand", "bg-ink-000", "border-pink-200", "text-pink-700"],
  ] as const)("paints the %s tone with %s, %s and %s", (tone, fill, border, text) => {
    render(<Tag tone={tone}>Sector 57</Tag>);
    expect(screen.getByText("Sector 57").parentElement).toHaveClass(fill, border, text);
  });

  it("is a fixed 38px pill in DM Sans that never wraps — a long label truncates (Review Focus 1)", () => {
    const label = "Under 15 minutes, every weekday lunch";
    render(<Tag onClick={noop}>{label}</Tag>);
    const tag = screen.getByRole("button", { name: label });
    expect(tag).toHaveClass(
      "h-tag-h",
      "rounded-pill",
      "font-body",
      "text-tag",
      "whitespace-nowrap",
      "max-w-full",
      "shrink-0"
    );
    expect(screen.getByText(label)).toHaveClass("min-w-0", "truncate");
  });

  it("draws a 16px leading glyph", () => {
    render(<Tag icon={Clock}>Under 15 min</Tag>);
    expect(screen.getByText("Under 15 min").parentElement?.firstElementChild).toHaveClass(
      "size-icon-sm"
    );
  });

  it("disables a pressable tag natively, with the grey fill", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Tag disabled onClick={onClick}>
        Breakfast
      </Tag>
    );
    const tag = screen.getByRole("button", { name: "Breakfast" });
    expect(tag).toBeDisabled();
    expect(tag).toHaveClass("disabled:bg-ink-200", "disabled:text-ink-400");
    expect(tag.className).not.toMatch(/opacity/);
    await user.click(tag);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("marks a disabled static chip with aria-disabled", () => {
    render(<Tag disabled>Breakfast</Tag>);
    const chip = screen.getByText("Breakfast").parentElement;
    expect(chip).toHaveAttribute("aria-disabled", "true");
    expect(chip).toHaveClass("aria-disabled:bg-ink-200");
    expect(chip).not.toHaveAttribute("disabled");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Tag onClick={noop} isSelected icon={Flame}>
          Hot
        </Tag>
        <Tag onClick={noop}>All</Tag>
        <Tag tone="success">Sector 57</Tag>
        <Tag disabled>Breakfast</Tag>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: FAIL — `Failed to resolve import "./tag"`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/tag/tag.tsx`:

```tsx
import type { ComponentProps, ElementType } from "react";

import { componentVariants } from "../../lib/component-variants";
import { controlStates } from "../../lib/control-states";
import { Icon, type IconComponent } from "../icon/icon";

export interface TagProps extends ComponentProps<"button"> {
  /** Selected tags flood pink (ink on a pink field). Reported as `aria-pressed` when pressable. */
  isSelected?: boolean;
  /** 16px leading glyph. */
  icon?: IconComponent;
  /** Static colourways (the handoff's delivery-zone chips): default · success · brand. */
  tone?: "default" | "success" | "brand";
}

/**
 * The Tag's classes. Exported for ChipGroup and FilterBar, which render Radix ToggleGroup items
 * that must look like tags: `tagVariants({ isSelected, isInteractive: true }).root()`.
 */
export const tagVariants = componentVariants({
  slots: {
    root: [
      controlStates(),
      "inline-flex h-tag-h max-w-full shrink-0 items-center gap-1.5 rounded-pill border px-4 font-body text-tag whitespace-nowrap",
    ],
    label: "min-w-0 truncate",
  },
  variants: {
    tone: {
      default: { root: "border-ink-300 bg-ink-000 text-ink-700" },
      success: { root: "border-status-success bg-status-success-soft text-text-success" },
      brand: { root: "border-pink-200 bg-ink-000 text-pink-700" },
    },
    // Declared after `tone`, so a selected tag's fill, border and text replace the tone's.
    isSelected: { true: { root: "border-tag-selected bg-tag-selected text-ink-000" } },
    isInteractive: { true: { root: "cursor-pointer active:press-scale" } },
  },
  compoundVariants: [
    { isInteractive: true, isSelected: false, class: { root: "hover:bg-pink-50" } },
    // Readme §3.8: a pink fill darkens one step on hover (ink-800 on a pink field).
    {
      isInteractive: true,
      isSelected: true,
      class: { root: "hover:border-tag-selected-hover hover:bg-tag-selected-hover" },
    },
  ],
  defaultVariants: { tone: "default", isSelected: false, isInteractive: false },
});

/** Selectable filter pill used across menu category rails; a static chip without `onClick`. */
export function Tag({
  isSelected = false,
  icon,
  tone,
  disabled = false,
  onClick,
  type = "button",
  className,
  children,
  ...props
}: TagProps) {
  const isInteractive = onClick !== undefined;
  const slots = tagVariants({ tone, isSelected, isInteractive });
  const Component: ElementType = isInteractive ? "button" : "span";
  const state = isInteractive
    ? { type, onClick, disabled, "aria-pressed": isSelected }
    : { "aria-disabled": disabled || undefined };
  return (
    <Component className={slots.root({ className })} {...state} {...props}>
      {icon ? <Icon icon={icon} size="sm" /> : null}
      <span className={slots.label()}>{children}</span>
    </Component>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: PASS.

- [ ] **Step 6: Stories**

Card rows (`Tag.card.html`): `selectable` (one at a time, stateful, with a `play` that presses a tag), `icon`, `disabled` (plus a disabled selected tag). Extras: `tone` (zone chips), `OnSurfaces`, `LongLabel` (Review Focus 1, `play` measures layout), `CategoryFilterRail` (dev parity).

`packages/ui/src/atoms/tag/tag.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Clock, Flame, Leaf } from "lucide-react";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Tag } from "./tag";

const noop = () => undefined;

function SelectableRow({
  labels = ["All", "Small Plates", "Sweets"],
}: {
  labels?: readonly string[] | undefined;
}) {
  const [value, setValue] = useState("All");
  return (
    <div className="flex flex-wrap items-center gap-3">
      {labels.map((label) => (
        <Tag
          key={label}
          isSelected={value === label}
          onClick={() => {
            setValue(label);
          }}
        >
          {label}
        </Tag>
      ))}
    </div>
  );
}

const meta = {
  title: "Atoms/Tag",
  component: Tag,
  args: { children: "Small Plates", isSelected: false },
  argTypes: { icon: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          "Tappable filter pill — menu categories, dietary filters, outlet cities. Sentence/Title Case (not caps — that's `Badge`). Selected = flooded pink; unselected = white with a 1px border. With `onClick` it is a toggle button (`aria-pressed`); without, a static chip. Static `tone` success and brand are the delivery-zone chips. Tags are a fixed 38px and never wrap; a label longer than its row ellipsises.",
      },
    },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Selectable: Story = {
  name: "selectable (onClick + isSelected)",
  render: () => <SelectableRow />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sweets = canvas.getByRole("button", { name: "Sweets" });
    await userEvent.click(sweets);
    await expect(sweets).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  },
};

export const WithIcon: Story = {
  name: "icon",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Tag icon={Leaf}>Jain</Tag>
      <Tag icon={Flame} isSelected>
        Hot
      </Tag>
      <Tag icon={Clock}>Under 15 min</Tag>
    </div>
  ),
};

export const Disabled: Story = {
  name: "disabled",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Tag disabled onClick={noop}>
        Breakfast
      </Tag>
      <Tag disabled isSelected icon={Leaf} onClick={noop}>
        Jain
      </Tag>
      <Tag>Static, no onClick</Tag>
    </div>
  ),
};

/** In context: the menu category rail, one selection at a time. It wraps rather than clips at 360px. */
export const CategoryFilterRail: Story = {
  name: "in context: category rail at 360px",
  render: () => (
    <div className="w-90">
      <SelectableRow
        labels={["All", "Small Plates", "North Indian", "Momos", "Chinese", "Sweets"]}
      />
    </div>
  ),
};

export const Tones: Story = {
  name: "tone",
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Tag tone="success">Sector 57</Tag>
      <Tag tone="success">Sector 56</Tag>
      <Tag tone="brand">Sector 58</Tag>
      <Tag tone="brand">Sector 62</Tag>
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Tag onClick={noop} isSelected>
        All
      </Tag>
      <Tag onClick={noop}>Sweets</Tag>
    </OnSurfaces>
  ),
};

export const LongLabel: Story = {
  name: "long label at 360px",
  render: () => (
    <div data-testid="frame" className="flex w-90 flex-wrap gap-2">
      <Tag onClick={noop} icon={Clock}>
        Under 15 minutes, every weekday lunch and dinner
      </Tag>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const frame = canvas.getByTestId("frame").getBoundingClientRect();
    const tag = canvas.getByRole("button").getBoundingClientRect();
    await expect(tag.right).toBeLessThanOrEqual(frame.right + 0.5);
    await expect(tag.height).toBe(38);
  },
};
```

- [ ] **Step 7: Export**

```ts
export { Tag, type TagProps, tagVariants } from "./atoms/tag/tag";
```

- [ ] **Step 8: Gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/tag packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens packages/design-tokens/contrast-pairs.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: green; Storybook builds.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the Tag atom, a toggle pill or a static chip

A pressable tag is a type=button with aria-pressed; without onClick it is a
static chip. Static success and brand tones carry the handoff's delivery-zone
chips. The selected fill turns ink on a pink field so it never vanishes, and
tagVariants is exported for ToggleGroup-based molecules.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 9: Card

**Dev reference:** `git show dev:packages/ui/src/atoms/card/card.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                                    | Ruling  | Where / reason                                                   |
| ------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------- |
| Flooded skins set `text-text-on-brand` / `on-inverse` on the root                           | ALREADY | the card sets `data-surface` (D5), so all of its content follows |
| `rounded-4/5`, `shadow-elevation*`, `translate-y-(--motion-lift-y)`                         | DROP    | D4; AUTHORING §6 (`hover:lift`)                                  |
| A transition on every card                                                                  | ALREADY | only an interactive card changes, so only it animates            |
| Tests: default skin, five skins, per-skin radius, paddings, lift only when interactive, axe | ALREADY | Step 2                                                           |
| Test: an interactive card never fades (no opacity)                                          | ADD     | Step 2                                                           |
| Test: a nested link owns the interaction inside an interactive card                         | ADD     | Step 2                                                           |
| Test: caller className replaces the radius                                                  | ADD     | Step 2                                                           |
| Brand-card support line stepped up to 20px bold (AA-large)                                  | DROP    | spec §5.1: white on the brand fill is the declared exception     |
| Stories `Default`, `Skins`, `MediaCard`                                                     | ALREADY | `Default`, `FeatureQuiet` + `BrandInk`, `PaddingNone`            |
| Story `Padding` (sm/md/lg)                                                                  | ADD     | Step 6 `Paddings`                                                |
| Story `Interactive` with a nested link                                                      | ADD     | Step 6 `InteractiveWithLink`                                     |

Implementer: copy this table into your report, extended with anything the plan missed.

Source: `components/atoms/Card.{jsx,d.ts,card.html,prompt.md}`, readme §3.5.

**Visuals:**

- `default`: surface-card white, 16px radius, 1px border-subtle, `--shadow-1`.
- `feature`: pink-100, 24px radius, no border, no shadow.
- `brand`: pink-500, 24px radius, `--shadow-brand`.
- `ink`: ink-900, 24px radius.
- `quiet`: surface-sunken, 16px radius.
- Content clips (`overflow: hidden`, for flush media).
- `isInteractive` hovers up −2px to `--shadow-3` over `--duration-base`.
- `padding`: none 0, sm 16, **md 20** (the zip default), lg 28. The zip's other paddings (16 in OrderTracker and CartPanel, 28 in the prompt) map to sm and lg.

Every value is a base token, so Card adds **no** component tokens. It sets `data-surface` from its variant: default and quiet → `light` (a light island inside any field), feature → `soft`, brand → `brand`, ink → `ink`.

**Files:**

- Create: `packages/ui/src/atoms/card/card.tsx`, `card.test.tsx`, `card.stories.tsx`
- Modify: `packages/ui/src/index.ts`
- Tokens, `component-variants.ts`, `contrast-pairs.json`: unchanged. Text inside each variant is covered by Plan 1's semantic surface groups (light, soft, brand, ink, and the card-on-surface groups).

**Interfaces:**

- Consumes: `componentVariants`, `Slot`; `bg-surface-{card,brand-soft,brand,inverse,sunken}`, `shadow-{1,3,brand}`, `hover:lift`, `duration-base`.
- Produces: `Card`, `interface CardProps extends ComponentProps<"div">` (contracts §2).

- [ ] **Step 1: Tokens** — none. Confirm with `rtk proxy grep -nE "radius-lg|radius-xl|shadow-3" packages/design-tokens/dist/theme.css`. It must print all three.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/card/card.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Card } from "./card";

describe("Card", () => {
  it("is a white card and a light island by default", () => {
    render(<Card>Sector 57</Card>);
    const card = screen.getByText("Sector 57");
    expect(card).toHaveAttribute("data-surface", "light");
    expect(card).toHaveClass(
      "bg-surface-card",
      "border",
      "border-border-subtle",
      "rounded-lg",
      "shadow-1",
      "p-5",
      "overflow-hidden"
    );
  });

  it.each([
    ["default", "light", "bg-surface-card", "rounded-lg"],
    ["feature", "soft", "bg-surface-brand-soft", "rounded-xl"],
    ["brand", "brand", "bg-surface-brand", "rounded-xl"],
    ["ink", "ink", "bg-surface-inverse", "rounded-xl"],
    ["quiet", "light", "bg-surface-sunken", "rounded-lg"],
  ] as const)(
    "the %s card sets data-surface=%s, a %s field and %s",
    (variant, surface, fill, radius) => {
      render(<Card variant={variant}>Card</Card>);
      const card = screen.getByText("Card");
      expect(card).toHaveAttribute("data-surface", surface);
      expect(card).toHaveClass(fill, radius);
    }
  );

  it("gives only the brand card the brand glow and only the default card a border", () => {
    render(
      <>
        <Card variant="brand">Brand</Card>
        <Card variant="feature">Feature</Card>
      </>
    );
    expect(screen.getByText("Brand")).toHaveClass("shadow-brand");
    expect(screen.getByText("Feature").className).not.toMatch(/(^|\s)(border|shadow-)/);
  });

  it.each([
    ["none", "p-0"],
    ["sm", "p-4"],
    ["md", "p-5"],
    ["lg", "p-7"],
  ] as const)("pads %s with %s", (padding, paddingClass) => {
    render(<Card padding={padding}>Card</Card>);
    expect(screen.getByText("Card")).toHaveClass(paddingClass);
  });

  it("lifts to shadow-3 on hover only when interactive", () => {
    render(
      <>
        <Card isInteractive>Interactive</Card>
        <Card>Static</Card>
      </>
    );
    expect(screen.getByText("Interactive")).toHaveClass(
      "cursor-pointer",
      "transition",
      "duration-base",
      "hover:lift",
      "hover:shadow-3"
    );
    expect(screen.getByText("Static")).not.toHaveClass("hover:lift");
  });

  it("never fades: an interactive card keeps a real surface", () => {
    render(
      <Card isInteractive variant="feature">
        Feature
      </Card>
    );
    expect(screen.getByText("Feature").className).not.toMatch(/opacity/);
  });

  it("stays a plain container, so a nested link owns the interaction", () => {
    render(
      <Card isInteractive>
        <a href="/menu">See Full Menu</a>
      </Card>
    );
    const link = screen.getByRole("link", { name: "See Full Menu" });
    expect(link).toHaveAttribute("href", "/menu");
    expect(link.parentElement?.tagName).toBe("DIV");
  });

  it("stays a light island inside a flooded field (Review Focus 5)", () => {
    render(
      <div data-surface="brand">
        <Card>Island</Card>
      </div>
    );
    expect(screen.getByText("Island")).toHaveAttribute("data-surface", "light");
  });

  it("becomes the link itself through asChild, without underlining its content", () => {
    render(
      <Card asChild isInteractive>
        <a href="/outlets/sector-57">
          <h3>Sector 57</h3>
        </a>
      </Card>
    );
    const link = screen.getByRole("link", { name: "Sector 57" });
    expect(link).toHaveAttribute("data-surface", "light");
    expect(link).toHaveClass("no-underline", "hover:lift", "bg-surface-card");
  });

  it("merges a consumer className and forwards native props", () => {
    render(
      <Card className="w-50" aria-label="Outlet" role="group">
        Card
      </Card>
    );
    const card = screen.getByRole("group", { name: "Outlet" });
    expect(card).toHaveClass("w-50", "p-5");
  });

  it("lets a consumer className replace its radius", () => {
    render(<Card className="rounded-md">Card</Card>);
    const card = screen.getByText("Card");
    expect(card).toHaveClass("rounded-md");
    expect(card).not.toHaveClass("rounded-lg");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Card>
          <h3>Sector 57</h3>
          <p>8am – 11:30pm</p>
        </Card>
        <Card asChild isInteractive variant="brand">
          <a href="/menu">Menu</a>
        </Card>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: FAIL — `Failed to resolve import "./card"`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/card/card.tsx`:

```tsx
import type { ComponentProps, ElementType } from "react";

import { Slot } from "radix-ui";

import { componentVariants } from "../../lib/component-variants";

export interface CardProps extends ComponentProps<"div"> {
  /** default white · feature light pink · brand flooded pink · ink · quiet sunken grey. */
  variant?: "default" | "feature" | "brand" | "ink" | "quiet";
  /** none (flush media) · sm 16 · md 20 · lg 28. */
  padding?: "none" | "sm" | "md" | "lg";
  /** The −2px hover lift to shadow-3. */
  isInteractive?: boolean;
  /** Make the single child (usually an `<a>`) the card. */
  asChild?: boolean;
}

/** The surface each skin sets: white cards are light islands, flooded ones remap their content. */
const SURFACE = {
  default: "light",
  quiet: "light",
  feature: "soft",
  brand: "brand",
  ink: "ink",
} as const;

const card = componentVariants({
  // no-underline: a card rendered as a link (asChild) must not underline its whole content.
  base: "overflow-hidden no-underline",
  variants: {
    variant: {
      default: "rounded-lg border border-border-subtle bg-surface-card shadow-1",
      feature: "rounded-xl bg-surface-brand-soft",
      brand: "rounded-xl bg-surface-brand shadow-brand",
      ink: "rounded-xl bg-surface-inverse",
      quiet: "rounded-lg bg-surface-sunken",
    },
    padding: { none: "p-0", sm: "p-4", md: "p-5", lg: "p-7" },
    isInteractive: {
      true: "cursor-pointer transition duration-base ease-out hover:lift hover:shadow-3",
    },
  },
  defaultVariants: { variant: "default", padding: "md", isInteractive: false },
});

/** Content container in the brand's five surface skins. Never gets a coloured left border. */
export function Card({
  variant = "default",
  padding,
  isInteractive,
  asChild = false,
  className,
  ...props
}: CardProps) {
  const Component: ElementType = asChild ? Slot.Root : "div";
  return (
    <Component
      data-surface={SURFACE[variant]}
      className={card({ variant, padding, isInteractive, className })}
      {...props}
    />
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: PASS.

- [ ] **Step 6: Stories**

Card rows (`Card.card.html`, cards 200px wide): `default` (+ interactive), `feature quiet`, `brand ink`, `padding={0}` (→ `padding="none"`). Extras:

- `asChild`.
- `LightIsland`: Review Focus 5, `play` reads computed colours.
- `Paddings` (sm/md/lg) and `InteractiveWithLink` (dev parity).

Inner content is plain `<h4>`/`<p>`, which follow the card's own surface. That is the D5 point: the zip passed `tone="inverse"` by hand.

`packages/ui/src/atoms/card/card.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { Card } from "./card";

function Inner({ title, detail }: { title: string; detail: string }) {
  return (
    <>
      <h4 className="m-0">{title}</h4>
      <p className="mt-1.5 mb-0 font-body text-caption text-text-subtle">{detail}</p>
    </>
  );
}

const meta = {
  title: "Atoms/Card",
  component: Card,
  args: {
    variant: "default",
    padding: "md",
    className: "w-50",
    children: <Inner title="Sector 57" detail="8am – 11:30pm" />,
  },
  parameters: {
    docs: {
      description: {
        component:
          'The surface every block of content sits on. `default` white + 1px subtle border + shadow-1; `feature` light pink, 24px radius, no shadow; `brand` flooded pink; `ink` dark, footer-style; `quiet` sunken grey. Each sets `data-surface`, so content inside follows its field — a white card inside a pink section is a light island, with no colour props. Use `padding="none"` when the card starts with an image; `isInteractive` adds the −2px hover lift; `asChild` makes the whole card a link. No card ever has a coloured left border.',
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Default: Story = {
  name: 'variant="default" · isInteractive',
  render: () => (
    <div className="flex flex-wrap items-start gap-3">
      <Card className="w-50">
        <Inner title="Sector 57" detail="8am – 11:30pm" />
      </Card>
      <Card isInteractive className="w-50">
        <Inner title="isInteractive" detail="hovers −2px to shadow-3" />
      </Card>
    </div>
  ),
};

export const FeatureQuiet: Story = {
  name: 'variant="feature" · "quiet"',
  render: () => (
    <div className="flex flex-wrap items-start gap-3">
      <Card variant="feature" className="w-50">
        <Inner title="feature" detail="no border, no shadow" />
      </Card>
      <Card variant="quiet" className="w-50">
        <Inner title="quiet" detail="ink-100" />
      </Card>
    </div>
  ),
};

export const BrandInk: Story = {
  name: 'variant="brand" · "ink"',
  render: () => (
    <div className="flex flex-wrap items-start gap-3">
      <Card variant="brand" className="w-50">
        <Inner title="brand" detail="flooded pink" />
      </Card>
      <Card variant="ink" className="w-50">
        <Inner title="ink" detail="footer surfaces" />
      </Card>
    </div>
  ),
};

export const PaddingNone: Story = {
  name: 'padding="none"',
  render: () => (
    <Card padding="none" className="w-50">
      <div className="h-14 bg-surface-brand-soft" />
      <div className="p-3.5">
        <Inner title="media" detail="image sits flush" />
      </div>
    </Card>
  ),
};

export const Paddings: Story = {
  name: 'padding="sm" · "md" · "lg"',
  render: () => (
    <div className="flex flex-wrap items-start gap-3">
      {(["sm", "md", "lg"] as const).map((padding) => (
        <Card key={padding} padding={padding} className="w-50">
          <Inner title={`padding ${padding}`} detail="16 / 20 / 28px" />
        </Card>
      ))}
    </div>
  ),
};

export const AsChild: Story = {
  name: "asChild (a link)",
  render: () => (
    <Card asChild isInteractive className="w-50">
      <a href="/outlets/sector-57">
        <Inner title="Sector 57" detail="Booth No. 67P, MKM Market" />
      </a>
    </Card>
  ),
};

/** The other interactive pattern: the lift is styling only, and the real link inside owns the click. */
export const InteractiveWithLink: Story = {
  name: "isInteractive with a nested link",
  render: () => (
    <Card isInteractive className="w-60">
      <h4 className="m-0">
        <a href="/menu">See Full Menu</a>
      </h4>
      <p className="mt-1.5 mb-0 font-body text-caption text-text-subtle">
        Momos, chaat and North Indian plates · ₹180–₹320
      </p>
    </Card>
  ),
};

export const LightIsland: Story = {
  name: "light island inside a brand field",
  render: () => (
    <div data-surface="brand" className="rounded-xl bg-surface-brand p-6">
      <Card className="w-60">
        <h4 className="m-0">Sector 57</h4>
        <p data-testid="island-copy" className="m-0 font-body text-caption">
          8am – 11:30pm
        </p>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const copy = within(canvasElement).getByTestId("island-copy");
    const card = copy.parentElement;
    await expect(getComputedStyle(copy).color).toBe("rgb(43, 31, 37)");
    await expect(card === null ? "" : getComputedStyle(card).backgroundColor).toBe(
      "rgb(255, 255, 255)"
    );
  },
};
```

(`rgb(43, 31, 37)` is ink-800, `--color-text-body` restored on the light island. Inside the brand field without the card it would be white.)

- [ ] **Step 7: Export**

```ts
export { Card, type CardProps } from "./atoms/card/card";
```

- [ ] **Step 8: Gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/card packages/ui/src/index.ts
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: green; Storybook builds.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui
git commit -m "feat(ui): add the Card atom, five skins that set their own surface

Default and quiet cards are light islands, feature is soft, brand and ink
remap their content, so text inside needs no colour props. Four paddings,
the hover lift when interactive, and asChild to make the card a link.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 10: Divider

**Dev reference:** `git show dev:packages/ui/src/atoms/divider/divider.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                           | Ruling  | Where / reason                                                                                       |
| ---------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------- |
| A labelled divider is a plain row of decorative rules, so the label stays readable | ALREADY | the label names the separator (`aria-label`), plan deviation 4                                       |
| `on="brand"` (white 30% rule, white label and mark)                                | DROP    | D5 — `border-subtle`, `text-subtle` and `color-divider-mark` follow the surface; Task 15 accepts 22% |
| Radix `Separator` + `"use client"`                                                 | DROP    | D6/D7 — a native `role="separator"` needs no JS                                                      |
| `min-w-0` rules, so a long label cannot push them out                              | ALREADY | the rules are empty `flex-1` spans (zero min-content width)                                          |
| `diamond` ignores `label`                                                          | ALREADY | the label names the diamond break without printing it                                                |
| Tests: hairline + separator role, overline caps, two rules, decorative mark, axe   | ALREADY | Step 2                                                                                               |
| Test: caller className replaces the rule colour                                    | ADD     | Step 2                                                                                               |
| Stories `Default`, `Variants`                                                      | ALREADY | `Line`, `Label`, `Diamond`                                                                           |
| Story `OnBrand` includes the plain line                                            | ADD     | Step 6                                                                                               |
| Story `BetweenMenuRows`                                                            | ADD     | Step 6                                                                                               |

Implementer: copy this table into your report, extended with anything the plan missed.

Source: `components/atoms/Divider.{jsx,d.ts,card.html,prompt.md}`.

**Visuals:**

- A 1px hairline in border-subtle.
- `label`: an uppercase overline (Poppins 700, 11.5px, +0.14em) in text-subtle, centred between two rules with a 14px gap.
- `diamond`: the 16px symbol at 90% opacity between two rules with a 12px gap; pink on light, white on a pink field.

**Semantics:** always `role="separator"`. The label is also the separator's `aria-label`, because a separator's children are presentational. `orientation="vertical"` draws a plain vertical rule.

**Surfaces:** the rule and label use semantic tokens (border-subtle, text-subtle), so they follow any surface. On a pink field that gives white at 22% (the zip hard-coded 28%). Only the mark needs a surface token, `color-divider-mark`.

**Files:**

- Create: `packages/design-tokens/tokens/component/divider.json`
- Modify: `tokens/surface/brand.json`, `tokens/surface/ink.json`, `tokens/surface/light.json`
- Create: `packages/ui/src/atoms/divider/divider.tsx`, `divider.test.tsx`, `divider.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`
- `contrast-pairs.json`: unchanged. The label is `text-subtle`, already measured on every surface, and the mark is not text.

**Interfaces:**

- Consumes: `SymbolMark` (Task 1), `componentVariants`; `OnSurfaces`.
- Produces: `Divider`, `interface DividerProps extends ComponentProps<"div">` (contracts §2); tokens `spacing-divider-mark`, `color-divider-mark`.

- [ ] **Step 1: Component tokens and surface skin**

`packages/design-tokens/tokens/component/divider.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "divider-mark": { "$value": "16px", "$description": "The diamond section-break mark." }
  },
  "color": {
    "$type": "color",
    "divider": {
      "mark": {
        "$value": "{color.pink.500}",
        "$description": "Diamond mark; white on pink and ink fields."
      }
    }
  }
}
```

`tokens/surface/brand.json` and `tokens/surface/ink.json`: inside `surface-<name>.color`, add `"divider": { "mark": { "$value": "{color.ink.000}" } }`.
`tokens/surface/light.json`: inside `surface-light.color`, add `"divider": { "mark": { "$value": "{color.pink.500}" } }`.

In `component-variants.ts`, append to `SPACING`: `"divider-mark",`.

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -6` → PASS.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/divider/divider.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Divider } from "./divider";

describe("Divider", () => {
  it("is a hairline separator in the surface's subtle border by default", () => {
    render(<Divider />);
    const rule = screen.getByRole("separator");
    expect(rule).toHaveClass("h-px", "w-full", "bg-border-subtle");
    expect(rule).toBeEmptyDOMElement();
    expect(rule).not.toHaveAttribute("aria-orientation");
  });

  it("centres an uppercase overline label between two rules, and names the separator with it", () => {
    render(<Divider label="Also Try" />);
    const rule = screen.getByRole("separator", { name: "Also Try" });
    expect(rule).toHaveClass("flex", "items-center", "gap-3.5");
    expect(within(rule).getByText("Also Try")).toHaveClass(
      "font-display",
      "text-overline",
      "uppercase",
      "text-text-subtle"
    );
    expect(rule.querySelectorAll(".bg-border-subtle")).toHaveLength(2);
  });

  it("breaks a section with the diamond mark in the surface-aware mark colour", () => {
    render(<Divider variant="diamond" />);
    const rule = screen.getByRole("separator");
    const mark = rule.querySelector("svg");
    expect(rule).toHaveClass("flex", "gap-3");
    expect(mark).toHaveClass("size-divider-mark", "text-divider-mark", "opacity-90");
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(rule.querySelectorAll(".bg-border-subtle")).toHaveLength(2);
  });

  it("names a diamond break with its label without printing it", () => {
    render(<Divider variant="diamond" label="Company" />);
    expect(screen.getByRole("separator", { name: "Company" })).toBeInTheDocument();
    expect(screen.queryByText("Company")).not.toBeInTheDocument();
  });

  it("draws a plain vertical rule", () => {
    render(<Divider orientation="vertical" label="Between" />);
    const rule = screen.getByRole("separator", { name: "Between" });
    expect(rule).toHaveAttribute("aria-orientation", "vertical");
    expect(rule).toHaveClass("w-px", "self-stretch", "bg-border-subtle");
    expect(rule).toBeEmptyDOMElement();
  });

  it("merges a consumer className and forwards native props", () => {
    render(<Divider className="my-6" id="rule" />);
    const rule = screen.getByRole("separator");
    expect(rule).toHaveClass("my-6", "h-px");
    expect(rule).toHaveAttribute("id", "rule");
  });

  it("lets a consumer className replace the rule colour", () => {
    render(<Divider className="bg-border-strong" />);
    const rule = screen.getByRole("separator");
    expect(rule).toHaveClass("bg-border-strong");
    expect(rule).not.toHaveClass("bg-border-subtle");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Divider />
        <Divider label="Also Try" />
        <Divider variant="diamond" />
        <Divider orientation="vertical" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: FAIL — `Failed to resolve import "./divider"`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/divider/divider.tsx`:

```tsx
import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";
import { SymbolMark } from "../../lib/symbol-mark";

export interface DividerProps extends ComponentProps<"div"> {
  /** line = hairline · diamond = the brand's section break. */
  variant?: "line" | "diamond";
  /** Centred uppercase label; also the separator's accessible name. */
  label?: string;
  /** vertical draws a plain rule (label and diamond are horizontal-only). */
  orientation?: "horizontal" | "vertical";
}

type Layout = "rule" | "vertical" | "labelled" | "diamond";

const divider = componentVariants({
  slots: {
    root: "",
    line: "h-px flex-1 bg-border-subtle",
    label: "shrink-0 font-display text-overline text-text-subtle uppercase",
    mark: "size-divider-mark shrink-0 text-divider-mark opacity-90",
  },
  variants: {
    layout: {
      rule: { root: "h-px w-full bg-border-subtle" },
      vertical: { root: "w-px self-stretch bg-border-subtle" },
      labelled: { root: "flex items-center gap-3.5" },
      diamond: { root: "flex items-center gap-3" },
    },
  },
});

function layoutOf(
  variant: DividerProps["variant"],
  label: string | undefined,
  orientation: DividerProps["orientation"]
): Layout {
  if (orientation === "vertical") return "vertical";
  if (variant === "diamond") return "diamond";
  return label === undefined ? "rule" : "labelled";
}

/** Hairline rule. `diamond` inserts the brand mark as a section break. */
export function Divider({
  variant = "line",
  label,
  orientation = "horizontal",
  className,
  ...props
}: DividerProps) {
  const layout = layoutOf(variant, label, orientation);
  const slots = divider({ layout });
  const hasOrnament = layout === "labelled" || layout === "diamond";
  return (
    <div
      role="separator"
      aria-orientation={orientation === "vertical" ? "vertical" : undefined}
      aria-label={label}
      className={slots.root({ className })}
      {...props}
    >
      {hasOrnament ? (
        <>
          <span className={slots.line()} />
          {layout === "diamond" ? (
            <SymbolMark className={slots.mark()} />
          ) : (
            <span className={slots.label()}>{label}</span>
          )}
          <span className={slots.line()} />
        </>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: PASS.

- [ ] **Step 6: Stories**

Card rows (`Divider.card.html`, full-width rows): `line`, `label`, `diamond`, `on="brand"` (→ a brand surface: the plain line, `label="Company"` + `diamond`). Extras: `orientation="vertical"`, `OnSurfaces`, `BetweenMenuRows` (dev parity).

`packages/ui/src/atoms/divider/divider.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Divider } from "./divider";

const meta = {
  title: "Atoms/Divider",
  component: Divider,
  args: { variant: "line" },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Hairline separator; the `diamond` variant is the brand's section break. Menu rows are separated by `Divider`, not by cards. The rule, the label and the mark follow the surface, so on a pink field they turn white with no prop. A `label` is also the separator's accessible name.",
      },
    },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Line: Story = { name: 'variant="line"' };

export const Label: Story = { name: "label", args: { label: "Also Try" } };

export const Diamond: Story = { name: 'variant="diamond"', args: { variant: "diamond" } };

export const OnBrand: Story = {
  name: "on a brand surface",
  render: () => (
    <div data-surface="brand" className="grid gap-2.5 rounded-lg bg-surface-brand p-3.5">
      <Divider />
      <Divider label="Company" />
      <Divider variant="diamond" />
    </div>
  ),
};

/** How it reads: menu rows separated by a rule, not by cards, closed by the diamond. */
export const BetweenMenuRows: Story = {
  name: "in context: between menu rows",
  render: () => (
    <div className="w-80 font-body text-body">
      {[
        { name: "Paneer Tikka Masala", price: "₹280" },
        { name: "Veg Steamed Momos", price: "₹180" },
        { name: "Masala Cold Brew", price: "₹200" },
      ].map((dish, index) => (
        <div key={dish.name}>
          {index > 0 ? <Divider /> : null}
          <div className="flex items-baseline justify-between gap-4 py-4">
            <span className="min-w-0">{dish.name}</span>
            <span className="text-text-brand">{dish.price}</span>
          </div>
        </div>
      ))}
      <Divider variant="diamond" className="my-8" />
    </div>
  ),
};

export const Vertical: Story = {
  name: 'orientation="vertical"',
  render: () => (
    <div className="flex h-10 items-center gap-3 font-body text-body-sm">
      <span>Sector 57</span>
      <Divider orientation="vertical" />
      <span>8am – 11:30pm</span>
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <div className="grid w-full gap-2.5">
        <Divider label="Also Try" />
        <Divider variant="diamond" />
      </div>
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { Divider, type DividerProps } from "./atoms/divider/divider";
```

- [ ] **Step 8: Gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/divider packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: green; Storybook builds.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the Divider atom with the diamond section break

A separator in three forms (hairline, labelled, diamond) plus a vertical
rule. The rule and label follow the surface through semantic tokens and the
drawn mark through its own surface token; the label names the separator.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 11: ImageSlot

**Dev reference:** `git show dev:packages/ui/src/atoms/image-slot/image-slot.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                                                     | Ruling                        | Where / reason                                                                                  |
| ------------------------------------------------------------------------------------------------------------ | ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `label` defaults to "Dish photo"                                                                             | DROP                          | D9 (no content defaults); a placeholder requires `label` (contracts §2)                         |
| The placeholder is not announced                                                                             | ALREADY                       | the plan names it (`role="img"` + `label`), so the crop brief is not silent                     |
| `alt` defaults to `""`                                                                                       | ALREADY                       | `alt` is required; a decorative photo passes `alt=""` explicitly                                |
| Arbitrary `aspect-[4/3]`; radius `thumb`/`card`/`sheet`; labels pink-400 / pink-700 / ink-500                | DROP                          | AUTHORING §6 (aspect tokens); contracts §2 radius enum (D4); spec §5.3 re-pointing              |
| `isFullHeight` drops the ratio                                                                               | ALREADY                       | `isFill` (`aspect-auto h-full`, exactly one aspect class)                                       |
| The caption is dropped once a photo is given                                                                 | ALREADY                       | the union forbids `label` with `src` (`label?: never`)                                          |
| Native `div` props (`id`, `data-*`, `ref`, `aria-*`) forwarded to the root                                   | ADD, pending a contract delta | contracts §2 `ImageSlotBase` has no native props: 02a audit, proposed delta 1. Not amended here |
| Tests: placeholder, photo + `object-cover`, ratios, no collapse, tones, radii, fill, className override, axe | ALREADY                       | Step 2                                                                                          |
| Stories `Default`, `Tones`, `Radii`, `NamingTheCrop`, `FullHeight`                                           | ALREADY                       | `Playground`, `Tones`, `Radii`, `Label`, `Fill`                                                 |
| Story `Ratios` shows 4:5 and 21:9 too                                                                        | ADD                           | Step 6 `Ratios` (all seven)                                                                     |

Implementer: copy this table into your report, extended with anything the plan missed.

Source: `components/atoms/ImageSlot.{jsx,d.ts,card.html,prompt.md}`, readme §3.4 and §3.10 ("images always sit in an `aspect-ratio` box, so a missing photo can't collapse a layout"), spec §9.1.

**Placeholder visuals:**

- A full-width box with an aspect ratio, a md radius, clipped content and a centred label.
- Label: Poppins 700, 10.5px, +0.12em, capitals, balanced, 12px side padding.
- Tones (labels re-pointed for AA, spec §5.3 and contract deviation 5):
  - soft: pink-100 fill, label pink-400 → **pink-700**.
  - strong: pink-200 fill, label pink-700 → **pink-800**.
  - ink: ink-200 fill, label ink-500 → **ink-600**.

**With a photo:** a real `<img>` (the zip used `background-image`) with intrinsic `width`/`height`, `loading="lazy"` by default, `decoding="async"` and `object-cover`, filling the same box.

The props are a discriminated union: a photo requires `alt`, `width` and `height`, while a placeholder requires `label`. A `<picture>` passed as children (the image pipeline, step 2) renders in the same box.

**Files:**

- Create: `packages/design-tokens/tokens/component/image-slot.json`
- Modify: `packages/design-tokens/contrast-pairs.json`
- Create: `packages/ui/src/atoms/image-slot/image-slot.tsx`, `image-slot.test.tsx`, `image-slot.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `componentVariants`; `aspect-*` (Plan 1 aspect tokens), `rounded-{md,lg,xl}`.
- Produces: `ImageSlot`, `interface ImageSlotBase`, `type ImageSlotProps` (exactly contracts §2); token `text-image-slot-label`.

- [ ] **Step 1: Component token and contrast pairs**

`packages/design-tokens/tokens/component/image-slot.json`:

```json
{
  "text": {
    "$type": "typography",
    "image-slot-label": {
      "$value": {
        "fontSize": "10.5px",
        "letterSpacing": "0.12em",
        "fontWeight": "{font-weight.bold}"
      },
      "$description": "The placeholder's crop label. Inherits line height, as in the design system."
    }
  }
}
```

`packages/design-tokens/contrast-pairs.json`: append to `groups`:

```json
{
  "id": "image-slot",
  "surface": null,
  "pairs": [
    ["color-pink-700", "color-pink-100"],
    ["color-pink-800", "color-pink-200"],
    ["color-ink-600", "color-ink-200"]
  ],
  "min": 4.5
}
```

(Measured: 5.66, 6.67, 5.22. The design system's pink-400 / pink-700 / ink-500 measure 2.53 / 4.48 / 3.07.)

In `component-variants.ts`, append to `TEXT`: `"image-slot-label",`.

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -6` → PASS.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/image-slot/image-slot.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { ImageSlot } from "./image-slot";

describe("ImageSlot", () => {
  it("renders a labelled placeholder that names the crop, announced as an image", () => {
    render(<ImageSlot label="Hero 16:9 — warm, close-cropped" ratio="16:9" />);
    const slot = screen.getByRole("img", { name: "Hero 16:9 — warm, close-cropped" });
    expect(slot).toHaveTextContent("Hero 16:9 — warm, close-cropped");
    expect(slot.firstElementChild).toHaveClass(
      "font-display",
      "text-image-slot-label",
      "uppercase",
      "text-balance",
      "text-center"
    );
  });

  it("keeps its aspect box and full width with no photo (Review Focus 4)", () => {
    render(<ImageSlot label="Dish photo" ratio="16:9" />);
    const slot = screen.getByRole("img");
    expect(slot).toHaveClass("aspect-16-9", "w-full", "overflow-hidden");
    expect(slot.className.match(/(^|\s)aspect-/g)).toHaveLength(1);
  });

  it.each([
    ["square", "aspect-square"],
    ["4:3", "aspect-4-3"],
    ["3:4", "aspect-3-4"],
    ["4:5", "aspect-4-5"],
    ["16:9", "aspect-16-9"],
    ["16:10", "aspect-16-10"],
    ["wide", "aspect-wide"],
  ] as const)("ratio %s uses %s", (ratio, aspect) => {
    render(<ImageSlot label="Crop" ratio={ratio} />);
    expect(screen.getByRole("img")).toHaveClass(aspect);
  });

  it("defaults to a 4:3 soft slot with the md radius", () => {
    render(<ImageSlot label="Dish photo" />);
    expect(screen.getByRole("img")).toHaveClass("aspect-4-3", "bg-pink-100", "rounded-md");
  });

  it.each([
    ["soft", "bg-pink-100", "text-pink-700"],
    ["strong", "bg-pink-200", "text-pink-800"],
    ["ink", "bg-ink-200", "text-ink-600"],
  ] as const)("tone %s fills %s and labels in %s (AA, spec §5.3)", (tone, fill, label) => {
    render(<ImageSlot label="Kitchen" tone={tone} />);
    const slot = screen.getByRole("img");
    expect(slot).toHaveClass(fill);
    expect(slot.firstElementChild).toHaveClass(label);
  });

  it.each([
    ["none", "rounded-none"],
    ["md", "rounded-md"],
    ["lg", "rounded-lg"],
    ["xl", "rounded-xl"],
  ] as const)("radius %s uses %s", (radius, radiusClass) => {
    render(<ImageSlot label="Crop" radius={radius} />);
    expect(screen.getByRole("img")).toHaveClass(radiusClass);
  });

  it("fills its parent's height instead of an aspect ratio when isFill — one aspect class (Review Focus 4)", () => {
    render(<ImageSlot label="Full-bleed panel" isFill />);
    const slot = screen.getByRole("img");
    expect(slot).toHaveClass("h-full", "aspect-auto");
    expect(slot.className.match(/(^|\s)aspect-/g)).toHaveLength(1);
  });

  it("renders a real photo as a lazy, intrinsically sized img covering the box (Review Focus 4)", () => {
    render(
      <ImageSlot
        src="/photos/boxes-packed.avif"
        alt="Freshly packed Homely Meals box"
        width={1200}
        height={900}
      />
    );
    const img = screen.getByRole("img", { name: "Freshly packed Homely Meals box" });
    expect(img.tagName).toBe("IMG");
    expect(img).toHaveAttribute("width", "1200");
    expect(img).toHaveAttribute("height", "900");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("decoding", "async");
    expect(img).toHaveClass("size-full", "object-cover");
    expect(img.parentElement).toHaveClass("aspect-4-3");
    expect(img.parentElement).not.toHaveAttribute("role");
  });

  it("passes srcSet, sizes and an eager high priority through for the hero", () => {
    render(
      <ImageSlot
        src="/hero-1200.avif"
        srcSet="/hero-600.avif 600w, /hero-1200.avif 1200w"
        sizes="(min-width: 768px) 50vw, 100vw"
        alt="Classic thali"
        width={1200}
        height={1500}
        ratio="4:5"
        loading="eager"
        fetchPriority="high"
      />
    );
    const img = screen.getByRole("img", { name: "Classic thali" });
    expect(img).toHaveAttribute("srcset", "/hero-600.avif 600w, /hero-1200.avif 1200w");
    expect(img).toHaveAttribute("sizes", "(min-width: 768px) 50vw, 100vw");
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("fetchpriority", "high");
  });

  it("renders a <picture> from the image pipeline inside the same box", () => {
    render(
      <ImageSlot label="Thali 4:3" ratio="4:3">
        <picture>
          <source srcSet="/thali.avif" type="image/avif" />
          <img src="/thali.jpg" alt="Classic thali" width={800} height={600} />
        </picture>
      </ImageSlot>
    );
    const img = screen.getByRole("img", { name: "Classic thali" });
    expect(img.closest("picture")?.parentElement).toHaveClass("aspect-4-3");
    expect(screen.queryByRole("img", { name: "Thali 4:3" })).not.toBeInTheDocument();
  });

  it("does not compile a photo without alt, width and height", () => {
    // @ts-expect-error — a real image needs alt (a11y) and intrinsic size (no layout shift)
    render(<ImageSlot src="/photos/thali.jpg" />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("merges a consumer className", () => {
    render(<ImageSlot label="Dish photo" className="w-40" />);
    const slot = screen.getByRole("img");
    expect(slot).toHaveClass("w-40");
    expect(slot).not.toHaveClass("w-full");
  });

  it("has no accessibility violations as a placeholder and as a photo", async () => {
    const { container } = render(
      <>
        <ImageSlot label="Hero 4:5 — warm, close-cropped" ratio="4:5" />
        <ImageSlot src="/photos/thali.jpg" alt="Classic thali" width={800} height={600} />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: FAIL — `Failed to resolve import "./image-slot"`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/image-slot/image-slot.tsx`:

```tsx
import type { ReactNode } from "react";

import { componentVariants } from "../../lib/component-variants";

export interface ImageSlotBase {
  ratio?: "square" | "4:3" | "3:4" | "4:5" | "16:9" | "16:10" | "wide";
  radius?: "none" | "md" | "lg" | "xl";
  /** Placeholder colourway: soft pink-100 · strong pink-200 · ink grey. */
  tone?: "soft" | "strong" | "ink";
  /** Fill the parent's height instead of using an aspect ratio (full-bleed panels). */
  isFill?: boolean;
  className?: string;
  /** A `<picture>` from the image pipeline; its `<img>` should carry `size-full object-cover`. */
  children?: ReactNode;
}

/** A real image (alt and intrinsic size required), or a placeholder that names the crop it needs. */
export type ImageSlotProps = ImageSlotBase &
  (
    | {
        src: string;
        alt: string;
        width: number;
        height: number;
        sizes?: string;
        srcSet?: string;
        loading?: "lazy" | "eager";
        fetchPriority?: "high" | "low" | "auto";
        label?: never;
      }
    | { src?: undefined; label: string }
  );

const imageSlot = componentVariants({
  slots: {
    root: "relative grid w-full place-items-center overflow-hidden",
    image: "size-full object-cover",
    label: "px-3 text-center font-display text-image-slot-label text-balance uppercase",
  },
  variants: {
    ratio: {
      square: { root: "aspect-square" },
      "4:3": { root: "aspect-4-3" },
      "3:4": { root: "aspect-3-4" },
      "4:5": { root: "aspect-4-5" },
      "16:9": { root: "aspect-16-9" },
      "16:10": { root: "aspect-16-10" },
      wide: { root: "aspect-wide" },
    },
    radius: {
      none: { root: "rounded-none" },
      md: { root: "rounded-md" },
      lg: { root: "rounded-lg" },
      xl: { root: "rounded-xl" },
    },
    tone: {
      soft: { root: "bg-pink-100", label: "text-pink-700" },
      strong: { root: "bg-pink-200", label: "text-pink-800" },
      ink: { root: "bg-ink-200", label: "text-ink-600" },
    },
    // Declared after `ratio`, so `aspect-auto` replaces the ratio in the merge.
    isFill: { true: { root: "aspect-auto h-full" } },
  },
  defaultVariants: { ratio: "4:3", radius: "md", tone: "soft", isFill: false },
});

/**
 * Every image in the system. Until real photography lands, a labelled placeholder that names the
 * crop it needs; with `src`, a lazy `<img>` in the same aspect box, so a layout never collapses.
 */
export function ImageSlot(props: ImageSlotProps) {
  const { ratio, radius, tone, isFill, className, children } = props;
  const slots = imageSlot({ ratio, radius, tone, isFill });
  const isPlaceholder = children === undefined && props.src === undefined;
  return (
    <div
      role={isPlaceholder ? "img" : undefined}
      aria-label={isPlaceholder ? props.label : undefined}
      className={slots.root({ className })}
    >
      {children ??
        (props.src === undefined ? (
          <span className={slots.label()}>{props.label}</span>
        ) : (
          <img
            className={slots.image()}
            src={props.src}
            alt={props.alt}
            width={props.width}
            height={props.height}
            sizes={props.sizes}
            srcSet={props.srcSet}
            loading={props.loading ?? "lazy"}
            decoding="async"
            fetchPriority={props.fetchPriority}
          />
        ))}
    </div>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: PASS.

- [ ] **Step 6: Stories**

Card rows (`ImageSlot.card.html`): `ratio` (square 96px, 4:3 120px, 3:4 80px, 16:9 150px wide; plus 4:5, 16:10 and 21:9 for dev parity), `tone`, `label` ("name the real crop", max 300px). Extras: `src` (a real image, the committed brand symbol), `isFill`, `radius`.

`packages/ui/src/atoms/image-slot/image-slot.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import symbolPink from "../../assets/brand/symbol-pink.svg";
import { ImageSlot } from "./image-slot";

const meta = {
  title: "Atoms/ImageSlot",
  component: ImageSlot,
  args: { label: "Hero 4:5 — warm, close-cropped", ratio: "4:5", className: "w-60" },
  parameters: {
    docs: {
      description: {
        component:
          'Every image in the system. Until real photography lands, it renders a labelled pink placeholder that names the crop needed — always give a specific `label` ("Dish photo" says nothing; "Kitchen portrait 3:4" is what a photographer can act on). With `src` it renders a lazy `<img>` with its intrinsic `width`/`height` inside the same aspect box, so a missing photo never collapses a layout. `isFill` for full-bleed panels; pass a `<picture>` as children for the image pipeline.',
      },
    },
  },
} satisfies Meta<typeof ImageSlot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Ratios: Story = {
  name: "ratio",
  render: () => (
    <div className="flex flex-wrap items-start gap-3">
      <ImageSlot ratio="square" label="1:1" className="w-24" />
      <ImageSlot ratio="4:3" label="4:3" className="w-30" />
      <ImageSlot ratio="3:4" label="3:4" className="w-20" />
      <ImageSlot ratio="4:5" label="4:5" className="w-20" />
      <ImageSlot ratio="16:9" label="16:9" className="w-37.5" />
      <ImageSlot ratio="16:10" label="16:10" className="w-37.5" />
      <ImageSlot ratio="wide" label="21:9" className="w-37.5" />
    </div>
  ),
};

export const Tones: Story = {
  name: "tone",
  render: () => (
    <div className="flex items-start gap-3">
      <ImageSlot tone="soft" label="soft" className="w-30" />
      <ImageSlot tone="strong" label="strong" className="w-30" />
      <ImageSlot tone="ink" label="ink" className="w-30" />
    </div>
  ),
};

export const Label: Story = {
  name: "label (name the real crop)",
  render: () => (
    <ImageSlot
      ratio="16:9"
      label="Hero 16:9 — warm, close-cropped, steam visible"
      className="max-w-75"
    />
  ),
};

export const Photo: Story = {
  name: "src (a real image)",
  render: () => (
    <ImageSlot
      src={symbolPink}
      alt="The Pink Paprikaa diamond symbol"
      width={358}
      height={358}
      ratio="square"
      tone="ink"
      className="w-40"
    />
  ),
};

export const Fill: Story = {
  name: "isFill",
  render: () => (
    <div className="h-40 w-72">
      <ImageSlot isFill radius="xl" label="Full-bleed panel — fills its parent" />
    </div>
  ),
};

export const Radii: Story = {
  name: "radius",
  render: () => (
    <div className="flex items-start gap-3">
      {(["none", "md", "lg", "xl"] as const).map((radius) => (
        <ImageSlot key={radius} radius={radius} label={radius} className="w-30" />
      ))}
    </div>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { ImageSlot, type ImageSlotBase, type ImageSlotProps } from "./atoms/image-slot/image-slot";
```

- [ ] **Step 8: Gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/image-slot packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/image-slot.json packages/design-tokens/contrast-pairs.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: green; Storybook builds.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the ImageSlot atom, a real image or a named placeholder

A discriminated union: a photo needs alt and intrinsic size and renders a lazy
img covering the box; a placeholder names the crop it needs. Either way the
box keeps its aspect ratio, so a missing photo cannot collapse a layout.
Placeholder labels are re-pointed to AA-passing steps.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 12: Badge

**Dev reference:** `git show dev:packages/ui/src/atoms/badge/badge.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                               | Ruling  | Where / reason                                                 |
| ---------------------------------------------------------------------- | ------- | -------------------------------------------------------------- |
| `rounded-6`, `bg-brand-soft`, status colours as text (`text-status-*`) | DROP    | D4; spec §5.3 (status text uses the AA `text-text-*` tokens)   |
| `brand` is a fixed pink                                                | ALREADY | the surface-aware `badge-brand-*` pair (white on a pink field) |
| Tests: caps, not a control, seven tones, soft default, axe             | ALREADY | Step 2                                                         |
| Test: the glyph is decorative (one svg, `aria-hidden`)                 | ADD     | Step 2                                                         |
| Test: caller className replaces the radius                             | ADD     | Step 2                                                         |
| Stories `Default`, `Tones`, `StatusTones`, `WithIcons`                 | ALREADY | `Playground`, `Tones`, `StatusTones`, `WithIcon`               |
| Story `OnAMenuCard`                                                    | ADD     | Step 6                                                         |

Implementer: copy this table into your report, extended with anything the plan missed.

Source: `components/atoms/Badge.{jsx,d.ts,card.html,prompt.md}`. Visuals: a non-interactive pill with 4px × 10px padding, a 5px gap to a 12px glyph, and overline type (Poppins 700, 11.5px, +0.14em, line height 1.2, capitals), no wrap. Tones:

| Tone      | Fill          | Text            |
| --------- | ------------- | --------------- |
| `brand`   | pink-500      | white           |
| `soft`    | pink-100      | pink-700        |
| `ink`     | ink-900       | white           |
| `success` | mint-soft     | mint-strong     |
| `warning` | turmeric-soft | turmeric-strong |
| `danger`  | danger-soft   | danger          |
| `neutral` | ink-100       | ink-700         |

`brand` would vanish on a pink field, so there it flips to white with pink-600 text (one surface skin).

**Files:**

- Create: `packages/design-tokens/tokens/component/badge.json`
- Modify: `tokens/surface/brand.json`, `tokens/surface/light.json`, `packages/design-tokens/contrast-pairs.json`
- Create: `packages/ui/src/atoms/badge/badge.tsx`, `badge.test.tsx`, `badge.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Icon`, `IconComponent`; `text-overline`; `text-text-{success,warning,danger}`, `bg-status-*-soft`; `OnSurfaces`.
- Produces: `Badge`, `interface BadgeProps extends ComponentProps<"span">` (contracts §2); tokens `spacing-badge-icon`, `color-badge-brand-{bg,fg}`.

- [ ] **Step 1: Component tokens, surface skin, contrast pairs**

`packages/design-tokens/tokens/component/badge.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "badge-icon": { "$value": "12px", "$description": "The Badge glyph." }
  },
  "color": {
    "$type": "color",
    "badge": {
      "brand": {
        "bg": { "$value": "{color.surface.brand}", "$description": "White on a pink field." },
        "fg": { "$value": "{color.text.on-brand}", "$description": "Pink-600 on a pink field." }
      }
    }
  }
}
```

`tokens/surface/brand.json`: inside `surface-brand.color`, add:

```json
"badge": {
  "brand": {
    "bg": { "$value": "{color.ink.000}" },
    "fg": { "$value": "{color.pink.600}" }
  }
}
```

`tokens/surface/light.json`: inside `surface-light.color`, add:

```json
"badge": {
  "brand": {
    "bg": { "$value": "{color.surface.brand}" },
    "fg": { "$value": "{color.text.on-brand}" }
  }
}
```

`packages/design-tokens/contrast-pairs.json`: append to `groups`:

```json
{
  "id": "badge",
  "surface": null,
  "pairs": [
    ["color-pink-700", "color-pink-100"],
    ["color-ink-000", "color-ink-900"],
    ["color-ink-700", "color-ink-100"],
    ["color-text-success", "color-status-success-soft"],
    ["color-text-warning", "color-status-warning-soft"],
    ["color-text-danger", "color-status-danger-soft"]
  ],
  "min": 4.5
},
{
  "id": "badge-brand",
  "surface": null,
  "pairs": [["color-badge-brand-fg", "color-badge-brand-bg"]],
  "min": 3,
  "exception": "brand-fill"
},
{
  "id": "badge-brand-on-brand",
  "surface": "brand",
  "pairs": [["color-badge-brand-fg", "color-badge-brand-bg"]],
  "min": 4.5
}
```

(Measured: 5.66, 18.39, 10.17, 5.57, 5.19, 4.60; white on pink 4.04; pink-600 on white 5.18.)

In `component-variants.ts`, append to `SPACING`: `"badge-icon",`.

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -6` → PASS.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/badge/badge.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { Flame } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Badge } from "./badge";

describe("Badge", () => {
  it("is a soft, uppercase, non-interactive pill by default", () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText("New").parentElement;
    expect(badge?.tagName).toBe("SPAN");
    expect(badge).toHaveClass(
      "bg-pink-100",
      "text-pink-700",
      "font-display",
      "text-overline",
      "uppercase",
      "rounded-pill",
      "px-2.5",
      "py-1",
      "gap-1.25"
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it.each([
    ["brand", "bg-badge-brand-bg", "text-badge-brand-fg"],
    ["soft", "bg-pink-100", "text-pink-700"],
    ["ink", "bg-ink-900", "text-ink-000"],
    ["success", "bg-status-success-soft", "text-text-success"],
    ["warning", "bg-status-warning-soft", "text-text-warning"],
    ["danger", "bg-status-danger-soft", "text-text-danger"],
    ["neutral", "bg-ink-100", "text-ink-700"],
  ] as const)("paints the %s tone with %s and %s", (tone, fill, text) => {
    render(<Badge tone={tone}>Bestseller</Badge>);
    expect(screen.getByText("Bestseller").parentElement).toHaveClass(fill, text);
  });

  it("draws a 12px glyph at the heavy 2px stroke", () => {
    render(<Badge icon={Flame}>Hot</Badge>);
    const glyph = screen.getByText("Hot").parentElement?.firstElementChild;
    expect(glyph).toHaveClass("size-badge-icon");
    expect(glyph).not.toHaveClass("size-icon-xs");
    expect(glyph?.querySelector("svg")).toHaveAttribute("stroke-width", "2");
  });

  it("never wraps — a long label truncates inside the pill (Review Focus 1)", () => {
    render(<Badge>Launch price for the first month</Badge>);
    const label = screen.getByText("Launch price for the first month");
    expect(label).toHaveClass("min-w-0", "truncate");
    expect(label.parentElement).toHaveClass("whitespace-nowrap", "max-w-full", "shrink-0");
  });

  it("merges a consumer className and forwards native props", () => {
    render(
      <Badge className="ml-1" id="pick">
        Pick
      </Badge>
    );
    const badge = screen.getByText("Pick").parentElement;
    expect(badge).toHaveClass("ml-1", "px-2.5");
    expect(badge).toHaveAttribute("id", "pick");
  });

  it("keeps its glyph decorative, so only the label is read", () => {
    render(<Badge icon={Flame}>Hot</Badge>);
    const glyphs = screen.getByText("Hot").parentElement?.querySelectorAll("svg");
    expect(glyphs).toHaveLength(1);
    expect(glyphs?.[0]).toHaveAttribute("aria-hidden", "true");
  });

  it("lets a consumer className replace its radius", () => {
    render(<Badge className="rounded-md">Pick</Badge>);
    const badge = screen.getByText("Pick").parentElement;
    expect(badge).toHaveClass("rounded-md");
    expect(badge).not.toHaveClass("rounded-pill");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Badge tone="brand">Bestseller</Badge>
        <Badge tone="success" icon={Flame}>
          100% Veg
        </Badge>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: FAIL — `Failed to resolve import "./badge"`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/badge/badge.tsx`:

```tsx
import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";
import { Icon, type IconComponent } from "../icon/icon";

export interface BadgeProps extends ComponentProps<"span"> {
  tone?: "brand" | "soft" | "ink" | "success" | "warning" | "danger" | "neutral";
  /** Optional 12px glyph. */
  icon?: IconComponent;
}

const badge = componentVariants({
  slots: {
    root: "inline-flex max-w-full shrink-0 items-center gap-1.25 rounded-pill px-2.5 py-1 font-display text-overline whitespace-nowrap uppercase",
    icon: "size-badge-icon",
    label: "min-w-0 truncate",
  },
  variants: {
    tone: {
      // Brand is the one surface-aware skin: white with pink text on a pink field.
      brand: { root: "bg-badge-brand-bg text-badge-brand-fg" },
      soft: { root: "bg-pink-100 text-pink-700" },
      ink: { root: "bg-ink-900 text-ink-000" },
      success: { root: "bg-status-success-soft text-text-success" },
      warning: { root: "bg-status-warning-soft text-text-warning" },
      danger: { root: "bg-status-danger-soft text-text-danger" },
      neutral: { root: "bg-ink-100 text-ink-700" },
    },
  },
  defaultVariants: { tone: "soft" },
});

/** Small uppercase status marker. Reads as a label, never as a button. */
export function Badge({ tone, icon, className, children, ...props }: BadgeProps) {
  const slots = badge({ tone });
  return (
    <span className={slots.root({ className })} {...props}>
      {icon ? <Icon icon={icon} size="xs" className={slots.icon()} /> : null}
      <span className={slots.label()}>{children}</span>
    </span>
  );
}
```

(`size="xs"` picks the 2px stroke the design system uses at small sizes; `size-badge-icon` sets the 12px box, replacing `size-icon-xs` in the merge.)

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: PASS.

- [ ] **Step 6: Stories**

Card rows (`Badge.card.html`): `tone` (brand Bestseller, soft New, ink Tonight Only, neutral Veg), `status tones` (success Confirmed, warning Kitchen Busy, danger Sold Out), `icon` (soft flame Hot, success leaf 100% Veg, brand star Chef Pick). Extras: `OnSurfaces`, `OnAMenuCard` (dev parity).

`packages/ui/src/atoms/badge/badge.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Flame, Leaf, Star } from "lucide-react";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Badge } from "./badge";

const meta = {
  title: "Atoms/Badge",
  component: Badge,
  args: { children: "Bestseller", tone: "brand" },
  argTypes: { icon: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          "Uppercase status marker for menu items, orders and cards — non-interactive. Always ALL CAPS and two words maximum. For a filterable, tappable pill use `Tag` instead. The `brand` tone turns white on a pink field so it never vanishes; the other tones carry their own fills and read on any surface.",
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  name: "tone",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge tone="brand">Bestseller</Badge>
      <Badge tone="soft">New</Badge>
      <Badge tone="ink">Tonight Only</Badge>
      <Badge tone="neutral">Veg</Badge>
    </div>
  ),
};

export const StatusTones: Story = {
  name: 'tone="success" · "warning" · "danger"',
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge tone="success">Confirmed</Badge>
      <Badge tone="warning">Kitchen Busy</Badge>
      <Badge tone="danger">Sold Out</Badge>
    </div>
  ),
};

export const WithIcon: Story = {
  name: "icon",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge tone="soft" icon={Flame}>
        Hot
      </Badge>
      <Badge tone="success" icon={Leaf}>
        100% Veg
      </Badge>
      <Badge tone="brand" icon={Star}>
        Chef Pick
      </Badge>
    </div>
  ),
};

/** In context: the markers on a menu card, above the dish name. */
export const OnAMenuCard: Story = {
  name: "in context: on a menu card",
  render: () => (
    <div className="grid max-w-72 gap-2 rounded-lg bg-surface-card p-4 shadow-1">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand">Bestseller</Badge>
        <Badge tone="soft" icon={Flame}>
          Hot
        </Badge>
      </div>
      <h4 className="m-0">Paneer Tikka Masala</h4>
      <p className="m-0 font-body text-body-sm text-text-muted">₹280</p>
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Badge tone="brand">Bestseller</Badge>
      <Badge tone="soft">New</Badge>
      <Badge tone="ink">Signature</Badge>
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { Badge, type BadgeProps } from "./atoms/badge/badge";
```

- [ ] **Step 8: Gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/badge packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens packages/design-tokens/contrast-pairs.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: green; Storybook builds.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the Badge atom, seven tones of uppercase status marker

Status tones use the AA text tokens on their soft fills; the brand tone turns
white on a pink field through a surface token so it never vanishes. Labels
never wrap and truncate inside the pill.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 13: StatusDot

**Dev reference:** `git show dev:packages/ui/src/atoms/status-dot/status-dot.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                                                                  | Ruling  | Where / reason                                                    |
| ------------------------------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------- |
| Sizes `xs`/`sm`/`md`/`lg`                                                                                                 | DROP    | contracts §2 (`sm`/`md`; plan deviation 4)                        |
| The whole dot throbs (`animate-pp-pulse`)                                                                                 | ALREADY | the pulse ring (`animate-dot-pulse`), hidden under reduced motion |
| A bare danger dot is named "Unavailable"                                                                                  | ALREADY | named "Attention"; a bare dot is always named                     |
| `rounded-1`, `size-2…5`, `text-body2`                                                                                     | DROP    | D4; `status-dot-*` tokens                                         |
| Tests: label beside the dot, dot hidden when labelled, bare dot named by tone, tones, diamond, pulse only when asked, axe | ALREADY | Step 2                                                            |
| Test: caller className replaces the gap                                                                                   | ADD     | Step 2                                                            |
| Story `Tones` includes a labelled `danger`                                                                                | ADD     | Step 6                                                            |
| Story `Sizes` (labelled dots side by side)                                                                                | ADD     | Step 6                                                            |
| Stories `Default`, `Live`, `Bare`                                                                                         | ALREADY | `Playground`, `Pulse`, `Bare`                                     |
| Story `OutletStrip`                                                                                                       | ADD     | Step 6                                                            |

Implementer: copy this table into your report, extended with anything the plan missed.

Source: `components/atoms/StatusDot.{jsx,d.ts,card.html,prompt.md}`, readme §3.4 ("every small diamond … is a rotated square with the brand mark inside it").

**Visuals:**

- A 14px (sm, default) or 16px (md) square, rotated 45°, with a 2px radius, in the tone colour: open mint, busy turmeric, closed ink-400, live pink-500, danger danger.
- Inside it, the white brand symbol counter-rotated at 80% of the box and 66% opacity (the zip's mark scale for 14–19px dots).
- The label sits 8px away in DM Sans 500 at 13.5px, text-body.
- The pulse is a same-colour diamond animated by `pp-dot-pulse`.

**Two traps pinned by tests:**

- The `pp-dot-pulse` keyframes set `transform: rotate(45deg) scale(…)` themselves, so the pulse element must **not** also carry `rotate-45`, or it spins to 90° and shows as a square.
- Under reduced motion Plan 1 collapses animations to a single 0.01ms run. The unfilled pulse would then sit on screen as a solid square, so it is `motion-reduce:hidden`.

**Semantics:** with `label`, the dot is decorative and the text carries the state. Without one, the root is `role="img"` named by its tone ("Open"). State is never colour alone (spec §5.5).

**Files:**

- Create: `packages/design-tokens/tokens/component/status-dot.json`
- Create: `packages/ui/src/atoms/status-dot/status-dot.tsx`, `status-dot.test.tsx`, `status-dot.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`, `RADIUS`, `TEXT`), `packages/ui/src/index.ts`
- `contrast-pairs.json`: unchanged. The label is `text-body` (semantic), and the dot is not text: its state is carried by the label or the accessible name.

**Interfaces:**

- Consumes: `SymbolMark`, `componentVariants`; `bg-current`, `animate-dot-pulse`, `text-status-{success,warning,danger}`.
- Produces: `StatusDot`, `interface StatusDotProps extends ComponentProps<"span">` (contracts §2); tokens `spacing-status-dot-{sm,md}`, `radius-status-dot`, `text-status-dot-label`.

- [ ] **Step 1: Component tokens**

(If Task 0 Step 4 found a `radius-diamond` token from Plan 2b, drop `radius.status-dot` below and use `rounded-diamond` in Step 4.)

`packages/design-tokens/tokens/component/status-dot.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "status-dot-sm": { "$value": "14px", "$description": "The default dot, beside a label." },
    "status-dot-md": { "$value": "16px", "$description": "A bare dot." }
  },
  "radius": {
    "$type": "dimension",
    "status-dot": { "$value": "2px", "$description": "Corner of the rotated diamond." }
  },
  "text": {
    "$type": "typography",
    "status-dot-label": { "$value": { "fontSize": "13.5px", "fontWeight": "{font-weight.medium}" } }
  }
}
```

In `component-variants.ts`, append to `SPACING`: `"status-dot-sm", "status-dot-md",`; to `RADIUS`: `"status-dot",`; to `TEXT`: `"status-dot-label",`.

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && rtk proxy grep -n "status-dot" packages/design-tokens/dist/theme.css`
Expected: `--spacing-status-dot-sm: 14px;`, `--spacing-status-dot-md: 16px;`, `--radius-status-dot: 2px;`, `--text-status-dot-label: 13.5px;` and its weight.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/status-dot/status-dot.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { StatusDot } from "./status-dot";

describe("StatusDot", () => {
  it("shows a visible label beside a decorative dot", () => {
    render(<StatusDot label="Open till 11:30pm" />);
    const label = screen.getByText("Open till 11:30pm");
    expect(label).toHaveClass("font-body", "text-status-dot-label", "text-text-body");
    const root = label.parentElement;
    expect(root).not.toHaveAttribute("role");
    expect(root).toHaveClass("inline-flex", "items-center", "gap-2");
    expect(root?.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it.each([
    ["open", "Open"],
    ["busy", "Busy"],
    ["closed", "Closed"],
    ["live", "Live"],
    ["danger", "Attention"],
  ] as const)(
    "announces a bare %s dot as %s — never colour alone (Review Focus 2)",
    (tone, name) => {
      render(<StatusDot tone={tone} />);
      expect(screen.getByRole("img", { name })).toBeInTheDocument();
    }
  );

  it("lets a consumer name a bare dot", () => {
    render(<StatusDot tone="open" aria-label="Sector 57 is open" />);
    expect(screen.getByRole("img", { name: "Sector 57 is open" })).toBeInTheDocument();
  });

  it.each([
    ["open", "text-status-success"],
    ["busy", "text-status-warning"],
    ["closed", "text-ink-400"],
    ["live", "text-pink-500"],
    ["danger", "text-status-danger"],
  ] as const)("colours the %s diamond with %s", (tone, colour) => {
    const { container } = render(<StatusDot tone={tone} />);
    expect(container.firstElementChild?.firstElementChild).toHaveClass(colour);
  });

  it("draws a rotated diamond carrying the counter-rotated brand mark", () => {
    const { container } = render(<StatusDot />);
    const diamond = container.firstElementChild?.firstElementChild?.lastElementChild;
    expect(diamond).toHaveClass("rotate-45", "rounded-status-dot", "bg-current", "overflow-hidden");
    expect(diamond?.querySelector("svg")).toHaveClass(
      "size-4/5",
      "-rotate-45",
      "text-ink-000",
      "opacity-66"
    );
  });

  it.each([
    ["sm", "size-status-dot-sm"],
    ["md", "size-status-dot-md"],
  ] as const)("sizes %s with %s", (size, sizeClass) => {
    const { container } = render(<StatusDot size={size} />);
    expect(container.firstElementChild?.firstElementChild).toHaveClass(sizeClass);
  });

  it("is 14px (sm) by default", () => {
    const { container } = render(<StatusDot />);
    expect(container.firstElementChild?.firstElementChild).toHaveClass("size-status-dot-sm");
  });

  it("pulses only when isPulsing — unrotated (the keyframes rotate it) and hidden under reduced motion", () => {
    const { container, rerender } = render(<StatusDot tone="live" label="On the tandoor" />);
    const dot = () => container.firstElementChild?.firstElementChild;
    expect(dot()?.children).toHaveLength(1);
    rerender(<StatusDot tone="live" label="On the tandoor" isPulsing />);
    expect(dot()?.children).toHaveLength(2);
    const pulse = dot()?.firstElementChild;
    expect(pulse).toHaveClass("animate-dot-pulse", "motion-reduce:hidden", "bg-current");
    expect(pulse).not.toHaveClass("rotate-45");
  });

  it("merges a consumer className", () => {
    render(<StatusDot label="Opens 9am" className="ml-2" />);
    expect(screen.getByText("Opens 9am").parentElement).toHaveClass("ml-2", "gap-2");
  });

  it("lets a consumer className replace the gap", () => {
    render(<StatusDot tone="closed" label="Opens 9am" className="gap-4" />);
    const root = screen.getByText("Opens 9am").parentElement;
    expect(root).toHaveClass("gap-4");
    expect(root).not.toHaveClass("gap-2");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <StatusDot tone="open" label="Open till 11:30pm" />
        <StatusDot tone="live" label="On the tandoor" isPulsing />
        <StatusDot tone="closed" size="md" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: FAIL — `Failed to resolve import "./status-dot"`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/status-dot/status-dot.tsx`:

```tsx
import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";
import { SymbolMark } from "../../lib/symbol-mark";

export interface StatusDotProps extends ComponentProps<"span"> {
  tone?: "open" | "busy" | "closed" | "live" | "danger";
  /** Visible state text. Without it the dot is announced by its tone ("Open"). */
  label?: string;
  /** The expanding pulse — live orders only. Hidden under reduced motion. */
  isPulsing?: boolean;
  /** sm 14px (default) · md 16px. */
  size?: "sm" | "md";
}

/** A bare dot's accessible name: state is never conveyed by colour alone (spec §5.5). */
const TONE_NAME = {
  open: "Open",
  busy: "Busy",
  closed: "Closed",
  live: "Live",
  danger: "Attention",
} as const;

/*
 * The dot sets the tone as `currentColor`; the diamond and the pulse paint `bg-current`, the mark
 * inside is white. The pulse carries no rotate class: `pp-dot-pulse` rotates it in its keyframes.
 */
const statusDot = componentVariants({
  slots: {
    root: "inline-flex items-center gap-2",
    dot: "relative shrink-0",
    pulse: "rounded-status-dot absolute inset-0 animate-dot-pulse bg-current motion-reduce:hidden",
    diamond:
      "rounded-status-dot absolute inset-0 grid rotate-45 place-items-center overflow-hidden bg-current",
    mark: "size-4/5 -rotate-45 text-ink-000 opacity-66",
    label: "text-status-dot-label font-body text-text-body",
  },
  variants: {
    tone: {
      open: { dot: "text-status-success" },
      busy: { dot: "text-status-warning" },
      closed: { dot: "text-ink-400" },
      live: { dot: "text-pink-500" },
      danger: { dot: "text-status-danger" },
    },
    size: { sm: { dot: "size-status-dot-sm" }, md: { dot: "size-status-dot-md" } },
  },
  defaultVariants: { tone: "open", size: "sm" },
});

/** Outlet open/closed and live-order state: a brand diamond with the mark inside it. */
export function StatusDot({
  tone = "open",
  label,
  isPulsing = false,
  size,
  className,
  ...props
}: StatusDotProps) {
  const slots = statusDot({ tone, size });
  const bareName = label === undefined ? { role: "img", "aria-label": TONE_NAME[tone] } : undefined;
  return (
    <span className={slots.root({ className })} {...bareName} {...props}>
      <span aria-hidden className={slots.dot()}>
        {isPulsing ? <span className={slots.pulse()} /> : null}
        <span className={slots.diamond()}>
          <SymbolMark className={slots.mark()} />
        </span>
      </span>
      {label === undefined ? null : <span className={slots.label()}>{label}</span>}
    </span>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: PASS.

- [ ] **Step 6: Stories**

Card rows (`StatusDot.card.html`): `tone` (open "Open till 11:30pm", busy "Kitchen is busy", closed "Opens 9am"), `pulse` (→ `isPulsing`, live "On the tandoor"), `bare` (size 16 → `size="md"`: open, busy, closed, danger). Dev parity adds a labelled `danger` row, `Sizes` and `OutletStrip`.

`packages/ui/src/atoms/status-dot/status-dot.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatusDot } from "./status-dot";

const meta = {
  title: "Atoms/StatusDot",
  component: StatusDot,
  args: { tone: "open", label: "Open till 11:30pm", size: "sm" },
  parameters: {
    docs: {
      description: {
        component:
          'Outlet open/closed state and live order state. A rotated diamond with the brand mark inside, not a circle — the brand shape carries all the way down. `isPulsing` is for live orders only (and stops under reduced motion). State is never colour alone: give a `label`, or a bare dot is announced by its tone ("Open"), which `aria-label` can override.',
      },
    },
  },
} satisfies Meta<typeof StatusDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  name: "tone",
  render: () => (
    <div className="grid gap-2.5">
      <StatusDot tone="open" label="Open till 11:30pm" />
      <StatusDot tone="busy" label="Kitchen is busy" />
      <StatusDot tone="closed" label="Opens 9am" />
      <StatusDot tone="danger" label="Not taking orders" />
    </div>
  ),
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <StatusDot size="sm" label="Small (14px)" />
      <StatusDot size="md" label="Medium (16px)" />
    </div>
  ),
};

export const Pulse: Story = {
  name: "isPulsing",
  args: { tone: "live", label: "On the tandoor", isPulsing: true },
};

export const Bare: Story = {
  name: 'bare (size="md", no label)',
  render: () => (
    <div className="flex items-center gap-3">
      <StatusDot tone="open" size="md" />
      <StatusDot tone="busy" size="md" />
      <StatusDot tone="closed" size="md" />
      <StatusDot tone="danger" size="md" />
    </div>
  ),
};

/** In context: the outlet strip under the header. */
export const OutletStrip: Story = {
  name: "in context: outlet strip",
  render: () => (
    <div className="grid justify-items-start gap-3 rounded-lg bg-surface-sunken p-4">
      <StatusDot tone="open" label="Sector 57 — open till 11:30pm" />
      <StatusDot tone="busy" label="Kitchen is busy — about 25 minutes" />
      <StatusDot tone="live" label="Your order is on the tandoor" isPulsing />
    </div>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { StatusDot, type StatusDotProps } from "./atoms/status-dot/status-dot";
```

- [ ] **Step 8: Gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/status-dot packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/status-dot.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: green; Storybook builds.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the StatusDot atom, the brand diamond as a state marker

Five tones, two sizes and the live pulse. The pulse is left unrotated
because its keyframes rotate it, and hidden under reduced motion so it never
lingers as a square. A bare dot is announced by its tone, so state is never
colour alone.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 14: Avatar

**Dev reference:** `git show dev:packages/ui/src/atoms/avatar/avatar.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                              | Ruling  | Where / reason                                                                                                     |
| --------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| Radix `Avatar` + `"use client"`                                       | DROP    | D6/D7 (Radix only for Dialog/Sheet, Tabs, Tooltip, Toast, ToggleGroup and Slot)                                    |
| The initials stay up while the photo loads, and for good if it fails  | ADD     | Step 4: the photo is layered over the initials (`absolute inset-0`, server-safe, no load state); Step 2 photo test |
| The photo carries the name as `alt`                                   | ALREADY | the root is `role="img"` named by `name`; the photo is presentational (`alt=""`)                                   |
| A glyph wins over a name                                              | ALREADY | Step 4 (`icon ? … : initials`); ADD a test for `icon` + `name` (Step 2)                                            |
| Ring as `ring-2 ring-offset-2`, never a border                        | ALREADY | `shadow-avatar-ring` (two box-shadows, no border)                                                                  |
| `size-6…20`, `rounded-6`, `text-h3`                                   | DROP    | D4; `avatar-*` tokens                                                                                              |
| `select-none` on the root                                             | ADD     | Step 4 `root` slot; Step 2 className test                                                                          |
| Tests: one-, two- and three-word initials, sizes, ring, circular, axe | ALREADY | Step 2                                                                                                             |
| Test: caller className replaces the radius                            | ADD     | Step 2                                                                                                             |
| Stories `Default`, `Sizes`, `Initials`, `GlyphFallback`, `Ring`       | ALREADY | `Playground`, `Sizes`, `Initials`, `IconFallback`, `Ring`                                                          |
| Story `Photo` (with the failed-photo fallback)                        | ADD     | Step 6                                                                                                             |
| Story `InAReviewRow`                                                  | ADD     | Step 6 `InAGuestRow` (no review copy: spec §10.1 bars fabricated testimonials)                                     |

Implementer: copy this table into your report, extended with anything the plan missed.

Source: `components/atoms/Avatar.{jsx,d.ts,card.html,prompt.md}`.

**Visuals:**

- A circle of 24 / 32 / 40 / 56 / 80px (xs–xl), pink-100 fill, pink-700 Poppins 700 initials at −0.01em.
- Initials size is `max(10, round(0.38 × size))`: 10 / 12 / 15 / 21 / 30px.
- Up to two initials, from the first two words.
- The glyph fallback is half the circle (12 / 16 / 20 / 28 / 40px). Its stroke is 2px up to 16px and 1.75px above, the same rule as Icon.
- A photo fills the circle, layered over the initials (or glyph), so they show while it loads and stay if it fails (dev parity, no client code).
- `hasRing`: `0 0 0 2px white, 0 0 0 4px pink-500`.

**Semantics:** with a `name`, `role="img"` named by it (and `title`, as in the zip). The initials and photo inside are presentational. Without a name it is decorative (`aria-hidden`).

**Files:**

- Create: `packages/design-tokens/tokens/component/avatar.json`
- Modify: `packages/design-tokens/contrast-pairs.json`
- Create: `packages/ui/src/atoms/avatar/avatar.tsx`, `avatar.test.tsx`, `avatar.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`, `TEXT`, `SHADOW`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Icon`, `IconComponent`, `componentVariants`.
- Produces: `Avatar`, `interface AvatarProps extends ComponentProps<"span">` (contracts §2); tokens `spacing-avatar-{xs,sm,md,lg,xl}`, `text-avatar-{xs,sm,md,lg,xl}`, `shadow-avatar-ring`.

- [ ] **Step 1: Component tokens and contrast pair**

`packages/design-tokens/tokens/component/avatar.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "avatar-xs": { "$value": "24px" },
    "avatar-sm": { "$value": "32px" },
    "avatar-md": { "$value": "40px" },
    "avatar-lg": { "$value": "56px" },
    "avatar-xl": { "$value": "80px" }
  },
  "text": {
    "$type": "typography",
    "avatar-xs": {
      "$value": {
        "fontSize": "10px",
        "lineHeight": 1,
        "letterSpacing": "-0.01em",
        "fontWeight": "{font-weight.bold}"
      },
      "$description": "Initials: max(10px, 0.38 × the avatar size)."
    },
    "avatar-sm": {
      "$value": {
        "fontSize": "12px",
        "lineHeight": 1,
        "letterSpacing": "-0.01em",
        "fontWeight": "{font-weight.bold}"
      }
    },
    "avatar-md": {
      "$value": {
        "fontSize": "15px",
        "lineHeight": 1,
        "letterSpacing": "-0.01em",
        "fontWeight": "{font-weight.bold}"
      }
    },
    "avatar-lg": {
      "$value": {
        "fontSize": "21px",
        "lineHeight": 1,
        "letterSpacing": "-0.01em",
        "fontWeight": "{font-weight.bold}"
      }
    },
    "avatar-xl": {
      "$value": {
        "fontSize": "30px",
        "lineHeight": 1,
        "letterSpacing": "-0.01em",
        "fontWeight": "{font-weight.bold}"
      }
    }
  },
  "shadow": {
    "$type": "shadow",
    "avatar-ring": {
      "$value": "0 0 0 2px {color.ink.000}, 0 0 0 4px {color.pink.500}",
      "$description": "The signed-in guest's halo."
    }
  }
}
```

`packages/design-tokens/contrast-pairs.json`: append to `groups`:

```json
{
  "id": "avatar",
  "surface": null,
  "pairs": [["color-pink-700", "color-pink-100"]],
  "min": 4.5
}
```

In `component-variants.ts`, append to `SPACING`: `"avatar-xs", "avatar-sm", "avatar-md", "avatar-lg", "avatar-xl",`; to `TEXT`: the same five names; to `SHADOW`: `"avatar-ring",`.

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && rtk proxy grep -n "shadow-avatar-ring" packages/design-tokens/dist/theme.css`
Expected: `--shadow-avatar-ring: 0 0 0 2px #FFFFFF, 0 0 0 4px #EE2C68;` (resolved inside `dist/` only, never in source).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/avatar/avatar.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { User } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Avatar } from "./avatar";

describe("Avatar", () => {
  it("shows two initials on pink-100 and is an image named by the person", () => {
    render(<Avatar name="Aditi Rao" />);
    const avatar = screen.getByRole("img", { name: "Aditi Rao" });
    expect(avatar).toHaveTextContent("AR");
    expect(avatar).toHaveAttribute("title", "Aditi Rao");
    expect(avatar).toHaveClass(
      "bg-pink-100",
      "text-pink-700",
      "font-display",
      "rounded-pill",
      "overflow-hidden",
      "size-avatar-md",
      "text-avatar-md"
    );
  });

  it.each([
    ["Kabir", "K"],
    ["Meera S Iyer", "MS"],
    ["  aditi   rao  ", "AR"],
    ["प्रिया शर्मा", "पश"],
  ] as const)("derives the initials of %j as %s", (name, initials) => {
    render(<Avatar name={name} />);
    expect(screen.getByRole("img")).toHaveTextContent(initials);
  });

  it("layers a photo over the initials, which stay as the fallback while it loads or if it fails", () => {
    render(<Avatar name="Aditi Rao" src="/guests/aditi.jpg" />);
    const avatar = screen.getByRole("img", { name: "Aditi Rao" });
    const photo = avatar.querySelector("img");
    expect(photo).toHaveAttribute("src", "/guests/aditi.jpg");
    expect(photo).toHaveAttribute("alt", "");
    expect(photo).toHaveClass("absolute", "inset-0", "size-full", "object-cover");
    expect(avatar).toHaveClass("relative");
    expect(avatar).toHaveTextContent("AR");
  });

  it("draws the glyph instead of initials when both are given, still named by the person", () => {
    render(<Avatar name="Aditi Rao" icon={User} />);
    const avatar = screen.getByRole("img", { name: "Aditi Rao" });
    expect(avatar.querySelector("svg")).not.toBeNull();
    expect(avatar).not.toHaveTextContent("AR");
  });

  it("lets a consumer className replace its radius, and never selects its initials", () => {
    render(<Avatar name="Aditi Rao" className="rounded-md" />);
    const avatar = screen.getByRole("img");
    expect(avatar).toHaveClass("rounded-md", "select-none");
    expect(avatar).not.toHaveClass("rounded-pill");
  });

  it("draws a glyph at half its size in place of initials", () => {
    const { container } = render(<Avatar icon={User} size="lg" />);
    const glyph = container.firstElementChild?.firstElementChild;
    expect(glyph).toHaveClass("size-1/2");
    expect(glyph).not.toHaveClass("size-icon-lg");
    expect(glyph?.querySelector("svg")).toHaveAttribute("stroke-width", "1.75");
  });

  it("uses the heavy 2px stroke on the small sizes", () => {
    const { container } = render(<Avatar icon={User} size="xs" />);
    expect(container.querySelector("svg")).toHaveAttribute("stroke-width", "2");
  });

  it.each([
    ["xs", "size-avatar-xs", "text-avatar-xs"],
    ["sm", "size-avatar-sm", "text-avatar-sm"],
    ["md", "size-avatar-md", "text-avatar-md"],
    ["lg", "size-avatar-lg", "text-avatar-lg"],
    ["xl", "size-avatar-xl", "text-avatar-xl"],
  ] as const)("sizes %s with %s and %s", (size, box, type) => {
    render(<Avatar name="Aditi Rao" size={size} />);
    expect(screen.getByRole("img")).toHaveClass(box, type);
  });

  it("marks the signed-in guest with the pink ring", () => {
    render(<Avatar name="Aditi Rao" hasRing />);
    expect(screen.getByRole("img")).toHaveClass("shadow-avatar-ring");
  });

  it("is decorative when it has no name (Review Focus 2)", () => {
    const { container } = render(<Avatar icon={User} />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstElementChild).not.toHaveAttribute("role");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("treats a blank name as no name", () => {
    const { container } = render(<Avatar name="   " />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstElementChild).toBeEmptyDOMElement();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Avatar name="Aditi Rao" hasRing />
        <Avatar name="Kabir" src="/guests/kabir.jpg" />
        <Avatar icon={User} />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: FAIL — `Failed to resolve import "./avatar"`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/avatar/avatar.tsx`:

```tsx
import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";
import { Icon, type IconComponent } from "../icon/icon";

export interface AvatarProps extends ComponentProps<"span"> {
  /** The person's name — the initials, the title and the accessible name. */
  name?: string;
  /** Photo URL; fills the circle. */
  src?: string;
  /** xs 24 · sm 32 · md 40 · lg 56 · xl 80. */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** A glyph in place of initials (e.g. a signed-out guest). */
  icon?: IconComponent;
  /** The pink halo of the signed-in guest. */
  hasRing?: boolean;
}

const avatar = componentVariants({
  slots: {
    root: "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-pill bg-pink-100 font-display text-pink-700 select-none",
    // Over the initials: they show while the photo loads, and stay if it fails (alt="" paints nothing).
    image: "absolute inset-0 size-full object-cover",
    // Half the circle; `Icon`'s own size only picks the stroke (2px ≤ 16px, 1.75px above).
    icon: "size-1/2",
  },
  variants: {
    size: {
      xs: { root: "size-avatar-xs text-avatar-xs" },
      sm: { root: "size-avatar-sm text-avatar-sm" },
      md: { root: "size-avatar-md text-avatar-md" },
      lg: { root: "size-avatar-lg text-avatar-lg" },
      xl: { root: "size-avatar-xl text-avatar-xl" },
    },
    hasRing: { true: { root: "shadow-avatar-ring" } },
  },
  defaultVariants: { size: "md", hasRing: false },
});

/** Up to two initials, from the first two words; code-point safe for Devanagari names. */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => word !== "")
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? "")
    .join("")
    .toUpperCase();
}

/** Circular guest or staff avatar. Falls back to initials on pink-100. */
export function Avatar({
  name,
  src,
  size = "md",
  icon,
  hasRing,
  className,
  ...props
}: AvatarProps) {
  const slots = avatar({ size, hasRing });
  const title = name?.trim() ?? "";
  const hasName = title !== "";
  return (
    <span
      role={hasName ? "img" : undefined}
      aria-label={hasName ? title : undefined}
      aria-hidden={hasName ? undefined : true}
      title={hasName ? title : undefined}
      className={slots.root({ className })}
      {...props}
    >
      {icon ? <Icon icon={icon} size={size} className={slots.icon()} /> : initialsOf(title)}
      {src === undefined ? null : <img src={src} alt="" className={slots.image()} />}
    </span>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: PASS.

- [ ] **Step 6: Stories**

Card rows (`Avatar.card.html`): `size` (xs–xl), `initials` (Aditi Rao, Kabir, Meera S Iyer), `icon fallback` (user; user lg), `ring` (→ `hasRing`, lg). Dev parity adds `Photo` (with a failed photo) and `InAGuestRow`. These are sample guest names on a component card, not testimonials (spec §10.1's kit rule).

`packages/ui/src/atoms/avatar/avatar.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { User } from "lucide-react";

import symbolPink from "../../assets/brand/symbol-pink.svg";
import { Avatar } from "./avatar";

const meta = {
  title: "Atoms/Avatar",
  component: Avatar,
  args: { name: "Aditi Rao", size: "md" },
  argTypes: { icon: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          "Circular avatar for guest accounts, reviews and staff credits. No photo → initials in Poppins 700 on pink-100. Never square, never a coloured random-hash background. `hasRing` marks the signed-in guest. With a `name` it is an image named by that name; without one it is decorative.",
      },
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Avatar key={size} name="Aditi Rao" size={size} />
      ))}
    </div>
  ),
};

export const Initials: Story = {
  name: "name (initials)",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Avatar name="Aditi Rao" />
      <Avatar name="Kabir" />
      <Avatar name="Meera S Iyer" />
    </div>
  ),
};

export const IconFallback: Story = {
  name: "icon",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Avatar icon={User} />
      <Avatar icon={User} size="lg" />
    </div>
  ),
};

export const Ring: Story = {
  name: "hasRing",
  args: { name: "Aditi Rao", size: "lg", hasRing: true },
};

/**
 * With `src` the photo covers the initials once it decodes. The second path is deliberately
 * unresolvable: it is the failed-photo case, where the initials hold the space.
 */
export const Photo: Story = {
  name: "src (and a failed photo)",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Avatar name="Aditi Rao" src={symbolPink} size="lg" />
      <Avatar name="Kabir" src="/missing/guest-photo.jpg" size="lg" hasRing />
    </div>
  ),
};

/** In context: a signed-in guest row. */
export const InAGuestRow: Story = {
  name: "in context: a signed-in guest row",
  render: () => (
    <div className="flex max-w-96 items-center gap-3 rounded-lg bg-surface-card p-4 shadow-1">
      <Avatar name="Aditi Rao" size="lg" hasRing />
      <div className="min-w-0">
        <p className="m-0 font-display text-body font-bold text-text-heading">Aditi Rao</p>
        <p className="m-0 font-body text-caption text-text-muted">Signed in · 3 orders</p>
      </div>
    </div>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { Avatar, type AvatarProps } from "./atoms/avatar/avatar";
```

- [ ] **Step 8: Gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/avatar packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/avatar.json packages/design-tokens/contrast-pairs.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: green; Storybook builds.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the Avatar atom with initials, photo, glyph and ring

Five sizes with initials sized as the design system computes them, a photo
that fills the circle, a half-size glyph fallback and the signed-in ring.
A named avatar is an image named by the person; an unnamed one is decorative.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

### Task 15: Tier parity review

Spec §11.4: every atom is compared side by side with its design-system card at 360 and 1280. Each difference is either fixed or listed with a reason. This is review evidence, not a pixel gate.

**Files:** fixes only, in whichever task's files the review implicates. Screenshots go to `/tmp/pp-parity/` and are **never** committed.

**Interfaces:** Consumes the 13 atoms' stories (`Atoms/<Name>`), the design-system cards (`zip-files/Pink Paprikaa Design System/components/atoms/<Name>.card.html`), and Playwright from `apps/storybook`.

- [ ] **Step 1: Serve both sides**

Run each in the background (they keep running):

```bash
npx --yes serve -l 4400 "zip-files/Pink Paprikaa Design System"
pnpm nx run @pink-paprikaa-web/storybook:serve
```

If port 4400 is taken, pick another and use it below. If `npx` cannot download `serve` in the sandbox, use `python3 -m http.server 4400 --directory "zip-files/Pink Paprikaa Design System"` instead. The cards load React and Babel from unpkg: if the sandbox blocks the network, rerun that server with the sandbox disabled. Poll until `curl -sf http://localhost:4400/components/atoms/Button.card.html` and `curl -sf http://localhost:6006/index.json` both succeed (Storybook's first build takes about 30s).

- [ ] **Step 2: Screenshot every card and every story at both widths**

Create `/tmp/pp-parity/shoot.mjs`:

```js
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(`${process.cwd()}/apps/storybook/package.json`);
const { chromium } = require("playwright");

const CARDS = "http://localhost:4400/components/atoms";
const STORYBOOK = "http://localhost:6006";
const ATOMS = [
  "Text",
  "Link",
  "PatternField",
  "SocialHeadline",
  "Button",
  "IconButton",
  "Tag",
  "Card",
  "Divider",
  "ImageSlot",
  "Badge",
  "StatusDot",
  "Avatar",
];

const index = await (await fetch(`${STORYBOOK}/index.json`)).json();
const browser = await chromium.launch();

for (const width of [360, 1280]) {
  const out = `/tmp/pp-parity/${String(width)}`;
  mkdirSync(out, { recursive: true });
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const name of ATOMS) {
    await page.goto(`${CARDS}/${name}.card.html`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${out}/${name}.card.png`, fullPage: true });
    const stories = Object.values(index.entries).filter(
      (entry) => entry.type === "story" && entry.title === `Atoms/${name}`
    );
    for (const story of stories) {
      await page.goto(`${STORYBOOK}/iframe.html?id=${story.id}&viewMode=story`, {
        waitUntil: "networkidle",
      });
      await page.screenshot({
        path: `${out}/${name}--${story.id.split("--")[1]}.png`,
        fullPage: true,
      });
    }
  }
  await page.close();
}
await browser.close();
console.log("screenshots in /tmp/pp-parity/{360,1280}");
```

Run from the repo root: `node /tmp/pp-parity/shoot.mjs`
Expected: `screenshots in /tmp/pp-parity/{360,1280}`, and one `.card.png` plus one PNG per story per atom per width.

- [ ] **Step 3: Compare**

For each atom and width, open the card screenshot and its story screenshots (the Read tool shows images). Go row by row: geometry (height, padding, radius, gaps), type (face, size, weight, tracking, case), colour, glyph size and stroke, states that are visible (selected, disabled, loading, pulse) and surface rows. At 360, also check that nothing clips or causes horizontal scroll. Keep a table: `atom | row | difference | fixed in <file> / accepted because <reason>`.

These differences are **deliberate and accepted**, so list them without fixing:

| Atom           | Difference                                                                                    | Reason                                                                 |
| -------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| all            | Font rasterisation                                                                            | Self-hosted Fontsource files vs the zip's CDN fonts (spec §11.4)       |
| Text           | Display steps render at true size (72/56px), not the card's 44/34px                           | The card shrinks them to fit its 700px frame                           |
| SocialHeadline | True canvas pixels, not the card's 40% scale; body copy is text-body (ink-800, white on dark) | PostFrame (Plan 2c) scales artboards; handoff §3.2.2 body-on-dark rule |
| Button         | Secondary hover tints pink-50; ghost on brand has no border                                   | Readme §3.8 hover rule; spec C9 ("white outline/text")                 |
| IconButton     | Disabled is a grey fill (zip: 45% opacity); primary turns white on a brand field              | Readme §3.8; primary shares Button's surface skin                      |
| Tag            | Disabled is a grey fill (zip: 50% opacity); zone tones keep Tag geometry (38px, DM Sans 500)  | Readme §3.8; one component, one geometry (handoff chips were ad hoc)   |
| Divider        | On brand the rule is white 22% (zip: 28%)                                                     | Semantic `border-subtle` on the surface — one hairline token           |
| ImageSlot      | Labels pink-700 / pink-800 / ink-600 (zip: pink-400 / pink-700 / ink-500)                     | AA re-pointing, spec §5.3 and contract deviation 5                     |
| Link           | `quiet` shows no underline on hover                                                           | `Link.jsx` (transparent in both states) wins over the prompt's wording |
| Pills          | A label longer than its container ellipsises (zip: overflowed its row)                        | Review Focus 1                                                         |

Anything else is a bug. Fix it in the owning task's component or token file, rerun that component's test file and reshoot it.

- [ ] **Step 4: Story tests (every story, a11y enforced, `play` functions run)**

Run: `pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache 2>&1 | tail -15`
Expected: PASS for all `Atoms/*` stories, including the `play` assertions in Button `NestedSurfaces` and `LongLabel`, Tag `Selectable` and `LongLabel`, and Card `LightIsland`.

- [ ] **Step 5: Cold gate for the tier**

Stop both servers, then run:

```bash
pnpm nx format:check && pnpm nx sync:check \
  && pnpm nx run-many -t typecheck lint test build -p @pink-paprikaa-web/design-tokens @pink-paprikaa-web/ui @pink-paprikaa-web/storybook --skip-nx-cache --outputStyle=static 2>&1 | tail -12 \
  && pnpm guard:founder
```

Expected: every target green; `Founder-name guard: clean.`

- [ ] **Step 6: Commit the fixes (skip if Step 3 found none)**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "fix(ui): atom parity fixes from the side-by-side review

<one line per fixed difference: atom, row, what changed>

Accepted differences (font rasterisation, card-scaled specimens, readme 3.8
disabled fills, AA label re-pointing, pill truncation) are listed in the
plan 2a parity table.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

In the report, include the full difference table from Step 3 and the tail of the Step 4 and Step 5 outputs.

## Controller amendments (2026-09-27)

- **Ruling R13 — optional props accept `undefined`.** Every optional custom prop is declared `name?: T | undefined` (matching React's own DOM prop types) so molecules and organisms can forward a possibly-undefined value under `exactOptionalPropertyTypes` without conditional spreads. Apply this to every `…Props` interface in this plan, including the contract types in `lib/link-as.ts`.
- **Ghost on brand** = white text, no border (C9) — confirmed.
- **Slot class rule** — classes go on the component, never on the slotted child (Slot joins child classes without tailwind-merge) — confirmed as a system rule; AUTHORING.md records it.
- **Ruling R15 — file paths in tests.** Any spec/test in `packages/ui` that reads a file builds its path with `join(import.meta.dirname, "…")` (`node:path`), never `new URL("…", import.meta.url)`: under Vitest's jsdom environment Vite rewrites the latter to an `http://localhost` URL and `readFileSync` fails (found in Plan 1 Task 5).

## Controller amendments — ruling R19 and 2b rulings (2026-09-27)

- **R19 — the symbol is one shared CSS mask, never inline SVG per instance.** Plan 1 Task 7 generates `packages/ui/src/lib/brand-artwork.css` (imported by `styles.css`) defining `--pp-symbol-mask` once and the utility `mask-symbol` (`background-color: currentColor` + the mask). `SymbolMark` (Plan 2a Task 1) is therefore `<span aria-hidden="true" className={…"mask-symbol"…} />` sized by className — no path data in the HTML. Its test asserts the class and `aria-hidden`, and that the rendered HTML contains no `<path`. PatternField uses `mask-image: var(--pp-symbol-mask)` (a class or `style={{ maskImage: "var(--pp-symbol-mask)" }}`) instead of inlining `SYMBOL_DATA_URI_WHITE` per instance. Reason: a 20-dish menu with spice levels would otherwise carry ~80 copies of ~5 KB path data (page budget ≤1 MB). Plan 2b's Rating/SpiceLevel/Spinner and `lib/brand-diamond.tsx` build on this `SymbolMark`.
- **One diamond corner token:** `radius.diamond` (2px) is created once, in Plan 2a (StatusDot's task), and used as `rounded-diamond` by StatusDot and by Plan 2b's `lib/brand-diamond.tsx`; drop `radius-status-dot` / `radius-brand-diamond`.
- **Tooltip** opens with `delayDuration={0}` as designed — accepted.
- **No on-brand variants** for Checkbox/Radio/Switch/Slider (none designed) — YAGNI, accepted.
- **Read-only Select** renders disabled for the visual, **plus a hidden `<input type="hidden" name={name} value={value}>`** so the value is still submitted (react-hook-form reads it) — add a test.
- **R25 — no `SYMBOL_DATA_URI_WHITE` export.** Plan 1 removed it (it tempted per-instance inlining). Task 0 must not expect it; PatternField and SymbolMark use `var(--pp-symbol-mask)` / `mask-symbol` only. Logo no longer accepts SVG `width`/`height` props — size it with classes (`w-50`, or `h-12 w-auto` for header sizing).
