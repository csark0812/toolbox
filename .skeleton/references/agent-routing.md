# Agent ambient routing

<!-- doc-meta: owner=eng | last-reviewed=2026-07-03 -->

**SSOT:** Automatic task classification, severity tiers, inline skill invariants, and escalation. Edit here only; council dispatch in [agent-workflows.md](../../../docs/developer/agent-workflows.md); pre-artifact dialogue in [dialogue-handoffs.md](dialogue-handoffs.md).

Agents classify every task, apply the minimum thought process for the tier, and escalate to full skills when triggers fire. **Same behavior** hands-on and hands-off — only visibility differs (chat narration vs PR § Routing).

## Agent loop

Run on every turn that touches work product; **re-classify at boundaries**:

1. **Classify** — inputs → tier (default **up** on ambiguity: unsure → Medium, not Low).
2. **Announce** — hands-on: one-line routing; hands-off: defer to [PR § Routing](#pr--routing-hands-off).
3. **Invariant** — apply tier row from [routing table](#routing-table) before editing.
4. **Work** — implement, investigate, or answer.
5. **Boundary** — re-classify at checkpoints; escalate if scope grew.
6. **Ship** — validate; council and fix-loop per linked SSOT when High.

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
| Artifacts | `.cursor/plans/*.plan.md`, PRD paths, prior synthesis in thread |
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
| Plan artifact on disk (`.plan.md`, PRD) | Medium |
| Cross-package (`apps/` + `tspackages/`, client + backend) | High |
| User-facing surface (routes, extension, query domains) | High |
| Auth, payments, privacy, API schema | High |
| Prior Action findings in thread or PR | High |
| [modes.md](../code-review/references/modes.md) Full escalation triggers | High |

## Routing table

Escalation column **links SSOT** — do not duplicate thresholds here.

| Situation | Tier | Inline invariant (auto) | Escalate to (full) |
|-----------|------|-------------------------|-------------------|
| Any code edit | Low+ | Reuse check, [ai-drift.md](../../../docs/developer/ai-drift.md) write-time, `validate:changed` | — |
| Fuzzy intent | Medium | State 2–3 branches + assumption taken; one clarifying question if hands-on | Cross-surface → `.skeleton/customize/grill.md`; unresolved branches → [grill](../grill/SKILL.md) |
| Plan on disk | Medium | [verify.md](planning/verify.md) axis pass inline; list gaps and deferrals | Structural gaps → [second-opinion](../second-opinion/SKILL.md) Stance B |
| Specific doubt | Medium | Two ranked hypotheses; primary-source read; mini-verdict | Partial + boundary → full [investigate](../investigate/SKILL.md); wide scope → [multi](../multi/SKILL.md) + [parallel-broad.md](../investigate/references/parallel-broad.md) |
| Before implement (Medium+) | Medium | Branches, deps, falsifier ([grill](../grill/SKILL.md) extract); document open questions | Cross-package → High row |
| New feature end-to-end | Medium–High | Tracer bullet check — [issues-format.md](planning/issues-format.md) | Multi-domain → [build.md](planning/build.md) Step 3 |
| TanStack / UI touch | Medium+ | Domain skill extracts inline (keys, invalidation, a11y) | Cross-surface parity → consumer-local UI/components skill via customize |
| Pre-ship / PR | All | Consumer validate router on touched paths | [modes.md](../code-review/references/modes.md) → [code-review](../code-review/SKILL.md) council; user-facing paths → product-intent via customize |
| Post-review fix | High | Read prior synthesis; theme batch | Consumer review-fix-loop via customize |
| Reproducible bug | Medium | § Quality & ops handoff chain | see `.skeleton/customize/investigate.md` |

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

Preserved from former [skill-boundaries.md](skill-boundaries.md) — update handoff rules here when testing, debug, or investigate skills change.

### Trigger matrix

| Trigger | Route to |
|---------|----------|
| Failing test, CI, add/run tests | see `.skeleton/customize/investigate.md` or consumer **testing** skill |
| Unknown layer, session logs, cross-layer repro | see `.skeleton/customize/investigate.md` or consumer **debug** skill |
| Vague hunch, no repro yet | [investigate](../investigate/SKILL.md) |
| Passive test-coverage review in council | [code-review](../code-review/SKILL.md) → `correctness` agent |
| Building a **new feature** end-to-end | Tracer bullets — [issues-format.md](planning/issues-format.md) |
| Stack won't start, sandbox error | Consumer troubleshooting doc via customize |
| Prod/k8s logs | Consumer-local **k8s** or observability skill via customize |

### Handoffs

- Reproducible failure with a test → see `.skeleton/customize/investigate.md`
- **debug** may hand back to **testing** once repro is instrumented.
- Reproducible misbehavior with a specific code doubt → **investigate** + see `.skeleton/customize/investigate.md`

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
- Council dispatch: [agent-workflows.md](../../../docs/developer/agent-workflows.md) § Council agents
- Cold-start excerpt: [AGENTS.md](../../../AGENTS.md) § Ambient routing
