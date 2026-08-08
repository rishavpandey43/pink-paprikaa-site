import type { ComponentPropsWithoutRef } from "react";

import { Logo } from "../../atoms/logo/logo";
import { componentVariants, type VariantProps } from "../../lib/component-variants";

const logoLockup = componentVariants({
  slots: {
    root: "grid",
    /**
     * The `Logo` atom sizes its mark by height, and its three heights (28 / 40 / 56px) all sit
     * under the 140px minimum wordmark width the brand guide sets — the atom is built for a
     * 72px header bar, this is built for artwork. So the lockup re-heights the mark through a
     * child selector, and pins the floor structurally with `min-w-35` rather than leaving it
     * to a comment nobody reads. The wordmark is ~1.9:1, so every height below clears 140px on
     * its own and the floor never actually engages.
     */
    mark: "[&>svg]:min-w-35",
    /**
     * Raw type classes rather than the `Text` atom: the tagline is an overline whose size steps
     * with the mark, and the ramp's `overline` step is a single fixed 11.5px — it would read as
     * fine print under a 128px wordmark.
     */
    tagline: "font-display font-bold uppercase leading-overline tracking-overline",
  },
  variants: {
    /**
     * `white` is the only tone that survives a pink, ink or dark photographic ground. The tagline
     * is held slightly back from the wordmark so the two do not compete.
     */
    tone: {
      brand: { tagline: "text-text-brand" },
      white: { tagline: "text-text-on-brand/86" },
    },
    /** Mark heights 80 / 96 / 128px — wordmark widths of roughly 152 / 183 / 243px. */
    size: {
      sm: { root: "gap-3", mark: "[&>svg]:h-20", tagline: "text-caption" },
      md: { root: "gap-4", mark: "[&>svg]:h-24", tagline: "text-body2" },
      lg: { root: "gap-6", mark: "[&>svg]:h-32", tagline: "text-subtitle2" },
    },
    align: {
      start: { root: "justify-items-start text-left" },
      center: { root: "justify-items-center text-center" },
    },
    /**
     * The exclusion zone: clear space around the lockup equals the height of the "P", which is
     * roughly 70% of the mark's own height. Turn it off only when the parent already reserves the
     * space — an artboard with `--canvas-pad`, for instance.
     */
    hasClearSpace: { true: {}, false: {} },
  },
  compoundVariants: [
    { hasClearSpace: true, size: "sm", class: { root: "p-14" } },
    { hasClearSpace: true, size: "md", class: { root: "p-16" } },
    { hasClearSpace: true, size: "lg", class: { root: "p-24" } },
  ],
  defaultVariants: { tone: "brand", size: "md", align: "start", hasClearSpace: true },
});

/**
 * The signature line, set once. Never re-type it at an arbitrary size — that is the whole reason
 * this component exists.
 */
const DEFAULT_TAGLINE = "India’s First Desi Urban Café";

export interface LogoLockupProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children">, VariantProps<typeof logoLockup> {
  /** Override the signature line. Leave it alone unless the artwork calls for the other one. */
  tagline?: string | undefined;
  /** Drop the tagline and leave the wordmark on its own — the shape an ad artboard uses. */
  hasTagline?: boolean | undefined;
  /**
   * Accessible name for the mark. Pass an empty string when the artwork already names the brand
   * in nearby text, so it is not announced twice.
   */
  label?: string | undefined;
}

export function LogoLockup({
  align,
  className,
  hasClearSpace,
  hasTagline = true,
  // Both defaults are restated here rather than left to `defaultVariants`, which only decides
  // classes: `Logo` needs a real value for each, and the package forbids passing `undefined` into
  // an optional prop (`exactOptionalPropertyTypes`).
  label = "Pink Paprikaa",
  size,
  tagline = DEFAULT_TAGLINE,
  tone = "brand",
  ...props
}: LogoLockupProps) {
  const parts = logoLockup({ align, hasClearSpace, size, tone });
  return (
    <div className={parts.root({ className })} {...props}>
      <Logo className={parts.mark()} label={label} tone={tone} variant="wordmark" />
      {hasTagline ? <span className={parts.tagline()}>{tagline}</span> : null}
    </div>
  );
}
