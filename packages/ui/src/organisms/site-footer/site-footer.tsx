import type { ComponentProps, ReactNode } from "react";

import type { LinkAs } from "../../lib/link-as";

import { IconButton } from "../../atoms/icon-button/icon-button";
import { InstagramGlyph, LinkedinGlyph, YoutubeGlyph } from "../../atoms/icon/brand-glyphs";
import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { Typography } from "../../atoms/typography/typography";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { isShown } from "../../lib/is-shown";

export interface FooterItem {
  label: ReactNode;
  /** Omit for a plain line (an address, opening hours). */
  href?: string | undefined;
  icon?: IconComponent | undefined;
}

export interface FooterColumn {
  heading: string;
  items: FooterItem[];
}

export interface FooterSocialLink {
  network: "instagram" | "youtube" | "linkedin";
  href: string;
  /** Accessible name, e.g. "Pink Paprikaa on Instagram"; the footer appends " (Opens in a new tab)". */
  label: string;
}

export interface FooterPolicy {
  label: string;
  href: string;
}

const SOCIAL_GLYPH: Readonly<Record<FooterSocialLink["network"], IconComponent>> = {
  instagram: InstagramGlyph,
  youtube: YoutubeGlyph,
  linkedin: LinkedinGlyph,
};

const siteFooter = componentVariants({
  slots: {
    root: "relative",
    // A decorative layer only: the footer's own ground (or a caller's) shows through it.
    pattern: "absolute inset-0 bg-transparent",
    grid: "relative container-page grid autogrid-min-sm gap-site-footer-gap pt-site-footer-top pb-8",
    brand: "flex flex-col items-start gap-3.5",
    social: "flex gap-2",
    column: "flex min-w-0 flex-col gap-3.5",
    items: "flex flex-col items-start gap-2.5",
    item: "inline-flex items-start gap-2 text-body text-text-body",
    link: "inline-flex items-start gap-2 text-body text-text-link no-underline hover:underline",
    itemIcon: "mt-1",
    legal: "relative container-page",
    legalBar:
      "flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5 border-t border-border-subtle pt-5 text-caption text-text-subtle",
    legalText: "flex flex-wrap gap-x-6 gap-y-2.5",
    policies: "flex flex-wrap gap-x-5 gap-y-2.5",
    policyLink: "text-text-muted no-underline hover:underline",
  },
  variants: {
    tone: {
      brand: { root: "bg-surface-brand" },
      ink: { root: "bg-surface-inverse" },
    },
    hasDockClearance: {
      true: { root: "pb-site-footer-dock-clearance" },
      false: { root: "pb-10" },
    },
  },
  defaultVariants: { tone: "brand", hasDockClearance: false },
});

type FooterTone = NonNullable<VariantProps<typeof siteFooter>["tone"]>;
type FooterPattern = "none" | "default" | "faint";

/** The design system's pink footer is flat; the handoff's ink footer carries the 4% diamond. */
const DEFAULT_PATTERN: Readonly<Record<FooterTone, FooterPattern>> = {
  brand: "none",
  ink: "faint",
};

export interface SiteFooterProps
  extends ComponentProps<"footer">, Pick<VariantProps<typeof siteFooter>, "tone"> {
  /** The brand block — lockup, veg chip, licence line, blurb, contact lines: whatever the app passes. */
  brand?: ReactNode;
  /** Unique by `heading` (it keys the column). A column with no items is skipped. */
  columns: FooterColumn[];
  /** Unique by `network` (it keys the link). */
  social?: FooterSocialLink[] | undefined;
  /** Legal lines (©, GSTIN), rendered verbatim. The system holds no company facts. */
  legal?: ReactNode;
  /** Unique by `href` (it keys the link). */
  policies?: FooterPolicy[] | undefined;
  linkAs?: LinkAs | undefined;
  /** Defaults to `none` on brand and `faint` on ink. */
  pattern?: FooterPattern | undefined;
  /** Pad the bottom so the page's ActionDock never covers the legal links. */
  hasDockClearance?: boolean | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/**
 * The site footer: brand block, link columns (each a labelled nav with list markup; a column of
 * plain lines stays a plain group), social links and the legal bar. It renders exactly what it
 * is given — the FSSAI line, GSTIN and © come from the app's brand facts, never from here.
 */
export function SiteFooter({
  tone = "brand",
  brand,
  columns,
  social = [],
  legal,
  policies = [],
  linkAs: LinkComponent = "a",
  pattern,
  hasDockClearance = false,
  headingLevel = 2,
  className,
  ...props
}: SiteFooterProps) {
  const slots = siteFooter({ tone, hasDockClearance });
  const density = pattern ?? DEFAULT_PATTERN[tone];
  const heading = headingTag(headingLevel);
  const hasBrandBlock = isShown(brand) || social.length > 0;
  const hasLegalBar = isShown(legal) || policies.length > 0;
  return (
    <footer data-surface={tone} className={slots.root({ className })} {...props}>
      {density === "none" ? null : (
        <PatternField
          aria-hidden
          tone={tone}
          tile={80}
          density={density}
          className={slots.pattern()}
        />
      )}
      <div className={slots.grid()}>
        {hasBrandBlock ? (
          <div className={slots.brand()}>
            {brand}
            {social.length > 0 ? (
              // Safari/VoiceOver drops list semantics from a list-style:none list outside a nav.
              <ul role="list" className={slots.social()}>
                {social.map((link) => {
                  const label = `${link.label} (Opens in a new tab)`;
                  return (
                    <li key={link.network}>
                      <IconButton
                        asChild
                        icon={SOCIAL_GLYPH[link.network]}
                        label={label}
                        variant="secondary"
                      >
                        <a
                          href={link.href}
                          aria-label={label}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      </IconButton>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        ) : null}
        {columns.map((column) => {
          if (column.items.length === 0) return null;
          const Column = column.items.some((item) => item.href !== undefined) ? "nav" : "div";
          return (
            <Column
              key={column.heading}
              aria-label={Column === "nav" ? column.heading : undefined}
              className={slots.column()}
            >
              <Typography as={heading} variant="overline" color="brand">
                {column.heading}
              </Typography>
              <ul role={Column === "nav" ? undefined : "list"} className={slots.items()}>
                {column.items.map((item, index) => {
                  const icon = item.icon ? (
                    <Icon icon={item.icon} size="sm" className={slots.itemIcon()} />
                  ) : null;
                  return (
                    <li key={index}>
                      {item.href === undefined ? (
                        <span className={slots.item()}>
                          {icon}
                          {item.label}
                        </span>
                      ) : (
                        <LinkComponent href={item.href} className={slots.link()}>
                          {icon}
                          {item.label}
                        </LinkComponent>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Column>
          );
        })}
      </div>
      {hasLegalBar ? (
        <div className={slots.legal()}>
          <div className={slots.legalBar()}>
            {isShown(legal) ? <div className={slots.legalText()}>{legal}</div> : null}
            {policies.length > 0 ? (
              <ul role="list" className={slots.policies()}>
                {policies.map((policy) => (
                  <li key={policy.href}>
                    <LinkComponent href={policy.href} className={slots.policyLink()}>
                      {policy.label}
                    </LinkComponent>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}
    </footer>
  );
}
