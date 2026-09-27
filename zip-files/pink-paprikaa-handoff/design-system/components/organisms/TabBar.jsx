import React from "react";
import { Icon } from "../atoms/Icon.jsx";

/** Fixed 64px bottom navigation for the ordering app. */
export function TabBar({ items = [], value, onChange, style, ...rest }) {
  return (
    <nav
      style={{
        display: "flex", height: "var(--tabbar-h)",
        background: "var(--ink-000)", borderTop: "1px solid var(--border-subtle)",
        paddingBottom: 0, ...style,
      }}
      {...rest}
    >
      {items.map((it) => {
        const on = it.value === value;
        return (
          <button
            key={it.value} type="button" onClick={() => onChange && onChange(it.value)}
            aria-current={on ? "page" : undefined}
            style={{
              flex: 1, border: "none", background: "transparent", cursor: "pointer",
              display: "grid", justifyItems: "center", alignContent: "center", gap: 4,
              color: on ? "var(--pink-500)" : "var(--ink-500)",
              transition: "color var(--dur-fast) var(--ease-out)", position: "relative",
            }}
          >
            <span style={{ position: "relative", display: "inline-flex" }}>
              <Icon name={it.icon} size="lg" />
              {it.count ? (
                <span style={{ position: "absolute", top: -4, right: -8, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 99, background: "var(--pink-500)", color: "var(--ink-000)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10, display: "grid", placeItems: "center" }}>{it.count}</span>
              ) : null}
            </span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: on ? 700 : 500, fontSize: 11 }}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
