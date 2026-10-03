# Reviewer contract (slim, from 2026-10-03)

Read-only. No edits, commits or subagents. Inputs: the task file(s) in `docs/superpowers/slim/`, `docs/superpowers/slim/RULES.md`, the batch report, and the diff file.

Check: (1) the task file is fully met (every prop, variant, story and test listed); (2) correctness and a11y; (3) consistency with sibling components and RULES.md. Do NOT compare against plan code — the plans are condensed. Do not re-run suites; the report has the evidence.

Return inline: Spec ✅/❌ per task; issues as `path:line — Critical/Important/Minor — problem — fix`; verdict. Minors are listed only, and fixed once in the final fix wave.
