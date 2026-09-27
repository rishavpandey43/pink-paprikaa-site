import React from "react";
import { Tag } from "../atoms/Tag.jsx";
import { Badge } from "../atoms/Badge.jsx";

/** Horizontal category filter rail. Scrolls on mobile, wraps on desktop. */
export function FilterBar({ options = [], value, onChange, wrap, trailing, note, style, ...rest }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: wrap ? "wrap" : "nowrap", overflowX: wrap ? "visible" : "auto", paddingBottom: wrap ? 0 : 4, ...style }} {...rest}>
      {options.map((o) => {
        const opt = typeof o === "string" ? { value: o, label: o } : o;
        return (
          <Tag key={opt.value} icon={opt.icon} selected={opt.value === value} onClick={() => onChange && onChange(opt.value)}>
            {opt.label}
          </Tag>
        );
      })}
      {note ? <Badge tone="success" icon="leaf" style={{ flex: "0 0 auto", marginLeft: 4 }}>{note}</Badge> : null}
      {trailing}
    </div>
  );
}
