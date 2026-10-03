# T14 report

**Status:** DONE_WITH_CONCERNS

**SHAs:** `4b7cd58` fix(storybook): close the website-kit drawer before booking · `5b9147a` docs: record the finished design system

**Recount (live tree):** 30 atoms, 38 molecules, 15 organisms (incl. CartPanel), 7 layouts = 90.

## 1) Nested dialog

Book a Table is `<Button asChild><a href="#book" onClick={openBooking}>`. Drawer closes on `a[href]`; `preventDefault` so Chromium story tests do not navigate away. Homepage360 play: Menu → Book → booking dialog, Menu gone. `pnpm nx run storybook:test -- website` → 2 passed.

## 2) Docs Steps 1–11 + slim

Handbook 02/03/04/05/06/09; arch spec §8 + §15 Phase 1; rewrite spec status + §9.3; CLAUDE.md project section; docs/README; Storybook/ui READMEs; AUTHORING §2 lib list.

R28 carry: Fontsource/`@source`; `nx:noop`. Groups from `preview.tsx` storySort: Introduction + 13 groups.

**Dev-parity table:** CLI from this dir ADD; commands ALREADY; story tests Chromium ADD; watch 6006 ADD; "200/441 red" DROP; landmarks ALREADY; brand pink ALREADY; Chromatic ALREADY; founder guard ADD.

## Gates (once, before docs commit)

`pnpm nx run-many -t typecheck lint test build` → Successfully ran for 12 projects. `format:check` + `sync:check` green. `storybook:test` 107 files / 989 tests. `pnpm guard:founder` exit 0, "Founder-name guard: clean." Nx markers CLAUDE.md:1 and :23 survive. No remote URL.

Raw `grep -rniE 'rishav|pandey|anand'` over edited files exit 0 (hits CLAUDE.md hard-rule sentence + pre-existing arch-spec Location / "Supplied by Rishav" rows). Living command is `guard:founder` exit 0.

## Ruling

- Living founder check is `pnpm guard:founder` exit 0, not raw grep exit 1.
- S-04 + 05 registry: two Vitest projects in one config.
- PriceTag canvas Closed. Extra drift rows kept (Icon R13, tokens README, lint gaps).
- CLAUDE.md Current state keeps the SDD-archive bullet (would vanish otherwise).
- `href="#book"` needs preventDefault in story tests.

## Concerns

Review-E Minors not touched (T15). Raw founder grep is noisy on the ban text itself.
