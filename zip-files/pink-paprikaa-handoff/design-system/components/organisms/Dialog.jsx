import React from "react";
import { IconButton } from "../atoms/IconButton.jsx";

/** Centred modal on desktop, bottom sheet on mobile. 24px radius. */
export function Dialog({ open = true, title, children, footer, onClose, sheet, width = 460, style, ...rest }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "absolute", inset: 0, zIndex: 60,
        background: "var(--surface-overlay)",
        display: "flex", alignItems: sheet ? "flex-end" : "center", justifyContent: "center",
        padding: sheet ? 0 : 24,
        animation: "none",
      }}
      onClick={onClose}
    >
      <div
        role="dialog" aria-modal="true" aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface-card)",
          width: sheet ? "100%" : width, maxWidth: "100%",
          borderRadius: sheet ? "var(--radius-xl) var(--radius-xl) 0 0" : "var(--radius-xl)",
          boxShadow: "var(--shadow-4)", overflow: "hidden",
          transition: "transform var(--dur-slow) var(--ease-entrance)",
          ...style,
        }}
        {...rest}
      >
        {sheet ? <div style={{ display: "grid", placeItems: "center", paddingTop: 10 }}><span style={{ width: 40, height: 4, borderRadius: 99, background: "var(--ink-300)" }} /></div> : null}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, padding: "20px 24px 0" }}>
          {title ? <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, letterSpacing: "-.01em", color: "var(--text-heading)" }}>{title}</h3> : <span />}
          {onClose ? <IconButton icon="x" label="Close" onClick={onClose} size="sm" /> : null}
        </div>
        <div style={{ padding: "12px 24px 20px", color: "var(--text-body)", fontSize: 15, lineHeight: 1.6 }}>{children}</div>
        {footer ? <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", padding: "0 24px 24px" }}>{footer}</div> : null}
      </div>
    </div>
  );
}
