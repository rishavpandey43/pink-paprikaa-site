import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { Clock, MapPin } from "lucide-react";

import { Card } from "../../atoms/card/card";
import { Icon } from "../../atoms/icon/icon";
import { ImageSlot } from "../../atoms/image-slot/image-slot";
import { StatusDot } from "../../atoms/status-dot/status-dot";
import { Text } from "../../atoms/text/text";
import { componentVariants } from "../../lib/component-variants";

const outletCard = componentVariants({
  slots: {
    // `relative` anchors the stretched link below; `h-full` lets a row of cards in the locator grid
    // share one height instead of stepping down as addresses get shorter.
    root: "relative flex h-full flex-col",
    body: "flex min-w-0 flex-1 flex-col gap-2.5 p-5",
    // Wraps rather than truncates: at 360px the status mark drops under a long outlet name.
    header: "flex min-w-0 flex-wrap items-start justify-between gap-3",
    heading: "flex min-w-0 flex-col gap-1",
    /**
     * The whole card is the link's hit area. The anchor stays a real, focusable, keyboard-reachable
     * element in the accessibility tree — which a click handler hung on the card would not be.
     */
    link: "after:absolute after:inset-0 after:content-['']",
    detail: "flex min-w-0 items-start gap-2 text-text-muted",
    // The glyph sits on the first line's cap height rather than centred on a wrapped block.
    detailIcon: "mt-0.5",
    // `z-1` keeps the action clickable above the stretched link's overlay.
    action: "relative z-1 mt-1",
  },
});

/** What each state is called when the caller does not write the line itself. */
const STATUS_LABEL = { open: "Open now", busy: "Busy", closed: "Closed" } as const;

export interface OutletCardProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /**
   * Draws the photograph above the details. Turn it off for the compact list row — the picker
   * inside a sheet, where four outlets have to fit above the fold.
   */
  hasImage?: boolean | undefined;
  /** The outlet, named the way people say it out loud — "Sector 57", not "Store 004". */
  name: string;
  /**
   * The element the outlet name renders as. A heading by default, so the locator reads as a
   * document outline; drop to `"p"` inside something that already owns the heading level.
   */
  nameAs?: ElementType | undefined;
  /** The city above the name, set as an overline. */
  city?: string | undefined;
  /** Street address, as a person would repeat it to a driver. */
  address?: string | undefined;
  /** Trading hours, 12-hour and lowercase: `8am – 11:30pm`. */
  hours?: string | undefined;
  /** Trading state. It is a `StatusDot` and never a coloured pill. */
  status?: "open" | "busy" | "closed" | undefined;
  /** Overrides the state text — "Open till 11:30pm", "Closed for Holi". */
  statusLabel?: string | undefined;
  /** The outlet photograph. Leave it off and the labelled placeholder holds the space. */
  image?: string | undefined;
  /** What the photograph shows. Leave it empty when the outlet name already says it. */
  imageAlt?: string | undefined;
  /** What photography this card is waiting for, named as a crop a photographer can act on. */
  imageLabel?: string | undefined;
  /** The outlet's own page. Passing it turns the whole card into one link and adds the hover lift. */
  href?: string | undefined;
  /** A secondary control under the details — Directions, Call. It sits above the stretched link. */
  action?: ReactNode | undefined;
}

export function OutletCard({
  name,
  nameAs = "h3",
  city,
  address,
  hours,
  status = "open",
  statusLabel,
  image,
  imageAlt = "",
  imageLabel = "Outlet interior 16:9",
  href,
  action,
  hasImage = true,
  className,
  ...props
}: OutletCardProps) {
  const slots = outletCard();
  return (
    <Card
      className={slots.root({ className })}
      isInteractive={href !== undefined}
      padding="none"
      {...props}
    >
      {hasImage ? (
        <ImageSlot alt={imageAlt} label={imageLabel} radius="none" ratio="16:9" src={image} />
      ) : null}
      <div className={slots.body()}>
        <div className={slots.header()}>
          <div className={slots.heading()}>
            {city === undefined ? null : (
              <Text tone="brand" variant="overline">
                {city}
              </Text>
            )}
            <Text as={nameAs} variant="subtitle1">
              {href === undefined ? (
                name
              ) : (
                <a className={slots.link()} href={href}>
                  {name}
                </a>
              )}
            </Text>
          </div>
          <StatusDot label={statusLabel ?? STATUS_LABEL[status]} size="sm" tone={status} />
        </div>
        {address === undefined ? null : (
          <p className={slots.detail()}>
            <Icon className={slots.detailIcon()} icon={MapPin} size="sm" />
            <Text as="span" tone="muted" variant="body2">
              {address}
            </Text>
          </p>
        )}
        {hours === undefined ? null : (
          <p className={slots.detail()}>
            <Icon className={slots.detailIcon()} icon={Clock} size="sm" />
            <Text as="span" tone="muted" variant="body2">
              {hours}
            </Text>
          </p>
        )}
        {action === undefined ? null : <div className={slots.action()}>{action}</div>}
      </div>
    </Card>
  );
}
