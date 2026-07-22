# Second opinion

**Source of truth for** unified written-artifact second opinion (no Stance A/B).

<!-- doc-meta: owner=eng | last-reviewed=2026-07-22 -->

Work on a **written** plan, PRD, or issue set — not Socratic explore. Always run **staged adversarial debate** via [`multi`](../multi/SKILL.md) — recipe [adversarial-debate.md](adversarial-debate.md) + [`multi` adversarial.md](../multi/references/adversarial.md) § Staged debate.

Former “fresh read” and “completeness verify” are **Wave-1 subagent roles** (`premises` + `completeness`), not user-chosen modes. Do not ask which stance to run.

**Not in scope:** security/compliance review (use the **security** agent), reproducible broken behavior (**investigate** + **testing** + **debug** when layer or session logs unclear). For broad proactive codebase sweeps, use [parallel-explore.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/planning/parallel-explore.md).

---

## Workflow

1. **Locate the artifact** — `.cursor/plans/*.plan.md`, `docs/prds/`, issue set, or ask for the path.
2. **Optional pre-wave gather** — large plans only: [parallel-plan-evidence.md](parallel-plan-evidence.md). Feeds wave-2 context / thin path hints — **not** a substitute for debate.
3. **Premise surface (coordinator, before or with synthesis)** — extract **3–6** implicit premises; invite the user to confirm/correct the top 2–3 when unsettled. If shipping in one shot, lead with **## Premises (please confirm or correct)** and label the rest provisional.
4. **Wave 1 — spawn two fresh-context attackers** (parallel Task/Subagent) per [adversarial-debate.md](adversarial-debate.md):
   - `premises` — outsider premise / goal / constraint attack
   - `completeness` — axis readiness attack (verify.md overlay as kill mandate)
5. **Wave 2 — spawn one related-context defender** after both attackers return: `defend` with artifact + 2–4 cited primary sources + structured attacker briefs.
6. **Synthesize** — one unified report (sections below). Tag claims `attacker-convergent` / `attacker-divergent` / `defended` / `conceded`.

**Hard gate:** Do not emit the final second-opinion report until **both waves** have completed Task runs. Coordinator-only critique is a **violation**.

If the user only asks “did I miss anything” or only “outsider read,” still run **both** attackers. Emphasis may weight synthesis, not spawn count.

### Structural deepening and scope

Synced with [dialogue-contract.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/dialogue-contract.md) § Structural checks — brief honest line in **Scope / complexity** or **Gaps**, not a second full audit:

- Does the plan **under-** or **over-** state structural / boundary work?
- Should the plan add a **milestone** for boundary or orchestration work?
- **Local change** vs **staged or ground-up** — cite dialogue-contract patterns when naming the call.

### Analysis framework (coordinator synthesis)

Cover all of these, briefly, using debate outcomes. Skip sections with nothing to flag.

**What's solid** — name 2–3 things the plan gets right (often from defender concessions / defended claims). Be specific, not flattering.

**Gaps** — missing steps, unaddressed cases, or work the plan assumes will "just happen" (completeness attacker + unrebutted premises).

**Hidden dependencies** — unordered prerequisites.

**Risky assumptions** — treated-as-given that could be wrong.

**Scope / complexity** — undersized vs oversized; structural notes when relevant.

**Axis / readiness** — scope, gaps, sequencing findings from the completeness attacker that survive or are conceded.

**Concrete suggestions** — for each issue, the specific plan change.

### Output format

```
## Premises (if not already settled in-thread)

- [Premise 1]
- [Premise 2]
- ...

## Debate tags (brief)

- [claim]: attacker-convergent | attacker-divergent | defended | conceded

## What's solid
...

## Gaps
...

## Hidden dependencies
...

## Risky assumptions
...

## Scope / complexity
[Include structural / deepening notes here when the lens applies — one short paragraph or bullets, not a full audit.]

## Axis / readiness
[Completeness-axis survivors after defender rebuttal]

## Recommended additions to the plan
- ...
```

### Principles

- Honest and objective. No softening language ("this is a great plan, but...").
- Cite specific file paths and line numbers from the plan when raising concerns.
- If the plan is genuinely complete, say so — don't manufacture criticism.
- Flag things the original author likely overlooked because they were too close to the problem.
- **Tone:** Direct on the work; never harsh toward the person holding the plan.
- Preserve unresolved attacker/defender conflict — do not flatten into false consensus.
