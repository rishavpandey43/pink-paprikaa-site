# Carried fixes for batch E (from review C) — FIRST, fix commits
1. IMPORTANT (copy) — loyalty-card.tsx:37: completed card with an article-first reward reads "Your a kulfi is on us." Strip a leading "a "/"an " in the completed branch; test 6-of-6 "a kulfi" → "Your kulfi is on us."
2. Minor (a11y) — outlet-card.tsx:32: whole-card focus ring when the stretched link has keyboard focus — reuse the class batch D added to MenuItemCard (extract ONE shared class/constant in lib if D inlined it). Play on Tab.
3. Minor (a11y), ruling R97 — loyalty-card.tsx:72: progressbar name "N of M visits" + valuetext "N of M" → double count. Name it "Visits"; valuetext carries "N of M". Update the test.
4. Minor — loyalty-card.test.tsx:26-32: assert the stamp segment count (children length 6).
5. Minor — outlet-card.stories.tsx:67-68 comment: `relative` + DOM order keep Directions on top; `z-raised` guards a reorder.
