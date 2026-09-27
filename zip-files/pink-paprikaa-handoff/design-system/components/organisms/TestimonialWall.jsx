import React from "react";
import { ReviewCard } from "../molecules/ReviewCard.jsx";
import { SectionHeader } from "../molecules/SectionHeader.jsx";

/** Grid of guest reviews. */
export function TestimonialWall({ overline = "Guests", title = "What people actually say", reviews = [], variant = "default", base = "/assets", style, ...rest }) {
  return (
    <section style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "var(--section-y-fluid) var(--gutter-fluid)", ...style }} {...rest}>
      <SectionHeader overline={overline} title={title} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px,100%), 1fr))", gap: "var(--gap-grid)", marginTop: 32 }}>
        {reviews.map((r) => <ReviewCard key={r.name} base={base} {...r} variant={variant} />)}
      </div>
    </section>
  );
}
