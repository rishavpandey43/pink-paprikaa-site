---
description: Create a design-system component the canonical way (shape, tests, stories, gates)
---

Create a new component in `packages/ui` following docs/engineering exactly. Component request: $ARGUMENTS

Deterministic procedure — follow docs/engineering/08-recipes.md §1 with these gates:

1. Confirm the atomic layer via the table in docs/engineering/03-patterns.md §1. If torn between
   two layers, take the lower. State the chosen layer and why in one line.
2. Check any new visual value against `packages/design-tokens/tokens/` — if a needed
   colour/spacing token doesn't exist, STOP and add the token first (recipe §3), never a literal.
3. Create `packages/ui/src/<layer>/<name>/<name>.tsx` by copying the canonical shape from
   docs/engineering/03-patterns.md §1 (tv() variants, native-prop extension, named export,
   no forwardRef, Radix for any behavioural complexity).
4. Write `<name>.test.tsx` BEFORE finishing the implementation: render + per-variant behaviour +
   `expect(await axe(container)).toHaveNoViolations()`. Run RED, implement, run GREEN.
5. Write `<name>.stories.tsx` — one story per variant.
6. Export from `packages/ui/src/index.ts` only (no folder barrels).
7. Gate (all must pass; show output): `pnpm nx test ui && pnpm nx lint ui && pnpm nx run ui:build-storybook`
   then `pnpm verify`.
8. Self-review against docs/engineering/06-quality-gates.md §5, then commit with scope `ui`
   (`pnpm commit` or a conventional message).

Hard rules that override anything else: no raw hex, no default export, no boolean render forks,
Pink Paprikaa spelled with two a's in any copy/fixtures, no founder names anywhere.
