import React from "react";

const toSpace = (v) => (v == null ? undefined : /^[\d.]+$/.test(String(v)) ? "var(--space-" + String(v).replace(".", "-") + ")" : v);

/** Vertical rhythm primitive. Gap-based, never margins. */
export function Stack({ children, space = 4, align, justify, as = "div", divide, style, ...rest }) {
  const Tag = as;
  return (
    <Tag
      style={{
        display: "grid", gap: toSpace(space),
        justifyItems: align, alignContent: justify, minWidth: 0, ...style,
      }}
      {...rest}
    >
      {divide
        ? React.Children.toArray(children).map((c, i) => (
            <React.Fragment key={i}>
              {i > 0 ? <span style={{ height: 1, background: "var(--border-subtle)" }} /> : null}
              {c}
            </React.Fragment>
          ))
        : children}
    </Tag>
  );
}
