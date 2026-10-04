# Design Parity (Claude Design handoff 6b1e28a) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Executor: Cursor.** Follow "Execution in Cursor" below if superpowers skills are not available.

**Goal:** Make every built component, token, foundations page and Storybook kit identical to the Claude Design handoff (commit `6b1e28a`) in design, states and interaction, while the code keeps following our guidelines.

**Architecture:** The handoff is the source of truth for **look, behaviour, component set and tiers**. Our shared API (spec 2026-10-04 §3–§5) owns **prop names**, and every design prop is mapped onto it. Four parity audits list every gap with `design says → we have → exact change`, citing file:line on both sides. This plan orders those gaps so that the shared foundations land first (tokens, state layer, press behaviour, field hover, overlay motion), then atoms, then the molecules and organisms that compose them, then Storybook and the kits.

**Tech Stack:** React 19, TypeScript 6.x (never 7), Tailwind 4.3 + tailwind-variants (`componentVariants`), Radix (`radix-ui`), react-day-picker 10, Vitest + Testing Library + axe, Storybook 10 + plays in Chromium, Nx, pnpm.

**Spec (read in this order):**
1. `docs/superpowers/specs/2026-10-04-design-parity/audit-foundations.md` (tokens, global interactions, foundations pages, kits, brand facts, rules)
2. `docs/superpowers/specs/2026-10-04-design-parity/audit-atoms.md`
3. `docs/superpowers/specs/2026-10-04-design-parity/audit-molecules.md`
4. `docs/superpowers/specs/2026-10-04-design-parity/audit-organisms.md`
5. `docs/superpowers/specs/2026-10-04-component-api-design.md` (our API layer)
6. The handoff itself, for anything an audit line cites: `zip-files/Pink Paprikaa Design System/` (`components/**/<Name>.{card.html,d.ts,jsx,prompt.md}`, `handoff/{README,COMPONENTS,INTERACTIONS,TOKENS,BRAND,SCREENS}.md`, `tokens/*.css`, `guidelines/*.card.html`, `ui_kits/website/`)

The audits use these abbreviations: `D/` = handoff `components/molecules/`, `DA/` = handoff `components/atoms/`, `DS/` = the handoff root, `U/` = `packages/ui/src/molecules/`, `IX` = `handoff/INTERACTIONS.md`, `FC` = `packages/ui/src/lib/field-control.tsx`, `tok/` = `packages/design-tokens/tokens/`, `sb/` = `apps/storybook/src/`.

**Supersedes:** Tasks 15b, 15c, 16 and 17 of `docs/superpowers/plans/2026-10-04-ds-06-component-api.md`. That plan stops after Task 15; this one continues.

## Global Constraints

- **Identical means:**
  - Every card row of every handoff component exists as a story with the same states.
  - Every value (colour, size, radius, spacing, type, shadow, motion) is the handoff's token.
  - Every interaction in `.jsx` and `IX` behaves the same: keyboard, hover (pointer only), press (Space **and Enter**), focus ring offsets, open/close, motion, and the ≤640px sheets.
- **Nothing designed is removed (owner, 2026-10-05).** Every component, prop, variant, state, interaction, card row, page, specimen, template and kit in the handoff must exist in our build. It may be renamed to our API, its internals may move into `lib/`, and we may add extras, but we never subtract. The only owner-approved differences are R136 (16px field text), R137 (AA colours), R142 (Card as a real link, same look and click; DietMark veg-only) and R140 (no egg, no "18 spices"). Anything else missing is a defect.
- **Code is ours, never copied:** the handoff `.jsx` is a behaviour reference. Every rule from `packages/ui/AUTHORING.md`, `docs/superpowers/slim/RULES.md` and spec 2026-10-04 applies:
  - `componentVariants`, tokens only, `sx` on the root, `BaseProps`;
  - `surface`/`color`/`status`/`size` names, Typography inheritance;
  - atomic layering (LAW);
  - TDD + axe, plays, the full gate.
- **Design prop → our prop:** map with the shared vocabulary. A design `on="brand|dark|tint"` becomes the surrounding `data-surface` (read by surface-aware tokens) or a `variant` (`IconButton variant="tint"`). A design `tone` becomes `surface`/`color`/`status`. Record every mapping in the component's JSDoc.
- **Hard rules beat the design:** "Pink Paprikaa" with two a's · pure veg, no egg (owner 2026-10-04) · no founder identity · WCAG AA 4.5:1 text contrast · 16px minimum text in form controls (iOS zoom) · no raw hex · never `eslint-disable` a LAW rule · never `--no-verify` · never destructive git · never push.
- **pnpm only:** `pnpm add` (no hand-written versions). The only new dependency allowed is `storybook-addon-pseudo-states` (dev, Task 3).
- **Commits:** Conventional Commits, lower-case subject, one per component (or per task where stated), ending with your agent's Co-Authored-By trailer. Run Prettier again after `eslint --fix`.
- **Visual check per component:** after the tests pass, compare the story against the handoff card in Chromium at 360px and 1280px (Task 12 has the tool). Any visible difference is a gap.

## Owner and planner rulings (binding: do not re-decide)

| # | Ruling | Cost if wrong |
| --- | --- | --- |
| R131 | **Tiers follow the design:** `Menu` and `Popover` become **atoms**; `ActionMenu` (the 3-dot menu) is a new molecule. The atom LAW (atoms import only `atoms/icon` + `lib`) still holds, so shared internals move into `lib/` (R132). | Re-tiering two folders |
| R132 | The menu panel, menu rows and popover shell live in `lib/menu-panel.tsx` and `lib/popover-shell.tsx`. Atoms `Menu`/`Popover` are thin wrappers over them. Select (atom) and Combobox/DatePicker/ActionMenu (molecules) import the lib parts, so no atom imports another atom. The IconButton recipe used by the Popover close button moves to `lib/icon-button-variants.ts` (IconButton re-exports it). | One more lib file |
| R133 | DatePicker `value`/`min`/`max` are ISO `yyyy-mm-dd` strings, as in the design (`DatePicker.d.ts`). `toIsoDate`/`formatDate` stay the converters. | A breaking prop type before any consumer exists |
| R134 | ActionMenu takes the design's data API (`items: ActionMenuItem[]`), built on Menu internally. Menu keeps its compound children API. | — |
| R135 | Pagination supports the design's client paging (`onPageChange(page)`) **and** our static links (`getHref(page)`): exactly one is required. | — |
| R136 | (owner-confirmed 2026-10-05) Form-control text stays **16px** at every size (iOS zooms below 16px). The handoff's 15/14px is an accepted deviation, recorded in Field JSDoc. | Larger field text |
| R137 | (owner-confirmed 2026-10-05) Keep our AA-passing colours where the design's fail 4.5:1: `text-subtle` ink-600, `text-brand` pink-600, brand/ink body whites, soft `text-brand` pink-700, TabBar ink-600/pink-600. Add `$description` notes citing contrast-pairs.json. | — |
| R138 | Forced states for docs (rest/hover/press/focus/disabled rows) come from `storybook-addon-pseudo-states`, never from docs-only public props. | One dev dependency |
| R139 | Press feedback: a `lib/use-press.ts` hook sets `data-pressed` on pointerdown and on keydown Space/Enter (removed on up/leave/blur), as `IX:6-12` specifies. Components style `data-pressed:` alongside `active:`. | — |
| R140 | Content (owner 2026-10-04): FAQ says **no egg in anything**; drop "18 spices"; the Google rating everywhere comes from `packages/content` (one value). Brand facts follow the handoff's `brand.js`/`BRAND.md` (Instagram `@thepinkpaprikaa`; no YouTube/LinkedIn; ordering links; Google reviews URL; maps URL; `googleRating`/`est` derived lines). | — |
| R141 | ImageSlot `fill` (colourway) → `variant: "soft" \| "strong" \| "neutral"`; `isFill` keeps its full-height meaning. IconButton design `on="tint"` → `variant="tint"`. TestimonialWall `variant="brand"` (card surface) → `cardSurface`. | Renames, no consumers yet |
| R143 | The text atom stays **Typography** (owner 2026-10-05); the design's "Text" page is `Atoms/Typography`; `Text` stays an alias. | One name differs from the design tree |
| R144 | Extras with no design card are filed inside the matching design group, after the design's pages (owner 2026-10-05). | — |
| R142 | (owner-confirmed 2026-10-05) DietMark stays veg-only. Card stays `asChild` around a real link (never `div role=button`): same look, hover, press and click as the design. Field keeps owning messages for Input/Checkbox. Popover keeps Radix `open/onOpenChange` (design `onClose` maps to `onOpenChange(false)`). Combobox stays a popover on phones (`D/Combobox.prompt.md`). | — |

## Review Focus

1. **Hover on touch:** a tapped button must not stay pink-50 after the tap. Hover classes go behind `@media (hover:hover)`. Tailwind 4's `hover:` already is, but custom `@utility` hover rules must be too. Test (Task 2): the play emulates `hover: none` (`page.emulateMedia` isn't available in a play, so assert the CSS rule text is inside `@media (hover: hover)` via `document.styleSheets`).
2. **Enter shows press like Space:** keyboard users get the same press feedback. Test (Task 2 `use-press`): keydown Enter → `data-pressed` present; keyup → gone; blur mid-press → gone.
3. **Sheet vs popover at exactly 640px:** the breakpoint is `≤640` = sheet. At 641 it must float. Test (Task 6): plays at viewport 640 and 641 assert `role="dialog"` sheet vs floating menu.
4. **Menu/Select Tab behaviour:** Tab must close and move focus on (Radix swallows it in menus, `@radix-ui/react-menu` dist:313). Test (Task 6): open, press Tab → menu gone, focus on the next tabbable.
5. **No native UI anywhere:** a lint gate (Task 2) plus a grep gate (Task 12) for `<select`, `type="date|time|…"`, `required` on DOM controls, `title=` on DOM elements, and missing `noValidate`.

## Execution in Cursor

- Task by task, in order. Each task ends green and committed.
- **Ledger:** `.superpowers/sdd/2026-10-04-ds-07-design-parity/progress.md`. One line per finished task (`Task N: done <sha>..<sha> (ui X, sb Y)`), plus `Ruling:` lines for anything you decide.
- **Interrupted?** `git status` + the last ledger line. Finish partial work and never delete it.
- **For each component in a task:** read its audit section → turn every gap line into a failing test or story (see "Gap → test" below) → implement → run its tests + plays → compare with the card (Task 12 tool) → commit.
- **Batch gate** after Tasks 2, 5, 8, 10, 11b and 12: `pnpm nx run-many -t typecheck lint test build && pnpm nx format:check && pnpm nx sync:check && pnpm nx run storybook:test && pnpm guard:founder`
- **Review** after each batch gate: check the batch diff against the audit lines it claims to close. Every closed line needs a test or story. Collect leftovers in `minors.md`.

### Gap → test (how every audit line becomes RED first)

| Gap tag | The failing check to write first |
| --- | --- |
| `[visual]` class/token | Unit: `expect(el).toHaveClass("<token class>")` for each state that renders statically. For pseudo-states (hover/press/focus), add the row to the component's `States` story (R138) and a play asserting `getComputedStyle` in the forced state, e.g. `parameters: { pseudo: { hover: true } }` → `backgroundColor === "rgb(255, 240, 245)"` (read the expected rgb from the token in the built `theme.css`). |
| `[interaction]` | Unit with `userEvent`: the keys/clicks from the audit line, asserting focus, `aria-*` and callbacks. Motion: assert the `data-[state=open]:animate-pop-in` class (unit) and, in a play, that `getAnimations().length > 0` after open (skip under reduced motion). |
| `[api]` | Unit: render with the new prop → its observable effect. Type-level: `// @ts-expect-error` for a removed prop. |
| `[story]` | Add the story named after the card row. `storybook:test` runs it with axe. |
| `[a11y]` | Unit: role/name/state assertion + `expectNoA11yViolations`. |
| `(token)` | `packages/design-tokens` spec: the token exists with the value; contrast-pairs covers any new text pair. |

---

### Task 0: Baseline and read-in

- [ ] **Step 1:** `git status --short && git log --oneline -3`. Expected: the tree is clean at or after `6b1e28a`/`af118fa`. Record HEAD in the ledger.
- [ ] **Step 2:** Run the batch gate once and record the counts (`ui`, `sb`, `tokens`) as the baseline.
- [ ] **Step 2b: Design coverage map (the "nothing removed" check).** Create `docs/superpowers/specs/2026-10-04-design-parity/coverage.md` with one table per handoff component and page:
  - **Rows:** every prop in its `.d.ts` (name, type, values), every card row in its `.card.html`, and every behaviour in its `.jsx` + `IX` section.
  - **Columns:** `design item | our equivalent (file:symbol or story) | status (have / planned in Task N / approved difference R13x)`.
  - **Also:** one table for `guidelines/*`, one for `templates/*`, one for `ui_kits/*`, and one for `handoff/*.md` rules.

  Generate the skeleton with a small script (`apps/storybook/scripts/design-coverage.mjs`) that parses the `.d.ts` interfaces and `@dsCard` names, then fill in the equivalents by hand. Every later task updates its rows to `have`. Task 12 Step 5 fails the review if any row is not `have` or an approved R-number.
- [ ] **Step 3:** Read the four audit files' **Summary** and **Cross-cutting** sections and `IX` in full (73 lines). Don't read the per-component sections until the task that needs them.

### Task 1: Tokens: state layer, scrollbar, press scales, spacing, pop-in

**Files:** `packages/design-tokens/tokens/primitive/{color,motion,space}.json`, `tokens/semantic/color.json`, `tokens/surface/{brand,ink,soft}.json` (descriptions only, R137), `contrast-pairs.json`, `packages/ui/src/lib/component-variants.ts`, `packages/ui/src/styles.css`, the design-tokens specs, `apps/storybook/src/foundations/spacing/layout-rhythm.mdx`.
**Source:** audit-foundations §Tokens (Missing + Different value) · audit-atoms §Cross-cutting (state layer, scales, pop-in) · audit-organisms §Cross-cutting (token list).

- [ ] **Step 1: Failing token specs.** In the design-tokens package spec, assert that each new token exists with its value:

```ts
it.each([
  ["--color-state-hover", "var(--color-pink-50)"], ["--color-state-press", "var(--color-pink-100)"],
  ["--color-state-hover-neutral", "var(--color-ink-100)"], ["--color-state-press-neutral", "var(--color-ink-200)"],
  ["--color-state-press-danger", "#f8d4d4"], ["--color-state-hover-on-color", "var(--color-white-alpha-16)"],
  ["--color-state-press-on-color", "var(--color-white-alpha-28)"], ["--color-state-hover-tint", "rgba(26, 18, 22, 0.06)"],
  ["--color-state-press-tint", "rgba(26, 18, 22, 0.12)"], ["--color-state-disabled-fill", "var(--color-ink-100)"],
  ["--color-state-disabled-ink", "var(--color-ink-400)"],
  ["--color-scrollbar-thumb", "var(--color-pink-200)"], ["--color-scrollbar-thumb-hover", "var(--color-pink-300)"],
  ["--color-scrollbar-track", "transparent"], ["--spacing-scrollbar", "8px"],
  ["--motion-press-scale-icon", "0.92"], ["--motion-press-scale-page", "0.94"], ["--motion-press-scale-card", "0.99"],
  ["--motion-press-scale-stepper", "0.9"],
  ["--spacing-gutter-mobile", "20px"], ["--spacing-section-y-mobile", "56px"],
])("%s = %s", (name, value) => expect(themeVar(name)).toBe(value));
```
Use whatever helper the existing token spec uses to read built variables (`themeVar` is a placeholder for that helper; find it in `packages/design-tokens/src/*.spec.ts`). Adjust the reference format to how the build emits aliases (literal hex or `var(--…)`): the value must equal the handoff's `DS/tokens/colors.css:116-136`. Also assert `--spacing-gutter-fluid` = `clamp(20px, 4vw, 40px)` and `--spacing-section-y-fluid` = `clamp(56px, 7vw, 96px)`. Run `pnpm nx test design-tokens` → FAIL.
- [ ] **Step 2: Add the tokens** exactly as audit-foundations §Tokens/Missing specifies:
  - `ink-alpha.06` and `.12`, and the `danger-press` primitive;
  - the semantic `color.state.*` and `color.scrollbar.*` groups (surface-aware where the audit says: on brand/ink, `hover-on-color`/`press-on-color` apply);
  - the press-scale ladder in `motion.json`;
  - gutter/section values in `space.json` (remove the "Handoff value (spec C8)" description).

  Add R137 `$description`s on the kept colours. Run → PASS.
- [ ] **Step 3: Utilities and keyframes** in `styles.css`:
  - `@utility press-scale-icon|page|card|stepper` beside `press-scale`;
  - `@keyframes pp-pop-in { from { opacity: 0; transform: translateY(-4px) scale(.98) } }` + `--animate-pop-in: pp-pop-in var(--motion-duration-fast) var(--motion-ease-out)` in `@theme`, with the exact timings from `DS/tokens/base.css:47`.

  Register every new class name in `lib/component-variants.ts` (state colours in the colour group, press scales and `animate-pop-in` in their groups). Unit: `componentVariants` keeps `bg-state-press` when merged after `bg-surface-card`.
- [ ] **Step 4:** `layout-rhythm.mdx` prose → 20/56. Run `pnpm nx run storybook:test -- foundations` → PASS (the specimens read live tokens).
- [ ] **Step 5: Commit** `feat(tokens): add the handoff's state layer, scrollbar, press scales and pop-in`.

### Task 2: Global interactions and native-UI policy

**Files:** `packages/ui/src/styles.css`, `packages/ui/src/lib/use-press.ts` (+ spec), `packages/ui/src/lib/field-control.tsx`, `packages/ui/src/lib/control-states.ts`, `packages/ui/src/molecules/field/field.tsx`, `packages/ui/src/atoms/input/input.tsx`, `packages/ui/src/atoms/avatar/avatar.tsx`, `tools/eslint-config/*` (+ its test).
**Source:** audit-foundations §Global interactions (all 12 gaps) · audit-atoms §Cross-cutting (field hover, per-variant disabled) · audit-molecules X1, X2, X5, X6.

- [ ] **Step 1: `use-press` (R139). Failing spec:**

```tsx
it("marks press on pointer and on Space/Enter, clears on release/leave/blur", async () => {
  const user = userEvent.setup();
  function T() { const p = usePress<HTMLButtonElement>(); return <button {...p.pressProps}>Add</button>; }
  render(<T />);
  const b = screen.getByRole("button", { name: "Add" });
  b.focus();
  fireEvent.keyDown(b, { key: "Enter" }); expect(b).toHaveAttribute("data-pressed");
  fireEvent.keyUp(b, { key: "Enter" });   expect(b).not.toHaveAttribute("data-pressed");
  fireEvent.keyDown(b, { key: " " });     expect(b).toHaveAttribute("data-pressed");
  fireEvent.blur(b);                       expect(b).not.toHaveAttribute("data-pressed");
  fireEvent.pointerDown(b);                expect(b).toHaveAttribute("data-pressed");
  fireEvent.pointerLeave(b);               expect(b).not.toHaveAttribute("data-pressed");
});
```
Implement: `usePress<E>()` returns `{ pressProps: { onPointerDown, onPointerUp, onPointerLeave, onKeyDown, onKeyUp, onBlur, "data-pressed": pressed ? "" : undefined } }`, composing the caller's handlers (call theirs too). It does not preventDefault. → PASS. Commit `feat(ui): add the press hook for space and enter feedback`.
- [ ] **Step 2: Base layer** (`@layer base`), each with a unit/spec or play:
  - scrollbars on `*` (`scrollbar-width: thin; scrollbar-color: var(--color-scrollbar-thumb) var(--color-scrollbar-track)`) + `::-webkit-scrollbar` rules (size, thumb, hover), from `DS/tokens/base.css:30-34`;
  - `::selection { background: var(--color-pink-100); color: var(--color-pink-800) }`;
  - search cancel/decoration hidden globally on `input[type=search]` (move them out of `@utility search-reset`);
  - number spinners hidden (`appearance: textfield` + spin buttons none).

  Play (`Foundations/Interactions`, new story `GlobalBase`): computed `scrollbarColor` on a scroll box, and the `::selection` rule present in `document.styleSheets`.
- [ ] **Step 3: Field hover + leading-icon accent (X1, X2)** in `field-control.tsx`:
  - the root gets `not-focus-within:hover:border-border-strong`, only for `status="default"` and not disabled/read-only;
  - the leading icon gets `group-focus-within/field:text-pink-500` (+ the per-status accent).

  Tests: class presence per status; none when disabled. Plays (pseudo hover, after Task 3) come later.
- [ ] **Step 4: Per-variant disabled.** `control-states.ts:13-14` stops painting `bg-ink-200` for every variant and exposes only the cursor/aria part. Each recipe (Button, IconButton, Tag; Tasks 4–5) owns its disabled paint per the audit. Test: `controlStates.disabled` has no `bg-` class.
- [ ] **Step 5: No native validation / input types / title:**
  - `field.tsx:95`: `control.required = true` → `control["aria-required"] = true` (test: no `required` attribute, `aria-required="true"`).
  - `input.tsx`: narrow `type?: "text" | "email" | "tel" | "url" | "password" | "search" | "number"`, where `number` renders `type="text" inputMode="decimal" pattern="[0-9]*[.,]?[0-9]*"` (`DS/handoff/README.md:94-95`). Tests: `type="number"` → `type="text"` + `inputmode="decimal"`; `// @ts-expect-error` for `type="date"`.
  - `avatar.tsx:71`: remove `title`; add `tooltip?: ReactNode` wrapping our Tooltip, only when the avatar is focusable (`asChild`/interactive) or `tooltip` is given. Test: no `title` attribute; with `tooltip` + focus → tooltip text appears.
- [ ] **Step 6: Lint gate.** In `tools/eslint-config`, add a workspace-wide `no-restricted-syntax` rule set (like `no-raw-hex`, with a probe test in `react.test.mjs` style) banning:
  - JSX `<select>` outside `packages/ui/src/lib/*` (Radix renders its own hidden one; ours never does);
  - `type` attribute values `date|time|datetime-local|month|week|color|file|range` on `<input>` outside `atoms/slider`;
  - the `required` attribute on DOM controls;
  - `title` on DOM elements (except `<svg><title>`);
  - `<form>` without `noValidate`.

  Probe test: each banned snippet errors; each allowed one passes. Fix every hit (`apps/storybook/src/patterns/enquiry-form.tsx` date → Task 7).
- [ ] **Step 7: Commit** per step (5 commits). **Batch gate 1.**

### Task 3: Storybook forced states

**Files:** `apps/storybook/package.json` (via `pnpm add -D storybook-addon-pseudo-states --filter @pink-paprikaa-web/storybook`), `apps/storybook/.storybook/main.ts`, `packages/ui/src/lib/story-states.tsx` (new helper).

- [ ] **Step 1:** Install and register the addon (check its README in `node_modules` for the Storybook 10 registration).
- [ ] **Step 2:** `story-states.tsx` exports `StatesRow({ states: ("rest"|"hover"|"press"|"focus"|"disabled")[], render })`. It renders one labelled cell per state, each wrapped with the addon's per-element pseudo-state params (`pseudo: { hover: ["#cell-hover *"], active: [...], focusVisible: [...] }`). Press is shown through `data-pressed` (R139), since `:active` alone can't show Enter. Write it so a component's `States` story is one line per variant.
- [ ] **Step 3: Failing play first** (`Button` `States` story added here as the pilot): assert the hover cell's computed background equals `--color-state-hover`. RED before Task 4 changes Button, which is fine: leave the play skipped with `tags: ["!test"]` until Task 4 un-skips it. Commit `chore(storybook): add forced-state stories`.

### Task 4: Atoms A: Button, IconButton, TextButton (new), Link, Tag, Card

**Files:** `packages/ui/src/atoms/{button,icon-button,text-button,link,tag,card}/*`, `packages/ui/src/lib/icon-button-variants.ts` (R132).
**Source:** audit-atoms §Button, §IconButton, §TextButton, §Link, §Tag, §Card.

For each component, every gap line becomes a failing test or `States` story row (Gap → test), then the implementation, then a card comparison. Specifics the audit flags as biggest:
- **TextButton (new atom):** brand/neutral/danger `color`; surface-aware via `data-surface` (light/dark/brand), not an `on` prop (R141); `isCaps`; `isLoading`; sizes `sm|md`; press via `usePress`; the `States` story mirrors the card. Then swap Toast's hand-rolled action for it in Task 9.
- **IconButton:** add size `xs` (28px token), `variant="tint"` (inherit-parent colour, used by Alert dismiss), hover/press per variant using the state tokens, `press-scale-icon`, and move the recipe to `lib/icon-button-variants.ts`.
- **Button:** secondary/ghost hover border+text, press fill `state-press`, inverse hover/press, per-variant disabled.
- **Link:** add `disabled` (aria-disabled, no href navigation); fix the quiet hover underline bug (`link.tsx:84`).
- **Card:** press `press-scale-card` + `state-*` on interactive cards.
- **Tag:** hover border/text, press fill, per-variant disabled.

- [ ] Steps per component: tests RED → implement → `pnpm nx test ui -- <name>` + `storybook:test -- <name>.stories` GREEN → card comparison → commit `fix(ui): match <name> to the design handoff` (`feat(ui): add the text button atom` for the new one).

### Task 5: Atoms B: Checkbox, Radio, Switch, Input, Select-independent atoms, DietMark, ImageSlot, Avatar

**Source:** audit-atoms §Checkbox, §Radio, §Switch, §Input, §DietMark, §ImageSlot, §Avatar.
- **Checkbox/Radio/Switch:**
  - whole-row hover tint `state-hover` and press `state-press`;
  - box/ring/track hover and press colours;
  - `press-scale-icon` on the mark;
  - the Switch thumb widens on press;
  - disabled row at 50% opacity (the design's rule for choice rows).

  `States` stories per card row.
- **Input:** hover border (from Task 2) shown in `States`; the card's remaining rows.
- **ImageSlot:** R141 rename + its card rows. **DietMark:** veg only (R142), plus the visual gaps listed.
- [ ] Same step loop as Task 4. **Batch gate 2.**

### Task 6: Menu and Popover become atoms (R131, R132), with the design's rows, sheet and motion

**Files:** move `packages/ui/src/molecules/{menu,popover}/` → `packages/ui/src/atoms/{menu,popover}/` with `git mv`; create `packages/ui/src/lib/{menu-panel,popover-shell}.tsx`; update `index.ts` and every import; story titles `Atoms/Menu`, `Atoms/Popover`.
**Source:** audit-atoms §Menu, §Popover · audit-molecules §Menu (ours), §Popover (ours), X3, X4.

- [ ] **Step 1: Move first, behaviour unchanged.** `git mv`, fix imports, and confirm `pnpm nx lint ui` passes the atomic-layering LAW (no atom imports a non-Icon atom; anything that does moves into lib per R132). Run all Menu/Popover tests → PASS. Commit `refactor(ui): make menu and popover atoms as the design tiers them`.
- [ ] **Step 2: Failing tests from the audit**, at minimum:
  - rows: hover `state-hover` (pink-50), selected = pink-700 text + brand diamond (`lib/brand-diamond`), row text **15px** as designed (R136's 16px rule covers form-control text only; add a `menu-row` text token if none matches 15px);
  - group labels + trailing meta in mono;
  - danger press colours;
  - empty state;
  - Tab closes + moves focus (Review Focus 4);
  - `data-[state=open]:animate-pop-in`;
  - **≤640px renders as a bottom sheet** (Review Focus 3): handle 40×4, radius-xl top, shadow-4, 18px title, 52px rows, max-h `min(70vh,520px)`, `animate-sheet-in`. Implement the sheet path with `Dialog variant="sheet"` internals in `lib/popover-shell.tsx`, controlled by a `matchMedia("(max-width: 640px)")` hook, and add `sheet?: "auto" | boolean` (default `"auto"`).
- [ ] **Step 3: Implement** in `lib/menu-panel.tsx` (panel + row recipe + empty state + diamond indicator) and `lib/popover-shell.tsx` (floating vs sheet). Tab-to-close: on Content `onKeyDown` Tab → close, then let focus move (`event.preventDefault()` not called; Radix's own Tab trap is bypassed by closing first). → PASS.
- [ ] **Step 4: Stories per card row** + `Sheet360` and `Floating641` plays + `States`. Commit per atom: `fix(ui): match menu to the design handoff`, `fix(ui): match popover to the design handoff`.

### Task 7: Select on our own panel (replaces old 15b) and the native-date sweep (replaces old 15c)

**Files:** `packages/ui/src/atoms/select/select.{tsx,test.tsx,stories.tsx}`, `apps/storybook/src/patterns/enquiry-form.tsx`, `apps/storybook/src/kits/website/website-kit.tsx` (booking dialog).
**Source:** audit-atoms §Select · audit-foundations §Global interactions (native select) · old plan Task 15b/15c intent · `DA/Select.{d.ts,jsx,card.html}`.

**API (same as today + the design's additions):** `options: { value; label; description?; isDisabled? }[]`, `value/defaultValue`, `onValueChange`, **and still** `onChange`/`register()` compatibility, via a hidden native select that our list drives: on selection, set `select.value` and dispatch a bubbling `change` event, so `{...register("x")}` keeps working unchanged. Also `open/defaultOpen/onOpenChange`, `name`, `placeholder`, `size`, `status`, `icon`, `readOnly`, `disabled`, `required` (→ aria-required), `sheet`, `portalContainer`, `sx`. The hidden select is `aria-hidden`, `tabIndex={-1}`, inside the lib (the lint gate allows `<select>` only in `lib/`): put it in `lib/hidden-native-select.tsx`.

- [ ] **Step 1: Failing tests:**
  - trigger `role="combobox"`, no visible native select;
  - opens our listbox (the Task 6 panel), selected row has the brand diamond;
  - keyboard (Enter/Space/ArrowDown open; arrows skip disabled; Home/End; type-to-jump; Enter selects; Esc closes; focus returns; Tab closes);
  - chevron rotates when open;
  - `register()` works (`useForm` test: select an option → `getValues("outlet")` = value, and `onChange` fired with `event.target.value`);
  - FormData posts the value;
  - readOnly can't open and still posts;
  - error → aria-invalid;
  - ≤640 sheet;
  - axe open/closed.
- [ ] **Step 2: Implement**: trigger in `FieldControl` (closed state identical to today + the design's chevron rotation), panel from `lib/menu-panel`, positioning from `lib/popover-shell`, keyboard via a small `lib/use-listbox.ts` (active index, typeahead buffer 500ms, skip disabled) **shared with Combobox** (Task 8). → PASS.
- [ ] **Step 3: Stories per card row** + OpenList, Keyboard, LongList, InDialog, InAppShell, Sheet360. `storybook:test` for select, field, dialog, patterns → PASS.
- [ ] **Step 4: Native-date sweep:**
  - enquiry form date → `DatePicker` (Controller, ISO string per R133);
  - the website kit booking dialog gets `<form noValidate>`, DatePicker, and phone validation (audit-foundations §Kits).

  The Task 2 lint gate must show 0 hits.
- [ ] **Step 5: Commits** `feat(ui): make select our own list instead of the native one`, `feat(storybook): use our date picker in the enquiry and booking forms`.

### Task 8: ActionMenu (new), Combobox and DatePicker parity

**Source:** audit-molecules §ActionMenu, §Combobox, §DatePicker + Calendar, X3, X4, X7.
- **ActionMenu (R134):**
  - `items: { label; icon?; meta?; color?: "default"|"danger"; disabled?; onSelect?; href? }[]` plus the design's other props;
  - the trigger is IconButton `MoreHorizontal`/ellipsis per `D/ActionMenu.jsx:7-23`, label "More actions", ghost, size sm;
  - opens bottom-end; sheet on phones;
  - built on the Menu atom;
  - stories per card row, including the 3-dot story moved from the Menu stories.
- **Combobox:** all 15 lines in the audit, including:
  - a leading search icon, chevron and `size`;
  - option `icon` and `meta` (price);
  - the brand-diamond selected mark;
  - match highlight in pink-700 bold;
  - keyboard rules from the audit: typing auto-highlights the first match, Tab closes without committing, Esc on a closed list clears only the typed text, clicking the box opens the list;
  - the clear button shows whenever there is text and clears only the text.

  Reuse `lib/use-listbox.ts` and `lib/menu-panel`.
- **DatePicker + Calendar:** all 15 lines, including:
  - the selected day as the pink diamond, and a small diamond marker on today;
  - weekday header and caption sizes (20px caption);
  - day hover/press, and the disabled colour;
  - props `min`, `max`, `weekStart`, `format`, `size`, `readOnly`, `inline`;
  - ArrowDown opens;
  - the ≤640 sheet;
  - ISO strings (R133).
- [ ] Step loop per component (tests RED → implement → plays → card comparison → commit). **Batch gate 3.**

### Task 9: Molecules parity

**Source:** audit-molecules sections for each: Pagination (R135, PageButton states, ellipsis as text, export `PageButton`), Tabs, Toast (TextButton action), Snackbar, SearchField, SlotPicker, QuantityStepper (`press-scale-stepper` .90), OtpInput, ListRow, CouponTicket (stub focus inset −6, X6), Accordion, Alert (IconButton `xs` `tint`), Breadcrumb (Link subtle sm), MenuItemCard/OutletCard/FilterBar (via the atoms already fixed: verify only, and add their `States` stories).
- [ ] Step loop per component, one commit each: `fix(ui): match <name> to the design handoff`.

### Task 10: Organisms and layouts parity

**Source:** audit-organisms per section:
- **SiteHeader (7 gaps):**
  - logo states + the "Pink Paprikaa home" label;
  - all links at 1280–1439;
  - nav links via `Link variant…` (quiet, from the atom);
  - Order Now at every width;
  - an `isScrolled` override;
  - 24px row gap.
- **TabBar:** the 56×30 icon pill, `state-hover`/`state-press` + `press-scale-icon`, and the R137 colours kept.
- **SiteFooter:** social buttons ghost, links via the inverse Link atom, `social` default `["instagram"]`.
- **Dialog:** sheet animation only on `sheet`, the modal gets pop-in/fade, `drawer` kept (extra).
- **HeroBanner:**
  - split spacing 32/36;
  - two columns from ~730px (add the breakpoint token if the design names one);
  - centred copy at 22ch (token);
  - separate top/bottom padding tokens.
- **The rest:**
  - MenuList: the empty state per category;
  - OrderTracker, CtaBand, FaqSection: one gap each, per the audit;
  - TestimonialWall: R141 `cardSurface`;
  - AutoGrid: 240/280 minimums;
  - Section: its gap;
  - layouts switch to `BaseProps` (cosmetic).
- [ ] Step loop per component. **Batch gate 4.**

### Task 11: Foundations pages, brand facts and the Website kit

**Source:** audit-foundations §Foundations pages, §Kits, §Brand facts, §Rules · R140.
- **`states` page:** the handoff's 5-state matrix across components, built from the `States` stories (Task 3 helper).
- **`form-states` page:** the hover row, Combobox and DatePicker entries, and the three native-UI policy notes (no native popups, input-type policy, no validation bubbles).
- **`brand-company` page:** Ordering and Reviews boxes, plus the `googleRating`/`est` derived lines.
- **`packages/content` brand facts** per R140; the rating is read from one value everywhere (grep for literal ratings like `4.6`/`4.3` in `apps/storybook/src` and replace them with the content value).
- **Website kit:**
  - every gap in §Kits;
  - the FAQ egg line rewritten to "no egg in anything";
  - "18 spices" removed;
  - the booking dialog per Task 7.
- **Motion "Duration & easing" specimen must match `guidelines/motion.card.html` (owner report 2026-10-05; the audit marked this card "mapped" without diffing the specimen).**
  - **Today:** `apps/storybook/src/docs-kit/motion-demo.tsx` is a click-to-play button that runs the real token duration once (140ms over ~268px reads as a jump; measured in Chromium, it does animate).
  - **The card:** four rows, each a 300×10px `ink-200` pill track (`overflow:hidden`) with a 34px `pink-500` pill knob that **loops by itself** on `@keyframes sl { 0%,8% { translateX(0) } 50%,58% { translateX(calc(300px - 34px)) } 100% { translateX(0) } }` at `2.4s infinite`. Each row has its own timing function: `--ease-out`, `--ease-in-out`, `--ease-entrance`, `--ease-pop`. Beside each track sit a mono 11px `text-heading` token name and an 11px `text-subtle` note: `140–220ms`, `220ms`, `340ms`, `220ms · add-to-cart only`. Rows sit in a 12px-gap grid, max-width 300px + label; the track and label have a 14px gap.
  - **Build it:** a `MotionEasingSpecimen` docs-kit component (tokens only). Add `@keyframes pp-ease-demo` and `--animate-ease-demo` to the docs-kit stylesheet or `styles.css`, with the track width as a CSS variable, not an arbitrary value; register any new utility. It's the first specimen on the Motion page, under the card's title and subtitle ("Hover 140ms, state 220ms, sheets 340ms. --ease-pop only for add-to-cart.").
  - **Keep or remove:** keep the token tables and copy chips below it as reference. Remove the Play-button rows (they aren't in the design).
  - **Reduced motion:** honour it like the design's own `tokens/base.css:39` (no exemption), and keep the existing mdx note telling readers how to check the OS setting.
  - **Play:** `getComputedStyle(knob).animationName === "pp-ease-demo"`, `animationIterationCount === "infinite"`, `animationTimingFunction` equals each row's token, and the knob's x-position at two points in time differs (it moves).
  - **Visual check:** compare with the card in the Task 12 tool.
  - **Same for the other motion-family cards:** `states.card.html` and `form-states.card.html` specimens are already in this task. Diff each specimen against its card, not just page existence.
- [ ] Each change gets a play or a content-spec assertion. Commits per page/kit.

### Task 11b: Storybook sidebar identical to the Claude Design tree, plus Templates and Explore

**Why:** the audits compared each page's *content*. The sidebar (group names, page names, grouping) and the three Templates were never compared. The design tree (every `@dsCard group=… name=…` in the handoff, verified 1:1 present in the zip) is the target. Owner rulings 2026-10-05: **R143** the text atom stays **Typography** (deliberate difference; the page is `Atoms/Typography` with a JSDoc and an mdx note "the design's `Text`"; `Text` stays an alias). **R144** extras with no design card are filed **inside the matching design group**.

**Files:** story `title`s and `<Meta title>` across `apps/storybook/src/**` and `packages/ui/src/**/*.stories.tsx`; `apps/storybook/.storybook/preview.ts(x)` (`parameters.options.storySort.order`); new Templates and Explore pages; `apps/storybook/src/foundations/**` (moves only).

**Target tree, in this exact order** (`storySort.order`; our extras in *italics*, appended at the end of their group):

| Group | Pages (exact names) |
| --- | --- |
| Readme | Readme (the current Introduction page, renamed), *Docs kit*, *Docs prose*, *Canvas geometry*, *System (sx)* |
| Templates | Marketing website, Ordering app screen, Social post |
| App | Ordering app |
| Atoms | Avatar, Badge, Button, Card, Checkbox, DietMark, Divider, Icon, IconButton, ImageSlot, Input, Link, Menu, PatternField, Popover, PriceTag, ProgressBar, Radio, Rating, Select, Skeleton, SocialHeadline, SpiceLevel, Spinner, StatusDot, Switch, Tag, **Typography** (R143, at the design's "Text" position), TextButton, Tooltip, *Countdown*, *Fab*, *Slider*, *ToggleButton* |
| Brand | Logo, Company details, Logo lockup, Pattern, Symbol, Wordmark (the design's order), *Iconography*, *Voice & content*. Move `Atoms/Logo` here as "Logo" if it's the brand card; split today's Brand/Logo specimens into Logo lockup / Symbol / Wordmark per `guidelines/*.card.html` |
| Colors | Spice accents, Spice heat scale, Warm ink neutrals, Brand pink, Semantic surfaces & text, Status colors, Text on surfaces, *Contrast*. Renames: Accents→Spice accents, Heat→Spice heat scale, Ink→Warm ink neutrals, Primary→Brand pink, Semantic→Semantic surfaces & text, Status→Status colors, Surfaces→Text on surfaces (check each against its card; split or merge to match) |
| Explore | Diamond + symbol, Mark legibility (new group; move these specimens from wherever they live today, e.g. Brand/Specimens, and diff each against its card) |
| Layout | Auto grid, Breakpoints, Card anatomy, Form states (moved from Motion), *Utility classes* |
| Layouts | AppShell, AutoGrid, Cluster, Container, PostFrame, Section, Stack, *Box*, *Grid* |
| Marketing | Canvas formats, Canvas type, Social & ads (Kit/Ads + Kit/Feed merge into one "Social & ads" page per its card) |
| Molecules | the design's 30 in its order: Accordion, ActionMenu, Alert, Breadcrumb, Combobox, CouponTicket, DatePicker, EmptyState, Field, FilterBar, ListRow, LogoLockup, LoyaltyCard, MenuItemCard, MenuItemRow, OfferSeal, OtpInput, OutletCard, Pagination, PriceSummary, QuantityStepper, ReviewCard, SearchField, SectionHeader, SlotPicker, Snackbar, Stat, StepTracker, Tabs, Toast, then *AnnouncementBar, CheckCard, ChipGroup, ChoiceCardGroup, FeatureItem, KeyValueList, LinkCard, PricingCard, SpeedDial, Steps, StickyActionBar, Table, ToggleButtonGroup, Field/React Hook Form + Zod* |
| Motion | Duration & easing (the Task 11 specimen), Interaction states (today's States), *Section reveal* |
| Organisms | CartPanel, CtaBand, Dialog, FaqSection, HeroBanner, MenuList, OrderTracker, SiteFooter, SiteHeader, StatBand, TabBar, TestimonialWall, *ActionDock, QuotePanel, ReviewCarousel* |
| Spacing | Borders & focus (from Layout/Borders), Shadows (from Layout/Elevation), Corner radii (from Layout/Radii), Layout rhythm, Spacing scale (from Scale) |
| Type | Fluid type (renamed from Fluid), Body, Devanagari, Display, Headings, Overline & mono |
| Website | Homepage |

"Specimens" story files that exist only to feed mdx pages keep `tags: ["!dev"]` or move under their page, so the sidebar shows only the tree above.

- [ ] **Step 1: Failing check first.** Create `apps/storybook/src/docs-kit/sidebar.spec.ts`. It builds the storybook index (`pnpm nx run storybook:build` output `storybook-static/index.json`; or read `index.json` from a fresh build in the test's `beforeAll` via the existing build target) and asserts that the visible groups and page names, in order, equal the table above (encode the table as a constant `DESIGN_TREE` in the spec, with our extras flagged). Run → FAIL (lists the differences).
- [ ] **Step 2: Templates.** For each of `templates/website/Website.dc.html`, `templates/app/OrderingApp.dc.html` and `templates/social-post/SocialPost.dc.html` (+ their `.thumbnail`), build a Storybook page `Templates/<name>` composing **only library exports** (and `packages/content` facts through the Storybook app, never `packages/ui`). It must match the template's sections, order, copy (subject to R140) and states. Reuse the existing kits where the template equals a kit section, and don't duplicate. Plays assert section order and the key interactions the template shows. Compare with the template in the Task 12 tool (add the three templates to its list).
- [ ] **Step 3: Explore.** Build the `Diamond + symbol` and `Mark legibility` pages to match their cards (diff the specimens, not just the existence).
- [ ] **Step 4: Retitle and move** everything per the table. `git mv` files where the folder should follow the group (`apps/storybook/src/foundations/<group>/`). Update every mdx `<Meta of>`/`<Canvas of>` import and every play that refers to a story id. Run `pnpm nx run storybook:test` → PASS, and `sidebar.spec.ts` → PASS.
- [ ] **Step 5: Commits** `feat(storybook): add the design templates and explore pages`, `refactor(storybook): match the sidebar to the claude design tree`.

---

### Task 12: Final parity sweep, gate, records, review and one fix wave

- [ ] **Step 1: Visual parity tool.** Write `apps/storybook/scripts/parity.mjs` (dev script, not shipped). It uses Playwright from the workspace and, for each handoff `components/**/<Name>.card.html` and the matching story IDs, screenshots both at 360px and 1280px into `.superpowers/sdd/2026-10-04-ds-07-design-parity/parity/<Name>-{design,story}-{360,1280}.png`, plus a side-by-side montage. The plan-3a/3b parity tools in `docs/superpowers/records/sdd/2026-09-27-ds-03a-molecules-system/` (`q.mjs`, `shoot.mjs`, montage) are the reference.
- [ ] **Step 2:** Run it over every component, inspect every montage, and list each visible difference in `minors.md` as `Component — difference — fix`. Fix them all (they count as parity gaps, not minors).
- [ ] **Step 3: Grep gate:** `grep -rnE '<select\b|type="(date|time|datetime-local|month|week|color|file)"|\srequired[\s>=]|\stitle="' packages/ui/src apps/storybook/src --include=*.tsx | grep -vE "lib/hidden-native-select|<title>|test\.|stories\."` → no output. `pnpm guard:founder` → 0. `grep -rniE "\begg\b|18 spices" apps/storybook/src packages/ui/src packages/content` → only the "no egg" sentence.
- [ ] **Step 4:** Full batch gate → green. Archive records (`rsync … .superpowers/sdd/ docs/superpowers/records/sdd/`; if lint-staged chokes on `.tsx` copies in records, remove those copies from `docs/` only). Commit.
- [ ] **Step 5: Whole-branch review** of `af118fa..HEAD` against `coverage.md` (every row `have` or an approved R-number; any other row is a Critical finding) and the four audits (every line closed or ruled), the rulings table and Review Focus. Fix Critical/Important plus the remaining minors in ONE pass. Re-run the gate. Ledger: `Final: done (ui X, sb Y, tokens Z)` + all `Ruling:` lines. Do not push.

---

## Self-review (planner)

- **Coverage:**
  - audit-foundations §Tokens → T1; §Global interactions → T2 (+ T7 for native select/date); §Foundations pages, §Kits and §Brand facts → T11; the sidebar tree, Templates and Explore → T11b; §Rules → T2 lint + T12 grep.
  - audit-atoms: Cross-cutting → T1/T2; Button/IconButton/TextButton/Link/Tag/Card → T4; Checkbox/Radio/Switch/Input/DietMark/ImageSlot/Avatar → T5 (Avatar's `title` in T2); Menu/Popover → T6; Select → T7.
  - audit-molecules: X1/X2/X5/X6 → T2; X3/X4 → T6; X7 → T4 before T9; X8 → T3; X9 → R136; ActionMenu/Combobox/DatePicker → T8; the rest → T9.
  - audit-organisms → T10, and its Cross-cutting tokens → T1.
- **Placeholders:**
  - Per-component gap content is referenced from the audit files (tracked in `docs/superpowers/specs/2026-10-04-design-parity/`), not repeated, because they already give file:line plus the exact change. The Gap → test table defines how each becomes a failing check.
  - `themeVar` in T1 is explicitly "the existing helper's name".
- **Type consistency:** `usePress`, `lib/use-listbox.ts`, `lib/menu-panel.tsx`, `lib/popover-shell.tsx`, `lib/hidden-native-select.tsx`, `lib/icon-button-variants.ts`, `sheet?: "auto" | boolean`, ISO date strings and `onPageChange`/`getHref` are used with the same names throughout.
