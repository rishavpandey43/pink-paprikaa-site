import { type ComponentProps, useId } from "react";

import { ARTWORK, type Mark } from "../../lib/brand-artwork";
import { componentVariants, type VariantProps } from "../../lib/component-variants";

const logo = componentVariants({
  base: "inline-block h-auto shrink-0",
  variants: {
    variant: { lockup: "w-logo-lockup", wordmark: "w-logo-wordmark", symbol: "w-logo-symbol" },
    tone: { pink: "text-pink-500", white: "text-ink-000", badge: "" },
  },
  defaultVariants: { variant: "lockup", tone: "pink" },
});

/** Badge plate: the artwork sits centred on a 100×100 pink square at the design system's inset. */
const BADGE_ARTWORK_WIDTH: Readonly<Record<Mark, number>> = {
  lockup: 76,
  wordmark: 76,
  symbol: 60,
};
const DEFAULT_TITLE: Readonly<Record<Mark, string>> = {
  lockup: "Pink Paprikaa — India's First Desi Urban Café",
  wordmark: "Pink Paprikaa",
  symbol: "Pink Paprikaa",
};

export interface LogoProps
  extends Omit<ComponentProps<"svg">, "children" | "viewBox">, VariantProps<typeof logo> {
  /** Accessible name. Defaults to the brand name (with the tagline for the lockup). */
  title?: string;
  /** Hide from assistive tech when a visible brand name sits beside it. */
  isDecorative?: boolean;
}

/**
 * The brand marks. `lockup` (with the drawn tagline) is the default everywhere; `wordmark` only
 * below ~120px wide; `symbol` is the diamond mark. Tones: `pink` on light, `white` on pink or ink,
 * `badge` on its own pink plate. Size it with width classes (`w-50`); height follows the artwork.
 *
 * The markup is the build-time artwork compiled from the committed SVGs — never user input — so
 * `dangerouslySetInnerHTML` is safe here.
 */
export function Logo({
  variant = "lockup",
  tone = "pink",
  title,
  isDecorative = false,
  className,
  ...props
}: LogoProps) {
  const mark: Mark = variant;
  const artwork = ARTWORK[mark];
  const instance = useId().replace(/[^\w-]/g, "");
  const markup = artwork.markup.replaceAll("__ID__", `${instance}-`);
  const a11y = isDecorative
    ? { "aria-hidden": true as const }
    : { role: "img", "aria-label": title ?? DEFAULT_TITLE[mark] };

  if (tone === "badge") {
    const width = BADGE_ARTWORK_WIDTH[mark];
    const height = (width * artwork.height) / artwork.width;
    return (
      <svg
        viewBox="0 0 100 100"
        className={logo({ variant, tone, className })}
        {...a11y}
        {...props}
      >
        <rect width="100" height="100" className="fill-pink-500" />
        <svg
          x={(100 - width) / 2}
          y={(100 - height) / 2}
          width={width}
          height={height}
          viewBox={artwork.viewBox}
          className="text-ink-000"
          dangerouslySetInnerHTML={{ __html: markup }}
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox={artwork.viewBox}
      className={logo({ variant, tone, className })}
      {...a11y}
      {...props}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
