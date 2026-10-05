### Task 6: The rename table (reference for Tasks 7–12)

This task writes no code. It is the single mapping every migration task follows. **Rule:** the new props must produce exactly the classes the old value produced. Before editing a component, open its variant map and move the class strings, don't retype them.

| Component | Old prop | New prop(s) | Value mapping |
| --- | --- | --- | --- |
| Badge | `tone` | `color` + `variant: "solid" \| "soft"` | brand→`color="brand" variant="solid"` · soft→`brand`,`soft` · ink→`neutral`,`solid` · success/warning/danger→same colour, `variant` = `soft` if the old classes use a `*-soft` background, else `solid` · neutral→`neutral`,`soft` |
| Card | `variant` | `variant` + `surface` | default/feature/quiet stay `variant` · brand→`surface="brand"` · ink→`surface="ink"` (sets data-surface) |
| ImageSlot | `tone` | `fill` | soft/strong/ink unchanged (placeholder fill, component-specific) |
| Logo, LogoLockup | `tone` | `color` | pink→`brand` · white→`inverse` · badge→`badge` (Logo-only extra value) |
| PatternField | `tone` | `surface` | brand/ink/soft unchanged · light→`page` |
| PriceTag, Stat, Spinner | `tone` | `color` | ink→`neutral` · brand→`brand` · inverse→`inverse` |
| ProgressBar | `tone` | `color` | brand→`brand` · mint→`success` · inverse→`inverse` |
| SocialHeadline | `size` | `variant` | same values (hero/h1/h2/body/caption/overline): it is a text style |
| StatusDot | `tone` | `status` | open/busy/closed/live/danger unchanged |
| Tag | `tone` | `color` | default→`neutral` · success→`success` · brand→`brand` |
| Alert | `tone` | `color` | info/success/warning/danger/brand/neutral unchanged |
| ChoiceCardGroup | `tone` | `surface` | light→`page` · on-brand→`brand` |
| CouponTicket | `tone` | `surface` | brand→`brand` · light→`page` |
| LinkCard | `tone` | `surface` | default→`page` · brand/ink/soft unchanged |
| LoyaltyCard | `variant` | `variant` + `surface` | feature stays · brand→`surface="brand"` |
| OfferSeal | `tone` | `color` | light→`neutral` · brand→`brand` · turmeric→`accent` |
| ReviewCard | `variant` | `surface` | default→(none) · brand→`surface="brand"` |
| Toast, Snackbar | `tone` (if a prop) | `color` | map the values onto ColorProp names; keep the classes |
| CtaBand, HeroBanner, QuotePanel, SiteFooter, StatBand | `tone` | `surface` | every value is a ground: rename the key; light-ish values → `page`/`alt` per their classes |

Everything else keeps its prop names and gains `sx` (+ native props + ref where missing). If a component has a `tone` that is not in this table, apply the rule: a ground → `surface`, a palette colour → `color`, a state → `status`. Ledger a `Ruling:` line for it.

- [ ] **Step 1:** Commit the spec and plan with this table unchanged: `docs: plan the component api migration` (if not already committed).

---

