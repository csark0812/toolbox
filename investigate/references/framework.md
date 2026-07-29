# Investigation framework

One loop for code, docs, data, and research claims. Phases may weave — repo read → external claim check → back to code (or reverse). Do not announce a "track" to the user; apply the same loop to whatever primary material is in play.

Uses the **investigate** verdict: Confirmed | Refuted | Partial plus a one- or two-line explanation. **Find and verdict only** through the evidence pass — not the fix. After the verdict, hand off or exit find-only as below.

## Loop

1. **Narrow** until primary material is purposeful (clarification chain in main skill).
2. **Hypothesize** — 2–4 ranked, falsifiable hypos. Prefer mechanism/model over situation guesses.
3. **Disconfirm-first** — cheapest evidence that would kill each hypo before confirmatory reads.
4. **Primary material** — read the actual code, document, dataset, or cited source.
5. **Forage or leave** — follow scent; if 2–3 reads yield no signal, leave the patch and re-rank (may switch material class).
6. **Re-enter** when new leads appear (weave allowed).
7. **Verdict** — citable locus + Confirmed / Refuted / Partial + one- or two-line explanation.

```mermaid
flowchart LR
  narrow[Narrow target] --> hypos[Ranked hypos]
  hypos --> disconfirm[Disconfirm first]
  disconfirm --> primary[Primary material]
  primary --> forage[Forage or leave]
  primary --> lateral[Lateral read if external]
  forage --> more[More primary as needed]
  lateral --> more
  more --> verdict[Verdict]
```

## Domain moves (same loop)

| Move | When | How |
| --- | --- | --- |
| **Repo forage** | Hunch points at code, config, or in-repo docs | Follow scent: callers, callees, tests, error sites, related types. Prefer dependency slices over whole-file reads when the hunch is localized. |
| **Locate-to-cite** | Behavioral code hunch | Narrow to `file:line` (or config key, failing path) sufficient for the verdict — then **stop**. Do not bisect-as-repair or implement the fix. |
| **Lateral read** | Claim depends on web/docs/vendor material | Leave the page quickly; check who else says this; note source class (primary vs secondary, official vs commentary). |
| **Source class** | Before Confirmed/Partial on non-repo material | State what kind of source supports the claim. Conflicting independents → Partial or parallel-perspective. |

## When to escalate (multi)

| Situation | Recipe |
| --- | --- |
| User asks to fish broadly | [parallel-broad.md](parallel-broad.md) |
| Multiple independent topics, no single hunch | [parallel-research.md](parallel-research.md) — then back here if a specific claim remains |
| Genuinely mixed or contested evidence | [parallel-perspective.md](parallel-perspective.md) |

## Handoffs (after verdict)

| Next need | Where |
| --- | --- |
| Implement the fix, repro, make tests pass | Hub **diagnose** / **tdd** when installed; else consumer **testing** / **debug** or `AGENTS.md` (Quality & ops). |
| User explicitly asks to fix / repro / implement | **Exit find-only** — stop applying investigate no-fix constraints; follow the request or the named consumer skill. |
| Still fuzzy on intent | **crystallize** |
| Written plan to critique | **second-opinion** |
| Pressure-test design before build | **grill** |

## Anti-patterns

- Tool rankings or "likely file" lists as evidence — read primary material.
- Single-cause theater when multiple mechanisms fit the evidence.
- Implementing the fix during the evidence pass (before verdict / without an explicit post-verdict fix request).
- Hard-requiring **diagnose** / **tdd** / **testing** / **debug** when absent — fall back to consumer routing or `AGENTS.md`.
- Heavy hypothesis matrices or formal ACH tables in user-facing output — keep competing hypos + disconfirm-first only.
