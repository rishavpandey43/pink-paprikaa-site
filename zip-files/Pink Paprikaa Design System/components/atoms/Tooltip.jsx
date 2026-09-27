import React from "react";

/** Hover/focus hint. Ink pill, 6px radius, no arrow. */
export function Tooltip({ label, children, side = "top", style, ...rest }) {
  const [show, setShow] = React.useState(false);
  const pos = {
    top: { bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" },
    bottom: { top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" },
    left: { right: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)" },
    right: { left: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)" },
  }[side];
  return (
    <span
      style={{ position: "relative", display: "inline-flex", ...style }}
      onPointerEnter={() => setShow(true)} onPointerLeave={() => setShow(false)}
      onFocus={() => setShow(true)} onBlur={() => setShow(false)}
      {...rest}
    >
      {children}
      <span
        role="tooltip"
        style={{
          position: "absolute", ...pos, zIndex: 40,
          padding: "6px 10px", background: "var(--ink-900)", color: "var(--ink-000)",
          fontFamily: "var(--font-body)", fontSize: 12.5, lineHeight: 1.4,
          borderRadius: "var(--radius-sm)", whiteSpace: "nowrap",
          boxShadow: "var(--shadow-2)",
          opacity: show ? 1 : 0, pointerEvents: "none",
          transition: "opacity var(--dur-fast) var(--ease-out)",
        }}
      >
        {label}
      </span>
    </span>
  );
}
