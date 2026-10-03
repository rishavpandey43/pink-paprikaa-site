# P5 T14 — Docs and records

**Files**

- Modify: `docs/engineering/{02,03,04,05,06,09}-*.md`, the architecture spec (§8, §15 Phase 1), the rewrite spec (status line, §9.3), `CLAUDE.md` (project section only), `docs/README.md`.
- Replace: `apps/storybook/README.md`, `packages/ui/README.md`
- Optional: AUTHORING §2 lib list.

**What it is:** the final records. Base text: plan Task 14 Steps 1–11 (`git show f1a6c3e:docs/superpowers/plans/2026-09-27-ds-05-storybook-kits-docs.md`), plus these corrections.

**Corrections (built ≠ plan)**

- Recount components. Today: 30 atoms, 38 molecules, 15 organisms (14 + CartPanel), 7 layouts.
- `apps/storybook/vitest.config.mts` has **two** projects: `storybook` (browser) and `docs-kit` (node). Plan's "one project" is false.
- Drift "PriceTag has no canvas size" is **closed** (`size="canvas"`).
- `lib/` also holds: is-shown, struck-price, symbol-mark, control-states, notification, field-message, field-control, choice-control, use-controllable-state, use-focus-return, assign-ref, stretched-link. (+ story-only story-*).
- Spec §9.3 SiteHeader:
  - nav from lg
  - three links lg–2xl
  - all inline from **2xl** (R116), not xl
  - drawer trigger shown while any link is hidden
- Record Plan 4 deviations from the built props:
  - CartPanel empty/note props + `cartTotals`
  - OrderTracker `badge`, `codeLabel`, `paymentLabel`, `progressLabel`
  - Dialog `closeLabel`, `portalContainer`, `hasCloseButton`, `className`
  - SiteHeader `compactActions`, `drawerLinks`, `portalContainer`
  - `pattern` enum; SiteFooter `hasDockClearance`
  - MenuList labels, `defaultCategory`, `lede`
  - TestimonialWall `lede`; FaqSection `defaultOpen`; Accordion `headingLevel` (R112)
- Count groups from `preview.tsx` storySort.
- R28: keep the Storybook README's Fontsource/`@source` and `nx:noop` paragraphs.

**Gate**

- The founder grep over the edited files exits 1.
- Both `nx configuration` markers survive.
- `format:check` and `sync:check` are green.
- Write "`origin` (GitHub)", never the remote URL.

**Commit:** `docs: record the finished design system`
