## Global Constraints

Plan 1's list, verbatim:

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
- Commits: Conventional Commits, author with `git commit -m` (commitlint runs in the `commit-msg` hook). Allowed scopes: `web blog storybook ui tokens content seo utils tools ci deps`. Every commit message ends with the `Co-Authored-By:` trailer the harness supplies for the model actually running (the `Claude <model>` in the examples below is a placeholder — substitute it, never commit it literally). **Never `--no-verify`**, never `eslint-disable` a LAW rule.
- Verify APIs against the **installed** package (`node_modules/<pkg>`), never memory.
- A task is done only when its gate command output is green and pasted in the report.

Tier rules for this plan:

- **An atom imports only `../icon/icon`, `../../lib/*` and packages** — never another atom, and that includes its stories (the atomic-layering lint covers `*.stories.tsx`). Where a design-system card shows an `IconButton` or `Button` as a trigger or trailing slot, the story uses a plain `<button>`; the parity review lists it.
- **Dimensions (same rule as Plan 2a):** sizes the design system names for a component — control heights, box and glyph sizes, label type, off-scale radii, focus-ring shadows — are component tokens in `tokens/component/<name>.json`, in the Tailwind namespace of their type (`spacing` for sizes, `text` typography composites for font sizes, `shadow`, `radius`). Paddings, gaps and offsets use quarter steps of the 4px `--spacing` multiplier (`px-3.5`, `gap-2.5`, `gap-1.25`, `top-0.75`, `translate-x-4.5`). Stock numeric utilities whose number _is_ the design value are allowed: `border`, `border-2`, `border-6`, `outline-2`, `opacity-<n>`, `rotate-45`, fraction sizes (`size-4/5`).
- **Props (Plan 2a rule + ruling R13):** public `…Props` interfaces spell every union out, exactly as in the contract — never `extends VariantProps<…>` (Storybook's docgen drops types declared in `node_modules`). **Every optional custom prop is declared `name?: T | undefined`**, matching React's DOM prop types, so a molecule can forward a possibly-undefined value under `exactOptionalPropertyTypes`.
- **Never `max-w-prose`:** Tailwind 4.3's static `max-w-prose` (65ch) shadows `--container-prose`. Use Plan 2a's `max-w-text-measure-prose` (64ch) for a prose measure.
- **Slot:** Tooltip's `Trigger asChild` slots onto the consumer's element; the system never adds classes to a slotted child (Slot joins child classes without tailwind-merge).
- **The only inline `style`** is data-driven geometry a class cannot express: Rating's partial fill (`clip-path`) and ProgressBar's width — a computed percentage, never a design value.
- **Every new token name goes into its list in `packages/ui/src/lib/component-variants.ts`** (`SPACING`, `TEXT`, `SHADOW`, `RADIUS`). There is no colour list (tailwind-merge treats every `bg-*`/`text-*` colour alike). `component-variants.spec.ts` fails the gate if a name is missing.
- **Native-backed form controls** (Input, Select, Checkbox, Radio, Switch, Slider): `className` styles the visible box or row; **every other prop — including `register()`'s `ref`, `name`, `onChange`, `onBlur` — lands on the native element**. Checked, disabled and invalid styling is CSS off the native element (`group-has-*`, `has-disabled:`), so controlled, uncontrolled and RHF usage all work without state.
- **Server-safe unless stated:** no hooks except `useId`, no handlers created inside. `"use client"` appears only in `tooltip.tsx` and `countdown.tsx`.
- **A spec that reads a file** builds its path with `join(import.meta.dirname, "…")` from `node:path`, never `new URL("…", import.meta.url)` — Vite rewrites the latter to an `http://localhost` URL under Vitest's jsdom environment (ruling R15). No test in this plan reads a file; the rule stands for any added later.
- **Stories** import `OnSurfaces` from `../../lib/story-surfaces` (Plan 2a) and export the story as `OnSurfacesStory` with `name: "OnSurfaces"` (the helper owns the bare name). A surface-aware component — its text or its light island follows `data-surface` — gets one.
- **Impossible input throws `RangeError`** at render (a Rating above its max, a struck price that is not higher, a backwards range, an end time without an offset, a non-finite progress value). On a static export that fails the build — a page never renders a misleading number.
- **Imports** follow `perfectionist/sort-imports` groups: `import type` from packages → package values → `import type` from relatives → relative values, one blank line between groups. lint-staged runs `eslint --fix` and Prettier on commit; each gate step runs Prettier first (it also sorts classes — a reordered class list after formatting is expected).

## Review Focus

1. **`register()` must reach the native element** of Input (and its textarea), Select, Checkbox, Radio, Switch and Slider — `ref`, `name`, `onChange`, `onBlur` — or react-hook-form silently loses fields. Pinned in each of those tasks by spreading `fakeRegister(name)` (Task 1: the exact `{ name, onChange, onBlur, ref }` shape `register()` returns) and asserting the ref receives the native element and the events fire. RHF itself is not a `ui` dependency (spec D17).
2. **A long option label in Select at 360px** must never widen its box or the page. Pinned in Task 3 twice: a unit test asserts the select overlays its box (`absolute inset-0 size-full truncate`, box `w-full min-w-0`), and the `long option label at 360px` story's `play` measures the box against a 360px frame in real Chromium (`storybook:test`).
3. **Countdown across SSR and expiry** — the server HTML holds a stable placeholder, hydration reports no mismatch, it ticks only after mount, swaps to `fallback` the second the offer ends, renders nothing by default after expiry, clears its interval on unmount, and rejects an end time without an offset. Pinned in Task 16.
4. **PriceTag with `was` ≤ the price, or `to` < `amount`** — both would print a misleading discount or a backwards range. Pinned in Task 14: each throws `RangeError`.
5. **Rating half values and 0** — 4.5 clips the fifth diamond at exactly 50% in screen space, 4.3 at 30%, 0 draws no fill yet still names "0 out of 5", and a score outside `0…max` throws. Pinned in Task 11.

## Contract deviations

Contract changes (all additive; nothing the contract declares is removed or renamed):

| #   | Contract item        | Change                                                        | Reason                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --- | -------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `SelectProps`        | adds `readOnly?: boolean \| undefined`                        | Spec §9.1 lists readOnly for Select, `Select.card.html` has a "readOnly / disabled" row, and `guidelines/form-states.card.html` gives read-only to "Input, Select". A native `<select>` has no `readonly`, so the prop renders it `disabled` (not submitted) with the sunken fill and lock glyph. Named `readOnly` (not `isReadOnly`) so Select and Input take the same prop.                                          |
| 2   | `RadioGroupProps`    | adds `message?: ReactNode`                                    | A `Field` cannot label a `<fieldset>`, so a group's status needs its own message — spec §5.5 forbids a status by colour alone. Rendered under the options with the status glyph and wired as the group's `aria-describedby`.                                                                                                                                                                                           |
| 3   | `ProgressBarProps`   | adds `isLabelHidden?: boolean \| undefined`                   | `label` is required (it is the progressbar's name), but `ProgressBar.card.html` rows "continuous", "tone" and "inverse" show bars without a visible label. Hides it visually, keeps the name. Same pattern as the contract's `RadioGroup.isLegendHidden`.                                                                                                                                                              |
| 4   | `SwitchProps`        | adds `isLabelHidden?: boolean \| undefined`                   | The app kit puts a bare `Switch` in a `ListRow` whose title already labels it; a required visible label would print twice.                                                                                                                                                                                                                                                                                             |
| 5   | `FIELD_STATUS_ICON`  | warning → `TriangleAlert` (not `AlertTriangle`/`CircleAlert`) | The contract says "match Field.jsx": it draws `triangle-alert`. `TriangleAlert` is lucide-react 1.30's name for it (`AlertTriangle` is the deprecated alias).                                                                                                                                                                                                                                                          |
| 6   | `PriceTagProps.size` | adds `"canvas"` (controller ruling)                           | The readme: "Prices on artwork use PriceTag scaled up"; Plan 5's Marketing kit prints prices on 1080px artboards. `canvas` is 56px — the price on `ui_kits/marketing/FeedArtboards.jsx` DishLaunchPost, under a canvas-h1 headline (the canvas scale has no 56 step; the carousel's 44px price is one `className` away). The struck price and a range follow proportionally because they are `em`-relative to the tag. |

Additions outside the contract (internal to `packages/ui`, not exported from `index.ts` unless stated):

- `lib/field-control.tsx` — `FieldControl`, `FieldControlProps`, `fieldControlVariants`: the shared field box. Plan 3a's SearchField and OtpInput can render inside it instead of re-drawing the chrome.
- `lib/choice-control.tsx` — `ChoiceControl`, `choiceVariants`, `joinIds`: the shared checkbox/radio/switch row.
- `lib/brand-diamond.tsx` — `BrandDiamond`: the rotated square with Plan 2a's `SymbolMark` inside.
- `fakeRegister(name)` in `vitest.setup.ts` beside `expectNoA11yViolations`.
- Reused from Plan 2a, not re-created: `SymbolMark`, `OnSurfaces`, `transition-control`, `text-measure-prose`.
- Tokens: `--z-tooltip: 90` and the `z-tooltip` utility; primitive `--color-white-alpha-28` (the design system's inverse progress track, `rgba(255,255,255,.28)`).
- `index.ts` also exports `type FieldStatus` (contract §0: "any exported helper" type consumers need to type a `status` prop).

Decisions the contract left open (enum values for the design system's numeric `size` props, chosen from the cards and the real call sites):

| Atom        | `size`                            | Source                                                                                                                        |
| ----------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Rating      | sm 12 · md 16 · lg 24 px diamonds | `Rating.card.html` "size" row (12/16/24); ReviewCard uses 16                                                                  |
| SpiceLevel  | sm 12 · md 14 · lg 20             | card shows 10/14/20, but MenuItemRow and MenuItemCard both use 12 — the product call site wins; the parity review lists 10→12 |
| DietMark    | sm 14 · md 16 · lg 20             | menu rows/cards use 13–15, default 16; card's 26px sample is listed in the parity review                                      |
| Spinner     | sm 24 · md 36 · lg 52             | `Spinner.card.html` "size" row                                                                                                |
| ProgressBar | sm 6 · md 8 px bar                | LoyaltyCard uses 6; default 8                                                                                                 |

Reconciliations with the design system's prototype `.jsx` (the readme and guidelines win over prototype code):

- Disabled Checkbox, Radio and Switch use real fills (`ink-200`), not `opacity: .5` — readme §3.8 "Not just reduced opacity"; `form-states.card.html` "a real fill, never opacity".
- Select's text clears a leading icon at 44px (Input's inset) instead of Select.jsx's 42px — one field chrome for both; 2px.
- A read-only Select shows the lock glyph (form-states guideline), where Select.jsx kept the chevron.
- Spec §9.1 mentions `onCheckedChange`/`onValueChange` for Checkbox and Slider; the contract (and D17) keep them native (`checked`/`onChange`, `value`/`onChange`) so `register()` works unmodified. The contract wins; no callback props are added.

---


## Controller amendments — ruling R19 and 2b rulings (2026-09-27)

- **R19 — the symbol is one shared CSS mask, never inline SVG per instance.** Plan 1 Task 7 generates `packages/ui/src/lib/brand-artwork.css` (imported by `styles.css`) defining `--pp-symbol-mask` once and the utility `mask-symbol` (`background-color: currentColor` + the mask). `SymbolMark` (Plan 2a Task 1) is therefore `<span aria-hidden="true" className={…"mask-symbol"…} />` sized by className — no path data in the HTML. Its test asserts the class and `aria-hidden`, and that the rendered HTML contains no `<path`. PatternField uses `mask-image: var(--pp-symbol-mask)` (a class or `style={{ maskImage: "var(--pp-symbol-mask)" }}`) instead of inlining `SYMBOL_DATA_URI_WHITE` per instance. Reason: a 20-dish menu with spice levels would otherwise carry ~80 copies of ~5 KB path data (page budget ≤1 MB). Plan 2b's Rating/SpiceLevel/Spinner and `lib/brand-diamond.tsx` build on this `SymbolMark`.
- **One diamond corner token:** `radius.diamond` (2px) is created once, in Plan 2a (StatusDot's task), and used as `rounded-diamond` by StatusDot and by Plan 2b's `lib/brand-diamond.tsx`; drop `radius-status-dot` / `radius-brand-diamond`.
- **Tooltip** opens with `delayDuration={0}` as designed — accepted.
- **No on-brand variants** for Checkbox/Radio/Switch/Slider (none designed) — YAGNI, accepted.
- **Read-only Select** renders disabled for the visual, **plus a hidden `<input type="hidden" name={name} value={value}>`** so the value is still submitted (react-hook-form reads it) — add a test.
- **R21 — field text is 16px.** `lib/field-control.tsx` renders the control value at `text-body` (16px) for every size (sm/md/lg change height and padding only): iOS Safari zooms on focus below 16px, and the handoff fields use `font-size:16px`. Add a test asserting the value text class.

## Controller amendments — routed from Plan 2a's final review

Binding for Task 0's fold list; they override this plan's body where they disagree.

- **Stale body text.** Where the body still expects `SYMBOL_DATA_URI_WHITE`, an inline-SVG `SymbolMark`, or `radius-status-dot`, it is wrong: `SymbolMark` is a `.mask-symbol` span over `var(--pp-symbol-mask)` (R19/R25), and the 2px corner is `radius.diamond` in `tokens/primitive/shape.json`, used as `rounded-diamond` (R47).
- **Surface-overridden shadows need a guard.** Tailwind 4 inlines `--shadow-*` values into `shadow-*` utilities at build time, so a surface override of a shadow token never reaches the class. Plan 2a fixed `shadow-button-primary` with an `@utility` in `packages/ui/src/styles.css`. Add a spec: every `shadow-*` token that any surface overrides has a matching `@utility shadow-<name>` (this plan's `shadow-focus-ring` is the next one).
- **R41 covers `src/lib/*`.** Extend the self-package / barrel import lint to `packages/ui/src/lib/**` in the task that adds this plan's lib files.
- **Every surface restores the base.** Plan 2a's fix wave made every non-light surface resolve to base values plus its own overrides; any token this plan overrides on a surface is covered by that spec — do not hand-restore it in `light.json` only.
