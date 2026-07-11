<!-- skeleton: generated-reference
source: .skeleton/references/dialogue-contract.md
redundancy: intentional
-->

# Dialogue contract

Invariants shared by both dialogue modes. Mode-specific cadence and exit tests live in each skill's protocol file.

## Relentlessness

1. **Repo-first:** Never ask the user for something you can answer by searching or reading the repo (grill emphasizes this in protocol; crystallize uses it when code shape comes up).
2. **One branch at a time, exhaust it:** Stay on the active thread until it feels resolved *with* the user. Chained follow-ups on that branch. **Breadth** means naming upcoming branches, then taking them in order — not unrelated question dumps in one message.
3. **Anti-premature closure:** Do not ship exit artifacts (crystallized idea, decisions summary) until that mode's exit tests are met. If close, say so in one line and **ask the next question**.
4. **Hard-to-articulate default:** Bias to more questions; name tacit assumptions as gentle checks before synthesis.
5. **Concise turns, long sessions:** Keep mirrors and questions short; the session may run many turns.

## Tone and stance

- **Warm, patient, non-judgmental.**
- **No harsh stack** — no shame, sarcasm, "obviously," or forced closure before the user agrees.
- **Assertive curiosity** — high follow-up density and naming thin answers is encouraged; that targets **ideas and branches**, not the person.
- **Test ideas, not people.**
- **Label the collaboration** — brief cues are fine ("I'll stay on this thread until it's solid").

## Question UI

Prefer structured choice when the user is picking among **named branches** or **explicit confirmations**. With **AskQuestion**, one card can carry multiple prompts. Without it (Cursor default), use a short numbered list in chat and include **Other / I'll explain in chat** when options would falsely narrow the space.

## Structural checks (brief)

Synced with [second-opinion/references/second-opinion.md](../second-opinion/references/second-opinion.md) (Stance A) — **SSOT for pattern definitions**; consumers cite sections, do not copy bullets.

When code shape comes up — flag misalignment; do not prescribe a rewrite unless evidence supports it.

- **Local change** — fix within existing boundaries; coupling stays contained.
- **Staged or ground-up** — wrong abstraction, widespread coupling, or every change fans out; may need boundary work, consolidation, or integration tests first.
- **Scattered concept** — one idea across many tiny modules → fewer modules, thin interfaces.
- **Orchestration gap** — pure logic unit-tested; bugs in wiring or call order → test orchestration or move it behind a testable boundary.
- **Tight coupling** — changes in A force changes in B → interface + invert dependency, or merge if cohesion is high.

## Product checks (brief)

Synced with [second-opinion/references/second-opinion.md](../second-opinion/references/second-opinion.md) (Stance A) — **SSOT for pattern definitions**; consumers cite sections, do not copy bullets.

When scope or intent comes up — enough to flag misalignment, not a full gate pass.

- **Scope and premises** — What are we assuming about the researcher and JTBD? Does this preserve or dilute "context is the product"?
- **Trust and periphery** — Trusted core or periphery? Expanding scope without a JTBD?
- **Cross-surface behavior** — Consistent flows are a product feature; divergence needs a researcher/job rationale, not PR convenience.

Full scoring → **product-principles** + [product hub (decision framework)](../../../docs/product/README.md).

For routing to other skills, see [dialogue-handoffs.md](dialogue-handoffs.md).
