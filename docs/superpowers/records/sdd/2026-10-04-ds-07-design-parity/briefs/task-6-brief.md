### Task 6: Menu and Popover become atoms (R131, R132), with the design's rows, sheet and motion

**Files:** move `packages/ui/src/molecules/{menu,popover}/` → `packages/ui/src/atoms/{menu,popover}/` with `git mv`; create `packages/ui/src/lib/{menu-panel,popover-shell}.tsx`; update `index.ts` and every import; story titles `Atoms/Menu`, `Atoms/Popover`.
**Source:** audit-atoms §Menu, §Popover · audit-molecules §Menu (ours), §Popover (ours), X3, X4.

- [ ] **Step 1: Move first, behaviour unchanged.** `git mv`, fix imports, and confirm `pnpm nx lint ui` passes the atomic-layering LAW (no atom imports a non-Icon atom; anything that does moves into lib per R132). Run all Menu/Popover tests → PASS. Commit `refactor(ui): make menu and popover atoms as the design tiers them`.
- [ ] **Step 2: Failing tests from the audit**, at minimum:
  - rows: hover `state-hover` (pink-50), selected = pink-700 text + brand diamond (`lib/brand-diamond`), row text **15px** as designed (R136's 16px rule covers form-control text only; add a `menu-row` text token if none matches 15px);
  - group labels + trailing meta in mono;
  - danger press colours;
  - empty state;
  - Tab closes + moves focus (Review Focus 4);
  - `data-[state=open]:animate-pop-in`;
  - **≤640px renders as a bottom sheet** (Review Focus 3): handle 40×4, radius-xl top, shadow-4, 18px title, 52px rows, max-h `min(70vh,520px)`, `animate-sheet-in`. Implement the sheet path with `Dialog variant="sheet"` internals in `lib/popover-shell.tsx`, controlled by a `matchMedia("(max-width: 640px)")` hook, and add `sheet?: "auto" | boolean` (default `"auto"`).
- [ ] **Step 3: Implement** in `lib/menu-panel.tsx` (panel + row recipe + empty state + diamond indicator) and `lib/popover-shell.tsx` (floating vs sheet). Tab-to-close: on Content `onKeyDown` Tab → close, then let focus move (`event.preventDefault()` not called; Radix's own Tab trap is bypassed by closing first). → PASS.
- [ ] **Step 4: Stories per card row** + `Sheet360` and `Floating641` plays + `States`. Commit per atom: `fix(ui): match menu to the design handoff`, `fix(ui): match popover to the design handoff`.

