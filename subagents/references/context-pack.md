# Context pack

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

**Source of truth for** shared composability vocabulary and what Task members receive — minimal, pointer-heavy, asymmetric to the parent chat. Spawn mechanics → [`subagents` SKILL](../SKILL.md). Member prompt shell → [task-prompt.md](task-prompt.md).

Process skills define **entry gates, non-negotiables, and exit artifacts** only. **No routing tables** — layered prompts (multiple skills attached, or one prompt naming several modes) compose by overlapping scope on this vocabulary.

## Composability (layered prompts)

When the user attaches multiple skills or names several modes on the same **Slice** or **Artifact**, every active atom applies its non-negotiables. Conflicts resolve by **entry gates** (stop and ask), not by cross-skill links.

| Primitive    | Meaning                                      | Examples                                                                  |
| ------------ | -------------------------------------------- | ------------------------------------------------------------------------- |
| **Slice**    | Bounded work unit — code paths, plan §, slug | `src/auth/**`, plan § "OAuth", envelope id `session-attach`               |
| **Artifact** | Written object on disk                       | plan path, PRD, ADR draft, handoff file                                   |
| **Surface**  | Review/diff adapter (alias `source:`)        | `branch`, `pr`, `paths`, `snapshot`                                       |
| **Lens**     | Review or critique stance                    | `security`, user phrase, invented kebab-case (`brand-fit`, `premises`, …) |
| **Seam**     | Public test boundary (tdd)                   | module API, CLI entry, HTTP handler                                       |
| **Repro**    | On-demand failing signal (probe Fix)         | red test cmd, CI log, repro steps                                         |
| **Closure**  | Atom considers itself settled                | `Closure: ready`, crystallized block, cited verdict                       |
| **Pass**     | Review pass kind                             | `blind` (iterate member) vs coordinator                                   |

**Overlap rule:** Same `Slice:` → **tdd** (red-green cycles), **iterate** (blind cohesion passes), **code-review** (evidence filing) may all apply without any skill naming another. Different primitives → gates apply independently (e.g. **second-opinion** needs an **Artifact**; **tdd** needs a **Seam**).

## Token rules (all packs)

1. **Hard ceiling — 100k context** — total material across coordinator + all members in one dispatch run must stay **under 100k tokens**. Split slices, shrink excerpts, or serialise passes — never exceed. See [task-splitting.md](task-splitting.md).
2. **Pointers not bodies** — paths, URLs, SHAs, plan § ids; never paste plans, PRDs, diffs, or full review synthesis into member prompts.
3. **Omit empty** — delete empty sections; do not pad with `none` or `—`.
4. **Context asymmetry** — members do not get the full user thread, coordinator synthesis, or other members' raw transcripts unless the entry skill explicitly allows structured briefs (e.g. second-opinion wave 2).
5. **Coordinator composes** — one copyable block per member; duplicate context across parallel members only when slices overlap.

## Header vocabulary (open menus)

Name reality in the header; tables are starting points, not limits.

| Field      | Used by                        | Examples                                                               |
| ---------- | ------------------------------ | ---------------------------------------------------------------------- |
| `Pack:`    | handoff                        | `pointers`, `fix-loop`, `slice`, `full`, user-named                    |
| `Goal:`    | handoff, iterate intent        | `implement`, `review`, `probe`, `explore`, `iterate-slice`, user-named |
| `Surface:` | code-review (alias: `source:`) | `branch`, `paths`, `snapshot`, `pr` — see code-review output header    |
| `Lens:`    | code-review, review council    | `security`, `cleanliness`, `merge-readiness`, user phrase              |
| `Slice:`   | iterate, tdd, code-review      | short id — path glob, plan § id, or intent slug                        |
| `Seam:`    | tdd                            | public interface under test                                            |
| `Adapter:` | iterate (member envelope)      | `code`, `plan-section` — full block in slice-envelope                  |
| `Closure:` | iterate                        | `ready` \| `open`                                                      |
| `Pass:`    | iterate                        | `blind`                                                                |
| `channel:` | handoff                        | `prompt`, `artifact`                                                   |

`source:` in code-review status headers maps to the same adapter slug as `Surface:` — do not rename output headers without a consumer migration.

## Generic member envelope

Paste into member Task prompts after the [task-prompt.md](task-prompt.md) shell:

```markdown
### Context pack · [job] · [stance or lens]

- **Intent / Goal:** [one line]
- **Source:** [paths, URLs, artifact ref — bodies forbidden]
- **Scope:** [inclusions]
- **Out of scope:** [exclusions — or omit if none]
- **Constraints:** [link entry-skill ref; redact secrets before paste]
```

## Domain recipes (procedure in entry skill)

| Job                               | Pack shape                         | Recipe                                                                                                                                                                                                                                        |
| --------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Handoff artifact                  | `channel` + `Pack` + `Goal`        | [handoff/pack.md](../../handoff/references/pack.md) · [output.md](../../handoff/references/output.md)                                                                                                                                         |
| Iterate blind pass                | frozen slice envelope              | [iterate/slice-envelope.md](../../iterate/references/slice-envelope.md) — coordinator `Slice:` = short id; member gets full envelope block. Bounded in-slice excerpts (paths + line ranges) ok; never full PR diffs or coordinator narrative. |
| TDD microcycle                    | `Slice` + `Seam`                   | [tdd/SKILL.md](../../tdd/SKILL.md) — coordinator owns red-green; shares `Slice:` with iterate when both active.                                                                                                                               |
| Parallel review council           | `Surface` + `Lens` + path slice    | [review-council-dispatch.md](review-council-dispatch.md)                                                                                                                                                                                      |
| Adversarial kill mandate          | artifact + criteria                | [Adversarial pack](#adversarial-pack) · [adversarial.md](adversarial.md)                                                                                                                                                                      |
| Second-opinion adversarial review | artifact + invented lenses + depth | [second-opinion-dispatch.md](second-opinion-dispatch.md) · optional [second-opinion-evidence-dispatch.md](second-opinion-evidence-dispatch.md) (deep only)                                                                                    |
| Explore escalation (optional)     | hunch + slice                      | [explore-escalation-dispatch.md](explore-escalation-dispatch.md)                                                                                                                                                                              |

Coordinator picks closest row, then follows that skill's ref for fill-in — do not merge domains into one mega-prompt.

## Adversarial pack

When kill mandates apply ([adversarial.md](adversarial.md)):

```markdown
### Context pack · adversarial · [stance]

Artifact:
[plan path | diff ref | hunch target — subject only]

Requirements / acceptance (if any):
[stated criteria — or omit]

Constraints:

- Do not assume other members' conclusions.
- Do not invent parent-chat conclusions.
- Anchor every kill/promote/concede to an artifact locus (§ id, premise id, file:line, diff hunk, criterion).
- Return only your mandate; coordinator synthesizes.

Output: [member-schema.md](member-schema.md) + adversarial fields in adversarial.md
```

Ban phrases like “prior chat concluded…” or dumping coordinator synthesis into wave-1 prompts.

## Cross-session vs in-session

Orchestrators (**subagents**, **iterate**, **handoff**) wire agent-to-agent work. Process skills are **atoms** — compose via layered prompts and shared headers above, not hub routing docs.

Fix-loop-only next session: prefer **handoff** `Pack: fix-loop` or consumer overlay — not `Pack: full`.
