# Verify (completeness)

**Portable soft-default (consumer remaps apply):** Toolbox ships Linear / `docs/prds/` baselines for consumers with **no** remap. **STOP:** If the consumer remaps this path via customize (`shared-agent-references` / docs), **do not execute the steps below** — open the consumer planning SSOT only. Do not treat `docs/prds/` or path examples below as authoritative when remapped.

Completeness check on an existing plan, PRD, or issue set. Does not rewrite — flags gaps and suggests specific additions.

Plan type and axis weighting — see [README.md](README.md) (Completeness axes). For the same artifact, **second-opinion (fresh read)** is a different stance (premise pass + outsider critique); use **this doc** for the axis checklist / readiness report.

## Step 1: Locate the Artifact

| Input | Action |
|---|---|
| `.plan.md` path | Read the file |
| `docs/prds/*.md` path | Read the file |
| "My plan" / no path given | Check `.cursor/plans/` for recent `.plan.md` files; ask if ambiguous |
| Linear issue set | Ask for the project or issue IDs |

## Step 2: Detect Plan Type

Same as [build.md](build.md): feature / refactor / cleanup / bug fix / architecture.

Determines axis weighting. State the detected type before proceeding.

## Step 3: Run the Three Axes

Work through each axis. For each finding, state the specific gap and a concrete suggestion — not just "this could be better."

---

### Axis 1: Scope

**What to check:**
- Is there an explicit "out of scope" section? If not, what could reasonably be assumed as included but probably isn't?
- Are the acceptance criteria or success conditions stated?
- Does the plan's scope match the triggering input (Linear card, description, PRD)?

**Question to ask yourself:** "If someone picked this plan up cold, what would they reasonably assume is included that actually isn't?"

**Bug fix specific:** Is the root cause stated as confirmed, or as a hypothesis? If hypothesis, that needs to be flagged.

---

### Axis 2: Gaps

**What to check:**
- Are there phases or steps that are non-obvious but required?
- Is there missing infrastructure work (migrations, schema changes, config updates) that code changes depend on?
- Are tests mentioned? For non-trivial changes, test coverage should appear in the plan.
- Is cleanup or follow-up (dead code removal, deprecated paths) included if applicable?
- For bug fixes: is regression testing included?

**Question to ask yourself:** "What will the implementer discover mid-execution that will block them and isn't in this plan?"

---

### Axis 3: Blast Radius

**Question:** What else does this decision touch or depend on?

**What to check:**
- What shared code, packages, or interfaces does this change? Are they all mentioned?
- Does the plan account for consumers of the changed code? (callers, dependents in other packages/apps)
- For shared package changes: all consuming apps noted?
- For backend API changes: frontend client regeneration noted?
- For database schema changes: migrations noted?
- What other decisions, surfaces, or prior commitments does this affect?

**Question to ask yourself:** "What will break in an adjacent part of the codebase that this plan doesn't mention?" (For non-code plans: what downstream decisions or commitments does this plan assume?)

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
[One sentence explaining the signal — what's the blocker or what's the remaining concern.]
```

**Readiness signals:**
- **Needs work** — A scope gap, missing phase, or unaddressed blast radius item would derail implementation
- **Mostly there** — Minor gaps; implementer can proceed but should keep these in mind
- **Ready to build** — All three axes covered; plan is executable as-is

## Step 5: Offer Next Steps

After the report:
- Gaps in assumptions → "Want a **grill** pass on the assumptions, or a **second-opinion** (fresh read) on the plan text first?"
- Significant scope gaps → "Want to run [build.md](build.md) to fill these in?"
- Ready to build → "Want to kick off **project-tracking** to start work?"
- Before commit → **code-review** staged (includes AI drift hygiene)

See [README.md](README.md) (Peripheral skills) for **investigate**, **code-review**, and **multi** ([parallel-explore.md](parallel-explore.md)).
