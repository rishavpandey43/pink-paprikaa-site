# 01 — Principles

The paradigm, in priority order. Everything else in this handbook is these principles applied.
These are universal — they do not soften for small projects or harden only for large ones.
**The quality bar is absolute; what scales with the project is the amount of machinery, never
the rigor.**

## 1. KISS is a quality discipline, not a shortcut

Every abstraction must beat the null alternative — the plain function, the plain element, the
inline value. Complexity is spent like money: only where it buys correctness, reuse that exists
today, or a gate. When two designs tie, ship the one with less indirection — it is the one that
stays correct under maintenance. Cleverness that cannot survive a tired reviewer at 2am is a
defect. Concretely rejected by this principle in this repo's binding (each with its verdict in
[09-decision-log](09-decision-log.md)): state libraries without state, data-fetching libraries
without runtime data, CSS-in-JS beside a token system, per-folder barrels, HOCs,
config-driven mega-components.

## 2. YAGNI, governed — scope is a decision record, not a mood

Build what the current, written scope names (here: the phase roadmap, architecture spec §15).
"We might need it" is rejected by default — not because future needs are unreal, but because
speculative code is unreviewed code the moment its real requirements arrive. The
reconsider-triggers table ([09-decision-log](09-decision-log.md)) is the governed door back:
every "not now" is written down with the condition that reopens it.

## 3. Predictability over preference

Same problem → same shape, every time, regardless of who (or what model) writes it. The decision
trees ([02-architecture §5](02-architecture.md)) and canonical shapes ([03-patterns](03-patterns.md))
exist so placement and form are **looked up, not re-decided**. A deviation is either promoted
into the handbook (with a decision-log entry) or reverted — never left as local flavour.

## 4. SOLID, translated to React

| Principle                 | Concrete form here                                                                                                                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **S**ingle responsibility | One component renders one thing; one hook owns one concern; one file has one primary export. A component doing fetch-shaping AND rendering splits into transformer + component ([03-patterns §4](03-patterns.md)). |
| **O**pen/closed           | Extend via composition, `children`, and `componentVariants()` variants. A new look is a new variant value. Boolean props that fork render paths are the tell that this principle broke.                            |
| **L**iskov                | Every variant honours the base contract: `<Button intent="secondary">` drops in wherever `<Button>` goes. A variant that needs different props is a different component.                                           |
| **I**nterface segregation | Props carry what the component uses — 3 fields = 3 props (or one typed `content` object). No kitchen-sink `data`/`config` blobs.                                                                                   |
| **D**ependency inversion  | Depend on tokens and `content` types, never concrete data files or sibling apps. The direction is a LAW (boundary matrix).                                                                                         |

## 5. Data crosses boundaries validated, once

External/untyped data enters as `unknown` and crosses through a Zod schema exactly once
(`packages/content` pattern). Inside the boundary, the type is trusted — no defensive
re-checking, no `?.` chains on fields the type guarantees. `z.infer<>` keeps type and validation
one artifact.

## 6. Strings are not control flow

A lesson bought expensively elsewhere (see decision log R-07): free-form string keys that gate
behaviour fail **silently** on typos. Any value that selects behaviour is an `as const` union,
a discriminated-union tag, or a schema enum — something the compiler checks. Hand-maintained
allow-lists (R-08) are the same disease: derive membership from source of truth, don't enumerate.

## 7. Generated and derived artifacts are never hand-edited

`dist/`, `out/`, `*.generated.*`, `.content-collections/`, lockfiles: machine-owned, gitignored
or regenerated, never patched by hand. If output is wrong, fix the generator input.

## 8. The gates are the definition of done

`pnpm verify` green + e2e + budgets + guards = done. Failing gate = not done — no narrative
overrides it. Weakening a gate to pass is the inverted move: the gate is the spec
([06-quality-gates](06-quality-gates.md) owns the registry; changing one is a decision-log event).

## 9. Honest docs or no docs

A doc that drifts is worse than no doc. Every handbook claim must be verifiable against the tree;
excerpts carry their canonical status; changed decisions edit the doc in the same PR. "Trust the
code, fix the doc" — and then fix the process that let them diverge.
