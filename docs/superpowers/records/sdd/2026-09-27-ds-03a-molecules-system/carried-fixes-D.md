# Carried fixes for batch D — FIRST, fix commits
1. Minor, ruling R79 — quantity-stepper: blank `decrementLabel`/`incrementLabel` ("" / whitespace) → fall back to the defaults (R48), so the buttons never lose their accessible name. Test.
