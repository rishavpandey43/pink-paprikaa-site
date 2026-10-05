### Task 1: `sx` — the token-typed style prop

**Files:**
- Create: `packages/ui/src/lib/sx.ts`
- Create: `packages/ui/src/lib/sx.spec.ts`
- Modify: `packages/ui/src/styles.css` (add the `@source inline` safelist after line 18 `@source not …`)
- Create: `packages/ui/src/lib/sx.stories.tsx` (computed-style proof, title `Foundations/Sx/Proof`; hidden from docs by `tags: ["!autodocs"]`)

**Interfaces:**
- Produces: `type Sx`, `type Responsive<T>`, `type SxBreakpoint`, `function sxClass(sx: Sx | undefined): string`, `function withSx(sx: Sx | undefined, className: string | undefined): string | undefined`, `const SX_SAFELIST: readonly string[]` (the `@source inline` strings, exported so a spec can compare them with styles.css).

- [ ] **Step 1: Write the failing spec**

```ts
// packages/ui/src/lib/sx.spec.ts
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { SX_SAFELIST, sxClass, withSx, type Sx } from "./sx";

describe("sxClass", () => {
  it("returns an empty string for no sx", () => {
    expect(sxClass(undefined)).toBe("");
    expect(sxClass({})).toBe("");
  });

  it.each([
    [{ m: 4 }, "m-4"],
    [{ mt: 0.5 }, "mt-0.5"],
    [{ mx: "auto" }, "mx-auto"],
    [{ ms: 2, me: 3 }, "ms-2 me-3"],
    [{ p: 6, px: 8, py: 2 }, "p-6 px-8 py-2"],
    [{ pt: 1, pb: 1.5, ps: 0, pe: 32 }, "pt-1 pb-1.5 ps-0 pe-32"],
    [{ gap: 4, gapX: 2, gapY: 6 }, "gap-4 gap-x-2 gap-y-6"],
    [{ display: "none" }, "hidden"],
    [{ display: "inline-flex" }, "inline-flex"],
    [{ textAlign: "center" }, "text-center"],
    [{ w: "full" }, "w-full"],
    [{ h: "fit" }, "h-fit"],
    [{ minW: "0" }, "min-w-0"],
    [{ maxW: "none" }, "max-w-none"],
    [{ grow: true, shrink: false }, "grow shrink-0"],
    [{ alignSelf: "baseline" }, "self-baseline"],
    [{ position: "sticky" }, "sticky"],
    [{ overflow: "clip" }, "overflow-clip"],
    [{ radius: "pill" }, "rounded-pill"],
    [{ shadow: 0 }, "shadow-none"],
    [{ shadow: 3 }, "shadow-3"],
    [{ border: true }, "border-default border-border-default"],
    [{ bg: "soft" }, "bg-surface-brand-soft"],
    [{ color: "muted" }, "text-text-muted"],
  ] satisfies [Sx, string][])("%o → %s", (sx, expected) => {
    expect(sxClass(sx)).toBe(expected);
  });

  it("prefixes responsive values mobile-first and skips undefined breakpoints", () => {
    expect(sxClass({ mt: { base: 2, md: 6, lg: undefined, xl: 8 } })).toBe("mt-2 md:mt-6 xl:mt-8");
    expect(sxClass({ display: { base: "none", lg: "flex" } })).toBe("hidden lg:flex");
    // Key order inside sxClass: spacing keys, then display, textAlign, w, then the static keys.
    expect(sxClass({ w: { sm: "full" }, textAlign: { md: "end" } })).toBe("md:text-end sm:w-full");
  });

  it("rejects dark grounds and free values at the type level", () => {
    // @ts-expect-error — brand/ink grounds go through the `surface` prop (data-surface), never sx.bg
    sxClass({ bg: "brand" });
    // @ts-expect-error — only SpaceStep values
    sxClass({ mt: 13 });
    // @ts-expect-error — no raw lengths
    sxClass({ p: "12px" });
    // @ts-expect-error — no unknown keys
    sxClass({ fontSize: 12 });
  });
});

describe("withSx", () => {
  it("puts sx before className so className still wins in tailwind-merge", () => {
    expect(withSx({ mt: 4 }, "mt-2 text-center")).toBe("mt-4 mt-2 text-center");
  });
  it("returns className untouched without sx, and sx alone without className", () => {
    expect(withSx(undefined, "x")).toBe("x");
    expect(withSx({ p: 2 }, undefined)).toBe("p-2");
    expect(withSx(undefined, undefined)).toBeUndefined();
  });
});

describe("SX_SAFELIST", () => {
  it("is declared verbatim in styles.css, so every runtime class has CSS", () => {
    // join(import.meta.dirname, …) is the repo convention (brand-artwork.spec.ts)
    const css = readFileSync(join(import.meta.dirname, "../styles.css"), "utf8");
    for (const line of SX_SAFELIST) expect(css).toContain(`@source inline("${line}");`);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm nx test ui -- sx.spec`
Expected: FAIL, `Cannot find module './sx'`.

- [ ] **Step 3: Implement `lib/sx.ts`**

```ts
// packages/ui/src/lib/sx.ts
import type { SpaceStep } from "./space";

/**
 * `sx`: the one style-override prop every component takes (spec 2026-10-04 §3). Token-typed: a raw
 * length, hex or class is a type error. Responsive keys accept `{ base, sm, md, lg, xl }`, mobile first.
 * Their classes are assembled at runtime, so styles.css pre-declares every one with SX_SAFELIST.
 */
export type SxBreakpoint = "base" | "sm" | "md" | "lg" | "xl";
export type Responsive<T> = T | Partial<Record<SxBreakpoint, T | undefined>>;

type Margin = SpaceStep | "auto";
type Display = "none" | "block" | "inline" | "inline-block" | "flex" | "inline-flex" | "grid" | "contents";

export interface Sx {
  m?: Responsive<Margin> | undefined;
  mt?: Responsive<Margin> | undefined;
  mb?: Responsive<Margin> | undefined;
  ms?: Responsive<Margin> | undefined;
  me?: Responsive<Margin> | undefined;
  mx?: Responsive<Margin> | undefined;
  my?: Responsive<Margin> | undefined;
  p?: Responsive<SpaceStep> | undefined;
  pt?: Responsive<SpaceStep> | undefined;
  pb?: Responsive<SpaceStep> | undefined;
  ps?: Responsive<SpaceStep> | undefined;
  pe?: Responsive<SpaceStep> | undefined;
  px?: Responsive<SpaceStep> | undefined;
  py?: Responsive<SpaceStep> | undefined;
  gap?: Responsive<SpaceStep> | undefined;
  gapX?: Responsive<SpaceStep> | undefined;
  gapY?: Responsive<SpaceStep> | undefined;
  display?: Responsive<Display> | undefined;
  textAlign?: Responsive<"start" | "center" | "end"> | undefined;
  w?: Responsive<"full" | "auto" | "fit"> | undefined;
  h?: "full" | "auto" | "fit" | undefined;
  minW?: "0" | "full" | undefined;
  maxW?: "full" | "none" | undefined;
  grow?: boolean | undefined;
  shrink?: boolean | undefined;
  alignSelf?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
  position?: "relative" | "absolute" | "sticky" | undefined;
  overflow?: "hidden" | "auto" | "visible" | "clip" | undefined;
  radius?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "pill" | undefined;
  shadow?: 0 | 1 | 2 | 3 | 4 | undefined;
  border?: boolean | undefined;
  /** Light grounds only. Brand and ink grounds set data-surface: use the component's `surface` prop. */
  bg?: "page" | "page-alt" | "card" | "sunken" | "soft" | undefined;
  color?: "heading" | "body" | "muted" | "subtle" | "brand" | "danger" | "success" | undefined;
}

/** Responsive spacing keys → their Tailwind prefix. Value = SpaceStep or "auto" (margins). */
const SPACE_PREFIX = {
  m: "m", mt: "mt", mb: "mb", ms: "ms", me: "me", mx: "mx", my: "my",
  p: "p", pt: "pt", pb: "pb", ps: "ps", pe: "pe", px: "px", py: "py",
  gap: "gap", gapX: "gap-x", gapY: "gap-y",
} as const satisfies Partial<Record<keyof Sx, string>>;

const DISPLAY: Record<Display, string> = {
  none: "hidden", block: "block", inline: "inline", "inline-block": "inline-block",
  flex: "flex", "inline-flex": "inline-flex", grid: "grid", contents: "contents",
};
const TEXT_ALIGN = { start: "text-start", center: "text-center", end: "text-end" } as const;
const WIDTH = { full: "w-full", auto: "w-auto", fit: "w-fit" } as const;

/** Non-responsive keys: complete literal class names, so the scanner sees every one. */
const STATIC = {
  h: { full: "h-full", auto: "h-auto", fit: "h-fit" },
  minW: { "0": "min-w-0", full: "min-w-full" },
  maxW: { full: "max-w-full", none: "max-w-none" },
  grow: { true: "grow", false: "grow-0" },
  shrink: { true: "shrink", false: "shrink-0" },
  alignSelf: { start: "self-start", center: "self-center", end: "self-end", stretch: "self-stretch", baseline: "self-baseline" },
  position: { relative: "relative", absolute: "absolute", sticky: "sticky" },
  overflow: { hidden: "overflow-hidden", auto: "overflow-auto", visible: "overflow-visible", clip: "overflow-clip" },
  radius: { none: "rounded-none", xs: "rounded-xs", sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg", xl: "rounded-xl", pill: "rounded-pill" },
  shadow: { 0: "shadow-none", 1: "shadow-1", 2: "shadow-2", 3: "shadow-3", 4: "shadow-4" },
  border: { true: "border-default border-border-default", false: "border-0" },
  bg: { page: "bg-surface-page", "page-alt": "bg-surface-page-alt", card: "bg-surface-card", sunken: "bg-surface-sunken", soft: "bg-surface-brand-soft" },
  color: { heading: "text-text-heading", body: "text-text-body", muted: "text-text-muted", subtle: "text-text-subtle", brand: "text-text-brand", danger: "text-text-danger", success: "text-text-success" },
} as const;

function responsive<T extends string | number>(
  value: Responsive<T> | undefined,
  toClass: (v: T) => string
): string[] {
  if (value === undefined) return [];
  if (typeof value !== "object") return [toClass(value)];
  const out: string[] = [];
  for (const [bp, v] of Object.entries(value) as [SxBreakpoint, T | undefined][]) {
    if (v !== undefined) out.push((bp === "base" ? "" : `${bp}:`) + toClass(v));
  }
  return out;
}

export function sxClass(sx: Sx | undefined): string {
  if (sx === undefined) return "";
  const out: string[] = [];
  for (const [key, prefix] of Object.entries(SPACE_PREFIX) as [keyof typeof SPACE_PREFIX, string][]) {
    out.push(...responsive(sx[key], (v) => `${prefix}-${v}`));
  }
  out.push(...responsive(sx.display, (v) => DISPLAY[v]));
  out.push(...responsive(sx.textAlign, (v) => TEXT_ALIGN[v]));
  out.push(...responsive(sx.w, (v) => WIDTH[v]));
  for (const key of Object.keys(STATIC) as (keyof typeof STATIC)[]) {
    const v = sx[key];
    if (v !== undefined) out.push((STATIC[key] as Record<string, string>)[String(v)] as string);
  }
  return out.join(" ");
}

/** sx before className: componentVariants' tailwind-merge keeps the LAST conflicting class. */
export function withSx(sx: Sx | undefined, className: string | undefined): string | undefined {
  const s = sxClass(sx);
  if (s === "") return className;
  return className === undefined || className === "" ? s : `${s} ${className}`;
}

const STEPS = "0,0.5,1,1.5,2,3,4,5,6,7,8,9,10,11,12,14,16,18,20,24,32";
const BP = "{sm:,md:,lg:,xl:,}";
/** Every class `sxClass` can build at runtime. styles.css repeats each as `@source inline("…");`. */
export const SX_SAFELIST = [
  `${BP}m{,t,b,s,e,x,y}-{${STEPS},auto}`,
  `${BP}p{,t,b,s,e,x,y}-{${STEPS}}`,
  `${BP}gap{,-x,-y}-{${STEPS}}`,
  `${BP}{hidden,block,inline,inline-block,flex,inline-flex,grid,contents}`,
  `${BP}{text-start,text-center,text-end,w-full,w-auto,w-fit}`,
] as const;
```

- [ ] **Step 4: Add the safelist to `styles.css`**

Insert after `@source not "./**/*.{spec,test,stories}.{ts,tsx}";`:

```css
/* sx (lib/sx.ts): responsive classes are assembled at runtime, so declare every one. Keep these
   five lines identical to SX_SAFELIST; sx.spec.ts compares them. */
@source inline("{sm:,md:,lg:,xl:,}m{,t,b,s,e,x,y}-{0,0.5,1,1.5,2,3,4,5,6,7,8,9,10,11,12,14,16,18,20,24,32,auto}");
@source inline("{sm:,md:,lg:,xl:,}p{,t,b,s,e,x,y}-{0,0.5,1,1.5,2,3,4,5,6,7,8,9,10,11,12,14,16,18,20,24,32}");
@source inline("{sm:,md:,lg:,xl:,}gap{,-x,-y}-{0,0.5,1,1.5,2,3,4,5,6,7,8,9,10,11,12,14,16,18,20,24,32}");
@source inline("{sm:,md:,lg:,xl:,}{hidden,block,inline,inline-block,flex,inline-flex,grid,contents}");
@source inline("{sm:,md:,lg:,xl:,}{text-start,text-center,text-end,w-full,w-auto,w-fit}");
```

- [ ] **Step 5: Run the spec to verify it passes**

Run: `pnpm nx test ui -- sx.spec`
Expected: PASS (all cases). Then `pnpm nx run ui:typecheck`. Expected: PASS, which proves the `@ts-expect-error` lines are real errors.

- [ ] **Step 6: Computed-style proof story (RED first)**

```tsx
// packages/ui/src/lib/sx.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { sxClass } from "./sx";

const meta = { title: "Foundations/Sx/Proof", tags: ["!autodocs"] } satisfies Meta;
export default meta;

/** Proves the safelist ships CSS: these classes are built at runtime, never written in source. */
export const ResponsiveClassesHaveCss: StoryObj = {
  render: () => (
    <div>
      <div data-testid="m" className={sxClass({ mt: { base: 6 } })} />
      <div data-testid="d" className={sxClass({ display: { base: "none", xl: "block" } })} />
      <div data-testid="g" className={`grid ${sxClass({ gapX: { base: 3 } })}`} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(getComputedStyle(c.getByTestId("m")).marginTop).toBe("24px");
    await expect(getComputedStyle(c.getByTestId("d")).display).toBe("none");
    await expect(getComputedStyle(c.getByTestId("g")).columnGap).toBe("12px");
  },
};
```
Run: `pnpm nx run storybook:test -- sx.stories`. Temporarily comment out the five `@source inline` lines to see RED (`expected '0px' to be '24px'`), restore them, and see GREEN.

- [ ] **Step 7: Measure the CSS budget**

Run `pnpm nx run storybook:build` before Step 4's change (`git stash` is NOT allowed, so build at HEAD first and record the number) and again after: `gzip -c apps/storybook/storybook-static/assets/*.css | wc -c`.
Expected: the delta is ≤ 20480 bytes. If it's over, drop `xl:` from the margin and padding lines (both in styles.css and SX_SAFELIST, and the `xl` key from `SxBreakpoint` for spacing only via a separate `SpaceResponsive` type), then re-measure. Record both numbers in the ledger.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/lib/sx.ts packages/ui/src/lib/sx.spec.ts packages/ui/src/lib/sx.stories.tsx packages/ui/src/styles.css
git commit -m "feat(ui): add the token-typed sx prop helper"
```

---

