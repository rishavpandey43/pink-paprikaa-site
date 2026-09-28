# Carried fixes for batch C (from review A) — FIRST
1. Minor (a11y) — menu-item-row.stories.tsx:125-131 InCart: the "In cart · 2" action lacks the dish name; give it an accessible name including the dish (e.g. aria-label="Paprikaa Chilli Paneer in cart, 2"), matching the action JSDoc.
