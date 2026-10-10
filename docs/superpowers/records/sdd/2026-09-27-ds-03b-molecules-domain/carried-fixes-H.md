# Carried fixes for batch H (from review F) — FIRST, fix commits
1. Minor (bug) — chip-group.tsx:236: a group starting over maxSelected can't deselect (guard blocks removals). Guard additions only: `next.length > selected.length && next.length > maxSelected`. Test starting over the limit.
2. Minor — chip-group.test.tsx:219: add a "multiple with an error" row to the axe it.each.
3. Minor — chip-group.stories.tsx: `satisfies Partial<SingleChipGroupProps>` / `Partial<MultipleChipGroupProps>` on each story's args; OnSurfacesStory spreads the story args again.
4. Minor — chip-group.tsx:130: skip HiddenValues when `disabled` (native disabled controls don't submit). Test.
5. Minor — steps.tsx:792: `role="list"` on the <ol> (Safari/VoiceOver drops list semantics under list-style:none).
6. Minor (from batch G concerns) — chip-group.tsx: caller `aria-invalid` lands on the root → every chip red, no message; destructure it out (ChoiceCardGroup 267e35f precedent).
7. Minor — check-card: errored + checked keeps the pink inset shadow inside the red border; drop it like ChoiceCardGroup (267e35f).
8. Minor — pricing-card: validate `was` > price (RangeError, like PriceTag). Test.
