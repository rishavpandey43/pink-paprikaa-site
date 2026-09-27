import React from "react";

/** Phone frame for app screens: 390x844, status bar, home indicator. */
export function AppShell({ children, tabBar, overlay, statusTone = "ink", time = "9:41", width = 390, height = 844, style, ...rest }) {
  const c = statusTone === "light" ? "#fff" : "var(--ink-900)";
  return (
    <div style={{ width, height, background: "var(--ink-000)", borderRadius: 44, boxShadow: "var(--shadow-4)", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column", ...style }} {...rest}>
      <div style={{ height: 44, flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", color: c, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13 }}>
        <span>{time}</span>
        <span style={{ width: 17, height: 11, border: "1.5px solid " + c, borderRadius: 2, position: "relative", opacity: 0.9 }}>
          <span style={{ position: "absolute", inset: 1.5, background: c, borderRadius: 1 }} />
        </span>
      </div>
      {children}
      {tabBar}
      <div style={{ height: 22, flex: "0 0 auto", display: "grid", placeItems: "center", background: "var(--ink-000)" }}>
        <span style={{ width: 130, height: 5, borderRadius: 99, background: "var(--ink-300)" }} />
      </div>
      {overlay}
    </div>
  );
}
