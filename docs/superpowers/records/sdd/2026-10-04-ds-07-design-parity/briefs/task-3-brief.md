### Task 3: Storybook forced states

**Files:** `apps/storybook/package.json` (via `pnpm add -D storybook-addon-pseudo-states --filter @pink-paprikaa-web/storybook`), `apps/storybook/.storybook/main.ts`, `packages/ui/src/lib/story-states.tsx` (new helper).

- [ ] **Step 1:** Install and register the addon (check its README in `node_modules` for the Storybook 10 registration).
- [ ] **Step 2:** `story-states.tsx` exports `StatesRow({ states: ("rest"|"hover"|"press"|"focus"|"disabled")[], render })`. It renders one labelled cell per state, each wrapped with the addon's per-element pseudo-state params (`pseudo: { hover: ["#cell-hover *"], active: [...], focusVisible: [...] }`). Press is shown through `data-pressed` (R139), since `:active` alone can't show Enter. Write it so a component's `States` story is one line per variant.
- [ ] **Step 3: Failing play first** (`Button` `States` story added here as the pilot): assert the hover cell's computed background equals `--color-state-hover`. RED before Task 4 changes Button, which is fine: leave the play skipped with `tags: ["!test"]` until Task 4 un-skips it. Commit `chore(storybook): add forced-state stories`.

