# Prototype output

<!-- doc-meta: owner=eng | last-reviewed=2026-09-01 -->

User-facing blocks must use pragmatic STE: short sentences, concrete subjects and verbs, and one meaning per sentence. If `simple-english` is installed, it can provide additional guidance; this output contract does not require it.

```markdown
## Prototype

**Question:** [one line]
**Mode:** throwaway | keep-skeleton
**Branch:** logic | UI
**Run:** `[one command]`

### Verdict

[what we learned — promote / discard / more grill]

### What to do next

- [grill, tdd, handoff, discard cleanup]
```

Cross sessions → **handoff** with verdict pointer.
