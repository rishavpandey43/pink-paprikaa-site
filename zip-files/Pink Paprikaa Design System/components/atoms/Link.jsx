import React from "react";
import { Icon } from "./Icon.jsx";

/** Inline or standalone link. Underline is the brand's link signal. */
export function Link({ children, href = "#", variant = "default", size = "md", icon, iconAfter, external, onClick, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const tones = {
    default: { c: hover ? "var(--text-link-hover)" : "var(--text-link)", ul: hover ? "currentColor" : "var(--pink-200)" },
    subtle: { c: hover ? "var(--text-heading)" : "var(--text-muted)", ul: hover ? "var(--ink-300)" : "transparent" },
    inverse: { c: "var(--ink-000)", ul: hover ? "rgba(255,255,255,.9)" : "rgba(255,255,255,.4)" },
    quiet: { c: hover ? "var(--pink-600)" : "var(--ink-700)", ul: "transparent" },
  };
  const t = tones[variant] || tones.default;
  return (
    <a
      href={href} onClick={onClick}
      target={external ? "_blank" : undefined} rel={external ? "noreferrer noopener" : undefined}
      onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontFamily: "var(--font-body)", fontWeight: 500,
        fontSize: size === "sm" ? 13.5 : size === "lg" ? 17 : 15,
        color: t.c, textDecoration: "underline",
        textDecorationColor: t.ul, textDecorationThickness: 1.5, textUnderlineOffset: 3,
        transition: "color var(--dur-fast) var(--ease-out), text-decoration-color var(--dur-fast) var(--ease-out)",
        ...style,
      }}
      {...rest}
    >
      {icon ? <Icon name={icon} size="sm" /> : null}
      {children}
      {iconAfter || external ? <Icon name={iconAfter || "arrow-up-right"} size="sm" /> : null}
    </a>
  );
}
