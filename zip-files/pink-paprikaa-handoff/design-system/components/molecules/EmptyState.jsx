import React from "react";
import { Text } from "../atoms/Text.jsx";
import { Icon } from "../atoms/Icon.jsx";

/** Nothing-here state. Always says what to do next. */
export function EmptyState({ title = "Nothing here yet.", body = "Let's fix that.", icon, symbol, action, size = "md", base = "/assets", style, ...rest }) {
  const big = size === "lg";
  return (
    <div style={{ display: "grid", justifyItems: "center", textAlign: "center", gap: 10, padding: big ? "64px 24px" : "40px 20px", ...style }} {...rest}>
      {symbol ? (
        <img src={base + "/symbol-pink.svg"} alt="" style={{ width: big ? 52 : 40, opacity: 0.85, marginBottom: 4 }} />
      ) : (
        <Icon name={icon || "utensils"} size={big ? 40 : 32} style={{ color: "var(--pink-300)", marginBottom: 4 }} />
      )}
      <Text variant={big ? "h3" : "h4"}>{title}</Text>
      {body ? <Text variant="body-sm" tone="muted" measure="narrow">{body}</Text> : null}
      {action ? <div style={{ marginTop: 8 }}>{action}</div> : null}
    </div>
  );
}
