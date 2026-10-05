import type { ReactNode } from "react";

import { ChevronRight } from "lucide-react";

import type { BaseProps } from "../../lib/common-props";
import type { LinkAs } from "../../lib/link-as";

import { Icon } from "../../atoms/icon/icon";
import { Link } from "../../atoms/link/link";
import { Logo } from "../../atoms/logo/logo";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { isShown } from "../../lib/is-shown";
import { withSx } from "../../lib/sx";
import { SiteHeaderBar } from "./site-header-bar";
import { SiteHeaderDrawer } from "./site-header-drawer";

export interface NavLink {
  label: string;
  href: string;
  isActive?: boolean | undefined;
}

/** Between lg and xl the inline nav keeps its first three links; from xl every link shows (design ≥1280). */
const INLINE_LINKS_BELOW_XL = 3;

const siteHeader = componentVariants({
  slots: {
    root: "sticky top-0 z-header",
    skipLink:
      "sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-overlay focus:rounded-pill focus:bg-surface-card focus:px-4 focus:py-2 focus:font-display focus:font-bold focus:text-text-link focus:shadow-3",
    bar: "border-b border-transparent bg-surface-card transition-colors duration-base ease-out data-scrolled:border-border-subtle data-scrolled:bg-surface-glass data-scrolled:backdrop-blur-glass",
    row: "container-page flex items-center gap-6",
    home: "flex shrink-0 items-center rounded-sm transition-control hover:opacity-82 active:press-scale",
    logo: "h-auto",
    badge: "flex shrink-0 items-center",
    nav: "ml-3 hidden lg:block",
    navList: "flex flex-nowrap items-center gap-6",
    navItem: "shrink-0",
    navLink:
      "border-b-2 border-transparent py-1.5 font-display text-site-header-link whitespace-nowrap",
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
  extends BaseProps<"header">, Pick<VariantProps<typeof siteHeader>, "size"> {
  homeHref: string;
  /**
   * Inline nav links. Three show between lg and xl; all from xl (the rest stay in the drawer).
   * Use the design's short labels (Menu, Our Story, Outlets, Franchise, Careers) so five fit at
   * 1280 with the badge and two actions.
   */
  links: NavLink[];
  /** Accessible name of the home link. Default "Pink Paprikaa home". */
  homeLabel?: string | undefined;
  /** Force the glass/scrolled bar; omit to follow scroll. */
  isScrolled?: boolean | undefined;
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
  homeLabel = "Pink Paprikaa home",
  isScrolled,
  sx,
  className,
  ...props
}: SiteHeaderProps) {
  const slots = siteHeader({ size });
  const hasHiddenLinks = links.length > INLINE_LINKS_BELOW_XL;
  const hasDrawer = drawerLinks.length > 0 || isShown(drawerActions);
  return (
    <header className={slots.root({ className: withSx(sx, className) })} {...props}>
      <a href={skipLinkHref} className={slots.skipLink()}>
        {skipLinkLabel}
      </a>
      {announcement}
      <SiteHeaderBar className={slots.bar()} isScrolled={isScrolled}>
        <div className={slots.row()}>
          <LinkComponent href={homeHref} className={slots.home()} aria-label={homeLabel}>
            {isShown(logo) ? logo : <Logo className={slots.logo()} />}
          </LinkComponent>
          {isShown(badge) ? <div className={slots.badge()}>{badge}</div> : null}
          {links.length > 0 ? (
            <nav aria-label={navLabel} className={slots.nav()}>
              <ul className={slots.navList()}>
                {links.map((link, index) => (
                  <li
                    key={link.href}
                    className={slots.navItem({
                      isHiddenBelowXl: index >= INLINE_LINKS_BELOW_XL,
                    })}
                  >
                    <Link
                      color="quiet"
                      underline="hover"
                      asChild
                      className={slots.navLink({ isActive: link.isActive === true })}
                    >
                      <LinkComponent
                        href={link.href}
                        aria-current={link.isActive === true ? "page" : undefined}
                      >
                        {link.label}
                      </LinkComponent>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
          <div className={slots.spacer()} />
          {isShown(actions) ? <div className={slots.actions()}>{actions}</div> : null}
          {isShown(compactActions) ? (
            <div className={slots.compactActions()}>{compactActions}</div>
          ) : null}
          {hasDrawer ? (
            <SiteHeaderDrawer
              menuLabel={menuLabel}
              closeLabel={closeMenuLabel}
              triggerClassName={slots.menuButton({ hasHiddenLinks })}
              portalContainer={portalContainer}
            >
              {drawerLinks.length > 0 ? (
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
              ) : null}
              {isShown(drawerActions) ? (
                <div className={slots.drawerActions()}>{drawerActions}</div>
              ) : null}
            </SiteHeaderDrawer>
          ) : null}
        </div>
      </SiteHeaderBar>
    </header>
  );
}
