# Carried fixes for batch I (from review G) — FIRST, fix commits
1. Minor — link-card.tsx:95-98: with asChild, new-tab announce reads only children.props.target; a target on the card itself (Slot merges it onto the child) renders target=_blank with no "Opens in a new tab". Use `children.props.target ?? props.target`; add an it.each row (asChild + target on the card).
