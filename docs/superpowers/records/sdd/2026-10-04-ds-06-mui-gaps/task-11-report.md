# Task 11 report — Molecules B get sx; nine renames

Commits (base c3645c4): 1ded253 alert · 036a079 stat · 01f6f0c offer-seal · 0b4ee25 link-card · 419185c coupon-ticket · 6595724 choice-card-group · 7812b99 loyalty-card · eab0ec0 review-card · f9070d1 accordion/announcement-bar/breadcrumb/check-card · a7c075b empty-state/feature-item/field/key-value-list · d23d178 list-row/menu-item-card/menu-item-row/outlet-card · af86ab9 pagination/price-summary/pricing-card/section-header · 9d0060c step-tracker/steps/sticky-action-bar/table.

## Renames (old classes kept; test keys renamed, same class assertions)
Alert, Stat, OfferSeal `tone`→`color` (Stat ink→neutral; OfferSeal light→neutral, turmeric→accent) · LinkCard (default→page), CouponTicket (light→page), ChoiceCardGroup (light→page, on-brand→brand) `tone`→`surface` · LoyaltyCard `variant="brand"`→`surface="brand"` · ReviewCard `variant`→`surface="brand"`. LogoLockup: verified in 520b3ad (color + sx), untouched.
Call sites fixed: stat-band, testimonial-wall, post-frame/hero-banner/quote-panel stories, colors stories, enquiry-form, website kit, ad-artboards, brand.stories caption. Stories: OfferSeal Tones→Colors; args renamed elsewhere.

## TDD
RED: 27 failing tests in the 8 renamed components (new props / sx), then 20 more for the 20 sx-only components, before implementation. GREEN after. Every component has "takes sx on its root, merged with className".

## Gate
ui 112 files/1800 tests; storybook 110 files/1014 tests (`storybook:test -- molecules`: 38 files/275 tests); typecheck, lint (ui, storybook), format:check, sync:check clean. Cold `storybook:test` flaked 1–2 kit stories (app Home, website Homepage 360px — dialog visibility during animation) on 4 runs, green on the last; same flake as Task 10, none in molecule stories.

## Rulings
See ledger (5 lines): ReviewCard brand surface, LoyaltyCard, surface→data-surface mapping, Table/Card sx placement, organism call-site mapping.

## Concerns
No `Sx` stories added (tests only, as Task 10). Kit-story flake is pre-existing.
