import type { CSSProperties } from "react";

export interface CouponTicketProps {
  /** Uppercase promo code, Space Mono. */
  code?: string;
  /** 8 words maximum. */
  headline?: string;
  /** Terms in full sentences - always state the expiry. */
  terms?: string;
  tone?: "brand" | "light";
  base?: string;
  /** Design width in px; all inner type scales from it. */
  width?: number;
  /** Colour of the two punched notches - match the surface behind the ticket. */
  notchColor?: string;
  /** Makes the code stub a copy button. Set false for print and artboards. */
  copyable?: boolean;
  /** Fires with the copied code - pair it with a Snackbar. */
  onCopy?: (code: string) => void;
  style?: CSSProperties;
}
export function CouponTicket(props: CouponTicketProps): JSX.Element;
