import React from "react";
import { Icon } from "./Icon.jsx";

const TONES = {
  brand: { bg: "var(--pink-500)", fg: "var(--ink-000)" },
  soft: { bg: "var(--pink-100)", fg: "var(--pink-700)" },
  ink: { bg: "var(--ink-900)", fg: "var(--ink-000)" },
  success: { bg: "var(--status-success-soft)", fg: "#186c51" },
  warning: { bg: "var(--status-warning-soft)", fg: "#8a5c00" },
  danger: { bg: "var(--status-danger-soft)", fg: "var(--status-danger)" },
  neutral: { bg: "var(--ink-100)", fg: "var(--ink-700)" },
};

/** Small uppercase status marker. Reads as a label, never as a button. */
export function Badge({ children, tone = "soft", icon, style, ...rest }) {
  const t = TONES[tone] || TONES.soft;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "4px 10px", background: t.bg, color: t.fg,
        fontFamily: "var(--font-display)", fontWeight: 700,
        fontSize: "var(--fs-overline)", letterSpacing: "var(--ls-overline)",
        textTransform: "uppercase", lineHeight: 1.2,
        borderRadius: "var(--radius-pill)", whiteSpace: "nowrap", ...style,
      }}
      {...rest}
    >
      {icon ? <Icon name={icon} size={12} /> : null}
      {children}
    </span>
  );
}
