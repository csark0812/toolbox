# Workflow: Describe

Generate behavior-focused PR description.

## Trigger

"write PR description", "document changes", "PR body", "update description"

- **Re-describe:** also triggered when the branch has changed since the PR description was last written

## Readability

- **Breathing room:** Blank line between sections. Prefer a short opening sentence per section before bullets.
- **Plain first, precise second:** One line on what shipped; then details. Avoid stacking many clauses in a single bullet.
- **Scannable contracts:** Use short bullets or `###` subheadings—not one dense paragraph. Cap deep nesting (avoid sub-bullets under every bullet unless the PR is huge).
- **Enumerate what can be named:** If the PR adds or changes a **small, fixed set** of things outsiders rely on **by identifier** (any domain: APIs, hooks, flags, schema fields, CLI verbs, plugin IDs, etc.), **list them**—one line each, identifier + short gloss. A summary sentence (“new reporting hooks”) is not enough when the set is bounded; readers should see the actual names without opening the diff.
- **Tight lists:** Summary 2–4 bullets; Key Changes 3–6 bullets at subsystem level. Implementation: a few bullets or two short paragraphs, not a spec.

## Core principles

- **Outward contract first:** What integrators, operators, or end users can observe or depend on—not a file-by-file inventory
- **Finite public surface:** When the change defines or alters a **listable** set of entry points, options, or identifiers, **name them**. Add brief prose for access rules, failure modes, or migration afterward. “Not exhaustive” applies to **implementation** internals, not to skipping the named surface
- **Implementation (high-level):** main components, data flow, design choices—enough to orient reviewers without a file walkthrough

## Before writing

1. Run diff — [shared.md](shared.md)
2. Identify change type (feat/fix/refactor/chore/docs), size, user impact
3. Trace entry points, user flows, integration points
4. If diff removes or relocates user-facing actions → draft **Product intent / non-regressions** ([product-intent.md](../../code-review/references/product-intent.md))

## PR title

Format: `type(scope): subject`

- **Type**: feat, fix, refactor, chore, docs
- **Scope**: Optional (e.g., extension, client, backend)
- **Subject**: Imperative, lowercase, specific

## Required sections

- **Summary** — What changed, in plain language (2–4 short bullets or one short paragraph + one bullet)
- **Outward contract** — When something **outside** this repo (people, clients, other systems, operators, config, or published types) depends on the change. Use a subsection whose **title fits the domain** (*Endpoints*, *Tools*, *Flags*, *Breaking changes*, …) and include a **one-line-per-identifier** list whenever the PR introduces or changes a **bounded** set. **Omit** the whole section for purely internal refactors (do not write "N/A" walls of text)
- **Product intent / non-regressions** — **Required** when the diff removes user-facing actions, moves jobs between surfaces (popup ↔ panel ↔ FAB), or changes vs `main` looks like a regression. List each intentional change, why, and link design doc. Reviewers must not re-file these as regressions unless implementation contradicts this section. SSOT: [product-intent.md](../../code-review/references/product-intent.md)
- **Implementation (high-level)** — How it is wired; readable, not dense
- **Key Changes** — Subsystem/feature scope; still no file inventories

## Optional sections

- **Screenshots / Video** — **Only when** the PR changes user-visible UI. Then add `## Screenshots / Video` and briefly say what to look at or attach images. **Do not** include it when there is no meaningful visual change.

## Template

Default shape (no screenshots block; no risk block):

```markdown
## Summary

-

## Product intent / non-regressions

(Required when UX jobs move between surfaces or features vs `main` look removed. Omit only for internal refactors with no user-visible behavior change.)

- **Intentional:** … (what reviewers should not flag as regression)
- **Design SSOT:** [docs/design/surfaces/extension.md](…)

## Outward contract

(Include only if integrators, users, or operators gain, lose, or change something they can rely on. Otherwise delete this section. Not limited to HTTP—same idea for CLI, events, schema, feature flags, etc.)

### Access, context, or prerequisites

(As needed—auth, env, rollout, compatibility—in short bullets.)

### (Heading for the bounded list—e.g. Tools, Routes, Flags)

(When the PR defines a **bounded** set: title should match the domain. List **every** new/changed identifier, backticked, one line + short purpose.)

- `identifier_one` — …
- `identifier_two` — …

## Implementation (high-level)

-

## Key Changes

-
```

When the PR includes meaningful UI changes, append:

```markdown
## Screenshots / Video

(What changed visually, or attach images.)
```

## Scaling

- **Small PRs:** Summary + Key Changes. One short paragraph for implementation; include **Outward contract** only if something outside the repo changed
- **Medium PRs:** All required sections; use subheadings under **Outward contract** if it helps scan
- **Large PRs:** Optional Review Guide or link to design doc; `<details>` for extra implementation depth if needed

## Output

Save to `pr-description-[branch-name].md` or output markdown. Optionally `gh pr edit --body` if user wants applied.

**Preserve "Closes [Linear URL]"** if present when editing existing PR.
