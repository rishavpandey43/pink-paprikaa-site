import React from "react";

/** Responsive card grid that collapses columns instead of squashing them. */
export function AutoGrid({ children, min = 260, space, columns, as = "div", style, ...rest }) {
  const Tag = as;
  return (
    <Tag
      style={{
        display: "grid",
        gridTemplateColumns: columns
          ? "repeat(" + columns + ", minmax(0, 1fr))"
          : "repeat(auto-fit, minmax(min(" + min + "px, 100%), 1fr))",
        gap: space || "var(--gap-grid)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
