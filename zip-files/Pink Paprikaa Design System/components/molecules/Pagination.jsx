import React from "react";
import { Icon } from "../atoms/Icon.jsx";

/** Page control for blog / press listings. */
export function Pagination({ page = 1, pages = 1, onChange, style, ...rest }) {
  const go = (p) => onChange && p >= 1 && p <= pages && p !== page && onChange(p);
  const nums = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== "…") nums.push("…");
  }
  const btn = (content, active, onClick, key, label) => (
    <button
      key={key} type="button" onClick={onClick} aria-label={label} aria-current={active ? "page" : undefined}
      disabled={content === "…"}
      style={{
        minWidth: 40, height: 40, padding: "0 10px", borderRadius: "var(--radius-pill)",
        border: active ? "none" : "1px solid var(--border-default)",
        background: active ? "var(--pink-500)" : "var(--ink-000)",
        color: active ? "var(--ink-000)" : content === "…" ? "var(--ink-400)" : "var(--ink-700)",
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
        cursor: content === "…" ? "default" : "pointer",
        display: "grid", placeItems: "center",
      }}
    >
      {content}
    </button>
  );
  return (
    <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", ...style }} {...rest}>
      {btn(<Icon name="chevron-left" size="sm" />, false, () => go(page - 1), "prev", "Previous page")}
      {nums.map((n, i) => btn(n, n === page, () => go(n), "n" + i, typeof n === "number" ? `Page ${n}` : undefined))}
      {btn(<Icon name="chevron-right" size="sm" />, false, () => go(page + 1), "next", "Next page")}
    </nav>
  );
}
