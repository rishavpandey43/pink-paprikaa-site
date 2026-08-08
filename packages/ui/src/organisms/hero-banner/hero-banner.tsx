import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { Fragment } from "react";

import { ImageSlot } from "../../atoms/image-slot/image-slot";
import { SYMBOL_PATHS, SYMBOL_VIEW_BOX } from "../../atoms/logo/logo-paths";
import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { Text } from "../../atoms/text/text";
import { componentVariants, type VariantProps } from "../../lib/component-variants";

const heroBanner = componentVariants({
  slots: {
    root: "w-full",
    inner: [
      "mx-auto grid w-full max-w-(--layout-container-max) items-center",
      "gap-[clamp(32px,4vw,56px)]",
      "px-(--layout-gutter-fluid) py-(--layout-section-y-fluid)",
    ],
    copy: "flex min-w-0 flex-col",
    overline: "mb-4 block",
    title: "",
    body: "mt-5",
    actions: "mt-8 flex flex-wrap items-center gap-3",
    meta: "mt-9 flex flex-wrap items-center gap-4",
    metaItem: "",
    /** The wordmark's diamond, used as the separator between facts — never a bullet or a pipe. */
    diamond: "block size-3 shrink-0",
    media: "relative min-w-0",
    image: "shadow-elevation4",
    /**
     * The brand's bottom legibility scrim, and one of only two gradients in the system. It is
     * painted over a real photograph and nowhere else: over `ImageSlot`'s labelled placeholder it
     * would just dim the note telling a photographer what to shoot.
     */
    scrim:
      "pointer-events-none absolute inset-0 rounded-5 [background-image:var(--effect-scrim-bottom)]",
    caption: "absolute right-6 bottom-6 left-6 text-text-on-inverse",
  },
  variants: {
    /** `brand` floods pink, `ink` floods near-black, `soft` is the pale pink section opener. */
    tone: {
      brand: {
        overline: "text-text-on-brand",
        title: "text-text-on-brand",
        body: "text-text-on-brand",
        metaItem: "text-text-on-brand",
        diamond: "text-text-on-brand",
      },
      ink: {
        overline: "text-text-on-inverse",
        title: "text-text-on-inverse",
        body: "text-text-on-inverse",
        metaItem: "text-text-on-inverse",
        diamond: "text-text-on-inverse",
      },
      soft: {
        overline: "text-text-brand",
        title: "text-text-heading",
        body: "text-text-muted",
        metaItem: "text-text-muted",
        diamond: "text-text-brand",
      },
    },
    /**
     * `split` is copy beside the photograph; the tracks auto-fit so the photo drops under the copy
     * at 360px instead of squeezing the headline. `center` is the stacked opener with no image.
     */
    variant: {
      split: { inner: "grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))]" },
      center: {
        inner: "grid-cols-1 justify-items-center text-center",
        copy: "max-w-(--measure-prose) items-center",
        actions: "justify-center",
        meta: "justify-center",
      },
    },
  },
  defaultVariants: { tone: "brand", variant: "split" },
});

/** The `PatternField` tone each hero tone paints its texture on. */
const FIELD_TONE = { brand: "brand", ink: "ink", soft: "soft" } as const;

export interface HeroBannerProps
  extends Omit<ComponentPropsWithoutRef<"div">, "title">, VariantProps<typeof heroBanner> {
  /** ALL CAPS eyebrow over the headline — two or three words, never a sentence. */
  overline?: string | undefined;
  /** The page's headline. Set in the fluid display step, so it never overflows at 360px. */
  title: ReactNode;
  /** One or two sentences under the headline. */
  body?: string | undefined;
  /** One or two `Button`s. On the `brand` and `ink` tones they must carry `on="brand"`. */
  actions?: ReactNode | undefined;
  /** Short facts, separated by the brand diamond — `["Est. 2019", "Open till 11:30pm"]`. */
  meta?: string[] | undefined;
  /** The hero photograph. Leave it off and the labelled placeholder holds the space. */
  image?: string | undefined;
  /** What the photograph shows. Leave it empty when the headline already says it. */
  imageAlt?: string | undefined;
  /** What photography this hero is waiting for, named as a crop a photographer can act on. */
  imageLabel?: string | undefined;
  /** One short line printed on the photograph, inside the scrim. Needs a real photograph. */
  imageCaption?: string | undefined;
}

/**
 * The band at the top of a marketing page: a flooded, diamond-textured field carrying the page's
 * `h1`, its two actions, and the hero photograph.
 */
export function HeroBanner({
  actions,
  body,
  className,
  image,
  imageAlt = "",
  imageCaption,
  imageLabel = "Hero food photography 4:5",
  meta = [],
  overline,
  title,
  tone = "brand",
  variant,
  ...props
}: HeroBannerProps) {
  const slots = heroBanner({ tone, variant });
  const isCentred = variant === "center";

  return (
    <PatternField
      className={slots.root({ className })}
      tile={86}
      tone={FIELD_TONE[tone]}
      {...props}
    >
      <div className={slots.inner()}>
        <div className={slots.copy()}>
          {overline === undefined ? null : (
            <Text as="p" className={slots.overline()} variant="overline">
              {overline}
            </Text>
          )}

          <Text as="h1" className={slots.title()} isFluid variant="display1">
            {title}
          </Text>

          {body === undefined ? null : (
            <Text className={slots.body()} measure="prose" variant="body1">
              {body}
            </Text>
          )}

          {actions === undefined ? null : <div className={slots.actions()}>{actions}</div>}

          {meta.length === 0 ? null : (
            <div className={slots.meta()}>
              {meta.map((fact, index) => (
                <Fragment key={fact}>
                  {index === 0 ? null : (
                    <svg
                      aria-hidden
                      className={slots.diamond()}
                      fill="currentColor"
                      viewBox={SYMBOL_VIEW_BOX}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {SYMBOL_PATHS.map((d) => (
                        <path d={d} key={d} />
                      ))}
                    </svg>
                  )}
                  <Text as="span" className={slots.metaItem()} variant="body2">
                    {fact}
                  </Text>
                </Fragment>
              ))}
            </div>
          )}
        </div>

        {isCentred ? null : (
          <div className={slots.media()}>
            <ImageSlot
              alt={imageAlt}
              className={slots.image()}
              label={imageLabel}
              radius="sheet"
              ratio="4:5"
              tone={tone === "soft" ? "strong" : "soft"}
              // `exactOptionalPropertyTypes`: an optional prop cannot be handed an explicit
              // `undefined`, so the photograph is spread in only once there is one.
              {...(image === undefined ? {} : { src: image })}
            />
            {image === undefined ? null : (
              <>
                <div className={slots.scrim()} />
                {imageCaption === undefined ? null : (
                  <Text as="p" className={slots.caption()} variant="subtitle2">
                    {imageCaption}
                  </Text>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </PatternField>
  );
}
