import type { ComponentProps } from "react";

import { Logo } from "../../atoms/logo/logo";
import { componentVariants } from "../../lib/component-variants";
import { CouponCopyButton } from "./coupon-copy-button";

const couponTicket = componentVariants({
  slots: {
    root: "relative flex w-full items-stretch overflow-hidden rounded-xl text-text-heading shadow-3",
    main: "min-w-0 flex-1",
    logo: "w-auto",
    headline: "mb-0 max-w-none font-display text-balance",
    terms: "mb-0 max-w-text-measure-narrow text-text-muted",
    // The perforation sits exactly between main and stub, whatever the ticket's width. Split, it is
    // a zero-width column with notches on the top and bottom edges; stacked (md below `sm`), a
    // zero-height row with notches on the two side edges. The size variants set which.
    perforation: "relative shrink-0",
    rule: "absolute border-dashed border-border-default",
    notchStart: "absolute top-0 left-0 size-coupon-ticket-notch -translate-1/2 rounded-pill",
    notchEnd: "absolute size-coupon-ticket-notch rounded-pill",
    stub: "grid shrink-0 place-items-center p-5 text-center",
    stubInner: "grid justify-items-center gap-2",
    stubLabel: "font-display text-text-muted uppercase",
    code: "font-mono wrap-anywhere text-text-brand",
    hint: "inline-flex items-center gap-1.5 text-text-muted",
  },
  variants: {
    tone: {
      brand: { root: "bg-surface-brand", stub: "bg-surface-card" },
      light: { root: "border border-border-default bg-surface-card", stub: "bg-surface-page-alt" },
    },
    size: {
      md: {
        // Stacked below `sm`: split at 360px the stub would be too narrow for a mono code.
        root: "max-w-coupon-ticket-md flex-col sm:flex-row",
        perforation: "h-0 sm:h-auto sm:w-0",
        rule: "inset-x-4.5 -top-px border-t-2 sm:inset-x-auto sm:inset-y-4.5 sm:-left-px sm:border-t-0 sm:border-l-2",
        notchEnd:
          "top-0 right-0 translate-x-1/2 -translate-y-1/2 sm:top-auto sm:right-auto sm:bottom-0 sm:left-0 sm:-translate-x-1/2 sm:translate-y-1/2",
        main: "p-6",
        logo: "h-10",
        headline: "mt-4 text-coupon-ticket-headline-md",
        terms: "mt-3 text-body-sm",
        // The stub's corners follow the ticket's, so its inset focus ring is not cut by the clip.
        stub: "rounded-b-xl sm:w-coupon-ticket-stub-md sm:rounded-tr-xl sm:rounded-bl-none",
        stubLabel: "text-overline",
        code: "text-coupon-ticket-code-md",
        hint: "text-caption",
      },
      lg: {
        // Artwork is scaled, never reflowed: always split, whatever the viewport.
        root: "max-w-coupon-ticket-lg",
        perforation: "w-0",
        rule: "inset-y-4.5 -left-px border-l-2",
        notchEnd: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
        main: "p-10",
        logo: "h-17",
        headline: "mt-7 text-coupon-ticket-headline-lg",
        terms: "mt-5 text-body-lg",
        stub: "w-coupon-ticket-stub-lg rounded-r-xl",
        stubLabel: "text-coupon-ticket-stub-label-lg",
        code: "text-coupon-ticket-code-lg",
        hint: "text-body-sm",
      },
    },
    notch: {
      page: { notchStart: "bg-surface-page", notchEnd: "bg-surface-page" },
      tint: { notchStart: "bg-surface-page-alt", notchEnd: "bg-surface-page-alt" },
      sunken: { notchStart: "bg-surface-sunken", notchEnd: "bg-surface-sunken" },
      brand: { notchStart: "bg-surface-brand", notchEnd: "bg-surface-brand" },
    },
    // Press = the system's scale (Button's treatment). The root clips (it cuts the notches), and the
    // stub runs flush to its edges, so the focus ring is drawn inset.
    isCopyable: {
      true: {
        stub: "cursor-pointer transition-control focus-visible:-outline-offset-4 active:press-scale",
      },
      false: {},
    },
  },
});

export interface CouponTicketProps extends Omit<ComponentProps<"div">, "onCopy"> {
  /** Uppercase promo code, set in Space Mono. */
  code: string;
  /** Eight words at most. */
  headline: string;
  /** Full sentences; always state the expiry. */
  terms: string;
  tone?: "brand" | "light" | undefined;
  /** md = 560px (screens), lg = 900px (artwork). The ticket never exceeds its container. */
  size?: "md" | "lg" | undefined;
  /** Colour of the punched notches — match the ground behind the ticket. */
  notch?: "page" | "tint" | "sunken" | "brand" | undefined;
  /** The stub copies the code. `false` for print and PostFrame artboards. */
  isCopyable?: boolean | undefined;
  /** Fires with the code once the clipboard accepted it — pair it with a Snackbar. */
  onCopy?: ((code: string) => void) | undefined;
  codeLabel?: string | undefined;
  copyHint?: string | undefined;
  copiedLabel?: string | undefined;
}

/** Perforated voucher for stories, DMs, table cards and print handouts. */
export function CouponTicket({
  code,
  headline,
  terms,
  tone = "brand",
  size = "md",
  notch = "page",
  isCopyable = true,
  onCopy,
  codeLabel = "Use code",
  copyHint = "Tap to copy",
  copiedLabel = "Copied",
  className,
  ...props
}: CouponTicketProps) {
  const styles = couponTicket({ tone, size, notch, isCopyable });

  return (
    <div data-surface={tone} className={styles.root({ className })} {...props}>
      <div className={styles.main()}>
        <Logo tone={tone === "brand" ? "white" : "pink"} className={styles.logo()} />
        <p className={styles.headline()}>{headline}</p>
        <p className={styles.terms()}>{terms}</p>
      </div>
      <div aria-hidden="true" className={styles.perforation()}>
        <span className={styles.rule()} />
        <span className={styles.notchStart()} />
        <span className={styles.notchEnd()} />
      </div>
      {isCopyable ? (
        <CouponCopyButton
          code={code}
          codeLabel={codeLabel}
          copyHint={copyHint}
          copiedLabel={copiedLabel}
          classNames={{
            root: styles.stub(),
            inner: styles.stubInner(),
            label: styles.stubLabel(),
            code: styles.code(),
            hint: styles.hint(),
          }}
          onCopy={onCopy}
        />
      ) : (
        <div className={styles.stub()}>
          <div className={styles.stubInner()}>
            <span className={styles.stubLabel()}>{codeLabel}</span>
            <span className={styles.code()}>{code}</span>
          </div>
        </div>
      )}
    </div>
  );
}
