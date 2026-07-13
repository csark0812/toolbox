<!-- skeleton: generated-reference
source: .skeleton/references/planning/build.md
redundancy: intentional
-->

# Build (execution planning)

**Portable soft-default (consumer remaps apply):** Toolbox ships Linear / `docs/prds/` baselines for consumers with **no** remap. **STOP:** If the consumer remaps this path via customize (`shared-agent-references` / docs), **do not execute the steps below** — open the consumer planning SSOT only. Do not treat `docs/prds/` or path examples below as authoritative when remapped.

Guided planning from scratch. Works for any task type.

Plan type sets **axis weighting** — see [README.md](README.md) (Completeness axes).

## Step 1: Ingest Input

| Source                   | Action                                                                                             |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| Linear card URL or ID    | Fetch via MCP `get_issue`. Extract: title, description, acceptance criteria, labels (bug/feature). |
| PRD file path            | Read `docs/prds/<slug>.md`. If unclear, search `docs/prds/`.                                       |
| PRD URL                  | Fetch and read.                                                                                    |
| Raw description          | Proceed directly.                                                                                  |
| "Write a PRD for X"      | Treat as raw description; default output will be PRD doc.                                          |
| "Break this into issues" | Locate PRD first (path, URL, or search `docs/prds/`); default output will be Linear issues.        |

## Step 2: Detect Plan Type

Infer from input. State the detected type before asking questions.

| Type         | Signals                                                             |
| ------------ | ------------------------------------------------------------------- |
| Feature      | New capability, user-facing, "add", "build", "implement"            |
| Refactor     | Internal improvement, no behavior change, "clean up", "restructure" |
| Cleanup      | Removal, dead code, migration, "remove", "delete", "migrate"        |
| Bug fix      | Broken behavior, "fix", "broken", "not working", error description  |
| Architecture | Cross-cutting structural change, "redesign", "move to", "split"     |

Plan type sets axis weighting — see [README.md](README.md) (Completeness axes).

## Step 3: Codebase Exploration

Skip for non-code plans (process docs, team workflows, pure cleanup with obvious scope).

**Skip when:**

- User explicitly finished **grill** — do not re-ask settled points.
- **Scope is narrow** — single-component change; minimal exploration.
- **Repo exploration already in context** — exploration was just run in this session.

For code plans: follow [parallel-explore.md](parallel-explore.md) via **multi** (or spawn parallel **explore** subagents per affected domain). State what you're exploring before launching.

Goal: enough context to ask grounded questions and detect blast radius early. Do not go deep — surface-level structure is enough.

Examples:

- "Add scoring to sources" → explore shared query package, client data hooks, backend scoring endpoints, UI score components
- "Fix auth bug" → explore client auth flows and backend auth views

## Step 4: Targeted Questions

Ask in batches of 2–3. Stop when the plan can be written confidently. Skip questions that codebase exploration already answered.

**Continuing from grill:** skip re-asking points already settled in the dialogue; use this step only for gaps the artifact still needs.

### Scope batch (always ask for features)

- What is the one thing this plan must accomplish?
- What's explicitly out of scope — what could someone reasonably assume is included but isn't?

### Gaps batch (always ask)

- Are there phases this needs that aren't obvious from the description?
- What part of this could be harder or more involved than it looks?

### Blast radius batch (ask when shared code is involved)

- What shared code, packages, or infra does this touch?
- Who else depends on the things being changed?

### Bug-specific

- Is the root cause confirmed, or is this a hypothesis?
- What's the correct behavior after the fix?

### Constraint batch (ask when relevant)

- Any files or interfaces that must NOT change?
- Any partial-delivery or MVP-slice constraints?

## Step 5: Clarity and review skills

After the first question batch, evaluate whether a mode shift would help:

| Signal                                                                  | Action                                                                           |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Idea is still vague or contradictory                                    | "This might benefit from a quick **crystallize** pass — want to shift there?"    |
| Assumptions in the description are questionable                         | "Some of these assumptions might be worth a **grill** pass — want to run that?"  |
| Plan looks nearly complete; you want a fresh read of the _written_ plan | "Want a **second-opinion** (fresh read) pass on the plan before I finalize?"     |
| Specific doubt about a code path or structure                           | Optional: "Want **investigate** to sanity-check that hunch with evidence first?" |

Never shift without offering. User decides.

See also [README.md](README.md) (Peripheral skills) for **project-tracking**, **code-review**, **multi** ([parallel-explore.md](parallel-explore.md)).

## Step 6: Sketch modules (PRD output only)

When output will be a PRD, identify major components and boundaries before writing. This feeds the **Key Modules / Components** section in [prd-format.md](prd-format.md).

## Step 7: Completeness Signal

Before generating output, state one inline signal:

```
Scope and phases look solid. One unaddressed blast-radius area: [specific thing].
```

Or if clean:

```
All three axes covered. Ready to generate.
```

Be specific. If something is unaddressed, name it — don't just flag "blast radius may be an issue."

## Step 8: Output Selection

Ask: "What output format?" — or infer from context if clear.

| If user said...                              | Default output                   |
| -------------------------------------------- | -------------------------------- |
| "help me plan" / general                     | Ask: CreatePlan, PRD, or issues? |
| "write a PRD"                                | PRD doc                          |
| "break into issues" / "create tickets"       | Linear issues                    |
| "plan how to implement"                      | CreatePlan                       |
| Linear card provided, solo work implied      | CreatePlan                       |
| Linear card provided, team execution implied | PRD + issues                     |

Multiple outputs can be generated in one pass. Generate them sequentially.

Use [plan-format.md](plan-format.md), [prd-format.md](prd-format.md), and [issues-format.md](issues-format.md) as appropriate.

**After implementation exists:** holistic code review → **code-review** skill (staged/unstaged includes AI drift hygiene).
