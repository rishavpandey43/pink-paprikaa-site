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

