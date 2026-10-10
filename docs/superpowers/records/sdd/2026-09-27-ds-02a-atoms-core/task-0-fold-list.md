# Task 0 — additional controller work (beyond the brief's Steps 1–7)

After Steps 1–7, PATCH THIS PLAN FILE ONLY (docs/superpowers/plans/2026-09-27-ds-02a-atoms-core.md) so every task's code, tests and stories already comply with each item below. Implementers must not have to reinterpret amendments. Keep edits surgical and in the plan's style. Verify every API or name against the tree / node_modules.

1. R13: every optional custom prop in every `…Props` interface (and the lib/link-as.ts contract types) becomes `name?: T | undefined`. Exception (Plan 1 R41): an external-type-assignability case like IconComponent's `size`. Match the canonical example in packages/ui/AUTHORING.md §3 as it now is.
2. R15: any test that reads a file uses `join(import.meta.dirname, "…")`.
3. R19 + R25: SymbolMark = `<span aria-hidden="true" className={…"mask-symbol"…}/>` sized by className. Its test asserts the class, aria-hidden, and no `<path` in the HTML. Divider (Task 10) and StatusDot (Task 13) tests query the mask span, never an inline `svg`. PatternField uses `var(--pp-symbol-mask)`. No `SYMBOL_DATA_URI_WHITE` anywhere.
4. One diamond-corner token: `radius.diamond` (2px) is created in StatusDot's task (13) and used as `rounded-diamond`. No `radius-status-dot`.
5. R35: ImageSlot (Task 11) — `ImageSlotBase extends Omit<ComponentProps<"div">, "children" | "role" | "aria-label">`; `...rest` spread on the root; the explicit `className` goes (inherited). Add a test: `id`/`data-*` reach the root. The contracts file §2 has already been updated.
6. R36: Link `isExternal` announces a visually hidden "Opens in a new tab" (built-in English, no prop). Confirm the audit's ADD is fully written (code + test + story).
7. R41 (lint, Task 1 tooling step): extend tools/eslint-config/atomic-layering.js so that, inside packages/ui, (a) importing the package by its own name `@pink-paprikaa-web/ui` and (b) `(?:\.\./)+src/index` style paths are errors in every tier. Add probes to tools/eslint-config/atomic-layering.test.mjs, which now exists and runs in `nx test`. Read the current file first; Plan 1's final fix wave changed it.
8. Final-review routing: Task 1's component-variants.ts twMerge change must register `pattern-tile-*` and `pattern-opacity-*` (the utilities this plan creates) as classGroups, so that a consumer's override replaces the default. Add a merge test in the style of the existing component-variants.spec.ts.
9. M7: never `max-w-prose` (Tailwind's 65ch beats the 64ch token). Use the `text-measure-prose` token this plan creates. Grep the plan and fix any use.
10. Plan 1 final fix wave facts. Adjust any affected step or expectation:
    - packages/ui/src/index.spec.ts now requires every component folder to have <name>.tsx + <name>.test.tsx + <name>.stories.tsx and a barrel export. Each atom task must add its export before its gate.
    - The typecheck cache now keys on tests/stories.
    - `lint` dependsOn `^build`.
    - `prepare` builds design-tokens.
    - The Logo props now Omit `dangerouslySetInnerHTML`.
11. Dev-parity tables: all 13 must be present (Step 6), with the "Implementer: copy this table…" line.

## Pre-flight scan (write to .superpowers/sdd/2026-09-27-ds-02a-atoms-core/preflight.md)
The controller needs a conflict-scan table for this plan, AFTER your patches:
- one row per pair of tasks that share a file or interface: the two tasks, what one produces vs what the other consumes, and what you found;
- one row per task on whether it agrees with itself: the tests it specifies vs the code it specifies, and the files it creates vs the files it later touches;
- any task that mandates something the review rubric treats as a defect (a test that asserts nothing, a verbatim duplicated logic block).
Mark each row OK or CONFLICT, and for each CONFLICT give your proposed resolution. Fix unambiguous ones in the plan; leave judgment calls for the controller.

## Commit
Commit only the plan file: `git add docs/superpowers/plans/2026-09-27-ds-02a-atoms-core.md` then
`git commit -m "docs: reconcile plan 2a with the built foundation"` plus a body and the trailer
`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Never use --no-verify. Allowed scopes are web blog storybook ui tokens content seo utils tools ci deps, or no scope.
