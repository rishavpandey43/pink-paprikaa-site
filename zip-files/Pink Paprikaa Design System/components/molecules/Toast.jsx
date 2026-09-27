import React from "react";
import { Icon } from "../atoms/Icon.jsx";

const TONES = {
  brand: { bg: "var(--pink-500)", fg: "var(--ink-000)", icon: "check" },
  ink: { bg: "var(--ink-900)", fg: "var(--ink-000)", icon: "info" },
  success: { bg: "var(--status-success)", fg: "var(--ink-000)", icon: "check" },
  danger: { bg: "var(--status-danger)", fg: "var(--ink-000)", icon: "triangle-alert" },
};

/** Transient confirmation. Uses --ease-pop for add-to-cart moments. */
export function Toast({ children, tone = "ink", icon, action, onAction, pop, style, ...rest }) {
  const t = TONES[tone] || TONES.ink;
  return (
    <div
      role="status"
      style={{
        display: "inline-flex", alignItems: "center", gap: 12,
        padding: "12px 16px", background: t.bg, color: t.fg,
        borderRadius: "var(--radius-pill)", boxShadow: "var(--shadow-3)",
        fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14.5,
        animation: pop ? "pp-toast-pop var(--dur-base) var(--ease-pop)" : undefined,
        ...style,
      }}
      {...rest}
    >
      <Icon name={icon || t.icon} size="md" />
      <span>{children}</span>
      {action ? (
        <button type="button" onClick={onAction} style={{ border: "none", background: "transparent", color: "inherit", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, letterSpacing: ".04em", textTransform: "uppercase", cursor: "pointer", padding: "0 2px" }}>{action}</button>
      ) : null}
    </div>
  );
}
