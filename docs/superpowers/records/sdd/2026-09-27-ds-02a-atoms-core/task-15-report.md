# Task 15 — Tier parity review (plan 2a atoms) — report

Status: **DONE**. Base `ecbcad1`. One fix, commit `3657323`. 1 fixed / 39 listed.

## Method

- Both sides served: the cards with `python3 -m http.server 4400` on the zip directory, and Storybook with
  `pnpm nx run @pink-paprikaa-web/storybook:serve` on port 6006. unpkg was reachable, so every card rendered
  (React 18, Babel from the CDN). Both servers were stopped at the end.
- `shoot.mjs` (the brief's script, with paths moved to the scratchpad `pp-parity/`) took 13 cards and 118
  stories at 360 and 1280. None of the screenshots are committed.
- The screenshots were reviewed with Read. A helper, `sheet.mjs`, built one sheet per atom per width: the
  card beside every story, cropped to `#storybook-root > *`. It also flagged any story whose
  `scrollWidth` > viewport as `HSCROLL`.
- Screenshots alone can't show exact values, so `probe.mjs` dumped computed styles for the same elements on
  both sides: box size, padding, gap, radius, font family/size/weight/tracking/line-height/case, colour, background,
  border, shadow, opacity and data-surface. Most rows below come from comparing those tables. The PatternField
  texture was compared by sampling pixels with PIL: the card and the story gave identical pixel colours on
  brand, ink and soft, with 0.42 vs 0.40 mark coverage.

The brief's accepted-difference table applies throughout. Its rows appear below as "listed (brief)".

## Per-atom tables

### Text
| difference | fixed / listed | reason |
| --- | --- | --- |
| Font rasterisation | listed (brief) | Self-hosted Fontsource vs the zip's CDN fonts (spec §11.4) |
| display-1/2 at 72/56px, not the card's 44/34px | listed (brief) | The card shrinks them to fit its frame |
| `tone="brand"` / overline pink-600 (card pink-500) | listed | AA re-pointing of `text-brand` (spec §5.3). pink-500 on white is below 4.5:1 for body sizes |
| `tone="subtle"` ink-600 (card ink-500) | listed | AA re-pointing of `text-subtle` (spec §5.3) |
| Headings story stacks h1–h4 as blocks; the card shows them inline | listed | Story layout only. Sizes, weights, tracking and line-heights match exactly (40/32/25/20, 700) |
| Deferred minor (T2): TextProps extends `ComponentProps<"p">` | listed | Contract §2 question, routed here by the ledger. It is not a visual difference, so it is left for the contracts owner |

### Link
| difference | fixed / listed | reason |
| --- | --- | --- |
| none in size/weight/colour/gap (13.5/15/17px, 500, gap 6, pink-600 / ink-600 / ink-700 / white) | — | exact match |
| `quiet` has no underline on hover | listed (brief) | `Link.jsx` wins |
| An external link carries the sr-only "Opens in a new tab" | listed | R36/R44, a ruling |

### PatternField
| difference | fixed / listed | reason |
| --- | --- | --- |
| none: the tile, the 8%/9% opacity and the field colours are pixel-identical | — | Verified by pixel sampling |
| Story default radius and extra tones (light, faint, 56–96 tiles) are not on the card | listed | Contract additions (faint = handoff C7). The card shows only brand/ink/soft |

### SocialHeadline
| difference | fixed / listed | reason |
| --- | --- | --- |
| True canvas pixels, not the card's 40% scale; horizontal scroll at 360 in playground/hero/h1-h2/on-a-canvas | listed (brief) | PostFrame (Plan 2c) scales artboards |
| Body copy is text-body (ink-800; white on dark) | listed (brief) | Handoff §3.2.2 |
| Sizes, line-heights and tracking (hero 132/0.96/−.035em, h1 96/1/−.03, h2 72/1.05/−.025, body 34/1.45/500, caption 26/1.4, overline 24/1.2) | — | exact match with `SocialHeadline.jsx` |

### Button
| difference | fixed / listed | reason |
| --- | --- | --- |
| **Primary on a pink field kept the pink brand glow; the card uses shadow-2** | **fixed** in `packages/ui/src/styles.css` (+ play test in `button.stories.tsx`) | Real defect. Tailwind's `shadow-*` inlines the theme value (`--tw-shadow: var(--shadow-brand)`), so the `surface/brand.json` override of `--shadow-button-primary` never reached the class. The token file states "shadow-2 on a pink field" |
| Secondary hover tints pink-50; ghost on brand has no border | listed (brief) | Readme §3.8; C9 |
| Disabled/loading secondary keeps a 2px transparent border, so it is 4px wider than the card's (124.8 vs 120.8) | listed | The border does not drop on disable, so toggling the state causes no layout shift. Fill and colour match (ink-200 / ink-400) |
| Horizontal scroll at 360 in `isFullWidth` / `long label at 360px` (392px) | listed | Story frame is `w-90` (360px) plus Storybook padding. The Button stays inside the frame, as the LongLabel play asserts |
| `inverse` is near-invisible on the ink section (OnSurfaces) | listed | Deferred T6 minor. C9 says inverse = solid ink everywhere; this is a design question, not parity |
| No `isExternal` | listed | R45 |
| Heights 36/44/54, padding 14/20/28, gap 6/8, type 13/15/17 700 −.005em, colours and shadows on page | — | exact match |

### IconButton
| difference | fixed / listed | reason |
| --- | --- | --- |
| Disabled is a grey fill (zip: 45% opacity) | listed (brief) | Readme §3.8 |
| Primary turns white on a brand field | listed (brief) | Shares Button's surface skin |
| Sizes 32/40/48, glyph 16/20/24, secondary 1px ink-300, glass + shadow-2, ghost white on brand | — | exact match |
| Count bubble (18px, 10.5px 700) not on the card | listed | Contract addition, built to the handoff's cart bubble |

### Tag
| difference | fixed / listed | reason |
| --- | --- | --- |
| Disabled is a grey fill (zip: 50% opacity) | listed (brief) | Readme §3.8 |
| Zone tones keep Tag geometry | listed (brief) | One component, one geometry |
| A long label ellipsises | listed (brief) | Review Focus 1 |
| A static tag renders `<span>`, not a `<button>` without `onClick` | listed | Semantics: a non-interactive pill is not a button. Pixels identical |
| Selected tag on brand is ink-900 | listed | `tag.selected` surface token (pink would vanish on pink). The card has no on-brand row |
| Horizontal scroll at 360 in `category-filter-rail` / `long label` (392px) | listed | `w-90` story frame plus padding. The play asserts the Tag stays inside the frame |
| 38px, padding 16, gap 6, 14px 500, borders/colours | — | exact match |

### Card
| difference | fixed / listed | reason |
| --- | --- | --- |
| Text on brand/ink cards is white 100% (card root colour white 90%) | listed | Surface token `text-body` = ink-000 on brand/ink; the card story's `inner()` helper set .9 inline |
| Default card carries `data-surface="light"` | listed | Light island (NestedSurfaces/LightIsland rulings). Pixels identical |
| Radii 16/24, 1px ink-200 border, shadow-1, brand glow, paddings 16/20/28 | — | exact match |
| `isInteractive` cursor over the whole card | listed | Deferred T9 minor (plan-mandated) |

### Divider
| difference | fixed / listed | reason |
| --- | --- | --- |
| On brand the rule is white 22% (zip 28%) | listed (brief) | One hairline token, `border-subtle` |
| Label ink-600 (card ink-500); on brand white 85% (card 80%) | listed | `text-subtle` AA re-pointing and its brand-surface value. Semantic token, no component colour |
| Labelled divider is 13.8px tall (card 18.4px) | listed | The label uses the `text-overline` token (line-height 1.2). The card's label inherits the body's 1.6. The rule sits centred either way |
| Diamond 16px at .9 opacity, gaps 12/14 | — | exact match |

### ImageSlot
| difference | fixed / listed | reason |
| --- | --- | --- |
| Labels pink-700 / pink-800 / ink-600 | listed (brief) | AA re-pointing, contract deviation 5 |
| Card ratio row stretches every slot to 106.7px tall | listed | Card artifact: a flex row with `align-items: stretch` overrides the aspect ratio. Ours keeps true ratios (1:1 = 96×96) |
| Horizontal scroll at 360 in `tones` (416px) / `radii` (548px) | listed | Story rows are fixed-width slots in a non-wrapping flex row; the component itself is `w-full` |
| Label 10.5px 700 .12em uppercase, padding 12, radius 10 | — | exact match |

### Badge
| difference | fixed / listed | reason |
| --- | --- | --- |
| none: 21.8px tall, padding 4/10, gap 5, 11.5px 700 1.61px, all seven tones | — | exact match |
| Brand badge on a pink field flips to white with pink-600 text | listed | Component surface token (brand.json). The card has no on-brand row |
| A long label ellipsises | listed (brief) | Review Focus 1 |

### StatusDot
| difference | fixed / listed | reason |
| --- | --- | --- |
| none: 14/16px diamond, radius 2 (`rounded-diamond`, R47), mark at 80% and .66 opacity, label 13.5px 500, gap 8, pulse | — | exact match with `StatusDot.jsx` |
| A blank label counts as no label | listed | R48 |

### Avatar
| difference | fixed / listed | reason |
| --- | --- | --- |
| none: sizes 24–80, initials 10/12/15/21/30 700 −.01em, pink-100/pink-700, ring 2px white + 4px pink-500, glyph at half size | — | exact match |
| Initials line-height 1 (card inherits 1.6) | listed | Grid-centred, so there is no visual change |
| The ring blends into a brand field | listed | Deferred T14 minor; no on-brand variant is designed |

## Fix

**Button — primary on a pink field showed the brand glow instead of shadow-2.**

- Root cause: Tailwind 4.3.3's `shadow` functional utility resolves the theme value itself
  (`e.get(["--shadow-…"])`, `node_modules/tailwindcss/dist/lib.js`), which makes it
  `.shadow-button-primary { --tw-shadow: var(--shadow-brand) }`. The `[data-surface="brand"]` remap of
  `--shadow-button-primary` to `var(--shadow-2)` was therefore dead. The colour tokens are unaffected because
  `bg-*`/`text-*` emit `var(--color-…)`. No other surface-overridden shadow token is used as a utility:
  `--shadow-focus-ring` has no class usage.
- Fix, in `packages/ui/src/styles.css`: add `@utility shadow-button-primary { --tw-shadow: var(--shadow-button-primary); }`.
  A Tailwind compile test showed that Tailwind merges this into the generated rule, and the later
  declaration wins. The variable is now read at the element, so the surface remap applies. Composition with ring/inset shadows is
  kept, and `disabled:shadow-none` still wins through its `:disabled` specificity.
- Test (TDD), in `packages/ui/src/atoms/button/button.stories.tsx`: the `OnBrand` story gains a `play` that paints a
  probe with `var(--shadow-2)` and expects the primary's computed `box-shadow` to contain it.
  - RED before the fix: `expected 'rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgb…' to contain 'rgba(43, 31, 37, 0.08) 0px 4px 12px 0…'`
  - GREEN after the fix: `3 passed, 0 failed` for `-t "on a brand surface"`.
- Re-probed: page primary still shows `rgba(238,44,104,.38) 0 8px 24px -6px`. Primary on brand shows
  `rgba(43,31,37,.08) 0 4px 12px`, which matches the card. Disabled still shows none. Reshot Button at both widths.

## Gate output

Step 4, `pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache`:
```
 ✓ |storybook (chromium)| ../../packages/ui/src/atoms/text/text.stories.tsx (13 tests) 206ms
 ✓ |storybook (chromium)| ../../packages/ui/src/atoms/pattern-field/pattern-field.stories.tsx (9 tests) 189ms
 Test Files  15 passed (15)
      Tests  127 passed (127)
 NX   Successfully ran target test for project @pink-paprikaa-web/storybook and 1 task it depends on
```

Step 5, cold tier gate, run after stopping the servers:
```
 NX   The workspace is up to date
[@nx/js:typescript-sync]: All files are up to date.
 NX   Successfully ran targets typecheck, lint, test, build for 3 projects and 3 tasks they depend on
  Cache:             Skipped (--skip-nx-cache)
Founder-name guard: clean.
```

`pnpm nx run-many -t test -p ui design-tokens --skip-nx-cache`: design-tokens 189 passed (4 files), ui 382 passed (23 files).
`pnpm nx format:check`: clean. Prettier reported the two edited files already formatted.

## Commits

- `3657323` fix(ui): give primary Button shadow-2 on a pink field
