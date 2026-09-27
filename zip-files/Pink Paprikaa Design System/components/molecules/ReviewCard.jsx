import React from "react";
import { Card } from "../atoms/Card.jsx";
import { Text } from "../atoms/Text.jsx";
import { Avatar } from "../atoms/Avatar.jsx";
import { Rating } from "../atoms/Rating.jsx";

/** Guest review / testimonial. */
export function ReviewCard({ name, meta, quote, rating, avatar, variant = "default", symbol = false, base = "/assets", style, ...rest }) {
  const brand = variant === "brand";
  return (
    <Card variant={brand ? "feature" : "default"} padding={20} style={{ display: "grid", gap: 14, ...style }} {...rest}>
      {rating != null ? <Rating value={rating} symbol={symbol} base={base} size={16} /> : null}
      <Text variant="body" tone={brand ? "var(--pink-800)" : "body"} measure="narrow">{'“' + (quote || "") + '”'}</Text>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={name} src={avatar} size="sm" />
        <div style={{ display: "grid", minWidth: 0 }}>
          <Text variant="body-sm" weight={500} as="span" tone={brand ? "var(--pink-800)" : "heading"}>{name}</Text>
          {meta ? <Text variant="caption" tone={brand ? "var(--pink-700)" : "subtle"} as="span">{meta}</Text> : null}
        </div>
      </div>
    </Card>
  );
}
