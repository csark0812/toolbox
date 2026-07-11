# Task Prompt — Review Overlays

Review-specific member prompt overlays. Generic template → [multi task-prompt.md](../../multi/references/task-prompt.md).

Orchestrated by [`code-review`](../SKILL.md) via [`multi`](../../multi/SKILL.md) kernel + [council-dispatch.md](council-dispatch.md).

## Default filing overlay (always)

**Non-negotiable:** Append to **coordinator dispatch plan** and **every** member Task `prompt` unless user explicitly requested improvements mode ([merge-blockers.md](merge-blockers.md)). Coordinator must verify each spawned member prompt includes this block before synthesis — if any member lacks it, re-spawn or append before merging findings.

```
Default filing: merge-blockers only
- File ONLY scope: ship-blocker — reachable production bugs (wrong behavior, data loss, auth/security on path)
- Do NOT file: test inventory, docs gaps, refactor, architecture nits, UX polish, RFC gaps without reachable client break
- Council depth unchanged — still read whole diff; narrow what you FILE
- Improvements mode only if user said: include improvements, full audit, hardening pass, polish, test inventory, or exhaustive triggers
```

## Review overlay

Include in the coordinator dispatch plan before spawning:

```
Mode: <mode>
Depth: <depth>  # after escalation per modes.md
Selected agents: <from agent-selection>
Diff source: <command from modes.md>
Mode overlay: "<overlay from modes.md>"
```

Append to each member Task `prompt`:

```
Review: [mode] at [depth] depth.

Diff:
<diff content>

Mode framing: <overlay from modes.md>

Apply your [agent-name] lens (map depth: Quick→quick, Standard→standard, Thorough→thorough, Full→full per agent file).
```

Synthesis → [synthesis.md](synthesis.md) then [output.md](output.md).

## Filing gate overlay

Append to **every** review member prompt and the coordinator dispatch plan (Thorough+):

```
Filing gate — apply [code-review-quality-gates.md](../../../../docs/developer/code-review-quality-gates.md) § Action bar before filing.
- Member output: Action findings under "### Action"; optional Noted candidates under "### Noted candidates" (one line each).
- Coordinator demotes failed Action candidates to Noted or Deferred tails at synthesis.
- Every Action must answer "How would this happen to a real user?" Include starting state, user action, runtime condition, and visible failure. If the path is only a code possibility without a plausible user trigger, mark Needs confirmation or do not file.
```

## Baseline invariant checklist overlay

When fix-loop baseline applies **and** diff touches extension embed/popup/background or `tspackages/query` history/mutations, append to coordinator plan and each member prompt:

```
Fix-loop: baseline (Full + invariant checklist)

Before filing findings, verify applicable checklist rows:
| Checklist item | Example root_cause |
| URL parity (read = write = cache = ingest keys) | history-url-key-migration |
| Nullish fallback semantics (what does falsy mean?) | popup-nullish-coalesce |
| closePanel vs togglePanel at all call sites | panel-close-semantics |
| Async stale-state on navigation during in-flight work | save-stale-async |
| Read-before-write: prefetch/cache failure must not block write | read-before-write |
| Dedup guards survive reset/retry/destination change | save-retry-history-dedup |

Synthesis rules:
- Default: merge-blockers only — ship-blocker rows only ([merge-blockers.md](merge-blockers.md))
- Merge same-theme high/medium symptoms into ONE primary finding per root_cause (variants → description bullets, not sibling blocks)
- invariant required on all high/medium themes at baseline
- scope: ship-blocker at baseline (unless improvements mode)
```

Full lifecycle: [review-fix-loop.md](../../../../docs/developer/review-fix-loop.md).

## Contextual Full re-review overlay

When **prior Action findings exist in thread or PR** (fix-loop pass 2+), run **Full** council (5 agents) on the whole diff, then compare to prior synthesis. Append to coordinator plan and each member prompt:

```
Fix-loop: contextual Full re-review
Prior synthesis: <from chat thread or PR review comment — paste summary or link>
Depth: Full · Agents: 5 (unchanged — do not downgrade because prior pass marked themes fixed)
Diff: git diff main...HEAD (whole branch scope)

Context rules (filing — depth unchanged): [review-fix-loop.md](../../../../docs/developer/review-fix-loop.md) § Contextual Full re-review

Task: Fresh independent review on full diff. Apply context rules when writing findings — do NOT skip reading because prior synthesis marked themes fixed.

Coordinator after synthesis: baseline comparison ([review-fix-loop.md](../../../../docs/developer/review-fix-loop.md) § Baseline comparison); output Baseline contradictions section ([output.md](output.md))
```

Full lifecycle: [review-fix-loop.md](../../../../docs/developer/review-fix-loop.md).

## Re-review overlay (deprecated name)

Same as [Contextual Full re-review overlay](#contextual-full-re-review-overlay) above. Older prompts may say "re-review overlay" — use contextual Full rules.
