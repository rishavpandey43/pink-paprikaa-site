# Dev-parity audit — brief (one agent per plan)

Repo: /Users/rishavpa/Professional/pink-paprikaa-site, branch `feat/design-system`.

## Why

Owner directive (2026-09-27): the `dev` branch holds 74 August-port design-system components. Each has an
implementation, a `*.test.tsx` and a `*.stories.tsx`. Its Foundations MDX lives in `packages/ui/src/docs/`. The
rewrite must **port and upgrade** those 74. It must not lose anything they do. The 16 handoff components are new.
Read the binding rule first: `docs/superpowers/plans/2026-09-27-ds-00-contracts.md` §0.0 ("Dev parity").

Your job is to make YOUR plan file carry that parity **before** it executes. Plan implementers then have it in
their task text.

## Inputs

- Your plan file (named in your dispatch). It holds full code, tests and stories per task.
- The spec: `docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md`. The key sections are §3 decisions
  D1–D18, conflicts C1–C16, §8 rules and the prop translation table, §9 inventory, and §10 Storybook.
- The contracts: `docs/superpowers/plans/2026-09-27-ds-00-contracts.md`.
- The authoring contract: `packages/ui/AUTHORING.md`.
- Dev code, read with `git show dev:<path>` and listed with
  `git ls-tree -r --name-only dev packages/ui/src/<tier>/<name>`. The tier folders are `atoms`, `molecules`,
  `organisms` and `templates`. Dev's `templates/` is the rewrite's `layouts/`.

## Method, per component task in your plan that has a dev counterpart

1. Read dev's `<name>.tsx`, `<name>.test.tsx` and `<name>.stories.tsx`.
2. Diff them against the plan's code, tests and stories for that component. List every item dev has that the plan
   lacks: props or behaviour, edge-case handling, a11y (roles, labels, keyboard, focus, reduced motion), test cases
   and story states or variants.
3. Rule on each item:
   - **ADD** when the spec does not contradict it. Amend the plan task in place with complete code in the plan's
     own style: the test case, the story, the code change. Everything must stay consistent with the contracts,
     AUTHORING.md, the token-only class rules and R13 (`?: T | undefined`).
   - **DROP** when the spec contradicts it. Cite the clause: D1 old DS version, D4 old token names, D9 no content
     defaults, C10 diet prop, C1 header height, and so on.
   - **ALREADY** when the plan covers it differently or better. One line.
4. Insert near the top of that task, right under its title or Files block:
   - `**Dev reference:** git show dev:packages/ui/src/<tier>/<name>/<name>.{tsx,test.tsx,stories.tsx}`
   - a compact `**Dev parity:**` table (item | ADD/DROP/ALREADY | where, or the spec clause)
   - one line: "Implementer: copy this table into your report, extended with anything the plan missed."

Handoff-only components have no dev counterpart. Mark them `**Dev reference:** none (handoff component)` and leave
them otherwise unchanged.

## Rules

- Edit **only your plan file**. Never edit the contracts file, the spec, other plans or any code.
- If an ADD needs a change to a shared contract, such as a prop in `ds-00-contracts.md`, do not make it. List it in
  your report under "Proposed contract deltas" with the exact change. The controller rules on it.
- Do not commit. The controller commits all audits together. Do not run `git checkout`, `stash`, `reset` or anything
  else that moves HEAD or changes the index. Other agents share this working tree.
- Do not dispatch subagents.
- Hard rules: "Pink Paprikaa" has two a's. No founder identity. No literal brand hex. Pure veg (no egg, no non-veg,
  no diet prop).
- Keep the amendments surgical. Don't reformat or rewrite untouched plan text.
- If your plan has a Task 0 (reconcile), add one check to it: "Dev parity tables present on every ported-component
  task."

## Report

Write `.superpowers/sdd/dev-parity/<plan-slug>-audit.md` with these sections:
- per component: counts of ADD, DROP and ALREADY, and the notable items;
- Proposed contract deltas;
- cross-plan notes, meaning a dev item that belongs to another plan's component;
- concerns.

Return only: the ADD/DROP/ALREADY totals, the number of contract deltas, and your concerns, in 5 lines or fewer.
