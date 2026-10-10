### Task 11b: Storybook sidebar identical to the Claude Design tree, plus Templates and Explore

**Why:** the audits compared each page's *content*. The sidebar (group names, page names, grouping) and the three Templates were never compared. The design tree (every `@dsCard group=… name=…` in the handoff, verified 1:1 present in the zip) is the target. Owner rulings 2026-10-05: **R143** the text atom stays **Typography** (deliberate difference; the page is `Atoms/Typography` with a JSDoc and an mdx note "the design's `Text`"; `Text` stays an alias). **R144** extras with no design card are filed **inside the matching design group**.

**Files:** story `title`s and `<Meta title>` across `apps/storybook/src/**` and `packages/ui/src/**/*.stories.tsx`; `apps/storybook/.storybook/preview.ts(x)` (`parameters.options.storySort.order`); new Templates and Explore pages; `apps/storybook/src/foundations/**` (moves only).

**Target tree, in this exact order** (`storySort.order`; our extras in *italics*, appended at the end of their group):

| Group | Pages (exact names) |
| --- | --- |
| Readme | Readme (the current Introduction page, renamed), *Docs kit*, *Docs prose*, *Canvas geometry*, *System (sx)* |
| Templates | Marketing website, Ordering app screen, Social post |
| App | Ordering app |
| Atoms | Avatar, Badge, Button, Card, Checkbox, DietMark, Divider, Icon, IconButton, ImageSlot, Input, Link, Menu, PatternField, Popover, PriceTag, ProgressBar, Radio, Rating, Select, Skeleton, SocialHeadline, SpiceLevel, Spinner, StatusDot, Switch, Tag, **Typography** (R143, at the design's "Text" position), TextButton, Tooltip, *Countdown*, *Fab*, *Slider*, *ToggleButton* |
| Brand | Logo, Company details, Logo lockup, Pattern, Symbol, Wordmark (the design's order), *Iconography*, *Voice & content*. Move `Atoms/Logo` here as "Logo" if it's the brand card; split today's Brand/Logo specimens into Logo lockup / Symbol / Wordmark per `guidelines/*.card.html` |
| Colors | Spice accents, Spice heat scale, Warm ink neutrals, Brand pink, Semantic surfaces & text, Status colors, Text on surfaces, *Contrast*. Renames: Accents→Spice accents, Heat→Spice heat scale, Ink→Warm ink neutrals, Primary→Brand pink, Semantic→Semantic surfaces & text, Status→Status colors, Surfaces→Text on surfaces (check each against its card; split or merge to match) |
| Explore | Diamond + symbol, Mark legibility (new group; move these specimens from wherever they live today, e.g. Brand/Specimens, and diff each against its card) |
| Layout | Auto grid, Breakpoints, Card anatomy, Form states (moved from Motion), *Utility classes* |
| Layouts | AppShell, AutoGrid, Cluster, Container, PostFrame, Section, Stack, *Box*, *Grid* |
| Marketing | Canvas formats, Canvas type, Social & ads (Kit/Ads + Kit/Feed merge into one "Social & ads" page per its card) |
| Molecules | the design's 30 in its order: Accordion, ActionMenu, Alert, Breadcrumb, Combobox, CouponTicket, DatePicker, EmptyState, Field, FilterBar, ListRow, LogoLockup, LoyaltyCard, MenuItemCard, MenuItemRow, OfferSeal, OtpInput, OutletCard, Pagination, PriceSummary, QuantityStepper, ReviewCard, SearchField, SectionHeader, SlotPicker, Snackbar, Stat, StepTracker, Tabs, Toast, then *AnnouncementBar, CheckCard, ChipGroup, ChoiceCardGroup, FeatureItem, KeyValueList, LinkCard, PricingCard, SpeedDial, Steps, StickyActionBar, Table, ToggleButtonGroup, Field/React Hook Form + Zod* |
| Motion | Duration & easing (the Task 11 specimen), Interaction states (today's States), *Section reveal* |
| Organisms | CartPanel, CtaBand, Dialog, FaqSection, HeroBanner, MenuList, OrderTracker, SiteFooter, SiteHeader, StatBand, TabBar, TestimonialWall, *ActionDock, QuotePanel, ReviewCarousel* |
| Spacing | Borders & focus (from Layout/Borders), Shadows (from Layout/Elevation), Corner radii (from Layout/Radii), Layout rhythm, Spacing scale (from Scale) |
| Type | Fluid type (renamed from Fluid), Body, Devanagari, Display, Headings, Overline & mono |
| Website | Homepage |

"Specimens" story files that exist only to feed mdx pages keep `tags: ["!dev"]` or move under their page, so the sidebar shows only the tree above.

- [ ] **Step 1: Failing check first.** Create `apps/storybook/src/docs-kit/sidebar.spec.ts`. It builds the storybook index (`pnpm nx run storybook:build` output `storybook-static/index.json`; or read `index.json` from a fresh build in the test's `beforeAll` via the existing build target) and asserts that the visible groups and page names, in order, equal the table above (encode the table as a constant `DESIGN_TREE` in the spec, with our extras flagged). Run → FAIL (lists the differences).
- [ ] **Step 2: Templates.** For each of `templates/website/Website.dc.html`, `templates/app/OrderingApp.dc.html` and `templates/social-post/SocialPost.dc.html` (+ their `.thumbnail`), build a Storybook page `Templates/<name>` composing **only library exports** (and `packages/content` facts through the Storybook app, never `packages/ui`). It must match the template's sections, order, copy (subject to R140) and states. Reuse the existing kits where the template equals a kit section, and don't duplicate. Plays assert section order and the key interactions the template shows. Compare with the template in the Task 12 tool (add the three templates to its list).
- [ ] **Step 3: Explore.** Build the `Diamond + symbol` and `Mark legibility` pages to match their cards (diff the specimens, not just the existence).
- [ ] **Step 4: Retitle and move** everything per the table. `git mv` files where the folder should follow the group (`apps/storybook/src/foundations/<group>/`). Update every mdx `<Meta of>`/`<Canvas of>` import and every play that refers to a story id. Run `pnpm nx run storybook:test` → PASS, and `sidebar.spec.ts` → PASS.
- [ ] **Step 5: Commits** `feat(storybook): add the design templates and explore pages`, `refactor(storybook): match the sidebar to the claude design tree`.

---

