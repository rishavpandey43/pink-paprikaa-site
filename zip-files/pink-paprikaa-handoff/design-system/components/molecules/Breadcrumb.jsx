import React from "react";
import { Icon } from "../atoms/Icon.jsx";

/** Website-only path trail. */
export function Breadcrumb({ items = [], style, ...rest }) {
  return (
    <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", ...style }} {...rest}>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <React.Fragment key={it.label}>
            {last ? (
              <span aria-current="page" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13.5, color: "var(--text-heading)" }}>{it.label}</span>
            ) : (
              <a href={it.href || "#"} style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-muted)", textDecoration: "none" }}>{it.label}</a>
            )}
            {!last ? <Icon name="chevron-right" size={14} style={{ color: "var(--ink-400)" }} /> : null}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
