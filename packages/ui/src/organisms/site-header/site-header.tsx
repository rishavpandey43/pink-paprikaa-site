"use client";

import type { ComponentPropsWithoutRef } from "react";

import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "../../atoms/button/button";
import { IconButton } from "../../atoms/icon-button/icon-button";
import { Link } from "../../atoms/link/link";
import { Logo } from "../../atoms/logo/logo";
import { componentVariants, type VariantProps } from "../../lib/component-variants";

const siteHeader = componentVariants({
  slots: {
    root: [
      "sticky top-0 z-30 h-(--layout-header-h) w-full border-b",
      "transition-[background-color,border-color] duration-(--duration-base) ease-out",
    ],
    inner: [
      "mx-auto flex h-full w-full max-w-(--layout-container-max) items-center gap-2",
      "px-(--layout-gutter-fluid) sm:gap-3",
    ],
    brand: "flex shrink-0 items-center",
    // The rail is hidden rather than truncated below `lg` — the same links live in the sheet, so
    // nothing is lost, and a nav that wraps would break the fixed 72px band.
    nav: "ml-2 hidden min-w-0 items-center gap-6 lg:flex",
    actions: "ml-auto flex shrink-0 items-center gap-1 whitespace-nowrap sm:gap-2",
    cart: "relative",
    /**
     * The count sits on the cart glyph and is hidden from assistive tech: the button's own label
     * already carries the number, so announcing it twice would read "Your order, 2 items. 2".
     */
    count: [
      "pointer-events-none absolute top-1.5 right-1.5 grid h-4.5 min-w-4.5 place-items-center",
      "rounded-6 bg-brand-primary px-1",
      "font-display font-bold text-overline leading-overline text-text-on-brand",
    ],
    // Search moves into the sheet below `md`; "Book a Table" is the CTA that gives way first,
    // because ordering is the header's job and there are only ever two.
    search: "hidden md:inline-flex",
    book: "hidden md:inline-flex",
    sheetTrigger: "lg:hidden",
    overlay: "fixed inset-0 z-40 bg-surface-overlay data-[state=open]:animate-pp-fade",
    sheet: [
      "fixed inset-y-0 right-0 z-50 flex w-full max-w-80 flex-col gap-7 overflow-y-auto",
      "rounded-l-5 bg-surface-card p-6 shadow-elevation4",
      "data-[state=open]:animate-pp-rise",
    ],
    sheetHeader: "flex items-center justify-between gap-4",
    sheetTitle: "font-display font-bold text-subtitle1 text-text-heading tracking-subtitle1",
    sheetNav: "flex flex-col",
    sheetLink: "flex min-h-(--layout-hit-min) items-center",
    sheetActions: "mt-auto flex flex-col gap-3",
  },
  variants: {
    /**
     * Past the hero the band goes translucent white over whatever scrolls under it. It is a prop
     * rather than an internal scroll listener so the header renders identically on the server and
     * one page can decide its own threshold.
     */
    isScrolled: {
      true: {
        root: "border-border-subtle bg-surface-glass backdrop-blur-(--effect-blur-glass)",
      },
      false: { root: "border-transparent bg-surface-card" },
    },
  },
  defaultVariants: { isScrolled: false },
});

/** One entry in the masthead rail. */
export interface SiteHeaderLink {
  /** What the link says, in Title Case. */
  label: string;
  /** Where it goes. */
  href: string;
}

const DEFAULT_LINKS: SiteHeaderLink[] = [
  { label: "Menu", href: "/menu" },
  { label: "Our Story", href: "/about" },
  { label: "Outlets", href: "/outlets" },
  { label: "Franchise", href: "/franchise" },
  { label: "Careers", href: "/careers" },
];

export interface SiteHeaderProps
  extends Omit<ComponentPropsWithoutRef<"header">, "children">, VariantProps<typeof siteHeader> {
  /** The rail, in the order a guest would look for them. Shown from 1024px; in the sheet below. */
  links?: SiteHeaderLink[] | undefined;
  /**
   * Names the rail's navigation landmark. A page has one masthead, so the default is right almost
   * always — but a landmark's role and accessible name have to be unique across the whole
   * document, so a page that shows more than one masthead (a specimen sheet, a comparison) must
   * give each of them its own name or every one of them becomes unidentifiable.
   */
  navLabel?: string | undefined;
  /** Where the lockup goes back to. */
  homeHref?: string | undefined;
  /** Items in the order. Zero hides the count entirely. */
  cartCount?: number | undefined;
  /** Opens the search field. Omit it and no search button is drawn. */
  onSearch?: (() => void) | undefined;
  /** Opens the order panel. Omit it and no cart button is drawn. */
  onCart?: (() => void) | undefined;
  /**
   * The primary action. Ordering lives on an external domain, so the caller owns the jump — the
   * header only guarantees the button is the one thing that never gives way as the band narrows.
   */
  onOrder?: (() => void) | undefined;
  /** The second action, and the only other one this header will ever carry. */
  onBook?: (() => void) | undefined;
}

/**
 * The site masthead: 72px, sticky, and translucent once the page has scrolled past its hero.
 *
 * Below 1024px the rail collapses into a keyboard-accessible sheet built on Radix Dialog, so the
 * links are never truncated and the band keeps its fixed height at 360px.
 */
export function SiteHeader({
  cartCount = 0,
  className,
  homeHref = "/",
  isScrolled,
  links = DEFAULT_LINKS,
  navLabel = "Main",
  onBook,
  onCart,
  onOrder,
  onSearch,
  ...props
}: SiteHeaderProps) {
  const slots = siteHeader({ isScrolled });
  const cartLabel = cartCount > 0 ? `Your order, ${String(cartCount)} items` : "Your order";
  // The sheet is controlled so that following one of its links closes it — a route change inside
  // an app router never unmounts the header, so an uncontrolled dialog would stay open over it.
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={slots.root({ className })} {...props}>
      <div className={slots.inner()}>
        <a className={slots.brand()} href={homeHref}>
          <Logo size="md" tone="brand" variant="wordmark" />
        </a>

        <nav aria-label={navLabel} className={slots.nav()}>
          {links.map((link) => (
            <Link href={link.href} key={link.href} variant="quiet">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={slots.actions()}>
          {onSearch === undefined ? null : (
            <IconButton
              className={slots.search()}
              icon={Search}
              label="Search the Menu"
              onClick={onSearch}
            />
          )}

          {onCart === undefined ? null : (
            <div className={slots.cart()}>
              <IconButton icon={ShoppingBag} label={cartLabel} onClick={onCart} />
              {cartCount > 0 ? (
                <span aria-hidden className={slots.count()}>
                  {cartCount}
                </span>
              ) : null}
            </div>
          )}

          <Button className={slots.book()} onClick={onBook} size="sm" variant="secondary">
            Book a Table
          </Button>

          <Button icon={ShoppingBag} onClick={onOrder} size="sm">
            Order Now
          </Button>

          <Dialog.Root onOpenChange={setIsMenuOpen} open={isMenuOpen}>
            <Dialog.Trigger asChild>
              <IconButton className={slots.sheetTrigger()} icon={Menu} label="Open Navigation" />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className={slots.overlay()} />
              <Dialog.Content className={slots.sheet()}>
                <div className={slots.sheetHeader()}>
                  {/* Radix renders its own heading element here, so this is one of the few places
                      the type classes are written by hand rather than nesting `Text`. */}
                  <Dialog.Title className={slots.sheetTitle()}>Navigation</Dialog.Title>
                  <Dialog.Close asChild>
                    <IconButton icon={X} label="Close Navigation" />
                  </Dialog.Close>
                </div>
                <Dialog.Description className="sr-only">
                  Every page on the Pink Paprikaa site.
                </Dialog.Description>

                <nav aria-label="Site" className={slots.sheetNav()}>
                  {links.map((link) => (
                    <Link
                      className={slots.sheetLink()}
                      href={link.href}
                      key={link.href}
                      onClick={() => {
                        setIsMenuOpen(false);
                      }}
                      size="lg"
                      variant="quiet"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className={slots.sheetActions()}>
                  {onSearch === undefined ? null : (
                    <Button
                      icon={Search}
                      isFullWidth
                      onClick={() => {
                        setIsMenuOpen(false);
                        onSearch();
                      }}
                      variant="ghost"
                    >
                      Search the Menu
                    </Button>
                  )}
                  <Button
                    isFullWidth
                    onClick={() => {
                      setIsMenuOpen(false);
                      onBook?.();
                    }}
                    variant="secondary"
                  >
                    Book a Table
                  </Button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
