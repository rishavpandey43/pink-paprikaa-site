import React from "react";
import { Logo } from "../atoms/Logo.jsx";
import { Link } from "../atoms/Link.jsx";
import { Text } from "../atoms/Text.jsx";
import { Divider } from "../atoms/Divider.jsx";
import { IconButton } from "../atoms/IconButton.jsx";

const B = typeof window !== "undefined" ? window.PP_BRAND : null;
const DEFAULT_COLUMNS = [
  { heading: "Eat", links: ["Full Menu", "Small Plates", "Chai & Coffee", "Sweets"] },
  { heading: "Visit", links: ["Outlets", "Book a Table", "Private Dining", "Gift Cards"] },
  { heading: "Company", links: ["Our Story", "Franchise", "Careers", "Press"] },
];

/** Flooded-pink site footer with the white lockup. */
export function SiteFooter({
  columns = DEFAULT_COLUMNS,
  blurb = "Chai at 8am, chilli paneer at midnight. " + (B ? B.lines.outletsCount : "One kitchen in Sector 57, Gurgaon") + ".",
  social = B ? Object.values(B.social).map((s) => s.icon) : ["instagram", "youtube", "linkedin"],
  legal = B ? B.lines.copyright : "© 2026 Paprikaa Culinary Ventures Private Limited",
  policies = B ? B.lines.footerPolicies : ["Privacy", "Terms", "FSSAI Lic."],
  contact = B ? [B.contact.website, B.contact.phoneDisplay, B.contact.email] : null,
  base = "/assets", style, ...rest
}) {
  return (
    <footer data-surface="brand" style={{ background: "var(--pink-500)", ...style }} {...rest}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "clamp(44px,5vw,64px) var(--gutter-fluid) 32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px,100%), 1fr))", gap: "clamp(28px,3vw,40px)" }}>
        <div>
          <Logo base={base} tone="white" width={260} />
          <Text variant="body-sm" as="p" tone="rgba(255,255,255,.82)" style={{ marginTop: 18, maxWidth: "30ch" }}>{blurb}</Text>
          {contact ? (
            <div style={{ display: "grid", gap: 4, marginTop: 16 }}>
              {contact.map((c) => <Text key={c} variant="body-sm" as="span" tone="body">{c}</Text>)}
            </div>
          ) : null}
          <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
            {social.map((s) => <IconButton key={s} icon={s} label={s} on="brand" />)}
          </div>
        </div>
        {columns.map((c) => (
          <div key={c.heading}>
            <Text variant="overline" as="div" tone="rgba(255,255,255,.72)">{c.heading}</Text>
            <div style={{ display: "grid", gap: 10, marginTop: 14, justifyItems: "start" }}>
              {c.links.map((l) => <Link key={l} variant="inverse">{l}</Link>)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "0 var(--gutter-fluid) 40px" }}>
        <Divider on="brand" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, paddingTop: 20, flexWrap: "wrap" }}>
          <Text variant="caption" as="span" tone="rgba(255,255,255,.78)">{legal}</Text>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {policies.map((p) => <Link key={p} variant="inverse" size="sm">{p}</Link>)}
          </div>
        </div>
      </div>
    </footer>
  );
}
