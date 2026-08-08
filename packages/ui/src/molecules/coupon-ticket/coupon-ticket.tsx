"use client";

import type { ComponentPropsWithoutRef } from "react";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

import { Icon } from "../../atoms/icon/icon";
import { Logo } from "../../atoms/logo/logo";
import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { componentVariants, type VariantProps } from "../../lib/component-variants";

const couponTicket = componentVariants({
  slots: {
    /**
     * Stacked below 480px and side by side above it. A voucher that keeps its 70/30 split at 360px
     * leaves the stub about 100px wide, which a monospaced code overruns.
     */
    root: "relative flex w-full flex-col overflow-hidden rounded-5 shadow-elevation3 sm:flex-row",
    body: "min-w-0 flex-1",
    /**
     * Raw type classes rather than the `Text` atom: the ticket runs from a 300px MPU to a 1080px
     * canvas, and no step of the screen ramp spans both ends. Face and weight stay the display
     * ramp's — only the size steps.
     */
    headline: "m-0 font-display font-extrabold text-balance tracking-display2",
    terms: "m-0 max-w-[44ch] font-body leading-body2",
    /**
     * The perforation. Zero-height stacked, zero-width side by side, so the two notches —
     * positioned from its own corners — land exactly on the ticket's edges and are half-clipped
     * by the root's `overflow-hidden`.
     */
    perforation:
      "relative h-0 shrink-0 self-stretch border-t-2 border-dashed sm:h-auto sm:w-0 sm:border-t-0 sm:border-l-2",
    notch: "absolute size-8 rounded-6",
    stub: "relative flex min-h-(--layout-hit-min) shrink-0 items-center justify-center p-6",
    /** The diamond pattern behind the stub — the one texture the brand has. */
    stubPattern: "absolute inset-0 transition-colors duration-(--duration-fast) ease-out",
    stubContent:
      "relative grid justify-items-center gap-2 text-center transition-transform duration-(--duration-instant) ease-out",
    stubLabel: "font-display font-bold uppercase leading-overline tracking-overline",
    code: "font-mono font-bold break-words tracking-mono",
    hint: "inline-flex items-center gap-1-5 font-body",
  },
  variants: {
    /** `brand` is the flooded pink voucher; `light` is the one that prints without eating ink. */
    tone: {
      brand: {
        root: "bg-brand-primary text-text-on-brand",
        perforation: "border-glass-white",
        // Softened so the fine print sits behind the headline rather than competing with it.
        terms: "text-text-on-brand/80",
        code: "text-text-on-brand",
      },
      light: {
        root: "border border-border-subtle bg-surface-card text-text-heading",
        perforation: "border-border-default",
        terms: "text-text-muted",
        code: "text-text-link",
      },
    },
    /** `md` is the screen and DM voucher; `lg` is the 1080px artboard. */
    size: {
      md: {
        root: "max-w-160",
        body: "p-6 sm:p-7",
        headline: "mt-4 text-h1",
        terms: "mt-3 text-body2",
        stub: "sm:w-[32%] sm:min-w-42",
        stubLabel: "text-overline",
        code: "text-h3",
        hint: "text-caption",
      },
      lg: {
        root: "max-w-270",
        body: "p-8 sm:p-12",
        headline: "mt-6 text-display2",
        terms: "mt-5 text-subtitle1",
        stub: "sm:w-[32%] sm:min-w-70",
        stubLabel: "text-subtitle2",
        code: "text-canvas-body",
        hint: "text-subtitle2",
      },
    },
    /** The colour of the two punched notches — match whatever the ticket sits on. */
    position: {
      page: { notch: "bg-surface-page" },
      tint: { notch: "bg-surface-page-alt" },
      sunken: { notch: "bg-surface-sunken" },
    },
    /**
     * Whether the stub is a copy button. Set it false on print artwork and inside an artboard,
     * where nothing is tappable.
     */
    isCopyable: {
      true: { stub: "group cursor-pointer" },
      false: {},
    },
  },
  compoundVariants: [
    // Press is a scale *and* a darkening, together (state contract). The darkening lands on the
    // pattern rather than the button, because the pattern is what paints the stub's ground.
    {
      isCopyable: true,
      tone: "brand",
      class: {
        stubPattern: "group-hover:bg-brand-primary-hover group-active:bg-brand-primary-active",
        stubContent: "group-active:scale-(--motion-press-scale)",
      },
    },
    {
      isCopyable: true,
      tone: "light",
      class: {
        stubPattern: "group-hover:bg-pink-200 group-active:bg-pink-300",
        stubContent: "group-active:scale-(--motion-press-scale)",
      },
    },
  ],
  defaultVariants: { tone: "brand", size: "md", position: "page", isCopyable: true },
});

/** How long the stub's own "Copied" flash stays up. Reinforcement, not the confirmation. */
const COPIED_FLASH_MS = 1800;

/** The wordmark size each ticket size pairs with. */
const LOGO_SIZE = { md: "sm", lg: "md" } as const;

/** The pattern tile each ticket size pairs with, in px. */
const TILE = { md: 44, lg: 72 } as const;

/** The `PatternField` tone each ticket skin pairs with. */
const PATTERN_TONE = { brand: "brand", light: "soft" } as const;

export interface CouponTicketProps
  extends
    Omit<ComponentPropsWithoutRef<"div">, "children" | "onCopy">,
    VariantProps<typeof couponTicket> {
  /** The promo code, uppercase. It sets in Space Mono and is what the copy button writes out. */
  code: string;
  /** The offer in eight words or fewer. */
  headline: string;
  /** Terms in full sentences. Always state the expiry. */
  terms?: string | undefined;
  /**
   * Fires with the copied code. Pair it with a `Snackbar` — the stub's own flash is
   * reinforcement, and a guest who has already looked away needs the toast.
   */
  onCopy?: ((code: string) => void) | undefined;
}

export function CouponTicket({
  className,
  code,
  headline,
  isCopyable = true,
  onCopy,
  position,
  size = "md",
  terms,
  tone = "brand",
  ...props
}: CouponTicketProps) {
  const [isCopied, setIsCopied] = useState(false);
  const parts = couponTicket({ isCopyable, position, size, tone });

  useEffect(() => {
    if (!isCopied) return undefined;
    const timer = setTimeout(() => {
      setIsCopied(false);
    }, COPIED_FLASH_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [isCopied]);

  function handleCopy(): void {
    try {
      // The clipboard is best-effort: an insecure context has no `navigator.clipboard` at all, and
      // a browser may refuse the write. Either way the code stays legible on the stub, so the
      // flash below is still honest.
      void navigator.clipboard.writeText(code).catch(() => undefined);
    } catch {
      // Deliberately silent — see above.
    }
    setIsCopied(true);
    onCopy?.(code);
  }

  const stubGround = (
    <PatternField
      aria-hidden
      className={parts.stubPattern()}
      tile={TILE[size]}
      tone={PATTERN_TONE[tone]}
    />
  );

  const stubContent = (
    <div className={parts.stubContent()}>
      <span className={parts.stubLabel()}>{isCopied ? "Copied" : "Use code"}</span>
      <span className={parts.code()}>{code}</span>
      {isCopyable ? (
        <span className={parts.hint()}>
          <Icon icon={isCopied ? Check : Copy} size="sm" />
          {isCopied ? "Copied" : "Tap to copy"}
        </span>
      ) : null}
    </div>
  );

  return (
    <div className={parts.root({ className })} {...props}>
      <div className={parts.body()}>
        <Logo label="" size={LOGO_SIZE[size]} tone={tone === "brand" ? "white" : "brand"} />
        <p className={parts.headline()}>{headline}</p>
        {terms === undefined ? null : <p className={parts.terms()}>{terms}</p>}
      </div>

      <span aria-hidden className={parts.perforation()}>
        <span className={parts.notch({ class: "-top-4 -left-4" })} />
        <span
          className={parts.notch({
            class: "-top-4 -right-4 sm:top-auto sm:right-auto sm:-bottom-4 sm:-left-4",
          })}
        />
      </span>

      {isCopyable ? (
        <button
          aria-label={`Copy code ${code}`}
          className={parts.stub()}
          onClick={handleCopy}
          type="button"
        >
          {stubGround}
          {stubContent}
        </button>
      ) : (
        <div className={parts.stub()}>
          {stubGround}
          {stubContent}
        </div>
      )}

      {/* The flash is visual; this is what a screen reader hears when the code lands. */}
      <span aria-live="polite" className="sr-only">
        {isCopied ? `Code ${code} copied.` : ""}
      </span>
    </div>
  );
}
