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
- **Commits:** only at the checkpoints in "PR and commit layout" (max 3 per PR), Conventional Commits, lower-case subject, ending with your agent's Co-Authored-By trailer. Run Prettier again after `eslint --fix`.
- **Visual check per component:** after the tests pass, compare the story against the handoff card in Chromium at 360px and 1280px (Task 12 has the tool). Any visible difference is a gap.

## PR and commit layout (owner, 2026-10-05: max 3 commits per PR) — binding

Four stacked branches, each a PR into the previous one, the first off `feat/design-system`. Cursor creates the branches locally and **never pushes or merges**; the owner opens the PRs. Inside each branch, task steps **stage** (`git add`) and commit **only at the checkpoints below**, at most 3 per PR. Review fixes are amended or squashed into the matching checkpoint commit (before push), never added as new commits. These checkpoints are owner-approved, so Cursor doesn't stop to ask at them. The ledger records each checkpoint SHA.

| PR / branch | Tasks | Checkpoint commits (≤3) |
| --- | --- | --- |
| 1 `ds-parity/1-foundations` (off `feat/design-system`) | T0, T0b, T1, T2, T3 | ① `chore: add visual snapshots and a count guard` (T0b, incl. the coverage map from T0) · ② `feat(tokens): add the handoff's state layer, scrollbar, press scales and pop-in` (T1) · ③ `feat(ui): add global interactions, the native-ui policy and forced-state stories` (T2 + T3) |
| 2 `ds-parity/2-atoms` (off PR 1) | T4, T5, T6, T7 | ① `fix(ui): match the atoms to the design handoff` (T4 + T5, incl. TextButton) · ② `refactor(ui): make menu and popover atoms with the design's rows, sheet and motion` (T6) · ③ `feat(ui): make select our own list and drop native date inputs` (T7) |
| 3 `ds-parity/3-molecules-organisms` (off PR 2) | T8, T9, T10 | ① `feat(ui): add action menu and match combobox and date picker to the design` (T8) · ② `fix(ui): match the molecules to the design handoff` (T9) · ③ `fix(ui): match the organisms and layouts to the design handoff` (T10) |
| 4 `ds-parity/4-storybook` (off PR 3) | T11, T11b, T12 | ① `docs(storybook): match the foundations pages, brand facts, kits and motion to the design` (T11) · ② `feat(storybook): match the sidebar to the design tree with templates and explore` (T11b) · ③ `fix(ui): settle the parity sweep and final review` (T12 sweep fixes + review fixes + archived records) |

Wherever a task below says "Commit …", read it as **"stage; the work goes into this task's checkpoint commit in the table above"**. Visual baselines updated by a task are staged with that task's checkpoint.

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
| R145 | (owner 2026-10-05) Scope is the **Design System only**: `packages/ui`, `packages/design-tokens`, `apps/storybook` (incl. its Website/App/Marketing kits and Templates, which are DS cards). `Pink Paprikaa Website.html` (the bundled site prototype) and the web app are deferred until the DS is complete. Social links: **Instagram only** (owner-confirmed). | — |
| R146 | (owner 2026-10-05) Guardrails: `.cursor/rules/*.mdc` (always-on hard rules), a **visual-regression snapshot** of every story (Task 0b), and a **count guard** (tests and stories never decrease). Cursor keeps working on `feat/design-system`. | Repo grows by the PNG baselines |
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
- **For each component in a task:** read its audit section → turn every gap line into a failing test or story (see "Gap → test" below) → implement → run its tests + plays + visual → compare with the card (Task 12 tool) → **stage** (commit only at the task's checkpoint).
- **Batch gate** after Tasks 2, 5, 8, 10, 11b and 12: `pnpm nx run-many -t typecheck lint test build && pnpm nx format:check && pnpm nx sync:check && pnpm nx run storybook:test && pnpm guard:founder && pnpm nx run storybook:build && pnpm nx run storybook:visual && node tools/scripts/count-guard.mjs` (visual runs with no snapshot updates; see Task 0b).
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


