# Re-review checklist: Plan 3b final fix wave (base 6ca22f3)

The fix-wave reviewer must confirm each item below is fixed properly — by reading the code AND the
covering test/play — not just that a commit exists. Scope and rulings: `W/final-fix-wave-3b.md`.

- [ ] Items 1–21 of `W/final-fix-wave-3b.md`, each against the evidence in `W/final-review-3b.md`
      (Table alignment untouched — R105; no AUTHORING.md / library-wide focus audit — R107).
- [ ] **Owner item 22 — ChoiceCardGroup badge stays inside its tile.**
  - `choice-card-group.tsx` badge wrapper slot is `flex min-w-0 max-w-full` (or an equivalent that
    bounds the Badge by the tile, not by its own content).
  - A play measures the BADGE itself (not the meta line): right edge within the tile's content box
    and `scrollWidth <= clientWidth`, for a long offer badge in a ~150px tile and at the 360 floor.
  - RED was seen on the pre-fix code.
  - Item 2 still holds: the full offer wording is in the option's accessible description.
- [ ] **Owner item 23 — each scrolling docs table region has its own name.**
  - `apps/storybook/src/docs-kit/prose.tsx` names each scroll region from its caption, else the
    nearest heading above it; the generic "Scrollable table" only when neither exists.
  - Ids are unique per page (no collisions when two tables share a heading text).
  - A test/play renders two scrolling tables on one page and asserts two distinct region names;
    axe clean in storybook:test.
- [ ] **Item 24 — 360 test geometry equals the canvas.** Fixed centrally (not per play); the
      booking-rules manual 32px subtraction is gone; any play newly failing was fixed in the
      component, not loosened.
- [ ] **Item 25** — no redundant `vi.restoreAllMocks` left in 3b test files.
- [ ] **Item 26 (R108) — badge wraps at 360 and in a ~150px tile.** Plays measure the label text
      element (not the Badge root), can fail (RED seen), full wording visible; Badge atom unchanged
      for other consumers; badge still bounded by the tile.
- [ ] **Item 29 (R109)** — fixtures say "Our pick"; no "Our recommendation" left in 3b stories;
      `wrap-anywhere` safety net kept; play asserts no mid-word break for the shipped fixtures.
- [ ] **Item 27** — docs region names unique even with equal heading texts / after resize; tested.
- [ ] **Item 28** — FilterBar JSDoc states the 4px gutter need.
- [ ] Gates on the final HEAD, cold, with counts in the report.
