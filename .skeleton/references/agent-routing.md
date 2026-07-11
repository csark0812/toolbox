# Agent ambient routing

<!-- doc-meta: owner=eng | last-reviewed=2026-07-11 -->

**SSOT:** Automatic task classification, severity tiers, inline skill invariants, and escalation. Edit here only; pre-artifact dialogue in [dialogue-handoffs.md](dialogue-handoffs.md).

Agents classify every task, apply the minimum thought process for the tier, and escalate to full skills when triggers fire. **Same behavior** hands-on and hands-off — only visibility differs (chat narration vs PR § Routing).

## Agent loop

Run on every turn that touches work product; **re-classify at boundaries**:

1. **Classify** — inputs → tier (default **up** on ambiguity: unsure → Medium, not Low).
2. **Announce** — hands-on: one-line routing; hands-off: defer to [PR § Routing](#pr--routing-hands-off).
3. **Invariant** — apply tier row from [routing table](#routing-table) before editing.
4. **Work** — implement, investigate, or answer.
5. **Boundary** — re-classify at checkpoints; escalate if scope grew.
6. **Ship** — validate; council and fix-loop when High.

**Boundaries (mandatory re-classify):**

- Before first implement commit (code, not docs-only)
- Before PR create or declaring done
- After prior review Action findings appear in thread or PR
- When scope expands mid-task (cross-package, new user-facing surface)

## Classifier inputs

| Input | Source |
|-------|--------|
| User intent | Message text, explicit mode ("fix", "implement", "review") |
| Diff shape | Files touched, packages crossed, line count |
| Artifacts | Plan / PRD paths on disk, prior synthesis in thread |
| Thread history | Action findings, fix-loop state |
| Task type | Feature / bug / refactor / docs — [build.md](planning/build.md) Step 2 |

## Severity tiers

| Tier | Meaning |
|------|---------|
| **Low** | Hygiene, localized, reversible — rules + validate only |
| **Medium** | Non-trivial or artifact exists — inline skill invariant (seconds, not full ceremony) |
| **High** | Boundary, cross-surface, auth/API, review debt — full skill procedure |

### Default tier by signal

| Signal | Default tier |
|--------|--------------|
| Single file, docs-only, explicit quick fix | Low |
| Multi-file same package; bug with repro; single-module refactor | Low–Medium (Medium if behavior change) |
| Intent vague, scope unnamed ("improve X") | Medium |
| Plan artifact on disk | Medium |
| Cross-package or cross-service | High |
| User-facing surface | High |
| Auth, payments, privacy, API schema | High |
| Prior Action findings in thread or PR | High |
| [modes.md](../code-review/references/modes.md) Full escalation triggers | High |

## Routing table

Escalation column **links SSOT** — do not duplicate thresholds here.

| Situation | Tier | Inline invariant (auto) | Escalate to (full) |
|-----------|------|-------------------------|-------------------|
| Any code edit | Low+ | Reuse check; validate touched paths | — |
| Fuzzy intent | Medium | State 2–3 branches + assumption taken; one clarifying question if hands-on | Unresolved branches → [grill](../grill/SKILL.md) |
| Plan on disk | Medium | [verify.md](planning/verify.md) axis pass inline; list gaps and deferrals | Structural gaps → [second-opinion](../second-opinion/SKILL.md) Stance B |
| Specific doubt | Medium | Two ranked hypotheses; primary-source read; mini-verdict | Partial + boundary → full [investigate](../investigate/SKILL.md); wide scope → [multi](../multi/SKILL.md) + [parallel-broad.md](../investigate/references/parallel-broad.md) |
| Before implement (Medium+) | Medium | Branches, deps, falsifier ([grill](../grill/SKILL.md) extract); document open questions | Cross-package → High row |
| New feature end-to-end | Medium–High | Tracer bullet check — [issues-format.md](planning/issues-format.md) | Multi-domain → [build.md](planning/build.md) Step 3 |
| UI / cross-surface touch | Medium+ | Note parity questions inline | Cross-surface design → [grill](../grill/SKILL.md) |
| Pre-ship / PR | All | Validate touched paths | [modes.md](../code-review/references/modes.md) → [code-review](../code-review/SKILL.md) |
| Post-review fix | High | Read prior synthesis; theme batch | [code-review](../code-review/SKILL.md) contextual re-review |
| Reproducible bug | Medium | § Quality & ops | [investigate](../investigate/SKILL.md) |

## PR § Routing (hands-off)

Mandatory on **Medium+** when creating or updating a PR:

```markdown
## Routing
- **Tier:** Low | Medium | High
- **Signals:** [what triggered tier]
- **Invariant applied:** [branches assumed / verify gaps / investigate verdict]
- **Escalations:** [skills spawned, or none]
- **Open questions:** [deferred with rationale, or none]
```

## Quality & ops

### Trigger matrix

| Trigger | Route to |
|---------|----------|
| Vague hunch, no repro yet | [investigate](../investigate/SKILL.md) |
| Reproducible misbehavior | [investigate](../investigate/SKILL.md) |
| Passive holistic review at ship | [code-review](../code-review/SKILL.md) |
| Building a **new feature** end-to-end | Tracer bullets — [issues-format.md](planning/issues-format.md) |

### Handoffs

- Reproducible misbehavior with a specific code doubt → **investigate**.

## Skill extracts (ambient)

Full user-paced sessions remain user-invoked (`disable-model-invocation: true`). Ambient routing applies **extracts** only:

| Skill | Inline extract |
|-------|----------------|
| [crystallize](../crystallize/SKILL.md) | Mirror intent; one assumption check before shaping |
| [grill](../grill/SKILL.md) | Branches, deps, falsifier — not multi-turn dialogue |
| [second-opinion](../second-opinion/SKILL.md) | Axis checklist on artifacts — not full Stance A critique |
| [investigate](../investigate/SKILL.md) | Hypotheses + primary source + verdict |
| [code-review](../code-review/SKILL.md) | Council at ship boundaries per modes.md |

## Related

- Pre-artifact dialogue routing: [dialogue-handoffs.md](dialogue-handoffs.md)
- Council dispatch: [council-dispatch.md](../code-review/references/council-dispatch.md)
