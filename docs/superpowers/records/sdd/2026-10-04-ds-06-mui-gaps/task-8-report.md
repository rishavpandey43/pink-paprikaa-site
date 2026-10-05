# Task 8 report — Atoms B get sx + shared prop names

Commits (base 6af007a): e5d6879 price-tag · 135116d spinner · 46c5c10 progress-bar · 8a718d6 status-dot · d18d673 logo · 520b3ad logo-lockup (molecule, see Ruling) · 91d5ccb image-slot · 40cabde pattern-field · 75acfca social-headline

## TDD
RED recorded per component by running the new tests against the HEAD component file (old API): price-tag 3 fail, spinner 3, progress-bar 3, status-dot 10, logo 6, image-slot 4, pattern-field 8, social-headline 10 — all GREEN after implementing. LogoLockup: tests edited with the component (RED only via typecheck, not a separate run).
Parity: old class strings were kept in the existing tests (renamed keys only) — tests assert the same classes under the new props. Each component also has an "sx lands on root and beats a default class" test.

## Gate (final)
ui: 112 files / 1743 tests; storybook: 110 files / 1014 tests; typecheck + lint (ui, storybook), format:check, sync:check clean.

## Renames
PriceTag/Spinner `tone`→`color` (ink→neutral) · ProgressBar mint→`success` · StatusDot `tone`→`status` (STATUS_NAME) · Logo/LogoLockup pink→brand, white→inverse, badge · ImageSlot `fill` · PatternField `surface` (light→page) · SocialHeadline `size`→`variant`.
Call sites: loyalty-card, coupon-ticket, outlet-card, section, cta-band, hero-banner, site-footer, stat-band, order-tracker, quote-panel, many stories and the app/marketing/website kits, logo.mdx. section.test updated for the `surface` prop.
Stories: Tones→Colors (price-tag, spinner, logo), Statuses, Fills; `Sx` story added to all 8 (+ LogoLockup).

## Rulings
See ledger: Stat/LogoLockup are molecules; PatternField surface type; BasePropsWithColor.
## Notes
- Stat atom does not exist (it is a molecule, Task 11) — skipped.
- BSD sed lacks `\b`; used perl for call-site rewrites.
