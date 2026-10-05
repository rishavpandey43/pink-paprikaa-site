import type { CSSProperties } from "react";

import type { BaseProps } from "../../lib/common-props";

import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";
import { POST_FORMATS, type PostFormat, scaledSize } from "./post-formats";
import { PostFrameScaler } from "./post-frame-scaler";

const postFrame = componentVariants({
  slots: {
    // shrink-0 + overflow-hidden: the frame occupies exactly the scaled box and clips the canvas's
    // untransformed 1080px layout box, so nothing leaks into the parent's layout.
    base: "relative shrink-0 overflow-hidden",
    scaler: "origin-top-left",
    canvas: "relative flex flex-col overflow-hidden",
    safeTop:
      "pointer-events-none absolute inset-x-0 top-0 h-story-safe-top outline-2 -outline-offset-2 outline-border-default outline-dashed",
    safeBottom:
      "pointer-events-none absolute inset-x-0 bottom-0 h-story-safe-bottom outline-2 -outline-offset-2 outline-border-default outline-dashed",
  },
  variants: {
    isFit: { true: { base: "w-full" } },
    surface: {
      brand: { canvas: "bg-surface-brand" },
      ink: { canvas: "bg-surface-inverse" },
      soft: { canvas: "bg-surface-brand-soft" },
      page: { canvas: "bg-surface-page" },
      alt: { canvas: "bg-surface-page-alt" },
    },
    padding: { none: { canvas: "p-0" }, default: {}, tight: { canvas: "p-canvas-pad-tight" } },
    format: {
      post: {},
      portrait: {},
      story: {},
      landscape: {},
      wide: {},
      mpu: {},
      leaderboard: {},
    },
  },
  compoundVariants: [
    // Readme §4b safe margins: 72px on 1080 canvases (and the 1920 screen), 48px on 1200×628;
    // display ads take PostFrame.jsx's 20px.
    {
      padding: "default",
      format: ["post", "portrait", "story", "wide"],
      class: { canvas: "p-canvas-pad" },
    },
    { padding: "default", format: "landscape", class: { canvas: "p-canvas-pad-tight" } },
    { padding: "default", format: ["mpu", "leaderboard"], class: { canvas: "p-5" } },
  ],
});

type PostFrameSurface = "brand" | "ink" | "soft" | "page" | "alt";

/** The data-surface each board surface establishes: `alt` (pink-50) is a light field, like `page`. */
const SURFACE = {
  brand: "brand",
  ink: "ink",
  soft: "soft",
  page: "light",
  alt: "light",
} as const satisfies Record<PostFrameSurface, "brand" | "ink" | "soft" | "light">;

interface PostFrameBaseProps extends BaseProps<"div"> {
  /** post 1080² · portrait 1080×1350 · story 1080×1920 · landscape 1200×628 · wide 1920×1080 · mpu 300×250 · leaderboard 728×90. */
  format: PostFormat;
  /** The board's field: brand · ink · soft (pink-100) · page (white) · alt (pink-50). Sets data-surface. */
  surface?: PostFrameSurface | undefined;
  /** Canvas padding: `default` is the format's safe margin, `tight` 48px, `none` 0. */
  padding?: "none" | "default" | "tight" | undefined;
  /** Draw the story chrome guides (story format only): keep the top 250px and bottom 320px clear. */
  hasSafeArea?: boolean | undefined;
}

/** Either a fixed display `scale` (e.g. 0.32), or `isFit` to scale to the parent's width — never both. */
export type PostFrameProps = PostFrameBaseProps &
  ({ scale?: number | undefined; isFit?: false | undefined } | { isFit: true; scale?: never });

/**
 * A fixed-pixel marketing artboard (post, story, banner) that scales for preview. Children are
 * authored at true canvas pixels — the canvas type scale, never screen sizes.
 */
export function PostFrame({
  format,
  scale = 1,
  isFit = false,
  surface = "page",
  padding = "default",
  hasSafeArea = false,
  sx,
  className,
  style,
  children,
  ...props
}: PostFrameProps) {
  const { width, height } = POST_FORMATS[format];
  const slots = postFrame({ format, surface, padding, isFit });
  // A fit frame is fluid (full width, canvas aspect ratio, never wider than the canvas); a scaled
  // frame is exactly the canvas times the scale. Both are computed numbers, so they are inline.
  const frameSize: CSSProperties = isFit
    ? { maxWidth: width, aspectRatio: `${String(width)} / ${String(height)}` }
    : scaledSize(format, scale);

  const canvas = (
    <div data-surface={SURFACE[surface]} className={slots.canvas()} style={{ width, height }}>
      {hasSafeArea && format === "story" ? (
        <>
          <div aria-hidden className={slots.safeTop()} />
          <div aria-hidden className={slots.safeBottom()} />
        </>
      ) : null}
      {children}
    </div>
  );

  return (
    <div
      className={slots.base({ className: withSx(sx, className) })}
      style={{ ...style, ...frameSize }}
      {...props}
    >
      {isFit ? (
        <PostFrameScaler width={width} className={slots.scaler()}>
          {canvas}
        </PostFrameScaler>
      ) : (
        <div className={slots.scaler()} style={{ transform: `scale(${String(scale)})` }}>
          {canvas}
        </div>
      )}
    </div>
  );
}
