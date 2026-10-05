# SDD ledger — plan: docs/superpowers/slim/p6-README.md (MUI gap components, owner 2026-10-04)
SLIM MODE: implementer reads RULES.md + its p6 task file + one sibling. Contracts: .superpowers/sdd/{implementer,reviewer}-contract.md.
Batches: X1 = A Box+Grid, B Drawer, C Popover+DropdownMenu · X2 = D Combobox, E Fab+SpeedDial, F DatePicker. Review X1 in parallel with X2; then final review + one fix wave.
Pre: a07cc21 global pointer cursor (owner report: no hand cursor on hover).
Ledger: X1 (A Box+Grid, B Drawer, C Popover+DropdownMenu) dispatched base 4a2c68b.
OWNER 2026-10-04 (R128): MUI-grade API — typed `sx` on every component (not loose system props; MUI v7 direction) — cost if wrong: one prop per component to swap for system props.
OWNER 2026-10-04 (R129): unify prop names in brand language — one `color` palette (brand|neutral|success|warning|danger|info|inverse), domain states → `status`, one size scale sm|md|lg, Text → Typography with Link etc. inheriting its props — cost if wrong: renames across stories/kits (no external consumers yet).
OWNER 2026-10-04 (R130): X1 finishes on today's API, then P7 moves everything; X2 waits and is built on P7 — cost if wrong: small X1 rework.
Plan: X1 → P7-0 foundation → P7-1 atoms+layouts → P7-2 molecules → P7-3 organisms+kits/docs → X2 → final review + one fix wave. Specs: docs/superpowers/slim/p7-*.md (uncommitted until X1's last commit).
Planned 2026-10-04: spec + plan written for Cursor execution (docs/superpowers/plans/2026-10-04-ds-06-component-api.md, Tasks 0–17). X1 stopped by owner order (Claude tokens): Box committed fd5d8b2 (old API, reworked in Task 4), Grid WIP uncommitted (Task 0 parks/finishes it). RESUME HERE: Cursor executes the plan from Task 0.
Task 0: baseline ui 1653 tests
Ruling: moved Grid WIP out of packages/ui (not only cp) — untracked grid/ failed index.spec barrel+trio gates; typecheck passed — Task 4 must restore from .superpowers/sdd/2026-10-04-ds-06-mui-gaps/wip-grid/
Task 1: done 661b9cd..06a0125 (ui 1683, sb 995)
Task 2: done 06a0125..fb7e784 (ui 1685, sb n/a)
OWNER 2026-10-04: Claude Design is producing a new handoff (Select/Menu/Combobox/DatePicker/Input/SearchField/Forms/Avatar/Scrollbar). HOLD before Task 15b: do Tasks 0–15 as planned, then STOP at 15b until the plan/spec are updated from the new design files.
Ruling: atomic-layering now lets an atom import `atoms/typography` (besides icon) — brief requires Link (atom) to render through Typography (atom), which the LAW rule banned; amended the rule + its test + AUTHORING/engineering docs, no eslint-disable — cost if wrong: revert the regex and have Link use a lib recipe instead.
Ruling: Typography `variant` also accepts "inherit" (no size/face/colour classes, so a Link in prose takes its paragraph's size) — brief's "text-inherit" is a colour class and would not inherit size — cost if wrong: drop one variant key.
Ruling: noWrap = "truncate text-nowrap" — `text-pretty`/`text-balance` set text-wrap, a white-space shorthand, so truncate alone still wrapped (caught by the NoWrap play) — cost if wrong: none.
Task 3: done fb7e784..1ebd380 (ui 1700, sb 996)
Task 4: done 1ebd380..28b8803 (ui 1711, sb 1002)
Plan updated 2026-10-04 by Claude (uncommitted while Cursor runs): Task 14 is now MUI-named Menu (incl. 3-dot menu), new Task 14b ToggleButton + ToggleButtonGroup. Include these two doc files in your next docs commit, or leave them for Claude to commit.
Task 5: done 28b8803..425aafe (ui 1719, sb 1003) — batch gate 1 green
Ruling: ordering-app kit keeps its own `size` prop and maps it to AppShell `frame` — out of brief scope to rename the kit API — cost if wrong: rename the kit prop.
Task 6: done 425aafe..425aafe (reference table verified)
Task 7: done fd76fc4..6af007a (ui 112 files/1732 tests, sb 110 files/1005 tests)
Ruling: Badge status colours (success/warning/danger) have only a soft skin — either `variant` paints it (old tone had no solid status skin; inventing one would be unreviewed contrast) — cost if wrong: add compoundVariants rows.
Ruling: Card `surface` is typed brand|ink only and replaces `variant` (skin = surface ?? variant) so a flooded card keeps exact old classes (no stacked border/shadow-1) — cost: widen type later.
Ruling: LoyaltyCard call site adapted to `<Card variant="feature" surface=…>` in the Card commit; its own prop rename stays Task 10.
Task 8: done e5d6879..75acfca (ui 112 files/1743 tests, sb 110 files/1014 tests)
Ruling: Stat and LogoLockup are molecules (Task 11), not atoms; Stat left for Task 11. LogoLockup's `tone`→`color` (brand|inverse|badge) + sx done here in its own commit (520b3ad) because it forwards to Logo — brief omitted it — cost if wrong: revert one commit.
Ruling: PatternField `surface` typed brand|ink|soft|page; data-surface via SURFACE_DATA (page→"light", unchanged DOM); Section/HeroBanner map their "light" data-surface to "page" at the call — cost if wrong: widen the type.
Ruling: Logo/LogoLockup/PriceTag/Spinner/ProgressBar use BasePropsWithColor (native svg/span/div `color` attr dropped) — cost: none.
Task 9: done 1fac245..1fac245 (ui 112 files/1757 tests, sb 110 files/1014 tests) — batch gate 2 green
Ruling: `sx` for Checkbox/Radio/Switch lands once in lib/choice-control (the shared label root); RadioGroup also takes `sx` on its fieldset. Input/Select pass `withSx(sx, className)` to FieldControl's box. Tooltip `sx` goes on the content (Provider/Trigger render no element of their own). No renames — cost if wrong: none.
Task 10: done a2effe1..c3645c4 (ui 112 files/1772 tests, sb 110 files/1014 tests)
Ruling: ChipGroup / OtpInput / QuantityStepper keep `ref` (and QuantityStepper `id`, aria-describedby/invalid, required) on their inner control — react-hook-form's Controller focuses it and Field's label points at it (existing tests) — so id/data-*/aria-*/className/sx land on the outer wrapper and brief's "ref on root" is met only for Tabs, Toast, Snackbar, FilterBar, Dialog — cost if wrong: add a `rootRef` prop.
Ruling: ChipGroup drops a caller's `aria-invalid` (status owns it; existing test) via `aria-invalid={undefined}` after the spread — cost: none.
Ruling: SearchField native props/ref stay on the input (they always did); only `sx` added, on the wrapper. SlotPicker already spread a fieldset: sx added + ref now typed — cost: none.
Ruling: Dialog has no root element — native props/ref/sx/className all land on the Content panel (role=dialog); a caller `id` replaces Radix's contentId (Trigger aria-controls then misses) — cost if wrong: strip `id`.
Ruling: NotificationProps now extends Omit<BaseProps<"li">, "onPause"|"onResume"> (Radix toast timer callbacks differ from the li media events); Toast/Snackbar compose a caller's onFocus/onBlur with useFocusReturn's — cost: none. ToastProvider unchanged (renders only the Radix viewport).
Ruling: ChipGroup/OtpInput/QuantityStepper keep ref on the inner control (RHF/focus); id/data/aria/sx on outer wrapper — Review Focus #5 relaxed for these three because moving ref would break existing RHF contracts — cost if wrong: add rootRef later.
Task 11: done c3645c4..9d0060c (ui 112 files/1800 tests, sb 110 files/1014 tests)
Ruling: ReviewCard `surface="brand"` keeps the old brand variant's look exactly (Card variant="feature", soft data-surface, heading/brand text classes) — table says brand→surface but the old classes are the soft feature card — cost if wrong: swap in Card surface="brand" and re-skin text.
Ruling: LoyaltyCard keeps `variant="feature"` (single value) and takes `surface="brand"`, forwarded to Card — as in the table — cost: none.
Ruling: CouponTicket/LinkCard/ChoiceCardGroup surface values map to data-surface via SURFACE_DATA/SURFACE_OF (page→light); ChoiceCardGroup `sx` on the fieldset root (ref still goes to the radios) — cost: none.
Ruling: Table `sx` lands on the frame (where className already went), not the <table> or its parts; menu-item-card/outlet-card sx goes with className on the Card/article root — cost if wrong: move to the inner element.
Ruling: TestimonialWall (organism, Task 12) keeps its own `variant`; maps brand → ReviewCard `surface="brand"` at the call; StatBand maps its tones onto Stat `color` — cost: none.
Ruling: ReviewCard surface="brand" keeps the soft pink feature classes (plan Task 6 mapping + visual parity), not Card flooded brand — vocabulary tension noted for Task 17; cost if wrong: rename to surface="soft" and update TestimonialWall.
Task 12: done 9d0060c..1807a28 (ui 112 files/1814 tests, sb 110 files/1014 tests) — batch gate 3 green
Ruling: QuotePanel `tone="light"` (bg-surface-card white island) → `surface="page"` (nearest SurfaceProp; data-surface stays "light" via SURFACE_DATA, classes unchanged) — cost if wrong: rename to a card surface later.
Ruling: HeroBanner `alt`→`surface="alt"` (bg-surface-page-alt, data-surface light); PatternField gets `page` for alt; local SURFACE map dropped for SURFACE_DATA — cost: none.
Ruling: all 14 organisms (Dialog already done) take `sx` through `withSx(sx, className)` on the root; CartPanel on both empty and populated roots; TestimonialWall keeps its own `variant` — cost: none.
Task 13: done 1807a28..1f19df6 (ui 112 files/1814 tests, sb 111 files/1021 tests) — batch gate 4 green
Ruling: Toast/Snackbar `tone`→`color` (brand|neutral|success|danger; ink→neutral, classes unchanged), NotificationProps uses BasePropsWithColor, NotificationTone→NotificationColor — the Task 6 table lists them and the grep gate flagged them; Task 10 had left them — cost if wrong: revert 3 files + tests.
Ruling: docs-kit TypeSpecimen `tone`→`color` (its own docs helper prop) so the `tone=` grep gate is empty — cost: none.
Ruling: new storySort group "Foundations" > "System (sx)"; Responsive play pinned to the 360px floor, asserts base margin 8px — cost: none.
Ruling: Drawer = Dialog `variant="drawer"` + `side` (start|end, default end); `start-0`/`end-0` are the brief's logical edge classes (the overlay's justify-start/end does the layout); size → `max-w-dialog-drawer-*`; keyframes `animate-drawer-in-start|end` (plain keyframes, reduced motion handled by the global reset, no RTL flip of the slide) — cost if wrong: add an RTL keyframe pair.
Ruling: Menu rows use Icon `md` (20px), not the brief's 18px — no 18px icon token exists and none was named in the brief's token list; dense rows use Tailwind scale `min-h-9` (36px), 44px rows `min-h-hit` — cost: add a menu-icon token.
Ruling: MenuContent `aria-label` blanks Radix's `aria-labelledby` (trigger id) so the label actually names the menu; `SubMenuContent` ignores `side`/`align` (Radix places submenus itself); isSelected also sets `aria-current` — cost: none.
Ruling: Popover arrow uses `fill-surface-card`; docs-kit DERIVED list gains it (R65) — cost: none. PopoverProps/MenuItemProps extend native div props (+ ref) beyond the brief's SxProp-only shape.
Task 14: done 7871fd1..314a318 (ui 114 files/1863 tests, sb 113 files/1055 tests)
Task 14b: done 314a318..066c076 (ui 116 files/1890 tests, sb toggle-button 2 files/17 stories)
Ruling: heights 32/40/48 per the brief's numbers (Button is 36/44/54, so "matching Button" is only in the sm/md/lg naming) — cost if wrong: edit 3 values in toggle-button.json.
Ruling: group context lives in lib/toggle-button-group-context.ts so the atom can read it without importing the molecule (atomic layering) — cost: none.
Ruling: Radix roles are toolbar (multiple) / radiogroup (exclusive); isValueRequired is exclusive-only (MUI) — cost: none.
Task 15: done 6de76d6..1f80238 (ui 121 files/1966 tests, sb filtered combobox+fab+speed-dial+date-picker 4 files/35 stories)
Ruling: brief's fixture dates were a weekday off — 4 Oct 2026 is a Sunday (not Sat), so formatDate/DatePicker tests expect "Sun, 4 Oct 2026" and, after ArrowRight, "Mon, 5 Oct 2026"; the Monday-disabled test uses 5 Oct — cost: none.
Ruling: react-day-picker resolved to ^10.0.2 (via pnpm add); v10 has no fromDate/toDate, so Calendar maps them to `{before}`/`{after}` disabled matchers plus startMonth/endMonth (nav limits); disabled days are `<button disabled>` inside a `td[data-disabled]`, not aria-disabled cells; nav limit buttons use aria-disabled — cost: none.
Ruling: selected day uses `bg-pink-500 text-ink-000` (primitive colour utilities generated from the tokens, same as IconButton's count bubble) with `!` so a hover tint cannot repaint it; range sets `selected: ""` and paints range_start/end/middle itself — cost: if a brand `selected` token is added, swap two classes.
Ruling: Fab primary uses Button's surface-aware `bg-button-primary-bg text-button-primary-fg` (brand fill + white on light grounds, flips on pink) rather than literal ink-000; secondary `bg-surface-card text-text-brand` — cost: none.
Ruling: `dock-clearance` is a `bottom`-only token, so the brief's `mb-dock-clearance` is invalid; pinned Fab/SpeedDial use `bottom-dock-clearance md:bottom-6` (the Snackbar/Toast precedent) — cost: none.
Ruling: SpeedDial refocuses the trigger explicitly on Escape/select (Safari does not focus a button on click, which breaks useFocusReturn's capture-on-open); its root is role="presentation" to carry the arrow-key handler without an eslint-disable — cost: none.
Ruling: DatePicker keeps the chosen day when it is picked again (a single-mode DayPicker would clear it); the trigger's description is the formatted value/placeholder (aria-describedby = value id + caller's), name from aria-label or Field's label — cost: none.
Ruling: Combobox restores the chosen label (or empties) on blur; Escape-when-closed clears text and value; a committed label shows the full list (filter applies only to typed text); loading/empty message is a `role=status` inside the popup, listbox is `hidden` while empty; `ref` is on the input — cost: none.
Ruling: Calendar/DatePicker add `defaultMonth` (Calendar) and `shouldFocusDay` (Calendar; DatePicker passes it) beyond the brief; DatePicker also exposes Calendar/DateRange/Matcher from the barrel; formatDate/toIsoDate stay in lib/ (not exported) — cost: none.
Ruling: DatePicker reuses Popover (max-w 320, p-4): one month fits (7×40=280); two months are Calendar-only — cost: none.
HOLD: stopped before Task 15b per owner 2026-10-04 (awaiting Claude Design handoff).
Task 15 fix: c167965 (combobox ArrowUp + Field listbox name + calendar contrast pair)
HOLD LIFTED 2026-10-04: Tasks 15b–17 of this plan are superseded. Continue with docs/superpowers/plans/2026-10-04-ds-07-design-parity.md (ledger .superpowers/sdd/2026-10-04-ds-07-design-parity/progress.md).
