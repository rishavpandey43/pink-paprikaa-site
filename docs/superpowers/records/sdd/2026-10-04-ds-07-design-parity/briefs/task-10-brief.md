### Task 10: Organisms and layouts parity

**Source:** audit-organisms per section:
- **SiteHeader (7 gaps):**
  - logo states + the "Pink Paprikaa home" label;
  - all links at 1280–1439;
  - nav links via `Link variant…` (quiet, from the atom);
  - Order Now at every width;
  - an `isScrolled` override;
  - 24px row gap.
- **TabBar:** the 56×30 icon pill, `state-hover`/`state-press` + `press-scale-icon`, and the R137 colours kept.
- **SiteFooter:** social buttons ghost, links via the inverse Link atom, `social` default `["instagram"]`.
- **Dialog:** sheet animation only on `sheet`, the modal gets pop-in/fade, `drawer` kept (extra).
- **HeroBanner:**
  - split spacing 32/36;
  - two columns from ~730px (add the breakpoint token if the design names one);
  - centred copy at 22ch (token);
  - separate top/bottom padding tokens.
- **The rest:**
  - MenuList: the empty state per category;
  - OrderTracker, CtaBand, FaqSection: one gap each, per the audit;
  - TestimonialWall: R141 `cardSurface`;
  - AutoGrid: 240/280 minimums;
  - Section: its gap;
  - layouts switch to `BaseProps` (cosmetic).
- [ ] Step loop per component. **Batch gate 4.**

