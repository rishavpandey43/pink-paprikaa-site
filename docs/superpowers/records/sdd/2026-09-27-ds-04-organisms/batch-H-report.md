# Batch H report — carried H1–H3, Task 13 ReviewCarousel

Base `e1934a3`, branch `feat/design-system`, HEAD `ffd54f0`. Implementer: Claude Opus 5.5.
Status: **DONE**

## Status log (resume from the first unchecked box)

- [x] Read contract, global constraints, progress rulings, fold list, carried-fixes-H, brief 13 (== plan Task 13 at e1934a3 except the plan's fold-23 sr-only span; plan wins), AUTHORING, CLAUDE.md, batch F/G reports
- [x] H1 story-ring strips every colour function before reading lengths (+ oklch spec, RED seen) — 373698b
- [x] H2 story-ring containing block: backdrop-filter, will-change, container-type, content-visibility (+ translate/rotate/scale; specs, RED seen) — 3783ee0
- [x] H3 Dialog JSDoc documents trigger-less focus return (R115) — 5d2bc6e
- [x] H1–H3 plan sync (Task 6 story-ring + spec, Task 11 dialog + stories) — 925b035
- [x] T13 Step 1 eslint region exception (track lint RED seen first)
- [x] T13 token + build check
- [x] T13 RED test
- [x] T13 track leaf + organism → GREEN (11/11)
- [x] T13 stories (+ ring play, fold 20; mutation seen failing)
- [x] T13 export, format, lint --fix, format again, gates, commit — ba9a061
- [x] T13 plan re-sort 2654fdd / plan sync 9c17bd9 + ffd54f0
- [x] Final: format:check, sync:check, storybook:test, guard:founder, report complete

## Commits

| SHA | Subject |
| --- | --- |
| 373698b | fix(ui): read no lengths from colour functions in a ring's box-shadow (H1) |
| 3783ee0 | fix(ui): stop the ring walk at every box that contains a fixed control (H2) |
| 5d2bc6e | docs(ui): say when a dialog without a trigger cannot return focus (H3) |
| 925b035 | docs: bring plan 4's story ring and dialog code in line with carried fixes h1-h3 |
| ba9a061 | feat(ui): add the ReviewCarousel organism (T13) |
| 2654fdd | docs: re-sort the review carousel classes in plan 4 |
| 9c17bd9 | docs: bring plan 4's review carousel code in line with the build |
| ffd54f0 | docs: carry the review carousel commit body into plan 4 |

## Carried fixes

### H1 — colour functions in a computed box-shadow (373698b)
`shadowReach` now strips `/\w+\([^)]*\)/g` (the brief's regex) before splitting the shadows, with a
one-line comment. New spec case "reads no lengths from a colour function's channels": an
`oklch(0.75 0.12 350) 0px 0px 0px 3px` ring 1px inside the frame must be clipped, and a
`color(srgb 9 0.7 0.8) …` ring 4px inside must not be. RED: `expected [] to deeply equal [ …(1) ]`
(the old code read the oklch chroma 0.12 as the x offset, so the 3px ring measured 0.12px). GREEN
10/10. jsdom keeps the oklch string verbatim in computed style (probed first).

### H2 — containing-block triggers (3783ee0)
`containingBlock` now also stops at an ancestor with `backdrop-filter`, `will-change` naming
transform/translate/rotate/scale/perspective/filter/contain, `container-type` other than `normal`,
`content-visibility: auto`, and the individual `translate` / `rotate` / `scale` properties.
- **Deviation (additive):** `translate`/`rotate`/`scale` were not in the brief. Tailwind 4's
  `translate-*`, `rotate-*` and `scale-*` utilities write those properties, not `transform`, and they
  contain fixed and absolute boxes the same way. Same function, same bug class; spec cases added.
- `backdrop-filter` is read with `getPropertyValue("backdrop-filter")`: jsdom's computed style drops
  that property (`backdropFilter` is `undefined` there, which `isSet` would read as set). Its spec
  case stubs `getComputedStyle` for the frame only (restoreMocks undoes it).
- Spec: 7 `it.each` "stops a fixed control at a frame with X" + 1 backdrop-filter case + 3 escape
  cases (`will-change: opacity`, `container-type: normal`, `content-visibility: visible`). RED: 8
  failed (all containment cases), the 3 escape cases passed (they guard against over-matching).
  GREEN 21/21. Every existing ring play stayed green in the full storybook run (931/931).

### H3 — trigger-less focus return documented (5d2bc6e), R115
`trigger` prop JSDoc: focus returns to the trigger; without one, to the element focused at open,
reliable for keyboard opens, but Safari and Firefox on macOS do not focus a clicked button, so a
pointer-opened dialog returns focus to `<body>`; pass a trigger where that matters. The component
JSDoc points at `trigger`; the story docs description says the same. No new prop. Docs-only change,
so no test.

Plan sync 925b035: Task 6 `story-ring.ts` + `story-ring.spec.ts`, Task 11 `dialog.tsx` +
`dialog.stories.tsx` blocks now equal the build (script-compared). No test counts for story-ring
appear in the plan prose.

## Task 13 — ReviewCarousel (ba9a061)

Built from the plan (brief + the plan's fold-23 `<span className="sr-only"> Opens in a new tab</span>`
in the `EMPTY` story anchor). Step 1: the track file failed lint with
`jsx-a11y/no-noninteractive-tabindex` before the config change (fold 15 confirmed), then passed with
the `region` exception (option names checked in the installed eslint-plugin-jsx-a11y 6.10.2). Token
`--grid-auto-columns-review-carousel: minmax(min(320px, 85%), 1fr);` emitted, no Style Dictionary
warning; it is a grid token, so no `SPACING`/`TEXT` registration and no catalogue row. Barrel block
after QuotePanel (path order). RED: `Failed to resolve import "./review-carousel"`. Then 11/11.

Deviations from the plan (overlay-driven; plan synced):
1. **Fold 18** — `eyebrow` gates on `isShown` (plan: truthiness). `emptyState` renders bare, so it
   needs no gate. New test "renders no eyebrow wrapper for an empty eyebrow" (11 tests, plan said 10).
   The plan's truthy gate also passes that test, so I proved it can fail by mutating the gate to
   `eyebrow !== undefined`: `× renders no eyebrow wrapper… expected <span …(1)>`, then restored.
2. **Fold 20 ring play** — `proveRingsWhole` on `Mobile` (360) and `Desktop` (1280): it tabs through
   all 8 stops (previous, next, the track, the four cards' "View on Google" links, the footer link).
   For each it asserts the stop is inside the canvas and that `ringClippers` returns `[]`, wrapped in
   `waitFor` because focus scrolls the track (smoothly under motion-safe). It also checks the stop
   count. Reuses `lib/story-ring.ts`.
   - **Finding:** removing the track's `px-1 pt-1 pb-4` alone still passes. The track draws its own
     ring outside itself, and nothing above it clips; the links sit inside the cards' own padding.
     So the track's room is not what keeps the rings whole.
   - **Proof the play is live:** with the track at `p-0` and the story cards at `className: "p-0"`,
     both plays fail (`expected [ <figure …> ] to deeply equal []`, the card clips the link's ring).
     Restored, both pass. The plan's `px-1 pt-1 pb-4` is kept as written.
3. Commit body gained one sentence about the above.

R44/R111: the footer link uses `Link isExternal`, which announces "Opens in a new tab". The `EMPTY`
anchor carries the sr-only span (fold 23). R82 does not apply (no overlay). Stories are
`layout: "fullscreen"`, so batch F's centred-canvas frame collapse does not apply. Fixtures are the
verified Google reviews (pure veg dishes), and the empty card spells "Pink Paprikaa".

Dev parity: **Dev reference: none (handoff component).** `git ls-tree -r dev` has no carousel file,
so there is no parity table.

## Gates (after ba9a061; later commits are docs only)

`pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build` → exit 0:

```
 Test Files  4 passed (4)
      Tests  288 passed (288)
…
 ✓ |@pink-paprikaa-web/ui| src/organisms/review-carousel/review-carousel.test.tsx (11 tests) 1383ms
 ✓ |@pink-paprikaa-web/ui| src/lib/story-ring.spec.ts (21 tests) 186ms
…
 Test Files  105 passed (105)
      Tests  1577 passed (1577)
> nx run @pink-paprikaa-web/ui:lint
> eslint .
 NX   Successfully ran targets typecheck, lint, test for 2 projects and 2 tasks they depend on
…
 NX   Successfully ran target build for project @pink-paprikaa-web/storybook and 2 tasks it depends on
```

`pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache` → exit 0 on the first run (no
cold-cache failure):

```
 Test Files  98 passed (98)
      Tests  931 passed (931)
```

`pnpm nx format:check`: after ba9a061 it listed only the plan doc (re-sort → 2654fdd). After ffd54f0
it exits 0 with no files listed. `pnpm nx sync:check` → `[@nx/js:typescript-sync]: All files are up
to date.` `pnpm guard:founder` → `Founder-name guard: clean.`

Counts: ui 1554 → 1577 (+1 H1, +11 H2, +11 ReviewCarousel); storybook 922 → 931 (+9
ReviewCarousel stories); design-tokens 288 → 288.

## Concerns

None blocking.
1. **H2 goes past the brief:** it also handles `translate`/`rotate`/`scale` (Tailwind 4 writes them).
   The reviewer judges.
2. **The track's padding does not affect the rings** (see deviation 2). The plays prove the rings are
   whole, and that the check fails when the cards lose their padding. The padding stays as the plan
   wrote it.
3. **9c17bd9 missed one edit:** the commit-body sentence in the plan was left out of the commit,
   most likely by lint-staged's stash-and-restore. No new stash was created. It is my own edit, so I
   committed it separately (ffd54f0).
4. Stash list unchanged at 2 (the lint-staged backups from earlier batches); none dropped. No git
   lock errors.
