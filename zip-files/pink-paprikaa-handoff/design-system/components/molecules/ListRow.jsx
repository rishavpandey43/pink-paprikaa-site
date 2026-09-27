import React from "react";
import { Text } from "../atoms/Text.jsx";
import { Icon } from "../atoms/Icon.jsx";

/** Generic settings / account / details row. Hairline separated, not carded. */
export function ListRow({ title, description, leading, trailing, value, icon, onClick, chevron, divider = true, danger, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const interactive = !!onClick;
  return (
    <div
      onClick={onClick}
      onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}
      role={interactive ? "button" : undefined} tabIndex={interactive ? 0 : undefined}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 12px", margin: "0 -12px", minHeight: "var(--hit-min)",
        borderBottom: divider ? "1px solid var(--border-subtle)" : "none",
        background: interactive && hover ? "var(--pink-50)" : "transparent",
        borderRadius: "var(--radius-sm)",
        cursor: interactive ? "pointer" : undefined,
        transition: "background var(--dur-fast) var(--ease-out)",
        ...style,
      }}
      {...rest}
    >
      {leading || (icon ? <Icon name={icon} size="lg" style={{ color: danger ? "var(--status-danger)" : "var(--ink-600)" }} /> : null)}
      <div style={{ flex: 1, minWidth: 0, display: "grid", gap: 2 }}>
        <Text variant="body-sm" weight={500} tone={danger ? "danger" : "heading"} as="span">{title}</Text>
        {description ? <Text variant="caption" tone="subtle" as="span" clamp={2}>{description}</Text> : null}
      </div>
      {value ? <Text variant="body-sm" tone="muted" as="span">{value}</Text> : null}
      {trailing}
      {chevron ? <Icon name="chevron-right" size="md" style={{ color: "var(--ink-400)" }} /> : null}
    </div>
  );
}
