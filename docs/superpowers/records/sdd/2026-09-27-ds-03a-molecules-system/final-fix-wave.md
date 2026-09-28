# Plan 3a final-review fix wave — rides in 3b batch B (R93). Do FIRST, fix commits, report section "3a fix wave" in the 3b batch B report.

## Important
1. packages/ui/src/styles.css:342 — Accordion `::details-content` height transition escapes the reduced-motion reset (`*, ::before, ::after` doesn't match it). Add `::details-content` to the reset (styles.css:118) or a reduced-motion `transition: none` inside the utility. Prove in Chromium with emulated reduced motion (computed transition-duration 0s).

## Queued rulings
2. R89 — StepTracker markers invisible on brand (pink on pink): per-surface marker colour tokens (bar-token pattern), brand/ink overrides, OnSurfaces play asserting marker ≠ field colour. Same commit/pattern, the same brand-surface class: EmptyState symbol (text-pink-500) + icon (text-pink-300) — empty-state.tsx:14-15; Stat icon for tones ink/brand — stat.tsx:16-17; Tabs underline indicator `after:bg-border-brand` not remapped on brand — tabs.tsx:24 (+ add a Tabs underline OnSurfaces story, spec §10.2). Use surface tokens so brand/ink remap; light restores automatically.
3. R90 — Select intrinsic min width (a token, R61 marker ["min-w"]) so a content-sized Field doesn't clip the placeholder to "Pick …". Play at a content-sized parent.
4. R91 — Toast restores focus on close like Snackbar (R82): remember the pre-open element; restore when focus is inside the region on close. Tests: Dismiss/Escape/timer-with-focus; same commit adds the Snackbar timer-with-focus-inside test (deferred T14–16).

## Minors (ride-along)
5. list-row.tsx:18,26 — chevron `text-ink-400` → a surface-following token (text-text-subtle); remap or restrict `hover:bg-surface-page-alt` so ink rows don't go white-on-pink-50 on hover. Or correct the docs claim.
6. alert.tsx:77 — `key={role}` on the root so tone→danger mounts a fresh alert.
7. JSDoc on Alert `onDismiss` and QuantityStepper `min` (cart line to 0): the parent owns the removal, so the caller must move focus.
8. JSDoc "a status needs a message" on SearchField / OtpInput / SlotPicker `status`.
9. search-field.tsx:129 — `aria-invalid={status === "error" ? true : props["aria-invalid"]}` so it doesn't overwrite a caller's value at default.
10. accordion.tsx:12-16 — named group `group/accordion-item`.
11. One shared `isShown` in packages/ui/src/lib (false/""/null/undefined → hidden); use it in Alert, EmptyState, ListRow, PriceSummary, Stat, SectionHeader, FieldMessage (covers stat sub={false}).
12. step-tracker.json `step-tracker-mark` (16px) → `size-4`; drop the token + its R61 marker.
13. Export `NotificationTone`, `NotificationAction` from the barrel.
14. Tests/plays: ClosedByParent assert dismiss has focus first; ListRow link-name Chromium play ("Default outlet Sector 57"); rename CHECKOUT fixture step "Done" → "Confirmed"; swipe test focuses the bar first; alert.test `.mt-2.5` selector → structural; ControlModes play pins a text-subtle probe.
15. Docs/JSDoc: ListRow `ref` lands on the wrapper; Accordion `defaultOpen` re-applies on change; form-states.mdx "(Field mutes its label)" → Applies-to column; a SearchField `clearLabel` story.
16. tabs.tsx isFullWidth: allow label wrapping under isFullWidth (drop whitespace-nowrap there) so long labels don't spill.
