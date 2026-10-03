# Component API (MUI-grade props) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Executor: Cursor.** If superpowers skills are not available in Cursor, follow "Execution in Cursor" below. It carries the same rules.

**Goal:** Give all ~100 components in `packages/ui` one MUI-grade API. That means a token-typed `sx` prop, one `surface`/`color`/`status`/`size` vocabulary, Typography inheritance and native props everywhere. Then add Box, Grid, Drawer, Popover, DropdownMenu, Combobox, Fab, SpeedDial and DatePicker on that API.

**Architecture:** `lib/sx.ts` turns a typed `sx` object into Tailwind classes. Responsive keys build class names at runtime, and the complete set is pre-declared once in `styles.css` with Tailwind 4's `@source inline()`. Static keys use literal maps. `lib/common-props.ts` holds the shared prop types and the surface maps lifted from Section. Each component adds `sx` to its root through `withSx(sx, className)` in its `componentVariants` call and renames its `tone` props per the table in Task 6. Text becomes Typography, and Link renders through it.

**Tech Stack:** React 19, TypeScript 6.x (do NOT upgrade to 7), Tailwind CSS 4.3 + tailwind-variants (`componentVariants`), Radix (`radix-ui` umbrella package), Vitest + Testing Library + axe, Storybook 10 (react-vite) with plays in headless Chromium, Nx, pnpm.

**Spec:** `docs/superpowers/specs/2026-10-04-component-api-design.md`. Read it first. It is the authority on what the API must be, and this plan is how to build it.

## Global Constraints

- Read before writing code: `packages/ui/AUTHORING.md`, `docs/superpowers/slim/RULES.md`, the spec above, and ONE finished sibling of the component you touch. Nothing else is required.
- Brand: "Pink Paprikaa" always has two a's. Fixtures are pure veg (no egg, no meat, no fish). No founder identity anywhere.
- No raw hex, no arbitrary values (`w-[13px]`), no `(--x)` shorthand, no `max-w-prose`. Tokens only.
- Never `eslint-disable` a LAW rule (`no-raw-hex`, `atomic-layering`, module boundaries). Never `--no-verify`. Never `git reset --hard`, `checkout --`, `clean`, force-push or stash drop. Never push or merge.
- pnpm only. Install dependencies with `pnpm add <pkg> --filter @pink-paprikaa-web/ui` (never hand-write a version). The only new dependency in this plan is `react-day-picker` (Task 15).
- Layers import upward only: atoms → molecules → organisms → layouts. Atoms import only `atoms/icon` and `lib`. Nothing imports a layout. `packages/ui` never imports `@pink-paprikaa-web/content`.
- Component shape: `componentVariants` (never bare `tv`), named export, no `forwardRef`, optional props `?: T | undefined`, native props spread last, `"use client"` only in the smallest leaf, `data-surface` (never an `on` prop).
- Every new spacing/text/shadow/radius/z token class must be registered in `lib/component-variants.ts` merge groups, or tailwind-merge drops it.
- Tests: write first, see RED, then implement. Query by role and label. End every component suite with `await expectNoA11yViolations(container)` (from `../../../vitest.setup`).
- Stories: `title: "<Tier>/<Name>"`, `satisfies Meta<typeof X>`, Playground, OnSurfaces where surface-aware, a 360px story (`globals: { viewport: { value: "floor360" } }` as siblings do), and plays for interactive components.
- Commits: Conventional Commits, lower-case subject, one commit per component (or per task where stated), the message ends with `Co-Authored-By: <your agent attribution>`. Run Prettier again after `eslint --fix` (lint can re-sort classes).
- The old plan docs in `docs/superpowers/plans/2026-09-27-*` are frozen indexes. Never edit them.
- **Visual parity:** a rename must not change pixels. Each old prop value maps to new props that produce the SAME classes. Existing stories and plays are the proof, so they must stay green after the rename.

## Review Focus

1. **`sx` against the component's own classes.** `<Button sx={{ px: 8 }}>` must replace Button's `px-*`, not add a second padding. Test: Task 1 `withSx` + Task 7 Button test asserting `px-8` present AND the default `px-5` absent.
2. **Responsive `sx` with no CSS.** `sx={{ mt: { md: 6 } }}` must actually style at md. jsdom cannot see CSS, so Task 1's Storybook play reads `getComputedStyle(el).marginTop` at the default viewport and asserts `"24px"` for `{ base: 6 }`. Task 1 also asserts the safelist string contains every generated prefix.
3. **`sx.bg` on a dark ground.** Brand and ink grounds must go through `surface` (sets `data-surface`) or text contrast breaks. `Sx["bg"]` must not accept `"brand"` or `"ink"`. Test: Task 1 type test with `// @ts-expect-error`.
4. **Renamed props in kits and docs.** The Storybook kits/docs use old prop names, and `tsc` catches some of it while MDX doesn't type-check. Test: Task 13 runs `storybook:test` over every docs page and kit, plus a grep gate for `tone=` across `apps/storybook/src`.
5. **Native props + ref on compound components.** `<Tabs id="menu-tabs" data-x>` and `ref` must reach the root. Test: Task 10's per-component `id`/`ref` assertion for Tabs, Toast, Dialog, ChipGroup, FilterBar, OtpInput, QuantityStepper, Snackbar.

## Execution in Cursor

- Work task by task in order. Each task ends green (its tests + the listed gate) and committed before the next starts.
- **Ledger:** append one line per finished task to `.superpowers/sdd/2026-10-04-ds-06-mui-gaps/progress.md`: `Task N: done <first-sha>..<last-sha> (ui X, sb Y)`. If you must decide something the plan doesn't, add `Ruling: <decision> — <why> — <cost if wrong>` and continue.
- **Interrupted?** Run `git status` and read the last ledger line. Uncommitted files are a previous run's partial work: finish them, never delete them.
- **Batch gate** (after Tasks 5, 9, 12, 13 and 16): `pnpm nx run-many -t typecheck lint test build && pnpm nx format:check && pnpm nx sync:check && pnpm nx run storybook:test && pnpm guard:founder`
- **Per-component commands:** `pnpm nx test ui -- <name>` (unit) · `pnpm nx run storybook:test -- <name>.stories` (plays).
- **Review:** after each batch gate, review the batch diff against the spec and this task list (self-review, or a reviewer agent if available): props as specified, no visual change, tests present. Fix Critical/Important findings at once. Collect Minor ones in `.superpowers/sdd/2026-10-04-ds-06-mui-gaps/minors.md` and fix them in Task 17.

---

### Task 0: Recover the interrupted X1 work and set the baseline

**Files:**
- Inspect: `packages/ui/src/layouts/grid/grid.tsx`, `grid.test.tsx` (uncommitted, from the interrupted run)
- Inspect: `packages/ui/src/layouts/box/` (committed in `fd5d8b2`, old API, reworked in Task 4)

- [ ] **Step 1: Record state**

Run: `git status --short && git log --oneline -3`
Expected: `fd5d8b2 feat(ui): add the Box layout` is in history. `layouts/grid/` is untracked, and so are the spec and plan files if not yet committed.

- [ ] **Step 2: Park the Grid WIP without losing it**

```bash
mkdir -p .superpowers/sdd/2026-10-04-ds-06-mui-gaps/wip-grid
cp packages/ui/src/layouts/grid/grid.tsx packages/ui/src/layouts/grid/grid.test.tsx .superpowers/sdd/2026-10-04-ds-06-mui-gaps/wip-grid/
```
Leave the files in place: Task 4 finishes them.

- [ ] **Step 3: Baseline gate on HEAD, excluding the Grid WIP**

Run: `pnpm nx run-many -t typecheck test -p @pink-paprikaa-web/ui`
Expected: PASS. If the Grid WIP breaks typecheck, move the two files into the parked folder for now (`mv`, not `rm`), re-run, and restore them in Task 4. Write `Task 0: baseline ui <count> tests` in the ledger.

---

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
    const css = readFileSync(join(import.meta.dirname, "../styles.css"), "utf8") // repo convention (brand-artwork.spec.ts);
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

### Task 2: Shared prop types (`lib/common-props.ts`)

**Files:**
- Create: `packages/ui/src/lib/common-props.ts`, `packages/ui/src/lib/common-props.spec.ts`
- Modify: `packages/ui/src/layouts/section/section.tsx` (import the maps instead of its local copies; behaviour identical)
- Modify: `packages/ui/src/index.ts` (export the public types)

**Interfaces:**
- Consumes: `Sx` from Task 1.
- Produces:
```ts
export type SurfaceProp = "page" | "alt" | "sunken" | "soft" | "brand" | "ink";
export type ColorProp = "brand" | "neutral" | "accent" | "success" | "warning" | "danger" | "info" | "inverse";
export type SizeProp = "sm" | "md" | "lg";
export type SxProp = { sx?: Sx | undefined };
export type BaseProps<E extends keyof JSX.IntrinsicElements> = ComponentProps<E> & SxProp;
export type BasePropsWithColor<E extends keyof JSX.IntrinsicElements> = Omit<ComponentProps<E>, "color"> & SxProp;
export const SURFACE_DATA: Record<SurfaceProp, "light" | "soft" | "brand" | "ink">;
export const SURFACE_BG: Record<SurfaceProp, string>;
```

- [ ] **Step 1: Failing spec**

```ts
// packages/ui/src/lib/common-props.spec.ts
import { SURFACE_BG, SURFACE_DATA } from "./common-props";

describe("surface maps", () => {
  it("set data-surface the way Section always has", () => {
    expect(SURFACE_DATA).toEqual({ page: "light", alt: "light", sunken: "light", soft: "soft", brand: "brand", ink: "ink" });
  });
  it("paint each ground with its surface token", () => {
    expect(SURFACE_BG).toEqual({
      page: "bg-surface-page", alt: "bg-surface-page-alt", sunken: "bg-surface-sunken",
      soft: "bg-surface-brand-soft", brand: "bg-surface-brand", ink: "bg-surface-inverse",
    });
  });
});
```

- [ ] **Step 2: Run, verify FAIL** (`pnpm nx test ui -- common-props`, module not found).

- [ ] **Step 3: Implement**

```ts
// packages/ui/src/lib/common-props.ts
import type { ComponentProps, JSX } from "react";

import type { Sx } from "./sx";

/** The ground a component paints and the data-surface it gives its children (spec §4). */
export type SurfaceProp = "page" | "alt" | "sunken" | "soft" | "brand" | "ink";
/** The palette. `accent` is turmeric, `info` is kesar. A domain state is `status`, never a colour. */
export type ColorProp = "brand" | "neutral" | "accent" | "success" | "warning" | "danger" | "info" | "inverse";
export type SizeProp = "sm" | "md" | "lg";
export interface SxProp {
  /** Token-typed style overrides on the root (spacing, display, size, look). See lib/sx.ts. */
  sx?: Sx | undefined;
}
export type BaseProps<E extends keyof JSX.IntrinsicElements> = ComponentProps<E> & SxProp;
/** For components with a palette `color` prop: the native `color` attribute is dropped. */
export type BasePropsWithColor<E extends keyof JSX.IntrinsicElements> = Omit<ComponentProps<E>, "color"> & SxProp;

export const SURFACE_DATA = {
  page: "light", alt: "light", sunken: "light", soft: "soft", brand: "brand", ink: "ink",
} as const satisfies Record<SurfaceProp, "light" | "soft" | "brand" | "ink">;

export const SURFACE_BG = {
  page: "bg-surface-page", alt: "bg-surface-page-alt", sunken: "bg-surface-sunken",
  soft: "bg-surface-brand-soft", brand: "bg-surface-brand", ink: "bg-surface-inverse",
} as const satisfies Record<SurfaceProp, string>;
```

- [ ] **Step 4: Point Section at the shared maps.** In `section.tsx`, replace the local `page: "light" …` object (lines ~14–21) with `SURFACE_DATA`, and the `tone` variant's object (lines ~25–32) with `SURFACE_BG`. Keep the prop name `tone` for now: Task 5 renames it. Run `pnpm nx test ui -- section`. Expected: PASS unchanged.

- [ ] **Step 5:** Export the types from `src/index.ts`: `export type { SurfaceProp, ColorProp, SizeProp, SxProp } from "./lib/common-props";` and `export type { Sx, Responsive } from "./lib/sx";`. Run the spec. Expected: PASS.

- [ ] **Step 6: Commit** `feat(ui): add the shared surface, color and size prop types`

---

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

### Task 6: The rename table (reference for Tasks 7–12)

This task writes no code. It is the single mapping every migration task follows. **Rule:** the new props must produce exactly the classes the old value produced. Before editing a component, open its variant map and move the class strings, don't retype them.

| Component | Old prop | New prop(s) | Value mapping |
| --- | --- | --- | --- |
| Badge | `tone` | `color` + `variant: "solid" \| "soft"` | brand→`color="brand" variant="solid"` · soft→`brand`,`soft` · ink→`neutral`,`solid` · success/warning/danger→same colour, `variant` = `soft` if the old classes use a `*-soft` background, else `solid` · neutral→`neutral`,`soft` |
| Card | `variant` | `variant` + `surface` | default/feature/quiet stay `variant` · brand→`surface="brand"` · ink→`surface="ink"` (sets data-surface) |
| ImageSlot | `tone` | `fill` | soft/strong/ink unchanged (placeholder fill, component-specific) |
| Logo, LogoLockup | `tone` | `color` | pink→`brand` · white→`inverse` · badge→`badge` (Logo-only extra value) |
| PatternField | `tone` | `surface` | brand/ink/soft unchanged · light→`page` |
| PriceTag, Stat, Spinner | `tone` | `color` | ink→`neutral` · brand→`brand` · inverse→`inverse` |
| ProgressBar | `tone` | `color` | brand→`brand` · mint→`success` · inverse→`inverse` |
| SocialHeadline | `size` | `variant` | same values (hero/h1/h2/body/caption/overline): it is a text style |
| StatusDot | `tone` | `status` | open/busy/closed/live/danger unchanged |
| Tag | `tone` | `color` | default→`neutral` · success→`success` · brand→`brand` |
| Alert | `tone` | `color` | info/success/warning/danger/brand/neutral unchanged |
| ChoiceCardGroup | `tone` | `surface` | light→`page` · on-brand→`brand` |
| CouponTicket | `tone` | `surface` | brand→`brand` · light→`page` |
| LinkCard | `tone` | `surface` | default→`page` · brand/ink/soft unchanged |
| LoyaltyCard | `variant` | `variant` + `surface` | feature stays · brand→`surface="brand"` |
| OfferSeal | `tone` | `color` | light→`neutral` · brand→`brand` · turmeric→`accent` |
| ReviewCard | `variant` | `surface` | default→(none) · brand→`surface="brand"` |
| Toast, Snackbar | `tone` (if a prop) | `color` | map the values onto ColorProp names; keep the classes |
| CtaBand, HeroBanner, QuotePanel, SiteFooter, StatBand | `tone` | `surface` | every value is a ground: rename the key; light-ish values → `page`/`alt` per their classes |

Everything else keeps its prop names and gains `sx` (+ native props + ref where missing). If a component has a `tone` that is not in this table, apply the rule: a ground → `surface`, a palette colour → `color`, a state → `status`. Ledger a `Ruling:` line for it.

- [ ] **Step 1:** Commit the spec and plan with this table unchanged: `docs: plan the component api migration` (if not already committed).

---

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

### Task 11: Molecules B — renames + `sx` on the rest

**Files:** every remaining folder in `packages/ui/src/molecules/`: accordion, alert, announcement-bar, breadcrumb, check-card, choice-card-group, coupon-ticket, empty-state, feature-item, field, key-value-list, link-card, list-row, logo-lockup, loyalty-card, menu-item-card, menu-item-row, offer-seal, outlet-card, pagination, price-summary, pricing-card, review-card, section-header, stat, step-tracker, steps, sticky-action-bar, table

Renames (Task 6): Alert `tone`→`color`; ChoiceCardGroup, CouponTicket, LinkCard `tone`→`surface`; LogoLockup `tone`→`color`; LoyaltyCard and ReviewCard brand → `surface`; OfferSeal `tone`→`color` (turmeric→accent); Stat `tone`→`color`. Everything else: `sx` only.

- [ ] **Step 1: Failing tests:** for each, "sx on root" plus, for the renamed ones, "old value's classes under the new prop" (copy the old class strings first, as in Task 7). Run → FAIL.
- [ ] **Step 2: Implement** → PASS.
- [ ] **Step 3: Call sites:** `grep -rnE "<(Alert|ChoiceCardGroup|CouponTicket|LinkCard|LogoLockup|OfferSeal|Stat)[^>]*tone=|<(LoyaltyCard|ReviewCard)[^>]*variant=\"brand\"" packages apps --include=*.tsx --include=*.mdx` → rewrite → typecheck PASS.
- [ ] **Step 4: Stories** renamed → `storybook:test -- molecules` PASS.
- [ ] **Step 5: Commit** per component (or per 3–4 related ones).

---

### Task 12: Organisms — `surface` + `sx`

**Files:** `packages/ui/src/organisms/{action-dock,cart-panel,cta-band,faq-section,hero-banner,menu-list,order-tracker,quote-panel,review-carousel,site-footer,site-header,stat-band,tab-bar,testimonial-wall}/*`

Renames: CtaBand, HeroBanner, QuotePanel, SiteFooter, StatBand `tone`→`surface` (map each value to its SurfaceProp by its background class). All of them gain `sx` on the root.

- [ ] **Step 1: Failing tests:** "sx on root" for all of them, plus "`surface=<x>` sets data-surface and the old classes" for the five renamed ones. Run → FAIL.
- [ ] **Step 2: Implement** → PASS.
- [ ] **Step 3: Call sites** (`grep -rnE "<(CtaBand|HeroBanner|QuotePanel|SiteFooter|StatBand)[^>]*tone=" packages apps --include=*.tsx --include=*.mdx`) → rewrite → typecheck PASS.
- [ ] **Step 4: Stories** → `storybook:test -- organisms` PASS.
- [ ] **Step 5: Commit** per organism.
- [ ] **Step 6: Batch gate 3** → ledger.

---

### Task 13: Storybook kits, docs and authoring docs on the new API

**Files:**
- Modify: `apps/storybook/src/kits/**`, `apps/storybook/src/foundations/**` (any remaining old prop use)
- Create: `apps/storybook/src/foundations/system/system.mdx` + `system.stories.tsx` (title `Foundations/System (sx)`)
- Modify: `packages/ui/AUTHORING.md` (new section "Shared API: sx, surface, color, status, size, Typography"), `docs/superpowers/slim/RULES.md` (add 5 lines; total ≤ 3.5 KB), `CLAUDE.md` "Current state" (one sentence)

- [ ] **Step 1: Grep gate (RED).** Run `grep -rnE "\btone=|<Text\b|atoms/text/text" apps/storybook/src packages/ui/src --include=*.tsx --include=*.mdx | grep -v "^.*//"`. Expected before the fixes: hits. Fix every hit per Task 6. Re-run. Expected: no output.

- [ ] **Step 2: System docs page.** `system.stories.tsx` has one story per key family (Spacing, Display, Size, Flex child, Look, Colour, Responsive). Each renders a labelled live example with the `sx` object printed beside it (`<Typography variant="mono">{JSON.stringify(sx)}</Typography>`). The Responsive story's play asserts the computed margin at the default viewport. `system.mdx` holds prose + `<Canvas of={…}>` only (docs-kit rule: no className in MDX). The text covers why `sx` (MUI v7 reference), that values are tokens only, `bg` vs `surface`, className-wins, and the CSS budget.

- [ ] **Step 3: AUTHORING.md section** (≤ 60 lines). Cover: every component takes `sx` via `withSx(sx, className)` on its outermost slot · `BaseProps<"el">`/`BasePropsWithColor` · `surface` vs `color` vs `status` decision rule with three examples · size scale · text-rooted components inherit `TypographyProps` (Link as the model) · native props + ref always reach the root.

- [ ] **Step 4:** Run `pnpm nx run storybook:test` (whole suite) → PASS.

- [ ] **Step 5: Commit** `docs(storybook): document the shared api and move the kits onto it`.

- [ ] **Step 6: Batch gate 4** → ledger.

---

### Task 14: Drawer, Popover and DropdownMenu

**Files:**
- Modify: `packages/ui/src/organisms/dialog/dialog.{tsx,test.tsx,stories.tsx}`, `packages/design-tokens/tokens/component/dialog.json`, `packages/ui/src/styles.css` (drawer keyframes), `lib/component-variants.ts` (new token names)
- Create: `packages/ui/src/molecules/popover/popover.{tsx,test.tsx,stories.tsx}`, `packages/design-tokens/tokens/component/popover.json`
- Create: `packages/ui/src/molecules/dropdown-menu/dropdown-menu.{tsx,test.tsx,stories.tsx}`

**Interfaces:**
```ts
// Dialog (extended)
variant?: "modal" | "sheet" | "drawer" | undefined;
side?: "start" | "end" | undefined; // drawer only, default "end"
export type DrawerProps = Omit<DialogProps, "variant">;
export function Drawer(props: DrawerProps): JSX.Element; // <Dialog variant="drawer" {...props} />

// Popover
export interface PopoverProps extends SxProp {
  trigger: ReactNode;                 // rendered via Radix Trigger asChild
  children: ReactNode;
  title?: ReactNode | undefined; headingLevel?: HeadingLevel | undefined;  // default 2
  side?: "top" | "right" | "bottom" | "left" | undefined;                 // default "bottom"
  align?: "start" | "center" | "end" | undefined;                         // default "center"
  hasArrow?: boolean | undefined; hasCloseButton?: boolean | undefined; closeLabel?: string | undefined; // "Close"
  open?: boolean | undefined; defaultOpen?: boolean | undefined; onOpenChange?: ((open: boolean) => void) | undefined;
  portalContainer?: HTMLElement | null | undefined;
}

// DropdownMenu: compound, MUI Menu equivalent
DropdownMenu (Root: open/defaultOpen/onOpenChange/modal) · DropdownMenu.Trigger (asChild) ·
DropdownMenu.Content (side, align, sideOffset, portalContainer, sx) ·
DropdownMenu.Item (icon?, shortcut?, color?: "default" | "danger", disabled, onSelect) ·
DropdownMenu.Label · DropdownMenu.Separator · DropdownMenu.CheckboxItem (checked, onCheckedChange) ·
DropdownMenu.RadioGroup (value, onValueChange) · DropdownMenu.RadioItem (value) ·
DropdownMenu.Sub · DropdownMenu.SubTrigger · DropdownMenu.SubContent
```
Tokens: `dialog-drawer-sm/md/lg` = 320/400/480px (spacing namespace, `utility` marker per R61). `popover.json`: `popover-pad` = 16px, `popover-max-w` = 320px. Panel look = `bg-surface-card border-default border-border-subtle rounded-lg shadow-3`, `z-overlay`. Menu item min height = 44px (tap target), `px-3 py-2.5`, `text-body-sm`. Danger item = `text-text-danger`.

- [ ] **Step 1: Drawer tests (RED):**

```tsx
it.each(["start", "end"] as const)("drawer on the %s side is a full-height dialog on that edge", async (side) => {
  render(<Drawer open title="Filters" side={side}>Jain only</Drawer>);
  const dialog = screen.getByRole("dialog", { name: "Filters" });
  expect(dialog).toHaveClass("h-full", side === "start" ? "start-0" : "end-0");
});
it("closes on Escape and returns focus to its trigger", async () => {
  const user = userEvent.setup();
  render(<DrawerHarness />); // a Button "Filters" toggling <Drawer title="Filters">
  await user.click(screen.getByRole("button", { name: "Filters" }));
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByRole("button", { name: "Filters" })).toHaveFocus();
});
it.each([["sm", "max-w-dialog-drawer-sm"], ["md", "max-w-dialog-drawer-md"], ["lg", "max-w-dialog-drawer-lg"]] as const)(
  "size %s", (size, cls) => {
    render(<Drawer open title="Cart" size={size}>x</Drawer>);
    expect(screen.getByRole("dialog")).toHaveClass(cls, "w-full");
  });
```
Run `pnpm nx test ui -- dialog` → FAIL.

- [ ] **Step 2: Implement Drawer.** Add the `drawer` variant: overlay `justify-end` (end) or `justify-start` (start); content `h-full w-full rounded-none` plus the size max-width tokens. Add `animate-drawer-in-start`/`-end` keyframes in styles.css next to `animate-sheet-in` (translateX from ∓100% to 0, `duration-base`, `ease-entrance`, inside `motion-safe`). The `side` → `start-0`/`end-0` classes are logical (RTL-safe). Export `Drawer`/`DrawerProps` from index.ts. → PASS.

- [ ] **Step 3: Drawer stories** (in `dialog.stories.tsx`): `DrawerEnd`, `DrawerStart`, `DrawerSizes`, `DrawerWithFooter` (menu filters: veg categories as Checkboxes + Reset/Apply buttons), `DrawerLongContent` (body scrolls, header and footer fixed; play: `body.scrollHeight > body.clientHeight`), `Drawer360`. Plays open via the trigger, press Escape, and assert focus return. Commit `feat(ui): add the drawer variant of dialog`.

- [ ] **Step 4: Popover tests (RED):**

```tsx
it("opens from its trigger, is named by its title, and Escape returns focus", async () => {
  const user = userEvent.setup();
  render(<Popover trigger={<Button>What's in the thali?</Button>} title="Thali">Dal, sabzi, 3 rotis, rice, raita.</Popover>);
  await user.click(screen.getByRole("button", { name: "What's in the thali?" }));
  expect(screen.getByRole("dialog", { name: "Thali" })).toBeVisible();
  await user.keyboard("{Escape}");
  expect(screen.getByRole("button", { name: "What's in the thali?" })).toHaveFocus();
});
it("close button closes it", async () => { /* hasCloseButton, click "Close" → dialog gone */ });
it("passes side and align to the content", async () => { /* open, expect data-side="top", data-align="start" */ });
it("is accessible open", async () => { /* open, then await expectNoA11yViolations(document.body) */ });
```
Write the three stubbed tests out fully, following the first. Run → FAIL.

- [ ] **Step 5: Implement Popover** with `Popover as RadixPopover` from `radix-ui`: Root (open state), Trigger asChild, Portal (container), Content (`side`, `align`, `sideOffset={8}`, `collisionPadding={16}`, `aria-labelledby` the title id when there is a title), Arrow when `hasArrow`, and a Close IconButton when `hasCloseButton`. Title via `createElement(headingTag(headingLevel ?? 2))`. `withSx` on Content. → PASS. Stories: Playground, Sides (four), WithTitle, InfoPopover (Info icon IconButton), Controlled, OnSurfaces, Mobile360 (the play asserts the content's rect stays inside the viewport). Commit `feat(ui): add the popover molecule`.

- [ ] **Step 6: DropdownMenu tests (RED):**

```tsx
it("opens with Enter, moves with arrows, selects with Enter, and returns focus", async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  render(
    <DropdownMenu>
      <DropdownMenu.Trigger asChild><Button>Account</Button></DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onSelect={onSelect}>My orders</DropdownMenu.Item>
        <DropdownMenu.Item>Saved addresses</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item color="danger">Sign out</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
  screen.getByRole("button", { name: "Account" }).focus();
  await user.keyboard("{Enter}");
  expect(screen.getByRole("menu")).toBeVisible();
  await user.keyboard("{ArrowDown}{Enter}");
  expect(onSelect).not.toHaveBeenCalled(); // ArrowDown moved past the first item
  // repeat: open, Enter on the first item → onSelect called once; Escape → trigger focused
});
it("renders radio and checkbox items with their roles and state", () => { /* menuitemradio aria-checked, menuitemcheckbox */ });
it("disabled items cannot be selected", () => { /* aria-disabled, onSelect not called */ });
it("danger items use the danger text colour", () => { /* toHaveClass("text-text-danger") */ });
```
Write the stubs out fully. Run → FAIL.

- [ ] **Step 7: Implement DropdownMenu** with `DropdownMenu as RadixMenu` from `radix-ui`. Each part is a thin styled wrapper. Item: Icon atom at 18px + label + optional `shortcut` (`ms-auto text-caption text-text-muted`). Checkbox and radio indicators use the Icon atom (Check / a filled diamond dot). SubTrigger has a ChevronRight. Content gets the shared panel classes + `withSx`. → PASS. Stories: `SortMenu` (RadioGroup: Popular, Price low to high, Newest), `AccountMenu` (icons, separator, danger Sign out), `DietFilters` (CheckboxItems: Jain, No onion-garlic, Gluten-free), `WithSubmenu` (Outlet → Sector 57 / MKM Market), `DisabledItem`. Plays: keyboard path and type-ahead ("N" → Newest). Commit `feat(ui): add the dropdown menu molecule`.

---

### Task 15: Combobox, Fab, SpeedDial and DatePicker

**Files:**
- Create: `packages/ui/src/molecules/combobox/combobox.{tsx,test.tsx,stories.tsx}`
- Create: `packages/ui/src/atoms/fab/fab.{tsx,test.tsx,stories.tsx}`, `packages/design-tokens/tokens/component/fab.json`
- Create: `packages/ui/src/molecules/speed-dial/speed-dial.{tsx,test.tsx,stories.tsx}`
- Create: `packages/ui/src/molecules/date-picker/{date-picker,calendar}.tsx`, `date-picker.test.tsx`, `date-picker.stories.tsx`
- Modify: `packages/ui/package.json` via `pnpm add react-day-picker --filter @pink-paprikaa-web/ui`
- Create (if missing): `packages/ui/src/lib/format-date.ts` + `.spec.ts`

**Interfaces:**
```ts
// Combobox: WAI-ARIA 1.2 combobox, hand-built, single select
export interface ComboboxOption { value: string; label: string; description?: string | undefined; disabled?: boolean | undefined }
export interface ComboboxProps extends SxProp {
  options: readonly ComboboxOption[];
  value?: string | null | undefined; defaultValue?: string | null | undefined; onValueChange?: ((value: string | null) => void) | undefined;
  inputValue?: string | undefined; onInputChange?: ((text: string) => void) | undefined;
  filter?: ((option: ComboboxOption, text: string) => boolean) | undefined; // default: case- and diacritic-insensitive includes on label
  placeholder?: string | undefined; emptyMessage?: string | undefined;  // "No matches"
  isLoading?: boolean | undefined; loadingLabel?: string | undefined;   // "Loading…"
  isClearable?: boolean | undefined; clearLabel?: string | undefined;   // "Clear"
  name?: string | undefined; disabled?: boolean | undefined; status?: FieldStatus | undefined; id?: string | undefined;
  "aria-label"?: string | undefined; "aria-describedby"?: string | undefined; // Field wiring, like Select
}
// Fab
export interface FabProps extends BaseProps<"button"> {
  icon: IconComponent; label: string; isExtended?: boolean | undefined;
  size?: "md" | "lg" | undefined; variant?: "primary" | "secondary" | undefined;
  position?: "none" | "bottom-end" | "bottom-start" | undefined; asChild?: boolean | undefined;
}
// SpeedDial
export interface SpeedDialAction { icon: IconComponent; label: string; href?: string | undefined; target?: string | undefined; onSelect?: (() => void) | undefined }
export interface SpeedDialProps extends SxProp {
  label: string; icon?: IconComponent | undefined; actions: readonly SpeedDialAction[];
  direction?: "up" | "down" | "left" | "right" | undefined;
  open?: boolean | undefined; defaultOpen?: boolean | undefined; onOpenChange?: ((open: boolean) => void) | undefined;
  position?: "none" | "bottom-end" | "bottom-start" | undefined;
}
// Calendar + DatePicker (react-day-picker inside)
export interface CalendarProps extends SxProp {
  mode?: "single" | "range" | undefined; selected?: Date | DateRange | undefined; onSelect?: ((v: Date | DateRange | undefined) => void) | undefined;
  disabled?: Matcher | Matcher[] | undefined; fromDate?: Date | undefined; toDate?: Date | undefined;
  numberOfMonths?: 1 | 2 | undefined; // weekStartsOn fixed at 1 (Monday)
}
export interface DatePickerProps extends SxProp {
  value?: Date | null | undefined; defaultValue?: Date | null | undefined; onValueChange?: ((d: Date | null) => void) | undefined;
  placeholder?: string | undefined; // "Pick a date"
  disabled?: boolean | undefined; disabledDays?: Matcher | Matcher[] | undefined;
  name?: string | undefined; status?: FieldStatus | undefined; portalContainer?: HTMLElement | null | undefined;
  id?: string | undefined; "aria-describedby"?: string | undefined;
}
export function formatDate(d: Date): string; // en-IN "Sat, 4 Oct 2026"
export function toIsoDate(d: Date): string;  // "2026-10-04" (local), for the hidden input
```

- [ ] **Step 1: Combobox tests (RED).** Fixture `DISHES` = 12 veg dishes (Paneer Tikka, Paneer Butter Masala, Dal Makhani, Chole Bhature, Masala Dosa, Pav Bhaji, Veg Biryani, Malai Kofta, Aloo Paratha, Gulab Jamun, Rasmalai, Kulfi).

```tsx
it("filters as you type and selects with ArrowDown + Enter", async () => {
  const user = userEvent.setup(); const onValueChange = vi.fn();
  render(<Combobox aria-label="Search dishes" options={DISHES} onValueChange={onValueChange} />);
  const input = screen.getByRole("combobox", { name: "Search dishes" });
  await user.type(input, "pan");
  expect(input).toHaveAttribute("aria-expanded", "true");
  expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Paneer Tikka", "Paneer Butter Masala"]);
  await user.keyboard("{ArrowDown}");
  expect(input).toHaveAttribute("aria-activedescendant", screen.getAllByRole("option")[0]!.id);
  await user.keyboard("{Enter}");
  expect(onValueChange).toHaveBeenCalledWith("paneer-tikka");
  expect(input).toHaveValue("Paneer Tikka");
  expect(input).toHaveAttribute("aria-expanded", "false");
});
it("matches without case or accents", async () => { /* type "DAL" → Dal Makhani */ });
it("Escape closes, a second Escape clears the text", async () => {});
it("shows the empty message and the loading state", () => {});
it("clear button resets value and text, and refocuses the input", async () => {});
it("disabled options are skipped by arrows and cannot be clicked", async () => {});
it("submits the value through a hidden input", () => { /* name="dish" → input[type=hidden][name=dish] value */ });
it("is accessible open and closed", async () => {});
```
Write every stub out fully in the same style. Run → FAIL.

- [ ] **Step 2: Implement Combobox.** An input with `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`, `aria-controls` → the listbox id, and `aria-activedescendant` → the active option id. The listbox is a `ul role="listbox"` of `li role="option" aria-selected id=…`, positioned absolutely under the input with the Popover panel classes. The input look comes from `lib/field-control` (same as Input/Select). Matches are highlighted with `<mark className="bg-transparent font-semibold text-text-heading">`. The diacritic-insensitive match is `s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()`. Keyboard: ArrowDown (open/next, skip disabled), ArrowUp, Home/End (in the list), Enter (commit), Escape (close, then clear), Tab (commit the active option, close). Clicking an option commits it, and pointerdown on the list doesn't blur the input. → PASS. Stories: `Playground`, `WithDescriptions`, `Loading`, `Empty`, `DisabledOptions`, `InFieldWithError` (inside `Field`, label "Dish", error message), `Controlled`, `Mobile360`. Play: type "pan" → ArrowDown → Enter → value shown. Commit `feat(ui): add the combobox molecule`.

- [ ] **Step 3: Fab tests (RED):**

```tsx
it("is named by its label; the label shows only when extended", () => {
  const { rerender } = render(<Fab icon={Phone} label="Call us" />);
  expect(screen.getByRole("button", { name: "Call us" })).toBeInTheDocument();
  expect(screen.queryByText("Call us", { selector: "span:not(.sr-only)" })).toBeNull();
  rerender(<Fab icon={Phone} label="Call us" isExtended />);
  expect(screen.getByText("Call us", { selector: "span:not(.sr-only)" })).toBeVisible();
});
it.each([["bottom-end", "end-4"], ["bottom-start", "start-4"]] as const)("position %s is fixed on that corner", (position, cls) => {
  render(<Fab icon={Phone} label="Call us" position={position} />);
  expect(screen.getByRole("button")).toHaveClass("fixed", cls);
});
it("asChild renders a link", () => {
  render(<Fab icon={Phone} label="Call us" asChild><a href="tel:+911244000000" /></Fab>);
  expect(screen.getByRole("link", { name: "Call us" })).toHaveAttribute("href", "tel:+911244000000");
});
```
Run → FAIL. Implement: round (`rounded-pill`), size tokens `fab-md` = 48px and `fab-lg` = 56px (`fab.json`, spacing namespace, utility marker), `shadow-4`, primary = brand fill + `text-ink-000`, secondary = `bg-surface-card text-text-brand`. Fixed positions: `fixed bottom-4 end-4` (bottom-end) or `fixed bottom-4 start-4` (bottom-start), `z-dock`. No arbitrary values: if a `dock-clearance` spacing token exists in `lib/component-variants.ts` SPACING, add `mb-dock-clearance` so the Fab clears ActionDock/TabBar. Otherwise ledger a Ruling and keep `bottom-4`. Stories: `Playground`, `Variants`, `Extended`, `Positions` (in a framed `relative` box with `position="none"` + a fixed demo in its own story with `layout: "fullscreen"`), `AsLink`. Commit `feat(ui): add the fab atom`.

- [ ] **Step 4: SpeedDial tests (RED):**

```tsx
const ACTIONS = [
  { icon: Phone, label: "Call", href: "tel:+911244000000" },
  { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/911244000000", target: "_blank" },
  { icon: MapPin, label: "Directions", onSelect: vi.fn() },
];
it("toggles open with aria-expanded and shows its actions", async () => {
  const user = userEvent.setup();
  render(<SpeedDial label="Contact us" actions={ACTIONS} />);
  const trigger = screen.getByRole("button", { name: "Contact us" });
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  await user.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("link", { name: "Call" })).toBeVisible();
  expect(screen.getByRole("link", { name: /WhatsApp.*Opens in a new tab/ })).toBeVisible();
});
it("arrows move between actions, Escape closes and refocuses the trigger", async () => {});
it("onSelect fires and closes the dial", async () => {});
it("is accessible open", async () => {});
```
Write the stubs out. Run → FAIL. Implement: the trigger is a Fab (`aria-expanded`, `aria-controls` → the list id) whose icon rotates 45° when open (`motion-safe:`). Actions are a `ul role="list"` of small round buttons or links (Fab size md, variant secondary) each with a visible label chip (sr-only label always present), laid out by `direction` (flex-col-reverse for up, etc.). Click outside closes (pointerdown listener on document while open). Arrow keys move focus within the actions. Escape closes and focuses the trigger (`useFocusReturn`). New-tab actions append the R44 sr-only "(Opens in a new tab)". → PASS. Stories: `Playground` (Call, WhatsApp, Directions), `Directions` (up/down/left/right), `Controlled`, `Mobile360` with `position="bottom-end"`. Commit `feat(ui): add the speed dial molecule`.

- [ ] **Step 5: DatePicker.** Run `pnpm add react-day-picker --filter @pink-paprikaa-web/ui`. Write `format-date.spec.ts` first:

```ts
import { formatDate, toIsoDate } from "./format-date";
it("formats en-IN with weekday", () => expect(formatDate(new Date(2026, 9, 4))).toBe("Sat, 4 Oct 2026"));
it("iso date is local, not UTC-shifted", () => expect(toIsoDate(new Date(2026, 9, 4, 23, 30))).toBe("2026-10-04"));
```
→ FAIL → implement with `new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })` (strip any comma differences so the test string holds) and manual `yyyy-mm-dd` from the local getters → PASS.

- [ ] **Step 6: DatePicker tests (RED):**

```tsx
it("opens the calendar, picks a day with the keyboard, shows it formatted and submits ISO", async () => {
  const user = userEvent.setup(); const onValueChange = vi.fn();
  render(<DatePicker aria-label="Booking date" name="date" defaultValue={new Date(2026, 9, 4)} onValueChange={onValueChange} />);
  await user.click(screen.getByRole("button", { name: /Booking date/ }));
  expect(screen.getByRole("grid")).toBeVisible();
  await user.keyboard("{ArrowRight}{Enter}");
  expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 9, 5));
  expect(screen.getByRole("button", { name: /Booking date/ })).toHaveTextContent("Sun, 5 Oct 2026");
  expect(document.querySelector('input[type=hidden][name="date"]')).toHaveValue("2026-10-05");
});
it("disabled days cannot be chosen", async () => { /* disabledDays={{ dayOfWeek: [1] }} (Mondays) → aria-disabled on a Monday cell */ });
it("Escape closes and returns focus to the trigger", async () => {});
it("Calendar range mode selects a start and an end", async () => {});
it("is accessible open", async () => {});
```
Write the stubs out. Run → FAIL.

- [ ] **Step 7: Implement Calendar + DatePicker.** `Calendar` wraps `DayPicker` with `weekStartsOn={1}` and a `classNames` map built ONLY from token classes (day = `size-10 rounded-md text-body-sm`, selected = `bg-pink-500 text-ink-000`, today = `font-bold text-text-brand`, range middle = `bg-surface-brand-soft`, disabled = `text-ink-400 line-through`, nav buttons = IconButton look). Do not import react-day-picker's CSS. `DatePicker` = a trigger button with the field-control look (CalendarDays icon, value via `formatDate` or the placeholder) + Popover (Task 14) holding the Calendar + a hidden input `toIsoDate`. Field wiring as in Select. → PASS. Stories: `CalendarSingle`, `CalendarRange`, `CalendarDisabledDays` (past + Mondays), `TwoMonths`, `DatePickerPlayground`, `InFieldWithError`, `Mobile360`. Plays: open, arrow keys, Enter, the formatted value, Escape → focus. Commit `feat(ui): add the date picker and calendar`.

- [ ] **Step 8:** Export everything from index.ts (atoms, molecules, alphabetical). Run `pnpm nx run storybook:test -- combobox fab speed-dial date-picker` → PASS.

---

### Task 16: Final gate and records

- [ ] **Step 1: Batch gate 5** (full) → green. Record the counts.
- [ ] **Step 2: Founder and brand grep:** `pnpm guard:founder` → exit 0; `grep -rn "Pink Paprika[^a]" packages apps --include=*.tsx --include=*.mdx` → no output; `grep -rniE "chicken|mutton|\begg\b|fish|prawn" packages/ui/src apps/storybook/src --include=*.tsx` → no output.
- [ ] **Step 3: Archive records:** `rsync -a --exclude '*.diff' --exclude plan-path --exclude .gitignore .superpowers/sdd/ docs/superpowers/records/sdd/`. If lint-staged chokes on `.tsx` backups in the archive, remove those copies from `docs/superpowers/records/` only (the workspace keeps them). Commit `docs: archive the component api records`.

### Task 17: Whole-branch review and one fix wave

- [ ] **Step 1:** Review `git diff fd5d8b2~1..HEAD` against the spec (§3–§6), this plan's Review Focus list and `minors.md`. Use a fresh reviewer agent if Cursor has one, otherwise review with fresh eyes. Classify each finding Critical/Important/Minor.
- [ ] **Step 2:** Fix everything Critical and Important plus the Minors worth fixing, in ONE pass. Re-run the full gate.
- [ ] **Step 3:** Ledger: `Final: done (ui X, sb Y, tokens Z)` plus every `Ruling:` line. Commit `fix(ui): settle the component api review`. Do not push.

---

## Self-review (planner)

- **Spec coverage:** §3 sx → Task 1; §4 vocabulary → Tasks 2, 5–12; §4 native props → Task 10 (+ BaseProps in every task); §5 Typography/Link → Task 3; §6 Box/Grid → Task 4, Drawer/Popover/Menu → Task 14, Combobox/Fab/SpeedDial/DatePicker → Task 15; §7 quality → Global Constraints + gates; docs → Task 13.
- **Placeholders:** some test bodies in Tasks 14–15 are named stubs with the behaviour spelled out in the comment. Each step says "write the stubs out fully in the same style", and the first test in each block is complete as the model. The Badge/StatusDot parity tests deliberately say "copy the old classes", because the exact strings must come from the code at that moment, not from this plan.
- **Type consistency:** `withSx(sx, className)`, `Sx`, `SurfaceProp`, `SURFACE_DATA`, `SURFACE_BG`, `TypographyProps`, `BaseProps`, `BasePropsWithColor` and `SxProp` are used with the same names in every task.
