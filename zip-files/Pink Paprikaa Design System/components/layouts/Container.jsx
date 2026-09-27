import React from "react";

const MAX = { default: "var(--container-max)", wide: "var(--container-wide)", prose: "var(--measure-prose)", full: "100%" };

/** Horizontal page frame: max width + fluid gutters. */
export function Container({ children, size = "default", as = "div", bleed, style, ...rest }) {
  const Tag = as;
  return (
    <Tag style={{ width: "100%", maxWidth: MAX[size] || size, marginInline: "auto", paddingInline: bleed ? 0 : "var(--gutter-fluid)", ...style }} {...rest}>
      {children}
    </Tag>
  );
}
