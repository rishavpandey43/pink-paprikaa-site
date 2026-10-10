import React from "react";
import { Icon } from "../atoms/Icon.jsx";
import { usePress, mergeHandlers } from "../atoms/TextButton.jsx";

function TabItem({ it, on, onPick }) {
  const p = usePress(false);
  return (
    <button
      type="button" onClick={onPick} aria-current={on ? "page" : undefined} {...p.bind}
      style={{
        flex: 1, border: "none", background: "transparent", cursor: "pointer",
        display: "grid", justifyItems: "center", alignContent: "center", gap: 4, position: "relative",
        color: on ? (p.press ? "var(--brand-active)" : "var(--pink-500)") : p.press ? "var(--pink-600)" : p.hover ? "var(--ink-800)" : "var(--ink-500)",
        outline: p.focus ? "2px solid var(--pink-500)" : "none", outlineOffset: -4, borderRadius: "var(--radius-md)",
        transition: "color var(--dur-fast) var(--ease-out)",
      }}
    >
      <span style={{ position: "relative", display: "inline-grid", placeItems: "center", width: 56, height: 30, borderRadius: "var(--radius-pill)",
        background: p.press ? "var(--state-press)" : p.hover || on ? "var(--state-hover)" : "transparent",
        transform: p.press ? "scale(.92)" : "none",
        transition: "background var(--dur-fast) var(--ease-out), transform var(--dur-instant) var(--ease-out)" }}>
        <Icon name={it.icon} size="lg" />
        {it.count ? (
          <span style={{ position: "absolute", top: -3, right: 8, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 99, background: "var(--pink-500)", color: "var(--ink-000)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10, display: "grid", placeItems: "center" }}>{it.count}</span>
        ) : null}
      </span>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: on ? 700 : 500, fontSize: 11 }}>{it.label}</span>
    </button>
  );
}

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
        return <TabItem key={it.value} it={it} on={on} onPick={() => onChange && onChange(it.value)} />;
      })}
    </nav>
  );
}
