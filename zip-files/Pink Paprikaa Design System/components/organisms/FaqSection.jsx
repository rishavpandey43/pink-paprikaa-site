import React from "react";
import { SectionHeader } from "../molecules/SectionHeader.jsx";
import { Accordion } from "../molecules/Accordion.jsx";

/** FAQ block for the website and franchise pages. */
export function FaqSection({ overline = "Questions", title = "The things people ask", lede, items = [], multiple, style, ...rest }) {
  return (
    <section style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "var(--section-y-fluid) var(--gutter-fluid)", ...style }} {...rest}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(320px,100%), 1fr))", gap: "clamp(28px,4vw,56px)", alignItems: "start" }}>
        <SectionHeader overline={overline} title={title} lede={lede} />
        <Accordion items={items} multiple={multiple} defaultOpen={items[0] ? [items[0].q] : []} />
      </div>
    </section>
  );
}
