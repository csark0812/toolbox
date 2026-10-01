# Readback

<!-- source-of-truth: branch-status readback shape. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-13 -->

Default response: the readback only. No preamble, no "here's a summary".

Write the readback in clear English.

## Shape

```markdown
## Branch status · `<repo>` · base=`<base>` · as of `<iso-date>`

**Alive:** N trains · S stacks · U solo · stale/cooling/active counts

### Stacks

- **stack name or leaf PR title**
  - `base` ← `#n title` (draft?) · tip `branch` · +a/-b · _active|cooling|stale|abandon?_ · Nd
    - train: one-line thought
  - …

### Solo

- `branch` · +a/-b · _label_ · Nd · optional PR `#n` and url
  - train: …

### Cold

- one line per stale/abandon? item (branch or #n) — signal that drove the label

### Noise

- E tips with nothing ahead of base (omitted)
```

## Voice

- Lead with **Alive** counts.
- Short beats. Prefer branch/`#n` and verbs over prose.
- Train of thought is one line — what the work is for, not a changelog.
- Stacks before solo. Cold is a triage strip, not a lecture.
- If `gh` is missing, say `prs: local-only` once under the header line.

## Anti-patterns

- Alphabetized dump of every branch
- Pasting full `git log`
- Inventing Graphite/gt stacks when only `gh` base edges exist
- Cheerleading ("great progress on these stacks!")
