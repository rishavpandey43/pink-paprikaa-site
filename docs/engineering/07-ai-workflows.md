# 07 — Deterministic AI Workflows

**The problem this solves:** prompt-only AI development produces model-dependent results — a
strong model behaves well, a weaker one cuts corners, and neither is reproducible. This system
makes the **workflow** carry the judgment, so any competent model produces the same quality:
externalized decisions (the handbook's trees and tables), mandatory gates (which no model can
talk its way past), probe-verified protections, and written state (ledgers) that survives
session death. A weaker model on this system beats a stronger model freelancing.

## 1. The contract (binding for every AI session in this repo)

1. **Read order at session start:** repo `CLAUDE.md` → this handbook's README → the doc(s) the
   task touches. Never begin from memory of a previous session's rules.
2. **Ground truth is executable:** `pnpm nx show projects`, `git log --oneline`, `pnpm verify`.
   Docs describe; the tree decides. On any doc-vs-tree conflict, trust the tree and file the
   doc fix.
3. **Look up, don't re-derive:** placement via [02 §5](02-architecture.md), shape via
   [03](03-patterns.md), names via [04](04-naming-conventions.md), config changes via
   [05 §4](05-tooling-and-config.md). If the lookup has no answer, that is a decision —
   stop and surface it, don't improvise silently.
4. **Never bypass a guardrail:** no `--no-verify`, no `eslint-disable` for boundary/hex/naming
   LAWs, no budget edits, no gate weakening. A gate in the way = the design is wrong or the
   gate needs a governed change ([09](09-decision-log.md)) — both are surfaced, not steamrolled.
5. **Verify against the installed world, not memory:** APIs checked in `node_modules`
   source/README; CLI flags via `--help`; generator output diffed against the standard before
   trusting it. (Model knowledge ages; the lockfile doesn't.)
6. **Report faithfully:** failures reported with output, skipped steps named as skipped,
   uncertainty marked as concern. DONE means gates ran green — nothing else means done.

## 2. The task lifecycle (every non-trivial change)

```
SCOPE  →  PLAN  →  IMPLEMENT  →  SELF-REVIEW  →  GATE  →  [INDEPENDENT REVIEW]  →  RECORD
```

| Stage                  | Deterministic requirement                                                                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scope**              | Written task statement with explicit OUT-of-scope. Scope altitude confirmed (setup vs implementation vs content — see decision log R-01's lesson).                                          |
| **Plan**               | For multi-file work: files to create/modify named up front; exact values (names, routes, tokens) decided in the plan, not during typing.                                                    |
| **Implement**          | Canonical shapes copied from [03](03-patterns.md); TDD where a rule is being encoded (test proves the rule, RED before GREEN, both captured).                                               |
| **Self-review**        | The checklist in [06 §5](06-quality-gates.md), run against the diff before claiming done.                                                                                                   |
| **Gate**               | `pnpm verify` + affected e2e cold; new protections probe-verified ([06 §4](06-quality-gates.md)); evidence (command + output) in the report/PR.                                             |
| **Independent review** | For substantial work: a _separate_ session/agent reviews the diff against the task brief — the implementer never accepts its own work. Findings loop until clean or explicitly adjudicated. |
| **Record**             | Conventional commit telling the why; decisions → [09](09-decision-log.md); handbook edits in the same PR when a pattern changed.                                                            |

For large multi-task effort, the full orchestration used to build Phase 0 applies: fresh
implementer per task with a written brief, reviewer per task, fix rounds with scoped
re-review, a progress ledger that survives crashes, and a final whole-branch review. That
process lives in the superpowers SDD skill; this handbook's contract is the repo-side half.

## 3. Guardrails that make weak models behave like strong ones

- **Decisions are pre-made.** The trees/tables/canonical shapes remove the judgment calls where
  weak models fail. Following instructions is model-cheap; architecture judgment is
  model-expensive — so the system hoards the judgment.
- **Gates don't negotiate.** A model that "believes" its code works still cannot merge red.
- **Probes catch silent failure** — the failure mode of confident models is code that looks
  right and does nothing (this repo's own layering rule, once). Probes make "looks right" fall
  over when it isn't.
- **Ledgers beat context windows.** Progress, deferred findings, and rulings live in files;
  a crashed or compacted session resumes from the ledger + `git log`, never from recollection.
- **Escalation is a success path.** BLOCKED/NEEDS-DECISION with specifics is correct behaviour;
  guessing through ambiguity is the failure. The contract rewards stopping at real forks.
- **Small verified steps.** Commit-sized units with per-unit gates localise any failure to one
  diff — a weak model's error surface shrinks to the last commit, not the last week.

## 4. Session protocols

**Start:** read order (§1) → `git log --oneline -5` + `git status` + ledger if one exists →
state the task + out-of-scope in one message → begin.

**During:** narrate state changes (branch, commits, config edits) as they happen; batch
questions rather than drip them; keep the working tree clean at every pause point.

**End (definition of a finished turn):** gates green + tree clean + work committed on the right
branch + a report that distinguishes _verified_ (with evidence) from _assumed_. Anything
unfinished is named as unfinished with its next step.

**Recovery (crash/compaction):** trust ledger + git over memory; re-verify claimed state
(`pnpm verify`) before building on it; never re-execute completed ledger entries.

## 5. Repeatable workflows are commands, not prompts

Any workflow performed twice gets encoded as a slash command in `.claude/commands/` (or a skill)
with its gates inline — prompting is for the novel, commands are for the repeatable. Current
set: `/new-component`, `/new-feature`, `/pre-merge` — each embeds the relevant recipes and
checklists so the workflow's quality is carried by the command text, not the operator's memory.
The same promotion rule as [06 §3](06-quality-gates.md): a prompt you keep re-typing is a
command you haven't written yet.

## 6. Model policy

Match model tier to judgment density, not to prestige: mechanical transcription and scoped
re-reviews run cheap; integration work runs mid; architecture, final reviews, and adversarial
verification run on the strongest available. This is an efficiency dial only — **the quality
floor is set by the gates and this workflow, and is identical on every tier.** If quality
drops when the model does, the missing piece is a guardrail, not a bigger model — add the
guardrail and record it.
