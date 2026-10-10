# Task 0 report: baseline and read-in

**Status: DONE_WITH_CONCERNS** (gate green; concerns are about commit handling and a few mappings made beyond the explicit audit lines)

## What was built

- `apps/storybook/scripts/design-coverage.mjs`
  - Generates `docs/superpowers/specs/2026-10-04-design-parity/coverage.md` from the handoff.
  - Component tables: `.d.ts` props, types and exports; `@dsCard` rows from `*.card.html` / `*.jsx`; the `IX` (interaction) and `jsx` (behaviour) rows per component.
  - Further sections: guidelines (33 cards plus the `states` card rows), templates, UI kits, `handoff/*.md` rules.
  - Re-running keeps the hand-filled `our equivalent` and `status` cells. Keys ignore Prettier's escaping (`\_`, `\*`, `*em*` to `_em_`, padding).
  - `--check` exits 1 on blank rows, statuses outside `have` / `planned in Task N` / `R1xx`, or rows no longer in the handoff. `--fresh` regenerates a blank skeleton.
- `docs/superpowers/specs/2026-10-04-design-parity/coverage.md`: 1749 rows, all filled. Round trip verified (script, Prettier, script, `--check` passes).

## Baseline gate (HEAD 3c9f28c, branch feat/design-system)

Command (only the targets that exist today):
`pnpm nx run-many -t typecheck lint test build && pnpm nx format:check && pnpm nx sync:check && pnpm nx run storybook:test && pnpm guard:founder && pnpm nx run storybook:build`

Result: **all green, exit 0, no failures, no flakes.** Run uncached (`--skip-nx-cache`) for test/storybook:test, and the numbers below come from that run.

| Project | Count |
| --- | --- |
| ui tests | 1968 |
| storybook (sb) tests | 1112 |
| design-tokens tests | 290 |
| stories (`type: "story"` in `index.json`) | 926 |

Ledger line: `Task 0: baseline HEAD 3c9f28c (ui 1968, sb 1112, tokens 290, stories 926)`.

## Coverage rows by status (1749)

| Status | Rows |
| --- | --- |
| have | 1305 |
| planned in Task N | 393 |
| R-number | 51 |
| blank or invalid | 0 |

Planned by task: T1 11 · T2 17 · T4 58 · T5 13 · T6 57 · T7 23 · T8 67 · T9 41 · T10 10 · T11 42 · T11b 50 · T12 4.

R-numbers: R142 33 · R140 8 · R138 7 · R137 2 · R143 1.

Rows by section: components 1336 · guidelines 44 · templates 29 · UI kits 46 · handoff rules 191 · Summary 5 (not rows).

## Verification of our side

- Every `packages/...` and `apps/...` path in an `our equivalent` cell exists, except files created by a planned task (`text-button`, `action-menu`, `atoms/menu`, `atoms/popover`, `lib/use-press.ts`, `lib/use-listbox.ts`, `lib/menu-panel.tsx`, `lib/popover-shell.tsx`).
- Named symbols in `have` cells were checked against the file text. The only misses are inherited native props (`onClick`, `children`, `href`, `placeholder`, ...) and `sx` on Checkbox/Switch (base props).

## Items I could not classify from an explicit audit line (judgment calls, listed so the controller can overrule)

- Popover `width` / `minWidth` / `maxHeight` / `offset` / `padding` / `bodyRef` / `bodyProps`: planned in T6 (popover shell).
- Combobox `defaultQuery` / `defaultOpen`: T8.
- DatePicker `defaultOpen` / `icon` / `size` / `readOnly`: T8.
- Menu `items` / `MenuEntry` / `activeIndex`: T6 (via `lib/menu-panel`, R132).
- Pagination `onChange` and `PageButton`: T9 (R135).
- README §7.1 hover/press/disabled rows (lines 139–142): T1 (tokens) and T2 (per-variant disabled), not T4.
- README §13 QA checklist: T12 (sweep), except brand facts (T11), raw hex (have) and the native-UI lint gate (T2).
- Kit rows whose content changes under R140: Story and FAQ are R140; Proof, Outlets, Footer and Overlays are T11.
- Guideline cards: `planned in Task 11b` where only the sidebar title differs from the design (rename), `planned in Task 11` where page content differs (states, form-states, brand-company, motion), `planned in Task 1` for spacing-layout.
- `base` props (assets path) are `have`: the assets are bundled.
- Doc-only `state` props are R138; `diet` egg values are R140.

Nothing was left unclassified.

## Rulings (also in the ledger)

- Staged, not committed (see Concerns).
- `base` props treated as `have`: assets are bundled.
- Doc-only `state` props use R138; egg `diet` values use R140.
- Section rows follow the plan's coverage mapping where the audit is silent (list above).

## Concerns

1. **Commit not made.** The dispatch asked for one commit (`docs: add the design coverage map and parity baseline`). The newest ledger line (OWNER 2026-10-05) supersedes it: max 3 commits per PR, and the plan's table puts the T0 coverage map into checkpoint ① `chore: add visual snapshots and a count guard` on `ds-parity/1-foundations`. I therefore **staged** `apps/storybook/scripts/design-coverage.mjs` and `coverage.md` and created no commit and no branch. If the controller wants the standalone commit instead, the staged files commit as-is.
2. The working tree also has uncommitted edits to `.cursor/rules/00-project-guardrails.mdc` and the plan, which are the controller's and are not staged.
3. The per-item mapping for rows beyond the audit lines (list above) is a judgment; a wrong task id only moves a row, it changes no code.

## Files

- `apps/storybook/scripts/design-coverage.mjs` (new, staged)
- `docs/superpowers/specs/2026-10-04-design-parity/coverage.md` (new, staged)
- `.superpowers/sdd/2026-10-04-ds-07-design-parity/progress.md` (ledger lines appended; git-ignored)
- this report (git-ignored)
