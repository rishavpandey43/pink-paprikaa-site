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

