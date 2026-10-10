# P5 T15 ONE fix wave

**Status:** DONE · **Base:** `5b9147a`
**SHAs:** `21f4185` fix(storybook); `6301784` docs

1. ItemSheet iff `item && frame`. 2. Field control a11y on QuantityStepper. 3–4. `role="list"`. 5. Bar width token calc, no flexGrow. 6. Directions `#outlets`. 7. `id="top"`. 8. Schema min 15, default 10 documented, stepper min 1. 9. Kept native-select comment. 10. Spec §8 struck tokens.ts/templates. 11. R23→Button. 12. Named brand-hex-once + component-variants.spec on 06 rows. T14 drawer untouched.

**Ruling:** QuantityStepper takes Field control props (no Field import). Stepper min 1 so KeyboardOnly +1×5 from 10 hits 15.

**Gates:** covering stepper 29, app 13, forms 1. Gauntlet: run-many 12 projects; tokens 288; ui 1620; storybook 989/107; format/sync/founder clean.

**Concerns:** none.
