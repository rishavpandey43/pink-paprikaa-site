# Design System — Plan 1 of 5: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the August design-system port with the foundation of the rewrite — green baseline, the complete token system with its contrast policy gate, the library core, formatters, brand facts, brand artwork, the first two reference components (Icon, Logo) and Storybook wired to the consumer contract.

**Architecture:** DTCG JSON tokens → Style Dictionary 5 → `theme.css` (Tailwind v4 `@theme static`), `surfaces.css` (`data-surface` remaps) and a `tokens.json` catalogue. `packages/ui/src/styles.css` is the single consumer entry. Components use only named utilities (no arbitrary values), `componentVariants` (configured tailwind-variants), React 19 server-first function components.

**Tech Stack:** Nx 23 · pnpm 10 · TypeScript 6 · React 19.2 · Tailwind 4.3 · Style Dictionary 5.5 · tailwind-variants 3.3 / tailwind-merge 3.6 · lucide-react 1.30 · Zod 4 · Vitest 4 · Storybook 10.5 · svgo 4.

**Spec:** `docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md` (read §1–§8 before starting any task).

**Series:** Plan 1 Foundation (this) → Plan 2 Atoms + Layouts → Plan 3 Molecules → Plan 4 Organisms → Plan 5 Storybook foundations, kits, RHF pattern, docs, gauntlet. Each later plan is written against the code this one produces.

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
- Commits: Conventional Commits, author with `git commit -m` (commitlint runs in the `commit-msg` hook). Allowed scopes: `web blog storybook ui tokens content seo utils tools ci deps`. Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. **Never `--no-verify`**, never `eslint-disable` a LAW rule.
- Verify APIs against the **installed** package (`node_modules/<pkg>`), never memory.
- A task is done only when its gate command output is green and pasted in the report.

## Review Focus

1. **Money formatting edge cases** — negative (discount), fractional, zero, crore-scale and non-finite amounts must format as `−₹500`, `₹2,000`, `₹0`, `₹1,00,00,000` or throw — owned by Task 3.
2. **Nested surfaces** — a white card inside a pink panel inside an ink section must show dark text again; every token a dark/soft surface overrides must be restored by `light` to its exact base value — owned by Task 2.
3. **Two logos on one page** (header + footer) must not share SVG `id`s/`clip-path` references — owned by Task 7.
4. **A fresh consumer** (`@import "tailwindcss"; @import "@pink-paprikaa-web/ui/styles.css";`) must get tokens, surfaces, base styles and the library's classes with no `@source` of its own — owned by Task 8.
5. **Reveal motion never hides content**: sections above the fold, browsers without IntersectionObserver, and print must always show content — owned by Task 5.

---

## File map (this plan)

```
.prettierignore                                   M  ignore zip-files/
.prettierrc                                       M  tailwind plugin
.github/workflows/ci.yml                          M  chromium in verify
package.json                                      M  guard:founder covers storybook-static; prettier plugin devDep
apps/blog/package.json                            M  lint dependsOn build
apps/storybook/.storybook/{main.ts,preview.tsx,styles.css,fonts.ts}   M/C
apps/storybook/src/docs/introduction.mdx          C
apps/storybook/{package.json,tsconfig.storybook.json,vitest.config.mts}  M
packages/design-tokens/
  tokens/primitive/{color,typography,space,shape,elevation,motion,breakpoint,canvas,pattern,z-index}.json  C
  tokens/semantic/{color,shadow}.json             C
  tokens/surface/{brand,ink,soft,light}.json      C
  tokens/component/icon.json, logo.json           C (Task 7)
  contrast-pairs.json                             C
  sd.config.mjs                                   R
  src/{contrast.ts,contrast.spec.ts,contrast.fixtures.json,policy.spec.ts,theme.spec.ts}  C
  {tsconfig.json,tsconfig.lib.json,tsconfig.spec.json,vitest.config.mts,eslint.config.mjs}  C
  package.json, README.md                         M/R
packages/utils/src/{format-rupees.ts,format-rupees.spec.ts,index.ts}   C/R
packages/content/src/brand/{brand-schema.ts,brand-data.ts,brand.ts,brand-lines.ts,brand.spec.ts,brand-lines.spec.ts}, src/index.ts   C/R
packages/ui/
  src/styles.css, src/styles.spec.ts              C
  src/index.ts                                    C
  src/lib/{component-variants.ts,component-variants.spec.ts,reveal-observer.tsx,reveal-observer.test.tsx,brand-artwork.ts,brand-artwork.spec.ts}  C
  src/assets/brand/*.svg                          C (copied source artwork)
  scripts/build-brand-artwork.mjs                 C
  src/atoms/icon/{icon.tsx,brand-glyphs.tsx,icon.test.tsx,icon.stories.tsx}   C
  src/atoms/logo/{logo.tsx,logo.test.tsx,logo.stories.tsx}                    C
  vitest.setup.ts, vite.config.mts, eslint.config.mjs, package.json, AUTHORING.md   M/R
tools/eslint-config/{atomic-layering.js,base.js,react.js}   M
docs/engineering/{02,05,06,09}-*.md, docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md   M
```

---

### Task 1: Restore a green baseline and remove the August system

**Files:**

- Modify: `.prettierignore`, `.github/workflows/ci.yml`, `apps/blog/package.json`
- Delete: `packages/ui/src/**`, `packages/ui/AUTHORING.md`, `packages/ui/.babelrc`
- Create: `packages/ui/src/index.ts`, `packages/ui/src/styles.css`, `apps/storybook/src/docs/introduction.mdx`
- Modify: `packages/ui/vite.config.mts`, `apps/storybook/vitest.config.mts`, `apps/storybook/.storybook/main.ts`, `apps/storybook/tsconfig.storybook.json`

**Interfaces:**

- Produces: an empty `@pink-paprikaa-web/ui` (barrel `export {}`, stub `styles.css` importing `@pink-paprikaa-web/design-tokens/theme.css`); Storybook indexes `apps/storybook/src/**`.

- [ ] **Step 1: Prove the three current failures (evidence for the commit)**

Run:

```bash
pnpm nx format:check 2>&1 | tail -3
rm -rf apps/blog/.content-collections && pnpm nx lint @pink-paprikaa-web/blog --skip-nx-cache 2>&1 | tail -5
```

Expected: format:check lists files under `zip-files/` and exits 1; blog lint reports `@typescript-eslint/no-unsafe-*` errors in `apps/blog/src/app/page.tsx`.

- [ ] **Step 2: Ignore the reference material for Prettier**

Append to `.prettierignore`:

```
# Design handoff reference material (read-only input, never reformatted)
zip-files/
```

- [ ] **Step 3: Make blog lint run after the Content Collections generation**

In `apps/blog/package.json` → `"nx"` → `"targets"`, add alongside `build` and `serve`:

```json
"lint": {
  "dependsOn": ["build"]
}
```

(`next build` runs the Content Collections plugin, which writes `.content-collections/generated`; type-aware lint of `page.tsx` needs it.)

- [ ] **Step 4: Install Chromium in the CI verify job**

In `.github/workflows/ci.yml`, job `verify`, insert after the `nrwl/nx-set-shas@v4` step:

```yaml
# storybook:test runs stories in headless Chromium (addon-vitest browser mode).
- run: pnpm exec playwright install --with-deps chromium
```

Locally, run once: `pnpm exec playwright install chromium` (needs network; if the sandbox blocks it, rerun with the sandbox disabled).

- [ ] **Step 5: Remove the August design system**

```bash
git rm -r -q packages/ui/src packages/ui/AUTHORING.md packages/ui/.babelrc
mkdir -p packages/ui/src apps/storybook/src/docs
```

Create `packages/ui/src/index.ts`:

```ts
/**
 * Public surface of @pink-paprikaa-web/ui — the only barrel in the package.
 * Components are re-exported here, by name, as each one lands.
 */
export {};
```

Create `packages/ui/src/styles.css` (replaced in Task 5):

```css
/* Temporary entry — rebuilt by plan 1 task 5. */
@import "@pink-paprikaa-web/design-tokens/theme.css";
```

- [ ] **Step 6: Let the two test targets pass while they have no tests**

In `packages/ui/vite.config.mts`, inside `test: { … }` add:

```ts
    // Temporary: the package has no tests until plan 1 task 5 lands. Remove with that task.
    passWithNoTests: true,
```

In `apps/storybook/vitest.config.mts`, inside `test: { … }` add:

```ts
    // Temporary: no stories exist until plan 1 task 7 (Icon, Logo). Remove with that task.
    passWithNoTests: true,
```

- [ ] **Step 7: Index Storybook's own docs**

`apps/storybook/.storybook/main.ts` → `stories`:

```ts
  stories: [
    // Foundations, kits and docs owned by the Storybook app itself.
    "../src/**/*.mdx",
    "../src/**/*.stories.@(ts|tsx)",
    // Component stories live beside the components in the design system library.
    "../../../packages/ui/src/**/*.mdx",
    "../../../packages/ui/src/**/*.stories.@(js|jsx|ts|tsx)",
  ],
```

`apps/storybook/tsconfig.storybook.json` → `include` add `"src/**/*.ts"`, `"src/**/*.tsx"`.

Create `apps/storybook/src/docs/introduction.mdx`:

```mdx
import { Meta } from "@storybook/addon-docs/blocks";

<Meta title="Introduction" />

# Pink Paprikaa Design System

The production design system for pinkpaprikaa.com, rebuilt from the supplied design-system folder.
Foundations, components and reference kits are added group by group; see
`docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md`.
```

- [ ] **Step 8: Gate (cold)**

Run:

```bash
pnpm nx format:check && pnpm nx sync:check \
  && pnpm nx run-many -t typecheck lint test build --skip-nx-cache --outputStyle=static 2>&1 | tail -25
```

Expected: all tasks succeed (blog lint now builds first; ui/storybook tests pass with zero files; storybook builds with the MDX page).

- [ ] **Step 9: Commit (two commits)**

```bash
git add .prettierignore apps/blog/package.json .github/workflows/ci.yml
git commit -m "ci: restore a green baseline for the design system rewrite

Prettier ignores zip-files/ (reference material), blog lint depends on the
build that generates Content Collections types, and the verify job installs
Chromium for the Storybook browser tests.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git add -A packages/ui apps/storybook
git commit -m "chore(ui): remove the August design system port

The rewrite follows docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: The token system and its contrast policy gate

**Files:**

- Delete: `packages/design-tokens/tokens/*.json` (August files)
- Create: every file under `packages/design-tokens/tokens/{primitive,semantic,surface}/`, `packages/design-tokens/contrast-pairs.json`, `packages/design-tokens/src/{contrast.ts,contrast.spec.ts,contrast.fixtures.json,policy.spec.ts,theme.spec.ts}`, `packages/design-tokens/{tsconfig.json,tsconfig.lib.json,tsconfig.spec.json,vitest.config.mts,eslint.config.mjs}`, `packages/design-tokens/tokens/component/.gitkeep`
- Replace: `packages/design-tokens/sd.config.mjs`, `packages/design-tokens/README.md`
- Modify: `packages/design-tokens/package.json`

**Interfaces:**

- Produces (CSS custom properties, all later tasks use these names): `--color-pink-{50…800}`, `--color-ink-{000…900}`, `--color-{turmeric,tandoor,mint,kesar}(-soft)`, `--color-{mint,turmeric,kesar}-strong`, `--color-danger(-soft)`, `--color-veg`, `--color-white-alpha-{06,10,22,25,30,42,50,70,72,85,92}`, `--color-ink-alpha-56`; semantic `--color-surface-{page,page-alt,card,sunken,brand,brand-soft,inverse,overlay,glass}`, `--color-text-{body,heading,muted,subtle,brand,on-brand,on-inverse,link,link-hover,success,warning,danger,info}`, `--color-border-{subtle,default,strong,brand,brand-soft}`, `--color-brand-{hover,active}`, `--color-status-{success,warning,danger,info}(-soft)`, `--color-heat-{1..4}`, `--color-focus`; `--font-{display,body,devanagari,mono}`, `--font-weight-{regular,medium,semibold,bold,black}`, `--text-<step>` (+ `--line-height`, `--letter-spacing`, `--font-weight` sub-properties) for `display-1 display-2 h1 h2 h3 h4 body-lg body body-sm caption overline mono` and `-fluid` twins of `display-1 display-2 h1 h2 h3 h4 body`, `--text-canvas-{hero,h1,h2,body,caption,overline}`; `--spacing` (4px) and `--spacing-{gutter,gutter-mobile,gutter-desktop,section,section-mobile,section-desktop,grid-gap,header,header-compact,tabbar,hit,card-min,card-min-wide,dock-clearance}`; `--container-{content,wide,narrow,article,prose,prose-narrow}`; `--aspect-{square,4-3,3-4,4-5,16-9,16-10,wide}`; `--radius-{xs,sm,md,lg,xl,pill}`; `--border-width-{default,strong}`; `--shadow-{1,2,3,4,brand,inset,focus-ring,focus-ring-inverse}`; `--blur-glass`; `--effect-scrim-{bottom,top}`; `--duration-{instant,fast,base,slow,page}`; `--ease-{out,in-out,entrance,pop}`; `--motion-{press-scale,lift-y,reveal-distance}`; `--breakpoint-{sm,md,lg,xl,2xl}`; `--canvas-*`; `--pattern-opacity-{default,light,faint}`, `--pattern-tile-{56,64,72,80,86,96}`; `--z-{raised,sticky,header,dock,overlay,toast}`.
- Produces files: `dist/theme.css`, `dist/surfaces.css`, `dist/tokens.json` (array of `{ name, cssVar, path, value, reference, type, tier, surface, description }`); package exports `./theme.css`, `./surfaces.css`, `./tokens.json`, `./contrast` (`parseColor`, `composite`, `relativeLuminance`, `contrastRatio`, type `Rgba`).

- [ ] **Step 1: Package scaffolding (TS, lint, test)**

`packages/design-tokens/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "files": [],
  "include": [],
  "references": [{ "path": "./tsconfig.lib.json" }, { "path": "./tsconfig.spec.json" }]
}
```

`packages/design-tokens/tsconfig.lib.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "out-tsc/lib",
    "tsBuildInfoFile": "out-tsc/lib/tsconfig.lib.tsbuildinfo",
    "emitDeclarationOnly": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.spec.ts", "vitest.config.mts"]
}
```

`packages/design-tokens/tsconfig.spec.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./out-tsc/vitest",
    "types": ["vitest/globals", "vitest/importMeta", "vite/client", "node", "vitest"]
  },
  "include": ["vitest.config.mts", "src/**/*.spec.ts"],
  "references": [{ "path": "./tsconfig.lib.json" }]
}
```

`packages/design-tokens/vitest.config.mts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: "../../node_modules/.vite/packages/design-tokens",
  test: {
    name: "@pink-paprikaa-web/design-tokens",
    watch: false,
    globals: true,
    environment: "node",
    include: ["src/**/*.spec.ts"],
    reporters: ["default"],
  },
}));
```

`packages/design-tokens/eslint.config.mjs`:

```js
import baseConfig from "../../eslint.config.mjs";

export default [...baseConfig, { ignores: ["**/out-tsc", "dist"] }];
```

`packages/design-tokens/package.json` — replace `exports` and extend `nx.targets`:

```json
"exports": {
  "./theme.css": "./dist/theme.css",
  "./surfaces.css": "./dist/surfaces.css",
  "./tokens.json": "./dist/tokens.json",
  "./contrast": {
    "types": "./src/contrast.ts",
    "import": "./src/contrast.ts",
    "default": "./src/contrast.ts"
  }
},
```

and in `nx.targets`, keep `build` as is and add:

```json
"test": {
  "dependsOn": ["build"]
}
```

Run `pnpm nx sync` (adds the root `tsconfig.json` reference).

- [ ] **Step 2: Write the failing contrast unit tests**

`packages/design-tokens/src/contrast.fixtures.json`:

```json
{
  "ratios": [
    { "fg": "#FFFFFF", "bg": "#000000", "ratio": 21 },
    { "fg": "#FFFFFF", "bg": "#FFFFFF", "ratio": 1 },
    { "fg": "#FFF", "bg": "#EE2C68", "ratio": 4.04 },
    { "fg": "#6B5A62", "bg": "#FFFFFF", "ratio": 6.43 },
    { "fg": "#8F7F86", "bg": "#FFFFFF", "ratio": 3.79 },
    { "fg": "rgba(255, 255, 255, 0.92)", "bg": "#EE2C68", "ratio": 3.61 },
    { "fg": "#FFFFFF", "bg": "rgba(255, 255, 255, 0.1)", "backdrop": "#EE2C68", "ratio": 3.67 },
    { "fg": "#FFFFFFCC", "bg": "#1A1216", "ratio": 12.34 }
  ],
  "parsed": [
    { "input": "#EE2C68", "rgba": { "r": 238, "g": 44, "b": 104, "a": 1 } },
    { "input": "#fff", "rgba": { "r": 255, "g": 255, "b": 255, "a": 1 } },
    { "input": "#1A121680", "rgba": { "r": 26, "g": 18, "b": 22, "a": 0.5019607843137255 } },
    { "input": "rgba(26, 18, 22, 0.56)", "rgba": { "r": 26, "g": 18, "b": 22, "a": 0.56 } },
    { "input": "rgb(255,255,255)", "rgba": { "r": 255, "g": 255, "b": 255, "a": 1 } }
  ]
}
```

(`#FFFFFFCC` on ink-900: compute with the implementation and replace `12.34` with the real value to 2 decimals **only if** the unit test in Step 4 shows the fixture is the only failure — every other ratio above was measured independently.)

`packages/design-tokens/src/contrast.spec.ts`:

```ts
import { readFileSync } from "node:fs";

import { composite, contrastRatio, parseColor, type Rgba } from "./contrast.js";

interface Fixtures {
  ratios: { fg: string; bg: string; backdrop?: string; ratio: number }[];
  parsed: { input: string; rgba: Rgba }[];
}

const fixtures = JSON.parse(
  readFileSync(new URL("./contrast.fixtures.json", import.meta.url), "utf8")
) as Fixtures;

describe("parseColor", () => {
  it.each(fixtures.parsed)("reads $input", ({ input, rgba }) => {
    expect(parseColor(input)).toEqual(rgba);
  });

  it("rejects a colour it cannot measure instead of guessing", () => {
    expect(() => parseColor("pink")).toThrow(/unsupported colour "pink"/);
    expect(() => parseColor("var(--color-pink-500)")).toThrow(/unsupported colour/);
  });
});

describe("composite", () => {
  it("returns the bottom colour when the top is fully transparent", () => {
    const bottom: Rgba = { r: 10, g: 20, b: 30, a: 1 };
    expect(composite({ r: 255, g: 255, b: 255, a: 0 }, bottom)).toEqual(bottom);
  });
});

describe("contrastRatio", () => {
  it.each(fixtures.ratios)("$fg on $bg ≈ $ratio", ({ fg, bg, backdrop, ratio }) => {
    expect(contrastRatio(fg, bg, backdrop)).toBeCloseTo(ratio, 1);
  });

  it("is symmetric in foreground and background for opaque colours", () => {
    expect(contrastRatio("rgb(0, 0, 0)", "rgb(255, 255, 255)")).toBeCloseTo(
      contrastRatio("rgb(255, 255, 255)", "rgb(0, 0, 0)"),
      6
    );
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -15`
Expected: FAIL — `Cannot find module './contrast.js'` (the build step of `dependsOn` may also fail until Step 6; that is fine).

- [ ] **Step 4: Implement `contrast.ts`**

`packages/design-tokens/src/contrast.ts`:

```ts
/**
 * WCAG 2.x contrast maths for the token contrast policy (design system spec §5).
 *
 * Pure functions over CSS colour strings. Supports the forms the token files use: `#rgb`,
 * `#rrggbb`, `#rrggbbaa`, `rgb()` and `rgba()`. Anything else throws, so a token the policy
 * cannot measure fails loudly instead of being skipped.
 */
export interface Rgba {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
}

const HEX_PATTERN = /^#(?<hex>[\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i;
const RGB_PATTERN =
  /^rgba?\(\s*(?<r>[\d.]+)\s*,\s*(?<g>[\d.]+)\s*,\s*(?<b>[\d.]+)\s*(?:,\s*(?<a>[\d.]+)\s*)?\)$/i;
const OPAQUE_WHITE: Rgba = { r: 255, g: 255, b: 255, a: 1 };

export function parseColor(value: string): Rgba {
  const trimmed = value.trim();

  const hex = HEX_PATTERN.exec(trimmed)?.groups?.hex;
  if (hex !== undefined) {
    const full = hex.length === 3 ? [...hex].map((digit) => digit + digit).join("") : hex;
    const channel = (index: number) => Number.parseInt(full.slice(index, index + 2), 16);
    return {
      r: channel(0),
      g: channel(2),
      b: channel(4),
      a: full.length === 8 ? channel(6) / 255 : 1,
    };
  }

  const rgb = RGB_PATTERN.exec(trimmed)?.groups;
  if (rgb?.r !== undefined && rgb.g !== undefined && rgb.b !== undefined) {
    return {
      r: Number(rgb.r),
      g: Number(rgb.g),
      b: Number(rgb.b),
      a: rgb.a === undefined ? 1 : Number(rgb.a),
    };
  }

  throw new Error(
    `parseColor: unsupported colour "${value}" (expected #rgb, #rrggbb, #rrggbbaa, rgb() or rgba())`
  );
}

/** Source-over alpha compositing of `top` onto `bottom`. */
export function composite(top: Rgba, bottom: Rgba): Rgba {
  const alpha = top.a + bottom.a * (1 - top.a);
  if (alpha === 0) {
    return { r: 0, g: 0, b: 0, a: 0 };
  }
  const mix = (upper: number, lower: number) =>
    (upper * top.a + lower * bottom.a * (1 - top.a)) / alpha;
  return { r: mix(top.r, bottom.r), g: mix(top.g, bottom.g), b: mix(top.b, bottom.b), a: alpha };
}

export function relativeLuminance({ r, g, b }: Rgba): number {
  const linear = (channel: number) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/**
 * Contrast of `foreground` over `background`. A translucent background is first composited
 * over `backdrop` (default opaque white) — e.g. a card at 10% white on the brand pink.
 */
export function contrastRatio(foreground: string, background: string, backdrop?: string): number {
  const base =
    backdrop === undefined ? OPAQUE_WHITE : composite(parseColor(backdrop), OPAQUE_WHITE);
  const bg = composite(parseColor(background), base);
  const fg = composite(parseColor(foreground), bg);
  const a = relativeLuminance(fg);
  const b = relativeLuminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
```

- [ ] **Step 5: Write the token files**

Delete the August files: `git rm -q packages/design-tokens/tokens/*.json`. Create `packages/design-tokens/tokens/component/.gitkeep` (empty).

Every leaf is a DTCG token object `{ "$value": … }`; `$type` is set on the group. Values are CSS-ready strings (typography is the one composite).

`tokens/primitive/color.json`:

```json
{
  "color": {
    "$type": "color",
    "pink": {
      "50": { "$value": "#FFF5F8" },
      "100": { "$value": "#FFDBE8", "$description": "Light pink, given by the client." },
      "200": { "$value": "#FFB9CE" },
      "300": { "$value": "#FA8BAB" },
      "400": { "$value": "#F4568A" },
      "500": {
        "$value": "#EE2C68",
        "$description": "The brand pink, given by the client. The only place this hex exists."
      },
      "600": { "$value": "#D21E55" },
      "700": { "$value": "#AB1544" },
      "800": { "$value": "#7C0E30" }
    },
    "ink": {
      "000": { "$value": "#FFFFFF" },
      "100": { "$value": "#F7F3F4" },
      "200": { "$value": "#ECE6E8" },
      "300": { "$value": "#DCD3D7" },
      "400": { "$value": "#B8ABB1" },
      "500": { "$value": "#8F7F86" },
      "600": { "$value": "#6B5A62" },
      "700": { "$value": "#46373E" },
      "800": { "$value": "#2B1F25" },
      "900": { "$value": "#1A1216" }
    },
    "turmeric": { "$value": "#F2B233" },
    "turmeric-soft": { "$value": "#FDF1D6" },
    "turmeric-strong": {
      "$value": "#8A5C00",
      "$description": "Warning text; from the design-system components."
    },
    "tandoor": { "$value": "#E4572E" },
    "tandoor-soft": { "$value": "#FDEAE3" },
    "mint": { "$value": "#2FA37C" },
    "mint-soft": { "$value": "#E2F4ED" },
    "mint-strong": {
      "$value": "#186C51",
      "$description": "Success text; from the design-system components."
    },
    "kesar": { "$value": "#7A3EA8" },
    "kesar-soft": { "$value": "#F1E8F8" },
    "kesar-strong": {
      "$value": "#5A2A80",
      "$description": "Info text; from the design-system components."
    },
    "danger": { "$value": "#CF2222" },
    "danger-soft": { "$value": "#FCE9E9" },
    "veg": { "$value": "#1A7A3C", "$description": "The statutory vegetarian mark." },
    "white-alpha": {
      "06": { "$value": "rgba(255, 255, 255, 0.06)" },
      "10": { "$value": "rgba(255, 255, 255, 0.1)" },
      "22": { "$value": "rgba(255, 255, 255, 0.22)" },
      "25": { "$value": "rgba(255, 255, 255, 0.25)" },
      "30": { "$value": "rgba(255, 255, 255, 0.3)" },
      "42": { "$value": "rgba(255, 255, 255, 0.42)" },
      "50": { "$value": "rgba(255, 255, 255, 0.5)" },
      "70": { "$value": "rgba(255, 255, 255, 0.7)" },
      "72": { "$value": "rgba(255, 255, 255, 0.72)" },
      "85": { "$value": "rgba(255, 255, 255, 0.85)" },
      "92": { "$value": "rgba(255, 255, 255, 0.92)" }
    },
    "ink-alpha": {
      "56": { "$value": "rgba(26, 18, 22, 0.56)" }
    }
  }
}
```

`tokens/primitive/typography.json`:

```json
{
  "font": {
    "$type": "fontFamily",
    "display": {
      "$value": "var(--font-poppins, \"Poppins\"), \"Segoe UI\", system-ui, sans-serif"
    },
    "body": { "$value": "var(--font-dm-sans, \"DM Sans\"), \"Segoe UI\", system-ui, sans-serif" },
    "devanagari": { "$value": "var(--font-poppins, \"Poppins\"), \"Nirmala UI\", sans-serif" },
    "mono": { "$value": "var(--font-space-mono, \"Space Mono\"), ui-monospace, monospace" }
  },
  "font-weight": {
    "$type": "fontWeight",
    "regular": { "$value": 400 },
    "medium": { "$value": 500 },
    "semibold": { "$value": 600 },
    "bold": { "$value": 700 },
    "black": { "$value": 800 }
  },
  "text": {
    "$type": "typography",
    "display-1": {
      "$value": {
        "fontSize": "72px",
        "lineHeight": 1.02,
        "letterSpacing": "-0.03em",
        "fontWeight": "{font-weight.black}"
      }
    },
    "display-2": {
      "$value": {
        "fontSize": "56px",
        "lineHeight": 1.05,
        "letterSpacing": "-0.025em",
        "fontWeight": "{font-weight.black}"
      }
    },
    "h1": {
      "$value": {
        "fontSize": "40px",
        "lineHeight": 1.1,
        "letterSpacing": "-0.02em",
        "fontWeight": "{font-weight.bold}"
      }
    },
    "h2": {
      "$value": {
        "fontSize": "32px",
        "lineHeight": 1.15,
        "letterSpacing": "-0.015em",
        "fontWeight": "{font-weight.bold}"
      }
    },
    "h3": {
      "$value": {
        "fontSize": "25px",
        "lineHeight": 1.2,
        "letterSpacing": "-0.01em",
        "fontWeight": "{font-weight.bold}"
      }
    },
    "h4": {
      "$value": {
        "fontSize": "20px",
        "lineHeight": 1.3,
        "letterSpacing": "-0.005em",
        "fontWeight": "{font-weight.bold}"
      }
    },
    "body-lg": {
      "$value": { "fontSize": "18px", "lineHeight": 1.6, "fontWeight": "{font-weight.regular}" }
    },
    "body": {
      "$value": { "fontSize": "16px", "lineHeight": 1.6, "fontWeight": "{font-weight.regular}" }
    },
    "body-sm": {
      "$value": { "fontSize": "14px", "lineHeight": 1.55, "fontWeight": "{font-weight.regular}" }
    },
    "caption": {
      "$value": { "fontSize": "12.5px", "lineHeight": 1.45, "fontWeight": "{font-weight.regular}" }
    },
    "overline": {
      "$value": {
        "fontSize": "11.5px",
        "lineHeight": 1.2,
        "letterSpacing": "0.14em",
        "fontWeight": "{font-weight.bold}"
      }
    },
    "mono": {
      "$value": {
        "fontSize": "13px",
        "lineHeight": 1.5,
        "letterSpacing": "0.02em",
        "fontWeight": "{font-weight.regular}"
      }
    },
    "display-1-fluid": {
      "$value": {
        "fontSize": "clamp(40px, 7vw, 72px)",
        "lineHeight": 1.02,
        "letterSpacing": "-0.03em",
        "fontWeight": "{font-weight.black}"
      }
    },
    "display-2-fluid": {
      "$value": {
        "fontSize": "clamp(34px, 5.4vw, 56px)",
        "lineHeight": 1.05,
        "letterSpacing": "-0.025em",
        "fontWeight": "{font-weight.black}"
      }
    },
    "h1-fluid": {
      "$value": {
        "fontSize": "clamp(28px, 3.6vw, 40px)",
        "lineHeight": 1.1,
        "letterSpacing": "-0.02em",
        "fontWeight": "{font-weight.bold}"
      }
    },
    "h2-fluid": {
      "$value": {
        "fontSize": "clamp(24px, 2.8vw, 32px)",
        "lineHeight": 1.15,
        "letterSpacing": "-0.015em",
        "fontWeight": "{font-weight.bold}"
      }
    },
    "h3-fluid": {
      "$value": {
        "fontSize": "clamp(20px, 2.1vw, 25px)",
        "lineHeight": 1.2,
        "letterSpacing": "-0.01em",
        "fontWeight": "{font-weight.bold}"
      }
    },
    "h4-fluid": {
      "$value": {
        "fontSize": "clamp(17px, 1.6vw, 20px)",
        "lineHeight": 1.3,
        "letterSpacing": "-0.005em",
        "fontWeight": "{font-weight.bold}"
      }
    },
    "body-fluid": {
      "$value": {
        "fontSize": "clamp(15px, 1.1vw, 16px)",
        "lineHeight": 1.6,
        "fontWeight": "{font-weight.regular}"
      }
    },
    "canvas-hero": {
      "$value": { "fontSize": "132px" },
      "$description": "Marketing canvas type (1080px artboards) — never on screens."
    },
    "canvas-h1": { "$value": { "fontSize": "96px" } },
    "canvas-h2": { "$value": { "fontSize": "72px" } },
    "canvas-body": { "$value": { "fontSize": "34px" } },
    "canvas-caption": { "$value": { "fontSize": "26px" } },
    "canvas-overline": { "$value": { "fontSize": "24px" } }
  }
}
```

`tokens/primitive/space.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "unit": {
      "$value": "4px",
      "$description": "Tailwind's spacing multiplier (emitted as --spacing): p-6 = 24px, the design system's --space-6."
    },
    "gutter": { "$value": "clamp(16px, 4vw, 40px)", "$description": "Handoff value (spec C8)." },
    "gutter-mobile": { "$value": "16px" },
    "gutter-desktop": { "$value": "40px" },
    "section": { "$value": "clamp(48px, 8vw, 96px)", "$description": "Handoff value (spec C8)." },
    "section-mobile": { "$value": "48px" },
    "section-desktop": { "$value": "96px" },
    "grid-gap": { "$value": "clamp(16px, 2vw, 24px)" },
    "header": { "$value": "88px" },
    "header-compact": {
      "$value": "64px",
      "$description": "The handoff site header row (spec C1)."
    },
    "tabbar": { "$value": "64px" },
    "hit": { "$value": "44px", "$description": "Minimum touch target." },
    "card-min": { "$value": "260px" },
    "card-min-wide": { "$value": "320px" },
    "dock-clearance": {
      "$value": "84px",
      "$description": "Sticky bars sit this far above the viewport bottom so the mobile action dock never covers them."
    }
  },
  "container": {
    "$type": "dimension",
    "content": { "$value": "1200px" },
    "wide": { "$value": "1440px" },
    "narrow": { "$value": "960px" },
    "article": { "$value": "760px" },
    "prose": { "$value": "64ch" },
    "prose-narrow": { "$value": "44ch" }
  },
  "aspect": {
    "$type": "number",
    "square": { "$value": "1 / 1" },
    "4-3": { "$value": "4 / 3" },
    "3-4": { "$value": "3 / 4" },
    "4-5": { "$value": "4 / 5" },
    "16-9": { "$value": "16 / 9" },
    "16-10": { "$value": "16 / 10" },
    "wide": { "$value": "21 / 9" }
  }
}
```

`tokens/primitive/shape.json`:

```json
{
  "radius": {
    "$type": "dimension",
    "xs": { "$value": "4px" },
    "sm": { "$value": "6px" },
    "md": { "$value": "10px", "$description": "Inputs, thumbnails." },
    "lg": { "$value": "16px", "$description": "Cards." },
    "xl": { "$value": "24px", "$description": "Sheets, modals, feature cards." },
    "pill": { "$value": "999px", "$description": "Buttons, chips." }
  },
  "border-width": {
    "$type": "dimension",
    "default": { "$value": "1px" },
    "strong": { "$value": "2px" }
  }
}
```

`tokens/primitive/elevation.json`:

```json
{
  "shadow": {
    "$type": "shadow",
    "1": {
      "$value": "0 1px 2px rgba(43, 31, 37, 0.06), 0 1px 3px rgba(43, 31, 37, 0.05)",
      "$description": "Card at rest."
    },
    "2": {
      "$value": "0 4px 12px rgba(43, 31, 37, 0.08)",
      "$description": "Dropdowns, floating search, secondary buttons on pink."
    },
    "3": {
      "$value": "0 12px 32px -8px rgba(43, 31, 37, 0.16)",
      "$description": "Card hover, toasts, coupons, offer seals."
    },
    "4": {
      "$value": "0 24px 56px -16px rgba(43, 31, 37, 0.22)",
      "$description": "Modals, sheets, device frames, hero image."
    },
    "brand": {
      "$value": "0 8px 24px -6px rgba(238, 44, 104, 0.38)",
      "$description": "Primary CTA and the floating add button only."
    },
    "inset": { "$value": "inset 0 1px 0 rgba(255, 255, 255, 0.5)" }
  },
  "blur": {
    "$type": "dimension",
    "glass": { "$value": "14px" }
  },
  "effect": {
    "$type": "gradient",
    "scrim-bottom": {
      "$value": "linear-gradient(to top, rgba(26, 18, 22, 0.78) 0%, rgba(26, 18, 22, 0.32) 46%, rgba(26, 18, 22, 0) 100%)"
    },
    "scrim-top": {
      "$value": "linear-gradient(to bottom, rgba(26, 18, 22, 0.6) 0%, rgba(26, 18, 22, 0) 100%)"
    }
  }
}
```

`tokens/primitive/motion.json`:

```json
{
  "duration": {
    "$type": "duration",
    "instant": { "$value": "80ms" },
    "fast": { "$value": "140ms", "$description": "Hovers." },
    "base": { "$value": "220ms", "$description": "State changes." },
    "slow": { "$value": "340ms", "$description": "Sheets, page transitions, section reveal." },
    "page": { "$value": "480ms" }
  },
  "ease": {
    "$type": "cubicBezier",
    "out": { "$value": "cubic-bezier(0.2, 0.8, 0.2, 1)", "$description": "Anything entering." },
    "in-out": { "$value": "cubic-bezier(0.4, 0, 0.2, 1)", "$description": "Moves." },
    "entrance": { "$value": "cubic-bezier(0.16, 1, 0.3, 1)", "$description": "Sheets." },
    "pop": {
      "$value": "cubic-bezier(0.34, 1.4, 0.64, 1)",
      "$description": "One overshoot — add-to-cart and reward confirmations only."
    }
  },
  "motion": {
    "press-scale": { "$type": "number", "$value": 0.97 },
    "lift-y": { "$type": "dimension", "$value": "-2px" },
    "reveal-distance": { "$type": "dimension", "$value": "12px" }
  }
}
```

`tokens/primitive/breakpoint.json`:

```json
{
  "breakpoint": {
    "$type": "dimension",
    "sm": { "$value": "480px" },
    "md": { "$value": "768px" },
    "lg": { "$value": "1024px" },
    "xl": { "$value": "1280px" },
    "2xl": { "$value": "1440px" }
  }
}
```

`tokens/primitive/canvas.json`:

```json
{
  "canvas": {
    "$type": "dimension",
    "post": { "w": { "$value": "1080px" }, "h": { "$value": "1080px" } },
    "portrait": { "w": { "$value": "1080px" }, "h": { "$value": "1350px" } },
    "story": { "w": { "$value": "1080px" }, "h": { "$value": "1920px" } },
    "landscape": { "w": { "$value": "1200px" }, "h": { "$value": "628px" } },
    "wide": { "w": { "$value": "1920px" }, "h": { "$value": "1080px" } },
    "mpu": { "w": { "$value": "300px" }, "h": { "$value": "250px" } },
    "leaderboard": { "w": { "$value": "728px" }, "h": { "$value": "90px" } },
    "pad": { "$value": "72px" },
    "pad-tight": { "$value": "48px" },
    "story-safe-top": { "$value": "250px" },
    "story-safe-bottom": { "$value": "320px" }
  }
}
```

`tokens/primitive/pattern.json`:

```json
{
  "pattern": {
    "opacity": {
      "$type": "number",
      "default": { "$value": 0.08, "$description": "Brand and ink fields." },
      "light": { "$value": 0.09, "$description": "Soft and light fields." },
      "faint": { "$value": 0.04, "$description": "Handoff ink sections (spec C7)." }
    },
    "tile": {
      "$type": "dimension",
      "56": { "$value": "56px" },
      "64": { "$value": "64px" },
      "72": { "$value": "72px" },
      "80": { "$value": "80px" },
      "86": { "$value": "86px" },
      "96": { "$value": "96px", "$description": "1080px canvases." }
    }
  }
}
```

`tokens/primitive/z-index.json`:

```json
{
  "z": {
    "$type": "number",
    "raised": { "$value": 5 },
    "sticky": { "$value": 10 },
    "header": { "$value": 50 },
    "dock": { "$value": 60 },
    "overlay": { "$value": 70 },
    "toast": { "$value": 80 }
  }
}
```

`tokens/semantic/color.json`:

```json
{
  "color": {
    "$type": "color",
    "surface": {
      "page": { "$value": "{color.ink.000}" },
      "page-alt": { "$value": "{color.pink.50}" },
      "card": { "$value": "{color.ink.000}" },
      "sunken": { "$value": "{color.ink.100}" },
      "brand": { "$value": "{color.pink.500}" },
      "brand-soft": { "$value": "{color.pink.100}" },
      "inverse": { "$value": "{color.ink.900}" },
      "overlay": { "$value": "{color.ink-alpha.56}" },
      "glass": { "$value": "{color.white-alpha.72}" }
    },
    "text": {
      "body": { "$value": "{color.ink.800}" },
      "heading": { "$value": "{color.ink.900}" },
      "muted": { "$value": "{color.ink.600}" },
      "subtle": {
        "$value": "{color.ink.600}",
        "$description": "Design system ink-500 measures 3.79:1 on white; the handoff moved it to ink-600 (spec §3.2)."
      },
      "brand": {
        "$value": "{color.pink.600}",
        "$description": "pink-500 text measures 4.04:1; pink-600 passes AA (spec §5.3)."
      },
      "on-brand": { "$value": "{color.ink.000}" },
      "on-inverse": { "$value": "{color.ink.000}" },
      "link": { "$value": "{color.pink.600}" },
      "link-hover": { "$value": "{color.pink.700}" },
      "success": { "$value": "{color.mint-strong}" },
      "warning": { "$value": "{color.turmeric-strong}" },
      "danger": { "$value": "{color.danger}" },
      "info": { "$value": "{color.kesar-strong}" }
    },
    "border": {
      "subtle": { "$value": "{color.ink.200}" },
      "default": { "$value": "{color.ink.300}" },
      "strong": { "$value": "{color.ink.900}" },
      "brand": { "$value": "{color.pink.500}" },
      "brand-soft": { "$value": "{color.pink.200}" }
    },
    "brand": {
      "hover": { "$value": "{color.pink.600}" },
      "active": { "$value": "{color.pink.700}" }
    },
    "status": {
      "success": { "$value": "{color.mint}" },
      "success-soft": { "$value": "{color.mint-soft}" },
      "warning": { "$value": "{color.turmeric}" },
      "warning-soft": { "$value": "{color.turmeric-soft}" },
      "danger": { "$value": "{color.danger}" },
      "danger-soft": { "$value": "{color.danger-soft}" },
      "info": { "$value": "{color.kesar}" },
      "info-soft": { "$value": "{color.kesar-soft}" }
    },
    "heat": {
      "1": { "$value": "{color.mint}" },
      "2": { "$value": "{color.turmeric}" },
      "3": { "$value": "{color.tandoor}" },
      "4": { "$value": "{color.pink.600}" }
    },
    "focus": {
      "$value": "{color.pink.500}",
      "$description": "Focus outline colour; white on dark surfaces."
    }
  }
}
```

`tokens/semantic/shadow.json`:

```json
{
  "shadow": {
    "$type": "shadow",
    "focus-ring": { "$value": "0 0 0 3px {color.pink.200}" },
    "focus-ring-inverse": { "$value": "0 0 0 3px {color.white-alpha.50}" }
  }
}
```

`tokens/surface/brand.json`:

```json
{
  "surface-brand": {
    "color": {
      "$type": "color",
      "text": {
        "heading": { "$value": "{color.ink.000}" },
        "body": { "$value": "{color.ink.000}" },
        "muted": { "$value": "{color.white-alpha.92}" },
        "subtle": { "$value": "{color.white-alpha.85}" },
        "brand": { "$value": "{color.ink.000}" },
        "link": { "$value": "{color.ink.000}" },
        "link-hover": { "$value": "{color.ink.000}" }
      },
      "border": {
        "subtle": { "$value": "{color.white-alpha.22}" },
        "default": { "$value": "{color.white-alpha.42}" },
        "strong": { "$value": "{color.ink.000}" }
      },
      "surface": { "card": { "$value": "{color.white-alpha.10}" } },
      "focus": { "$value": "{color.ink.000}" }
    },
    "shadow": { "$type": "shadow", "focus-ring": { "$value": "{shadow.focus-ring-inverse}" } }
  }
}
```

`tokens/surface/ink.json`:

```json
{
  "surface-ink": {
    "color": {
      "$type": "color",
      "text": {
        "heading": { "$value": "{color.ink.000}" },
        "body": { "$value": "{color.ink.000}" },
        "muted": { "$value": "{color.white-alpha.92}" },
        "subtle": { "$value": "{color.white-alpha.85}" },
        "brand": { "$value": "{color.pink.300}" },
        "link": { "$value": "{color.ink.000}" },
        "link-hover": { "$value": "{color.ink.000}" }
      },
      "border": {
        "subtle": { "$value": "{color.white-alpha.22}" },
        "default": { "$value": "{color.white-alpha.42}" },
        "strong": { "$value": "{color.ink.000}" }
      },
      "surface": { "card": { "$value": "{color.white-alpha.06}" } },
      "focus": { "$value": "{color.ink.000}" }
    },
    "shadow": { "$type": "shadow", "focus-ring": { "$value": "{shadow.focus-ring-inverse}" } }
  }
}
```

`tokens/surface/soft.json`:

```json
{
  "surface-soft": {
    "color": {
      "$type": "color",
      "text": {
        "heading": { "$value": "{color.pink.800}" },
        "brand": {
          "$value": "{color.pink.700}",
          "$description": "pink-600 on pink-100 measures 4.08:1 (spec §5.3)."
        },
        "link": { "$value": "{color.pink.700}" },
        "link-hover": { "$value": "{color.pink.800}" }
      },
      "border": {
        "subtle": { "$value": "{color.pink.200}" },
        "default": { "$value": "{color.pink.300}" }
      }
    }
  }
}
```

`tokens/surface/light.json` (restores every token the other surfaces override — the "light island"):

```json
{
  "surface-light": {
    "color": {
      "$type": "color",
      "text": {
        "heading": { "$value": "{color.ink.900}" },
        "body": { "$value": "{color.ink.800}" },
        "muted": { "$value": "{color.ink.600}" },
        "subtle": { "$value": "{color.ink.600}" },
        "brand": { "$value": "{color.pink.600}" },
        "link": { "$value": "{color.pink.600}" },
        "link-hover": { "$value": "{color.pink.700}" }
      },
      "border": {
        "subtle": { "$value": "{color.ink.200}" },
        "default": { "$value": "{color.ink.300}" },
        "strong": { "$value": "{color.ink.900}" }
      },
      "surface": { "card": { "$value": "{color.ink.000}" } },
      "focus": { "$value": "{color.pink.500}" }
    },
    "shadow": { "$type": "shadow", "focus-ring": { "$value": "0 0 0 3px {color.pink.200}" } }
  }
}
```

- [ ] **Step 6: Replace `sd.config.mjs`**

```js
import StyleDictionary from "style-dictionary";

/**
 * Tailwind v4 theme namespaces this package owns. Each is cleared (`--<ns>-*: initial`) before the
 * tokens are emitted, so a stock Tailwind class outside the system (`rounded-lg` at Tailwind's
 * 8px, `bg-red-500`, `shadow-md`, `max-w-sm`) compiles to nothing instead of rendering a near-miss.
 * `spacing` is not cleared: its multiplier is set to the system's 4px unit, so `p-6` = 24px.
 */
const OWNED_NAMESPACES = [
  "color",
  "font",
  "font-weight",
  "text",
  "leading",
  "tracking",
  "radius",
  "shadow",
  "inset-shadow",
  "drop-shadow",
  "text-shadow",
  "blur",
  "ease",
  "animate",
  "breakpoint",
  "container",
  "aspect",
  "perspective",
];

/** Token paths whose CSS name is not simply the path joined with `-`. */
const NAME_OVERRIDES = new Map([["spacing-unit", "spacing"]]);

const SURFACE_SELECTORS = {
  brand: '[data-surface="brand"], .pp-on-brand',
  ink: '[data-surface="ink"], .pp-on-ink',
  soft: '[data-surface="soft"], .pp-on-soft',
  light: '[data-surface="light"], .pp-on-light',
};

const HEADER =
  "/* Generated by Style Dictionary from packages/design-tokens/tokens — do not edit. */\n";
const SURFACE_ROOT = /^surface-(brand|ink|soft|light)$/;
const ALIAS = /^\{([^}]+)\}$/;
const TIER = /[\\/]tokens[\\/](primitive|semantic|component|surface)[\\/]/;

const surfaceOf = (token) => SURFACE_ROOT.exec(token.path[0])?.[1] ?? null;
const localPath = (token) => (surfaceOf(token) === null ? token.path : token.path.slice(1));
const cssName = (path) => {
  const joined = path.join("-");
  return NAME_OVERRIDES.get(joined) ?? joined;
};
const referenceOf = (token) => {
  const original = token.original.$value;
  return typeof original === "string" ? (ALIAS.exec(original)?.[1] ?? null) : null;
};

/** CSS declarations for one token. Pure aliases stay `var()` references so surfaces can retarget them. */
function declarations(token) {
  const name = cssName(localPath(token));
  const reference = referenceOf(token);
  if (reference !== null) {
    return [`--${name}: var(--${cssName(reference.split("."))});`];
  }
  if (token.$type === "typography") {
    const { fontSize, lineHeight, letterSpacing, fontWeight } = token.$value;
    return [
      `--${name}: ${fontSize};`,
      ...(lineHeight === undefined ? [] : [`--${name}--line-height: ${lineHeight};`]),
      ...(letterSpacing === undefined ? [] : [`--${name}--letter-spacing: ${letterSpacing};`]),
      ...(fontWeight === undefined ? [] : [`--${name}--font-weight: ${fontWeight};`]),
    ];
  }
  return [`--${name}: ${token.$value};`];
}

const indent = (lines) => lines.map((line) => `  ${line}`).join("\n");

StyleDictionary.registerFormat({
  name: "pp/tailwind-theme",
  // `static`: Tailwind v4 otherwise drops theme variables no scanned class references, which
  // would delete tokens consumed only through `var()` (surfaces, component CSS, docs pages).
  format: ({ dictionary }) => {
    const resets = OWNED_NAMESPACES.map((ns) => `--${ns}-*: initial;`);
    const lines = dictionary.allTokens.filter((t) => surfaceOf(t) === null).flatMap(declarations);
    return `${HEADER}@theme static {\n${indent(resets)}\n\n${indent(lines)}\n}\n`;
  },
});

StyleDictionary.registerFormat({
  name: "pp/surfaces",
  format: ({ dictionary }) => {
    const blocks = Object.entries(SURFACE_SELECTORS).map(([surface, selector]) => {
      const lines = dictionary.allTokens
        .filter((t) => surfaceOf(t) === surface)
        .flatMap(declarations);
      return `${selector} {\n${indent([...lines, "color: var(--color-text-body);"])}\n}`;
    });
    return `${HEADER}${blocks.join("\n\n")}\n`;
  },
});

StyleDictionary.registerFormat({
  name: "pp/catalogue",
  format: ({ dictionary }) =>
    `${JSON.stringify(
      dictionary.allTokens.map((token) => {
        const name = cssName(localPath(token));
        return {
          name,
          cssVar: `--${name}`,
          path: localPath(token),
          value: token.$value,
          reference: referenceOf(token),
          type: token.$type ?? null,
          tier: TIER.exec(token.filePath)?.[1] ?? "unknown",
          surface: surfaceOf(token),
          description: token.$description ?? "",
        };
      }),
      null,
      2
    )}\n`,
});

export default {
  source: ["tokens/**/*.json"],
  platforms: {
    css: {
      // `attribute/cti` + `name/kebab` only: the built-in css/js transform groups pipe colours
      // through tinycolor2, which rewrites hex case and mutates `$value`. Names come from `path`.
      transforms: ["attribute/cti", "name/kebab"],
      buildPath: "dist/",
      files: [
        { destination: "theme.css", format: "pp/tailwind-theme" },
        { destination: "surfaces.css", format: "pp/surfaces" },
        { destination: "tokens.json", format: "pp/catalogue" },
      ],
    },
  },
};
```

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && head -30 packages/design-tokens/dist/theme.css && cat packages/design-tokens/dist/surfaces.css | head -30`
Expected: `@theme static {` then 18 `initial` resets, `--color-pink-500: #EE2C68;`, `--color-text-body: var(--color-ink-800);`, `--text-h1: 40px;` with its three sub-properties, `--spacing: 4px;`; surfaces.css has four selector blocks each ending `color: var(--color-text-body);`. If SD warns about token collisions or unknown tokens, fix the JSON (every leaf must be `{ "$value": … }`).

- [ ] **Step 7: Write the output and policy tests**

`packages/design-tokens/contrast-pairs.json`:

```json
{
  "$comment": "Contrast policy — design system spec §5. Every semantic text/background pair the components use. min 4.5 = WCAG AA. min 3 is allowed only with exception \"brand-fill\" (white on the brand pink, spec D3).",
  "groups": [
    {
      "id": "light-text",
      "surface": null,
      "foregrounds": [
        "color-text-heading",
        "color-text-body",
        "color-text-muted",
        "color-text-subtle",
        "color-text-brand",
        "color-text-link",
        "color-text-link-hover",
        "color-text-success",
        "color-text-warning",
        "color-text-danger",
        "color-text-info"
      ],
      "backgrounds": [
        "color-surface-page",
        "color-surface-page-alt",
        "color-surface-sunken",
        "color-surface-card"
      ],
      "min": 4.5
    },
    {
      "id": "status-on-soft",
      "surface": null,
      "pairs": [
        ["color-text-success", "color-status-success-soft"],
        ["color-text-warning", "color-status-warning-soft"],
        ["color-text-danger", "color-status-danger-soft"],
        ["color-text-info", "color-status-info-soft"]
      ],
      "min": 4.5
    },
    {
      "id": "soft-surface",
      "surface": "soft",
      "foregrounds": [
        "color-text-heading",
        "color-text-body",
        "color-text-muted",
        "color-text-subtle",
        "color-text-brand",
        "color-text-link",
        "color-text-link-hover"
      ],
      "backgrounds": ["color-surface-brand-soft"],
      "min": 4.5
    },
    {
      "id": "ink-surface",
      "surface": "ink",
      "foregrounds": [
        "color-text-heading",
        "color-text-body",
        "color-text-muted",
        "color-text-subtle",
        "color-text-brand",
        "color-text-link",
        "color-text-link-hover"
      ],
      "backgrounds": ["color-surface-inverse"],
      "min": 4.5
    },
    {
      "id": "ink-card",
      "surface": "ink",
      "foregrounds": [
        "color-text-heading",
        "color-text-body",
        "color-text-muted",
        "color-text-subtle",
        "color-text-brand",
        "color-text-link",
        "color-text-link-hover"
      ],
      "backgrounds": ["color-surface-card"],
      "backdrop": "color-surface-inverse",
      "min": 4.5
    },
    {
      "id": "brand-surface",
      "surface": "brand",
      "foregrounds": [
        "color-text-heading",
        "color-text-body",
        "color-text-muted",
        "color-text-subtle",
        "color-text-brand",
        "color-text-link",
        "color-text-link-hover"
      ],
      "backgrounds": ["color-surface-brand"],
      "min": 3,
      "exception": "brand-fill"
    },
    {
      "id": "brand-card",
      "surface": "brand",
      "foregrounds": [
        "color-text-heading",
        "color-text-body",
        "color-text-muted",
        "color-text-subtle",
        "color-text-brand",
        "color-text-link",
        "color-text-link-hover"
      ],
      "backgrounds": ["color-surface-card"],
      "backdrop": "color-surface-brand",
      "min": 3,
      "exception": "brand-fill"
    },
    {
      "id": "on-inverse",
      "surface": null,
      "pairs": [["color-text-on-inverse", "color-surface-inverse"]],
      "min": 4.5
    },
    {
      "id": "on-brand-fill",
      "surface": null,
      "pairs": [["color-text-on-brand", "color-surface-brand"]],
      "min": 3,
      "exception": "brand-fill"
    }
  ]
}
```

`packages/design-tokens/src/policy.spec.ts`:

```ts
import { readFileSync } from "node:fs";

import { contrastRatio } from "./contrast.js";

interface CatalogueEntry {
  name: string;
  value: unknown;
  surface: string | null;
}

interface PolicyGroup {
  id: string;
  surface: string | null;
  foregrounds?: string[];
  backgrounds?: string[];
  pairs?: [string, string][];
  backdrop?: string;
  min: number;
  exception?: "brand-fill";
}

const readJson = <T>(relative: string): T =>
  JSON.parse(readFileSync(new URL(relative, import.meta.url), "utf8")) as T;

const catalogue = readJson<CatalogueEntry[]>("../dist/tokens.json");
const { groups } = readJson<{ groups: PolicyGroup[] }>("../contrast-pairs.json");

/** A token's value on a surface: the surface override if one exists, else the base token. */
function resolve(name: string, surface: string | null): string {
  const override =
    surface === null ? undefined : catalogue.find((e) => e.surface === surface && e.name === name);
  const entry = override ?? catalogue.find((e) => e.surface === null && e.name === name);
  if (entry === undefined || typeof entry.value !== "string") {
    throw new Error(`contrast policy: no colour token "${name}"${surface ? ` on ${surface}` : ""}`);
  }
  return entry.value;
}

function pairsOf(group: PolicyGroup): [string, string][] {
  if (group.pairs) return group.pairs;
  const backgrounds = group.backgrounds ?? [];
  return (group.foregrounds ?? []).flatMap((fg) =>
    backgrounds.map((bg): [string, string] => [fg, bg])
  );
}

describe.each(groups)("contrast group $id", (group) => {
  it.each(pairsOf(group))("%s on %s meets the group minimum", (fg, bg) => {
    const backdrop =
      group.backdrop === undefined ? undefined : resolve(group.backdrop, group.surface);
    const ratio = contrastRatio(resolve(fg, group.surface), resolve(bg, group.surface), backdrop);
    expect(
      ratio,
      `${fg} on ${bg} (${group.surface ?? "light"}) = ${ratio.toFixed(2)}:1`
    ).toBeGreaterThanOrEqual(group.min);
  });
});

describe("contrast policy", () => {
  it("allows a ratio below AA only for the brand-fill exception, and never below the AA-large floor", () => {
    const loose = groups.filter((g) => g.min < 4.5);
    expect(loose.every((g) => g.exception === "brand-fill" && g.min === 3)).toBe(true);
  });

  it("uses the brand-fill exception only over the brand pink", () => {
    const brandPink = resolve("color-surface-brand", null);
    for (const group of groups.filter((g) => g.exception === "brand-fill")) {
      for (const [, bg] of pairsOf(group)) {
        const ground =
          group.backdrop === undefined
            ? resolve(bg, group.surface)
            : resolve(group.backdrop, group.surface);
        expect(ground, `${group.id}: exception ground`).toBe(brandPink);
      }
    }
  });
});
```

`packages/design-tokens/src/theme.spec.ts`:

```ts
import { readFileSync } from "node:fs";

interface CatalogueEntry {
  name: string;
  path: string[];
  value: unknown;
  tier: string;
  surface: string | null;
}

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8");
const theme = read("../dist/theme.css");
const surfaces = read("../dist/surfaces.css");
const catalogue = JSON.parse(read("../dist/tokens.json")) as CatalogueEntry[];
const primitiveColors = JSON.parse(read("../tokens/primitive/color.json")) as {
  color: { pink: Record<string, { $value: string }> };
};
const brandPink = primitiveColors.color.pink["500"]?.$value ?? "";

describe("theme.css", () => {
  it.each([
    "color",
    "font",
    "font-weight",
    "text",
    "leading",
    "tracking",
    "radius",
    "shadow",
    "inset-shadow",
    "drop-shadow",
    "text-shadow",
    "blur",
    "ease",
    "animate",
    "breakpoint",
    "container",
    "aspect",
    "perspective",
  ])("clears Tailwind's stock %s namespace", (namespace) => {
    expect(theme).toContain(`--${namespace}-*: initial;`);
  });

  it("emits the brand pink exactly as authored", () => {
    expect(theme).toContain(`--color-pink-500: ${brandPink};`);
  });

  it("keeps semantic tokens as references so surfaces can retarget them", () => {
    expect(theme).toContain("--color-text-body: var(--color-ink-800);");
    expect(theme).toContain("--color-surface-brand: var(--color-pink-500);");
  });

  it("expands a typography token into Tailwind's font-size sub-properties", () => {
    expect(theme).toContain("--text-h1: 40px;");
    expect(theme).toContain("--text-h1--line-height: 1.1;");
    expect(theme).toContain("--text-h1--letter-spacing: -0.02em;");
    expect(theme).toContain("--text-h1--font-weight: 700;");
  });

  it("sets Tailwind's spacing multiplier to the 4px unit", () => {
    expect(theme).toContain("--spacing: 4px;");
    expect(theme).not.toContain("--spacing-unit");
  });

  it("never leaks surface overrides into the theme", () => {
    expect(theme).not.toMatch(/--surface-(brand|ink|soft|light)-/);
  });
});

describe("surfaces.css", () => {
  it.each(["brand", "ink", "soft", "light"])(
    "scopes the %s surface to the attribute and the class",
    (surface) => {
      expect(surfaces).toContain(`[data-surface="${surface}"], .pp-on-${surface} {`);
    }
  );

  it("paints inherited text in each surface's body colour", () => {
    expect(surfaces.match(/color: var\(--color-text-body\);/g)).toHaveLength(4);
  });
});

describe("tokens.json", () => {
  it("catalogues every token with a name, a CSS variable and a tier", () => {
    expect(catalogue.length).toBeGreaterThan(200);
    for (const entry of catalogue) {
      expect(entry.name).toMatch(/^[a-z0-9-]+$/);
      expect(["primitive", "semantic", "component", "surface"]).toContain(entry.tier);
    }
  });

  it("restores, on a light island, every token another surface overrides — to its exact base value", () => {
    const base = new Map(catalogue.filter((e) => e.surface === null).map((e) => [e.name, e.value]));
    const light = new Map(
      catalogue.filter((e) => e.surface === "light").map((e) => [e.name, e.value])
    );
    const overridden = new Set(
      catalogue.filter((e) => e.surface !== null && e.surface !== "light").map((e) => e.name)
    );
    for (const name of overridden) {
      expect(light.has(name), `light surface restores ${name}`).toBe(true);
      expect(light.get(name), `light ${name} equals base`).toEqual(base.get(name));
    }
  });

  it("holds the brand hex in exactly one token", () => {
    const hex = brandPink.toLowerCase();
    const holders = catalogue.filter(
      (e) => e.tier === "primitive" && typeof e.value === "string" && e.value.toLowerCase() === hex
    );
    expect(holders.map((e) => e.name)).toEqual(["color-pink-500"]);
  });
});
```

- [ ] **Step 8: Run all token tests**

Run: `pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -20`
Expected: PASS (contrast, policy, theme suites). If a policy pair fails, **change the text token, never a fill** (spec D3), and record the new ratio in the commit body.

- [ ] **Step 9: Probe the policy gate**

Temporarily set `tokens/semantic/color.json` → `color.text.muted` to `{color.ink.400}`; run the test; expect FAIL with a message like `color-text-muted on color-surface-page (light) = 2.2…:1`. Revert (`git checkout packages/design-tokens/tokens/semantic/color.json`), rerun, expect PASS. Paste both outputs in the report.

- [ ] **Step 10: Rewrite `packages/design-tokens/README.md`**

Sections (prose, keep it under ~120 lines): purpose and the one-hex rule; the four tiers and folders (`primitive`, `semantic`, `component`, `surface`); outputs (`theme.css`, `surfaces.css`, `tokens.json`) and how each is consumed; the name mapping rule (path joined by `-`, `spacing.unit` → `--spacing`, typography composite → `--text-*` + sub-properties) with the table from spec §6.3; surfaces (`data-surface` + `.pp-on-*`, the light island, why only semantic/component tokens are overridden); the contrast policy (`contrast-pairs.json`, the brand-fill exception, how to add a pair); build/test commands; the "change text tokens, never fills" rule.

- [ ] **Step 11: Gate and commit**

Run:

```bash
pnpm nx run-many -t typecheck lint test build -p @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static 2>&1 | tail -12
pnpm nx format:check && pnpm nx sync:check
```

Expected: green.

```bash
git add -A packages/design-tokens tsconfig.json
git commit -m "feat(tokens): rebuild the token system from the design system folder

Primitive, semantic, surface and component tiers in DTCG, emitted as a
Tailwind v4 @theme block, surface remaps and a token catalogue. Names mirror
the design system so a designer's token finds its class without a lookup.

Adds the contrast policy gate: every text/background pair the components use
is measured on build; white on the brand pink is the single exception, held
at the AA-large floor. Text tokens that failed AA moved to passing ramp
steps; no fill changed.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Rupee and count formatting in `packages/utils`

**Files:**

- Delete: `packages/utils/src/lib/utils.ts`, `packages/utils/src/lib/utils.spec.ts`
- Create: `packages/utils/src/format-rupees.ts`, `packages/utils/src/format-rupees.spec.ts`
- Replace: `packages/utils/src/index.ts`

**Interfaces:**

- Produces: `formatRupees(amount: number): string`, `formatRupeeRange(from: number, to: number): string`, `formatCount(value: number): string` from `@pink-paprikaa-web/utils`.

- [ ] **Step 1: Write the failing tests**

`packages/utils/src/format-rupees.spec.ts`:

```ts
import { formatCount, formatRupeeRange, formatRupees } from "./format-rupees.js";

describe("formatRupees", () => {
  it.each([
    [0, "₹0"],
    [240, "₹240"],
    [99.4, "₹99"],
    [1999.5, "₹2,000"],
    [99_792, "₹99,792"],
    [1_19_952, "₹1,19,952"],
    [1_00_00_000, "₹1,00,00,000"],
  ])(
    "formats %d as %s — rupee sign, no space, no decimals, Indian grouping",
    (amount, expected) => {
      expect(formatRupees(amount)).toBe(expected);
    }
  );

  it("writes a discount with a true minus sign before the rupee sign", () => {
    expect(formatRupees(-500)).toBe("−₹500");
  });

  it("does not print a negative zero for an amount that rounds to zero", () => {
    expect(formatRupees(-0.4)).toBe("₹0");
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "rejects the non-finite amount %d instead of printing it",
    (amount) => {
      expect(() => formatRupees(amount)).toThrow(RangeError);
    }
  );
});

describe("formatRupeeRange", () => {
  it("joins two amounts with an en dash and no spaces", () => {
    expect(formatRupeeRange(180, 320)).toBe("₹180–₹320");
  });

  it("rejects a range that runs backwards", () => {
    expect(() => formatRupeeRange(320, 180)).toThrow(RangeError);
  });
});

describe("formatCount", () => {
  it("groups counts the Indian way", () => {
    expect(formatCount(1_234_567)).toBe("12,34,567");
    expect(formatCount(2500)).toBe("2,500");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/utils --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — cannot find `./format-rupees.js`.

- [ ] **Step 3: Implement**

`packages/utils/src/format-rupees.ts`:

```ts
/**
 * Money and count formatting for the brand's copy rules: `₹` with no space, no decimals on whole
 * rupees, Indian digit grouping (`₹1,19,952`), en-dash ranges (`₹180–₹320`), a true minus sign
 * for discounts (`−₹500`).
 */
const INDIAN_INTEGER = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const MINUS_SIGN = "−";
const EN_DASH = "–";

function assertFinite(value: number, caller: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${caller}: expected a finite number, got ${String(value)}`);
  }
}

export function formatRupees(amount: number): string {
  assertFinite(amount, "formatRupees");
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? MINUS_SIGN : "";
  return `${sign}₹${INDIAN_INTEGER.format(Math.abs(rounded))}`;
}

export function formatRupeeRange(from: number, to: number): string {
  if (to < from) {
    throw new RangeError(
      `formatRupeeRange: range runs backwards (${String(from)} to ${String(to)})`
    );
  }
  return `${formatRupees(from)}${EN_DASH}${formatRupees(to)}`;
}

export function formatCount(value: number): string {
  assertFinite(value, "formatCount");
  return INDIAN_INTEGER.format(Math.round(value));
}
```

`packages/utils/src/index.ts`:

```ts
export { formatCount, formatRupeeRange, formatRupees } from "./format-rupees.js";
```

- [ ] **Step 4: Run to verify it passes, then gate**

Run:

```bash
git rm -q packages/utils/src/lib/utils.ts packages/utils/src/lib/utils.spec.ts
pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/utils --skip-nx-cache --outputStyle=static 2>&1 | tail -8
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A packages/utils
git commit -m "feat(utils): format rupees, ranges and counts the brand way

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Brand facts in `packages/content`

**Files:**

- Delete: `packages/content/src/lib/content.ts`, `packages/content/src/lib/content.spec.ts`
- Create: `packages/content/src/brand/{brand-schema.ts,brand-data.ts,brand.ts,brand-lines.ts,brand.spec.ts,brand-lines.spec.ts}`
- Replace: `packages/content/src/index.ts`
- Modify: `packages/content/package.json` (zod via `pnpm add zod --filter @pink-paprikaa-web/content`)

**Interfaces:**

- Produces from `@pink-paprikaa-web/content`: `brand: Brand`, `brandSchema`, type `Brand`, type `SocialNetwork = "instagram" | "youtube" | "linkedin"`, `toBrandLines(brand: Brand, year: number): BrandLines` with `BrandLines = { copyright, fssai, gstin, cin, cities, contactShort: string; footerPolicies: string[] }`.

- [ ] **Step 1: Install Zod (verify the version pnpm resolves is 4.x)**

Run: `pnpm add zod --filter @pink-paprikaa-web/content && node -p "require('./packages/content/node_modules/zod/package.json').version"`
Expected: `4.x`.

- [ ] **Step 2: Write the failing tests**

`packages/content/src/brand/brand.spec.ts`:

```ts
import { brand } from "./brand.js";
import { rawBrand } from "./brand-data.js";
import { brandSchema } from "./brand-schema.js";

const withChange = (change: (draft: Record<string, unknown>) => void): unknown => {
  const draft = structuredClone(rawBrand) as unknown as Record<string, unknown>;
  change(draft);
  return draft;
};

describe("brand", () => {
  it("parses the committed brand facts", () => {
    expect(brand.name).toBe("Pink Paprikaa");
    expect(brand.established).toBe(2025);
    expect(brand.vegStatement).toBe("100% vegetarian kitchen.");
  });

  it("never names a founder, anywhere in the facts", () => {
    expect(JSON.stringify(brand)).not.toMatch(/rishav|pandey|anand/i);
  });

  it("models facts the owner has not supplied as null, never as a TODO string", () => {
    expect(JSON.stringify(brand)).not.toMatch(/TODO/);
    expect(brand.outlets[0]?.hours).toBeNull();
    expect(brand.billing.bankName).toBeNull();
  });
});

describe("brandSchema", () => {
  it("rejects the brand name with one 'a'", () => {
    expect(brandSchema.safeParse(withChange((d) => (d.name = "Pink Paprika"))).success).toBe(false);
  });

  it("rejects a GSTIN that is not 15 characters of the right shape", () => {
    const bad = withChange((d) => ((d.legal as Record<string, unknown>).gstin = "06AAPCP9130L1Z"));
    expect(brandSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects an FSSAI licence that is not 14 digits", () => {
    const bad = withChange((d) => ((d.legal as Record<string, unknown>).fssai = "1082500500170"));
    expect(brandSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a phone number that is not +91 and ten digits", () => {
    const bad = withChange((d) => ((d.contact as Record<string, unknown>).phone = "9090704001"));
    expect(brandSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a GST split that does not add up to the GST rate", () => {
    const bad = withChange((d) => {
      const billing = d.billing as { gstSplit: { cgst: number } };
      billing.gstSplit.cgst = 0.05;
    });
    expect(brandSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects an unknown social network", () => {
    const bad = withChange((d) => {
      (d.social as { network: string }[])[0]!.network = "facebook";
    });
    expect(brandSchema.safeParse(bad).success).toBe(false);
  });
});
```

`packages/content/src/brand/brand-lines.spec.ts`:

```ts
import { brand } from "./brand.js";
import { toBrandLines } from "./brand-lines.js";

describe("toBrandLines", () => {
  const lines = toBrandLines(brand, 2026);

  it("prints the copyright with the year it is given and the legal entity", () => {
    expect(lines.copyright).toBe("© 2026 Paprikaa Culinary Ventures Private Limited");
  });

  it("prints the statutory licence lines", () => {
    expect(lines.fssai).toBe("FSSAI Lic. 10825005001702");
    expect(lines.gstin).toBe("GSTIN 06AAPCP9130L1ZW");
    expect(lines.cin).toBe("CIN U56101HR2025PTC133469");
  });

  it("joins the outlet cities and the short contact line", () => {
    expect(lines.cities).toBe("Gurgaon");
    expect(lines.contactShort).toBe("pinkpaprikaa.com · +91 90907 04001");
  });

  it("lists the policies and ends with the FSSAI line", () => {
    expect(lines.footerPolicies).toEqual([
      "Privacy",
      "Terms",
      "Refunds",
      "FSSAI Lic. 10825005001702",
    ]);
  });

  it("rejects a year that is not a whole number", () => {
    expect(() => toBrandLines(brand, 2026.5)).toThrow(RangeError);
  });
});
```

- [ ] **Step 3: Run to verify they fail**

Run: `pnpm nx test @pink-paprikaa-web/content --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — modules not found.

- [ ] **Step 4: Implement**

`packages/content/src/brand/brand-schema.ts`:

```ts
import { z } from "zod";

const GSTIN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[\dA-Z]$/;
const FSSAI = /^\d{14}$/;
const CIN = /^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/;
const PAN = /^[A-Z]{5}\d{4}[A-Z]$/;
const INDIAN_PHONE = /^\+91\d{10}$/;

const text = z.string().min(1);
/** A fact the owner has not supplied yet: null until they do (spec C16). */
const pending = text.nullable();

export const socialNetworkSchema = z.enum(["instagram", "youtube", "linkedin"]);
export type SocialNetwork = z.infer<typeof socialNetworkSchema>;

export const brandSchema = z.object({
  name: z.literal("Pink Paprikaa"),
  nameDevanagari: text,
  tagline: text,
  statement: text,
  vegStatement: text,
  established: z.number().int().min(2025),
  legal: z.object({
    entity: z.literal("Paprikaa Culinary Ventures Private Limited"),
    cin: z.string().regex(CIN),
    gstin: z.string().regex(GSTIN),
    fssai: z.string().regex(FSSAI),
    pan: z.string().regex(PAN),
    registeredAddress: text,
  }),
  contact: z.object({
    website: text,
    websiteUrl: z.url(),
    phone: z.string().regex(INDIAN_PHONE),
    phoneDisplay: text,
    whatsapp: z.string().regex(INDIAN_PHONE),
    email: z.email(),
    ordersEmail: z.email(),
    franchiseEmail: z.email(),
    careersEmail: z.email(),
  }),
  social: z.array(z.object({ network: socialNetworkSchema, handle: text, url: z.url() })).min(1),
  hours: z.object({ weekday: text, weekend: text, display: text }),
  outlets: z
    .array(
      z.object({
        id: text,
        city: text,
        name: text,
        address: text,
        hours: pending,
        phone: z.string().regex(INDIAN_PHONE),
        mapsUrl: z.url().nullable(),
      })
    )
    .min(1),
  billing: z
    .object({
      gstRate: z.number().min(0).max(1),
      gstSplit: z.object({ cgst: z.number().min(0), sgst: z.number().min(0) }),
      currency: z.literal("INR"),
      currencySymbol: z.literal("₹"),
      taxNote: text,
      invoicePrefix: text,
      bankName: pending,
      accountName: text,
      accountNumber: pending,
      ifsc: pending,
      upi: pending,
    })
    .refine(
      (billing) => Math.abs(billing.gstSplit.cgst + billing.gstSplit.sgst - billing.gstRate) < 1e-9,
      {
        message: "gstSplit must add up to gstRate",
      }
    ),
  policies: z.array(z.enum(["Privacy", "Terms", "Refunds"])).min(1),
});

export type Brand = z.infer<typeof brandSchema>;
```

`packages/content/src/brand/brand-data.ts` (from `zip-files/Pink Paprikaa Design System/brand.js` with spec C3/C6/C16 applied):

```ts
/**
 * Company facts — one source of truth for every footer, legal line, contact block and structured
 * datum. Parsed once at the boundary (`brand.ts`). Facts the owner has not supplied are `null`.
 *
 * Source: the design system's brand.js, with: established 2025 (owner, 2026-09-27); the public
 * address reconciled with the handoff ("HSVP Market (MKM Market)"); TODO placeholders → null.
 * The registered address is the statutory text and is kept verbatim.
 */
export const rawBrand = {
  name: "Pink Paprikaa",
  nameDevanagari: "पैप्रिका",
  tagline: "India's First Desi Urban Café",
  statement: "Desi at heart. Urban by nature.",
  vegStatement: "100% vegetarian kitchen.",
  established: 2025,
  legal: {
    entity: "Paprikaa Culinary Ventures Private Limited",
    cin: "U56101HR2025PTC133469",
    gstin: "06AAPCP9130L1ZW",
    fssai: "10825005001702",
    pan: "AAPCP9130L",
    registeredAddress: "Booth No. 67P, Sector 57, HSVP Market, Gurgaon 122003, Haryana, India",
  },
  contact: {
    website: "pinkpaprikaa.com",
    websiteUrl: "https://pinkpaprikaa.com",
    phone: "+919090704001",
    phoneDisplay: "+91 90907 04001",
    whatsapp: "+919090704001",
    email: "business@pinkpaprikaa.com",
    ordersEmail: "business@pinkpaprikaa.com",
    franchiseEmail: "business@pinkpaprikaa.com",
    careersEmail: "business@pinkpaprikaa.com",
  },
  social: [
    { network: "instagram", handle: "@pinkpaprikaa", url: "https://instagram.com/pinkpaprikaa" },
    { network: "youtube", handle: "Pink Paprikaa", url: "https://youtube.com/@pinkpaprikaa" },
    {
      network: "linkedin",
      handle: "Pink Paprikaa",
      url: "https://linkedin.com/company/pinkpaprikaa",
    },
  ],
  hours: {
    weekday: "8am – 11:30pm",
    weekend: "8am – 11:30pm",
    display: "8am – 11:30pm, every day",
  },
  outlets: [
    {
      id: "sector-57",
      city: "Gurgaon",
      name: "Sector 57",
      address: "Booth No. 67P, HSVP Market (MKM Market), Sector 57, Gurgaon 122003",
      hours: null,
      phone: "+919090704001",
      mapsUrl: null,
    },
  ],
  billing: {
    gstRate: 0.05,
    gstSplit: { cgst: 0.025, sgst: 0.025 },
    currency: "INR",
    currencySymbol: "₹",
    taxNote: "Inclusive of all taxes.",
    invoicePrefix: "PPK",
    bankName: null,
    accountName: "Paprikaa Culinary Ventures Private Limited",
    accountNumber: null,
    ifsc: null,
    upi: null,
  },
  policies: ["Privacy", "Terms", "Refunds"],
} as const;
```

`packages/content/src/brand/brand.ts`:

```ts
import { rawBrand } from "./brand-data.js";
import { type Brand, brandSchema } from "./brand-schema.js";

/** The validated brand facts. A schema violation fails every consumer's build. */
export const brand: Brand = brandSchema.parse(rawBrand);
```

`packages/content/src/brand/brand-lines.ts`:

```ts
import type { Brand } from "./brand-schema.js";

export interface BrandLines {
  copyright: string;
  fssai: string;
  gstin: string;
  cin: string;
  cities: string;
  contactShort: string;
  footerPolicies: string[];
}

/** Derived legal/contact strings. The caller passes the year (build time), so output is deterministic. */
export function toBrandLines(brand: Brand, year: number): BrandLines {
  if (!Number.isInteger(year)) {
    throw new RangeError(`toBrandLines: year must be a whole number, got ${String(year)}`);
  }
  const fssai = `FSSAI Lic. ${brand.legal.fssai}`;
  return {
    copyright: `© ${String(year)} ${brand.legal.entity}`,
    fssai,
    gstin: `GSTIN ${brand.legal.gstin}`,
    cin: `CIN ${brand.legal.cin}`,
    cities: [...new Set(brand.outlets.map((outlet) => outlet.city))].join(" · "),
    contactShort: `${brand.contact.website} · ${brand.contact.phoneDisplay}`,
    footerPolicies: [...brand.policies, fssai],
  };
}
```

`packages/content/src/index.ts`:

```ts
export { brand } from "./brand/brand.js";
export { type BrandLines, toBrandLines } from "./brand/brand-lines.js";
export {
  type Brand,
  brandSchema,
  type SocialNetwork,
  socialNetworkSchema,
} from "./brand/brand-schema.js";
```

- [ ] **Step 5: Run, gate, commit**

```bash
git rm -q packages/content/src/lib/content.ts packages/content/src/lib/content.spec.ts
pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/content --skip-nx-cache --outputStyle=static 2>&1 | tail -8
```

Expected: PASS. (If `z.url()`/`z.email()` do not exist in the resolved Zod, check `packages/content/node_modules/zod` docs and use the installed equivalent.)

```bash
git add -A packages/content pnpm-lock.yaml
git commit -m "feat(content): validated brand facts from the design system's brand.js

Founded 2025; facts the owner has not supplied are null, not TODO strings.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

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

### Task 6: Lint and format gates — layering, naming, token-only classes, class order

**Files:**

- Modify: `tools/eslint-config/atomic-layering.js`, `tools/eslint-config/base.js`, `tools/eslint-config/react.js`, `.prettierrc`, root `package.json` (devDep)

**Interfaces:**

- Produces LAWs later tasks must satisfy: layers `atoms → molecules → organisms → layouts`; atoms import only `../icon/*` among siblings; `@typescript-eslint/naming-convention` at `error`; `tailwindcss/no-arbitrary-value` and `tailwindcss/no-custom-classname` at `error` with `functions` including `componentVariants`; Prettier sorts classes (incl. inside `componentVariants({...})`).

- [ ] **Step 1: Atomic layering — `layouts` tier and the atom rule**

Replace `tools/eslint-config/atomic-layering.js` body (keep the long explanatory comment, update its layer list):

```js
const layerOrder = ["atoms", "molecules", "organisms", "layouts"];

const upperLayerPatterns = (layer) =>
  layerOrder.slice(layerOrder.indexOf(layer) + 1).map((upper) => ({
    group: [`**/${upper}/**`, `**/${upper}`],
    message: `Atomic layering: ${layer} cannot import from ${upper} (layers only go upward).`,
  }));

const atomicLayering = [
  {
    files: ["**/src/atoms/**/*"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...upperLayerPatterns("atoms"),
            {
              // Design system tier rule: "an atom imports nothing but Icon".
              group: ["../*", "!../icon", "../*/**", "!../icon/**"],
              message:
                "Atomic layering: an atom may import only the Icon atom (plus ../../lib and packages).",
            },
          ],
        },
      ],
    },
  },
  ...["molecules", "organisms"].map((layer) => ({
    files: [`**/src/${layer}/**/*`],
    rules: { "no-restricted-imports": ["error", { patterns: upperLayerPatterns(layer) }] },
  })),
];

export default atomicLayering;
```

- [ ] **Step 2: Naming convention to error**

In `tools/eslint-config/base.js` replace the naming line and its comment with:

```js
      // LAW since the design system rewrite (drift ledger P-08 closed).
      "@typescript-eslint/naming-convention": ["error", ...namingConvention],
```

- [ ] **Step 3: Token-only classes; Prettier owns order**

At the end of `tools/eslint-config/react.js`, replace `tailwindcss.configs.recommended,` with:

```js
  tailwindcss.configs.recommended,
  {
    files: ["**/*.tsx", "**/*.jsx", "**/*.ts"],
    settings: {
      tailwindcss: {
        // `componentVariants` is the design system's configured tailwind-variants instance.
        functions: ["componentVariants", "tv", "cn", "clsx"],
      },
    },
    rules: {
      // Prettier (prettier-plugin-tailwindcss) owns class order; two sorters would fight.
      "tailwindcss/classnames-order": "off",
      // Only token-backed utilities: a missing value becomes a token, never an arbitrary value.
      "tailwindcss/no-arbitrary-value": "error",
      "tailwindcss/no-custom-classname": "error",
    },
  },
```

(Before relying on the setting, confirm the key name `functions` in the installed plugin README: `node_modules/.pnpm/eslint-plugin-tailwindcss@*/node_modules/eslint-plugin-tailwindcss/README.md`.)

- [ ] **Step 4: Prettier class sorting**

Run: `pnpm add -D -w prettier-plugin-tailwindcss`
Replace `.prettierrc`:

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "singleQuote": false,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindStylesheet": "./packages/ui/tailwind.css",
  "tailwindFunctions": ["componentVariants"]
}
```

- [ ] **Step 5: Probes — each new LAW must fail on a deliberate violation**

For each probe: create the file, run the command, confirm the expected error text, delete the file. Paste each output in the report.

1. Atom imports a sibling atom — create `packages/ui/src/atoms/probe/probe.tsx`:
   ```tsx
   import { Probe2 } from "../probe2/probe2";
   export function Probe() {
     return <Probe2 />;
   }
   ```
   Run `pnpm nx lint @pink-paprikaa-web/ui --skip-nx-cache` → expect `an atom may import only the Icon atom`.
2. Arbitrary value — `packages/ui/src/atoms/probe/probe.tsx`: `export function Probe() { return <div className="h-[13px]" />; }` → expect `tailwindcss/no-arbitrary-value`.
3. Unknown class — `className="rounded-lgg"` → expect `tailwindcss/no-custom-classname`.
4. Stock Tailwind colour — `className="bg-red-500"` → expect `tailwindcss/no-custom-classname` (the namespace is cleared).
5. Boolean naming — `packages/utils/src/probe.ts`: `export const open = true;` → `pnpm nx lint @pink-paprikaa-web/utils --skip-nx-cache` → expect `@typescript-eslint/naming-convention`.
6. Class order — in the probe TSX write `className="text-text-muted p-4 flex"` and run `pnpm exec prettier --check packages/ui/src/atoms/probe/probe.tsx` → expect a formatting difference; `--write` then shows `flex p-4 text-text-muted`.

Remove all probe files (`git status` must show none).

- [ ] **Step 6: Workspace-wide format pass (its own commit) and lint sweep**

Run: `pnpm nx format:write && pnpm nx run-many -t lint --skip-nx-cache --outputStyle=static 2>&1 | tail -20`
Expected: lint green across all projects. If the naming rule now errors in existing code (apps/web, tools), rename the symbol (never disable the rule) and include those renames in the Step 7 commit.

- [ ] **Step 7: Commit (two commits)**

```bash
git add -A -- ':!*.md'   # formatting changes from prettier-plugin-tailwindcss only
git commit -m "style: sort Tailwind classes with prettier-plugin-tailwindcss

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" || true
git add -A tools/eslint-config .prettierrc package.json pnpm-lock.yaml
git commit -m "feat(tools): token-only classes, strict naming and the layouts tier

no-arbitrary-value and no-custom-classname make token-backed utilities the only
classes that lint; naming-convention is an error; the atomic layering rule
knows the design system's layouts tier and that an atom imports only Icon.
Each rule was probed with a deliberate violation (outputs below).

<paste the six probe outputs, one line each>

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

(If Step 6 produced no formatting changes, the first commit is skipped — that is what `|| true` allows.)

---

### Task 7: Brand artwork, the Icon and Logo atoms

**Files:**

- Create: `packages/ui/src/assets/brand/*.svg` (copy of the 9 design-system SVGs), `packages/ui/scripts/build-brand-artwork.mjs`, `packages/ui/src/lib/brand-artwork.ts` (generated), `packages/ui/src/lib/brand-artwork.spec.ts`
- Create: `packages/design-tokens/tokens/component/icon.json`, `packages/design-tokens/tokens/component/logo.json`
- Create: `packages/ui/src/atoms/icon/{icon.tsx,brand-glyphs.tsx,icon.test.tsx,icon.stories.tsx}`, `packages/ui/src/atoms/logo/{logo.tsx,logo.test.tsx,logo.stories.tsx}`
- Modify: `packages/ui/src/index.ts`, `packages/ui/package.json` (script), `packages/ui/src/lib/component-variants.ts` (spacing names), `apps/storybook/vitest.config.mts` (remove `passWithNoTests`)

**Interfaces:**

- Produces: `Icon` (`IconProps { icon: IconComponent; size?: "xs"|"sm"|"md"|"lg"|"xl"; label?: string } & span props`), `type IconComponent`, `InstagramGlyph`, `YoutubeGlyph`, `LinkedinGlyph`; `Logo` (`LogoProps { variant?: "lockup"|"wordmark"|"symbol"; tone?: "pink"|"white"|"badge"; title?: string; isDecorative?: boolean } & svg props`); `ARTWORK: Record<"lockup"|"wordmark"|"symbol", { viewBox: string; markup: string; width: number; height: number }>` and `SYMBOL_DATA_URI_WHITE` (for PatternField, Plan 2) in `src/lib/brand-artwork.ts`.

- [ ] **Step 1: Copy the source artwork**

```bash
mkdir -p packages/ui/src/assets/brand
cp "zip-files/Pink Paprikaa Design System/assets/"*.svg packages/ui/src/assets/brand/
```

- [ ] **Step 2: Component tokens for icon and logo sizes**

`packages/design-tokens/tokens/component/icon.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "icon-xs": { "$value": "14px" },
    "icon-sm": { "$value": "16px", "$description": "Inline with body text." },
    "icon-md": { "$value": "20px", "$description": "Buttons, list rows." },
    "icon-lg": { "$value": "24px", "$description": "Nav, tab bar." },
    "icon-xl": { "$value": "32px", "$description": "Empty states." }
  }
}
```

`packages/design-tokens/tokens/component/logo.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "logo-lockup": {
      "$value": "240px",
      "$description": "Default lockup width. Minimum 200px (below it, use the wordmark)."
    },
    "logo-wordmark": {
      "$value": "180px",
      "$description": "Default wordmark width. Minimum 140px."
    },
    "logo-symbol": { "$value": "40px" }
  }
}
```

Add the eight names (`icon-xs icon-sm icon-md icon-lg icon-xl logo-lockup logo-wordmark logo-symbol`) to `SPACING` in `packages/ui/src/lib/component-variants.ts`. Rebuild tokens; the variant spec must pass.

- [ ] **Step 3: The artwork generator**

`packages/ui/scripts/build-brand-artwork.mjs`:

```js
/**
 * Compiles the brand SVGs (src/assets/brand) into src/lib/brand-artwork.ts.
 * Run: pnpm nx run @pink-paprikaa-web/ui:brand-artwork — then commit the output.
 *
 * Only the pink files are compiled: white and badge are the same artwork painted differently
 * (currentColor; a pink plate), so one path set per mark is the whole source of truth. Element ids
 * get an `__ID__` placeholder the Logo replaces per instance, so two logos on a page never share a
 * clip-path id.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { optimize } from "svgo";

const ROOT = new URL("../", import.meta.url);
const SOURCES = {
  lockup: "logo-lockup-pink.svg",
  wordmark: "logo-wordmark-pink.svg",
  symbol: "symbol-pink.svg",
};

function compile(file) {
  const source = readFileSync(new URL(`src/assets/brand/${file}`, ROOT), "utf8");
  const { data } = optimize(source, { multipass: true, plugins: ["preset-default"] });
  const viewBox = /viewBox="([^"]+)"/.exec(data)?.[1];
  if (!viewBox) throw new Error(`${file}: no viewBox after optimisation`);
  const [, , width, height] = viewBox.split(/\s+/).map(Number);
  const markup = data
    .replace(/^<svg[^>]*>/, "")
    .replace(/<\/svg>$/, "")
    .replace(/fill="#[\da-f]{3,6}"/gi, 'fill="currentColor"')
    .replace(/id="([^"]+)"/g, 'id="__ID__$1"')
    .replace(/url\(#([^)]+)\)/g, "url(#__ID__$1)");
  if (/#[\da-f]{3,6}\b/i.test(markup))
    throw new Error(`${file}: a literal colour survived recolouring`);
  return { viewBox, width, height, markup };
}

const artwork = Object.fromEntries(
  Object.entries(SOURCES).map(([mark, file]) => [mark, compile(file)])
);

const symbolWhite = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${artwork.symbol.viewBox}" fill="white">${artwork.symbol.markup.replaceAll('fill="currentColor"', "")}</svg>`;

const out = `// Generated by scripts/build-brand-artwork.mjs from src/assets/brand/*.svg — do not edit.
export type Mark = "lockup" | "wordmark" | "symbol";

export interface Artwork {
  readonly viewBox: string;
  readonly width: number;
  readonly height: number;
  /** Inner SVG markup, painted with currentColor; ids carry the __ID__ placeholder. */
  readonly markup: string;
}

export const ARTWORK: Readonly<Record<Mark, Artwork>> = ${JSON.stringify(artwork, null, 2)};

/** The white symbol as a CSS url() data URI — the brand's one pattern tile. */
export const SYMBOL_DATA_URI_WHITE = ${JSON.stringify(`url("data:image/svg+xml,${encodeURIComponent(symbolWhite)}")`)};
`;

writeFileSync(new URL("src/lib/brand-artwork.ts", ROOT), out);
console.log("brand-artwork.ts written:", Object.keys(artwork).join(", "));
```

Note: `fill="white"` is a CSS keyword, not a hex literal, so it passes the no-raw-hex/no-literal-colour checks.

In `packages/ui/package.json` add `"scripts": { "brand-artwork": "node scripts/build-brand-artwork.mjs" }` (Nx infers the target). Run it:

```bash
pnpm nx run @pink-paprikaa-web/ui:brand-artwork && head -c 600 packages/ui/src/lib/brand-artwork.ts
```

Expected: the file is written with three marks. Then `pnpm exec prettier --write packages/ui/src/lib/brand-artwork.ts`.

`packages/ui/src/lib/brand-artwork.spec.ts`:

```ts
import { readFileSync } from "node:fs";

import { ARTWORK, SYMBOL_DATA_URI_WHITE } from "./brand-artwork";

const source = (file: string) =>
  readFileSync(new URL(`../assets/brand/${file}`, import.meta.url), "utf8");
const viewBoxOf = (svg: string) => /viewBox="([^"]+)"/.exec(svg)?.[1];

describe("brand artwork", () => {
  it.each([
    ["lockup", "logo-lockup-pink.svg"],
    ["wordmark", "logo-wordmark-pink.svg"],
    ["symbol", "symbol-pink.svg"],
  ] as const)(
    "keeps the %s viewBox of its source file (regenerate if this fails)",
    (mark, file) => {
      expect(ARTWORK[mark].viewBox).toBe(viewBoxOf(source(file)));
    }
  );

  it("paints every mark with currentColor — no literal colour survives", () => {
    for (const { markup } of Object.values(ARTWORK)) {
      expect(markup).not.toMatch(/#[\da-f]{3,6}\b/i);
      expect(markup).toContain("currentColor");
    }
  });

  it("makes every element id instance-safe", () => {
    for (const { markup } of Object.values(ARTWORK)) {
      for (const [, id] of markup.matchAll(/id="([^"]+)"/g)) expect(id).toMatch(/^__ID__/);
    }
  });

  it("offers the white symbol as a CSS data URI", () => {
    expect(SYMBOL_DATA_URI_WHITE).toMatch(/^url\("data:image\/svg\+xml,/);
  });
});
```

- [ ] **Step 3b: The symbol as one shared CSS mask (ruling R19)**

Small diamonds (SpiceLevel, Rating, StatusDot, Spinner, Divider) and PatternField all draw the brand symbol. Inlining its ~5 KB of path data per instance would add ~400 KB to a 20-dish menu page, so the generator also writes one CSS file that defines the symbol once. Extend `scripts/build-brand-artwork.mjs` to also write `src/lib/brand-artwork.css`:

```js
const css = `/* Generated by scripts/build-brand-artwork.mjs — do not edit. */
@layer base {
  :root {
    --pp-symbol-mask: ${JSON.parse(JSON.stringify(`url("data:image/svg+xml,${encodeURIComponent(symbolWhite)}")`))};
  }
}

/* The brand symbol painted in currentColor: <span class="mask-symbol"> with a size. */
@utility mask-symbol {
  background-color: currentColor;
  -webkit-mask: var(--pp-symbol-mask) center / contain no-repeat;
  mask: var(--pp-symbol-mask) center / contain no-repeat;
}
`;
writeFileSync(new URL("src/lib/brand-artwork.css", ROOT), css);
```

In `src/styles.css`, add `@import "./lib/brand-artwork.css";` directly after the two token imports. Add to `brand-artwork.spec.ts`:

```ts
it("defines the symbol mask once, as a CSS custom property and a utility", () => {
  const css = readFileSync(join(import.meta.dirname, "brand-artwork.css"), "utf8");
  expect(css).toContain('--pp-symbol-mask: url("data:image/svg+xml,');
  expect(css).toContain("@utility mask-symbol");
});
```

(Use `join(import.meta.dirname, …)` for every file path in this task's specs — ruling R15; Vite rewrites `new URL(…, import.meta.url)` in jsdom.) Rerun the generator; the library stylesheet spec (no literal colours in CSS) must still pass — the URL-encoded SVG contains no `#` or `rgb(`.

- [ ] **Step 4: Write the failing Icon tests**

`packages/ui/src/atoms/icon/icon.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { MessageCircle } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { InstagramGlyph, LinkedinGlyph, YoutubeGlyph } from "./brand-glyphs";
import { Icon } from "./icon";

describe("Icon", () => {
  it("is hidden from assistive tech when it has no label", () => {
    const { container } = render(<Icon icon={MessageCircle} />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("is announced as an image with its label when given one", () => {
    render(<Icon icon={MessageCircle} label="WhatsApp" />);
    expect(screen.getByRole("img", { name: "WhatsApp" })).toBeInTheDocument();
  });

  it.each([
    ["xs", "size-icon-xs", "2"],
    ["sm", "size-icon-sm", "2"],
    ["md", "size-icon-md", "1.75"],
    ["lg", "size-icon-lg", "1.75"],
    ["xl", "size-icon-xl", "1.75"],
  ] as const)("renders size %s with the %s box and stroke %s", (size, sizeClass, stroke) => {
    const { container } = render(<Icon icon={MessageCircle} size={size} />);
    expect(container.firstElementChild).toHaveClass(sizeClass);
    expect(container.querySelector("svg")).toHaveAttribute("stroke-width", stroke);
  });

  it.each([InstagramGlyph, YoutubeGlyph, LinkedinGlyph])(
    "renders the brand glyph %o like any icon",
    (glyph) => {
      const { container } = render(<Icon icon={glyph} label="Social" />);
      expect(container.querySelector("svg")).toHaveAttribute("stroke", "currentColor");
    }
  );

  it("has no accessibility violations", async () => {
    const { container } = render(<Icon icon={MessageCircle} label="WhatsApp" />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 5: Run to verify it fails, then implement Icon**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6` → FAIL.

`packages/ui/src/atoms/icon/brand-glyphs.tsx`:

```tsx
import type { SVGProps } from "react";

/**
 * Social brand glyphs. lucide-react 1.x dropped brand icons; these are Lucide 0.408's own
 * instagram / youtube / linkedin glyphs (ISC licence) — the exact icons the design system
 * references — so they match every other icon's grid and stroke.
 */
export interface GlyphProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

function Glyph({ size = 24, strokeWidth = 2, children, ...props }: GlyphProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export function InstagramGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </Glyph>
  );
}

export function YoutubeGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </Glyph>
  );
}

export function LinkedinGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </Glyph>
  );
}
```

`packages/ui/src/atoms/icon/icon.tsx`:

```tsx
import type { ComponentProps, ComponentType } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";

/** Anything that renders an icon glyph: a lucide-react icon or one of the brand glyphs. */
export type IconComponent = ComponentType<{
  size?: number | string;
  strokeWidth?: number | string;
  "aria-hidden"?: boolean;
  focusable?: "false";
}>;

const icon = componentVariants({
  base: "inline-flex shrink-0 items-center justify-center leading-none",
  variants: {
    size: {
      xs: "size-icon-xs",
      sm: "size-icon-sm",
      md: "size-icon-md",
      lg: "size-icon-lg",
      xl: "size-icon-xl",
    },
  },
  defaultVariants: { size: "md" },
});

type IconSize = NonNullable<VariantProps<typeof icon>["size"]>;

/** Design system rule: stroke 2 at 16px and below, 1.75 above. */
const STROKE_WIDTH: Readonly<Record<IconSize, number>> = {
  xs: 2,
  sm: 2,
  md: 1.75,
  lg: 1.75,
  xl: 1.75,
};

export interface IconProps
  extends Omit<ComponentProps<"span">, "children">, VariantProps<typeof icon> {
  icon: IconComponent;
  /** Accessible name. Omit for a decorative icon (then it is hidden from assistive tech). */
  label?: string;
}

/** A Lucide-style glyph in the system's sizes, painted with `currentColor`. */
export function Icon({ icon: Glyph, size = "md", label, className, ...props }: IconProps) {
  return (
    <span
      className={icon({ size, className })}
      role={label === undefined ? undefined : "img"}
      aria-label={label}
      aria-hidden={label === undefined ? true : undefined}
      {...props}
    >
      <Glyph size="100%" strokeWidth={STROKE_WIDTH[size]} aria-hidden focusable="false" />
    </span>
  );
}
```

(If `lucide-react`'s `LucideIcon` is not assignable to `IconComponent`, check its props type in `packages/ui/node_modules/lucide-react/dist/lucide-react.d.ts` and widen `IconComponent` to accept it — never cast at the call site.)

- [ ] **Step 6: Write the failing Logo tests**

`packages/ui/src/atoms/logo/logo.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Logo } from "./logo";

describe("Logo", () => {
  it("is the lockup in brand pink by default, named for assistive tech", () => {
    render(<Logo />);
    const logo = screen.getByRole("img", { name: "Pink Paprikaa — India's First Desi Urban Café" });
    expect(logo).toHaveClass("text-pink-500", "w-logo-lockup");
  });

  it.each([
    ["wordmark", "Pink Paprikaa", "w-logo-wordmark"],
    ["symbol", "Pink Paprikaa", "w-logo-symbol"],
  ] as const)("names the %s variant %s", (variant, name, widthClass) => {
    render(<Logo variant={variant} />);
    expect(screen.getByRole("img", { name })).toHaveClass(widthClass);
  });

  it("paints the white tone for pink and ink fields", () => {
    render(<Logo tone="white" />);
    expect(screen.getByRole("img")).toHaveClass("text-ink-000");
  });

  it("puts the badge tone on a square brand plate", () => {
    const { container } = render(<Logo tone="badge" variant="symbol" />);
    expect(container.querySelector("svg")).toHaveAttribute("viewBox", "0 0 100 100");
    expect(container.querySelector("rect")).toHaveClass("fill-pink-500");
  });

  it("hides a decorative logo from assistive tech", () => {
    const { container } = render(<Logo isDecorative />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("gives two logos on one page distinct clip-path ids", () => {
    const { container } = render(
      <>
        <Logo />
        <Logo tone="white" />
      </>
    );
    const ids = [...container.querySelectorAll("[id]")].map((el) => el.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const reference of container.innerHTML.matchAll(/url\(#([^)]+)\)/g)) {
      expect(ids).toContain(reference[1]);
    }
  });

  it("lets a consumer resize it", () => {
    render(<Logo className="w-50" />);
    expect(screen.getByRole("img")).toHaveClass("w-50");
    expect(screen.getByRole("img")).not.toHaveClass("w-logo-lockup");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Logo />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 7: Run to verify it fails, then implement Logo**

`packages/ui/src/atoms/logo/logo.tsx`:

```tsx
import { type ComponentProps, useId } from "react";

import { ARTWORK, type Mark } from "../../lib/brand-artwork";
import { componentVariants, type VariantProps } from "../../lib/component-variants";

const logo = componentVariants({
  base: "inline-block h-auto shrink-0",
  variants: {
    variant: { lockup: "w-logo-lockup", wordmark: "w-logo-wordmark", symbol: "w-logo-symbol" },
    tone: { pink: "text-pink-500", white: "text-ink-000", badge: "" },
  },
  defaultVariants: { variant: "lockup", tone: "pink" },
});

/** Badge plate: the artwork sits centred on a 100×100 pink square at the design system's inset. */
const BADGE_ARTWORK_WIDTH: Readonly<Record<Mark, number>> = {
  lockup: 76,
  wordmark: 76,
  symbol: 60,
};
const DEFAULT_TITLE: Readonly<Record<Mark, string>> = {
  lockup: "Pink Paprikaa — India's First Desi Urban Café",
  wordmark: "Pink Paprikaa",
  symbol: "Pink Paprikaa",
};

export interface LogoProps
  extends Omit<ComponentProps<"svg">, "children" | "viewBox">, VariantProps<typeof logo> {
  /** Accessible name. Defaults to the brand name (with the tagline for the lockup). */
  title?: string;
  /** Hide from assistive tech when a visible brand name sits beside it. */
  isDecorative?: boolean;
}

/**
 * The brand marks. `lockup` (with the drawn tagline) is the default everywhere; `wordmark` only
 * below ~120px wide; `symbol` is the diamond mark. Tones: `pink` on light, `white` on pink or ink,
 * `badge` on its own pink plate. Size it with width classes (`w-50`); height follows the artwork.
 */
export function Logo({
  variant = "lockup",
  tone = "pink",
  title,
  isDecorative = false,
  className,
  ...props
}: LogoProps) {
  const mark: Mark = variant;
  const artwork = ARTWORK[mark];
  const instance = useId().replace(/[^\w-]/g, "");
  const markup = artwork.markup.replaceAll("__ID__", `${instance}-`);
  const a11y = isDecorative
    ? { "aria-hidden": true as const }
    : { role: "img", "aria-label": title ?? DEFAULT_TITLE[mark] };

  if (tone === "badge") {
    const width = BADGE_ARTWORK_WIDTH[mark];
    const height = (width * artwork.height) / artwork.width;
    return (
      <svg
        viewBox="0 0 100 100"
        className={logo({ variant, tone, className })}
        {...a11y}
        {...props}
      >
        <rect width="100" height="100" className="fill-pink-500" />
        <svg
          x={(100 - width) / 2}
          y={(100 - height) / 2}
          width={width}
          height={height}
          viewBox={artwork.viewBox}
          className="text-ink-000"
          dangerouslySetInnerHTML={{ __html: markup }}
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox={artwork.viewBox}
      className={logo({ variant, tone, className })}
      {...a11y}
      {...props}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
```

(The markup is the build-time artwork compiled from the committed SVGs — never user input — so `dangerouslySetInnerHTML` is safe here; keep this comment in the file.)

Export both from `packages/ui/src/index.ts`:

```ts
export { Icon, type IconComponent, type IconProps } from "./atoms/icon/icon";
export {
  InstagramGlyph,
  LinkedinGlyph,
  YoutubeGlyph,
  type GlyphProps,
} from "./atoms/icon/brand-glyphs";
export { Logo, type LogoProps } from "./atoms/logo/logo";
export { RevealObserver, type RevealObserverProps } from "./lib/reveal-observer";
```

- [ ] **Step 8: Stories (card parity with `components/atoms/Icon.card.html` and `Logo.card.html`)**

Read both `.card.html` files and the `.prompt.md` notes in `zip-files/Pink Paprikaa Design System/components/atoms/` first. Then:

`packages/ui/src/atoms/icon/icon.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MapPin, MessageCircle, Search, ShoppingBag, Store } from "lucide-react";

import { InstagramGlyph, LinkedinGlyph, YoutubeGlyph } from "./brand-glyphs";
import { Icon } from "./icon";

const meta = {
  title: "Atoms/Icon",
  component: Icon,
  args: { icon: MessageCircle, size: "md" },
  parameters: {
    docs: {
      description: {
        component:
          "Lucide glyphs on a 24px grid, stroke 1.75 at 20–24px and 2 at 16px, painted with currentColor. Sizes: 16 inline with body, 20 buttons and list rows, 24 nav and tab bar, 32 empty states. Never emoji, never a second colour.",
      },
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-6">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Icon {...args} size={size} />
          <span className="font-mono text-mono text-text-muted">{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const Glyphs: Story = {
  render: () => (
    <div className="flex gap-4 text-text-heading">
      {[
        MessageCircle,
        ShoppingBag,
        MapPin,
        Search,
        Store,
        InstagramGlyph,
        YoutubeGlyph,
        LinkedinGlyph,
      ].map((glyph, i) => (
        <Icon key={i} icon={glyph} size="lg" />
      ))}
    </div>
  ),
};
```

`packages/ui/src/atoms/logo/logo.stories.tsx`: a `Playground`, a `Variants` story (lockup / wordmark / symbol side by side on white), a `Tones` story (pink on `bg-surface-page`, white on a `data-surface="brand"` `bg-surface-brand` panel and on a `data-surface="ink"` `bg-surface-inverse` panel, badge on white), and a `ClearSpace` story showing the lockup at its 200px minimum (`className="w-50"`) — each labelled with the prop that produces it, matching `Logo.card.html`. Docs description from `Logo.prompt.md` plus the readme rules: lockup by default, wordmark only under ~120px, never recolour, clear space = the height of the "P".

Remove `passWithNoTests` from `apps/storybook/vitest.config.mts`.

- [ ] **Step 9: Gate and commit**

Run:

```bash
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache
pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui --skip-nx-cache --outputStyle=static 2>&1 | tail -10
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -5
pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache 2>&1 | tail -10
```

Expected: all green; storybook tests run the Icon and Logo stories (a11y enforced).

```bash
git add -A packages/ui packages/design-tokens apps/storybook
git commit -m "feat(ui): brand artwork, Icon and Logo atoms

The nine brand SVGs compile once into currentColor path data with
instance-safe ids, so a header and footer logo never share a clip path.
Brand social glyphs are Lucide 0.408's own, matching every other icon.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Storybook on the consumer contract — fonts, groups, guard

**Files:**

- Create: `apps/storybook/.storybook/fonts.ts`
- Replace: `apps/storybook/.storybook/styles.css`
- Modify: `apps/storybook/.storybook/preview.tsx`, `apps/storybook/package.json`, root `package.json` (`guard:founder`)

**Interfaces:**

- Consumes: `@pink-paprikaa-web/ui/styles.css` (Task 5), `Logo`/`Icon` stories (Task 7).
- Produces: Storybook sidebar order `Introduction, Brand, Colors, Type, Spacing, Layout, Motion, Marketing, Atoms, Molecules, Organisms, Layouts, Website, App`; self-hosted fonts; `guard:founder` scanning `apps/storybook/storybook-static`.

- [ ] **Step 1: Dependencies**

```bash
pnpm add -D @fontsource/poppins @fontsource/dm-sans @fontsource/space-mono --filter @pink-paprikaa-web/storybook
pnpm add @pink-paprikaa-web/content @pink-paprikaa-web/design-tokens --workspace --filter @pink-paprikaa-web/storybook
ls node_modules/@fontsource/poppins/ | head -20; ls node_modules/@fontsource/dm-sans/ | head -20
```

(Confirm the CSS entry file names — e.g. `400.css`, `600-italic.css` — before writing Step 2.)

- [ ] **Step 2: Fonts and the consumer stylesheet**

`apps/storybook/.storybook/fonts.ts` (weights exactly as the design system's `tokens/fonts.css`; each Fontsource weight file carries every subset with `unicode-range`, so Devanagari loads only where used):

```ts
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/600-italic.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/400-italic.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/700.css";
```

Replace `apps/storybook/.storybook/styles.css`:

```css
/*
 * Storybook consumes the design system exactly as an app does (spec §6.5): Tailwind, then the
 * library's single stylesheet. The library scans itself; only this app's own docs need a @source.
 */
@import "tailwindcss";
@import "@pink-paprikaa-web/ui/styles.css";

@source "../src";
```

- [ ] **Step 3: Preview — group order, fonts, surfaces, a11y policy**

In `apps/storybook/.storybook/preview.tsx`:

- First lines: `import "./fonts";` then `import "./styles.css";`.
- `backgrounds` add `soft: { name: "Soft — light pink", value: "var(--color-surface-brand-soft)" }`.
- Replace the `a11y.config.rules` comment + rule with:

```tsx
        rules: [
          /**
           * `color-contrast` is owned by the token contrast policy (spec §5.4): every text/background
           * pair the components use is measured in `packages/design-tokens` on every build, with white
           * on the brand pink as the single declared exception at the AA-large floor. axe cannot scope
           * an exception to one pair, so here it is off; every other axe rule fails the story.
           */
          { id: "color-contrast", enabled: false },
        ],
```

- `options.storySort.order`:

```tsx
        order: [
          "Introduction", "Brand", "Colors", "Type", "Spacing", "Layout", "Motion", "Marketing",
          "Atoms", "Molecules", "Organisms", "Layouts", "Website", "App",
        ],
```

- Decorator: `<div className="font-body text-body text-text-body"><Story /></div>`.

- [ ] **Step 4: Founder guard covers the Storybook build**

Root `package.json` → `"guard:founder": "node scripts/check-founder-names.mjs apps/web/out apps/blog/out apps/storybook/storybook-static"`.

- [ ] **Step 5: Prove the consumer contract and the guard**

Run:

```bash
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -5
rtk proxy grep -l -- "--color-text-body" apps/storybook/storybook-static/assets/*.css | head -2
rtk proxy grep -l "w-logo-lockup" apps/storybook/storybook-static/assets/*.css | head -2
pnpm nx run-many -t build -p @pink-paprikaa-web/web @pink-paprikaa-web/blog 2>&1 | tail -3 && pnpm guard:founder
pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache 2>&1 | tail -8
```

Expected: the built CSS contains the semantic variables and the library's classes (the library scanned itself — Review Focus 4); the guard prints `Founder-name guard: clean.`; story tests pass.
If the guard flags a machine path under the user's home directory inside `storybook-static`, the build is embedding absolute paths (usually docgen or source maps): find the file with `rtk proxy grep -rl "Users/" apps/storybook/storybook-static | head`, remove the cause in `.storybook/main.ts` (e.g. disable build source maps in `viteFinal`), and rerun. **Never narrow the guard.**

- [ ] **Step 6: Visual check**

Run `pnpm nx run @pink-paprikaa-web/storybook:serve` and open `http://localhost:6006`. Confirm: sidebar starts with Introduction then Atoms; Atoms/Logo renders the lockup in brand pink in Poppins-free vector form, the white tone on the pink panel, the badge on its plate; Atoms/Icon renders all sizes. Stop the server.

- [ ] **Step 7: Commit**

```bash
git add -A apps/storybook package.json pnpm-lock.yaml
git commit -m "feat(storybook): consume the design system like an app

Tailwind plus the library's one stylesheet, self-hosted brand fonts, the
design system's thirteen tab groups as the sidebar order, and the contrast
policy documented in place of the old blanket exemption. The founder guard
now scans the Storybook build too.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: The authoring contract and the records

**Files:**

- Create: `packages/ui/AUTHORING.md`
- Modify: `docs/engineering/02-architecture.md`, `docs/engineering/05-tooling-and-config.md`, `docs/engineering/06-quality-gates.md`, `docs/engineering/09-decision-log.md`, `docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md`, `.claude/commands/new-component.md`, `packages/ui/README.md`

**Interfaces:**

- Produces: the binding rules every Plan 2–4 implementer reads before writing a component.

- [ ] **Step 1: `packages/ui/AUTHORING.md`** — the binding contract, in this order (concise, examples from the real Icon/Logo code):
  1. Sources: read the component's `.d.ts`, `.jsx`, `.card.html`, `.prompt.md` in `zip-files/Pink Paprikaa Design System/components/<tier>/` and spec §9 row first.
  2. File set and placement (`<layer>/<kebab>/<kebab>.tsx|.test.tsx|.stories.tsx`), layers and the atom import rule.
  3. Canonical shape (spec §8.1) with `componentVariants`, native props spread, `className` merge, `asChild` via `Slot` from `radix-ui` where the spec row says so.
  4. The prop translation table (spec §8.2) verbatim.
  5. Tokens first: any value not in the token build becomes a component token in `packages/design-tokens/tokens/component/<name>.json`, placed in the Tailwind namespace of its type (`spacing` for sizes, `text` for font sizes (typography composite), `color` for colours, `radius`, `shadow`); add the name to the list in `component-variants.ts`; if it paints text on a new background, add the pair to `contrast-pairs.json`.
  6. No arbitrary values; named utilities for motion/z (`duration-fast`, `z-header`, `press-scale`, `lift`).
  7. Surfaces: never an `on` prop; components that paint a field set `data-surface`.
  8. Server-first: `"use client"` only for state/effects/browser APIs, in the smallest file.
  9. Accessibility checklist (spec §5.5).
  10. Tests: behaviour by role/label, each variant's observable effect, keyboard paths, `expectNoA11yViolations`.
  11. Stories: card parity, `Playground`, `OnSurfaces` where surface-aware, `play` for client components, docs description from `.prompt.md`.
  12. Export from `src/index.ts`; gate commands.

- [ ] **Step 2: Handbook and spec records**
  - `02-architecture.md` §2: layers are `atoms → molecules → organisms → layouts`; `src/lib/` holds library internals (variant builder, artwork, reveal observer).
  - `05-tooling-and-config.md` registry: add `packages/design-tokens/contrast-pairs.json` (owner: contrast policy; change protocol: adding pairs is free, lowering a `min` is a decision-log event), `.prettierrc` plugin keys, `packages/ui/scripts/build-brand-artwork.mjs`.
  - `06-quality-gates.md` §2 registry: contrast policy test; `no-arbitrary-value`; `no-custom-classname`; atom-imports-only-Icon; naming-convention error; guard over `storybook-static`; class order by Prettier.
  - `09-decision-log.md`: add rows D1–D18 from the spec (one line each + spec link); close drift-ledger items "prettier-plugin-tailwindcss not installed" and "naming-convention promotion"; add "component tokens live in Tailwind namespaces; motion/z via named utilities" and "twMerge scale lists are hand-listed and asserted equal to the token build (no runtime token payload)".
  - Spec §6.2/§6.4/§8.3: amend to the implemented reality — component tokens are placed in Tailwind namespaces (`spacing`, `text`, `color`, `radius`, `shadow`) so they are named utilities; durations and z-indices are `@utility` classes; the twMerge lists are hand-written and asserted by `component-variants.spec.ts`.
  - `.claude/commands/new-component.md`: replace the stale `axe(...)` call with `expectNoA11yViolations`, `tv()` with `componentVariants`, add "read the four design-system source files", "tokens first", "card-parity stories".
  - `packages/ui/README.md`: consumer contract (two CSS imports, `transpilePackages` in Next apps), where the contract lives (AUTHORING.md).

- [ ] **Step 3: Final gate for Plan 1 (cold) and commit**

Run:

```bash
pnpm nx format:check && pnpm nx sync:check \
  && pnpm nx run-many -t typecheck lint test build --skip-nx-cache --outputStyle=static 2>&1 | tail -30 \
  && pnpm guard:founder
```

Expected: every task green; guard clean. Paste the summary lines.

```bash
git add -A docs packages/ui/AUTHORING.md packages/ui/README.md .claude/commands/new-component.md
git commit -m "docs: the design system authoring contract and plan 1 records

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
