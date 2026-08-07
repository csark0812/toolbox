# Adversarial dispatch

**Source of truth for** adversarial parallel and staged-debate recipes on [`subagents`](../SKILL.md).

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Spawn mechanics, Auto-first model routing, and synthesis gate → [`subagents` SKILL](../SKILL.md). Member shape → [member-schema.md](member-schema.md). Entry skills own domain overlays and final report shape.

## Shapes

| Shape             | Waves | Who                                                     | Default entry                                                                 |
| ----------------- | ----- | ------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Parallel**      | One   | Independent kill-mandate members                        | `code-review` when escalated to council; `probe` when contested / stress-test |
| **Staged debate** | Two   | Wave 1 attackers → Wave 2 defender (sees wave-1 briefs) | `second-opinion` (always)                                                     |

**Hard rule (same wave):** Members do not communicate. Never identical model + identical prompt.

**Staged exception:** Wave 2 may receive **coordinator-composed briefs** of wave-1 findings only — not live inter-member chat. That is the intentional back-and-forth.

## Non-negotiables

1. **Real Task spawns** — one host Task/Subagent per planned member per wave ([subagents Non-negotiables](../SKILL.md#non-negotiables)).
2. **Context asymmetry** — member prompts exclude parent-chat reasoning, builder justifications, and other members' raw transcripts (except wave-2 briefs, structured by the coordinator).
3. **Kill mandates** — do not ask for generic “critique.” Mandate breaking confidence or killing weak claims.
4. **One cycle** — one parallel round or one debate cycle (wave1→wave2→synth) unless the user asks for another.
5. **Empirical preference** — when a claim is falsifiable in-repo, prefer primary evidence / tests over model agreement.
6. **Claim anchoring** — every kill, promote, or concede must cite an artifact locus (plan section, premise id, `file:line`, diff hunk, or stated acceptance criterion). Off-artifact critiques are **out of mandate** — do not file them as convergent or ship-blocking.

## Context pack

Shared token rules + generic envelope → [context-pack.md](context-pack.md). Use the **Adversarial pack** block there for wave prompts; append adversarial fields below to member output. Ban phrases → context-pack § Adversarial pack.

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

## Model routing overlay

Follow [subagents Model assignment](../SKILL.md#model-assignment) and [model-routing.md](model-routing.md).

| Situation                                                                        | Member `model`                                                                                                                  |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Auto parent, no user override                                                    | `inherit-auto` (omit tool `model`) — **default**                                                                                |
| Named parent, no cross-model request                                             | Prefer `auto` when in enum; else cheapest good enough same tier                                                                 |
| User says cross-model / different models, **or** named parent + diversity wanted | Distinct **same-tier** family slugs from host enum across attackers — **never** escalate tier or use `*-fast` just to diversify |
| User names a member model                                                        | That slug if in enum                                                                                                            |

Shared Auto across adversarial members is correct and still valuable (fresh context + kill mandates).

## A. Parallel adversarial

### When / skip

- **On escalation** for `code-review` council (entry skill applies kill-mandate overlays on depth-budgeted lenses).
- `probe` when evidence is contested or the user asks for a stress-test.
- Skip for routine coverage gather/explore unless an entry skill invokes it.

### Members

Same material, independent mandates. Entry skill picks budget and stance ids.

Typical pair when not using domain lenses:

| Stance     | Mandate                                                       |
| ---------- | ------------------------------------------------------------- |
| `attacker` | Strongest reasons to reject / confirm risk                    |
| `refuter`  | Kill weak or false findings; mechanisms that prevent the risk |

Code-review: keep lens selection; every member gets a kill mandate for their lens; budget ≥ 2 reserves one `refuter` slot (prefer dropping lowest-scored **optional** lens, never a required agent). Quick (1) = single lens with attacker mandate only.

### Synthesis

1. Merge agreements; state once at highest shared confidence.
2. Tag each claim `convergent` (2+ independent members) vs `divergent` (1).
3. Preserve conflicts — do not flatten.
4. Divergent high-severity claims need stronger primary evidence or demotion (entry skill filing rules).
5. Do not treat unanimous same-family agreement as proof.
6. High-stakes Action contradictions → subagents tiebreaker or user.

## B. Staged debate

Full and light recipes → [second-opinion-dispatch.md](second-opinion-dispatch.md). Synthesis shape → [second-opinion plan-review.md](../../second-opinion/references/plan-review.md).

- **Default shape** for **second-opinion** on a written artifact (path or paste) — **full** or **light** cast per plan-review routing; spawn only selected members.
- Elsewhere only when a process skill cites this shape.
- Not a substitute for dialogue (**grill**).
- Single-member orchestrator spawns (e.g. **iterate** blind pass) → [carve-out](../SKILL.md#entry-skill-carve-out), not this section.

Optional pre-wave gather → [second-opinion-evidence-dispatch.md](second-opinion-evidence-dispatch.md) (large **full** cast only).
