// packages/ui/src/lib/sx.ts
import type { SpaceStep } from "./space";

/**
 * `sx`: the one style-override prop every component takes (spec 2026-10-04 §3). Token-typed: a raw
 * length, hex or class is a type error. Responsive keys accept `{ base, sm, md, lg, xl }`, mobile first.
 * Their classes are assembled at runtime, so styles.css pre-declares every one with SX_SAFELIST.
 */
export type SxBreakpoint = "base" | "sm" | "md" | "lg" | "xl";
export type Responsive<T> = T | Partial<Record<SxBreakpoint, T | undefined>>;

type Margin = SpaceStep | "auto";
type Display =
  "none" | "block" | "inline" | "inline-block" | "flex" | "inline-flex" | "grid" | "contents";

export interface Sx {
  m?: Responsive<Margin> | undefined;
  mt?: Responsive<Margin> | undefined;
  mb?: Responsive<Margin> | undefined;
  ms?: Responsive<Margin> | undefined;
  me?: Responsive<Margin> | undefined;
  mx?: Responsive<Margin> | undefined;
  my?: Responsive<Margin> | undefined;
  p?: Responsive<SpaceStep> | undefined;
  pt?: Responsive<SpaceStep> | undefined;
  pb?: Responsive<SpaceStep> | undefined;
  ps?: Responsive<SpaceStep> | undefined;
  pe?: Responsive<SpaceStep> | undefined;
  px?: Responsive<SpaceStep> | undefined;
  py?: Responsive<SpaceStep> | undefined;
  gap?: Responsive<SpaceStep> | undefined;
  gapX?: Responsive<SpaceStep> | undefined;
  gapY?: Responsive<SpaceStep> | undefined;
  display?: Responsive<Display> | undefined;
  textAlign?: Responsive<"start" | "center" | "end"> | undefined;
  w?: Responsive<"full" | "auto" | "fit"> | undefined;
  h?: "full" | "auto" | "fit" | undefined;
  minW?: "0" | "full" | undefined;
  maxW?: "full" | "none" | undefined;
  grow?: boolean | undefined;
  shrink?: boolean | undefined;
  alignSelf?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
  position?: "relative" | "absolute" | "sticky" | undefined;
  overflow?: "hidden" | "auto" | "visible" | "clip" | undefined;
  radius?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "pill" | undefined;
  shadow?: 0 | 1 | 2 | 3 | 4 | undefined;
  border?: boolean | undefined;
  /** Light grounds only. Brand and ink grounds set data-surface: use the component's `surface` prop. */
  bg?: "page" | "page-alt" | "card" | "sunken" | "soft" | undefined;
  color?: "heading" | "body" | "muted" | "subtle" | "brand" | "danger" | "success" | undefined;
}

/** Responsive spacing keys → their Tailwind prefix. Value = SpaceStep or "auto" (margins). */
const SPACE_PREFIX = {
  m: "m",
  mt: "mt",
  mb: "mb",
  ms: "ms",
  me: "me",
  mx: "mx",
  my: "my",
  p: "p",
  pt: "pt",
  pb: "pb",
  ps: "ps",
  pe: "pe",
  px: "px",
  py: "py",
  gap: "gap",
  gapX: "gap-x",
  gapY: "gap-y",
} as const satisfies Partial<Record<keyof Sx, string>>;

const DISPLAY: Record<Display, string> = {
  none: "hidden",
  block: "block",
  inline: "inline",
  "inline-block": "inline-block",
  flex: "flex",
  "inline-flex": "inline-flex",
  grid: "grid",
  contents: "contents",
};
const TEXT_ALIGN = { start: "text-start", center: "text-center", end: "text-end" } as const;
const WIDTH = { full: "w-full", auto: "w-auto", fit: "w-fit" } as const;

/** Non-responsive keys: complete literal class names, so the scanner sees every one. */
const STATIC = {
  h: { full: "h-full", auto: "h-auto", fit: "h-fit" },
  minW: { "0": "min-w-0", full: "min-w-full" },
  maxW: { full: "max-w-full", none: "max-w-none" },
  grow: { true: "grow", false: "grow-0" },
  shrink: { true: "shrink", false: "shrink-0" },
  alignSelf: {
    start: "self-start",
    center: "self-center",
    end: "self-end",
    stretch: "self-stretch",
    baseline: "self-baseline",
  },
  position: { relative: "relative", absolute: "absolute", sticky: "sticky" },
  overflow: {
    hidden: "overflow-hidden",
    auto: "overflow-auto",
    visible: "overflow-visible",
    clip: "overflow-clip",
  },
  radius: {
    none: "rounded-none",
    xs: "rounded-xs",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    pill: "rounded-pill",
  },
  shadow: { 0: "shadow-none", 1: "shadow-1", 2: "shadow-2", 3: "shadow-3", 4: "shadow-4" },
  border: { true: "border-default border-border-default", false: "border-0" },
  bg: {
    page: "bg-surface-page",
    "page-alt": "bg-surface-page-alt",
    card: "bg-surface-card",
    sunken: "bg-surface-sunken",
    soft: "bg-surface-brand-soft",
  },
  color: {
    heading: "text-text-heading",
    body: "text-text-body",
    muted: "text-text-muted",
    subtle: "text-text-subtle",
    brand: "text-text-brand",
    danger: "text-text-danger",
    success: "text-text-success",
  },
} as const;

function responsive<T extends string | number>(
  value: Responsive<T> | undefined,
  toClass: (v: T) => string
): string[] {
  if (value === undefined) return [];
  if (typeof value !== "object") return [toClass(value)];
  const out: string[] = [];
  for (const [bp, v] of Object.entries(value) as [SxBreakpoint, T | undefined][]) {
    if (v !== undefined) out.push((bp === "base" ? "" : `${bp}:`) + toClass(v));
  }
  return out;
}

export function sxClass(sx: Sx | undefined): string {
  if (sx === undefined) return "";
  const out: string[] = [];
  for (const [key, prefix] of Object.entries(SPACE_PREFIX) as [
    keyof typeof SPACE_PREFIX,
    string,
  ][]) {
    out.push(...responsive(sx[key], (v) => `${prefix}-${String(v)}`));
  }
  out.push(...responsive(sx.display, (v) => DISPLAY[v]));
  out.push(...responsive(sx.textAlign, (v) => TEXT_ALIGN[v]));
  out.push(...responsive(sx.w, (v) => WIDTH[v]));
  for (const key of Object.keys(STATIC) as (keyof typeof STATIC)[]) {
    const v = sx[key];
    if (v !== undefined) {
      const cls = (STATIC[key] as Record<string, string>)[String(v)];
      if (cls !== undefined) out.push(cls);
    }
  }
  return out.join(" ");
}

/** sx before className: componentVariants' tailwind-merge keeps the LAST conflicting class. */
export function withSx(sx: Sx | undefined, className: string | undefined): string | undefined {
  const s = sxClass(sx);
  if (s === "") return className;
  return className === undefined || className === "" ? s : `${s} ${className}`;
}

const STEPS = "0,0.5,1,1.5,2,3,4,5,6,7,8,9,10,11,12,14,16,18,20,24,32";
const BP = "{sm:,md:,lg:,xl:,}";
/** Every class `sxClass` can build at runtime. styles.css repeats each as `@source inline("…");`. */
export const SX_SAFELIST = [
  `${BP}m{,t,b,s,e,x,y}-{${STEPS},auto}`,
  `${BP}p{,t,b,s,e,x,y}-{${STEPS}}`,
  `${BP}gap{,-x,-y}-{${STEPS}}`,
  `${BP}{hidden,block,inline,inline-block,flex,inline-flex,grid,contents}`,
  `${BP}{text-start,text-center,text-end,w-full,w-auto,w-fit}`,
] as const;
