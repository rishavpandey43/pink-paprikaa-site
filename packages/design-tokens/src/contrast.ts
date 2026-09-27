/**
 * WCAG 2.x contrast maths for the token contrast policy (design system spec §5).
 *
 * Pure functions over CSS colour strings. Supports the forms the token files use: `#rgb`,
 * `#rrggbb`, `#rrggbbaa`, `rgb()` and `rgba()`. Anything else throws, so a token the policy
 * cannot measure fails loudly instead of being skipped.
 */
export interface Rgba {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
}

const HEX_PATTERN = /^#(?<hex>[\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i;
const RGB_PATTERN =
  /^rgba?\(\s*(?<r>[\d.]+)\s*,\s*(?<g>[\d.]+)\s*,\s*(?<b>[\d.]+)\s*(?:,\s*(?<a>[\d.]+)\s*)?\)$/i;
const OPAQUE_WHITE: Rgba = { r: 255, g: 255, b: 255, a: 1 };

export function parseColor(value: string): Rgba {
  const trimmed = value.trim();

  const hex = HEX_PATTERN.exec(trimmed)?.groups?.hex;
  if (hex !== undefined) {
    const full = hex.length === 3 ? hex.replace(/./g, "$&$&") : hex;
    const channel = (index: number) => Number.parseInt(full.slice(index, index + 2), 16);
    return {
      r: channel(0),
      g: channel(2),
      b: channel(4),
      a: full.length === 8 ? channel(6) / 255 : 1,
    };
  }

  const rgb = RGB_PATTERN.exec(trimmed)?.groups;
  if (rgb?.r !== undefined && rgb.g !== undefined && rgb.b !== undefined) {
    return {
      r: Number(rgb.r),
      g: Number(rgb.g),
      b: Number(rgb.b),
      a: rgb.a === undefined ? 1 : Number(rgb.a),
    };
  }

  throw new Error(
    `parseColor: unsupported colour "${value}" (expected #rgb, #rrggbb, #rrggbbaa, rgb() or rgba())`
  );
}

/** Source-over alpha compositing of `top` onto `bottom`. */
export function composite(top: Rgba, bottom: Rgba): Rgba {
  const alpha = top.a + bottom.a * (1 - top.a);
  if (alpha === 0) {
    return { r: 0, g: 0, b: 0, a: 0 };
  }
  const mix = (upper: number, lower: number) =>
    (upper * top.a + lower * bottom.a * (1 - top.a)) / alpha;
  return { r: mix(top.r, bottom.r), g: mix(top.g, bottom.g), b: mix(top.b, bottom.b), a: alpha };
}

export function relativeLuminance({ r, g, b }: Rgba): number {
  const linear = (channel: number) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/**
 * Contrast of `foreground` over `background`. A translucent background is first composited
 * over `backdrop` (default opaque white) — e.g. a card at 10% white on the brand pink.
 */
export function contrastRatio(foreground: string, background: string, backdrop?: string): number {
  const base =
    backdrop === undefined ? OPAQUE_WHITE : composite(parseColor(backdrop), OPAQUE_WHITE);
  const bg = composite(parseColor(background), base);
  const fg = composite(parseColor(foreground), bg);
  const a = relativeLuminance(fg);
  const b = relativeLuminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
