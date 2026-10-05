# Implementer contract — ds-07 design parity (read once, binding)

Repo: /Users/rishavpa/Professional/pink-paprikaa-site · branch `feat/design-system` · pnpm + Nx only.

## Read before writing code
1. Your task brief (path given in your dispatch). It is the requirements, with exact values to use verbatim.
2. `.superpowers/sdd/2026-10-04-ds-07-design-parity/global-constraints.md` — Global Constraints, owner rulings R131–R146, Review Focus, Execution in Cursor, Gap → test table. Binding; do not re-decide a ruling.
3. `.cursor/rules/00-project-guardrails.mdc` and `.cursor/rules/10-design-system-code.mdc` (hard rules).
4. The audit section(s) your brief cites in `docs/superpowers/specs/2026-10-04-design-parity/audit-*.md` — only those sections.
5. `packages/ui/AUTHORING.md` (§13 shared API) and ONE finished sibling component. The handoff in `zip-files/Pink Paprikaa Design System/` for anything an audit line cites (read-only — never edit it).

## Hard rules (a violation fails review)
- Nothing the design defines is removed. Rename to our API, move internals to `lib/`, add extras — never subtract.
- TDD: write the failing test/story first, run it, see RED, then implement. Query by role/label; suites end with `expectNoA11yViolations`.
- Never delete or weaken a test, play, story or visual baseline to get green. Counts never go down; removing one needs a `Ruling:` line saying why.
- No raw hex, no arbitrary Tailwind values, no `(--x)` shorthand, no `max-w-prose`. Tokens only; new tokens registered in `lib/component-variants.ts`; new text pairs in `contrast-pairs.json`.
- Never `eslint-disable` a LAW rule (`no-raw-hex`, `atomic-layering`, module boundaries). Never edit a gate/budget/threshold to pass.
- No native browser UI: `<select>` only inside `packages/ui/src/lib/`; no `type="date|time|…"`; no `required` on DOM controls (use `aria-required`); no `title=`; `<form noValidate>`.
- `pnpm add` only (no hand-written versions). Never upgrade TypeScript to 7.
- Brand "Pink Paprikaa" (two a's). Pure veg: no egg/meat/fish in fixtures or copy. No founder identity.
- Git: never `reset --hard`, `checkout -- <path>`, `clean`, `stash drop`, force-push, `push`, merge or rebase. Never `--no-verify`.

## Commits (owner, 2026-10-05: max 3 per PR — see "PR and commit layout" in global-constraints.md)
- **Default: STAGE, don't commit.** `git add` only the files your task touched (never `git add -A`/`.`). The owner has uncommitted edits to `docs/superpowers/plans/2026-10-04-ds-07-design-parity.md` and `.cursor/rules/00-project-guardrails.mdc` — never stage or modify those two files.
- Commit ONLY if your dispatch says your task ends a checkpoint; then use the exact checkpoint subject from the layout table. Conventional Commits, lower-case subject, body ≤100-char lines, trailer `Co-Authored-By: Cursor <cursoragent@cursor.com>`.
- Review fixes after a checkpoint commit: `git commit --amend --no-edit` (local, never pushed). Never add a new commit for a fix.
- Never create, switch or delete branches; the controller does that.
- Run Prettier again after `eslint --fix` (lint re-sorts classes). Staging does not run hooks, so run `pnpm nx format:check` and lint yourself; if a hook fails at a checkpoint commit, fix the cause and commit again.

## Verification (evidence, not claims)
- Per component: `pnpm nx test ui -- <name>` · `pnpm nx run storybook:test -- <name>.stories` · once Task 0b exists, `pnpm nx run storybook:visual -- --grep <story-id-prefix>` (update ONLY your own component's baselines when the change is intended; another story's diff is a side effect to fix, never re-baseline).
- Before your commit: the full ui + storybook suites once, plus `pnpm nx run-many -t typecheck lint -p @pink-paprikaa-web/ui @pink-paprikaa-web/storybook` and `pnpm nx format:check`.
- Known flake: kit stories that assert a dialog/toast `toBeVisible()` right after it mounts (animation starts at opacity 0). If one fails once and passes on re-run, say so in the report; do not change unrelated stories.

## Ledger
Append to `.superpowers/sdd/2026-10-04-ds-07-design-parity/progress.md`:
- `Task N: done staged|<checkpoint-sha> (ui X, sb Y[, tokens Z])`
- `Ruling: <decision> — <why> — <cost if wrong>` for anything you decide that the plan does not.

## Report
Write the full report to the report path in your dispatch: what you built, files changed, TDD evidence (RED command + failing output; GREEN command + passing output), gate output, rulings, self-review, concerns.
Return ONLY (under 15 lines): Status (DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT), staged file count or checkpoint commit sha + subject, one-line test summary, concerns, report path.
If BLOCKED/NEEDS_CONTEXT, put the specifics in the final message.
