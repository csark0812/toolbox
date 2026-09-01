# TDD output

<!-- doc-meta: owner=eng | last-reviewed=2026-09-01 -->

User-facing blocks must use pragmatic STE: short sentences, concrete subjects and verbs, and one meaning per sentence. If `simple-english` is installed, it can provide additional guidance; this output contract does not require it.

```markdown
## TDD slice

**Seams:** [confirmed public boundaries]
**Cycle:** red → green (one slice)

### Test

[path — behavior specified]

### Implementation

[path — minimal green change]

### Result

[command + outcome]

### What to do next

- [next slice, code-review, probe, handoff]
```
