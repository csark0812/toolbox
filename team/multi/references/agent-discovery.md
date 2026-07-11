# Agent Discovery

Mechanical steps for discovering workspace council agents and intersecting with the host Task tool. **Selection scoring** (review depth, diff paths, plan keywords) lives in consumer recipes — e.g. [code-review agent-selection.md](../../code-review/references/agent-selection.md) for review.

Used by [`multi`](../SKILL.md) and consumer recipes that optionally spawn council agents.

## Discovery steps

```
1. DISCOVER ← parse frontmatter of every `.claude/agents/*.md` (name, description, dispatch)
2. HOST ← read Task tool subagent_type enum from host
3. AVAILABLE ← { agent.name | agent in DISCOVER, agent.dispatch.kind ≠ skip, agent.name ∈ HOST }
4. CONTEXT_FILTER ← exclude agents whose dispatch.contexts does not include active profile
                     (default [review] when omitted; manual/web may name agents explicitly)
5. If SELECTED empty after consumer scoring → fallback: host built-in subagent_type + slice in Task prompt
```

## Dispatch metadata (agent frontmatter)

Each `.claude/agents/*.md` file may declare:

```yaml
dispatch:
  kind: council          # council | skip — skip = never auto-dispatch
  contexts: [review, repo, plan]   # default [review] when omitted
  priority: 90             # tie-breaker when filling optional slots (higher first)
  depth:
    eligible: [standard, thorough, full]
    required_from: standard   # always spawn when depth >= this (review only)
  path_trigger: true       # also spawn when paths/keywords match
  paths:                   # prefix match on task paths
    - apps/backend/
  path_globs:              # glob match (e.g. **/*.tsx)
    - "**/*.tsx"
  keywords:                # case-insensitive match in diff or plan body
    - openapi
  model:
    default: standard      # fast | standard | premium
    premium_when: [thorough_or_full, ...]
  stances: [lens_id, ...]  # pick one per member for perspective diversity
```

**Legacy agents** without `dispatch:` — treat as `kind: council`, `contexts: [review]`, tier `standard`.

**Operational agents** (standalone audit paths) — set `kind: skip`; coordinator does not auto-select.

## Path and keyword matching

Shared helpers for consumer recipes that score agents:

- **Path prefix:** task path starts with entry in `dispatch.paths` (normalize trailing `/`).
- **Glob:** match task path against `dispatch.path_globs` (standard glob semantics).
- **Keyword:** substring in diff or plan body (case-insensitive); avoid ultra-common tokens.

### Plan path extraction

Coordinator reads plan/PRD file and collects:

- Backtick paths (`apps/...`, `tspackages/...`, `docs/...`)
- Markdown links to repo files
- Explicit "see `path`" citations

Pass as `task_paths[]` to consumer scoring.

## Model tier from agent metadata

1. Apply [multi parent-aware routing](../SKILL.md#parent-aware-routing) first: parent on Auto → inherit Auto (omit `model`) unless the user named a slug; skip tier→slug mapping for that member.
2. When the parent is **not** on Auto: start at `dispatch.model.default`.
3. Map tier to slug per [multi explicit routing](../SKILL.md#explicit-routing-parent-not-on-auto): **Standard → `composer-2.5-fast`**, **Fast → cheapest enum slug**, **Premium → deepest enum slug**.
4. Escalate to **premium** when `premium_when` signals match the task or global rules apply.
5. On usage-limit start/stop failures → [multi usage-limit retry](../SKILL.md#usage-limit-retry).

## Availability log (required in dispatch plan)

Before spawning, log:

```markdown
Profile: [review / repo / plan / manual / web — from consumer recipe]
Discovered: [all agent names from .claude/agents/]
Host supports: [subagent_type enum]
Available: [intersection after context filter]
Depth: [depth or n/a] · Budget: [N or n/a]

Required: [agent — reason]
Optional selected: [agent — score, matched paths/keywords]
Skipped: [agent — not eligible | wrong context | below threshold | not in HOST]
Fallbacks: [built-in type chosen when council agent unavailable]
```

## Adding a new council agent

1. Add `.claude/agents/<name>.md` with body + `dispatch:` frontmatter (include `contexts` when useful outside review).
2. Ensure host Task tool lists `<name>` as a valid `subagent_type` (or use a built-in type and put the lens in the Task prompt).
3. No skill table updates required.
