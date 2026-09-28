# Carried fixes for batch C (from review A) — FIRST, fix commits
1. Minor (a11y) — packages/ui/src/lib/field-message.tsx:54-72: hint → error reuses the same <p> and only adds role="alert"; SRs announce an added role unreliably. `key={status}` on the status <p> so an error mounts a fresh alert. Test: hint→error remounts (node identity changes).
2. Minor — use-controllable-state.ts:27-31 and assign-ref.ts:9: JSDoc the limits (setter compares against the closed-over render value; callback-ref cleanup return is dropped).
