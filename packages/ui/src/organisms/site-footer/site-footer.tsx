import type { LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";

import { AtSign, Briefcase, Play } from "lucide-react";

import { Divider } from "../../atoms/divider/divider";
import { Icon } from "../../atoms/icon/icon";
import { Link } from "../../atoms/link/link";
import { Logo } from "../../atoms/logo/logo";
import { Text } from "../../atoms/text/text";
import { componentVariants } from "../../lib/component-variants";

/**
 * The footer floods the brand pink and closes the page with it — the last thing a guest sees is
 * the brand at full strength, with the lockup, the link columns and the legal band all in white.
 */
const siteFooter = componentVariants({
  slots: {
    root: "w-full bg-surface-brand text-text-on-brand",
    inner: [
      "mx-auto w-full max-w-(--layout-container-max) px-(--layout-gutter-fluid)",
      "pt-[clamp(44px,5vw,64px)] pb-8",
    ],
    // 220px minimums so the four columns fold to two and then to one without a track ever going
    // narrower than a link label.
    columns: "grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-9",
    brand: "min-w-0",
    blurb: "mt-5 text-text-on-brand",
    statement: "mt-2.5 text-text-on-brand",
    social: "mt-4 flex flex-wrap items-center gap-1",
    /**
     * A real anchor, not an `IconButton`: a social account is a destination, so it must be
     * middle-clickable and announced as a link. The 44px floor is the hit target, the glyph is 20.
     */
    socialLink: [
      "inline-flex min-h-(--layout-hit-min) min-w-(--layout-hit-min) items-center justify-center",
      "rounded-6 text-text-on-brand",
      "transition-colors duration-(--duration-fast) ease-out",
      "hover:bg-glass-white hover:text-text-link",
      "active:scale-(--motion-press-scale)",
    ],
    column: "min-w-0",
    // The column headings sit back from the links they label, so the white is softened rather
    // than sized down — the ALL CAPS overline step is already the smallest thing in the footer.
    heading: "text-text-on-brand/75",
    // `justify-items-start` keeps each link's underline the width of its own label rather than the
    // width of the track.
    links: "mt-4 grid justify-items-start gap-2.5",
    base: ["mx-auto w-full max-w-(--layout-container-max) px-(--layout-gutter-fluid) pb-10"],
    legalRow: "flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-5",
    legal: "text-text-on-brand/85",
    policies: "flex flex-wrap items-center gap-x-6 gap-y-2",
    licence: "text-text-on-brand/85",
  },
});

/** A destination in one of the footer columns. */
export interface SiteFooterLink {
  /** What the link says, in Title Case. */
  label: string;
  /** Where it goes. */
  href: string;
}

/** One footer column: an ALL CAPS heading over a short run of links. */
export interface SiteFooterColumn {
  /** Two or three words naming the group — "Eat", "Visit", "Company". */
  heading: string;
  /** Four links at most. A longer column belongs on a page, not in the footer. */
  links: SiteFooterLink[];
}

/** A social account and the glyph that stands for it. */
export interface SiteFooterSocial {
  /** The network. It is the link's accessible name, so write it as the network is spelled. */
  label: string;
  /** The profile. */
  href: string;
  /**
   * The glyph. Lucide dropped its brand marks at 1.0, so the defaults below use the nearest
   * generic glyph; pass your own component with the same signature to draw the real mark.
   */
  icon: LucideIcon;
}

const DEFAULT_COLUMNS: SiteFooterColumn[] = [
  {
    heading: "Eat",
    links: [
      { label: "Full Menu", href: "/menu" },
      { label: "Small Plates", href: "/menu#small-plates" },
      { label: "Chai & Coffee", href: "/menu#chai-and-coffee" },
      { label: "Sweets", href: "/menu#sweets" },
    ],
  },
  {
    heading: "Visit",
    links: [
      { label: "Outlets", href: "/outlets" },
      { label: "Book a Table", href: "/book" },
      { label: "Private Dining", href: "/private-dining" },
      { label: "Gift Cards", href: "/gift-cards" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Franchise", href: "/franchise" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
    ],
  },
];

const DEFAULT_SOCIAL: SiteFooterSocial[] = [
  { label: "Instagram", href: "https://www.instagram.com/", icon: AtSign },
  { label: "YouTube", href: "https://www.youtube.com/", icon: Play },
  { label: "LinkedIn", href: "https://www.linkedin.com/", icon: Briefcase },
];

const DEFAULT_POLICIES: SiteFooterLink[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export interface SiteFooterProps extends Omit<ComponentPropsWithoutRef<"footer">, "children"> {
  /** The link columns. Three is the shape the layout is drawn for; four still fits. */
  columns?: SiteFooterColumn[] | undefined;
  /** Two short sentences under the lockup saying what the kitchen is. */
  blurb?: string | undefined;
  /** The kitchen's standing claim, printed once and plainly. */
  statement?: string | undefined;
  /** The accounts worth following. Each renders as an icon button on the pink field. */
  social?: SiteFooterSocial[] | undefined;
  /** The registered entity, exactly as it appears on the licence. */
  legal?: string | undefined;
  /** Privacy, terms and anything else legal counsel asks for. */
  policies?: SiteFooterLink[] | undefined;
  /**
   * The FSSAI licence number, which an Indian food business is legally required to display. It is
   * printed as text rather than as a policy link because it is a number, not a destination.
   */
  licence?: string | undefined;
}

/**
 * The flooded-pink site footer: white lockup, three link columns, and the legal band.
 *
 * It is where the site says what it is once, plainly, and where the FSSAI licence line lives.
 */
export function SiteFooter({
  blurb = "Chai from 8am, chilli paneer until close. Cooked to order, every order.",
  className,
  columns = DEFAULT_COLUMNS,
  legal = "© 2026 Paprikaa Culinary Ventures Private Limited",
  licence = "FSSAI Lic. 11522334455667",
  policies = DEFAULT_POLICIES,
  social = DEFAULT_SOCIAL,
  statement = "100% vegetarian kitchen.",
  ...props
}: SiteFooterProps) {
  const slots = siteFooter();

  return (
    <footer className={slots.root({ className })} {...props}>
      <div className={slots.inner()}>
        <div className={slots.columns()}>
          <div className={slots.brand()}>
            <Logo size="lg" tone="white" variant="wordmark" />
            <Text className={slots.blurb()} measure="narrow" variant="body2">
              {blurb}
            </Text>
            <Text className={slots.statement()} variant="body2">
              {statement}
            </Text>
            <div className={slots.social()}>
              {social.map((account) => (
                <a
                  aria-label={account.label}
                  className={slots.socialLink()}
                  href={account.href}
                  key={account.label}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  <Icon icon={account.icon} size="md" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <div className={slots.column()} key={column.heading}>
              <Text as="p" className={slots.heading()} variant="overline">
                {column.heading}
              </Text>
              <div className={slots.links()}>
                {column.links.map((link) => (
                  <Link href={link.href} key={link.href} variant="inverse">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={slots.base()}>
        <Divider on="brand" />
        <div className={slots.legalRow()}>
          <Text className={slots.legal()} variant="caption">
            {legal}
          </Text>
          <div className={slots.policies()}>
            {policies.map((policy) => (
              <Link href={policy.href} key={policy.href} size="sm" variant="inverse">
                {policy.label}
              </Link>
            ))}
            <Text className={slots.licence()} variant="caption">
              {licence}
            </Text>
          </div>
        </div>
      </div>
    </footer>
  );
}
