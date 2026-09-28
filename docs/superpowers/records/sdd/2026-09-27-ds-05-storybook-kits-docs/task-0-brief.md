### Task 0: Reconcile with the code as built

Plans 2–4 were written in parallel with this one. Before writing anything, confirm every name and behaviour this plan relies on, and **patch this plan's later tasks in place** (edit the code blocks here, in this file) wherever the built code differs. Record every patch in the Task 0 report as `Task N, <file>: <old> → <new>, because <evidence file:line>`.

**Files:** none created. Modify this plan file only if reality differs; modify a `packages/ui` component only under Step 6.

- [ ] **Step 1: The workspace is green before this plan starts**

Run:

```bash
pnpm nx run-many -t typecheck lint test build --outputStyle=static 2>&1 | tail -15
for layer in atoms molecules organisms layouts; do printf "%s " "$layer"; find packages/ui/src/$layer -mindepth 1 -maxdepth 1 -type d | wc -l; done
```

Expected: all targets succeed; `atoms 30`, `molecules 38`, `organisms 15`, `layouts 7` (90). Anything else: stop and report — this plan does not repair Plans 1–4.

- [ ] **Step 2: Every public export this plan uses exists**

Run:

```bash
for name in Accordion AccordionItem Alert AppShell AutoGrid Avatar Badge BadgeProps Button Card CartLine CartPanel \
  CheckCard Checkbox ChipGroup ChoiceCardGroup ChoiceOption Cluster CouponTicket CtaBand Dialog DietMark Divider \
  FaqSection Field FieldProps FilterBar FooterColumn HeroBanner Icon IconButton ImageSlot Input InstagramGlyph \
  KeyValueItem KeyValueList LinkedinGlyph ListRow Logo LogoLockup LoyaltyCard MenuItemCard MenuList MenuListItem \
  NavLink OfferSeal OrderTracker OutletCard PatternField POST_FORMATS PostFormat PostFrame PriceTag QuantityStepper \
  Radio RadioGroup Rating ReviewCardProps RevealObserver SearchField Section SectionHeader Select SelectOption \
  SiteFooter SiteHeader SlotOption SlotPicker SocialHeadline SpiceLevel Spinner Stack StackProps Stat StatBand \
  StatusDot StepTracker Switch TabBar Table TableBody TableCell TableHead TableHeaderCell TableRow TestimonialWall \
  Text Toast ToastProvider TrackerStep YoutubeGlyph; do
  grep -Eq "\\b${name}\\b" packages/ui/src/index.ts || echo "MISSING export: ${name}"
done; echo "export check done"
```

Expected: only `export check done`. A missing **type** export that its component file does export (e.g. `CartLine`) is added to `packages/ui/src/index.ts` in Step 6; a missing component is a stop-and-report.

- [ ] **Step 3: Every Lucide icon this plan imports exists in the installed version**

Run:

```bash
node -e '
const lucide = require(require.resolve("lucide-react", { paths: ["packages/ui"] }));
const names = ["ArrowRight","ArrowUpRight","Bell","CreditCard","House","LogOut","Mail","MapPin","MessageCircle",
  "Phone","Plus","Receipt","Search","ShoppingBag","Store","User","Utensils"];
const missing = names.filter((n) => typeof lucide[n] !== "object" && typeof lucide[n] !== "function");
console.log(missing.length === 0 ? "lucide: all present" : "lucide MISSING: " + missing.join(", "));'
```

Expected: `lucide: all present`. For a missing name, pick the installed equivalent from `packages/ui/node_modules/lucide-react/dist/lucide-react.d.ts` and patch Tasks 3, 10–13.

- [ ] **Step 4: Every token name and prefix the specimens ask for exists**

Run (after `pnpm nx build @pink-paprikaa-web/design-tokens`):

```bash
node -e '
const catalogue = require("./packages/design-tokens/dist/tokens.json");
const base = new Set(catalogue.filter((e) => e.surface === null).map((e) => e.name));
const ramp = (p, steps) => steps.map((s) => p + s);
const names = [
  ...ramp("color-pink-", [50,100,200,300,400,500,600,700,800]),
  ...ramp("color-ink-", ["000",100,200,300,400,500,600,700,800,900]),
  "color-turmeric","color-turmeric-soft","color-turmeric-strong","color-tandoor","color-tandoor-soft",
  "color-mint","color-mint-soft","color-mint-strong","color-kesar","color-kesar-soft","color-kesar-strong","color-veg",
  ...ramp("color-heat-", [1,2,3,4]),
  ...["success","warning","danger","info"].flatMap((s) => ["color-status-" + s, "color-status-" + s + "-soft"]),
  "color-text-heading","color-text-body","color-text-muted","color-text-subtle","color-text-brand","color-text-on-brand",
  "color-surface-brand","color-brand-hover","color-brand-active","color-focus",
  "color-border-subtle","color-border-default","color-border-strong","color-border-brand",
  "shadow-1","shadow-2","shadow-3","shadow-4","shadow-brand","shadow-focus-ring","shadow-focus-ring-inverse",
  "border-width-default","border-width-strong",
  "spacing","spacing-gutter","spacing-gutter-mobile","spacing-gutter-desktop","spacing-section","spacing-section-mobile",
  "spacing-section-desktop","spacing-grid-gap","spacing-card-min","spacing-card-min-wide",
  "spacing-logo-lockup","spacing-logo-wordmark","spacing-logo-symbol", ...ramp("spacing-icon-", ["xs","sm","md","lg","xl"]),
  "spacing-header","spacing-header-compact","spacing-tabbar","spacing-hit","spacing-dock-clearance",
  "motion-press-scale","duration-instant","duration-fast","duration-base","duration-slow","ease-out","ease-in-out","ease-entrance","ease-pop",
  ...ramp("text-", ["display-1","display-2","h1","h2","h3","h4","body-lg","body","body-sm","caption","overline","mono"]),
  ...ramp("text-", ["display-1","display-2","h1","h2","h3","h4","body"]).map((n) => n + "-fluid"),
  ...ramp("text-canvas-", ["hero","h1","h2","body","caption","overline"]),
  "font-display","font-body","font-devanagari","font-mono",
  "canvas-pad","canvas-pad-tight","canvas-story-safe-top","canvas-story-safe-bottom",
  ...["post","portrait","story","landscape","wide","mpu","leaderboard"].flatMap((f) => ["canvas-" + f + "-w", "canvas-" + f + "-h"]),
];
const prefixes = ["color-surface-","color-text-","color-border-","radius-","duration-","ease-","motion-","breakpoint-",
  "container-","canvas-","text-canvas-","font-weight-","pattern-"];
const missing = names.filter((n) => !base.has(n));
const empty = prefixes.filter((p) => ![...base].some((n) => n.startsWith(p)));
const surfaces = ["brand","ink","soft","light"].filter((s) => !catalogue.some((e) => e.surface === s));
const undescribed = ["shadow-1","shadow-2","shadow-3","shadow-4","shadow-brand"].filter((n) => !catalogue.find((e) => e.name === n && e.surface === null).description);
console.log(JSON.stringify({ missing, empty, surfaces, undescribed }));'
```

Expected: `{"missing":[],"empty":[],"surfaces":[],"undescribed":[]}`. A missing name means a token was named differently — patch the specimen that asks for it (never add a token to satisfy a docs page).

- [ ] **Step 5: Behaviour assumptions — read, record, patch**

Read each file named and answer each question in the report. Where the answer differs from this plan, patch the named task's code.

| #   | Read                                                                             | Question — and the task it feeds                                                                                                                                                                                                                                                                                                               |
| --- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | `molecules/choice-card-group/choice-card-group.tsx`                              | Plan 3b deviation 1 says `ChoiceCardGroup` forwards `name`, `onChange`, `onBlur` and `ref` from `{...register("meal")}` to **every** radio `<input>` (spec D17) — confirm in the code and its test. (Task 13; if not, Step 6)                                                                                                                  |
| A2  | `molecules/quantity-stepper/quantity-stepper.{tsx,test.tsx}`                     | Exact accessible names of the increase/decrease buttons (e.g. `Increase guests`)? Are they `type="button"`? (Task 13 play)                                                                                                                                                                                                                     |
| A3  | `molecules/chip-group/chip-group.tsx`                                            | Plan 3b: `type="single"` renders `role="radiogroup"` with items `role="radio"` + `aria-checked`, named by their label; a single group never deselects; `onBlur` is a prop (deviation 5). Confirm, since the Task 13 play presses ArrowRight then Space. (Task 13)                                                                              |
| A4  | `molecules/field/field.tsx`                                                      | Is the label a `<label htmlFor={id}>`; does the required marker change the accessible name (`Name *` vs `Name`)? The plays use `/^Name/`-style regexes, so either is fine — confirm. (Task 13)                                                                                                                                                 |
| A5  | `atoms/radio/radio.tsx`                                                          | `RadioGroup` exported beside `Radio`, props `legend`, `isLegendHidden`, `status`; it spreads fieldset props (`id`, `aria-describedby`). (Tasks 11, 13)                                                                                                                                                                                         |
| A6  | `molecules/table/table.tsx`                                                      | Parts and `caption`/`isCaptionVisible`/`minWidth` as the contract; does the scroll wrapper handle `scrollable-region-focusable`? (Task 2)                                                                                                                                                                                                      |
| A7  | `layouts/post-frame/post-frame.tsx`                                              | `POST_FORMATS[format]` is `{ width, height, label }`; the frame is `position: relative`; `isFit` fits the parent's width. (Tasks 9, 12)                                                                                                                                                                                                        |
| A8  | `molecules/logo-lockup/*`, `molecules/offer-seal/*`, `molecules/coupon-ticket/*` | Plan 3b fixes the scales — LogoLockup `sm` 200 · `md` 240 · `lg` 280 · `xl` 360 (default tone **white**); OfferSeal `sm` 110 · `md` 156 · `lg` 260 · `xl` 360, bleed `sm` = 1/12, `md` = 1/6 of the side; CouponTicket adds `notch="brand"`. Confirm against the component tokens. (Tasks 3, 12)                                               |
| A9  | `layouts/app-shell/app-shell.tsx` + tokens                                       | Width of `size="phone-sm"` — must be ≤ 360px for `Home360`. If it is wider, `Home360` renders the screens without `AppShell` and the report says so. (Task 11)                                                                                                                                                                                 |
| A10 | `layouts/cluster/cluster.tsx`                                                    | With `isScrollable`, does Cluster make the rail keyboard-focusable (tabindex + role region)? If not, the App kit passes `tabIndex={0}` + `role="region"` + `aria-label`. (Task 11)                                                                                                                                                             |
| A11 | `organisms/menu-list/menu-list.tsx`                                              | Does it add an "All" category itself (the kits pass only real categories)? (Tasks 10, 11)                                                                                                                                                                                                                                                      |
| A12 | `organisms/site-header/*`                                                        | Drawer trigger accessible name equals `menuLabel` (`"Menu"`); desktop `actions` hidden from the accessibility tree below `md`, drawer actions hidden above it. (Task 10 plays)                                                                                                                                                                 |
| A13 | `molecules/toast/toast.tsx`                                                      | `ToastProvider` props (`duration`, `label`) and the name of its **contained-viewport** option (Plan 3a); whether `Toast` takes a `portalContainer`, or the provider itself must sit inside `AppShell`'s `overlay` to contain the viewport. The App kit writes `isContained` + `Toast portalContainer`. (Tasks 10, 11)                          |
| A14 | `organisms/dialog/dialog.tsx`                                                    | Title is the dialog's accessible name; `footer` renders inside the dialog content; the prop that portals it into a given element is `portalContainer` (Plan 4) and accepts `HTMLElement \| null`. (Tasks 10, 11)                                                                                                                               |
| A15 | `atoms/button/button.tsx`, `atoms/icon-button/icon-button.tsx`                   | `asChild` with an `<a>` child keeps `icon`/`iconAfter`; `IconButton count` keeps the accessible name equal to `label`. (Tasks 10–12)                                                                                                                                                                                                           |
| A16 | `.storybook/preview.tsx`                                                         | Viewport option key `floor360` exists; `a11y.test = "error"`; the storySort order from Plan 1 Task 8. (Tasks 2, 10–12)                                                                                                                                                                                                                         |
| A17 | `packages/design-tokens/dist/tokens.json` (container tokens)                     | The utility names for the container steps this plan uses: `max-w-article` (the form) and `max-w-text-measure-prose` (Type → Body). Tailwind's static `max-w-prose` is never used. Patch Tasks 5 and 13 to the built names.                                                                                                                     |
| A18 | `layouts/post-frame/post-frame.tsx`                                              | The `alt` tone (pink-50, Plan 2c) exists for the carousel board. (Task 12)                                                                                                                                                                                                                                                                     |
| A19 | every component the kits and specimens pass optional values to                   | Optional custom props accept `undefined` (`name?: T \| undefined`, Plans 2–4 ruling R13), so optional fields are passed straight through (`was={item.was}`). If one does not, that component is fixed forward under Step 6, not worked around here.                                                                                            |
| A20 | this plan file                                                                   | Dev parity tables present on every ported-component task — here, every task with a dev counterpart (Tasks 1–8, 14, 15) carries a `**Dev parity:**` table, and Tasks 9–13 say `**Dev reference:** none`. Each implementer copies its task's table into the report, extended with anything missed. (contracts §0.0)                              |
| A21 | `organisms/site-header/*`, `organisms/tab-bar/*`, `layouts/app-shell/*`          | Dev's first `storybook:test` run failed `landmark-unique` (app-shell, site-header, tab-bar) and `landmark-no-duplicate-banner` (site-header). Do these name their landmarks (or take `aria-label`) so a kit page composing SiteHeader, AppShell and TabBar passes axe? If not: stop and report — the kits never work around it. (Tasks 10, 11) |

- [ ] **Step 6: Fix forward only what D17 or the contracts require**

If A1 fails (ChoiceCardGroup cannot take `register()`), that is a bug in the component against spec D17, not a docs problem: add a failing test to `molecules/choice-card-group/choice-card-group.test.tsx` that asserts the contract `register()` relies on (RHF itself is not a `ui` dependency, so the test passes the same four props by hand): render with `name="meal" onChange={spy} onBlur={spy} ref={refSpy}`, click the second card, expect `spy` called with an event whose `target.value` is the second option's value and `refSpy` called with an `HTMLInputElement`. Make it pass by forwarding the props to each radio, then commit:

```bash
git add packages/ui/src/molecules/choice-card-group
git commit -m "fix(ui): forward register props to every ChoiceCard radio

react-hook-form's register() hands a group one name/onChange/onBlur/ref set;
spec D17 requires the native radios to receive it so the group works
unmodified.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

Missing type re-exports found in Step 2 are added to `packages/ui/src/index.ts` (named re-exports beside their component) and committed as `fix(ui): export the <Type> type from the barrel`.

- [ ] **Step 7: Report**

The Task 0 report lists: Step 1–4 outputs, the A1–A21 answers, every patch made to this plan (task, file, old → new, evidence), and any Step 6 commit. No other commit.

---

