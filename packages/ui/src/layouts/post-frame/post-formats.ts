/** The seven marketing canvases (readme §4b) — the only sizes an asset may be designed at. */
export type PostFormat =
  "post" | "portrait" | "story" | "landscape" | "wide" | "mpu" | "leaderboard";

/**
 * Canvas sizes in px, mirrored from the `--canvas-*` tokens. `post-formats.spec.ts` asserts they
 * equal the token build, so the two cannot drift. PostFrame needs them as numbers to size its
 * scaled box; the package ships no token payload at runtime.
 */
export const POST_FORMATS: Readonly<
  Record<PostFormat, { width: number; height: number; label: string }>
> = {
  post: { width: 1080, height: 1080, label: "Feed 1:1" },
  portrait: { width: 1080, height: 1350, label: "Feed 4:5" },
  story: { width: 1080, height: 1920, label: "Story 9:16" },
  landscape: { width: 1200, height: 628, label: "Link / OG" },
  wide: { width: 1920, height: 1080, label: "Screen 16:9" },
  mpu: { width: 300, height: 250, label: "MPU" },
  leaderboard: { width: 728, height: 90, label: "Leaderboard" },
};

/**
 * The on-screen box for a canvas shown at `scale`. A zero, negative or non-finite scale throws: an
 * empty or mirrored board is a bug, not a layout.
 */
export function scaledSize(format: PostFormat, scale: number): { width: number; height: number } {
  if (!Number.isFinite(scale) || scale <= 0) {
    throw new RangeError(
      `PostFrame: scale must be a positive, finite number, got ${String(scale)}`
    );
  }
  const { width, height } = POST_FORMATS[format];
  return { width: width * scale, height: height * scale };
}
