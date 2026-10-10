# Batch E report: carried fixes E 1–5, then Plan 3b Tasks 9–11

The base was `8cd7430` and the head is `a164d7d`. The tree is clean and the stash is untouched (`stash@{0}`).

**Contract breach (disclosed).** During the item-2 mutation check I ran `git checkout -p` by mistake, chained after a test command. Its stdin was `/dev/null`, so every hunk prompt got EOF. Nothing was discarded: the next `git status` and diff showed all edits intact, and the mutation was then undone by hand from a scratch copy. It was the only git-checkout invocation of the batch.

| SHA | Subject |
| --- | --- |
| `fda4890` | fix(ui): drop the reward's article on a full loyalty card |
| `9db8bde` | fix(ui): ring the whole outlet card on keyboard focus |
| `cdd57b7` | feat(ui): add the CouponTicket molecule |
| `aee38f2` | docs: re-sort the 3b plan's coupon-ticket classes |
| `55ee930` | fix(ui): arm the coupon copied flash with the copy |
| `3e89f77` | feat(ui): add the ChoiceCardGroup molecule |
| `6494bec` | docs: re-sort the 3b plan's choice-card and selected classes |
| `a164d7d` | feat(ui): add the CheckCard molecule |

## Carried fixes (carried-fixes-E.md)

### Items 1, 3 and 4: LoyaltyCard (`fda4890`)

- **Item 1 (Important).** The completed branch now strips a leading article: `reward.replace(/^an? /i, "")`. So 6 of 6 with "a kulfi" reads **"Your kulfi is on us."** The in-progress sentence keeps the article ("4 more visits and a kulfi is on us."). There are two new tests:
  - "a kulfi" becomes "Your kulfi is on us."
  - "an iced chai" becomes "Your iced chai is on us.", and "anjeer barfi" stays whole. The regex needs the space after the article, so a word that merely starts with "an" is kept.
- **Item 3 (R97).** The ProgressBar is now `label="Visits"`, and `aria-valuetext` carries "3 of 6". The test queries `{ name: "Visits" }` and asserts `aria-valuetext="3 of 6"`.
- **Item 4.** The test asserts `stamps.children` has length 6.
- **TDD.** Before the fix, 3 tests were red. After it, 17/17 passed.
- **Commits.** One commit for all three items. They touch the same two files, and splitting the test hunks would have needed interactive staging, which is not available here.

### Items 2 and 5: OutletCard focus ring (`9db8bde`)

- **The shared constant is new: `lib/stretched-link.ts` exports `STRETCHED_LINK = { card, link }`.** Both MenuItemCard and OutletCard use it (`root: ["flex h-full flex-col", STRETCHED_LINK.card]`, `link: STRETCHED_LINK.link`). The class strings exist only there now.
- **Selector change against batch D.** D's `has-[a:focus-visible]` would ring the OutletCard whenever its **Directions** link had focus, because that action is an `<a>` too. The card now rings only for its marked link, `has-[[data-stretched-link]:focus-visible]`, and both cards put `data-stretched-link` on the name link.
- **New OutletCard `KeyboardFocus` play:**
  - Before any Tab, the card has no ring.
  - The first Tab lands on the name link: the card ring is solid and the link's own outline is `none`.
  - The second Tab lands on Directions, and the card has no ring.
- **Mutation checks in Chromium.** Dropping the data attribute fails the play ("expected 'none' to be 'solid'"). Restoring D's `has-[a:…]` selector also fails it ("expected 'solid' to be 'none'", the Directions case). MenuItemCard's `KeyboardFocus` play stays green.
- **Item 5.** The `AsLink` comment now says that `relative` plus DOM order keep Directions on top, and that `z-raised` guards against a reorder.

## Task 9: CouponTicket (`cdd57b7`, re-sort `aee38f2`, fix `55ee930`)

**Built:**
- `tokens/component/coupon-ticket.json`.
- `molecules/coupon-ticket/{coupon-ticket,coupon-copy-button}.tsx`, plus `.test.tsx` and `.stories.tsx`.
- Five `TEXT` and five `SPACING` names in `component-variants.ts`.
- Barrel line between `choice-card-group` and `empty-state`.
- `theme.css` has `--spacing-coupon-ticket-notch: 34px`.

TDD: "Failed to resolve import ./coupon-ticket", then 14/14.

**Fold items applied:**
- 1: lower-case subject.
- 2: sorted barrel.
- 5: `Narrow` uses `globals: { viewport: { value: "floor360", isRotated: false } }`.
- 7: R61 markers. `coupon-ticket-md` and `-lg` are `["max-w"]`, `stub-md` and `stub-lg` are `["w"]`, and `notch` is `["size"]`. `catalogue.spec` is green.
- 9: the plan-doc re-sort is committed separately (`aee38f2`, 4 lines).

**Deviations, each forced by the gate:**
1. **`CouponTicketProps extends Omit<ComponentProps<"div">, "onCopy">`.** The div's native `onCopy` (a ClipboardEventHandler) conflicts with `onCopy(code)`: TS2430. Dev omits it too.
2. **`{" "}` separators between the stub's spans.** Without them, jsdom computes the button name as "Use codePAPRIKAA50Tap to copy", and the brief's `/Use code PAPRIKAA50/` query fails. A grid drops whitespace-only text, so the separators draw nothing.
3. **`Brand` play stubs `navigator.clipboard.writeText`** (a story `beforeEach` with a restore). Headless Chromium refuses a clipboard write from a scripted click, so `onCopy` never fired, even under `waitFor`. The play now also asserts the "Copied" name. The refused path stays covered by the jsdom test "never claims a copy…".
4. **`Narrow` play measures the right thing.** The brief compared the ticket's `scrollWidth` to its `clientWidth`, which gave 377 > 360. The stacked side notches overhang the edge by design and are clipped (`overflow-hidden`), but `scrollWidth` still counts them. The play now asserts three things: the ticket stacks (`flex-direction: column`), its right edge stays inside its container, and the page does not scroll sideways. Mutation check: removing `overflow-hidden` makes it fail.
5. **Flash timer moved from an effect into the copy handler (`55ee930`).** Under a full, loaded `ui` run, "returns to its hint…" failed once: the effect that arms the 1.8s reset flushed after `advanceTimersByTime(2000)`. The handler now arms the timer (`clearTimeout` + `setTimeout` on a ref), and an unmount effect clears it. The flash lasts 1.8s from the copy, and a second copy restarts it. Full runs after the fix were green.

### Dev parity

| Dev item | Ruling | Where, or the spec clause |
| --- | --- | --- |
| Code, headline and terms printed | ALREADY | test "shows the headline, the terms, the code and the logo" |
| `terms` optional; story `WithoutTerms` | DROP | contract §6 `terms: string` (required); the design system: "always state the expiry" |
| Stub is a copy button named by its code | ALREADY | the button's name is its content, "Use code PAPRIKAA50 Tap to copy" (separators, deviation 2) |
| Writes the code to the clipboard; `onCopy(code)` | ALREADY | test "copies the code from the stub…"; `Brand` play in Chromium |
| Copied flash on the stub, announced to screen readers | ADD | the hint is `aria-live="polite"`; the copy test asserts the announcement |
| Reachable and operable from the keyboard | ADD | test "copies from the keyboard" |
| Nothing tappable and no "Tap to copy" on print artwork | ADD | assertion in "is plain artwork when not copyable" |
| A refused or missing clipboard still flashes "Copied" | DROP | superseded by deviation 8: a refused copy selects the code instead (test "never claims a copy…") |
| Brand / light skins | ALREADY | `it.each` surface test |
| Headline steps with `size` | ADD | test "sets the headline at artwork size for lg" |
| Stacks below `sm`, splits from `sm` | ADD | `md` root `flex-col sm:flex-row`; test "stacks…"; `Narrow` play (real layout) |
| Notches match the ground behind the ticket | ALREADY | test "colours the punched notches…" |
| Press = scale on the copy stub | ADD | `isCopyable` stub `transition-control active:press-scale` |
| Diamond `PatternField` behind the stub | DROP | D2: the design-system `CouponTicket.jsx` stub is a flat fill |
| Logo hidden (`label=""`) | ALREADY | the plan names the logo (test asserts `img` "Pink Paprikaa…") |
| Caller `className` replaces the ticket radius | ADD | test "lets a caller className replace the ticket radius" |
| axe on brand-copyable and light-print | ADD | last test renders both |
| Stories `Default`, `Tones`, `CanvasSize`, `ForPrint` | ALREADY | `Playground` / `Brand`, `Light`, `OnPinkArtwork` (lg, not copyable) |
| Stories `OnATintedPage`, `LongCode` | ADD | stories `OnTintedPage`, `LongCode`, plus `Narrow` (360, stacked) |
| (extra) Dev omits `children` from the div props | Not needed | the explicit JSX children win over a spread `children` (batch D precedent) |
| (extra) Dev omits native `onCopy` | ADD | deviation 1 |
| (extra) Flash restarts on a second copy | ADD | deviation 5 |

**Gate:** tokens 277 · ui 1227 (79 files) · Storybook build OK · format:check 0 (after `aee38f2`) · storybook:test 703 (72 files) · `storybook test -- coupon-ticket` 7/7.

## Task 10: ChoiceCardGroup (`3e89f77`, re-sort `6494bec`)

**Built:**
- `tokens/component/choice-card.json`.
- `semantic/shadow.json` gains `selected`. I added it by hand, keeping the file's one-line entries.
- `contrast-pairs.json` gains `choice-card-selected` and `choice-card-on-brand`. Tokens went from 277 to 281.
- `TEXT` gains `choice-card-title`; `SHADOW` gains `selected` and `choice-card-radio`.
- `molecules/choice-card-group/*`.
- Barrel block between `check-card` and `coupon-ticket`.

TDD: "Failed to resolve import ./choice-card-group", then 16/16.

**Fold items applied:**
- 1: lower-case subject.
- 2: sorted barrel.
- 8 (R94): the struck price reads lower-case "was", PriceTag's word. PriceTag itself cannot be reused, because `ChoiceOption.price` / `was` are pre-formatted `ReactNode`s ("Included", "Quoted · 25+ guests"), not numbers. The test pins `"Classic ₹130 was ₹140"`, and so does the `Plates` play in Chromium.
- 9: the plan-doc re-sort (`6494bec`) also re-sorted Task 11's and a later task's `shadow-selected` classes, since the token now exists.

**Deviations:**
1. **Added `status` and `message` (controller: a status needs a message).** This follows RadioGroup (2b) and the Field pattern:
   - `message` renders through the shared `lib/field-message` `FieldMessage`: the status glyph plus the words, and `role="alert"` on an error.
   - The message describes the fieldset. `joinIds` from `lib/choice-control` keeps a caller's `aria-describedby`.
   - An error sets `aria-invalid` on the fieldset, and every card gets `in-aria-invalid:border-status-danger`.
   - **A status without a message is ignored** (no `aria-invalid`, no red), so colour alone cannot happen by construction.
   - I first built RadioGroup's discriminated union, but Storybook's `StoryObj<typeof meta>` collapses a union props type to `never` (10 TS errors). So the rule is enforced at runtime instead.
   - New tests: "says what is wrong in words…", "never marks the group invalid by colour alone…", "reads a plain message as the group's hint". The axe test now renders an error. New story `WithError` with a play.
2. **Accessible-name separators.** The brief's name test would fail in jsdom ("Classic ₹130was₹140"). I added `{" "}` before the `<s>`, and a space after the sr-only "was" (`<span className="sr-only">was</span> {was}`). A flex row drops whitespace-only text, and a line drops a leading space, so nothing extra is drawn.
3. **Brief test fixed.** "puts the price under the title on tiles…" asserted `card.lastElementChild` has no "₹130" on tiles. But on tiles the last child is the body, which contains the price, so the test was wrong as written. It now asserts that the `-price` element is not the card's last child on tiles, and is the last child on rows.

**Dev parity:** no dev reference (a handoff component). Every handoff usage has a story: `Plates`, `PlanLengths`, `Dawats`, `Platters`, `Service`, `TrialOnBrand`, `DecideList`, plus `WithError`.

**Gate:** tokens 281 · ui 1243 (80 files) · Storybook build OK · format:check 0 (after `6494bec`) · storybook:test 712 (73 files).

## Task 11: CheckCard (`a164d7d`)

**Built:** `molecules/check-card/*`, with the barrel line between `breadcrumb` and `choice-card-group`. No tokens. TDD: "Failed to resolve import ./check-card", then 10/10.

**Fold items applied:** 1 and 2. Item 9 had nothing new: Task 10's re-sort already covered the plan doc.

**Deviations (ChoiceControl / Checkbox pattern):**
1. **`isInvalid`, like Checkbox.** It sets `aria-invalid`, and `isInvalid` wins over a caller's `aria-invalid`, which otherwise stands, as ChoiceControl does. The box and the card border turn `status-danger`. The JSDoc says colour is never the message, so pair it with words or wrap the card in Field.
2. **A caller's `aria-describedby` joins the card's own (`joinIds`).** In the brief, `{...props}` spread after it would have replaced the description. So a card inside `Field status="error" message=…` is invalid and described by both its detail and the error words (test "takes Field's error…").
3. **`isShown(description)` instead of truthiness** for the optional description.

New tests: "keeps a caller's description alongside its own", "takes Field's error…", "marks itself invalid with isInvalid". **Dev parity:** no dev reference (a handoff component). Stories as briefed: `Playground` (click + Space play), `Upfront`, `NoOnionGarlic`, `Disabled`.

## Final gate (at `a164d7d`)

```
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache                → ok
pnpm nx run-many -t typecheck lint test -p ui design-tokens --skip-nx-cache   → tokens 4 files / 281 · ui 81 files / 1253 · Successfully ran
pnpm nx run @pink-paprikaa-web/storybook:build                                → Successfully ran
pnpm nx format:check                                                          → exit 0
pnpm nx sync:check                                                            → The workspace is up to date
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache (R77)           → 74 files / 716 passed (no cold-cache flake)
pnpm run guard:founder                                                        → clean
```

**Test counts:**
- ui: 1211 → 1213 (+2 loyalty) → 1227 (+14 T9) → 1243 (+16 T10) → 1253 (+10 T11).
- storybook: 690 → 691 (+1 OutletCard KeyboardFocus) → 703 (+12: 7 are T9 stories; I did not trace the other 5, most likely docs-kit catalogue cases for the new tokens) → 712 (+9 T10) → 716 (+4 T11).
- tokens: 277 → 281.

## Concerns

1. **The accidental `git checkout -p`** (top of the report). It changed nothing, but it breaks the letter of the contract.
2. **ChoiceCardGroup `status` / `message` are additive to contract §6.** They should go in the plan's deviation table (deviation 1's row). They are runtime-guarded rather than typed as a union, because of the Storybook limit above.
3. **The CouponTicket `Brand` play stubs the clipboard**, because headless Chromium refuses scripted writes. The real write is proven only in jsdom (user-event's clipboard).
