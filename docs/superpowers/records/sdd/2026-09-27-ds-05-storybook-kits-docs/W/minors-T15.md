# P5 minors for T15 fix wave (do not fix until the wave)

## Review E (T7–T10)
- layout.stories.tsx:60 — ol outside nav needs role="list"
- marketing.stories.tsx:34 — canvas-formats ul needs role="list"
- layout.stories.tsx:65 — style={{ flexGrow }} is not var(--…)
- fixtures.ts:203 — #book without id="book" (T14 may have added #book + preventDefault — verify)
- fixtures.ts:204 — footer Directions same-tab maps URL
- website-kit.tsx:95 — homeHref="#top" without id="top"

## Review F (T11–T13)
- ordering-app.tsx:204 — ItemSheet before frame ref; render only when frame !== null
- enquiry-form.tsx:252 — Guests Field does not pass control a11y onto QuantityStepper
- enquiry-form.tsx:265 — stepper min={1} vs schema min 15
- forms.stories.tsx:85 — occasion via selectOptions not keyboard

## T14 notes
- Review-E Important nested dialogs: fixed in 4b7cd58 — verify, do not re-break
