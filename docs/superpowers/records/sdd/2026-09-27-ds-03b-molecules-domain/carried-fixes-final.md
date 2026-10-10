# Carried minors for the 3b final fix wave (from review H)
1. steps.tsx:67 — only eslint-disable in packages/ui (jsx-a11y/no-redundant-roles). Configure the rule in tools/eslint-config to allow { ol: ["list"], ul: ["list"] }; remove the disable.
2. check-card.test.tsx:100 — asserts class only; add a story play reading getComputedStyle(...).boxShadow === "none" for errored+checked.
3. pricing-card.test.tsx:62-66 — vi.restoreAllMocks inside the test after expect leaks the console.error mock on failure; use afterEach or try/finally.
4. chip-group.stories.tsx OnSurfacesStory — segmented copy inherits label "Which meals" → duplicate radiogroup names per ground; pass label="Meals per day".
5. table.tsx:839 — overflow-x-auto kept when minWidth="none" (unfocusable scroll region); apply overflow-x-auto only in sm/md/lg variants.
6. sticky-action-bar.tsx:372 — `caption ? … : null` → isShown(caption).
# Carried from batch I parity (controller triage of batch-I-report.md concerns)
7. check-card.tsx — disabled + unchecked: atom-matched ink-200 box on the ink-200 disabled card makes the box outline vanish. Inside the card give the disabled box a visible border one step darker (e.g. ink-300 / ink-400, whichever reads on ink-200 without looking enabled); keep the disabled checked fill grey. Story play pins the computed border colour != card background.
8. choice-card-group — PlanLengths at 360: the meta Badge truncates "OFFER: +1 FREE / MONTH" to "OFFER: +1 FREE…" (74673ee). Content loss at the 360 floor: let the meta badge wrap inside the tile (or move it to its own line) so the full wording shows at 360 without overflowing; extend the 360 play to assert no truncation (scrollWidth <= clientWidth on the badge text).
9. chip-group.stories.tsx OnSurfacesStory — at 360 the page scrolls 34px sideways (302px segmented track beside the ground label). Stack the ground label above the group below sm (story frame only). Rides with item 4.
10. Docs pages at 360 (out of 3b component scope, found by the R103 audit): Introduction docs page scrolls 235px sideways (markdown table + long code spans), Colours › Contrast 25px (inline `packages/design-tokens/contrast-pairs.js` code span). Wrap long code spans (break-words / overflow-wrap:anywhere in the docs prose) and put the markdown table in a scroll region. Verify scrollWidth == 360.
# Carried from review I (minors)
11. key-value-list.stories.tsx BookingRules — the 360 value-column fix (2e6fe64, 100px → 132px) is measured but unasserted; add a play asserting the value column width at the floor360 viewport (>= 128px) so a regression fails storybook:test.
12. choice-card-group.stories.tsx PlanLengths — the play passes because the Badge truncates; with item 8 the play must detect lost wording (badge text scrollWidth <= clientWidth and the full "OFFER: +1 FREE / MONTH" text visible).
