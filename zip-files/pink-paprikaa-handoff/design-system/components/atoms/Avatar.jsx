import React from "react";
import { Icon } from "./Icon.jsx";

const S = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 };

/** Circular guest/staff avatar. Falls back to initials on --pink-100. */
export function Avatar({ name = "", src, size = "md", icon, ring, style, ...rest }) {
  const px = typeof size === "number" ? size : S[size] || S.md;
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <span
      title={name || undefined}
      style={{
        width: px, height: px, flex: "0 0 auto", borderRadius: "var(--radius-pill)",
        display: "grid", placeItems: "center", overflow: "hidden",
        background: src ? `center/cover no-repeat url(${src})` : "var(--pink-100)",
        color: "var(--pink-700)", fontFamily: "var(--font-display)", fontWeight: 700,
        fontSize: Math.max(10, Math.round(px * 0.38)), letterSpacing: "-.01em",
        boxShadow: ring ? "0 0 0 2px var(--ink-000), 0 0 0 4px var(--pink-500)" : "none",
        ...style,
      }}
      {...rest}
    >
      {src ? null : icon ? <Icon name={icon} size={Math.round(px * 0.5)} /> : initials || null}
    </span>
  );
}
