import React from "react";

/** 4/6-digit login code. Mono digits, pink active cell. */
export function OtpInput({ length = 6, value = "", onChange, error, success, disabled, style, ...rest }) {
  const accent = error ? "var(--status-danger)" : success ? "var(--status-success)" : "var(--pink-500)";
  const refs = React.useRef([]);
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
              onKeyDown={(e) => { if (e.key === "Backspace" && !ch && i > 0 && refs.current[i - 1]) refs.current[i - 1].focus(); }}
              style={{
                width: 48, height: 56, textAlign: "center",
                fontFamily: "var(--font-mono)", fontSize: 20, color: "var(--text-heading)",
                border: (ch ? 2 : 1) + "px solid " + (error || success ? accent : ch ? "var(--pink-500)" : "var(--border-default)"),
                borderRadius: "var(--radius-md)", outline: "none", background: disabled ? "var(--ink-100)" : "var(--ink-000)",
              }}
            />
          );
        })}
      </div>
      {error || success ? <span style={{ fontSize: 12.5, color: error ? "var(--status-danger)" : "#186c51" }}>{error || success}</span> : null}
    </div>
  );
}
