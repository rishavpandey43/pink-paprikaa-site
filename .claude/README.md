# Claude Code setup

Project-scoped Claude Code configuration. Everything here is committed and shared — personal
overrides belong in `.claude/settings.local.json`, which is gitignored.

## Layout

| Path                  | Holds                                                               |
| --------------------- | ------------------------------------------------------------------- |
| `settings.json`       | Permissions, enabled plugins, sandbox network allowlist             |
| `skills/`             | Project skills — repeatable workflows invoked as `/skill-name`      |
| `commands/`           | Custom slash commands (simpler than skills; a prompt template)      |
| `agents/`             | Custom subagent definitions with their own prompt, tools, and model |
| `settings.local.json` | Personal overrides. Gitignored. Never commit.                       |

`skills/`, `commands/` and `agents/` are empty scaffolding — they get filled as repeatable
workflows emerge (a component generator, a token-sync check, a pre-cutover audit).

## Permissions

`settings.json` allowlists the commands this workspace runs constantly — `pnpm`, `nx`, and
read-only git — so routine work doesn't generate prompts. Two other tiers matter:

- **`ask`** — history-rewriting or outward-facing actions (`git rebase`, `git reset --hard`,
  `netlify deploy`). Allowed, but never silently.
- **`deny`** — never, regardless of context: force-push, `filter-branch`, recursive deletes of `/`
  or `~`.

## Nx integration

`enabledPlugins` pulls the Nx plugin from `nrwl/nx-ai-agents-config` (Nx's own repository). It
provides the Nx MCP server plus the skills in `.agents/skills/` — `nx-generate`, `nx-run-tasks`,
`nx-workspace` — which let Claude query the project graph and invoke generators accurately instead
of guessing flags.

To remove it, delete `extraKnownMarketplaces` and `enabledPlugins` from `settings.json`. The local
skill files keep working.

## Project instructions

Behavioural rules live in `CLAUDE.md` at the repository root, not here. The Nx-managed block at the
top of that file is auto-updated — keep its `<!-- nx configuration start/end -->` markers intact and
add project content below them.
