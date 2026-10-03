import type { ReactNode } from "react";

import { Check, CircleAlert, Info, Megaphone, TriangleAlert } from "lucide-react";

import type { BasePropsWithColor } from "../../lib/common-props";

import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import { isShown } from "../../lib/is-shown";
import { withSx } from "../../lib/sx";
import { AlertDismiss } from "./alert-dismiss";

const alert = componentVariants({
  slots: {
    root: "flex items-start gap-3 rounded-md border px-4 py-3.5",
    icon: "mt-px",
    body: "min-w-0 flex-1",
    title: "m-0 font-display text-alert-title",
    content: "text-body-sm text-pretty",
    action: "mt-2.5",
  },
  variants: {
    color: {
      info: { root: "border-status-info bg-status-info-soft text-text-info" },
      success: { root: "border-status-success bg-status-success-soft text-text-success" },
      warning: { root: "border-status-warning bg-status-warning-soft text-text-warning" },
      danger: { root: "border-status-danger bg-status-danger-soft text-text-danger" },
      brand: { root: "border-border-brand bg-surface-brand-soft text-pink-800" },
      neutral: {
        root: "border-border-subtle bg-surface-sunken text-text-heading",
        icon: "text-text-brand",
      },
    },
    hasTitle: { true: { content: "mt-0.75" } },
  },
  defaultVariants: { color: "info", hasTitle: false },
});

type AlertColor = NonNullable<AlertProps["color"]>;

const COLOR_ICON: Readonly<Record<AlertColor, IconComponent>> = {
  info: Info,
  success: Check,
  warning: TriangleAlert,
  danger: CircleAlert,
  brand: Megaphone,
  neutral: Info,
};

export interface AlertProps extends Omit<BasePropsWithColor<"div">, "title"> {
  color?: "info" | "success" | "warning" | "danger" | "brand" | "neutral" | undefined;
  title?: ReactNode;
  /** Usually one small ghost Button. */
  action?: ReactNode;
  /**
   * Shows the dismiss button. The parent owns the removal, so it also owns focus: the button
   * unmounts with the alert, so move focus somewhere sensible (the next heading, the trigger) or it
   * drops to `<body>`.
   */
  onDismiss?: (() => void) | undefined;
  /** Replaces the colour's glyph (the handoff's PG hint uses Building2). */
  icon?: IconComponent | undefined;
}

/**
 * Persistent inline message — kitchen delays, closed outlets, payment problems, calculator nudges.
 * Soft tint with a matching full 1px border (never a coloured left border only). A light island on
 * any surface. Use Toast for transient confirmations instead.
 */
export function Alert({
  color = "info",
  title,
  action,
  onDismiss,
  icon,
  sx,
  className,
  children,
  ...props
}: AlertProps) {
  const hasTitle = isShown(title);
  const styles = alert({ color, hasTitle });
  const role = color === "danger" ? "alert" : "status";

  return (
    <div
      // A status turning into an alert mounts a fresh node: screen readers announce a role
      // changed on an existing node unreliably (FieldMessage's `key={status}`).
      key={role}
      role={role}
      data-surface="light"
      className={styles.root({ className: withSx(sx, className) })}
      {...props}
    >
      <Icon icon={icon ?? COLOR_ICON[color]} size="md" className={styles.icon()} />
      <div className={styles.body()}>
        {hasTitle ? <p className={styles.title()}>{title}</p> : null}
        {isShown(children) ? <div className={styles.content()}>{children}</div> : null}
        {isShown(action) ? <div className={styles.action()}>{action}</div> : null}
      </div>
      {onDismiss === undefined ? null : <AlertDismiss onDismiss={onDismiss} />}
    </div>
  );
}
