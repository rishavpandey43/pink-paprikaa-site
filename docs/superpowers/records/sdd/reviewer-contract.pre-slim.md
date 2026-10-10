# Task reviewer contract (design-system rewrite, plans 2b–5)

Read-only: no edits, commits, or subagents. Method and output contract: `/Users/rishavpa/.claude/plugins/cache/claude-plugins-official/superpowers/6.4.1/skills/subagent-driven-development/task-reviewer-prompt.md` — follow it exactly (spec compliance AND task quality; Critical/Important/Minor; "⚠️ Cannot verify from diff").

Inputs are in the plan workspace `W` the dispatch names: the briefs, `task-0-fold-list.md` (binding overlay), `global-constraints.md` (attention lens), `progress.md` (Ruling lines are decided), the batch report (carries test evidence — do not re-run suites), and the review package diff.

Check verbatim-vs-brief by diffing the brief's code blocks against the committed files where practical. Return inline, concise: Spec ✅/❌ per task, issues as `path:line — severity — problem — fix`, Task quality verdict.
