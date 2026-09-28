### Task 12: SiteHeader

**Dev reference:** `git show dev:packages/ui/src/organisms/site-header/site-header.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                 | Ruling  | Where / clause                                                                                               |
| ------------------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------ |
| The `banner` landmark with the lockup                                    | ALREADY | tests "is the banner landmark…", "links the logo home…"                                                      |
| Rail links in a named `nav`                                              | ALREADY | test "links the logo home and lists the nav links…"                                                          |
| A custom `navLabel` keeps two mastheads on one page distinct             | ADD     | test "names its navigation from navLabel…"                                                                   |
| Fixed 72px height                                                        | DROP    | C1 — 88 default / 64 compact (tested)                                                                        |
| `onOrder` / `onBook` / `onSearch` / `onCart` and the built-in buttons    | DROP    | spec §8.1 — slots, not callbacks (`actions`, `compactActions`, `drawerActions`)                              |
| Cart count in the button's name, printed on the glyph, hidden at 0       | ALREADY | IconButton `count` (Plan 2a) in the actions slot (`ScrolledWithCart`)                                        |
| Glass and hairline once scrolled                                         | ALREADY | test "turns the bar to glass…" (`data-scrolled:bg-surface-glass`, `data-scrolled:border-border-subtle`)      |
| `isScrolled` as a prop                                                   | DROP    | spec §9.3 + Controller amendment — glass on scroll is a client leaf; its server snapshot keeps SSR identical |
| The sheet opens, lists every link, closes from its close button          | ADD     | test "opens the drawer from the keyboard, hides the bar's own links behind it…"                              |
| The rail behind the open sheet leaves the accessibility tree             | ADD     | same test (one "Catering" link, not two)                                                                     |
| Following a sheet link closes it                                         | ALREADY | test "the drawer traps focus…"                                                                               |
| Opens from the keyboard                                                  | ADD     | same new test (`Enter` on the menu button)                                                                   |
| Merges a caller `className`                                              | ADD     | test "merges a caller className over its own"                                                                |
| axe                                                                      | ALREADY | test "has no accessibility violations, closed or with the drawer open"                                       |
| Sheet description "Every page on the Pink Paprikaa site."                | DROP    | D9                                                                                                           |
| Search moves into the sheet below md; "Book a Table" gives way first     | DROP    | spec §8.1 — the app places its actions through the three action slots                                        |
| Default links                                                            | DROP    | D9                                                                                                           |
| Stories Default · Scrolled · WithCart · ShortRail · Smallest · InContext | ALREADY | Rest · ScrolledWithCart · ScrolledWithCart · HandoffCompact · Mobile · the decorator's `<main>`              |
| Story CartCounts (0 / 1 / 12, each masthead self-named)                  | ADD     | `CartCounts`                                                                                                 |

Implementer: copy this table into your report, extended with anything the plan missed.

**Files:**

- Create: `packages/design-tokens/tokens/component/site-header.json`
- Modify: `packages/design-tokens/contrast-pairs.json` (text on the glass bar)
- Create: `packages/ui/src/organisms/site-header/site-header.tsx`, `site-header-bar.tsx` (client leaf: glass on scroll), `site-header-drawer.tsx` (client leaf: menu drawer), `site-header.test.tsx`, `site-header.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`, `TEXT`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Icon`, `IconButton`, `Logo`, Radix `Dialog` (see Task 11 for the verified behaviour), `LinkAs`, `componentVariants`; tokens `--spacing-header` (88), `--spacing-header-compact` (64), `--color-surface-glass`, `--blur-glass`, `--z-header`, `--z-overlay`; stories: `AnnouncementBar`, `Badge`, `Button`, `DietMark`.
- Produces: `SiteHeader`, `SiteHeaderProps`, `NavLink`. The two leaves are internal (not exported).

The responsive rule, all CSS at token breakpoints (readme §3.10 — no `window.innerWidth`): the inline nav shows from `lg`; between `lg` and `xl` only the first three links stay (the rest are `display: none`, never clipped); at `xl` every link shows. The menu button shows wherever a link is hidden — below `lg` always, and below `xl` too when there are more than three links — so every destination stays reachable. `actions` show from `lg`, `compactActions` below it.

- [ ] **Step 1: Component tokens and the glass contrast pair**

`packages/design-tokens/tokens/component/site-header.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "site-header-logo": {
      "$value": "114px",
      "$description": "Lockup width at the design system header's 60px logo height (lockup viewBox 361.88 × 190.13)."
    },
    "site-header-logo-compact": {
      "$value": "76px",
      "$description": "Lockup width at the handoff header's 40px logo height."
    }
  },
  "text": {
    "$type": "typography",
    "site-header-link": {
      "$value": { "fontSize": "15px", "lineHeight": 1.2, "fontWeight": "{font-weight.semibold}" },
      "$description": "Header nav link (handoff PPHeader: Poppins 600 15px)."
    }
  }
}
```

Append to `SPACING`:

```ts
  "site-header-logo",
  "site-header-logo-compact",
```

Append to `TEXT`:

```ts
  "site-header-link",
```

In `packages/design-tokens/contrast-pairs.json`, append to `groups`:

```json
{
  "id": "site-header-glass",
  "surface": null,
  "foregrounds": ["color-text-heading", "color-text-brand", "color-text-link"],
  "backgrounds": ["color-surface-glass"],
  "backdrop": "color-surface-page-alt",
  "min": 4.5
}
```

(The scrolled header is 72% white over whatever is behind it; the pink-50 hero tint is the darkest page ground the header scrolls over.)

Run: `pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -6`
Expected: PASS, including `contrast group site-header-glass`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/organisms/site-header/site-header.test.tsx`:

```tsx
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { LinkAsProps } from "../../lib/link-as";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { type NavLink, SiteHeader } from "./site-header";

const LINKS: NavLink[] = [
  { label: "Homely Meals", href: "#homely-meals", isActive: true },
  { label: "Catering", href: "#catering" },
  { label: "Menu", href: "#menu" },
];

const LONG_LINKS: NavLink[] = [
  { label: "Homely Meals subscriptions", href: "#homely-meals" },
  { label: "Catering and bulk orders", href: "#catering" },
  { label: "The restaurant menu", href: "#menu" },
  { label: "Office and PG lunch", href: "#office-lunch" },
  { label: "About our kitchen", href: "#about" },
  { label: "Contact and directions", href: "#contact" },
];

const DRAWER_LINKS: NavLink[] = [
  { label: "Home", href: "#home" },
  ...LINKS,
  { label: "Contact", href: "#contact" },
];

const glassBar = () =>
  screen.getByRole("banner").querySelector('[class~="data-scrolled:bg-surface-glass"]');

function RouterLink({ href, className, children, ...props }: LinkAsProps) {
  return (
    <a href={href} className={className} data-router-link="" {...props}>
      {children}
    </a>
  );
}

afterEach(() => {
  Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
});

describe("SiteHeader", () => {
  it("is the banner landmark and starts with a skip link to the main content", async () => {
    const user = userEvent.setup();
    render(<SiteHeader homeHref="#home" links={LINKS} />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    await user.tab();
    const skip = screen.getByRole("link", { name: "Skip to content" });
    expect(skip).toHaveFocus();
    expect(skip).toHaveAttribute("href", "#main");
  });

  it("links the logo home and lists the nav links, the active one marked as the current page", () => {
    render(<SiteHeader homeHref="#home" links={LINKS} />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getAllByRole("link")).toHaveLength(3);
    expect(within(nav).getByRole("link", { name: "Homely Meals" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(within(nav).getByRole("link", { name: "Catering" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("img", { name: /Pink Paprikaa/ }).closest("a")).toHaveAttribute(
      "href",
      "#home"
    );
  });

  it("names its navigation from navLabel, so two mastheads on one page stay distinct", () => {
    render(<SiteHeader homeHref="#home" links={LINKS} navLabel="Main, catering" />);
    expect(screen.getByRole("navigation", { name: "Main, catering" })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Main" })).not.toBeInTheDocument();
  });

  it("keeps three links inline below xl, never wrapping, and moves the rest into the drawer", async () => {
    const user = userEvent.setup();
    render(<SiteHeader homeHref="#home" links={LONG_LINKS} />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    const items = within(nav).getAllByRole("listitem");
    for (const item of items.slice(0, 3)) expect(item).not.toHaveClass("hidden");
    for (const item of items.slice(3)) expect(item).toHaveClass("hidden", "xl:block");
    for (const link of within(nav).getAllByRole("link")) {
      expect(link).toHaveClass("whitespace-nowrap");
    }
    expect(within(nav).getByRole("list")).toHaveClass("flex-nowrap");
    const menuButton = screen.getByRole("button", { name: "Menu" });
    expect(menuButton).toHaveClass("xl:hidden");
    await user.click(menuButton);
    const drawer = screen.getByRole("dialog", { name: "Menu" });
    for (const { label } of LONG_LINKS) {
      expect(within(drawer).getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("hides the menu button from lg when every link fits inline", () => {
    render(<SiteHeader homeHref="#home" links={LINKS} />);
    expect(screen.getByRole("button", { name: "Menu" })).toHaveClass("lg:hidden");
  });

  it("the drawer traps focus, locks the page, closes on Escape and on any link, and returns focus", async () => {
    const user = userEvent.setup();
    render(
      <SiteHeader
        homeHref="#home"
        links={LINKS}
        drawerLinks={DRAWER_LINKS}
        drawerActions={<a href="#order">Order online</a>}
      />
    );
    const menuButton = screen.getByRole("button", { name: "Menu" });
    await user.click(menuButton);
    const drawer = screen.getByRole("dialog", { name: "Menu" });
    expect(within(drawer).getAllByRole("link")).toHaveLength(DRAWER_LINKS.length + 1);
    expect(document.body).toHaveAttribute("data-scroll-locked");

    const stops = DRAWER_LINKS.length + 2;
    for (let step = 0; step < stops + 2; step += 1) {
      await user.tab();
      expect(drawer.contains(document.activeElement)).toBe(true);
    }

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(menuButton).toHaveFocus();
    expect(document.body).not.toHaveAttribute("data-scroll-locked");

    await user.click(menuButton);
    await user.click(within(screen.getByRole("dialog")).getByRole("link", { name: "Catering" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the drawer from the keyboard, hides the bar's own links behind it, and closes from its close button", async () => {
    const user = userEvent.setup();
    render(<SiteHeader homeHref="#home" links={LINKS} />);
    screen.getByRole("button", { name: "Menu" }).focus();
    await user.keyboard("{Enter}");
    const drawer = screen.getByRole("dialog", { name: "Menu" });
    // Radix hides the rest of the page while the drawer is open: one "Catering" link, not two.
    expect(screen.getAllByRole("link", { name: "Catering" })).toHaveLength(1);
    await user.click(within(drawer).getByRole("button", { name: "Close menu" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("turns the bar to glass once the page scrolls past 24px, and back at the top", () => {
    render(<SiteHeader homeHref="#home" links={LINKS} />);
    expect(glassBar()).not.toHaveAttribute("data-scrolled");
    Object.defineProperty(window, "scrollY", { configurable: true, value: 120 });
    fireEvent.scroll(window);
    expect(glassBar()).toHaveAttribute("data-scrolled");
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
    fireEvent.scroll(window);
    expect(glassBar()).not.toHaveAttribute("data-scrolled");
  });

  it("is 88px by default and 64px compact, sizing the default lockup to match", () => {
    const { rerender } = render(<SiteHeader homeHref="#home" links={LINKS} />);
    const row = () => glassBar()?.firstElementChild;
    expect(row()).toHaveClass("h-header");
    expect(screen.getByRole("img", { name: /Pink Paprikaa/ })).toHaveClass("w-site-header-logo");
    rerender(<SiteHeader homeHref="#home" links={LINKS} size="compact" />);
    expect(row()).toHaveClass("h-header-compact");
    expect(screen.getByRole("img", { name: /Pink Paprikaa/ })).toHaveClass(
      "w-site-header-logo-compact"
    );
  });

  it("places the announcement above the bar and the badge beside the logo", () => {
    render(
      <SiteHeader
        homeHref="#home"
        links={LINKS}
        announcement={<p>Launch price closes soon</p>}
        badge={<span>Pure Veg</span>}
      />
    );
    const announcement = screen.getByText("Launch price closes soon");
    const bar = glassBar();
    expect(bar).not.toBeNull();
    expect(bar?.contains(announcement)).toBe(false);
    expect(bar).toContainElement(screen.getByText("Pure Veg"));
  });

  it("shows actions from lg and compact actions below it", () => {
    render(
      <SiteHeader
        homeHref="#home"
        links={LINKS}
        actions={<a href="#order">Order online</a>}
        compactActions={<a href="#wa">WhatsApp us</a>}
      />
    );
    expect(screen.getByRole("link", { name: "Order online" }).parentElement).toHaveClass(
      "hidden",
      "lg:flex"
    );
    expect(screen.getByRole("link", { name: "WhatsApp us" }).parentElement).toHaveClass(
      "lg:hidden"
    );
  });

  it("renders the home and nav links through linkAs", () => {
    render(<SiteHeader homeHref="#home" links={LINKS} linkAs={RouterLink} />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getByRole("link", { name: "Catering" })).toHaveAttribute("data-router-link");
    expect(within(nav).getByRole("link", { name: "Homely Meals" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("portals the drawer into the given container", async () => {
    const user = userEvent.setup();
    const frame = document.createElement("div");
    document.body.append(frame);
    render(<SiteHeader homeHref="#home" links={LINKS} portalContainer={frame} />);
    await user.click(screen.getByRole("button", { name: "Menu" }));
    expect(frame).toContainElement(screen.getByRole("dialog", { name: "Menu" }));
    frame.remove();
  });

  it("merges a caller className over its own", () => {
    render(<SiteHeader homeHref="#home" links={LINKS} className="top-8" />);
    expect(screen.getByRole("banner")).toHaveClass("sticky", "top-8");
    expect(screen.getByRole("banner")).not.toHaveClass("top-0");
  });

  it("has no accessibility violations, closed or with the drawer open", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <SiteHeader homeHref="#home" links={LINKS} actions={<a href="#order">Order online</a>} />
    );
    await expectNoA11yViolations(container);
    await user.click(screen.getByRole("button", { name: "Menu" }));
    await expectNoA11yViolations(screen.getByRole("dialog"));
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- site-header 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./site-header`.

- [ ] **Step 4: Implement the glass bar leaf**

`packages/ui/src/organisms/site-header/site-header-bar.tsx`:

```tsx
"use client";

import { type ReactNode, useSyncExternalStore } from "react";

/** The page has scrolled this far before the header turns to glass (design system: `y > 24`). */
const GLASS_SCROLL_THRESHOLD = 24;

function subscribeToScroll(onChange: () => void): () => void {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => {
    window.removeEventListener("scroll", onChange);
  };
}

const isPastThreshold = (): boolean => window.scrollY > GLASS_SCROLL_THRESHOLD;
const isPastThresholdOnServer = (): boolean => false;

export interface SiteHeaderBarProps {
  className: string;
  children: ReactNode;
}

/**
 * The header row's client corner: solid at rest, `data-scrolled` (glass + blur, CSS) once the
 * page scrolls under it (readme §3.3, §3.9). Its children are server-rendered.
 */
export function SiteHeaderBar({ className, children }: SiteHeaderBarProps) {
  const isScrolled = useSyncExternalStore(
    subscribeToScroll,
    isPastThreshold,
    isPastThresholdOnServer
  );
  return (
    <div data-scrolled={isScrolled ? "" : undefined} className={className}>
      {children}
    </div>
  );
}
```

- [ ] **Step 5: Implement the drawer leaf**

`packages/ui/src/organisms/site-header/site-header-drawer.tsx`:

```tsx
"use client";

import { Menu, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { type MouseEvent, type ReactNode, useState } from "react";

import { IconButton } from "../../atoms/icon-button/icon-button";
import { componentVariants } from "../../lib/component-variants";

const drawer = componentVariants({
  slots: {
    overlay: "fixed inset-0 z-overlay bg-surface-overlay",
    content:
      "fixed inset-x-0 top-0 z-overlay flex max-h-dvh animate-sheet-in flex-col overflow-y-auto bg-surface-card shadow-4",
    bar: "container-page flex h-header-compact shrink-0 items-center justify-end",
    body: "container-page flex flex-col gap-4 pb-5",
  },
});

export interface SiteHeaderDrawerProps {
  /** Names the menu button and the drawer. */
  menuLabel: string;
  closeLabel: string;
  /** Visibility classes for the menu button (the organism decides the breakpoints). */
  triggerClassName: string;
  portalContainer: HTMLElement | null;
  /** The drawer's nav and actions, rendered by the server organism. */
  children: ReactNode;
}

/**
 * The header's menu: a Radix Dialog sheet from the top. Focus is trapped, Escape closes it, focus
 * returns to the menu button, the page behind cannot scroll, and following any link closes it.
 */
export function SiteHeaderDrawer({
  menuLabel,
  closeLabel,
  triggerClassName,
  portalContainer,
  children,
}: SiteHeaderDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const slots = drawer();

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest("a[href]") !== null) {
      setIsOpen(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <IconButton
          icon={Menu}
          label={menuLabel}
          variant="secondary"
          className={triggerClassName}
        />
      </Dialog.Trigger>
      <Dialog.Portal container={portalContainer}>
        <Dialog.Overlay className={slots.overlay()} />
        <Dialog.Content data-surface="light" className={slots.content()} onClick={handleClick}>
          <Dialog.Title className="sr-only">{menuLabel}</Dialog.Title>
          <div className={slots.bar()}>
            <Dialog.Close asChild>
              <IconButton icon={X} label={closeLabel} variant="secondary" />
            </Dialog.Close>
          </div>
          <div className={slots.body()}>{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

- [ ] **Step 6: Implement the organism**

`packages/ui/src/organisms/site-header/site-header.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { ChevronRight } from "lucide-react";

import type { LinkAs } from "../../lib/link-as";

import { Icon } from "../../atoms/icon/icon";
import { Logo } from "../../atoms/logo/logo";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { SiteHeaderBar } from "./site-header-bar";
import { SiteHeaderDrawer } from "./site-header-drawer";

export interface NavLink {
  label: string;
  href: string;
  isActive?: boolean | undefined;
}

/** Between lg and xl the inline nav keeps its first three links; the rest wait for xl (readme §3.10). */
const INLINE_LINKS_BELOW_XL = 3;

const siteHeader = componentVariants({
  slots: {
    root: "sticky top-0 z-header",
    skipLink:
      "sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-overlay focus:rounded-pill focus:bg-surface-card focus:px-4 focus:py-2 focus:font-display focus:font-bold focus:text-text-link focus:shadow-3",
    bar: "border-b border-transparent bg-surface-card transition-colors duration-base ease-out data-scrolled:border-border-subtle data-scrolled:bg-surface-glass data-scrolled:backdrop-blur-glass",
    row: "container-page flex items-center gap-5",
    home: "flex shrink-0 items-center",
    logo: "h-auto",
    badge: "flex shrink-0 items-center",
    nav: "ml-3 hidden lg:block",
    navList: "flex flex-nowrap items-center gap-6",
    navItem: "shrink-0",
    navLink:
      "text-site-header-link inline-flex border-b-2 border-transparent py-1.5 font-display whitespace-nowrap text-text-heading no-underline transition-colors duration-fast ease-out hover:text-text-brand",
    spacer: "flex-1",
    actions: "hidden shrink-0 items-center gap-2 lg:flex",
    compactActions: "flex shrink-0 items-center gap-2 lg:hidden",
    menuButton: "shrink-0",
    drawerList: "flex flex-col",
    drawerLink:
      "flex items-center justify-between border-b border-border-subtle py-3.5 font-display text-body-lg font-semibold text-text-heading no-underline",
    drawerChevron: "text-text-muted",
    drawerActions: "grid grid-cols-2 gap-2",
  },
  variants: {
    size: {
      default: { row: "h-header", logo: "w-site-header-logo" },
      compact: { row: "h-header-compact", logo: "w-site-header-logo-compact" },
    },
    isActive: {
      true: { navLink: "border-border-brand text-text-brand", drawerLink: "text-text-brand" },
    },
    isHiddenBelowXl: { true: { navItem: "hidden xl:block" } },
    hasHiddenLinks: { true: { menuButton: "xl:hidden" }, false: { menuButton: "lg:hidden" } },
  },
  defaultVariants: { size: "default" },
});

export interface SiteHeaderProps
  extends ComponentProps<"header">, Pick<VariantProps<typeof siteHeader>, "size"> {
  homeHref: string;
  /** Inline nav links. Three show between lg and xl, all from xl (the rest are in the drawer). */
  links: NavLink[];
  /** The drawer's links; defaults to `links` (the handoff drawer lists more destinations). */
  drawerLinks?: NavLink[] | undefined;
  /** Replaces the default lockup. Size it yourself (`className="w-…"`). */
  logo?: ReactNode;
  /** From lg: "Order online" + "WhatsApp us" — `<Button asChild size="sm"><a …/></Button>`. */
  actions?: ReactNode;
  /** In the drawer, under its links: the same actions, full width. */
  drawerActions?: ReactNode;
  /** Below lg, beside the menu button: e.g. a WhatsApp IconButton. */
  compactActions?: ReactNode;
  /** Above the bar, e.g. the launch AnnouncementBar with its Countdown. */
  announcement?: ReactNode;
  /** Beside the logo, e.g. the Pure Veg badge. */
  badge?: ReactNode;
  skipLinkHref?: string | undefined;
  skipLinkLabel?: string | undefined;
  linkAs?: LinkAs | undefined;
  navLabel?: string | undefined;
  menuLabel?: string | undefined;
  closeMenuLabel?: string | undefined;
  /** Where the drawer portals (default `document.body`); for page frames in kits — client callers only. */
  portalContainer?: HTMLElement | null | undefined;
}

/**
 * The website masthead: sticky, solid at rest and glass once the page scrolls under it. The
 * nav shortens by CSS at the token breakpoints instead of wrapping or clipping, and the menu
 * drawer holds every destination whenever the bar cannot. Server-rendered; only the glass bar
 * and the drawer are client leaves.
 */
export function SiteHeader({
  homeHref,
  links,
  drawerLinks = links,
  logo,
  actions,
  drawerActions,
  compactActions,
  announcement,
  badge,
  size,
  skipLinkHref = "#main",
  skipLinkLabel = "Skip to content",
  linkAs: LinkComponent = "a",
  navLabel = "Main",
  menuLabel = "Menu",
  closeMenuLabel = "Close menu",
  portalContainer = null,
  className,
  ...props
}: SiteHeaderProps) {
  const slots = siteHeader({ size });
  const hasHiddenLinks = links.length > INLINE_LINKS_BELOW_XL;
  const hasDrawer = drawerLinks.length > 0 || drawerActions !== undefined;
  return (
    <header className={slots.root({ className })} {...props}>
      <a href={skipLinkHref} className={slots.skipLink()}>
        {skipLinkLabel}
      </a>
      {announcement}
      <SiteHeaderBar className={slots.bar()}>
        <div className={slots.row()}>
          <LinkComponent href={homeHref} className={slots.home()}>
            {logo ?? <Logo className={slots.logo()} />}
          </LinkComponent>
          {badge ? <div className={slots.badge()}>{badge}</div> : null}
          {links.length > 0 ? (
            <nav aria-label={navLabel} className={slots.nav()}>
              <ul className={slots.navList()}>
                {links.map((link, index) => (
                  <li
                    key={link.href}
                    className={slots.navItem({ isHiddenBelowXl: index >= INLINE_LINKS_BELOW_XL })}
                  >
                    <LinkComponent
                      href={link.href}
                      aria-current={link.isActive === true ? "page" : undefined}
                      className={slots.navLink({ isActive: link.isActive === true })}
                    >
                      {link.label}
                    </LinkComponent>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
          <div className={slots.spacer()} />
          {actions ? <div className={slots.actions()}>{actions}</div> : null}
          {compactActions ? <div className={slots.compactActions()}>{compactActions}</div> : null}
          {hasDrawer ? (
            <SiteHeaderDrawer
              menuLabel={menuLabel}
              closeLabel={closeMenuLabel}
              triggerClassName={slots.menuButton({ hasHiddenLinks })}
              portalContainer={portalContainer}
            >
              <nav aria-label={navLabel}>
                <ul className={slots.drawerList()}>
                  {drawerLinks.map((link) => (
                    <li key={link.href}>
                      <LinkComponent
                        href={link.href}
                        aria-current={link.isActive === true ? "page" : undefined}
                        className={slots.drawerLink({ isActive: link.isActive === true })}
                      >
                        {link.label}
                        <Icon icon={ChevronRight} size="sm" className={slots.drawerChevron()} />
                      </LinkComponent>
                    </li>
                  ))}
                </ul>
              </nav>
              {drawerActions ? <div className={slots.drawerActions()}>{drawerActions}</div> : null}
            </SiteHeaderDrawer>
          ) : null}
        </div>
      </SiteHeaderBar>
    </header>
  );
}
```

- [ ] **Step 7: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- site-header 2>&1 | tail -8`
Expected: PASS (15 tests). If the focus-trap loop fails on a Radix focus guard (`data-radix-focus-guard`), check the guard is outside the dialog and that FocusScope moved focus back — never loosen the assertion.

- [ ] **Step 8: Stories (card parity with `SiteHeader.card.html` + handoff `PPHeader`)**

`packages/ui/src/organisms/site-header/site-header.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MessageCircle, Search, ShoppingBag } from "lucide-react";
import { expect, screen, waitFor } from "storybook/test";

import { Badge } from "../../atoms/badge/badge";
import { Button } from "../../atoms/button/button";
import { DietMark } from "../../atoms/diet-mark/diet-mark";
import { IconButton } from "../../atoms/icon-button/icon-button";
import { AnnouncementBar } from "../../molecules/announcement-bar/announcement-bar";
import { BRAND, VIEWPORT_1024, VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { type NavLink, SiteHeader } from "./site-header";

/** The handoff launch offer ends 2026-10-31; stories keep a live countdown 30 days out. */
const LAUNCH_ENDS = new Date(Date.now() + 30 * 86_400_000).toISOString();

const DS_LINKS: NavLink[] = [
  { label: "Menu", href: "#menu" },
  { label: "Our Story", href: "#about" },
  { label: "Outlets", href: "#outlets" },
  { label: "Franchise", href: "#franchise" },
  { label: "Careers", href: "#careers" },
];

const HANDOFF_LINKS: NavLink[] = [
  { label: "Homely Meals", href: "#homely-meals", isActive: true },
  { label: "Catering", href: "#catering" },
  { label: "Menu", href: "#menu" },
  { label: "About", href: "#about" },
];

const HANDOFF_DRAWER_LINKS: NavLink[] = [
  { label: "Home", href: "#home" },
  { label: "Homely Meals", href: "#homely-meals", isActive: true },
  { label: "This week’s menu", href: "#this-week" },
  { label: "Catering", href: "#catering" },
  { label: "Office & PG Lunch", href: "#office-lunch" },
  { label: "Menu", href: "#menu" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const LONG_LINKS: NavLink[] = [
  { label: "Homely Meals subscriptions", href: "#homely-meals" },
  { label: "Catering and bulk orders", href: "#catering" },
  { label: "The restaurant menu", href: "#menu" },
  { label: "Office and PG lunch", href: "#office-lunch" },
  { label: "About our kitchen", href: "#about" },
  { label: "Contact and directions", href: "#contact" },
];

const handoffButtons = (size: "sm" | "md", isFullWidth: boolean) => (
  <>
    <Button asChild variant="secondary" size={size} icon={ShoppingBag} isFullWidth={isFullWidth}>
      <a href={BRAND.orderOnlineHref}>Order online</a>
    </Button>
    <Button asChild size={size} icon={MessageCircle} isFullWidth={isFullWidth}>
      <a href={BRAND.whatsappHref}>WhatsApp us</a>
    </Button>
  </>
);

const dsActions = (cartCount: number) => (
  <>
    <IconButton icon={Search} label="Search the menu" />
    <IconButton icon={ShoppingBag} label="Your order" count={cartCount} />
    <Button variant="secondary" size="sm">
      Book a Table
    </Button>
    <Button size="sm" icon={ShoppingBag}>
      Order Now
    </Button>
  </>
);

const HANDOFF = {
  size: "compact",
  links: HANDOFF_LINKS,
  drawerLinks: HANDOFF_DRAWER_LINKS,
  announcement: (
    <AnnouncementBar
      href="#homely-meals"
      endsAt={LAUNCH_ENDS}
      countdownLabel="Launch price closes in"
    >
      Launch price: <strong>Classic at ₹130 a meal</strong> for the first 50 subscribers · closes in
    </AnnouncementBar>
  ),
  badge: (
    <Badge tone="success">
      <DietMark size="sm" />
      Pure Veg
    </Badge>
  ),
  actions: handoffButtons("sm", false),
  drawerActions: handoffButtons("md", true),
  compactActions: (
    <IconButton asChild icon={MessageCircle} label="WhatsApp us" variant="primary">
      <a href={BRAND.whatsappHref} aria-label="WhatsApp us" />
    </IconButton>
  ),
} as const;

const meta = {
  title: "Organisms/SiteHeader",
  component: SiteHeader,
  args: { homeHref: "#home", ...HANDOFF },
  decorators: [
    (Story) => (
      <>
        <Story />
        <main id="main" className="container-page py-10">
          <div className="h-400 rounded-lg bg-surface-page-alt" />
        </main>
      </>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { inline: false, height: "420px" },
      description: {
        component:
          'The website masthead — sticky, solid at rest and glass once scrolled past 24px. `size="default"` is the design system\'s 88px bar; `size="compact"` the handoff\'s 64px row under the launch AnnouncementBar. The nav never wraps or clips: from lg it shows inline, between lg and xl only its first three links, and the menu drawer (a focus-trapped sheet) carries every destination whenever the bar cannot. Never add a third CTA.',
      },
    },
  },
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: "rest" — the design system's 88px header. */
export const Rest: Story = {
  args: {
    size: "default",
    links: DS_LINKS,
    drawerLinks: DS_LINKS,
    announcement: undefined,
    badge: undefined,
    actions: dsActions(0),
    drawerActions: undefined,
    compactActions: <IconButton icon={ShoppingBag} label="Your order" />,
  },
};

/** Card row: "scrolled + cart" — glass over the tinted page, cart count 2. */
export const ScrolledWithCart: Story = {
  args: {
    ...Rest.args,
    actions: dsActions(2),
    compactActions: <IconButton icon={ShoppingBag} label="Your order" count={2} />,
  },
  play: async ({ canvas, canvasElement }) => {
    canvasElement.ownerDocument.defaultView?.scrollTo(0, 240);
    const bar = canvas
      .getByRole("banner")
      .querySelector('[class~="data-scrolled:bg-surface-glass"]');
    await waitFor(() => expect(bar).toHaveAttribute("data-scrolled"));
  },
};

/**
 * Cart counts 0, 1 and 12 on the design-system header. A document holds one `banner` and no two
 * landmarks may share a name, so each specimen sits in its own named `section` (a `header` inside
 * a `section` is not a banner) and names its own nav.
 */
export const CartCounts: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      {[0, 1, 12].map((count) => (
        <section key={count} aria-label={`Cart with ${String(count)} items`}>
          <SiteHeader
            {...args}
            size="default"
            links={DS_LINKS}
            drawerLinks={DS_LINKS}
            announcement={undefined}
            badge={undefined}
            actions={dsActions(count)}
            drawerActions={undefined}
            compactActions={<IconButton icon={ShoppingBag} label="Your order" count={count} />}
            navLabel={`Main, cart with ${String(count)} items`}
          />
        </section>
      ))}
    </div>
  ),
};

/** Handoff PPHeader — launch bar, Pure Veg chip, four links, two actions. */
export const HandoffCompact: Story = {};

/** Six long links at 1024px: three inline, the menu button carries the rest. */
export const LongLinksAtLg: Story = {
  args: { links: LONG_LINKS, drawerLinks: LONG_LINKS },
  globals: VIEWPORT_1024,
};

/** The drawer by keyboard: open, Escape, focus back on the menu button. */
export const DrawerKeyboard: Story = {
  globals: VIEWPORT_360,
  play: async ({ canvas, userEvent }) => {
    const menuButton = canvas.getByRole("button", { name: "Menu" });
    await userEvent.click(menuButton);
    const drawer = await screen.findByRole("dialog", { name: "Menu" });
    await expect(drawer).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(menuButton).toHaveFocus();
  },
};

export const Mobile: Story = { globals: VIEWPORT_360 };
export const Tablet: Story = { globals: VIEWPORT_768 };
export const Desktop: Story = { globals: VIEWPORT_1280 };
```

- [ ] **Step 9: Export**

```ts
export {
  type NavLink,
  SiteHeader,
  type SiteHeaderProps,
} from "./organisms/site-header/site-header";
```

- [ ] **Step 10: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/site-header packages/design-tokens/tokens/component/site-header.json packages/design-tokens/contrast-pairs.json packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/design-tokens/tokens/component/site-header.json packages/design-tokens/contrast-pairs.json packages/ui/src/organisms/site-header packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): SiteHeader organism

Sticky masthead at the design system's 88px or the handoff's 64px, with a
skip link, announcement and badge slots, and a nav that shortens by CSS at
the token breakpoints instead of wrapping or clipping. Two client leaves
keep the rest server-rendered: the bar turns to glass past 24px via
useSyncExternalStore, and the menu drawer is a Radix sheet that traps
focus, locks the page, closes on Escape or any link and returns focus.
Adds the glass-bar text pairs to the contrast policy.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

