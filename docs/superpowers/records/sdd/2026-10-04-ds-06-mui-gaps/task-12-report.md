# Task 12 report — Organisms get sx; five `tone`→`surface` renames

Commits (base 9d0060c, last 1807a28): bd196ee cta-band · 5d0a5aa hero-banner · 7b01415 quote-panel · c5604f0 site-footer (+ website kit, action-dock story call sites) · 6ac158c stat-band · 83c859a action-dock/cart-panel · f733465 faq-section/menu-list/order-tracker · 1807a28 review-carousel/site-header/tab-bar/testimonial-wall.

## Renames (old classes kept)
CtaBand ink/brand/soft, StatBand soft/brand/ink, SiteFooter brand/ink: key rename only; data-surface via SURFACE_DATA (soft→soft).
HeroBanner brand/ink/soft/alt (alt: data-surface light, PatternField page). QuotePanel brand/ink/light→page.
Call sites: website-kit SiteFooter, action-dock story, five organism stories (args/docs). No other callers.

## TDD
RED: 29 failing organism tests (14 sx-on-root + renamed props / surface keys). GREEN: organisms 16 files / 233 tests.

## Gate 3
typecheck, lint, test, build (12 projects), format:check, sync:check, storybook:test (110 files/1014 tests), guard:founder all green.
First run: storybook `website` kit story "Book a table dialog" toBeVisible failed (same animation flake as Tasks 10–11); re-run green.

## Rulings
See ledger (3 lines): QuotePanel light→page; HeroBanner alt; sx placement.

## Concerns
No `Sx` stories (tests only, as Tasks 10–11). Kit-story dialog flake pre-existing.
