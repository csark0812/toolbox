# Slice envelope

<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

Mixed entry: user supplies **intent**. Coordinator derives a **frozen envelope** before each blind pass.

Member envelope rules → [`subagents` context-pack.md](../../subagents/references/context-pack.md).

## Steps

1. **Listen** — capture user intent (feature, plan §, module behavior, invariant class).
2. **Repo-first expand** — search/read to bound paths, symbols, plan section ids, linked decisions.
3. **Write envelope block** — explicit, copyable into blind dispatch. Coordinator synthesis header uses short `Slice:` id ([output.md](output.md)). Member prompt carries the full block:

```markdown
### Slice envelope

- **Adapter:** code | plan-section
- **Intent:** [one line]
- **Paths:** [glob or file list — code adapter]
- **Symbols / entrypoints:** [names — code adapter]
- **Plan sections:** [§ ids or headings — plan adapter]
- **Out of slice:** [explicit exclusions]
```

4. **Stability rules** — coordinator MUST NOT embed prior-round finding prose into materials sent to the blind reviewer. Also exclude thrash notes, pass progress / bridge text, and fix rationale. Updated file contents after fixes are allowed. Narrative about prior passes is not.

## Envelope changes

| Change        | When                           |
| ------------- | ------------------------------ |
| Same envelope | Default across fix-loop rounds |
| Expand        | User widens scope explicitly   |
| New envelope  | New slice = new iterate run    |

## Adapter selection

→ [adapters.md](adapters.md). When intent spans full plan critique, route to **second-opinion**. When intent is diff/merge readiness, route to **code-review**.
