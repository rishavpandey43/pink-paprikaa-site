import React from "react";

const toSpace = (v) => (v == null ? undefined : /^[\d.]+$/.test(String(v)) ? "var(--space-" + String(v).replace(".", "-") + ")" : v);

/** Horizontal group that wraps. Buttons, tags, chips, meta rows. */
export function Cluster({ children, space = 3, align = "center", justify = "start", nowrap, scroll, as = "div", style, ...rest }) {
  const Tag = as;
  return (
    <Tag
      style={{
        display: "flex", flexWrap: nowrap || scroll ? "nowrap" : "wrap",
        gap: toSpace(space),
        alignItems: align, justifyContent: justify,
        overflowX: scroll ? "auto" : undefined,
        paddingBottom: scroll ? 4 : undefined,
        minWidth: 0, ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
