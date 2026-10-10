import type { ComponentProps, JSX } from "react";

import type { Sx } from "./sx";

/** The ground a component paints and the data-surface it gives its children (spec §4). */
export type SurfaceProp = "page" | "alt" | "sunken" | "soft" | "brand" | "ink";
/** The palette. `accent` is turmeric, `info` is kesar. A domain state is `status`, never a colour. */
export type ColorProp =
  "brand" | "neutral" | "accent" | "success" | "warning" | "danger" | "info" | "inverse";
export type SizeProp = "sm" | "md" | "lg";
export interface SxProp {
  /** Token-typed style overrides on the root (spacing, display, size, look). See lib/sx.ts. */
  sx?: Sx | undefined;
}
export type BaseProps<E extends keyof JSX.IntrinsicElements> = ComponentProps<E> & SxProp;
/** For components with a palette `color` prop: the native `color` attribute is dropped. */
export type BasePropsWithColor<E extends keyof JSX.IntrinsicElements> = Omit<
  ComponentProps<E>,
  "color"
> &
  SxProp;

export const SURFACE_DATA = {
  page: "light",
  alt: "light",
  sunken: "light",
  soft: "soft",
  brand: "brand",
  ink: "ink",
} as const satisfies Record<SurfaceProp, "light" | "soft" | "brand" | "ink">;

export const SURFACE_BG = {
  page: "bg-surface-page",
  alt: "bg-surface-page-alt",
  sunken: "bg-surface-sunken",
  soft: "bg-surface-brand-soft",
  brand: "bg-surface-brand",
  ink: "bg-surface-inverse",
} as const satisfies Record<SurfaceProp, string>;
