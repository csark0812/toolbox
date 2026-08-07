# Handoff output

<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

Minimal shape for **prompt** (inline) and **artifact** (file). Omit empty sections — do not pad.

User-facing blocks (Goal, Start with, State, Blockers, Failed, Next, paste stub) must use pragmatic STE. See [docs/skill-evolution.md](../../docs/skill-evolution.md) § Pragmatic STE for toolbox, or `/simple-english`.

## Header (required)

```markdown
Handoff · channel:prompt|artifact · Pack:pointers|fix-loop|slice|full · Goal:[slug] · Workspace:[absolute path]
```

| Field        | Notes                                                 |
| ------------ | ----------------------------------------------------- |
| `channel:`   | `prompt` or `artifact`                                |
| `Pack:`      | Closest pack from [pack.md](pack.md). User-named ok.  |
| `Goal:`      | Next-session intent — slug in header + one line below |
| `Workspace:` | Where next chat must root for `@` attach              |

## Body (artifact file or prompt fence)

```markdown
Goal: [one line]
Start with: [first action — one line]

## State

- [done / in-progress / broken — minimal bullets]

## Pointers

| kind | path or URL |
| plan | `.cursor/plans/foo.plan.md` |
| pr | https://github.com/.../pull/N |

## Blockers

- [only if non-empty]

## Failed

- [only if non-empty — pointer + one-line why]

## Next

- [only if non-empty]

## Redaction

[what was redacted, or omit if none]
```

**Do not** paste plan bodies, diff hunks, or full review synthesis. **Do not** fill Blockers/Failed/Next with `none` — delete the section.

## Paste stub (after artifact write)

Coordinator ends with — do **not** paste artifact body:

```text
Open workspace: <absolute path>

Read @_agent/handoffs/<filename>.md and continue.

Goal: <one line>
Start with: <one line>
```

Prompt-only channel: same fields inline under `---` fences. Note `prompt-only` when helpful.

## Fix-loop pack shortcut

When `Pack: fix-loop`, State can be one line. Pointers must include PR/commit/theme ids if known. Skip long recap unless cold start requires it.
