# Design tokens — complete reference

240 custom properties across 8 files, generated from `tokens/*.css` (the source of truth). Use the variable, never the raw value. Tokens under a `[data-surface=…]` scope re-map text/border colours when a component sits on a brand, ink or soft surface.

## colors.css

**Scope:** `:root`

| Token | Value | Note |
|---|---|---|
| **── Brand pink (primary) ─────────────────────────────** | | |
| `--pink-50` | `#fff5f8` |  |
| `--pink-100` | `#ffdbe8` |  |
| `--pink-200` | `#ffb9ce` |  |
| `--pink-300` | `#fa8bab` |  |
| `--pink-400` | `#f4568a` |  |
| `--pink-500` | `#ee2c68` | PRIMARY — logo pink |
| `--pink-600` | `#d21e55` |  |
| `--pink-700` | `#ab1544` |  |
| `--pink-800` | `#7c0e30` |  |
| **── Warm ink neutrals ────────────────────────────────** | | |
| `--ink-900` | `#1a1216` |  |
| `--ink-800` | `#2b1f25` |  |
| `--ink-700` | `#46373e` |  |
| `--ink-600` | `#6b5a62` |  |
| `--ink-500` | `#8f7f86` |  |
| `--ink-400` | `#b8abb1` |  |
| `--ink-300` | `#dcd3d7` |  |
| `--ink-200` | `#ece6e8` |  |
| `--ink-100` | `#f7f3f4` |  |
| `--ink-000` | `#ffffff` |  |
| **── Desi spice accents (secondary, use sparingly) ────** | | |
| `--turmeric` | `#f2b233` |  |
| `--turmeric-soft` | `#fdf1d6` |  |
| `--tandoor` | `#e4572e` |  |
| `--tandoor-soft` | `#fdeae3` |  |
| `--mint` | `#2fa37c` |  |
| `--mint-soft` | `#e2f4ed` |  |
| `--kesar` | `#7a3ea8` |  |
| `--kesar-soft` | `#f1e8f8` |  |
| **── Semantic surfaces ────────────────────────────────** | | |
| `--surface-page` | `var(--ink-000)` |  |
| `--surface-page-alt` | `var(--pink-50)` |  |
| `--surface-card` | `var(--ink-000)` |  |
| `--surface-sunken` | `var(--ink-100)` |  |
| `--surface-brand` | `var(--pink-500)` |  |
| `--surface-brand-soft` | `var(--pink-100)` |  |
| `--surface-inverse` | `var(--ink-900)` |  |
| `--surface-overlay` | `rgba(26,18,22,.56)` |  |
| `--surface-glass` | `rgba(255,255,255,.72)` |  |
| **── Semantic text ────────────────────────────────────** | | |
| `--text-body` | `var(--ink-800)` |  |
| `--text-heading` | `var(--ink-900)` |  |
| `--text-muted` | `var(--ink-600)` |  |
| `--text-subtle` | `var(--ink-500)` |  |
| `--text-brand` | `var(--pink-500)` |  |
| `--text-on-brand` | `var(--ink-000)` |  |
| `--text-on-inverse` | `var(--ink-000)` |  |
| `--text-link` | `var(--pink-600)` |  |
| `--text-link-hover` | `var(--pink-700)` |  |
| **── Semantic borders ─────────────────────────────────** | | |
| `--border-subtle` | `var(--ink-200)` |  |
| `--border-default` | `var(--ink-300)` |  |
| `--border-strong` | `var(--ink-900)` |  |
| `--border-brand` | `var(--pink-500)` |  |
| `--border-brand-soft` | `var(--pink-200)` |  |
| **── Interaction ──────────────────────────────────────** | | |
| `--brand-hover` | `var(--pink-600)` |  |
| `--brand-active` | `var(--pink-700)` |  |
| `--focus-ring` | `0 0 0 3px var(--pink-200)` |  |
| `--focus-ring-inverse` | `0 0 0 3px rgba(255,255,255,.5)` |  |
| **── Status ───────────────────────────────────────────** | | |
| `--status-success` | `var(--mint)` |  |
| `--status-success-soft` | `var(--mint-soft)` |  |
| `--status-warning` | `var(--turmeric)` |  |
| `--status-warning-soft` | `var(--turmeric-soft)` |  |
| `--status-danger` | `#cf2222` |  |
| `--status-danger-soft` | `#fce9e9` |  |
| `--status-info` | `var(--kesar)` |  |
| `--status-info-soft` | `var(--kesar-soft)` |  |
| **── Spice heat scale (menu) ──────────────────────────** | | |
| `--heat-1` | `var(--mint)` |  |
| `--heat-2` | `var(--turmeric)` |  |
| `--heat-3` | `var(--tandoor)` |  |
| `--heat-4` | `var(--pink-600)` |  |

**Scope:** `[data-surface="brand"],[data-surface="ink"],.pp-on-brand,.pp-on-ink`

| Token | Value | Note |
|---|---|---|
| `--text-heading` | `var(--ink-000)` |  |
| `--text-body` | `rgba(255,255,255,.9)` |  |
| `--text-muted` | `rgba(255,255,255,.76)` |  |
| `--text-subtle` | `rgba(255,255,255,.62)` |  |
| `--text-link` | `var(--ink-000)` |  |
| `--text-link-hover` | `var(--ink-000)` |  |
| `--border-subtle` | `rgba(255,255,255,.22)` |  |
| `--border-default` | `rgba(255,255,255,.42)` |  |
| `--border-strong` | `var(--ink-000)` |  |
| `--focus-ring` | `var(--focus-ring-inverse)` |  |

**Scope:** `[data-surface="brand"],.pp-on-brand`

| Token | Value | Note |
|---|---|---|
| `--text-brand` | `var(--pink-100)` |  |

**Scope:** `[data-surface="ink"],.pp-on-ink`

| Token | Value | Note |
|---|---|---|
| `--text-brand` | `var(--pink-300)` |  |

**Scope:** `[data-surface="soft"],.pp-on-soft`

| Token | Value | Note |
|---|---|---|
| `--text-heading` | `var(--pink-800)` |  |
| `--text-brand` | `var(--pink-600)` |  |
| `--text-link` | `var(--pink-700)` |  |
| `--border-subtle` | `var(--pink-200)` |  |
| `--border-default` | `var(--pink-300)` |  |

**Scope:** `:root`

| Token | Value | Note |
|---|---|---|
| `--scrollbar-thumb` | `var(--pink-200)` |  |
| `--scrollbar-thumb-hover` | `var(--pink-300)` |  |
| `--scrollbar-track` | `transparent` |  |
| `--scrollbar-size` | `8px` |  |

**Scope:** `:root`

| Token | Value | Note |
|---|---|---|
| `--state-hover` | `var(--pink-50)` |  |
| `--state-press` | `var(--pink-100)` |  |
| `--state-hover-neutral` | `var(--ink-100)` |  |
| `--state-press-neutral` | `var(--ink-200)` |  |
| `--state-press-danger` | `#f8d4d4` |  |
| `--state-hover-on-color` | `rgba(255,255,255,.16)` |  |
| `--state-press-on-color` | `rgba(255,255,255,.28)` |  |
| `--state-hover-tint` | `rgba(26,18,22,.06)` |  |
| `--state-press-tint` | `rgba(26,18,22,.12)` |  |
| `--state-disabled-fill` | `var(--ink-100)` |  |
| `--state-disabled-ink` | `var(--ink-400)` |  |

## typography.css

**Scope:** `:root`

| Token | Value | Note |
|---|---|---|
| `--font-display` | `"Poppins","Segoe UI",system-ui,sans-serif` |  |
| `--font-body` | `"DM Sans","Segoe UI",system-ui,sans-serif` |  |
| `--font-devanagari` | `"Poppins","Nirmala UI",sans-serif` |  |
| `--font-mono` | `"Space Mono",ui-monospace,monospace` |  |
| `--weight-regular` | `400` |  |
| `--weight-medium` | `500` |  |
| `--weight-semibold` | `600` |  |
| `--weight-bold` | `700` |  |
| `--weight-black` | `800` |  |
| **Display — Poppins 800, tight and optically kerned** | | |
| `--fs-display-1` | `72px` |  |
| `--lh-display-1` | `1.02` |  |
| `--ls-display-1` | `-.03em` |  |
| `--fs-display-2` | `56px` |  |
| `--lh-display-2` | `1.05` |  |
| `--ls-display-2` | `-.025em` |  |
| **Headings — Poppins 700** | | |
| `--fs-h1` | `40px` |  |
| `--lh-h1` | `1.1` |  |
| `--ls-h1` | `-.02em` |  |
| `--fs-h2` | `32px` |  |
| `--lh-h2` | `1.15` |  |
| `--ls-h2` | `-.015em` |  |
| `--fs-h3` | `25px` |  |
| `--lh-h3` | `1.2` |  |
| `--ls-h3` | `-.01em` |  |
| `--fs-h4` | `20px` |  |
| `--lh-h4` | `1.3` |  |
| `--ls-h4` | `-.005em` |  |
| **Body — DM Sans 400/500** | | |
| `--fs-body-lg` | `18px` |  |
| `--lh-body-lg` | `1.6` |  |
| `--fs-body` | `16px` |  |
| `--lh-body` | `1.6` |  |
| `--fs-body-sm` | `14px` |  |
| `--lh-body-sm` | `1.55` |  |
| `--fs-caption` | `12.5px` |  |
| `--lh-caption` | `1.45` |  |
| **Overline / eyebrow — Poppins 700, all caps, wide** | | |
| `--fs-overline` | `11.5px` |  |
| `--lh-overline` | `1.2` |  |
| `--ls-overline` | `.14em` |  |
| **Mono — order codes, prices on receipts** | | |
| `--fs-mono` | `13px` |  |
| `--lh-mono` | `1.5` |  |
| `--ls-mono` | `.02em` |  |
| `--measure-prose` | `64ch` |  |
| `--measure-narrow` | `44ch` |  |

## spacing.css

**Scope:** `:root`

| Token | Value | Note |
|---|---|---|
| **Spacing — step N is N x 4px. --space-6 is 24px, always.** | | |
| `--space-0` | `0` |  |
| `--space-0-5` | `2px` |  |
| `--space-1` | `4px` |  |
| `--space-1-5` | `6px` |  |
| `--space-2` | `8px` |  |
| `--space-3` | `12px` |  |
| `--space-4` | `16px` |  |
| `--space-5` | `20px` |  |
| `--space-6` | `24px` |  |
| `--space-7` | `28px` |  |
| `--space-8` | `32px` |  |
| `--space-9` | `36px` |  |
| `--space-10` | `40px` |  |
| `--space-11` | `44px` |  |
| `--space-12` | `48px` |  |
| `--space-14` | `56px` |  |
| `--space-16` | `64px` |  |
| `--space-18` | `72px` |  |
| `--space-20` | `80px` |  |
| `--space-24` | `96px` |  |
| `--space-32` | `128px` |  |
| **Layout** | | |
| `--container-max` | `1200px` |  |
| `--container-wide` | `1440px` |  |
| `--gutter-mobile` | `20px` |  |
| `--gutter-desktop` | `40px` |  |
| `--section-y-mobile` | `56px` |  |
| `--section-y-desktop` | `96px` |  |
| `--header-h` | `88px` |  |
| `--tabbar-h` | `64px` |  |
| `--hit-min` | `44px` |  |

## breakpoints.css

**Scope:** `:root`

| Token | Value | Note |
|---|---|---|
| **Breakpoints — mobile-first min-widths. Also the sizes every design must survive.** | | |
| `--bp-sm` | `480px` |  |
| `--bp-md` | `768px` |  |
| `--bp-lg` | `1024px` |  |
| `--bp-xl` | `1280px` |  |
| `--bp-2xl` | `1440px` |  |
| **Fluid type — safe on every screen from 360px up. Prefer these in layouts; the fixed --fs-* values stay for specimen and fixed-canvas work.** | | |
| `--fs-display-1-fluid` | `clamp(40px,7vw,72px)` |  |
| `--fs-display-2-fluid` | `clamp(34px,5.4vw,56px)` |  |
| `--fs-h1-fluid` | `clamp(28px,3.6vw,40px)` |  |
| `--fs-h2-fluid` | `clamp(24px,2.8vw,32px)` |  |
| `--fs-h3-fluid` | `clamp(20px,2.1vw,25px)` |  |
| `--fs-h4-fluid` | `clamp(17px,1.6vw,20px)` |  |
| `--fs-body-fluid` | `clamp(15px,1.1vw,16px)` |  |
| **Fluid rhythm** | | |
| `--gutter-fluid` | `clamp(20px,4vw,40px)` |  |
| `--section-y-fluid` | `clamp(56px,7vw,96px)` |  |
| `--gap-grid` | `clamp(16px,2vw,24px)` |  |
| **Minimum grid track before a grid must collapse to fewer columns** | | |
| `--card-min` | `260px` |  |
| `--card-min-wide` | `320px` |  |

## canvas.css

**Scope:** `:root`

| Token | Value | Note |
|---|---|---|
| **Marketing canvas sizes — the exact pixel artboards the brand ships. Use with the PostFrame component; never invent a size outside this list.** | | |
| `--canvas-post-w` | `1080px` |  |
| `--canvas-post-h` | `1080px` |  |
| `--canvas-portrait-w` | `1080px` |  |
| `--canvas-portrait-h` | `1350px` |  |
| `--canvas-story-w` | `1080px` |  |
| `--canvas-story-h` | `1920px` |  |
| `--canvas-landscape-w` | `1200px` |  |
| `--canvas-landscape-h` | `628px` |  |
| `--canvas-wide-w` | `1920px` |  |
| `--canvas-wide-h` | `1080px` |  |
| `--canvas-mpu-w` | `300px` |  |
| `--canvas-mpu-h` | `250px` |  |
| `--canvas-leaderboard-w` | `728px` |  |
| `--canvas-leaderboard-h` | `90px` |  |
| **Safe margins on a 1080 canvas. Nothing important outside these.** | | |
| `--canvas-pad` | `72px` |  |
| `--canvas-pad-tight` | `48px` |  |
| **Story safe area: platform chrome eats the top 250px and bottom 320px.** | | |
| `--story-safe-top` | `250px` |  |
| `--story-safe-bottom` | `320px` |  |
| **Canvas display type — these are for 1080px artboards, not for screens.** | | |
| `--fs-canvas-hero` | `132px` |  |
| `--fs-canvas-h1` | `96px` |  |
| `--fs-canvas-h2` | `72px` |  |
| `--fs-canvas-body` | `34px` |  |
| `--fs-canvas-caption` | `26px` |  |
| `--fs-canvas-overline` | `24px` |  |

## elevation.css

**Scope:** `:root`

| Token | Value | Note |
|---|---|---|
| **Radii — geometric, never fully soft. Diamond motif keeps corners crisp.** | | |
| `--radius-xs` | `4px` |  |
| `--radius-sm` | `6px` |  |
| `--radius-md` | `10px` |  |
| `--radius-lg` | `16px` |  |
| `--radius-xl` | `24px` |  |
| `--radius-pill` | `999px` |  |
| `--border-width` | `1px` |  |
| `--border-width-strong` | `2px` |  |
| **Shadows — warm ink tint, never neutral grey** | | |
| `--shadow-1` | `0 1px 2px rgba(43,31,37,.06),0 1px 3px rgba(43,31,37,.05)` |  |
| `--shadow-2` | `0 4px 12px rgba(43,31,37,.08)` |  |
| `--shadow-3` | `0 12px 32px -8px rgba(43,31,37,.16)` |  |
| `--shadow-4` | `0 24px 56px -16px rgba(43,31,37,.22)` |  |
| `--shadow-brand` | `0 8px 24px -6px rgba(238,44,104,.38)` |  |
| `--shadow-inset` | `inset 0 1px 0 rgba(255,255,255,.5)` |  |
| `--blur-glass` | `blur(14px)` |  |
| `--scrim-bottom` | `linear-gradient(to top,rgba(26,18,22,.78) 0%,rgba(26,18,22,.32) 46%,rgba(26,18,22,0) 100%)` |  |
| `--scrim-top` | `linear-gradient(to bottom,rgba(26,18,22,.6) 0%,rgba(26,18,22,0) 100%)` |  |

## motion.css

**Scope:** `:root`

| Token | Value | Note |
|---|---|---|
| `--dur-instant` | `80ms` |  |
| `--dur-fast` | `140ms` |  |
| `--dur-base` | `220ms` |  |
| `--dur-slow` | `340ms` |  |
| `--dur-page` | `480ms` |  |
| `--ease-out` | `cubic-bezier(.2,.8,.2,1)` |  |
| `--ease-in-out` | `cubic-bezier(.4,0,.2,1)` |  |
| `--ease-entrance` | `cubic-bezier(.16,1,.3,1)` |  |
| **One controlled overshoot, reserved for "added to cart" style confirmations** | | |
| `--ease-pop` | `cubic-bezier(.34,1.4,.64,1)` |  |
| `--press-scale` | `.97` |  |
| `--lift-y` | `-2px` |  |

## fonts.css

> Pink Paprikaa type system — FINAL.
> Poppins  : display, headings, buttons, overlines. Carries Devanagari, so
> "पैप्रिका" and dish names set in the same family as the Latin.
> DM Sans  : body, UI, form labels and helper text.
> Space Mono: order codes, receipt lines, promo codes.
> These three are the brand's typefaces. Do not substitute.

**Font imports (Google Fonts):**

- `@import url("https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,600&display=swap")`
- `@import url("https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&display=swap")`
- `@import url("https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap")`

## base.css — global element rules, utilities, keyframes

Imported by `styles.css`. Load once at app root.

```css
*,*::before,*::after{box-sizing:border-box}
body{margin:0;font-family:var(--font-body);font-size:var(--fs-body);line-height:var(--lh-body);color:var(--text-body);background:var(--surface-page);-webkit-font-smoothing:antialiased}
h1,h2,h3,h4,h5,h6{font-family:var(--font-display);color:var(--text-heading);margin:0;font-weight:var(--weight-bold)}
h1{font-size:var(--fs-h1);line-height:var(--lh-h1);letter-spacing:var(--ls-h1)}
h2{font-size:var(--fs-h2);line-height:var(--lh-h2);letter-spacing:var(--ls-h2)}
h3{font-size:var(--fs-h3);line-height:var(--lh-h3);letter-spacing:var(--ls-h3)}
h4{font-size:var(--fs-h4);line-height:var(--lh-h4);letter-spacing:var(--ls-h4)}
p{margin:0 0 var(--space-4);text-wrap:pretty;max-width:var(--measure-prose)}
a{color:var(--text-link);text-decoration-color:var(--pink-200);text-decoration-thickness:1.5px;text-underline-offset:3px;transition:color var(--dur-fast) var(--ease-out)}
a:hover{color:var(--text-link-hover);text-decoration-color:currentColor}
a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,[tabindex]:focus-visible{outline:2px solid var(--pink-500);outline-offset:2px;border-radius:var(--radius-xs)}
.pp-display-1{font-family:var(--font-display);font-weight:var(--weight-black);font-size:var(--fs-display-1);line-height:var(--lh-display-1);letter-spacing:var(--ls-display-1);color:var(--text-heading)}
.pp-display-2{font-family:var(--font-display);font-weight:var(--weight-black);font-size:var(--fs-display-2);line-height:var(--lh-display-2);letter-spacing:var(--ls-display-2);color:var(--text-heading)}
.pp-overline{font-family:var(--font-display);font-weight:var(--weight-bold);font-size:var(--fs-overline);line-height:var(--lh-overline);letter-spacing:var(--ls-overline);text-transform:uppercase}
.pp-mono{font-family:var(--font-mono);font-size:var(--fs-mono);letter-spacing:var(--ls-mono)}
.pp-fluid-display-1{font-family:var(--font-display);font-weight:var(--weight-black);font-size:var(--fs-display-1-fluid);line-height:var(--lh-display-1);letter-spacing:var(--ls-display-1)}
.pp-fluid-display-2{font-family:var(--font-display);font-weight:var(--weight-black);font-size:var(--fs-display-2-fluid);line-height:var(--lh-display-2);letter-spacing:var(--ls-display-2)}
.pp-fluid-h1{font-family:var(--font-display);font-weight:var(--weight-bold);font-size:var(--fs-h1-fluid);line-height:var(--lh-h1);letter-spacing:var(--ls-h1)}
.pp-fluid-h2{font-family:var(--font-display);font-weight:var(--weight-bold);font-size:var(--fs-h2-fluid);line-height:var(--lh-h2);letter-spacing:var(--ls-h2)}
.pp-fluid-h3{font-family:var(--font-display);font-weight:var(--weight-bold);font-size:var(--fs-h3-fluid);line-height:var(--lh-h3);letter-spacing:var(--ls-h3)}
.pp-container{width:100%;max-width:var(--container-max);margin-inline:auto;padding-inline:var(--gutter-fluid)}
.pp-section{padding-block:var(--section-y-fluid)}
.pp-autogrid{display:grid;gap:var(--gap-grid);grid-template-columns:repeat(auto-fit,minmax(min(var(--card-min),100%),1fr))}
.pp-autogrid-wide{display:grid;gap:var(--gap-grid);grid-template-columns:repeat(auto-fit,minmax(min(var(--card-min-wide),100%),1fr))}
.pp-cluster{display:flex;flex-wrap:wrap;gap:var(--space-3);align-items:center}
.pp-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pp-clamp-3{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
img,svg,video{max-width:100%}
/* No browser-native chrome: scrollbars, search clear, number spinners, validation bubbles */
*{scrollbar-width:thin;scrollbar-color:var(--scrollbar-thumb) var(--scrollbar-track)}
*::-webkit-scrollbar{width:var(--scrollbar-size);height:var(--scrollbar-size)}
*::-webkit-scrollbar-track{background:var(--scrollbar-track)}
*::-webkit-scrollbar-thumb{background-color:var(--scrollbar-thumb);border-radius:99px;border:2px solid transparent;background-clip:padding-box}
*::-webkit-scrollbar-thumb:hover{background-color:var(--scrollbar-thumb-hover)}
input[type=search]::-webkit-search-cancel-button,input[type=search]::-webkit-search-decoration{-webkit-appearance:none;appearance:none}
input[type=number]{-moz-appearance:textfield;appearance:textfield}
input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
::selection{background:var(--pink-100);color:var(--pink-800)}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms !important;transition-duration:.01ms !important}}
@keyframes pp-toast-pop{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes pp-skeleton{0%,100%{opacity:1}50%{opacity:.55}}
@keyframes pp-spin-pulse{0%,100%{transform:rotate(45deg) scale(.7);opacity:.25}50%{transform:rotate(45deg) scale(1.15);opacity:1}}
@keyframes pp-dot-pulse{0%{transform:rotate(45deg) scale(1);opacity:.6}100%{transform:rotate(45deg) scale(2.4);opacity:0}}
@keyframes pp-rotate{to{transform:rotate(360deg)}}
@keyframes pp-sheet-in{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes pp-mark-pulse{0%,100%{transform:scale(.72);opacity:.35}50%{transform:scale(1.1);opacity:1}}
@keyframes pp-pop-in{from{opacity:0;transform:translateY(-4px) scale(.98)}to{opacity:1;transform:none}}

```
