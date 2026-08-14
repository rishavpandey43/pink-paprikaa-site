# Documentation

## Engineering Handbook

[`engineering/`](engineering/README.md) — the authoritative standard for how code is written
here: principles, architecture, canonical patterns, naming, config registry, quality gates,
**deterministic AI workflows**, recipes, and the decision log. Start there for any code work.

## Analytics

[`analytics/meta-pixel.md`](analytics/meta-pixel.md) — the Meta Pixel installation: its two
environment gates, why `/blog` is uninstrumented, which standard events to add when real
components land, and the reported-but-unbuilt items (consent, CSP, Conversions API).

## Specs

| Spec                                                                                        | Scope                                                                                                                            | Status                |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| [Boilerplate architecture](superpowers/specs/2026-08-07-boilerplate-architecture-design.md) | **How** the site is built — workspace, Nx, TypeScript, lint, hooks, design system pipeline, image pipeline, CI/CD, phase roadmap | Approved              |
| [Product requirements](superpowers/specs/2026-08-07-pink-paprikaa-site-redesign-design.md)  | **What** the site must do — pages, sections, content, data model, SEO, assets, success criteria                                  | Approved for planning |
| [Coding guidelines](superpowers/specs/2026-08-08-coding-guidelines-design.md)               | **How code is written** — principles, layer map, component/state/constants patterns, TypeScript rules, testing philosophy        | Approved              |

The three are complementary. On a build or tooling question the architecture spec is
authoritative; on content or behaviour the product spec is; on code shape the coding guidelines
are.

### Reconciling their phase numbering

They number phases differently, which is easy to trip over:

| Architecture spec | Product spec | Meaning                                                                         |
| ----------------- | ------------ | ------------------------------------------------------------------------------- |
| Phase 0           | _(assumed)_  | Foundation — workspace, tooling, CI. Product spec takes this as given.          |
| Phases 1–4        | P1           | Design system, content model, pages, images, SEO — everything needed for parity |
| Phase 5           | P3           | Blog                                                                            |
| Phase 6           | —            | Netlify cutover                                                                 |
| —                 | P2           | `/corporate`, `/offers`, `/gallery` — ships incrementally after cutover         |

**Architecture phases sequence the build; product phases sequence what ships.** Only architecture
Phases 0–4 plus 6 are required before the live cutover.

### Requirements the architecture spec absorbs from the product spec

Two gates originate in the product spec (§10) and are implemented as part of the CI described in
the architecture spec:

1. **Content validated at build** — schema violation, missing alt text, broken internal link, or a
   referenced image that doesn't exist fails the build.
2. **Founder-name guard** — CI greps built output for founder names and fails if present. This is a
   business constraint, not a style preference, and it has already regressed once.

## Adding a spec

New specs go in `superpowers/specs/` as `YYYY-MM-DD-<topic>-design.md`, and get a row in the table
above. A spec is a record of decisions _and their rationale_ — including what was rejected and what
each choice costs. Without the rationale, the next person re-litigates the same decision.
