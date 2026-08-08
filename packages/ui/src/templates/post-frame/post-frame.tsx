import type { ComponentPropsWithoutRef, CSSProperties } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";

/**
 * The seven sanctioned marketing canvases, straight off the `--canvas-*` tokens. Nothing is
 * designed at an invented size: a canvas that is not on this list does not exist.
 *
 * | variant     | pixels    | where it runs              |
 * | ----------- | --------- | -------------------------- |
 * | post        | 1080x1080 | feed, 1:1                  |
 * | portrait    | 1080x1350 | feed, 4:5                  |
 * | story       | 1080x1920 | story and reel cover, 9:16 |
 * | landscape   | 1200x628  | link preview / OG image    |
 * | wide        | 1920x1080 | screen and menu board, 16:9|
 * | mpu         | 300x250   | display MPU                |
 * | leaderboard | 728x90    | display leaderboard        |
 */
const postFrame = componentVariants({
  slots: {
    /**
     * The scaled-down box the page actually reserves. It is the canvas size times the display
     * scale, so a preview never punches a hole in the layout around it.
     */
    root: "shrink-0 overflow-hidden",
    /** The true-pixel artboard. Children are authored at canvas size — 1080px thinking. */
    canvas: "relative flex origin-top-left scale-(--pp-canvas-scale) flex-col overflow-hidden",
    safeTop:
      "pointer-events-none absolute inset-x-0 top-0 h-(--canvas-story-safe-top) border-2 border-dashed border-glass-white",
    safeBottom:
      "pointer-events-none absolute inset-x-0 bottom-0 h-(--canvas-story-safe-bottom) border-2 border-dashed border-glass-white",
  },
  variants: {
    variant: {
      post: {
        root: "h-[calc(var(--canvas-post-h)*var(--pp-canvas-scale))] w-[calc(var(--canvas-post-w)*var(--pp-canvas-scale))]",
        canvas: "h-(--canvas-post-h) w-(--canvas-post-w)",
      },
      portrait: {
        root: "h-[calc(var(--canvas-portrait-h)*var(--pp-canvas-scale))] w-[calc(var(--canvas-portrait-w)*var(--pp-canvas-scale))]",
        canvas: "h-(--canvas-portrait-h) w-(--canvas-portrait-w)",
      },
      story: {
        root: "h-[calc(var(--canvas-story-h)*var(--pp-canvas-scale))] w-[calc(var(--canvas-story-w)*var(--pp-canvas-scale))]",
        canvas: "h-(--canvas-story-h) w-(--canvas-story-w)",
      },
      landscape: {
        root: "h-[calc(var(--canvas-landscape-h)*var(--pp-canvas-scale))] w-[calc(var(--canvas-landscape-w)*var(--pp-canvas-scale))]",
        canvas: "h-(--canvas-landscape-h) w-(--canvas-landscape-w)",
      },
      wide: {
        root: "h-[calc(var(--canvas-wide-h)*var(--pp-canvas-scale))] w-[calc(var(--canvas-wide-w)*var(--pp-canvas-scale))]",
        canvas: "h-(--canvas-wide-h) w-(--canvas-wide-w)",
      },
      mpu: {
        root: "h-[calc(var(--canvas-mpu-h)*var(--pp-canvas-scale))] w-[calc(var(--canvas-mpu-w)*var(--pp-canvas-scale))]",
        canvas: "h-(--canvas-mpu-h) w-(--canvas-mpu-w)",
      },
      leaderboard: {
        root: "h-[calc(var(--canvas-leaderboard-h)*var(--pp-canvas-scale))] w-[calc(var(--canvas-leaderboard-w)*var(--pp-canvas-scale))]",
        canvas: "h-(--canvas-leaderboard-h) w-(--canvas-leaderboard-w)",
      },
    },
    /** Canvas padding. `default` is the 72px token; the small display units get their own step. */
    padding: {
      default: { canvas: "p-(--canvas-pad)" },
      tight: { canvas: "p-(--canvas-pad-tight)" },
      none: { canvas: "p-0" },
    },
  },
  compoundVariants: [
    // 72px of padding on a 300x250 unit leaves nothing to design in.
    { variant: "mpu", padding: "default", class: { canvas: "p-5" } },
    { variant: "leaderboard", padding: "default", class: { canvas: "p-5" } },
  ],
  defaultVariants: { variant: "post", padding: "default" },
});

export interface PostFrameProps
  extends ComponentPropsWithoutRef<"div">, VariantProps<typeof postFrame> {
  /**
   * Draw the story chrome guides — the top and bottom bands the app's own UI sits over. Ignored
   * outside `variant="story"`, which is the only canvas that has them.
   */
  hasSafeArea?: boolean | undefined;
  /**
   * Display scale, e.g. `0.2`. The canvas is always authored at true pixels; this only shrinks the
   * preview. Left at 1 the frame renders at full size, which is what an export wants.
   */
  scale?: number | undefined;
}

export function PostFrame({
  children,
  className,
  hasSafeArea = false,
  padding,
  scale = 1,
  style,
  variant,
  ...props
}: PostFrameProps) {
  const { canvas, root, safeBottom, safeTop } = postFrame({ variant, padding });
  // The one thing no token can express: a caller-chosen display scale. It is set as a custom
  // property rather than as a `transform`, so every size decision above stays in a class.
  const scaleStyle = { "--pp-canvas-scale": String(scale), ...style } as CSSProperties;

  return (
    <div className={root({ className })} style={scaleStyle} {...props}>
      <div className={canvas()}>
        {hasSafeArea && variant === "story" ? (
          <>
            <span className={safeTop()} />
            <span className={safeBottom()} />
          </>
        ) : null}
        {children}
      </div>
    </div>
  );
}
