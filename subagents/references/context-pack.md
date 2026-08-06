# Context pack

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

**Source of truth for** what Task members receive — minimal, pointer-heavy, asymmetric to the parent chat. Spawn mechanics → [`subagents` SKILL](../SKILL.md). Member prompt shell → [task-prompt.md](task-prompt.md).

Entry skills own **domain pack shape**; this ref owns **shared token rules** and the **generic envelope header**.

## Token rules (all packs)

1. **Pointers not bodies** — paths, URLs, SHAs, plan § ids; never paste plans, PRDs, diffs, or full review synthesis into member prompts.
2. **Omit empty** — delete empty sections; do not pad with `none` or `—`.
3. **Context asymmetry** — members do not get the full user thread, coordinator synthesis, or other members' raw transcripts unless the entry skill explicitly allows structured briefs (e.g. second-opinion wave 2).
4. **Coordinator composes** — one copyable block per member; duplicate context across parallel members only when slices overlap.

## Header vocabulary (open menus)

Name reality in the header; tables are starting points, not limits.

| Field      | Used by                        | Examples                                                                      |
| ---------- | ------------------------------ | ----------------------------------------------------------------------------- |
| `Pack:`    | handoff                        | `pointers`, `fix-loop`, `slice`, `full`, user-named                           |
| `Goal:`    | handoff, iterate intent        | `implement`, `review`, `diagnose`, `investigate`, `iterate-slice`, user-named |
| `Surface:` | code-review (alias: `source:`) | `branch`, `paths`, `snapshot`, `pr` — see code-review output header           |
| `Lens:`    | code-review, review council    | `security`, `cleanliness`, `merge-readiness`, user phrase                     |
| `Slice:`   | iterate (coordinator header)   | short id — path glob, plan § id, or intent slug                               |
| `Adapter:` | iterate (member envelope)      | `code`, `plan-section` — full block in slice-envelope                         |
| `channel:` | handoff                        | `prompt`, `artifact`                                                          |

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

| Job                      | Pack shape                          | Recipe                                                                                                                                                                                                                                        |
| ------------------------ | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Handoff artifact         | `channel` + `Pack` + `Goal`         | [handoff/pack.md](../../handoff/references/pack.md) · [output.md](../../handoff/references/output.md)                                                                                                                                         |
| Iterate blind pass       | frozen slice envelope               | [iterate/slice-envelope.md](../../iterate/references/slice-envelope.md) — coordinator `Slice:` = short id; member gets full envelope block. Bounded in-slice excerpts (paths + line ranges) ok; never full PR diffs or coordinator narrative. |
| Parallel review council  | `Surface` + `Lens` + path slice     | [review-council-dispatch.md](review-council-dispatch.md)                                                                                                                                                                                      |
| Adversarial kill mandate | artifact + criteria                 | [Adversarial pack](#adversarial-pack) below · [adversarial.md](adversarial.md)                                                                                                                                                                |
| Second-opinion wave 1    | artifact only                       | [adversarial.md](adversarial.md) § Staged debate                                                                                                                                                                                              |
| Second-opinion wave 2    | artifact + primary sources + briefs | [adversarial.md](adversarial.md) § Staged debate                                                                                                                                                                                              |

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

Orchestrators (**subagents**, **iterate**, **handoff**) wire agent-to-agent work. Process skills describe what happens and call orchestrators when needed — see [tiers.md](../../docs/tiers.md).

Fix-loop-only next session: prefer **handoff** `Pack: fix-loop` or consumer overlay — not `Pack: full`.

## Typical chains (pointers only)

| Phase            | Skill                       | Pack / surface hint                     |
| ---------------- | --------------------------- | --------------------------------------- |
| Plan critique    | **second-opinion**          | artifact path only                      |
| Design dialogue  | **grill** / **crystallize** | —                                       |
| Slice cohesion   | **iterate**                 | slice envelope in-session               |
| Merge / PR       | **code-review**             | `source:branch` or `pr`                 |
| Context full     | **handoff**                 | `Pack: pointers` or `fix-loop` + Goal   |
| Hard bug         | **diagnose**                | repro pointer in handoff Goal if needed |
| Persist decision | **domain-model**            | ADR path in handoff Pointers            |

Each hop uses pointers at the prior artifact — do not replay full bodies in the next skill.
