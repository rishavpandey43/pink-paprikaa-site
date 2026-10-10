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

Two pieces, both checked in:

- **MCP server** — `.mcp.json` registers `nx-mcp` (`npx nx mcp`), which runs against this
  workspace's own Nx version. Claude Code asks you to approve it the first time.
- **Skills** — `.claude/skills/*` are symlinks to `.agents/skills/` (`nx-generate`, `nx-run-tasks`,
  `nx-workspace` and the rest), so Claude can query the project graph and run generators without
  guessing flags. Nx regenerates `.agents/skills/`; the symlinks pick that up.

The `nx@nx-claude-plugins` plugin is deliberately not used. It would load a second copy of the same
server and skills.

## Project instructions

Behavioural rules live in `CLAUDE.md` at the repository root, not here. The Nx-managed block at the
top of that file is auto-updated — keep its `<!-- nx configuration start/end -->` markers intact and
add project content below them.
