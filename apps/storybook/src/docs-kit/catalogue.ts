import type { TokenEntry } from "@pink-paprikaa-web/design-tokens/catalogue";

import { parseColor } from "@pink-paprikaa-web/design-tokens/contrast";
import catalogue from "@pink-paprikaa-web/design-tokens/tokens.json";

export type { TokenEntry } from "@pink-paprikaa-web/design-tokens/catalogue";

/**
 * Foundation pages ask for tokens by name or prefix and never retype a value. Every lookup throws
 * when nothing matches, so a renamed or removed token fails `storybook:test` on the specimen that
 * asked for it — it can never render as an empty swatch.
 */
export const CATALOGUE: readonly TokenEntry[] = catalogue;

export type Surface = NonNullable<TokenEntry["surface"]>;
export type Tier = Exclude<TokenEntry["tier"], "unknown">;

/** Which tokens a helper shows: base tokens with a prefix, an explicit list, or a surface's overrides. */
export type TokenSelection =
  | { readonly prefix: string; readonly tier?: Tier }
  | { readonly names: readonly string[] }
  | { readonly surface: Surface };

export interface TypographyValue {
  readonly fontSize: string;
  readonly lineHeight?: number | string;
  readonly letterSpacing?: string;
  readonly fontWeight?: number | string;
}

function notFound(what: string): Error {
  return new Error(
    `docs-kit: ${what} in @pink-paprikaa-web/design-tokens/tokens.json. A token was renamed or removed — update the page that asks for it; never retype its value.`
  );
}

/** The token called `name` — its base value, or its override on `surface`. */
export function token(name: string, surface?: Surface): TokenEntry {
  const wanted = surface ?? null;
  const entry = CATALOGUE.find(
    (candidate) => candidate.name === name && candidate.surface === wanted
  );
  if (entry === undefined) {
    throw notFound(
      `no token "${name}"${surface === undefined ? "" : ` on the ${surface} surface`}`
    );
  }
  return entry;
}

const BUILD_ORDER = new Map(CATALOGUE.map((entry, index) => [entry, index]));
const INTEGER = /^\d+$/;

/**
 * Build order, except that sibling steps with numeric names sort by number. The catalogue lists
 * integer-like keys first (JavaScript object key order), so `ink-000` would follow `ink-900` and
 * `white-alpha-06` would follow `white-alpha-92` without this.
 */
function byStep(a: TokenEntry, b: TokenEntry): number {
  const depth = Math.min(a.path.length, b.path.length);
  for (let index = 0; index < depth; index += 1) {
    const left = a.path[index] ?? "";
    const right = b.path[index] ?? "";
    if (left === right) continue;
    if (INTEGER.test(left) && INTEGER.test(right)) return Number(left) - Number(right);
    break;
  }
  return (BUILD_ORDER.get(a) ?? 0) - (BUILD_ORDER.get(b) ?? 0);
}

/** Base tokens whose name starts with `prefix` (optionally one tier), numeric steps in order. */
export function tokensWithPrefix(prefix: string, tier?: Tier): readonly TokenEntry[] {
  const entries = CATALOGUE.filter(
    (entry) =>
      entry.surface === null &&
      entry.name.startsWith(prefix) &&
      (tier === undefined || entry.tier === tier)
  );
  if (entries.length === 0) {
    throw notFound(`no ${tier ?? "base"} token starts with "${prefix}"`);
  }
  return [...entries].sort(byStep);
}

/** Every token a surface redefines, numeric steps in order. */
export function surfaceOverrides(surface: Surface): readonly TokenEntry[] {
  const entries = CATALOGUE.filter((entry) => entry.surface === surface);
  if (entries.length === 0) {
    throw notFound(`the ${surface} surface overrides nothing`);
  }
  return [...entries].sort(byStep);
}

export function selectTokens(selection: TokenSelection): readonly TokenEntry[] {
  if ("names" in selection) return selection.names.map((name) => token(name));
  if ("surface" in selection) return surfaceOverrides(selection.surface);
  return tokensWithPrefix(selection.prefix, selection.tier);
}

function isTypography(value: unknown): value is TypographyValue {
  return typeof value === "object" && value !== null && "fontSize" in value;
}

/** A value as the docs print it; a typography composite as `size / line-height / tracking / weight`. */
export function formatValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (isTypography(value)) {
    return [value.fontSize, value.lineHeight, value.letterSpacing, value.fontWeight]
      .filter((part) => part !== undefined)
      .map(String)
      .join(" / ");
  }
  throw new Error(`docs-kit: cannot print the token value ${JSON.stringify(value)}`);
}

/** A single-value token as a CSS string (colours, lengths, durations, easings). */
export function cssValue(name: string): string {
  const { value } = token(name);
  if (typeof value !== "string" && typeof value !== "number") {
    throw new Error(`docs-kit: "${name}" is a composite token, not a single CSS value`);
  }
  return String(value);
}

/** The composite of a `text-*` token. */
export function typographyOf(name: string): TypographyValue {
  const { value } = token(name);
  if (!isTypography(value)) {
    throw new Error(`docs-kit: "${name}" is not a typography token`);
  }
  return value;
}

/** An opaque colour token as the browser reports a computed colour: `rgb(r, g, b)`. */
export function rgbOf(name: string): string {
  const { r, g, b } = parseColor(cssValue(name));
  return `rgb(${String(r)}, ${String(g)}, ${String(b)})`;
}

/** The stock spacing utilities for step N of the 4px scale (`--spacing` × N). */
const SPACING_UTILITIES = ["p", "m", "mt", "gap"] as const;

export function stepUtilities(step: number): readonly string[] {
  return SPACING_UTILITIES.map((utility) => `${utility}-${String(step)}`);
}

/**
 * `styles.css` names the two motion utilities by what they do, not by their token (`lift` reads
 * `--motion-lift-y`); `motion-reveal-distance` is read only by RevealObserver's CSS.
 */
const MOTION_UTILITIES: Readonly<Record<string, readonly string[]>> = {
  "press-scale": ["press-scale"],
  "lift-y": ["lift"],
};

/** Tailwind 4 has no 1px step name: `border` is 1px, `border-N` is N px. */
function borderWidthClass(entry: TokenEntry): string {
  const px = Number.parseFloat(formatValue(entry.value));
  return px === 1 ? "border" : `border-${String(px)}`;
}

/**
 * A named spacing token's utilities. A sizing token carries a marker in its token JSON naming what
 * the library uses it as — `size-icon-sm`, `h-button-h-md` — and the marker wins (R61; the
 * `catalogue.spec.ts` node spec keeps each marker equal to the library's real usage). An unmarked
 * measure (a `ch` value) caps a line length, so it is only a `max-w-*` (R59); anything else is
 * padding, margin or a gap.
 */
function spacingUtilities(step: string, entry: TokenEntry): readonly string[] {
  const marker = entry.extensions?.["pink-paprikaa"]?.utility;
  if (marker !== undefined) return marker.map((utility) => `${utility}-${step}`);
  if (formatValue(entry.value).endsWith("ch")) return [`max-w-${step}`];
  return SPACING_UTILITIES.map((utility) => `${utility}-${step}`);
}

/**
 * Tailwind's static `max-w-prose` (65ch) shadows `--container-prose`, so a container that a
 * spacing token aliases — the prose measures — is reached through that alias
 * (`max-w-text-measure-prose`); every other container is a plain `max-w-*`.
 */
function containerUtilities(step: string, entry: TokenEntry): readonly string[] {
  const reference = entry.path.join(".");
  const alias = CATALOGUE.find(
    (candidate) =>
      candidate.surface === null &&
      candidate.name.startsWith("spacing-") &&
      candidate.reference === reference
  );
  return alias === undefined ? [`max-w-${step}`] : utilitiesOf(alias.name);
}

/**
 * Each token namespace and the utilities it feeds — Tailwind 4's theme namespaces, plus the
 * `@utility` rules in `packages/ui/src/styles.css` for the namespaces Tailwind does not own
 * (`duration-*`, `z-*`, `pattern-*`, `scrim-*`, the motion pair) — `catalogue.spec.ts` fails if
 * one of those classes has no `@utility`. First match wins, so `font-weight-` precedes `font-`;
 * an effect other than a scrim has no utility.
 */
const UTILITY_RULES: readonly (readonly [
  prefix: string,
  classes: (step: string, entry: TokenEntry) => readonly string[],
])[] = [
  ["color-", (step) => [`bg-${step}`, `text-${step}`, `border-${step}`]],
  ["font-weight-", (step) => [`font-${step}`]],
  ["font-", (step) => [`font-${step}`]],
  ["text-", (step) => [`text-${step}`]],
  ["radius-", (step) => [`rounded-${step}`]],
  ["shadow-", (step) => [`shadow-${step}`]],
  ["border-width-", (step, entry) => [`border-${step}`, borderWidthClass(entry)]],
  ["spacing-", spacingUtilities],
  ["container-", containerUtilities],
  ["aspect-", (step) => [`aspect-${step}`]],
  ["blur-", (step) => [`blur-${step}`, `backdrop-blur-${step}`]],
  ["breakpoint-", (step) => [`${step}:`]],
  ["duration-", (step) => [`duration-${step}`]],
  ["ease-", (step) => [`ease-${step}`]],
  ["z-", (step) => [`z-${step}`]],
  ["pattern-", (_step, entry) => [entry.name]],
  ["effect-scrim-", (step) => [`scrim-${step}`]],
  ["motion-", (step) => MOTION_UTILITIES[step] ?? []],
];

/**
 * The Tailwind class(es) a token produces (R56), derived from its name — never a hand-kept list —
 * so a renamed token throws here like any other lookup. A token no utility reads (an artboard
 * size, the 4px unit itself) has none; the unit's steps come from `stepUtilities`.
 */
export function utilitiesOf(name: string): readonly string[] {
  const entry = token(name);
  const rule = UTILITY_RULES.find(([prefix]) => name.startsWith(prefix));
  return rule === undefined ? [] : rule[1](name.slice(rule[0].length), entry);
}
