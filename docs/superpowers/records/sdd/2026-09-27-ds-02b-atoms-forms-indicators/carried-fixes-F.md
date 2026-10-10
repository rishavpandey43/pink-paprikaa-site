# Carried fixes for batch F (from review D) — FIRST, own fix commit(s)
1. Minor (a11y, spec §5.5) — spinner.tsx:1404 role="status" named via aria-label only; live regions announce content, not names. Render `<span className="sr-only">{label}</span>` inside instead of aria-label; existing getByRole("status",{name}) tests must still pass.
2. Minor — field-control.tsx:81-89: read-only Select with status error/success/warning paints default border (has-disabled:border-border-default beats border-status-*). Restrict the compound's border to status "default" and give each status a has-disabled:border-status-* counterpart; computed-colour play for the error case.
3. Minor — progress-bar.stories.tsx: surface-aware label (text-text-muted) → add the OnSurfacesStory the global constraints require.
4. Minor — select.test.tsx:803-806 split `.not.toHaveClass(a, b)` into two assertions; radio.test.tsx:559-562 option-level checked-invalid ring → computed check like GroupError.
5. Minor, ruling R65 (Storybook docs-kit, plan 5) — R62 hides classes the library uses (`text-status-*` in field-control.tsx / status-dot.tsx). utilitiesOf for colour = role default ∪ classes actually used in packages/ui/src for that token (reuse catalogue.spec's library scan); update the contract story + node spec.
6. Minor (plan 5) — spacing-hit marker: narrow to ["min-h"] (plans only write min-h-hit).
