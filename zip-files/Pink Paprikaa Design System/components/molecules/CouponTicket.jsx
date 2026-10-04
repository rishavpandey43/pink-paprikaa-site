import React from "react";
import { Logo } from "../atoms/Logo.jsx";
import { Icon } from "../atoms/Icon.jsx";
import { usePress, mergeHandlers } from "../atoms/TextButton.jsx";

/** Perforated voucher for stories, DMs and print handouts.
    The code stub is a copy button unless copyable={false}. */
export function CouponTicket({
  code = "PAPRIKAA50", headline = "50% off your first order",
  terms = "One use per guest. Dine-in and pickup. Till 30 Sep.",
  tone = "brand", base = "/assets", width = 900,
  notchColor = "var(--surface-page)", copyable = true, onCopy, style, ...rest
}) {
  const brand = tone === "brand";
  const notch = 34;
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = () => {
    const done = () => { setCopied(true); if (onCopy) onCopy(code); };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(done, done);
      } else { done(); }
    } catch (e) { done(); }
  };

  const StubTag = copyable ? "button" : "div";
  const p = usePress(!copyable);
  return (
    <div
      style={{
        width, maxWidth: "100%", display: "flex", alignItems: "stretch",
        background: brand ? "var(--pink-500)" : "var(--ink-000)",
        color: brand ? "var(--ink-000)" : "var(--text-heading)",
        border: brand ? "none" : "1px solid var(--border-default)",
        borderRadius: "var(--radius-xl)", overflow: "hidden", position: "relative",
        boxShadow: "var(--shadow-3)", ...style,
      }}
      {...rest}
    >
      <div style={{ flex: 1, minWidth: 0, padding: Math.round(width * 0.045) }}>
        <Logo base={base} tone={brand ? "white" : "pink"} height={Math.round(width * 0.075)} />
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: width * 0.055, lineHeight: 1.05, letterSpacing: "-.025em", marginTop: width * 0.03, textWrap: "balance" }}>{headline}</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: width * 0.019, lineHeight: 1.5, opacity: brand ? 0.8 : 0.7, marginTop: width * 0.022, maxWidth: "44ch" }}>{terms}</div>
      </div>
      <div style={{ width: 0, borderLeft: "2px dashed " + (brand ? "rgba(255,255,255,.45)" : "var(--border-default)"), margin: "18px 0" }} />
      <StubTag
        type={copyable ? "button" : undefined}
        onClick={copyable ? copy : undefined}
        aria-label={copyable ? "Copy code " + code : undefined}
        {...(copyable ? p.bind : {})}
        style={{
          flex: "0 0 auto", width: width * 0.3, display: "grid", placeItems: "center",
          padding: 20, border: "none", color: "inherit", font: "inherit",
          background: brand
            ? (p.press ? "var(--state-press-on-color)" : p.hover ? "var(--state-hover-on-color)" : "rgba(255,255,255,.08)")
            : (p.press ? "var(--pink-200)" : p.hover ? "var(--pink-100)" : "var(--pink-50)"),
          cursor: copyable ? "pointer" : "default",
          outline: p.focus ? "2px solid " + (brand ? "var(--ink-000)" : "var(--pink-500)") : "none", outlineOffset: -6,
          transition: "background var(--dur-fast) var(--ease-out)",
        }}
      >
        <div style={{ textAlign: "center", display: "grid", gap: 8, justifyItems: "center" }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: width * 0.016, letterSpacing: "var(--ls-overline)", textTransform: "uppercase", opacity: 0.75 }}>
            {copied ? "Copied" : "Use code"}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: width * 0.032, letterSpacing: ".04em", color: brand ? "var(--ink-000)" : "var(--pink-600)", wordBreak: "break-word" }}>{code}</span>
          {copyable ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, opacity: 0.8 }}>
              <Icon name={copied ? "check" : "copy"} size={Math.max(12, Math.round(width * 0.018))} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: width * 0.016 }}>{copied ? "Copied" : "Tap to copy"}</span>
            </span>
          ) : null}
        </div>
      </StubTag>
      <span style={{ position: "absolute", left: width * 0.7 - notch / 2, top: -notch / 2, width: notch, height: notch, borderRadius: "50%", background: notchColor }} />
      <span style={{ position: "absolute", left: width * 0.7 - notch / 2, bottom: -notch / 2, width: notch, height: notch, borderRadius: "50%", background: notchColor }} />
    </div>
  );
}
