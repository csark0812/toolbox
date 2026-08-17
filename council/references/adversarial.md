# Adversarial dispatch

<!-- source-of-truth: adversarial parallel and staged-debate shapes under [`council`](../SKILL.md). -->
<!-- doc-meta: owner=eng | last-reviewed=2026-08-16 -->

Spawn mechanics and synthesis → [`council` SKILL](../SKILL.md). Member shape → [member-schema.md](member-schema.md). Process skills own domain craft and final report shape.

## Shapes

| Shape             | Waves | Who                                                     | When                                                            |
| ----------------- | ----- | ------------------------------------------------------- | --------------------------------------------------------------- |
| **Parallel**      | One   | Independent kill-mandate members                        | code-review / probe stress-test via council                     |
| **Staged debate** | Two   | Wave 1 attackers → Wave 2 defender (sees wave-1 briefs) | Critique-shaped council jobs (e.g. layered with second-opinion) |

**Hard rule (same wave):** Members do not communicate. Never identical model + identical prompt.

**Staged exception:** Wave 2 may receive **coordinator-composed briefs** of wave-1 findings only — not live inter-member chat.

## Non-negotiables

1. **Real Task spawns** — one host Task per planned member per wave.
2. **Context asymmetry** — member prompts exclude parent-chat reasoning and other members' raw transcripts (except wave-2 briefs).
3. **Kill mandates** — do not ask for generic “critique.” Mandate breaking confidence or killing weak claims.
4. **One cycle** — one parallel round or one debate cycle (wave1→wave2→synth) unless the user asks for another.
5. **Claim anchoring** — every kill, promote, or concede must cite an artifact locus. Off-artifact critiques are **out of mandate**.

## Adversarial member fields

Append to [member-schema.md](member-schema.md):

```markdown
## Disposition

promote | kill | concede

## Kill rationale

[Why this claim should ship-block, be dropped, or be narrowed — or "n/a"]

## Anchor

[Artifact locus: plan § / premise id / file:line / diff hunk / criterion — required for kill or promote]

## Evidence

[Primary refs: file:line, plan section, test, or "none"]
```

## Context pack

Use the **Adversarial pack** block in [context-pack.md](context-pack.md).

## Model routing overlay

Follow [model-routing.md](model-routing.md). Under Auto parent with no user override → `inherit-auto` (omit tool `model`). Diversify via mandates, not premium models.

## Synthesis

1. Merge agreements; state once at highest shared confidence.
2. Tag each claim `convergent` (2+ independent members) vs `divergent` (1).
3. Preserve conflicts — do not flatten.
4. High-stakes Action contradictions → council tiebreaker or user.
5. Final user-facing shape → layered process skill (e.g. second-opinion Bottom line) when present.
