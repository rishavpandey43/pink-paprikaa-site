import React from "react";

/** 4/6-digit login code. Mono digits, pink active cell. */
export function OtpInput({ length = 6, value = "", onChange, error, success, disabled, style, ...rest }) {
  const accent = error ? "var(--status-danger)" : success ? "var(--status-success)" : "var(--pink-500)";
  const refs = React.useRef([]);
  const [focusI, setFocusI] = React.useState(-1);
  const [hoverI, setHoverI] = React.useState(-1);
  const set = (i, ch) => {
    const arr = value.padEnd(length, " ").split("");
    arr[i] = ch || " ";
    const next = arr.join("").replace(/\s+$/, "");
    if (onChange) onChange(next);
    if (ch && i < length - 1 && refs.current[i + 1]) refs.current[i + 1].focus();
  };
  return (
    <div style={{ display: "grid", gap: 8, ...style }} {...rest}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {Array.from({ length }, (_, i) => {
          const ch = (value[i] || "").trim();
          return (
            <input
              key={i} ref={(el) => (refs.current[i] = el)}
              inputMode="numeric" maxLength={1} value={ch} disabled={disabled}
              aria-label={"Digit " + (i + 1)}
              onChange={(e) => set(i, e.target.value.replace(/\D/g, ""))}
              onFocus={(e) => { setFocusI(i); e.target.select(); }} onBlur={() => setFocusI(-1)}
              onPointerEnter={() => setHoverI(i)} onPointerLeave={() => setHoverI(-1)}
              onPaste={(e) => { const d = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, length); if (d) { e.preventDefault(); onChange && onChange(d); const n = Math.min(d.length, length - 1); refs.current[n] && refs.current[n].focus(); } }}
              onKeyDown={(e) => { if (e.key === "Backspace" && !ch && i > 0 && refs.current[i - 1]) refs.current[i - 1].focus(); }}
              style={{
                width: 48, height: 56, textAlign: "center",
                fontFamily: "var(--font-mono)", fontSize: 20,
                border: (ch || focusI === i ? 2 : 1) + "px solid " + (disabled ? "var(--border-subtle)" : error || success ? accent : ch || focusI === i ? "var(--pink-500)" : hoverI === i ? "var(--border-strong)" : "var(--border-default)"),
                borderRadius: "var(--radius-md)", outline: "none", background: disabled ? "var(--ink-100)" : focusI === i ? "var(--pink-50)" : "var(--ink-000)",
                boxShadow: focusI === i && !disabled ? (error ? "0 0 0 3px var(--status-danger-soft)" : "var(--focus-ring)") : "none",
                color: disabled ? "var(--ink-400)" : "var(--text-heading)", cursor: disabled ? "not-allowed" : "text",
                transition: "border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out)",
              }}
            />
          );
        })}
      </div>
      {error || success ? <span style={{ fontSize: 12.5, color: error ? "var(--status-danger)" : "#186c51" }}>{error || success}</span> : null}
    </div>
  );
}
