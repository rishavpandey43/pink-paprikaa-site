import type { CSSProperties } from "react";

export interface LogoProps {
  /**
   * lockup   - the official logo with the tagline. The default almost everywhere;
   *            same ~1.9:1 box as the wordmark, so it is a free swap.
   * wordmark - no tagline. Only under ~120px wide, where the tagline turns to mud.
   * symbol   - the interlocked diamond mark alone. Square (1:1).
   */
  variant?: "lockup" | "wordmark" | "symbol";
  /** pink on light - white on pink/ink - badge is white on a pink square. */
  tone?: "pink" | "white" | "badge";
  /** Set height and the width follows the artwork. Preferred in headers. */
  height?: number | string;
  /** Explicit width. Defaults: lockup 240, wordmark 180, symbol 40. */
  width?: number | string;
  /** Assets folder. Default "/assets". */
  base?: string;
  style?: CSSProperties;
}
export function Logo(props: LogoProps): JSX.Element;
