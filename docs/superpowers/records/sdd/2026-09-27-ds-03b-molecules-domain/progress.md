# SDD ledger — plan: docs/superpowers/plans/2026-09-27-ds-03b-molecules-domain.md
Spec: docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md. Contracts: docs/superpowers/plans/2026-09-27-ds-00-contracts.md.
Carried rulings: R13, R15, R19/R25, R42, R43 (Task 0 fold-list overlay), R44, R46–R48, R51 (pipeline review, fixes fold into next batch), R61/R63/R65 (docs-kit markers/chips; catalogue.spec reads packages/ui/src live), R66, R72/R73, R75 (nothing imports a layout — layouts are the top tier), R77 (storybook:test in every gate), R79 (blank labels fall back), R82 (overlays restore focus on close), R83 (heading via createElement(headingTag(level))), R86, R87.
Known traps: lower-case commit subjects (commitlint); OnSurfacesStory name clash with the OnSurfaces import; floor360 viewport via globals; sr-only text over Icon labels when textContent matters; font-regular not font-normal; plan-doc re-sort commits; TS2322 narrow cast for  props.
Pure-veg brand: nothing non-veg, not even egg — MenuItemRow/MenuItemCard/DietMark usage is veg-only. "Pink Paprikaa" two a's. No founder identity.
Plan 5 hand-offs: Company details FactList → KeyValueList (T13; remap article→md, narrow→lg); doc-table.tsx → Table (T20).
Batches: A=T0+T1 · B=T2–T4 · C=T5–T7 · D=T8–T10 · E=T11–T13 · F=T14–T17 · G=T18–T20 · H=T21 parity. 3a's final fix wave (if any) rides in B (R74 precedent).
