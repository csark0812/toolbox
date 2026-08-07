# Verify (completeness)

**Opt-in soft-default recipe:** Full Linear / `docs/prds/` baseline for consumers with **no** planning remap. Consumers that remap via customize (`shared-agent-references` / docs) must **not** use this file. Open the consumer planning SSOT instead.

Completeness review on an existing plan, PRD, or issue set. Does not rewrite. Flags gaps and suggests specific additions.

Plan type and axis weighting — see [README.md](README.md) (Completeness axes). This file is the **axis checklist body** loaded by the second-opinion **completeness** attacker ([second-opinion-dispatch.md](../../../../subagents/references/second-opinion-dispatch.md)). Full second-opinion always pairs premises attack + this checklist + a defender. Do not treat this doc as a separate “verify stance.”

## Step 1: Locate the Artifact

| Input                     | Action                                                                 |
| ------------------------- | ---------------------------------------------------------------------- |
| `.plan.md` path           | Read the file                                                          |
| `docs/prds/*.md` path     | Read the file                                                          |
| "My plan" / no path given | Look in `.cursor/plans/` for recent `.plan.md` files. Ask if ambiguous |
| Linear issue set          | Ask for the project or issue IDs                                       |

## Step 2: Detect Plan Type

Same as [build.md](build.md): feature / refactor / cleanup / bug fix / architecture.

Determines axis weighting. State the detected type before proceeding.

## Step 3: Run the Three Axes

Work through each axis. For each finding, state the specific gap and a concrete suggestion. Do not only say "this can be better."

---

### Axis 1: Scope

**What to examine:**

- Is there an explicit "out of scope" section? If not, what can reasonably be assumed as included but probably is not?
- Are the acceptance criteria or success conditions stated?
- Does the scope of the plan match the triggering input (Linear card, description, PRD)?

**Question to ask yourself:** "If someone picked this plan up cold, what can they reasonably assume is included that actually is not?"

**Bug fix specific:** Is the root cause stated as confirmed, or as a hypothesis? If hypothesis, that needs to be flagged.

---

### Axis 2: Gaps

**What to examine:**

- Are there phases or steps that are non-obvious but required?
- Is there missing infrastructure work (migrations, schema changes, config updates) that code changes depend on?
- Are tests mentioned? For non-trivial changes, test coverage must appear in the plan.
- Is cleanup or follow-up (dead code removal, deprecated paths) included if applicable?
- For bug fixes: is regression testing included?

**Question to ask yourself:** "What will the implementer discover mid-execution that will block them and is not in this plan?"

---

### Axis 3: Blast Radius

**Question:** What else does this decision touch or depend on?

**What to examine:**

- What shared code, packages, or interfaces does this change? Are they all mentioned?
- Does the plan account for consumers of the changed code? (callers, dependents in other packages/apps)
- For shared package changes: all consuming apps noted?
- For backend API changes: frontend client regeneration noted?
- For database schema changes: migrations noted?
- What other decisions, surfaces, or prior commitments does this affect?

**Question to ask yourself:** "What will break in an adjacent part of the codebase that this plan does not mention?" (For non-code plans: what downstream decisions or commitments does this plan assume?)

---

## Step 4: Output

```
## Verify: [Plan / PRD name]

### Scope
[Finding with specific gap and suggestion, or "Covered."]

### Gaps
[Finding with specific gap and suggestion, or "No obvious gaps."]

### Blast Radius
[Finding with specific gap and suggestion, or "Blast radius is contained and accounted for."]

### Readiness
[Needs work | Mostly there | Ready to build]
[One sentence explaining the signal — what is the blocker or what is the remaining concern.]
```

**Readiness signals:**

- **Needs work** — A scope gap, missing phase, or unaddressed blast radius item will derail implementation
- **Mostly there** — Minor gaps. Implementer can proceed but must keep these in mind
- **Ready to build** — All three axes covered. Plan is executable as-is

## Step 5: Offer Next Steps

After the report:

- Gaps in assumptions → "Want a **grill** pass on the assumptions, or a **second-opinion** on the plan text?"
- Significant scope gaps → "Want to run [build.md](build.md) to fill these in?"
- Ready to build → "Want to kick off your tracker / issue-workflow skill to start work?"
- Before commit → **code-review** staged (includes AI drift hygiene)

See [README.md](README.md) (Peripheral skills) for **probe**, **code-review**, and **subagents** ([parallel-explore.md](parallel-explore.md)).
