### Task 16: Replace the layout-story stand-ins, then the tier parity review

**Files:**

- Modify: `packages/ui/src/layouts/app-shell/app-shell.stories.tsx`, `packages/ui/src/layouts/post-frame/post-frame.stories.tsx`, and any other file `grep` finds in Step 1
- Modify (only for fixes found in review): the organism files of Tasks 1–15
- Read: `zip-files/Pink Paprikaa Design System/components/organisms/*.card.html`, `zip-files/pink-paprikaa-handoff/design/{PPHeader,PPFooter,GoogleReviews,FaqBlock,PlanCalculator,DawatCalculator,OfficeLunch,Home,Catering}.dc.html`

**Interfaces:**

- Consumes: every organism of this plan; FilterBar, MenuItemRow, LoyaltyCard, LogoLockup, OfferSeal (Plan 3b); AppShell (forwards `ref` to the frame) and PostFrame (Plan 2c).
- Produces: layout stories built from the real components; a parity record (fixed or listed with reasons) in the commit body.

- [ ] **Step 1: Find every stand-in Plan 2c left for this plan**

Run: `rtk proxy grep -rn "Stand-in\|stand-in\|stand-ins" packages/ui/src/layouts`
Expected: the AppShell stand-ins (`DemoTabBar`, `DemoMenuScreen`, `DemoSheet`, and the docs sentence naming them) and the PostFrame boards' `Logo` lockups in place of LogoLockup and the missing OfferSeal. Any further hit (a Stack or Cluster demo) is replaced by the real component the same way, using the mapping: tab bar → `TabBar`, sheet → `Dialog variant="sheet"` with `portalContainer`, category chips → `FilterBar`, dish cards → `MenuItemRow`, loyalty → `LoyaltyCard`, lockup → `LogoLockup`, seal → `OfferSeal`.

- [ ] **Step 2: AppShell stories — real TabBar, menu screen and sheet**

In `packages/ui/src/layouts/app-shell/app-shell.stories.tsx`, delete `TABS`, `DemoTabBar`, `DemoMenuScreen` and `DemoSheet` (keep `DemoHomeScreen`, which is a pink-header screen built from atoms, not a stand-in), and add:

```tsx
import { House, Plus, ShoppingBag, User, Utensils } from "lucide-react";
import { useState } from "react";

import { IconButton } from "../../atoms/icon-button/icon-button";
import { FilterBar } from "../../molecules/filter-bar/filter-bar";
import { LoyaltyCard } from "../../molecules/loyalty-card/loyalty-card";
import { MenuItemRow } from "../../molecules/menu-item-row/menu-item-row";
import { Dialog } from "../../organisms/dialog/dialog";
import { TabBar, type TabBarItem } from "../../organisms/tab-bar/tab-bar";

const TABS: TabBarItem[] = [
  { value: "home", label: "Home", icon: House, href: "#home" },
  { value: "menu", label: "Menu", icon: Utensils, href: "#menu" },
  { value: "cart", label: "Cart", icon: ShoppingBag, href: "#cart", count: 2 },
  { value: "you", label: "You", icon: User, href: "#you" },
];

const CATEGORIES = ["All", "Small Plates", "All Day", "Sweets"].map((label) => ({
  value: label,
  label,
}));

function AppTabBar({ current }: { current: string }) {
  return <TabBar items={TABS} value={current} />;
}

/** The app's menu screen, as on the card: filters, the loyalty card, dish rows. */
function MenuScreen() {
  return (
    <Stack space={4} className="px-5 pt-2 pb-5">
      <Text as="h1" variant="h3">
        Menu
      </Text>
      <FilterBar label="Menu category" options={CATEGORIES} />
      <LoyaltyCard visits={6} goal={10} reward="chai" />
      <div>
        <MenuItemRow
          name="Paprikaa Chilli Paneer"
          description="Amritsari paneer, burnt chilli mayo."
          price={280}
          spice={3}
          hasDivider
          headingLevel={2}
          action={
            <IconButton
              icon={Plus}
              label="Add Paprikaa Chilli Paneer"
              variant="primary"
              size="sm"
            />
          }
        />
        <MenuItemRow
          name="Masala Cold Brew"
          description="Cold brew, jaggery, cardamom."
          price={220}
          spice={1}
          headingLevel={2}
          action={
            <IconButton icon={Plus} label="Add Masala Cold Brew" variant="primary" size="sm" />
          }
        />
      </div>
    </Stack>
  );
}

/** The card's "with overlay sheet" frame: the real Dialog sheet, portalled into the phone. */
function SheetInFrame() {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <AppShell ref={setFrame} statusTone="ink" tabBar={<AppTabBar current="menu" />}>
      <MenuScreen />
      {frame === null ? null : (
        <Dialog
          defaultOpen
          variant="sheet"
          title="Remove this item?"
          portalContainer={frame}
          footer={
            <>
              <Button variant="ghost" size="sm">
                Keep It
              </Button>
              <Button size="sm">Remove</Button>
            </>
          }
        >
          Chilli Paneer will come off your order.
        </Dialog>
      )}
    </AppShell>
  );
}
```

Then point the stories at them: `meta.args` → `tabBar: <AppTabBar current="menu" />, children: <MenuScreen />`; `WithOverlaySheet` → `{ name: "with overlay sheet", render: () => <SheetInFrame />, parameters: { a11y: { config: { rules: [{ id: "aria-hidden-focus", enabled: false }] } } } }` (Radix hides the rest of the frame while it traps focus in the sheet — Task 11); in `StatusTones` use `<AppTabBar current="menu" />` and `<AppTabBar current="home" />` with `<MenuScreen />`. In the docs description, replace the sentence "The tab bar, menu screen and sheet here are temporary stand-ins; Plan 4's final task replaces them with TabBar, Dialog and the Plan 3b molecules." with "The tab bar is TabBar, the sheet is Dialog (`variant=\"sheet\"`, portalled into the frame), the screen uses FilterBar, LoyaltyCard and MenuItemRow." Merge the new imports into the file's import block and drop any that became unused (`Card`, `Tag`, `Icon`).

- [ ] **Step 3: PostFrame stories — LogoLockup and the OfferSeal**

In `packages/ui/src/layouts/post-frame/post-frame.stories.tsx`:

- add `import { LogoLockup } from "../../molecules/logo-lockup/logo-lockup";` and `import { OfferSeal } from "../../molecules/offer-seal/offer-seal";`;
- in `OfferBoard`, replace `<Logo tone="white" className="w-65" />` with `<LogoLockup tone="white" size="lg" />` and add, as the last child of the `relative` board div, `<OfferSeal value="50%" label="Off" size="lg" tone="light" corner="top-right" bleed="none" />` (the card's "50% OfferSeal"; `lg` is the 260px seal for 1080 canvases);
- in `StatementBoard`, replace `<Logo tone="white" className="w-60" />` with `<LogoLockup tone="white" size="md" />`;
- remove the `Logo` import if nothing else uses it, and delete the docs/comment lines saying the boards sign with the `Logo` lockup and omit the seal.

- [ ] **Step 4: Gate the layout stories**

```bash
pnpm exec prettier --write packages/ui/src/layouts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build \
  && pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache 2>&1 | tail -12
rtk proxy grep -rn "Stand-in\|stand-in" packages/ui/src/layouts
```

Expected: green; the grep prints nothing.

- [ ] **Step 5: Serve the sources and Storybook side by side**

Run each in the background (Bash `run_in_background`), from the repo root:

```bash
pnpm nx run @pink-paprikaa-web/storybook:build && python3 -m http.server 6006 --directory apps/storybook/storybook-static
python3 -m http.server 4100 --directory "zip-files/Pink Paprikaa Design System"
python3 -m http.server 4200 --directory zip-files/pink-paprikaa-handoff/design
```

(The design-system cards load React from unpkg, so the browser needs network access; the handoff pages load their bundle from `design/_ds/`.)

- [ ] **Step 6: Screenshot every pair at 360 and 1280**

With the Chrome DevTools MCP (`new_page`, `resize_page`, `navigate_page`, `take_screenshot`), or Playwright, capture each source and each story at 360×900 and 1280×900 into `/tmp/pp-parity/<organism>-<width>-{source,story}.png` (not committed). A story URL is `http://localhost:6006/iframe.html?id=<story-id>&viewMode=story` (the viewport is the window size here; the `globals` of the viewport stories do not apply to a bare iframe).

| Organism             | Source                                                                                                           | Story ids (`organisms-<name>--<story>`)                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| SiteHeader           | `:4100/components/organisms/SiteHeader.card.html` · `:4200/PPHeader.dc.html`                                     | `organisms-siteheader--rest`, `--scrolled-with-cart`, `--handoff-compact`                                            |
| SiteFooter           | `:4100/…/SiteFooter.card.html` · `:4200/PPFooter.dc.html`                                                        | `organisms-sitefooter--design-system-pink`, `--handoff-ink`                                                          |
| HeroBanner           | `:4100/…/HeroBanner.card.html` · `:4200/Home.dc.html`, `Catering.dc.html`, `OfficeLunch.dc.html` (first section) | `organisms-herobanner--brand-split`, `--soft-centred`, `--handoff-home`, `--handoff-catering`, `--handoff-office`    |
| MenuList             | `:4100/…/MenuList.card.html`                                                                                     | `organisms-menulist--grid-website`, `--list-app`                                                                     |
| CtaBand              | `:4100/…/CtaBand.card.html` · `:4200/Home.dc.html` (office strip), `Catering.dc.html` (taste first)              | `organisms-ctaband--ink-split`, `--brand-centred`, `--soft-split`, `--handoff-office-strip`, `--handoff-taste-first` |
| StatBand             | `:4100/…/StatBand.card.html`                                                                                     | `organisms-statband--soft`, `--brand`                                                                                |
| TestimonialWall      | `:4100/…/TestimonialWall.card.html`                                                                              | `organisms-testimonialwall--default`                                                                                 |
| FaqSection           | `:4100/…/FaqSection.card.html` · `:4200/FaqBlock.dc.html`                                                        | `organisms-faqsection--default`, `--handoff-with-aside`                                                              |
| TabBar               | `:4100/…/TabBar.card.html`                                                                                       | `organisms-tabbar--four-tabs-with-count`, `--five-tabs`                                                              |
| Dialog               | `:4100/…/Dialog.card.html`                                                                                       | `organisms-dialog--centred-modal`, `--sheet`                                                                         |
| CartPanel            | `:4100/…/CartPanel.card.html`                                                                                    | `organisms-cartpanel--filled`, `--empty`                                                                             |
| OrderTracker         | `:4100/…/OrderTracker.card.html`                                                                                 | `organisms-ordertracker--order-in`, `--ready`                                                                        |
| ReviewCarousel       | `:4200/GoogleReviews.dc.html`                                                                                    | `organisms-reviewcarousel--handoff-home`, `--empty`                                                                  |
| ActionDock           | `:4200/PPFooter.dc.html` (bottom bar / floating pill)                                                            | `organisms-actiondock--mobile`, `--desktop`                                                                          |
| QuotePanel           | `:4200/PlanCalculator.dc.html`, `DawatCalculator.dc.html`, `OfficeLunch.dc.html` (quote section)                 | `organisms-quotepanel--handoff-plan`, `--handoff-dawat`, `--handoff-office`                                          |
| AppShell · PostFrame | `:4100/components/layouts/AppShell.card.html`, `PostFrame.card.html`                                             | `layouts-appshell--with-tab-bar`, `--with-overlay-sheet`; `layouts-postframe--post`                                  |

Compare layout, spacing rhythm, type ramp, colours, radii, shadows and states. Expected, deliberate differences — list them, do not "fix" them: text colours re-pointed for AA (§5.3: pink-500 text → pink-600, ink-500 → ink-600, overlines on brand white instead of pink-300); copy replaced where the card's sample copy is untrue of the brand (StatBand's "6 outlets / 4.6 rating", FaqSection's egg answer, TestimonialWall's invented guests); the header's nav switching to the drawer below 1024px (the card drops links with no drawer); grid minimums snapped to the `autogrid` scale (§15.2); focus rings, skip link and dock clearance the sources lack; font rasterisation.

- [ ] **Step 7: Fix or list**

Fix every other difference in the owning organism (a token first if a value is missing) and rerun that task's test. Then run the cold gate:

```bash
pnpm nx format:check && pnpm nx sync:check \
  && pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build \
  && pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache 2>&1 | tail -15 \
  && pnpm guard:founder
```

Expected: every task green, story tests pass (a11y enforced, play functions run), guard clean.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/layouts packages/ui/src/organisms packages/design-tokens/tokens/component
git commit -m "test(ui): organism tier parity review and real layout-story components

AppShell and PostFrame stories now compose the real TabBar, Dialog sheet
(portalled into the frame), FilterBar, LoyaltyCard, MenuItemRow, LogoLockup
and OfferSeal in place of Plan 2c's stand-ins.

Parity against the design-system cards and handoff components at 360 and
1280. Fixed: <one line per fix>. Deliberate differences: <one line each,
with its reason>.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

If the review found fixes in organism code, use `fix(ui): …` as the type instead of `test(ui): …`.

## Controller amendments (2026-09-27)

- **SiteHeader drawer below `lg`** (nav from `lg`, three links `lg`–`xl`) — accepted; it matches the handoff PPHeader (`wide = w >= 1024`). Spec §9.3's "drawer below md" is corrected in Plan 5 Task 14.
- **Glass on scroll** (design system) — accepted.
- **Review fixture with the one-`a` misspelling** — elide the misspelled words with "[…]" exactly as Plan 5's `fixtures.ts` does (ruling R17), so every story and kit shows the same quote.
- **Plan 5 reconciliation** — Plan 5 Task 0 picks up this plan's deviations (CartPanel `emptyTitle`/`emptyBody`/`noteField`, OrderTracker `badge`/`codeLabel`/`paymentLabel`, MenuList labels, SiteHeader `compactActions`/`drawerLinks`/`portalContainer`, `pattern` enum) from the built code.
