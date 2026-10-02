import type { ComponentProps, ReactNode } from "react";

import type { LinkAs } from "../../lib/link-as";

import { Countdown } from "../../atoms/countdown/countdown";
import { componentVariants } from "../../lib/component-variants";
import { AnnouncementExpiry } from "./announcement-expiry";

const announcementBar = componentVariants({
  slots: {
    root: "bg-surface-brand text-text-body",
    content: "flex flex-wrap items-center justify-center gap-2 px-4 py-2 text-center text-caption",
    link: "text-inherit no-underline hover:underline",
  },
});

export interface AnnouncementBarProps extends Omit<ComponentProps<"div">, "children"> {
  /** The message. Bold the offer with `<strong>`. */
  children: ReactNode;
  /** Makes the whole strip one link. */
  href?: string | undefined;
  /** ISO 8601 with an offset. Shows a countdown, and the bar renders nothing once it passes. */
  endsAt?: string | undefined;
  /**
   * Accessible prefix for the countdown, e.g. "Launch price closes in". Omit it when the message
   * already leads into the countdown ("… · closes in"), or a screen reader hears it twice.
   */
  countdownLabel?: string | undefined;
  linkAs?: LinkAs | undefined;
}

function toEpochMs(endsAt: string): number {
  const time = Date.parse(endsAt);
  if (Number.isNaN(time)) {
    throw new RangeError(
      `AnnouncementBar: endsAt "${endsAt}" is not a date — use ISO 8601 with an offset`
    );
  }
  return time;
}

/** The brand launch strip above the site header, optionally counting down to its end. */
export function AnnouncementBar({
  children,
  href,
  endsAt,
  countdownLabel,
  linkAs: LinkComponent = "a",
  className,
  ...props
}: AnnouncementBarProps) {
  const styles = announcementBar();
  const content = (
    <>
      <span>{children}</span>
      {endsAt === undefined ? null : <Countdown endsAt={endsAt} label={countdownLabel} />}
    </>
  );
  const bar = (
    <div data-surface="brand" className={styles.root({ className })} {...props}>
      {href === undefined ? (
        <div className={styles.content()}>{content}</div>
      ) : (
        <LinkComponent href={href} className={styles.content({ className: styles.link() })}>
          {content}
        </LinkComponent>
      )}
    </div>
  );

  if (endsAt === undefined) return bar;
  return <AnnouncementExpiry endsAt={toEpochMs(endsAt)}>{bar}</AnnouncementExpiry>;
}
