import type { CSSProperties } from "react";

export interface OtpInputProps {
  length?: number;
  value?: string;
  error?: string;
  /** Confirmation message, e.g. "Verified." */
  success?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  style?: CSSProperties;
}
export function OtpInput(props: OtpInputProps): JSX.Element;
