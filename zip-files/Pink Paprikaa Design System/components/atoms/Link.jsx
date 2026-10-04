import React from "react";
import { Icon } from "./Icon.jsx";
import { usePress, mergeHandlers } from "./TextButton.jsx";

/** Inline or standalone link. Underline is the brand's link signal. */
export function Link({ children, href = "#", variant = "default", size = "md", icon, iconAfter, external, disabled, state, onClick, style, ...rest }) {
  const p = usePress(disabled);
  const hover = state ? state === "hover" : p.hover;
  const press = state ? state === "press" : p.press;
  const focus = state ? state === "focus" : p.focus;
  const tones = {
    default: { c: press ? "var(--brand-active)" : hover ? "var(--text-link-hover)" : "var(--text-link)", ul: hover || press ? "currentColor" : "var(--pink-200)", ring: "var(--pink-500)" },
    subtle: { c: press ? "var(--pink-700)" : hover ? "var(--text-heading)" : "var(--text-muted)", ul: hover || press ? "var(--ink-300)" : "transparent", ring: "var(--pink-500)" },
    inverse: { c: "var(--ink-000)", ul: press ? "var(--ink-000)" : hover ? "rgba(255,255,255,.9)" : "rgba(255,255,255,.4)", ring: "var(--ink-000)", bg: press ? "var(--state-hover-on-color)" : undefined },
    quiet: { c: press ? "var(--pink-700)" : hover ? "var(--pink-600)" : "var(--ink-700)", ul: hover || press ? "var(--pink-200)" : "transparent", ring: "var(--pink-500)" },
  };
  const t = tones[variant] || tones.default;
  return (
    <a
      href={disabled ? undefined : href} onClick={disabled ? (e) => e.preventDefault() : onClick}
      aria-disabled={disabled || undefined} tabIndex={disabled ? -1 : undefined}
      target={external ? "_blank" : undefined} rel={external ? "noreferrer noopener" : undefined}
      {...mergeHandlers(p.bind, rest)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontFamily: "var(--font-body)", fontWeight: 500,
        fontSize: size === "sm" ? 13.5 : size === "lg" ? 17 : 15,
        color: disabled ? "var(--ink-400)" : t.c, textDecoration: disabled ? "none" : "underline",
        textDecorationColor: t.ul, cursor: disabled ? "not-allowed" : "pointer",
        background: t.bg, borderRadius: 4,
        outline: focus && !disabled ? "2px solid " + t.ring : "none", outlineOffset: 3, textDecorationThickness: 1.5, textUnderlineOffset: 3,
        transition: "color var(--dur-fast) var(--ease-out), text-decoration-color var(--dur-fast) var(--ease-out)",
        ...style,
      }}
    >
      {icon ? <Icon name={icon} size="sm" /> : null}
      {children}
      {iconAfter || external ? <Icon name={iconAfter || "arrow-up-right"} size="sm" /> : null}
    </a>
  );
}
