# Agent discovery

<!-- doc-meta: owner=eng | last-reviewed=2026-09-01 -->

Mechanical steps for discovering workspace council agents and intersecting with the host Task tool. **Selection scoring** lives in process-skill recipes when they define it.

Used by [`council`](../SKILL.md) when optionally spawning named council agents.

## Discovery steps

```
1. DISCOVER ← parse frontmatter of every `.claude/agents/*.md` (name, description, dispatch)
2. HOST ← read Task tool subagent_type enum from host
3. AVAILABLE ← { agent.name | agent in DISCOVER, agent.dispatch.kind ≠ skip, agent.name ∈ HOST }
4. CONTEXT_FILTER ← exclude agents whose dispatch.contexts does not include active profile
                     (default [review] when omitted. manual/web can name agents explicitly)
5. If SELECTED empty after scoring → fallback: host built-in subagent_type + slice in Task prompt
```

## Dispatch metadata (agent frontmatter)

Each `.claude/agents/*.md` file can declare:

```yaml
dispatch:
  kind: council # council | skip — skip = never auto-dispatch
  contexts: [review, repo, plan] # default [review] when omitted
  priority: 90 # tie-breaker when filling optional slots (higher first)
  depth:
    eligible: [standard, thorough, full]
    required_from: standard # always spawn when depth >= this (review only)
  path_trigger: true # also spawn when paths/keywords match
  paths: # prefix match on task paths
    - <backend-or-api-root>/
  path_globs: # glob match (for example, **/*.tsx)
    - '**/*.tsx'
  keywords: # case-insensitive match in diff or plan body
    - openapi
  model:
    default: standard # fast | standard | premium
    premium_when: [thorough_or_full, ...]
  stances: [lens_id, ...] # pick one per member for perspective diversity
```

**Legacy agents** without `dispatch:` — treat as `kind: council`, `contexts: [review]`, tier `standard`.

**Operational agents** (standalone audit paths) — set `kind: skip`. The coordinator does not auto-select.

## Path and keyword matching

- **Path prefix:** task path starts with entry in `dispatch.paths` (normalize trailing `/`).
- **Glob:** match task path against `dispatch.path_globs`.
- **Keyword:** substring in diff or plan body (case-insensitive). Avoid ultra-common tokens.

### Plan path extraction

Coordinator reads plan/PRD file and collects backtick paths, markdown links to repo files, and explicit “see `path`” citations. Pass as `task_paths[]` to scoring.

## Model tier from agent metadata

Agent `dispatch.model.default` and `premium_when` are **tier metadata**, not spawn instructions.

1. Resolve the member model with [routing precedence](model-routing.md#routing-precedence-canonical-order).
2. Pass the [pre-spawn gate](model-routing.md#pre-spawn-model-routing-gate).
3. Under an Auto parent without a user override: plan `model=inherit-auto` and omit the tool `model` argument.
4. Tier→slug mapping is only for the named-parent branch. When it applies, use [model-routing.md](model-routing.md) for cost/fit and anti-fast rules.

## Availability log (required in dispatch plan)

```markdown
Profile: [review / repo / plan / manual / web]
Discovered: [all agent names from .claude/agents/]
Host supports: [subagent_type enum]
Host model enum: [Task model enum — never invent slugs]
Parent model: [Auto | <named model>]
User model overrides: [none | member=slug, …]
Auto reachable: [inherit-auto | model=auto | no]
Billing pool: [first-party | API | mixed]
Available: [intersection after context filter]
Required: [agent — reason]
Optional selected: [agent — score, matched paths/keywords]
Skipped: [agent — reason]
Fallbacks: [built-in type chosen when council agent unavailable]
Explicit model slugs used: [none | slug + reason]
Fast variants used: [none | slug + latency reason]
```

## Adding a new council agent

1. Add `.claude/agents/<name>.md` with body + `dispatch:` frontmatter.
2. Make sure the host Task tool lists `<name>` as a valid `subagent_type`, or use a built-in type and put the lens in the Task prompt.
3. No skill table updates required.
