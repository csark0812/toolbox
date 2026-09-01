# Refactor card

<!-- source-of-truth: compact internal state for one refactor. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-01 -->

Keep one conversation-local card. Do not create a project file unless the user requests one.

| Field              | Meaning                                                     |
| ------------------ | ----------------------------------------------------------- |
| Outcome            | The result the developer wants                              |
| Invariants         | Behavior, contract, safety, and data rules that remain true |
| Required shape     | Ownership, boundaries, names, or structures that must exist |
| Prohibited shape   | Historical or rejected structures that must not remain      |
| Style evidence     | One to three accepted examples that define local idioms     |
| Resolved decisions | Choices already made                                        |
| Open decision      | One current human-owned choice, or empty                    |
| Current slice      | One bounded change and scope                                |
| Proof              | Evidence that tests behavior and target shape               |
| Stop if            | Evidence that defeats or blocks the slice                   |

## Update rules

- Record only decisions that affect behavior, architecture, style, scope, or proof.
- Never reopen a resolved decision without new conflicting evidence. Add that evidence before moving the decision back to open.
- Explicit user choices outrank repository frequency.
- Select style examples with the closest behavior and ownership shape. Do not average contradictory examples or copy known defects.
- Keep detailed state, lifecycle, policy, failure, and seam analysis in repository evidence. Use the shared design vocabulary when it changes the slice.
