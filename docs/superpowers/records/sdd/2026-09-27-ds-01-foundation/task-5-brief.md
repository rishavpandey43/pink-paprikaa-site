### Task 5: Library core — stylesheet, variant builder, test setup, reveal observer

**Files:**

- Replace: `packages/ui/src/styles.css`
- Create: `packages/ui/src/styles.spec.ts`, `packages/ui/src/lib/component-variants.ts`, `packages/ui/src/lib/component-variants.spec.ts`, `packages/ui/src/lib/reveal-observer.tsx`, `packages/ui/src/lib/reveal-observer.test.tsx`
- Modify: `packages/ui/vitest.setup.ts`, `packages/ui/vite.config.mts` (remove `passWithNoTests`), `packages/ui/package.json`, `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: Task 2 CSS variables; `@pink-paprikaa-web/design-tokens/{theme.css,surfaces.css}`.
- Produces: utilities `container-page`, `section-y`, `autogrid`, `autogrid-wide`, `cluster`, `scrim-bottom`, `scrim-top`, `duration-{instant,fast,base,slow,page}`, `z-{raised,sticky,header,dock,overlay,toast}`, `press-scale`, `lift`; animations `animate-{skeleton,mark-pulse,spin-pulse,dot-pulse,rotate,sheet-in,toast-pop}`; `componentVariants`, `type VariantProps`, `twMergeConfig` (internal, `src/lib/component-variants.ts`); `RevealObserver` (public); `expectNoA11yViolations(container, options?)` (test helper, `vitest.setup.ts`).

- [ ] **Step 1: Package manifest**

Run: `pnpm add @pink-paprikaa-web/utils --workspace --filter @pink-paprikaa-web/ui`
Then in `packages/ui/package.json` set:

```json
"exports": {
  ".": {
    "types": "./src/index.ts",
    "import": "./src/index.ts",
    "default": "./src/index.ts"
  },
  "./styles.css": "./src/styles.css",
  "./package.json": "./package.json"
},
"sideEffects": ["**/*.css"],
```

- [ ] **Step 2: Write the stylesheet**

`packages/ui/src/styles.css`:

```css
/*
 * @pink-paprikaa-web/ui — the single stylesheet a consumer imports, after Tailwind:
 *
 *   @import "tailwindcss";
 *   @import "@pink-paprikaa-web/ui/styles.css";
 *
 * It brings the tokens, the surface remaps, the base layer, the system's named utilities and its
 * animations, and it scans its own sources, so a consumer never adds an @source for the library.
 */
@import "@pink-paprikaa-web/design-tokens/theme.css";
/* In the base layer so a utility on the same element (text-text-muted) still wins over the
   surface's inherited colour. */
@import "@pink-paprikaa-web/design-tokens/surfaces.css" layer(base);

@source "./";

@theme {
  --animate-skeleton: pp-skeleton 1.2s var(--ease-in-out) infinite;
  --animate-mark-pulse: pp-mark-pulse 1.2s var(--ease-in-out) infinite;
  --animate-spin-pulse: pp-spin-pulse 1.2s var(--ease-in-out) infinite;
  --animate-dot-pulse: pp-dot-pulse 1.6s var(--ease-out) infinite;
  --animate-rotate: pp-rotate 1s linear infinite;
  --animate-sheet-in: pp-sheet-in var(--duration-base) var(--ease-out);
  --animate-toast-pop: pp-toast-pop var(--duration-slow) var(--ease-pop);
}

@layer base {
  html {
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }

  body {
    margin: 0;
    background-color: var(--color-surface-page);
    color: var(--color-text-body);
    font-family: var(--font-body);
    font-size: var(--text-body);
    line-height: var(--text-body--line-height);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0;
    font-family: var(--font-display);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-heading);
  }

  h1 {
    font-size: var(--text-h1);
    line-height: var(--text-h1--line-height);
    letter-spacing: var(--text-h1--letter-spacing);
  }

  h2 {
    font-size: var(--text-h2);
    line-height: var(--text-h2--line-height);
    letter-spacing: var(--text-h2--letter-spacing);
  }

  h3 {
    font-size: var(--text-h3);
    line-height: var(--text-h3--line-height);
    letter-spacing: var(--text-h3--letter-spacing);
  }

  h4 {
    font-size: var(--text-h4);
    line-height: var(--text-h4--line-height);
    letter-spacing: var(--text-h4--letter-spacing);
  }

  p {
    margin: 0 0 calc(var(--spacing) * 4);
    max-width: var(--container-prose);
    text-wrap: pretty;
  }

  a {
    color: var(--color-text-link);
    text-decoration-color: var(--color-pink-200);
    text-decoration-thickness: 1.5px;
    text-underline-offset: 3px;
    transition: color var(--duration-fast) var(--ease-out);
  }

  a:hover {
    color: var(--color-text-link-hover);
    text-decoration-color: currentColor;
  }

  :focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }

  /* Inline links get a soft corner on their focus outline; controls keep their own shape. */
  a:focus-visible {
    border-radius: var(--radius-xs);
  }

  img,
  svg,
  video {
    max-width: 100%;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    ::before,
    ::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* Section reveal (spec §3.2.4) — only ever applied by RevealObserver, below the fold. */
  [data-pp-reveal] {
    opacity: 0;
    transform: translateY(var(--motion-reveal-distance));
    transition:
      opacity var(--duration-slow) var(--ease-out),
      transform var(--duration-slow) var(--ease-out);
  }

  [data-pp-reveal][data-pp-revealed] {
    opacity: 1;
    transform: none;
  }

  @media (prefers-reduced-motion: reduce) {
    [data-pp-reveal] {
      transform: none;
    }
  }

  @media print {
    [data-pp-reveal] {
      opacity: 1;
      transform: none;
    }
  }
}

/* Named layout utilities — the design system's .pp-* classes. */
@utility container-page {
  width: 100%;
  max-width: var(--container-content);
  margin-inline: auto;
  padding-inline: var(--spacing-gutter);
}

@utility section-y {
  padding-block: var(--spacing-section);
}

@utility autogrid {
  display: grid;
  gap: var(--spacing-grid-gap);
  grid-template-columns: repeat(auto-fit, minmax(min(var(--spacing-card-min), 100%), 1fr));
}

@utility autogrid-wide {
  display: grid;
  gap: var(--spacing-grid-gap);
  grid-template-columns: repeat(auto-fit, minmax(min(var(--spacing-card-min-wide), 100%), 1fr));
}

@utility cluster {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--spacing) * 3);
}

@utility scrim-bottom {
  background-image: var(--effect-scrim-bottom);
}

@utility scrim-top {
  background-image: var(--effect-scrim-top);
}

/* Motion tokens as named utilities, so components never need an arbitrary value. */
@utility duration-instant {
  transition-duration: var(--duration-instant);
}

@utility duration-fast {
  transition-duration: var(--duration-fast);
}

@utility duration-base {
  transition-duration: var(--duration-base);
}

@utility duration-slow {
  transition-duration: var(--duration-slow);
}

@utility duration-page {
  transition-duration: var(--duration-page);
}

@utility press-scale {
  scale: var(--motion-press-scale);
}

@utility lift {
  translate: 0 var(--motion-lift-y);
}

@utility z-raised {
  z-index: var(--z-raised);
}

@utility z-sticky {
  z-index: var(--z-sticky);
}

@utility z-header {
  z-index: var(--z-header);
}

@utility z-dock {
  z-index: var(--z-dock);
}

@utility z-overlay {
  z-index: var(--z-overlay);
}

@utility z-toast {
  z-index: var(--z-toast);
}

/* The design system's seven animations. */
@keyframes pp-toast-pop {
  from {
    transform: translateY(12px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes pp-skeleton {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.55;
  }
}

@keyframes pp-spin-pulse {
  0%,
  100% {
    transform: rotate(45deg) scale(0.7);
    opacity: 0.25;
  }
  50% {
    transform: rotate(45deg) scale(1.15);
    opacity: 1;
  }
}

@keyframes pp-dot-pulse {
  0% {
    transform: rotate(45deg) scale(1);
    opacity: 0.6;
  }
  100% {
    transform: rotate(45deg) scale(2.4);
    opacity: 0;
  }
}

@keyframes pp-rotate {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pp-sheet-in {
  from {
    transform: translateY(24px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes pp-mark-pulse {
  0%,
  100% {
    transform: scale(0.72);
    opacity: 0.35;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
}
```

`packages/ui/src/styles.spec.ts`:

```ts
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SRC = new URL(".", import.meta.url).pathname;

function cssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return cssFiles(path);
    return entry.name.endsWith(".css") ? [path] : [];
  });
}

describe("library stylesheets", () => {
  it.each(cssFiles(SRC))("%s holds no literal colour — tokens only", (file) => {
    const css = readFileSync(file, "utf8");
    expect(css).not.toMatch(/#[\da-f]{3,8}\b/i);
    expect(css).not.toMatch(/\brgba?\(/i);
    expect(css).not.toMatch(/\bhsla?\(|\boklch\(/i);
  });
});
```

- [ ] **Step 3: Write the failing variant-builder spec**

`packages/ui/src/lib/component-variants.spec.ts`:

```ts
import { readFileSync } from "node:fs";

import { componentVariants, twMergeConfig } from "./component-variants";

interface CatalogueEntry {
  name: string;
  path: string[];
  tier: string;
  surface: string | null;
}

/** Read from disk so the package ships no token payload at runtime. */
const catalogue = JSON.parse(
  readFileSync(new URL("../../../design-tokens/dist/tokens.json", import.meta.url), "utf8")
) as CatalogueEntry[];
const stylesheet = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

function namesIn(namespace: string): string[] {
  return catalogue
    .filter((e) => e.surface === null && e.path[0] === namespace)
    .map((e) => e.path.slice(1).join("-"));
}

describe("twMergeConfig", () => {
  const theme = twMergeConfig.extend?.theme ?? {};

  it.each([
    "text",
    "font",
    "font-weight",
    "radius",
    "shadow",
    "blur",
    "ease",
    "container",
    "aspect",
    "breakpoint",
  ] as const)("declares every %s token the design-tokens build emits", (namespace) => {
    expect(new Set(theme[namespace] as string[])).toEqual(new Set(namesIn(namespace)));
  });

  it("declares every named spacing token (the 4px unit is Tailwind's multiplier, not a name)", () => {
    const named = namesIn("spacing").filter((name) => name !== "unit");
    expect(new Set(theme.spacing as string[])).toEqual(new Set(named));
  });

  it("declares every animation the stylesheet defines", () => {
    const animations = [...stylesheet.matchAll(/--animate-([a-z-]+):/g)].map((m) => m[1]);
    expect(new Set(theme.animate as string[])).toEqual(new Set(animations));
  });
});

describe("componentVariants", () => {
  it("keeps a font size and a text colour as separate decisions", () => {
    const heading = componentVariants({ base: "text-h1 text-text-muted" });
    expect(heading()).toBe("text-h1 text-text-muted");
  });

  it("lets a later font size replace an earlier one", () => {
    const size = componentVariants({
      base: "text-body",
      variants: { isLarge: { true: "text-h2" } },
    });
    expect(size({ isLarge: true })).toBe("text-h2");
  });

  it("lets a consumer className override a radius and a shadow", () => {
    const card = componentVariants({ base: "rounded-lg shadow-1" });
    expect(card({ className: "rounded-xl shadow-3" })).toBe("rounded-xl shadow-3");
  });

  it("treats a named spacing token like any other spacing value", () => {
    const row = componentVariants({ base: "px-4" });
    expect(row({ className: "px-gutter" })).toBe("px-gutter");
  });
});
```

- [ ] **Step 4: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./component-variants`.

- [ ] **Step 5: Implement the variant builder**

`packages/ui/src/lib/component-variants.ts`:

```ts
import { createTV, type TWMergeConfig } from "tailwind-variants";

/**
 * The design system's variant builder. Every component declares its classes through this — never
 * through the bare `tv` from tailwind-variants.
 *
 * tailwind-variants resolves conflicts with tailwind-merge, which classifies a class by its value.
 * The token names are not Tailwind's stock scales, so without these lists tailwind-merge guesses
 * wrong and silently deletes classes: `text-h1` would be read as a text *colour* and dropped next
 * to `text-text-muted`. `component-variants.spec.ts` asserts every list equals the token build
 * (and the stylesheet's animations), so a new token cannot be forgotten here.
 */
const TEXT = [
  "display-1",
  "display-2",
  "h1",
  "h2",
  "h3",
  "h4",
  "body-lg",
  "body",
  "body-sm",
  "caption",
  "overline",
  "mono",
  "display-1-fluid",
  "display-2-fluid",
  "h1-fluid",
  "h2-fluid",
  "h3-fluid",
  "h4-fluid",
  "body-fluid",
  "canvas-hero",
  "canvas-h1",
  "canvas-h2",
  "canvas-body",
  "canvas-caption",
  "canvas-overline",
];
const FONT = ["display", "body", "devanagari", "mono"];
const FONT_WEIGHT = ["regular", "medium", "semibold", "bold", "black"];
const RADIUS = ["xs", "sm", "md", "lg", "xl", "pill"];
const SHADOW = ["1", "2", "3", "4", "brand", "inset", "focus-ring", "focus-ring-inverse"];
const BLUR = ["glass"];
const EASE = ["out", "in-out", "entrance", "pop"];
const CONTAINER = ["content", "wide", "narrow", "article", "prose", "prose-narrow"];
const ASPECT = ["square", "4-3", "3-4", "4-5", "16-9", "16-10", "wide"];
const BREAKPOINT = ["sm", "md", "lg", "xl", "2xl"];
const SPACING = [
  "gutter",
  "gutter-mobile",
  "gutter-desktop",
  "section",
  "section-mobile",
  "section-desktop",
  "grid-gap",
  "header",
  "header-compact",
  "tabbar",
  "hit",
  "card-min",
  "card-min-wide",
  "dock-clearance",
];
const ANIMATE = [
  "skeleton",
  "mark-pulse",
  "spin-pulse",
  "dot-pulse",
  "rotate",
  "sheet-in",
  "toast-pop",
];

export const twMergeConfig: TWMergeConfig = {
  extend: {
    theme: {
      text: TEXT,
      font: FONT,
      "font-weight": FONT_WEIGHT,
      radius: RADIUS,
      shadow: SHADOW,
      blur: BLUR,
      ease: EASE,
      container: CONTAINER,
      aspect: ASPECT,
      breakpoint: BREAKPOINT,
      spacing: SPACING,
      animate: ANIMATE,
    },
  },
};

export const componentVariants = createTV({ twMergeConfig });

export type { VariantProps } from "tailwind-variants";
```

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8` → the variant spec PASSES (and the stylesheet spec). If a tailwind-merge assertion fails, read `packages/ui/node_modules/tailwind-merge/dist/types.d.ts` for the theme key names; do not loosen the test.

- [ ] **Step 6: Update the test setup**

Replace `packages/ui/vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import axeCore, { type RunOptions } from "axe-core";
import { expect } from "vitest";

/**
 * The accessibility assertion every component test ends with (handbook 08 §1).
 *
 * `color-contrast` is disabled: jsdom resolves no stylesheet, and contrast is owned by the token
 * contrast policy (`packages/design-tokens/contrast-pairs.json`, spec §5.4), which measures every
 * pair the components use. Every other axe rule fails the test.
 */
export async function expectNoA11yViolations(
  container: Element,
  options: RunOptions = {}
): Promise<void> {
  const { violations } = await axeCore.run(container, {
    ...options,
    rules: { "color-contrast": { enabled: false }, ...options.rules },
  });
  const detail = violations
    .map((violation) => {
      const nodes = violation.nodes.map((node) => `      ${node.html}`).join("\n");
      return `  [${violation.id}] ${violation.help}\n    ${violation.helpUrl}\n${nodes}`;
    })
    .join("\n\n");
  expect(violations, `accessibility violations:\n\n${detail}`).toHaveLength(0);
}

/* Browser APIs jsdom lacks. Tests that need to drive them replace these per test. */
class InertObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): [] {
    return [];
  }
}
globalThis.IntersectionObserver ??= InertObserver as unknown as typeof IntersectionObserver;
globalThis.ResizeObserver ??= InertObserver as unknown as typeof ResizeObserver;
window.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }) as MediaQueryList;
```

Remove the `passWithNoTests` line from `packages/ui/vite.config.mts`.

- [ ] **Step 7: Write the failing RevealObserver test**

`packages/ui/src/lib/reveal-observer.test.tsx`:

```tsx
import { render } from "@testing-library/react";

import { RevealObserver } from "./reveal-observer";

type Callback = (entries: Pick<IntersectionObserverEntry, "isIntersecting" | "target">[]) => void;

let callback: Callback = () => undefined;
const observed = new Set<Element>();

class ControlledObserver {
  constructor(cb: Callback) {
    callback = cb;
  }
  observe(el: Element): void {
    observed.add(el);
  }
  unobserve(el: Element): void {
    observed.delete(el);
  }
  disconnect(): void {
    observed.clear();
  }
}

function section(top: number): HTMLElement {
  const el = document.createElement("section");
  el.getBoundingClientRect = () => ({ top }) as DOMRect;
  document.body.append(el);
  return el;
}

beforeEach(() => {
  document.body.innerHTML = "";
  observed.clear();
  vi.stubGlobal("IntersectionObserver", ControlledObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("RevealObserver", () => {
  it("never hides a section that starts above the fold", () => {
    const above = section(0);
    render(<RevealObserver />);
    expect(above).not.toHaveAttribute("data-pp-reveal");
  });

  it("hides a section below the fold until it scrolls into view, then reveals it once", () => {
    const below = section(window.innerHeight + 200);
    render(<RevealObserver />);
    expect(below).toHaveAttribute("data-pp-reveal");
    callback([{ isIntersecting: true, target: below }]);
    expect(below).toHaveAttribute("data-pp-revealed");
    expect(observed.has(below)).toBe(false);
  });

  it("does nothing at all where IntersectionObserver is unavailable", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const below = section(window.innerHeight + 200);
    render(<RevealObserver />);
    expect(below).not.toHaveAttribute("data-pp-reveal");
  });

  it("stops observing when unmounted", () => {
    section(window.innerHeight + 200);
    const { unmount } = render(<RevealObserver />);
    unmount();
    expect(observed.size).toBe(0);
  });
});
```

- [ ] **Step 8: Run to verify it fails, then implement**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6` → FAIL (module not found).

`packages/ui/src/lib/reveal-observer.tsx`:

```tsx
"use client";

import { useEffect } from "react";

/** Reveal when a section is 8% into the viewport, as the handoff's motion does. */
const REVEAL_ROOT_MARGIN = "0px 0px -8% 0px";

export interface RevealObserverProps {
  /** Elements to reveal. Default: every `<section>`. */
  selector?: string;
}

/**
 * Fades and lifts sections into view once, as they scroll in (spec §3.2.4). Mount once near the
 * root. Sections already on screen are never touched, so there is no flash and no LCP cost; with
 * no IntersectionObserver nothing is hidden; reduced motion and print are handled in CSS.
 */
export function RevealObserver({ selector = "section" }: RevealObserverProps): null {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-pp-revealed", "");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: REVEAL_ROOT_MARGIN }
    );

    const tagNewSections = () => {
      for (const element of document.querySelectorAll(`${selector}:not([data-pp-seen])`)) {
        element.setAttribute("data-pp-seen", "");
        if (element.getBoundingClientRect().top < window.innerHeight) continue;
        element.setAttribute("data-pp-reveal", "");
        observer.observe(element);
      }
    };

    tagNewSections();
    const mutations = new MutationObserver(tagNewSections);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
    };
  }, [selector]);

  return null;
}
```

`packages/ui/src/index.ts`:

```ts
/**
 * Public surface of @pink-paprikaa-web/ui — the only barrel in the package. Named re-exports only.
 */
export { RevealObserver, type RevealObserverProps } from "./lib/reveal-observer";
```

- [ ] **Step 9: Gate and commit**

Run:

```bash
pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui --skip-nx-cache --outputStyle=static 2>&1 | tail -10
```

Expected: PASS.

```bash
git add -A packages/ui pnpm-lock.yaml
git commit -m "feat(ui): library core — stylesheet, variant builder, reveal observer

styles.css is the single consumer entry: tokens, surfaces in the base layer,
the design system's base rules, named utilities for motion and stacking (so
components never need arbitrary values), the seven animations and the
section-reveal motion adopted from the handoff.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

