import { Clock, MapPin } from "lucide-react";
import { type ComponentProps, createElement, type ReactNode } from "react";

import type { LinkAs } from "../../lib/link-as";
import type { MenuItemImage } from "../menu-item-row/menu-item-row";

import { Card } from "../../atoms/card/card";
import { Icon } from "../../atoms/icon/icon";
import { ImageSlot } from "../../atoms/image-slot/image-slot";
import { StatusDot } from "../../atoms/status-dot/status-dot";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { STRETCHED_LINK } from "../../lib/stretched-link";

type OutletStatus = "open" | "busy" | "closed";

/** Status in plain words (design-system OutletCard); `statusLabel` overrides. */
const STATUS_WORD: Readonly<Record<OutletStatus, string>> = {
  open: "Open now",
  busy: "Busy",
  closed: "Closed",
};

const outletCard = componentVariants({
  slots: {
    // h-full lets a locator row of cards share one height; the stretched link's keyboard ring goes
    // round the whole card (lib/stretched-link).
    root: ["flex h-full flex-col", STRETCHED_LINK.card],
    body: "grid gap-2.5 p-4.5",
    top: "flex flex-wrap items-start justify-between gap-3",
    titles: "min-w-0",
    city: "m-0 max-w-none font-display text-overline text-text-brand uppercase",
    name: "mt-1 font-display text-h4 text-text-heading",
    // Stretched link: the ::after covers the whole card, so the card clicks through to the outlet.
    link: STRETCHED_LINK.link,
    detail: "m-0 flex max-w-none items-start gap-2 text-body-sm text-text-muted not-italic",
    detailIcon: "mt-0.5",
    // Above the stretched link's overlay, so Directions stays its own target.
    action: "relative z-raised mt-1",
  },
});

export interface OutletCardProps extends ComponentProps<"article"> {
  name: string;
  city?: string | undefined;
  address?: string | undefined;
  /** 12-hour lowercase with an en dash: "8am – 11:30pm". */
  hours?: string | undefined;
  status?: OutletStatus | undefined;
  /** Replaces the status word ("Open now" / "Busy" / "Closed"). */
  statusLabel?: string | undefined;
  image?: MenuItemImage | undefined;
  imageLabel?: string | undefined;
  /** `false` gives the compact list form without imagery. */
  hasImage?: boolean | undefined;
  action?: ReactNode | undefined;
  /** The outlet's page. The name becomes a link covering the card, which then lifts on hover. */
  href?: string | undefined;
  linkAs?: LinkAs | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/** One café location — the website locator and the app outlet picker. Status is a StatusDot. */
export function OutletCard({
  name,
  city,
  address,
  hours,
  status = "open",
  statusLabel,
  image,
  imageLabel = "Outlet interior 16:9",
  hasImage = true,
  action,
  href,
  linkAs: LinkComponent = "a",
  headingLevel = 3,
  className,
  ...props
}: OutletCardProps) {
  const styles = outletCard();

  return (
    <Card
      asChild
      padding="none"
      isInteractive={href !== undefined}
      className={styles.root({ className })}
    >
      <article {...props}>
        {hasImage ? (
          <ImageSlot ratio="16:9" radius="none" {...(image ?? { label: imageLabel })} />
        ) : null}
        <div className={styles.body()}>
          <div className={styles.top()}>
            <div className={styles.titles()}>
              {city ? <p className={styles.city()}>{city}</p> : null}
              {/* createElement, not `const Heading = headingTag(…)` (R83): the React Compiler lint reads
                  a capitalised call result as a component created during render. */}
              {createElement(
                headingTag(headingLevel),
                { className: styles.name() },
                href === undefined ? (
                  name
                ) : (
                  <LinkComponent href={href} className={styles.link()} data-stretched-link>
                    {name}
                  </LinkComponent>
                )
              )}
            </div>
            <StatusDot tone={status} label={statusLabel ?? STATUS_WORD[status]} />
          </div>
          {address ? (
            <address className={styles.detail()}>
              <Icon icon={MapPin} size="sm" className={styles.detailIcon()} />
              {address}
            </address>
          ) : null}
          {hours ? (
            <p className={styles.detail()}>
              <Icon icon={Clock} size="sm" className={styles.detailIcon()} />
              {hours}
            </p>
          ) : null}
          {action ? <div className={styles.action()}>{action}</div> : null}
        </div>
      </article>
    </Card>
  );
}
