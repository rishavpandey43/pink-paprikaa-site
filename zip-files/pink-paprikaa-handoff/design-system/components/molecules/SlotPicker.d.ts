import type { CSSProperties } from "react";

export interface Slot { value: string; label: string; note?: string; disabled?: boolean }

export interface SlotPickerProps {
  slots?: (string | Slot)[];
  value?: string;
  label?: string;
  /** Fixed column count; omit for auto-fit at 96px minimum. */
  columns?: number;
  /** true, or the message to show. */
  error?: boolean | string;
  /** Disables the whole group. */
  disabled?: boolean;
  onChange?: (value: string) => void;
  style?: CSSProperties;
}
export function SlotPicker(props: SlotPickerProps): JSX.Element;
