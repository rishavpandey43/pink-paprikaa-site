### Task 20: Tier parity review (spec §11.4) and the story test run

Every molecule's stories side by side with its design-system card, at 360 and 1280. Differences are fixed, or listed with a reason. Then the whole story suite runs in Chromium (play functions, a11y).

**Files:**

- Modify: any `packages/ui/src/molecules/**` or `packages/design-tokens/tokens/component/*.json` the review corrects
- Evidence (not committed): `tmp/parity/molecules-system/*.png` (`tmp/` is gitignored)

**Interfaces:**

- Consumes: every story from Tasks 2–19; the cards under `zip-files/Pink Paprikaa Design System/components/molecules/`.
- Produces: the parity list in the commit body; a green `storybook:test`.

- [ ] **Step 1: Serve both sides**

Run in two background shells:

```bash
pnpm exec serve "zip-files/Pink Paprikaa Design System" -l 5055
pnpm nx run @pink-paprikaa-web/storybook:serve
```

The cards load React and Babel from unpkg, so the machine needs network (rerun the serve with the sandbox disabled if it is blocked).

- [ ] **Step 2: Screenshot every pair at 360 and 1280**

For each molecule, with Chrome DevTools MCP (`new_page`, `resize_page` to 360×900 then 1280×900, `take_screenshot`) or a Playwright script, capture:

- card: `http://localhost:5055/components/molecules/<Name>.card.html`
- stories: `http://localhost:6006/iframe.html?id=molecules-<kebab-name>--<story>&viewMode=story`, one per card row

| Molecule        | Card              | Stories                                                                                                         |
| --------------- | ----------------- | --------------------------------------------------------------------------------------------------------------- |
| Field           | `Field`           | `playground`, `stack-with-hint`, `required`, `with-error`, `with-success`, `with-warning`, `optional`, `side`   |
| SearchField     | `SearchField`     | `playground`, `with-value`, `loading`, `no-results`, `disabled`, `small`                                        |
| QuantityStepper | `QuantityStepper` | `sizes`, `at-min`, `min-zero`, `at-max`, `typed-guests`                                                         |
| OtpInput        | `OtpInput`        | `partial`, `complete`, `verified`, `expired`, `disabled`                                                        |
| SlotPicker      | `SlotPicker`      | `playground`, `with-error`, `disabled`, `columns`                                                               |
| Alert           | `Alert`           | `info-and-success`, `warning-and-danger`, `brand-with-action`, `dismissible`, `nudge`, `neutral`, `on-surfaces` |
| Toast           | `Toast`           | `tones`, `status`, `pop`, `contained`                                                                           |
| Snackbar        | `Snackbar`        | `playground`, `success`, `danger-with-retry`, `undo-and-dismiss`, `live-copy`                                   |
| EmptyState      | `EmptyState`      | `playground`, `with-icon`, `large`                                                                              |
| Tabs            | `Tabs`            | `playground`, `two-items`, `segmented` (handoff: compare with `design/ThisWeek.dc.html`)                        |
| Breadcrumb      | `Breadcrumb`      | `playground`, `two-levels`, `long`, `on-surfaces`                                                               |
| Pagination      | `Pagination`      | `playground`, `first-page`, `three-pages`, `last-page`                                                          |
| SectionHeader   | `SectionHeader`   | `playground`, `with-lede`, `centred`, `on-brand`, `surfaces`                                                    |
| Stat            | `Stat`            | `default`, `icon-brand`, `inverse-centre`                                                                       |
| Accordion       | `Accordion`       | `playground`, `multiple`, `surfaces` (handoff: `design/FaqBlock.dc.html`)                                       |
| ListRow         | `ListRow`         | `playground`, `trailing-control`, `with-description`, `trailing-badge`, `danger`, `account-list`                |
| PriceSummary    | `PriceSummary`    | `playground`, `with-discount`, `on-ink`, `surfaces`                                                             |
| StepTracker     | `StepTracker`     | `playground`, `horizontal`, `on-brand`, `complete`, `surfaces`                                                  |

Save as `tmp/parity/molecules-system/<kebab-name>-<width>-{card,story}.png`.

- [ ] **Step 3: Compare, then fix or list**

For each pair check: sizes and paddings, radii, borders and their width in each state, type (family, size, weight, tracking), colours on each surface, glyph size and stroke, wrapping at 360. A difference that is not in the expected list below is a bug: fix it in the component or its token file (token first; add a unit test when it is behaviour, not pixels), rerun that component's tests, and re-screenshot.

Expected differences (reasons already recorded — list them, do not "fix" them):

- Every card: font rasterisation.
- Field: `stack + hint` and `error` rows use a Select where the card wraps a SlotPicker (a fieldset carries its own legend and message — deviation 1).
- SearchField: the status glyph also shows inside the box (the system's one field chrome, Plan 2b `FieldControl`); loading is the pulsing mark, not the card's ring spinner; text is 15px `text-control`.
- QuantityStepper: the count is an input; its width follows its digits (22px minimum).
- OtpInput: identical cells; one input behind them (not visible).
- Snackbar: tone rows show the dismiss button (deviation 6); the inset is fixed at 24px (the card passes `inset={0}`).
- Toast / Snackbar success: the fill is the strong mint (deviation 12).
- Alert: the Dawat warning on ink is the opaque warning panel, not the handoff's translucent tint (deviation 11, open question 1).
- Tabs underline: the underline may sit on (not over) the hairline where the tablist wraps; triggers are 44px tall (spec §5.5 target, dev parity), so the row is taller than the card's ~33px.
- Field `side`: stacks below 480px (dev parity) — the 360px screenshot shows the label above the control.
- Pagination: Previous/Next at the ends are inert placeholders, not dead buttons (deviation 13).
- StepTracker: the check glyph is 12px as drawn; on the pink row the reached segments are white (they were invisible pink-on-pink).
- EmptyState `lg`: body copy changed from the card's "Your first one is on us." (an offer the brand has not made).

- [ ] **Step 4: Run the whole story suite in Chromium**

```bash
pnpm exec playwright install chromium
pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache 2>&1 | tail -20
```

Expected: every story passes — every `play` (SearchField, QuantityStepper, OtpInput, SlotPicker, Alert, Toast, Snackbar, Tabs, ListRow, Accordion's real `<details name>` exclusivity) and the a11y check on every story. A failing a11y rule is fixed in the component, never disabled.

- [ ] **Step 5: Final gate**

```bash
pnpm nx format:check && pnpm nx sync:check
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 6: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "fix(ui): molecule parity with the design-system cards

Side-by-side review of the eighteen system molecules against their cards
at 360 and 1280; storybook:test green in Chromium.

Fixed:
<one line per fix, or \"none\">

Expected differences:
<paste the Step 3 list, one line each>

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

(If the review changed nothing, commit nothing and paste the list into the report instead.)

## Controller amendments (2026-09-27)

- **Alert on dark sections** stays an opaque tinted panel — accepted (no new tokens).
- **Status message colours on ink/brand** are not remapped — accepted; no page places status text on a dark field. Revisit with a contrast pair if one ever does.
- **Darker mint success fill** (white on mint fails the policy) — accepted.
- **Field text is 16px** (ruling R21): every text-entry control (Input, Select, SearchField, OtpInput cells, textarea) renders its value at `text-body` (16px) — iOS Safari zooms the page on focus below 16px, and the handoff's own fields use 16px. Plan 2b's `lib/field-control.tsx` owns this; molecules inherit it.
