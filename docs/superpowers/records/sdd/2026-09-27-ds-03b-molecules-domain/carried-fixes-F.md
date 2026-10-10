# Carried fixes for batch F (from review D) — FIRST, fix commits
1. Minor (360 floor) — offer-seal.tsx:7: rotated tips overhang the box by ~0.15×side (rotate-45 is not layout). Default lg ≈337px, xl ≈467px at the 360 floor. Add an in-flow margin (a token, R61 marker as needed) or JSDoc "reserve 0.15× side around it"; add a floor360 `md` story + play asserting no page overflow. Consider capping the default size at the floor.
2. Minor — offer-seal.json:54: note at 0.65em → ~7px at `sm`: don't render the note at `sm` (or give it a legible floor). Test.
3. Minor — filter-bar.tsx:45,99: in scroll mode the trailing slot scrolls away inside the root's overflow-x-auto; move the scroll onto the group so note/trailing stay pinned. Play at floor360.
4. Minor — offer-seal.stories.tsx:77 `size-100` deviation: record in the report; re-sort/sync the plan doc if format:check needs it.
5. Minor — logo-lockup: a `tone="badge"` story (or restrict the tone union if badge doesn't belong on a lockup — check the DS card).
