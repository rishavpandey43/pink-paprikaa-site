/**
 * One entry of `dist/tokens.json` — the catalogue `sd.config.mjs` emits (format `pp/catalogue`).
 * The type lives beside the build that writes the file, so every reader (the contrast policy,
 * Storybook's foundation pages) shares one shape. `theme.spec.ts` asserts the build keeps it.
 */
export interface TokenEntry {
  /** Path joined with `-`, e.g. `color-text-body`. */
  readonly name: string;
  /** `--${name}` — what a consumer puts in `var()`. */
  readonly cssVar: string;
  readonly path: readonly string[];
  /** Resolved value: a CSS string, a number, or a typography composite. */
  readonly value: unknown;
  /** The DTCG alias this token points at (`color.ink.800`), or null for a literal. */
  readonly reference: string | null;
  readonly type: string | null;
  readonly tier: "primitive" | "semantic" | "component" | "surface" | "unknown";
  /** Set on a surface override; null for the base token. */
  readonly surface: "brand" | "ink" | "soft" | "light" | null;
  readonly description: string;
}
