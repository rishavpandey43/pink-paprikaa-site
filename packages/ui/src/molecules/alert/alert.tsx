import type { ComponentProps, ReactNode } from "react";

import { Check, CircleAlert, Info, Megaphone, TriangleAlert } from "lucide-react";

import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import { isShown } from "../../lib/is-shown";
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
    tone: {
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
  defaultVariants: { tone: "info", hasTitle: false },
});

type AlertTone = NonNullable<AlertProps["tone"]>;

const TONE_ICON: Readonly<Record<AlertTone, IconComponent>> = {
  info: Info,
  success: Check,
  warning: TriangleAlert,
  danger: CircleAlert,
  brand: Megaphone,
  neutral: Info,
};

export interface AlertProps extends Omit<ComponentProps<"div">, "title"> {
  tone?: "info" | "success" | "warning" | "danger" | "brand" | "neutral" | undefined;
  title?: ReactNode;
  /** Usually one small ghost Button. */
  action?: ReactNode;
  /**
   * Shows the dismiss button. The parent owns the removal, so it also owns focus: the button
   * unmounts with the alert, so move focus somewhere sensible (the next heading, the trigger) or it
   * drops to `<body>`.
   */
  onDismiss?: (() => void) | undefined;
  /** Replaces the tone's glyph (the handoff's PG hint uses Building2). */
  icon?: IconComponent | undefined;
}

/**
 * Persistent inline message — kitchen delays, closed outlets, payment problems, calculator nudges.
 * Soft tint with a matching full 1px border (never a coloured left border only). A light island on
 * any surface. Use Toast for transient confirmations instead.
 */
export function Alert({
  tone = "info",
  title,
  action,
  onDismiss,
  icon,
  className,
  children,
  ...props
}: AlertProps) {
  const hasTitle = isShown(title);
  const styles = alert({ tone, hasTitle });
  const role = tone === "danger" ? "alert" : "status";

  return (
    <div
      // A status turning into an alert mounts a fresh node: screen readers announce a role
      // changed on an existing node unreliably (FieldMessage's `key={status}`).
      key={role}
      role={role}
      data-surface="light"
      className={styles.root({ className })}
      {...props}
    >
      <Icon icon={icon ?? TONE_ICON[tone]} size="md" className={styles.icon()} />
      <div className={styles.body()}>
        {hasTitle ? <p className={styles.title()}>{title}</p> : null}
        {isShown(children) ? <div className={styles.content()}>{children}</div> : null}
        {isShown(action) ? <div className={styles.action()}>{action}</div> : null}
      </div>
      {onDismiss === undefined ? null : <AlertDismiss onDismiss={onDismiss} />}
    </div>
  );
}
