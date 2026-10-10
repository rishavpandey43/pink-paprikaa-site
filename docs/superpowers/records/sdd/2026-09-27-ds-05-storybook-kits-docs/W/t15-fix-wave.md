# P5 T15 ONE fix wave — all findings

Never edit docs/superpowers/plans/. Full RULES.md gauntlet once before last commit. Covering tests named below.

## Important
1. `apps/storybook/src/kits/app/ordering-app.tsx:199` — ItemSheet only when `frame !== null`. Covering: `pnpm nx run storybook:test -- app`
2. `apps/storybook/src/patterns/enquiry-form.tsx:253` — Pass Field control a11y onto QuantityStepper (or drop Field chrome). Covering: `pnpm nx run storybook:test -- forms` and any unit tests

## Minor
3. layout.stories.tsx:60 — ol role="list"
4. marketing.stories.tsx:34 — ul role="list"
5. layout.stories.tsx:65 — no non-token inline style; size bars with token calc/var only
6. fixtures.ts:204 — footer Directions not a same-tab maps URL (#outlets or omit)
7. website-kit.tsx:102 — id="top" on kit root for homeHref="#top"
8. enquiry-form.tsx:265 — stepper min vs schema min 15: keep schema min 15; if default stays 10, document; prefer stepper min 1 only if tests need an invalid stored value — do not break KeyboardOnly play
9. forms.stories.tsx occasion selectOptions — keep comment if native select cannot keyboard-open; no API invention
10. architecture spec §8 stale tokens.ts/templates body — strike/footnote
11. docs/engineering/09-decision-log.md R23 — Button not Icon
12. docs/engineering/06-quality-gates.md — restore brand-hex-once and component-variants.spec rows or name them under existing registry lines

Do NOT re-break T14 #book drawer close (4b7cd58).

Commits: one `fix(storybook):` for kit/pattern/story fixes; one `docs:` if docs-only remains. Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Report: W/t15-fix-wave-report.md
