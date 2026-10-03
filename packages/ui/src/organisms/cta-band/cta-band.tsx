import type { ReactNode } from "react";

import type { BaseProps } from "../../lib/common-props";

import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { Typography } from "../../atoms/typography/typography";
import { SURFACE_DATA } from "../../lib/common-props";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { isShown } from "../../lib/is-shown";
import { withSx } from "../../lib/sx";

const ctaBand = componentVariants({
  slots: {
    root: "relative",
    // A decorative layer only: the band's own ground (or a caller's) shows through it.
    pattern: "absolute inset-0 bg-transparent",
    inner: "relative container-page flex flex-wrap gap-8 py-cta-band-y",
    copy: "flex min-w-0 flex-col gap-2.5",
    action: "flex shrink-0 flex-wrap items-center gap-2.5",
  },
  variants: {
    surface: {
      ink: { root: "bg-surface-inverse" },
      brand: { root: "bg-surface-brand" },
      soft: { root: "bg-surface-brand-soft" },
    },
    align: {
      split: { inner: "items-end justify-between", copy: "max-w-cta-band-copy" },
      center: {
        inner: "flex-col items-center text-center",
        copy: "max-w-text-measure-narrow items-center",
        action: "justify-center",
      },
    },
  },
  defaultVariants: { surface: "ink", align: "split" },
});

export interface CtaBandProps
  extends
    Omit<BaseProps<"section">, "title">,
    Pick<VariantProps<typeof ctaBand>, "surface" | "align"> {
  overline?: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  /** One or two Buttons — `<Button asChild><a …/></Button>`. */
  action?: ReactNode;
  /** The tiled diamond behind the band; `faint` is the handoff's 4% ink sections (spec C7). */
  pattern?: "none" | "default" | "faint" | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/**
 * The band that closes a page — one per page, never two. Paints its own field (ink, brand or
 * soft) and sets that surface, so the heading, body and buttons inside need no colour props.
 */
export function CtaBand({
  overline,
  title,
  body,
  action,
  surface = "ink",
  align,
  pattern = "default",
  headingLevel = 2,
  sx,
  className,
  ...props
}: CtaBandProps) {
  const slots = ctaBand({ surface, align });
  return (
    <section
      data-surface={SURFACE_DATA[surface]}
      className={slots.root({ className: withSx(sx, className) })}
      {...props}
    >
      {pattern === "none" ? null : (
        <PatternField
          aria-hidden
          surface={surface}
          tile={72}
          density={pattern}
          className={slots.pattern()}
        />
      )}
      <div className={slots.inner()}>
        <div className={slots.copy()}>
          {isShown(overline) ? (
            <Typography variant="overline" color="brand">
              {overline}
            </Typography>
          ) : null}
          <Typography as={headingTag(headingLevel)} variant="h2" isFluid isBalanced>
            {title}
          </Typography>
          {isShown(body) ? (
            <Typography variant="body-lg" color="muted">
              {body}
            </Typography>
          ) : null}
        </div>
        {isShown(action) ? <div className={slots.action()}>{action}</div> : null}
      </div>
    </section>
  );
}
