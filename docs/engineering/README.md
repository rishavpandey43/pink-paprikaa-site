# Engineering Handbook

The authoritative standard for **how software is built** — by humans and by AI sessions, on any
model. It is written as a **universal system**: the principles, patterns, gates and workflows
hold for any codebase; each repository binds them to its stack in clearly-marked _binding_
sections. This repository is the first binding. Nothing in here trades quality for project
size — simplicity is a quality decision, never a lowered bar.

The [coding-guidelines spec](../superpowers/specs/2026-08-08-coding-guidelines-design.md) was
this handbook's seed; this folder now owns the content and the spec points here.

## The one idea behind everything

**Determinism comes from the system, not the model.** A rule that lives in prose depends on
whoever reads it; a rule that lives in a gate executes the same for a senior engineer, a strong
model, or a weak one. Therefore every rule in this handbook is classified:

| Severity       | Meaning                                                    | Backing                                 |
| -------------- | ---------------------------------------------------------- | --------------------------------------- |
| **LAW**        | Machine-enforced. Violations cannot merge.                 | lint rule, compiler flag, CI gate, hook |
| **CONVENTION** | Followed by discipline; checked in review; probe-verified. | this handbook + review checklists       |
| **ASPIRATION** | Direction of travel; not yet consistently true.            | tracked in the decision log             |

The standing obligation (from [06-quality-gates](06-quality-gates.md)): **when a CONVENTION keeps
being violated, promote it to LAW by wiring a rule — never by writing more prose.**

## The documents

| Doc                                               | Owns                                                          | Read when                             |
| ------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------- |
| [01-principles](01-principles.md)                 | Coding paradigm: KISS, YAGNI, SOLID-for-React, severity model | Always — it's short                   |
| [02-architecture](02-architecture.md)             | Layers, feature-module structure, data flow, where code lives | Before creating any file              |
| [03-patterns](03-patterns.md)                     | Canonical code shapes with real code — copy these             | Before writing components/hooks/logic |
| [04-naming-conventions](04-naming-conventions.md) | Every name: files, symbols, booleans, types, imports          | When naming anything                  |
| [05-tooling-and-config](05-tooling-and-config.md) | Every config file: what owns it, how to change it safely      | Before touching any config            |
| [06-quality-gates](06-quality-gates.md)           | Testing philosophy, the gate registry, budgets                | Before claiming anything done         |
| [07-ai-workflows](07-ai-workflows.md)             | **The deterministic AI development system**                   | Start of every AI session             |
| [08-recipes](08-recipes.md)                       | Step-by-step recipes, exact files named                       | Doing a common task                   |
| [09-decision-log](09-decision-log.md)             | What was adopted/rejected and why; drift ledger               | Before proposing a change             |

## Precedence

1. **LAWs** (the gates themselves) — nothing overrides a gate; a wrong gate gets fixed via
   [09-decision-log](09-decision-log.md) process, never bypassed.
2. This handbook.
3. The dated specs in `docs/superpowers/specs/` (architecture = tooling decisions, product =
   content/behaviour) — they are decision _records_; when a record and this handbook disagree,
   the handbook is current and the record gets a dated amendment.

## Maintenance contract

- A decision that changes edits the affected handbook doc **in the same PR** as the code change,
  plus a line in [09-decision-log](09-decision-log.md). No drive-by divergence.
- Code excerpts in [03-patterns](03-patterns.md) are the canonical shapes — if the codebase
  outgrows one, update the excerpt in the same PR (trust the code, fix the doc).
- `docs/Reference_*.md` (previous-employer extraction, gitignored) are **input material only**:
  never committed, never cited in code, superseded by this handbook.
