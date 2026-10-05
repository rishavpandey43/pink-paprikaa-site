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

