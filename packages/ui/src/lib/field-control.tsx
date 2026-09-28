import type { ReactNode } from "react";

import { Lock } from "lucide-react";

import { Icon, type IconComponent } from "../atoms/icon/icon";
import { componentVariants } from "./component-variants";
import { FIELD_STATUS_ICON, type FieldStatus } from "./field-status";
import { SymbolMark } from "./symbol-mark";

/**
 * The one field box (readme §3.8, guidelines/form-states.card.html). Input and Select render their
 * native control inside it — and SearchField can — so heights, radius, the status border, the focus
 * ring, the disabled and read-only fills and the trailing glyph are shared by construction.
 *
 * Disabled is styled off the native control (`has-[>:is(input,textarea,select):disabled]:`), so a
 * disabled `<fieldset>` greys its fields too. The selector names the control, a direct child of the
 * box: a bare `has-disabled:` also matches a select's disabled placeholder `<option>`, and
 * `has-[>:disabled]:` a disabled trailing button — either would paint the whole field disabled. A
 * new control rendered in the box must be one of those three elements and a direct child. Read-only
 * cannot be styled that way (`:read-only` matches every non-editable element), so it is a variant.
 */
export const fieldControlVariants = componentVariants({
  slots: {
    root: [
      "group/field relative flex w-full min-w-0 items-center gap-2.5 rounded-md border border-border-default bg-surface-card px-3.5 font-body text-text-body transition-control",
      "has-[>:is(input,textarea,select):disabled]:cursor-not-allowed has-[>:is(input,textarea,select):disabled]:border-border-subtle has-[>:is(input,textarea,select):disabled]:bg-ink-100 has-[>:is(input,textarea,select):disabled]:text-ink-400",
    ],
    icon: "text-ink-500 group-has-[>:is(input,textarea,select):disabled]/field:text-ink-400",
    control: "bg-transparent outline-none disabled:cursor-not-allowed",
    glyph: "ms-auto",
    spinner: "ms-auto size-field-spinner shrink-0 text-pink-500 motion-safe:animate-mark-pulse",
    suffix: "shrink-0 font-mono text-field-suffix text-text-subtle",
  },
  variants: {
    size: {
      // R21: the value is 16px at every size — iOS Safari zooms a focused field set smaller.
      sm: { root: "h-field-sm text-body" },
      md: { root: "h-field-md text-body" },
      lg: { root: "h-field-lg text-body" },
    },
    control: {
      input: {
        control:
          "min-w-0 flex-1 self-stretch placeholder:text-text-subtle read-only:cursor-default",
      },
      select: {
        // The control is out of flow, so the box has no content width of its own: the minimum
        // keeps a content-sized parent from shrinking it to the chevron (R90).
        root: "min-w-field-select-min",
        // Overlays the whole box, so a click anywhere opens it and a long option label can
        // never widen the layout — it truncates inside the box.
        control:
          "absolute inset-0 size-full cursor-pointer appearance-none truncate rounded-md ps-3.5 pe-11",
      },
    },
    isMultiline: { true: { root: "h-auto items-start py-3", control: "resize-y" } },
    isReadOnly: { true: { root: "bg-surface-sunken" } },
    hasIcon: { true: "" },
    status: {
      default: {
        root: "focus-within:border-2 focus-within:border-border-brand focus-within:shadow-focus-ring",
        icon: "group-focus-within/field:text-pink-500",
        glyph: "text-ink-500 group-has-[>:is(input,textarea,select):disabled]/field:text-ink-400",
      },
      error: {
        root: "border-2 border-status-danger focus-within:shadow-field-ring-danger",
        icon: "text-status-danger",
        glyph: "text-status-danger",
      },
      success: {
        root: "border-2 border-status-success focus-within:shadow-field-ring-success",
        icon: "text-status-success",
        glyph: "text-status-success",
      },
      warning: {
        root: "border-2 border-status-warning focus-within:shadow-field-ring-warning",
        icon: "text-status-warning",
        glyph: "text-status-warning",
      },
    },
  },
  compoundVariants: [
    // A select's text clears a leading icon: 14px inset + 20px icon + 10px gap.
    { control: "select", hasIcon: true, class: { control: "ps-11" } },
    { status: "default", isReadOnly: true, class: { glyph: "text-ink-400" } },
    // A read-only select is disabled natively (a select cannot be read-only), so it undoes the
    // disabled paint: locked but readable — body text on its status border, like a read-only Input.
    {
      control: "select",
      isReadOnly: true,
      class: {
        root: "has-[>:is(input,textarea,select):disabled]:cursor-default has-[>:is(input,textarea,select):disabled]:bg-surface-sunken has-[>:is(input,textarea,select):disabled]:text-text-body",
        icon: "group-has-[>:is(input,textarea,select):disabled]/field:text-ink-500",
        control: "disabled:cursor-default",
      },
    },
    // `has-[>:is(input,textarea,select):disabled]:` outranks a plain border class, so each status restores its own border.
    {
      control: "select",
      isReadOnly: true,
      status: "default",
      class: { root: "has-[>:is(input,textarea,select):disabled]:border-border-default" },
    },
    {
      control: "select",
      isReadOnly: true,
      status: "error",
      class: { root: "has-[>:is(input,textarea,select):disabled]:border-status-danger" },
    },
    {
      control: "select",
      isReadOnly: true,
      status: "success",
      class: { root: "has-[>:is(input,textarea,select):disabled]:border-status-success" },
    },
    {
      control: "select",
      isReadOnly: true,
      status: "warning",
      class: { root: "has-[>:is(input,textarea,select):disabled]:border-status-warning" },
    },
  ],
  defaultVariants: {
    size: "md",
    control: "input",
    isMultiline: false,
    isReadOnly: false,
    hasIcon: false,
    status: "default",
  },
});

interface TrailingGlyph {
  icon: IconComponent;
  size: "sm" | "md";
}

/** One precedence for every field: a status beats the lock, the lock beats a resting affordance. */
function trailingGlyph(
  status: FieldStatus,
  isReadOnly: boolean,
  affordance: IconComponent | undefined
): TrailingGlyph | undefined {
  if (status !== "default") return { icon: FIELD_STATUS_ICON[status], size: "md" };
  if (isReadOnly) return { icon: Lock, size: "sm" };
  return affordance === undefined ? undefined : { icon: affordance, size: "md" };
}

export interface FieldControlProps {
  size?: "sm" | "md" | "lg" | undefined;
  status?: FieldStatus | undefined;
  /** The native control inside: an input/textarea in the flow, or a select overlaying the box. */
  control?: "input" | "select" | undefined;
  icon?: IconComponent | undefined;
  suffix?: string | undefined;
  trailing?: ReactNode;
  /** Pulses the brand mark in place of the trailing glyph. */
  isLoading?: boolean | undefined;
  /** Sunken fill and a lock. With `control="select"` it also undoes the disabled paint. */
  isReadOnly?: boolean | undefined;
  isMultiline?: boolean | undefined;
  /** A resting trailing glyph (Select's chevron); a status, the lock or the loading mark replace it. */
  affordance?: IconComponent | undefined;
  className?: string | undefined;
  /** Renders the native control, given the class the box assigns it. */
  children: (controlClassName: string) => ReactNode;
}

/**
 * Sets `data-surface="light"`: a white field inside a pink or ink section restores the light tokens
 * (spec §3.2.3), so its text and its focus ring are never the dark surface's.
 */
export function FieldControl({
  size = "md",
  status = "default",
  control = "input",
  icon,
  suffix,
  trailing,
  isLoading = false,
  isReadOnly = false,
  isMultiline = false,
  affordance,
  className,
  children,
}: FieldControlProps) {
  const styles = fieldControlVariants({
    size,
    status,
    control,
    isMultiline,
    isReadOnly,
    hasIcon: icon !== undefined,
  });
  const glyph = isLoading ? undefined : trailingGlyph(status, isReadOnly, affordance);

  return (
    <div data-surface="light" className={styles.root({ className })}>
      {icon === undefined ? null : <Icon icon={icon} size="md" className={styles.icon()} />}
      {children(styles.control())}
      {isLoading ? <SymbolMark className={styles.spinner()} /> : null}
      {glyph === undefined ? null : (
        <Icon icon={glyph.icon} size={glyph.size} className={styles.glyph()} />
      )}
      {suffix === undefined ? null : <span className={styles.suffix()}>{suffix}</span>}
      {trailing}
    </div>
  );
}
