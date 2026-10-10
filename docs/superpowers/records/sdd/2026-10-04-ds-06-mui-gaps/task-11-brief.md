### Task 11: Molecules B — renames + `sx` on the rest

**Files:** every remaining folder in `packages/ui/src/molecules/`: accordion, alert, announcement-bar, breadcrumb, check-card, choice-card-group, coupon-ticket, empty-state, feature-item, field, key-value-list, link-card, list-row, logo-lockup, loyalty-card, menu-item-card, menu-item-row, offer-seal, outlet-card, pagination, price-summary, pricing-card, review-card, section-header, stat, step-tracker, steps, sticky-action-bar, table

Renames (Task 6): Alert `tone`→`color`; ChoiceCardGroup, CouponTicket, LinkCard `tone`→`surface`; LogoLockup `tone`→`color`; LoyaltyCard and ReviewCard brand → `surface`; OfferSeal `tone`→`color` (turmeric→accent); Stat `tone`→`color`. Everything else: `sx` only.

- [ ] **Step 1: Failing tests:** for each, "sx on root" plus, for the renamed ones, "old value's classes under the new prop" (copy the old class strings first, as in Task 7). Run → FAIL.
- [ ] **Step 2: Implement** → PASS.
- [ ] **Step 3: Call sites:** `grep -rnE "<(Alert|ChoiceCardGroup|CouponTicket|LinkCard|LogoLockup|OfferSeal|Stat)[^>]*tone=|<(LoyaltyCard|ReviewCard)[^>]*variant=\"brand\"" packages apps --include=*.tsx --include=*.mdx` → rewrite → typecheck PASS.
- [ ] **Step 4: Stories** renamed → `storybook:test -- molecules` PASS.
- [ ] **Step 5: Commit** per component (or per 3–4 related ones).

---

