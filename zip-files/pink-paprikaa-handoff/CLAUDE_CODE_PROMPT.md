# Paste this into Claude Code (run it from inside this unzipped folder)

You are building the production website for Pink Paprikaa from a high-fidelity HTML design handoff in this folder.

1. Read `README.md` fully, then `design-system/README.md` (the binding brand rules).
2. Skim every `design/*.dc.html`. The markup is the exact layout, copy and inline styles, and the `class Component` block at the bottom is the logic. Read `design/rates.js`: it is the single source of every price.
3. Scaffold **Next.js (App Router, TypeScript, static export)** in `./site`. Import `design-system/tokens/*.css` globally. Load Poppins, DM Sans and Space Mono via `next/font`. Use `lucide-react` for icons.
4. Port `rates.js` to `site/src/data/rates.ts` with types. No price may be hard-coded anywhere else.
5. Build the shared components first (Header with launch countdown, Footer, FaqBlock, GoogleReviews, PlanCalculator, DawatCalculator), reusing `design-system/components/*.jsx` where they match. Then build the 9 pages on the routes listed in the README.
6. Port the calculator logic exactly (pricing rules, household vs group nudges, launch-offer expiry, WhatsApp message format with page tags, localStorage persistence). Add unit tests for the pricing functions.
7. Copy `design/assets/` to `site/public/`. Render every image in an aspect-ratio box. Where a photo is missing, show a labelled placeholder with the slot name from the README asset table.
8. Add SEO, JSON-LD, sitemap and favicon as listed in the README. Check at 360, 390, 768, 1280 and 1440px against the reference (`cd design && npx serve .`).
9. Keep a `TODO.md` of everything still awaiting owner input.

Ask me before changing any copy, price or brand rule.
