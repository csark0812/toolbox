# Fix-loop themes

<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

**Iterate coordinator vocabulary** — theme identity, invariant matrix, and closure evidence for iterative blind passes. Review **how-to** → [`code-review`](../../code-review/SKILL.md).

Theme **identity** lives in Action finding lines (`Theme: …`), coordinator/member prompts, and git tip / hotspot archaeology across chats. Theme **closure state** is never durable across chats. Re-pass against tip when thrash signal is present ([exit gate](#exit-gate)).

Do not rely on line numbers or finding order as identity.

## Continuity (identity-only)

Primary signals (in order):

1. Prior finding `Theme:` lines / synthesis in this thread (if present).
2. Prior synthesis embedded in PR body (if present).
3. Recent commit messages containing `Theme:` / `theme_id` or `Review ·` header.
4. **Same-hotspot archaeology:** tip micro-fixes with path recurrence — reconstruct
   provisional **contract-class** theme ids ([Predicate glossary](#predicate-glossary)).
5. Leftover `_agent/review/REVIEW_LEDGER.md` if present: **identity labels only** —
   ignore `closed` / state columns. Prefer Theme:/slug. Delete on green
   ([Ledger policy](#ledger-policy)).

Default user-facing output is findings + optional `Continuity:` session hint — not a
theme table (see [output.md](output.md)). Continuity MUST NOT claim closed or exit-gate
passed. It is not cross-chat authority. Carry the full table in member prompts
whenever fix-loop applies. Emit the table in chat only on `show ledger` /
`include continuity`.

### Persistence (keep channels #2–#3 non-empty)

When Action > 0, [output.md](output.md) § Continuity persistence requires a **Persist**
reminder: paste identity Continuity / `theme_id`s into the PR body (channel #2), and
put `Theme: <id>` in fix commit messages (channel #3). Empty PR Continuity + prose-only
fix commits is how bare new-chat reviews lose the trail. Do not leave both empty
after an Action pass. Persistence carries **identity only**, never durable closure.

## Ledger policy

- **Never write** `_agent/review/REVIEW_LEDGER.md` during an open fix-loop.
- If a leftover file exists: do not use it for closure state. Delete when the
  [exit gate](#exit-gate) is green (or no themes remain open) and remove an empty
  `_agent/review/` directory.

## Predicate glossary

| Term                                         | Definition                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Contract-class slug**                      | v1 catalog only: `shell-argv-free-text-sinks` and `session-pin-plane-attach`. Map by **invariant failure mode** (free-text→shell/argv vs pin/plane/session attach), not filename. Not symptom wording (`adb-shell-argv-join-escape`) or basename-suffixed. Extend the catalog in skill text when adding classes — **no catch-all**. Force-fitting a non-isomorphic invariant into these two is a protocol error. |
| **Same-hotspot**                             | In tip window (last 8 commits or since last broad Action): ≥2 commits share ≥1 **non-noise** path. That path appears in ≥2 of those commits (back-and-forth). One-hop shared file alone is not enough.                                                                                                                                                                                                           |
| **Noise paths** (never count toward hotspot) | Lockfiles: `package-lock.json`, `bun.lock`, `yarn.lock`, `pnpm-lock.yaml`, `Cargo.lock`, `poetry.lock`, `*.lock`. Also `**/dist/**`, `**/build/**`, `**/*.min.js`, `CHANGELOG.md`, `LICENSE*`.                                                                                                                                                                                                                   |
| **Same-subsystem**                           | For class mapping / sibling-collapse only — **not** a first-baseline refuse trigger. Shared high-dim class. `fix(scope):` is a hint.                                                                                                                                                                                                                                                                             |
| **Sibling mint**                             | New Action `theme_id` when archaeology already recovered a parent for that hotspot/class → protocol error. Reopen/extend the parent.                                                                                                                                                                                                                                                                             |
| **Sweep quality**                            | Under `Thrash: inventory-required`: pass if Sweep lists named surfaces/APIs **or** matrix rows with ≥1 **class-relevant** token. Fail empty/hollow `Sweep` or irrelevant name lists. Per-surface N/A with reason OK. Whole-Sweep N/A alone fails.                                                                                                                                                                |

**Positive same-hotspot:** commits A and B both touch `src/adb.ts` (non-noise) in the tip window → recurrence. **Negative:** only shared path is `package-lock.json` → noise, not thrash. **Negative:** commit A touches `a.ts`, commit B touches `b.ts` with no shared path → file-hop residual (can miss refuse, and that miss is accepted).

## Theme record

Use one row per root invariant, not per symptom. Keep this table for dispatch /
member prompts. Emit it in user chat only when the user asked `include continuity`
/ `show ledger`.

```markdown
| theme_id         | invariant                                        | surfaces            | state  | closure evidence                                           | contradiction |
| ---------------- | ------------------------------------------------ | ------------------- | ------ | ---------------------------------------------------------- | ------------- |
| path-containment | Resolved paths remain inside the configured root | runtime, CLI, tests | closed | negative traversal + symlink tests, full validation passed | none          |
```

- `theme_id`: stable kebab-case identity retained across renamed findings and
  moved code.
- `invariant`: behavior that must remain true for all relevant inputs.
- `surfaces`: affected contracts such as runtime, schema, exported types, CLI,
  config, docs, persistence, permissions, generated output, and tests.
- `state`: `open`, `closed`, `reopened`, `superseded`, `wontfix`, or `deferred`.
- `closure evidence`: implementation path, regression/negative test,
  **variant coverage marked**, sweep plan result, and validation
  command/result. State why a test is not possible when applicable.
- `contradiction`: disagreement between prior synthesis and fresh evidence.

## Invariant matrix

Before filing or closing a theme, derive only the applicable rows from the
diff. Add repo-specific dimensions when the changed behavior demands them.

| Change class                 | Minimum dimensions to inspect                                                                                                                                                                                                                |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Routing / validation         | empty, single, mixed, skipped, unknown · local vs CI · fail-open vs fail-closed                                                                                                                                                              |
| Paths / files                | relative, absolute, normalized, traversal, symlink, missing target, platform separator                                                                                                                                                       |
| Source rewrites              | destination binding, titled links, duplicate URL text, inline links, reference definitions, label/title collisions, parser offsets, fence, inline code, prefix/suffix, generated file                                                        |
| Public contracts             | runtime, schema, exported declarations, docs/examples, CLI help, error behavior, generated artifacts                                                                                                                                         |
| State / cache / persistence  | read key, write key, invalidation, migration, retry, stale/concurrent state                                                                                                                                                                  |
| Auth / permissions           | anonymous, least privilege, denied, expired, cross-tenant, partial failure                                                                                                                                                                   |
| Parser / classifier output   | See [High-dimensional contract themes](#high-dimensional-contract-themes) — whole vs fenced vs preamble · object / array / primitive · trailing junk · English salvage prefixes · incidental mid-prose blobs · fail-closed vs legacy salvage |
| Free-text → shell/argv sinks | See [Contract-class catalog](#contract-class-catalog) · `shell-argv-free-text-sinks`                                                                                                                                                         |
| Pin / plane / session attach | See [Contract-class catalog](#contract-class-catalog) · `session-pin-plane-attach`                                                                                                                                                           |

The matrix is a review aid, not a mandate to file test inventory. Default filing
remains merge-blockers only.

## Contract-class catalog

v1 portable high-dim classes (extend later in this file when adding classes — no
catch-all). Map by invariant failure mode. Isomorphic thrash in other repos maps
into these templates. Non-isomorphic → extend catalog or use Theme: without a
fake class slug.

### `shell-argv-free-text-sinks`

Free-text / agent strings entering shell argv join (device or host) such that
unquoted metacharacters, control chars, or IFS create injection or wrong tokens.

| Dimension                       | Mark (or N/A)                                               |
| ------------------------------- | ----------------------------------------------------------- |
| Free-text sinks enumerated      | All builders that interpolate agent strings into shell argv |
| Control chars                   | `\0` · `\n` · `\r`                                          |
| Metachar / IFS / redirect / `$` | `;` `\|` `&` `` ` `` `$` `>` `<` and whitespace/IFS splits  |
| Quote vs hard-reject policy     | Per field class: quote-first vs meta-reject                 |
| Identifier sinks allowlisted    | serial / bundle / path / activity-style ids                 |
| Boundary layer                  | MCP/CLI re-validate vs trust sink-layer only                |

### `session-pin-plane-attach`

Device/session attach where pin identity, plane, soft-omit, or session rebind can
silently select the wrong target.

| Dimension                           | Mark (or N/A)                                     |
| ----------------------------------- | ------------------------------------------------- |
| Attach/open entrypoints enumerated  | Every open/attach/bring-up path                   |
| Pin identity                        | omit→pin, explicit must match pin                 |
| Plane reconcile before side effects | platform/udid/pin before boot/attach              |
| Soft-omit vs hard-refuse            | incl. physical consent / never ambient physical   |
| Bring-up asymmetry                  | boot-then-pin vs must-already-connected           |
| Session/companion coherence         | after tunnel drop / fail-open bind / health drift |

## High-dimensional contract themes

Parsers, classifiers, serializers, **shell/argv free-text sinks**, **pin/plane/session attach**, and similar contracts thrash when each review files one edge and marks the theme `closed`. These are **high-dimensional input → structured output / attach** contracts. Treat them as one matrix, not a stack of sibling bugs.

Before such a theme can move to `closed`:

1. Attach a **variant checklist** derived from the applicable matrix dimensions
   (mark checked or N/A each row — do not stop at the filed counterexample).
2. Prefer **one intentional matrix pass** + regression coverage over a chain of
   symptom patches across fresh chats.
3. On re-review, if an adjacent shape still fails, **reopen** the same
   `theme_id` and extend the checklist — MUST NOT invent a sibling Action theme.

Minimum checklist for judge / reply-parse / salvage-style invariants (adapt
names to the repo, keep the dimensions):

| Dimension                  | Examples to mark (or N/A)                                        |
| -------------------------- | ---------------------------------------------------------------- |
| Framing                    | whole-text · markdown-fenced · prose-preamble + body             |
| Value shape                | object · array · string/number/bool/null primitive               |
| Contract validity          | valid schema · missing required keys · truncated / trailing junk |
| Salvage boundary           | refuse YES/NO when structured latch applies · allow legacy prose |
| English / list prefixes    | digit · digit+comma · bool/null word · numbered-list markers     |
| Incidental mid-prose blobs | scores lists · quote objects · instructional `"verdict":` prose  |

Filing a regression for only the reported example is **premature closure**.

## Same-invariant sweep

For every **Action** theme, attach a short sweep plan before the next fix or
re-review. List the symbols, APIs, config fields, docs surfaces, and tests that
share the invariant — not only the example that was filed.

```markdown
### Sweep · `theme-id`

- Symbols / APIs: <names>
- Config / schema fields: <names>
- Docs / CLI / help surfaces: <paths>
- Tests / fixtures: <paths or to-add>
- Matrix rows: <applicable invariant-matrix dimensions>
```

Under `Thrash: inventory-required`, this Sweep MUST meet [Sweep quality](#predicate-glossary)
(named class-relevant surfaces **or** matrix rows — not an empty `Sweep` heading).

Rules:

1. Closure evidence is incomplete until the sweep plan was executed (or each
   skipped surface has an explicit N/A reason). Whole-Sweep N/A alone fails under thrash.
2. If a later pass finds an adjacent edge of the same invariant, mark prior
   closure incomplete and **reopen** the existing `theme_id`. Do not invent a
   fresh sibling theme.
3. On re-review, member prompts and the coordinator must ask: “what sibling
   variants fail if the current fix is too narrow?” Return those under
   the same `theme_id`.

## Thrash signal

Stop symptom-by-symptom filing when either:

- Two or more Action blockers in the **same subsystem / theme family** appear
  on one pass, or
- Pass 2+ rediscovers adjacent holes next to a recently closed theme, or
- Same-hotspot commit-stack thrash is detected ([anti-thrash.md](anti-thrash.md)).

Then:

1. Pause filing further individual Action blocks for that family.
2. Perform a holistic same-invariant sweep across the shared surfaces.
3. Collapse symptoms into one `theme_id` (or reopen the existing one) — contract-class
   slug when no Theme: recovered.
4. Stay **targeted contextual** with `Thrash: inventory-required` — **never** auto-Full
   on thrash. Full revisit only on explicit user ask or `new-scope-review`.

## Premature closure (named failure mode)

Closing a theme after fixing only the reported example, a thin regression for
that example alone, or without matrix + sweep evidence is **premature closure**.
Symptoms:

- Theme marked `closed` but an adjacent variant of the same invariant still fails.
- Closure evidence lists only the filed example. **Variants marked** is missing
  or names a single row without sweep execution.
- A regression test covers E1 only while E2/E3 of the same invariant remain reachable.

When premature closure is detected on pass 2+, **reopen** the existing `theme_id`
(same invariant, new edge). Do not invent a sibling Action theme. Record under
**Baseline contradictions** when prior synthesis claimed the theme closed (opt-in
verbose / internal reconciliation — not default user output).

## Variant coverage before closure

A theme MUST NOT move to `closed` unless variant checklist rows are marked checked or
explicitly N/A'd. Do not mark a theme `closed` after fixing only the reported
example. Before closure evidence is complete:

1. List the applicable matrix dimensions for that invariant.
2. Execute the theme’s sweep plan (or record N/A per surface).
3. Mark each dimension for the same failure mode (or state why it does not
   apply).
4. Prefer one theme-complete fix + regression coverage over a symptom patch.

If a later pass finds the **same invariant + a new edge**, prior closure
evidence was incomplete. Reopen the existing `theme_id`. Do not invent a fresh
sibling theme for the adjacent hole.

Ask on every narrow fix: “what other variants of this invariant fail if
this fix is too narrow?”

## Reopen on pass 2+ (thrash hardening)

When the **same** `theme_id` reopens on pass 2+ (adjacent edge, premature
closure, or incomplete prior sweep):

1. MUST complete the same-invariant sweep before filing further Action blocks
   in that theme family.
2. MUST NOT claim merge-ready until variant coverage is explicit in closure
   evidence.
3. MUST NOT invent a sibling Action theme for the adjacent edge — extend /
   reopen the existing `theme_id`.
4. Prefer targeted hotspot attention on sweep surfaces — **not** a reflex Full
   symptom-hunting pass. Thrash never auto-Full.

## Reconciliation

For every candidate found on pass 2+, classify it before synthesis:

1. Same theme, incomplete fix → reopen the existing `theme_id`.
2. Same invariant, new variant → add evidence under the existing theme
   (prior closure incomplete).
3. Genuinely different invariant → create a new `theme_id` and state in one line
   why prior passes missed this blocker class.
4. No reachable production failure → Noted or Deferred under normal filing rules.

Synthesis must **reject** a fresh Action block for an adjacent variant unless the
finding text explains why the root invariant is genuinely different.

## Repeated-review guard

When the same branch/thread is reviewed again after fixes — **including bare
`review vs main` in a new chat**:

1. Reconstruct themes before dispatch ([anti-thrash.md](anti-thrash.md))
   from findings / PR / git archaeology / contract-class slug.
2. Classify as `closure-re-review` vs `new-scope-review`. MUST NOT emit
   `first-baseline` when same-hotspot thrash or recoverable themes exist.
3. Carry every prior `theme_id` into member prompts. Do not renumber or rename
   for title wording changes. Reject sibling mint for the same class/hotspot.
4. Reconcile against prior themes (Baseline contradictions stay internal unless
   the user asked for verbose continuity).
5. Do not claim merge-ready until the [exit gate](#exit-gate) passes.
6. Do not Full-promote on thrash or solely because the whole branch is large.
7. On green: omit Continuity footer. Delete any leftover review ledger file if present
   (never write a new one).

## Hotspots

Before an exit pass, identify files or subsystems changed in two or more fix
commits/passes. Assign one council member or the coordinator to read each
hotspot holistically against its invariant matrix, not only the latest patch.

## Exit gate

Use merge-ready or “final blockers” language only when all are true:

- No theme remains `open` or `reopened`. `wontfix` decisions are explicit.
- No **premature closure** — every closed theme has variants marked + completed
  sweep (or N/A reasons) in closure evidence. [High-dimensional contract](#high-dimensional-contract-themes)
  themes also need their matrix checklist complete (not only the filed example).
- No reopened theme lacks a completed sweep plan after thrash signal or pass 2+
  reopen.
- Baseline contradictions are empty (internal pass).
- Repeatedly changed hotspots received aggregate re-review.
- Every repeated Action theme has variant coverage marked and a completed sweep
  plan (or N/A reasons). It also has a regression test or a written reason one is not
  possible.
- The repository’s authoritative validation lane passed, or the output clearly
  states which validation was not run and does not claim merge-ready.
- Any leftover review ledger file from older skill versions is deleted when
  present.

Zero findings alone does not satisfy this gate.
