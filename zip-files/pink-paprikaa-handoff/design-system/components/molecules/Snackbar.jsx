import React from "react";
import { Icon } from "../atoms/Icon.jsx";

const TONES = {
  ink: { bg: "var(--ink-900)", fg: "var(--ink-000)", action: "var(--pink-300)", icon: "info" },
  brand: { bg: "var(--pink-500)", fg: "var(--ink-000)", action: "var(--ink-000)", icon: "check" },
  success: { bg: "var(--status-success)", fg: "var(--ink-000)", action: "var(--ink-000)", icon: "check" },
  danger: { bg: "var(--status-danger)", fg: "var(--ink-000)", action: "var(--ink-000)", icon: "triangle-alert" },
};

/** Anchored confirmation bar with an optional text action (copy, undo). */
export function Snackbar({
  open = true, children, tone = "ink", icon, action, onAction, onClose,
  duration = 3200, position = "bottom-center", inset = 24, width = 420, style, ...rest
}) {
  React.useEffect(() => {
    if (!open || !duration || !onClose) return undefined;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose, children]);
  if (!open) return null;

  const t = TONES[tone] || TONES.ink;
  const [v, hAlign] = position.split("-");
  const anchor = {
    position: "absolute", zIndex: 70,
    [v === "top" ? "top" : "bottom"]: inset,
    left: hAlign === "left" ? inset : hAlign === "right" ? "auto" : "50%",
    right: hAlign === "right" ? inset : "auto",
    transform: hAlign === "center" ? "translateX(-50%)" : "none",
    maxWidth: "calc(100% - " + inset * 2 + "px)",
  };
  return (
    <div style={{ ...anchor, ...style }} {...rest}>
      <div
        role="status" aria-live="polite"
        style={{
          display: "flex", alignItems: "center", gap: 12,
          width, maxWidth: "100%", minWidth: 0,
          padding: "13px 14px 13px 16px",
          background: t.bg, color: t.fg,
          borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-3)",
          animation: "pp-sheet-in var(--dur-base) var(--ease-out)",
        }}
      >
        <Icon name={icon || t.icon} size="md" style={{ opacity: 0.95 }} />
        <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14.5, lineHeight: 1.4, textWrap: "pretty" }}>
          {children}
        </span>
        {action ? (
          <button type="button" onClick={onAction}
            style={{ flex: "0 0 auto", border: "none", background: "transparent", color: t.action, cursor: "pointer", padding: "4px 6px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12.5, letterSpacing: ".06em", textTransform: "uppercase" }}>
            {action}
          </button>
        ) : null}
        {onClose ? (
          <button type="button" aria-label="Dismiss" onClick={onClose}
            style={{ flex: "0 0 auto", border: "none", background: "transparent", color: "inherit", opacity: 0.7, cursor: "pointer", display: "grid", placeItems: "center", padding: 2 }}>
            <Icon name="x" size="sm" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
