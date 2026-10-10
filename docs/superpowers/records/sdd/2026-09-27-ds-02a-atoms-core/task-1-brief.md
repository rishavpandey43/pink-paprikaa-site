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

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

