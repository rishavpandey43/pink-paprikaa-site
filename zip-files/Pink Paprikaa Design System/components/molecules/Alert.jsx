import React from "react";
import { Icon } from "../atoms/Icon.jsx";

const T = {
  info: { bg: "var(--status-info-soft)", fg: "#5a2a80", bd: "var(--kesar)", icon: "info" },
  success: { bg: "var(--status-success-soft)", fg: "#186c51", bd: "var(--mint)", icon: "check" },
  warning: { bg: "var(--status-warning-soft)", fg: "#8a5c00", bd: "var(--turmeric)", icon: "triangle-alert" },
  danger: { bg: "var(--status-danger-soft)", fg: "var(--status-danger)", bd: "var(--status-danger)", icon: "circle-alert" },
  brand: { bg: "var(--pink-100)", fg: "var(--pink-800)", bd: "var(--pink-500)", icon: "megaphone" },
};

/** Inline message block. Full 1px border — never a coloured left border only. */
export function Alert({ tone = "info", title, children, action, onDismiss, style, ...rest }) {
  const t = T[tone] || T.info;
  return (
    <div
      role="status"
      style={{
        display: "flex", gap: 12, alignItems: "flex-start",
        padding: "14px 16px", background: t.bg, color: t.fg,
        border: `1px solid ${t.bd}`, borderRadius: "var(--radius-md)", ...style,
      }}
      {...rest}
    >
      <Icon name={t.icon} size="md" style={{ marginTop: 1 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {title ? <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, letterSpacing: "-.005em" }}>{title}</div> : null}
        {children ? <div style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.55, marginTop: title ? 3 : 0, textWrap: "pretty" }}>{children}</div> : null}
        {action ? <div style={{ marginTop: 10 }}>{action}</div> : null}
      </div>
      {onDismiss ? (
        <button type="button" aria-label="Dismiss" onClick={onDismiss} style={{ border: "none", background: "transparent", color: "inherit", cursor: "pointer", padding: 2, display: "grid", placeItems: "center" }}>
          <Icon name="x" size="sm" />
        </button>
      ) : null}
    </div>
  );
}
