"use client";

import { createContext } from "react";

import type { SizeProp } from "./common-props";

/**
 * What a ToggleButtonGroup tells the ToggleButtons inside it. Its presence is also how a
 * ToggleButton knows to render a Radix `ToggleGroup.Item` rather than a standalone `Toggle`.
 * A child's own `size` / `color` win over these.
 */
export interface ToggleButtonGroupContextValue {
  size: SizeProp;
  color: "brand" | "neutral";
  isFullWidth: boolean;
}

export const ToggleButtonGroupContext = createContext<ToggleButtonGroupContextValue | null>(null);
