# Batch D report: Tasks 7 (IconButton), 8 (Tag), 9 (Card)

Base a4180e9. Status: **DONE_WITH_CONCERNS** (the concerns are minor and none of them block). Commits: `57cb80a` (Task 7), `850e2e6` (Task 8), `a22e287` (Task 9).

Overlay applied (fold list items 1 to 11, plus the global-constraints amendments):

- R13: every optional custom prop of `IconButtonProps`, `TagProps` and `CardProps` is declared `?: … | undefined`.
- Item 10: the barrel export went in before each gate.
- No `max-w-prose`.
- These tests read no files, so R15 does not apply.
- These components use no SymbolMark or pattern utilities, so R19 and R25 do not apply.
- R44: none of the three components adds an `isExternal` prop, which follows R45 (see Concerns).

Tests, code and stories are the brief's code, taken verbatim with the R13 edits applied. I extracted them straight from the brief blocks.

---

## Task 7: IconButton (`57cb80a`)

**Built**

- `tokens/component/icon-button.json`, verbatim: `spacing-icon-button-{sm,md,lg,count}`, `text-icon-button-count`, `color-icon-button-ghost-fg`.
- The surface skin:
  - `brand.json` and `ink.json` set `icon-button.ghost.fg` to `ink.000`.
  - `light.json` restores it to `ink.700`.
  - Each edit is one inserted line. The files were not reformatted.
- `contrast-pairs.json`: the brief's five groups (`icon-button`, `-count`, `-on-soft`, `-on-ink`, `-on-brand`).
- `component-variants.ts`: `SPACING` gains `icon-button-{sm,md,lg,count}` and `TEXT` gains `icon-button-count`.
- `packages/ui/src/atoms/icon-button/icon-button.{tsx,test.tsx,stories.tsx}` and the barrel export.

**Deviations from the brief:** R13 only, on `variant`, `size`, `count`, `asChild` and `children`. `const Component: ElementType = asChild ? Slot.Root : "button"` type-checks clean, so no cast was needed.

**Dev parity** (the brief's table, copied and extended)

| Dev item | Ruling | Where / reason |
| --- | --- | --- |
| `on="brand"` compound skins | DROP | D5: primary and ghost follow the surface (Step 1 tokens) |
| Two-element hit target (a 44px `min-h`/`min-w` button around the drawn circle) | ALREADY | a transparent `::before` pads sm/md to 44px; lg is 48px |
| Secondary on semantic `text-text-link` / `border-border-default` | ALREADY | a filled skin uses fixed primitives (atom-tier rule "Skins on surfaces") |
| Glass carries `shadow-elevation2` and hovers to card white | DROP | `IconButton.jsx` gives glass no hover; the card passes the shadow (`className="shadow-2"`, `Variants` story) |
| `size-8/10/12`, `rounded-6`, `(--layout-hit-min)` | DROP | D4; `icon-button-*` tokens |
| Tests: name from `label`, 44px target, `onClick`, disabled blocks, variants, sizes, grey disabled fill, one decorative glyph, axe | ALREADY | Step 2 |
| Test: caller className replaces the radius | ADD | done |
| Stories `Default`, `Variants`, `Sizes`, `OnBrand` | ALREADY | `Playground`, `Variants`, `Sizes`, `OnBrand` + `OnSurfaces` |
| Story `OverPhotography` (glass on a dark ground) | ADD | done |
| Story `States` (a disabled secondary too) | ADD | done; `Disabled` renders primary and secondary |
| *(extended)* Dev `not-disabled:` hover guards | ALREADY | `controlStates` disabled/aria-disabled classes (same as Button) |
| *(extended)* Dev `icon: LucideIcon` | DROP | `IconComponent` (lucide or brand glyph), AUTHORING §4 |
| *(extended)* Dev had no `count` and no `asChild` | ADD | brief (SiteHeader bubble, Slot) |

**Gates**

- Tokens: `pnpm nx build … design-tokens --skip-nx-cache && pnpm nx test … design-tokens --skip-nx-cache` gave 168 passed.
- TDD red: `Failed to resolve import "./icon-button"`, plus the index.spec barrel and trio checks.
- Prettier, then `pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static`: `Successfully ran targets typecheck, lint, test for 2 projects`. design-tokens 168 passed, ui 259 passed.
- `pnpm nx run @pink-paprikaa-web/storybook:build`: `Successfully ran target build`.

---

## Task 8: Tag (`850e2e6`)

**Built**

- `tokens/component/tag.json`, verbatim: `spacing-tag-h`, `text-tag`, `color-tag-selected`, `color-tag-selected-hover`.
- The surface skin:
  - `brand.json` sets `selected` to `ink.900` and `selected-hover` to `ink.800`.
  - `light.json` restores them to `pink.500` and `brand.hover`.
  - `ink.json` is unchanged, as the brief says.
- `contrast-pairs.json`: the groups `tag`, `tag-selected` and `tag-selected-on-brand`. The alias guard holds, because no surface overrides `brand.hover`.
- `component-variants.ts`: `SPACING` gains `tag-h` and `TEXT` gains `tag`.
- `packages/ui/src/atoms/tag/tag.{tsx,test.tsx,stories.tsx}` and the barrel export (`Tag`, `TagProps`, `tagVariants`).

**Deviations from the brief:** R13 only, on `isSelected`, `icon` and `tone`.

**Dev parity** (the brief's table, copied and extended)

| Dev item | Ruling | Where / reason |
| --- | --- | --- |
| Always a `<button aria-pressed>` | DROP | spec §9.1 (`<button>` with `onClick`, `<span>` without) |
| `h-9.5`, `rounded-6`, `text-body2`, `bg-brand-primary` | DROP | D4; `tag-h` / `text-tag` tokens |
| Unselected hover also tints the border (`border-brand-soft`) | DROP | `Tag.jsx` keeps the border; readme §3.8 tints the fill only |
| A selected, pressable tag darkens on hover | ADD | done: `color-tag-selected-hover`, a compound variant and a test |
| Press scale (`active:scale`) | ADD | done: `isInteractive` variant and a test |
| Tests: pressed state, selected fill, 38px, `onClick`, disabled blocks, grey disabled fill, axe | ALREADY | Step 2 |
| Test: the glyph is not announced twice | ADD | done |
| Test: caller className replaces the radius | ADD | done |
| Stories `Default`, `Selection`, `WithIcons` | ALREADY | `Playground`, `Selectable`, `WithIcon` |
| Story `Disabled` includes a disabled selected tag | ADD | done |
| Story `CategoryFilterRail` (six categories, wrapping at 360px) | ADD | done |
| *(extended)* Dev `Omit<…, "color">` + `VariantProps` on the props | DROP | contract `extends ComponentProps<"button">` with the unions spelled out |
| *(extended)* Dev `icon?: LucideIcon` | DROP | `IconComponent` |
| *(extended)* Dev had no `tone` | ADD | brief (delivery-zone chips) |

**Gates**

- Tokens: build + test gave 177 passed.
- TDD red: `Failed to resolve import "./tag"` (3 failed, 256 passed).
- Prettier, then the run-many gate: `Successfully ran targets typecheck, lint, test for 2 projects`. design-tokens 177 passed, ui 276 passed.
- `storybook:build`: success.
- Extra: `pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache` gave 9 files and 84 tests passed. That includes the Tag `Selectable` and `LongLabel` play functions (it stays inside the 360px frame at a height of 38).

---

## Task 9: Card (`a22e287`)

**Built**

- Step 1: `grep` on `dist/theme.css` prints `--shadow-3`, `--radius-lg: 16px` and `--radius-xl: 24px`. No tokens were added.
- `packages/ui/src/atoms/card/card.{tsx,test.tsx,stories.tsx}` and the barrel export.

**Deviations from the brief**

1. R13, on `variant`, `padding`, `isInteractive` and `asChild`.
2. Barrel order: I moved `Card` above `IconButton` so the atoms read alphabetically. Only that line moved.

**Dev parity** (the brief's table, copied and extended)

| Dev item | Ruling | Where / reason |
| --- | --- | --- |
| Flooded skins set `text-text-on-brand` / `on-inverse` on the root | ALREADY | the card sets `data-surface` (D5), so all of its content follows |
| `rounded-4/5`, `shadow-elevation*`, `translate-y-(--motion-lift-y)` | DROP | D4; AUTHORING §6 (`hover:lift`) |
| A transition on every card | ALREADY | only an interactive card changes, so only it animates |
| Tests: default skin, five skins, per-skin radius, paddings, lift only when interactive, axe | ALREADY | Step 2 |
| Test: an interactive card never fades (no opacity) | ADD | done |
| Test: a nested link owns the interaction inside an interactive card | ADD | done |
| Test: caller className replaces the radius | ADD | done |
| Brand-card support line stepped up to 20px bold (AA-large) | DROP | spec §5.1: white on the brand fill is the declared exception |
| Stories `Default`, `Skins`, `MediaCard` | ALREADY | `Default`, `FeatureQuiet` + `BrandInk`, `PaddingNone` |
| Story `Padding` (sm/md/lg) | ADD | done: `Paddings` |
| Story `Interactive` with a nested link | ADD | done: `InteractiveWithLink` |
| *(extended)* Dev `CardProps` from `VariantProps` | DROP | the contract unions are spelled out |
| *(extended)* Dev had no `asChild` | ADD | brief (Slot, `no-underline`) |

**Gates**

- TDD red: `Failed to resolve import "./card"` (3 failed, 273 passed).
- Prettier, then the run-many gate: `Successfully ran targets typecheck, lint, test for 2 projects`. design-tokens 177 passed, ui 295 passed. `lint test` re-ran after the barrel reorder and passed.
- `storybook:build`: success.
- Extra: `storybook:test --skip-nx-cache` gave 10 files and 93 tests passed. That includes the Card `LightIsland` play, which checks the computed ink-800 text on a white card inside the brand field.

---

## Concerns (minor, not blocking)

- **R44 and R45:** no new external-link path. Tag never renders a link. For a Card, a new-tab `<a>` passed through `asChild` is the caller's anchor, so, as with Button under R45, there is no announcement unless the caller uses `Link`.
- **IconButton `{...props}` after `{...state}`:** this has the same shape as the Button minor. A caller's `aria-disabled={false}` on `asChild` overrides the disabled state.
- **Static Tag and `button` props:** a static Tag still accepts button-only props from the `ComponentProps<"button">` contract (`form`, `name`, `value`), and they land on the `<span>`. The contract is followed as written.
- **Disabled hover:** IconButton and Tag rely on Tailwind's variant order, where `disabled:`/`aria-disabled:` is emitted after `hover:`, so the grey fill beats the hover tint. Button already relies on the same thing.
