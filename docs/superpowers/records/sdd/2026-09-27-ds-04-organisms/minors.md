# Plan 4 minors — fixed once in the Plan 4 final fix wave (plan docs are frozen: fixes go in code/comments, never the plan)

1. (batch F concern 2) 3a/3b molecule story frames `w-full max-w-*` collapse to content in Storybook's centred canvas (tabs, pagination, accordion, list-row, …) while plays pass — give them a fixed-width frame like 2aee512 did for organisms.
2. (review H) review-carousel.stories.tsx — the ring play's `waitFor` stops at the first unclipped moment, possibly mid-glide, not "where it comes to rest" as the comment says — wait for scrollLeft to settle (or `scrollend`) then assert once, or reword the comment.
3. (review H) review-carousel.stories.tsx Paging — Previous's `aria-disabled` asserted right after `scrollLeft > 0` without `waitFor`; can flake during smooth scroll — wrap in `waitFor`.
4. (review H) review-carousel-track.tsx — nothing records that the track's `pt-1 pb-4` is room for the card's shadow + hover lift (not ring room); a clean-up could delete it — add a one-line code comment stating the constraint.
