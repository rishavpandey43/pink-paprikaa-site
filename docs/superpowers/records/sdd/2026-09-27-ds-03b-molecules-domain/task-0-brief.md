### Task 0: Reconcile with the code as built

Plans 2a, 2b, 2c and 3a were written in parallel against the contracts and executed before this one. Before any component is written, confirm every interface this plan consumes exists exactly as the code below assumes, and patch the later tasks to reality. **This task changes no files and has no commit**; its report is the patch list the controller applies when dispatching Tasks 1–21.

**Files:** none (read-only).

**Interfaces:**

- Consumes (must exist): `componentVariants` and the scale lists `TEXT`, `SPACING`, `SHADOW`, `RADIUS` in `lib/component-variants.ts`; `headingTag`, `type HeadingLevel` (`lib/heading.ts`), `type LinkAs`, `type LinkAsProps` (`lib/link-as.ts`), `OnSurfaces` (`lib/story-surfaces.tsx`), `controlStates` (`lib/control-states.ts`) and the `transition-control` utility — all Plan 2a Task 1; atoms `Avatar`, `Badge`, `Button`, `Card`, `Icon` (+ `type IconComponent`), `IconButton`, `ImageSlot`, `Link`, `Logo`, `StatusDot`, `Tag` + `tagVariants` (Plan 2a), `Countdown`, `DietMark`, `PriceTag`, `ProgressBar`, `Rating`, `SpiceLevel` (Plan 2b); the `autogrid-min-<step>` utility (Plan 2c Task 5); `expectNoA11yViolations` and `fakeRegister` in `packages/ui/vitest.setup.ts`.
- Produces: a written list of mismatches and the exact patch for each affected task.

- [ ] **Step 1: Confirm the dependency plans landed**

Run:

```bash
git log --oneline | head -80
ls packages/ui/src/atoms packages/ui/src/layouts packages/ui/src/molecules packages/ui/src/lib
```

Expected: the commits of Plans 1, 2a, 2b, 2c and 3a; the atom folders above; `lib/heading.ts`, `lib/link-as.ts`, `lib/story-surfaces.tsx`, `lib/control-states.ts`, `lib/symbol-mark.tsx`, `lib/field-status.ts`, `lib/space.ts`. If any is missing, **stop** and report — this plan cannot start.

- [ ] **Step 2: Read every consumed signature**

Run:

```bash
rtk proxy grep -n "^export" packages/ui/src/lib/{component-variants,heading,link-as,control-states}.ts packages/ui/src/lib/story-surfaces.tsx
for a in avatar badge button card countdown diet-mark icon icon-button image-slot link logo price-tag progress-bar rating spice-level status-dot tag; do
  echo "=== $a"; sed -n '/^export/,/^}/p' packages/ui/src/atoms/$a/$a.tsx | head -90
done
rtk proxy grep -n "autogrid-min\|transition-control" packages/ui/src/styles.css
rtk proxy grep -n "export function fakeRegister" packages/ui/vitest.setup.ts
```

Compare each against contracts §1–§4 and the facts below. Record every difference (a renamed prop, a missing variant, a different default).

- [ ] **Step 3: Check the facts this plan's code relies on**

Each was read from the finished Plans 2a / 2b / 2c; confirm it against the code. Write one line per fact: **holds** or **differs → patch**.

| #   | Fact assumed by the code below (source)                                                                                                                                                                                                                                                                                                                                                                      | Patch if it differs                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| a   | `tagVariants` (2a Task 8) is a slots instance: slots `root` (which already includes `controlStates()`, so `aria-disabled` gets the grey look and `pointer-events: none`) and `label` (`min-w-0 truncate`); variants `tone`, `isSelected`, `isInteractive`. FilterBar and ChipGroup call `tagVariants({ isSelected, isInteractive: true })`, render `<Icon size="sm">` then `<span className={tag.label()}>`. | Use the real slot/variant names. Never nest the `Tag` component inside a ToggleGroup item.                                      |
| b   | `Card` (2a Task 9): `padding` sm = `p-4` (16px), md = `p-5` (20px); root has `overflow-hidden`; `default`/`quiet` set `data-surface="light"`, `feature` → `soft`; `asChild` via `Slot.Root`.                                                                                                                                                                                                                 | Pick the step whose px is 16 (LoyaltyCard) / 20 (ReviewCard).                                                                   |
| c   | `autogrid-min-<step>` (2c Task 5) sets **only** `grid-template-columns` from `--spacing-grid-min-<step>`, so ChoiceCardGroup's `gap-2` stands; Steps' rule grid uses `grid gap-4 autogrid-min-md`.                                                                                                                                                                                                           | Use the real utility name.                                                                                                      |
| d   | `Rating` (2b Task 11): `size` sm 12 / md 16 / lg 24 with 16px the default; `variant` `"diamond" \| "symbol"`; named "5 out of 5".                                                                                                                                                                                                                                                                            | Pass the 16px step in Task 4; adjust the test's name.                                                                           |
| e   | `SpiceLevel` sm = 12px, `role="img"` named "Spice level 3 of 4"; `DietMark` sm = 14px, `role="img"` named "Vegetarian"; `ProgressBar` sm = 6px and prints its `label` unless `isLabelHidden`; `PriceTag` renders the struck `was` inside its root and **throws when `was` is not above `amount`** (every fixture here keeps `was` higher).                                                                   | Adjust the test assertions (tests assert text content, never markup).                                                           |
| f   | `ImageSlot` (2a Task 11): the placeholder is `role="img"` named by `label` with the label also visible; the image branch is an `<img alt>`; `className` merges onto the root.                                                                                                                                                                                                                                | Adjust MenuItemRow / MenuItemCard / OutletCard tests.                                                                           |
| g   | `Avatar` (2a Task 14) with `name` is `role="img"` showing two initials ("VK") and spreads `aria-hidden` onto its root.                                                                                                                                                                                                                                                                                       | Adjust Task 4's initials assertion.                                                                                             |
| h   | `Countdown` (2b) renders `<time dateTime={endsAt}>` in its own mono pill and accepts `toISOString()`'s `Z` as the offset (the stories and tests build `endsAt` that way).                                                                                                                                                                                                                                    | If `Z` is rejected, build `endsAt` with an explicit `+05:30` offset in Task 19's tests and stories.                             |
| i   | `Link` (2a Task 3): `size="sm"` and `isExternal` (target `_blank`, safe rel, arrow glyph).                                                                                                                                                                                                                                                                                                                   | Adjust ReviewCard.                                                                                                              |
| j   | **R13** — every optional atom prop is declared `?: T \| undefined`, so `was={was}`, `src={avatar}`, `label={countdownLabel}` compile under `exactOptionalPropertyTypes`.                                                                                                                                                                                                                                     | For any atom prop that still lacks `\| undefined`, write `{...(x === undefined ? {} : { x })}` at that call site and report it. |
| k   | `OnSurfaces({ children })` (2a Task 1) renders its children on page / alt / brand / ink / soft in a `flex flex-wrap` row per ground; `fakeRegister(name)` (2b Task 1) returns `{ name, onChange, onBlur, ref }` as `vi.fn()` spies.                                                                                                                                                                          | Use the real names.                                                                                                             |
| l   | Dev parity tables present on every ported-component task (contracts §0.0): Tasks 1–9 each carry a `**Dev reference:**` line and a `**Dev parity:**` table; Tasks 10–20 carry `**Dev reference:** none (handoff component)`.                                                                                                                                                                                  | Stop and report the task that lacks one; the controller adds it before dispatch.                                                |

- [ ] **Step 4: Confirm the baseline is green**

Run the per-task gate command (without the prettier and `--fix` lines). Expected: green. If it is red before this plan starts, stop and report the failing target.

- [ ] **Step 5: Report**

Report: the Step 3 table filled in, every Step 2 difference, and for each the task number and the exact replacement text. The controller applies them to the task texts before dispatch.

---

