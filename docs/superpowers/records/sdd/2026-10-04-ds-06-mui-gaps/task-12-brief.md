### Task 12: Organisms — `surface` + `sx`

**Files:** `packages/ui/src/organisms/{action-dock,cart-panel,cta-band,faq-section,hero-banner,menu-list,order-tracker,quote-panel,review-carousel,site-footer,site-header,stat-band,tab-bar,testimonial-wall}/*`

Renames: CtaBand, HeroBanner, QuotePanel, SiteFooter, StatBand `tone`→`surface` (map each value to its SurfaceProp by its background class). All of them gain `sx` on the root.

- [ ] **Step 1: Failing tests:** "sx on root" for all of them, plus "`surface=<x>` sets data-surface and the old classes" for the five renamed ones. Run → FAIL.
- [ ] **Step 2: Implement** → PASS.
- [ ] **Step 3: Call sites** (`grep -rnE "<(CtaBand|HeroBanner|QuotePanel|SiteFooter|StatBand)[^>]*tone=" packages apps --include=*.tsx --include=*.mdx`) → rewrite → typecheck PASS.
- [ ] **Step 4: Stories** → `storybook:test -- organisms` PASS.
- [ ] **Step 5: Commit** per organism.
- [ ] **Step 6: Batch gate 3** → ledger.

---

