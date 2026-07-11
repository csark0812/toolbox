# Workflow: Both

Describe and review in one pass. Run diff once.

## Trigger

"finalize PR", "prepare for review", "describe and review"

## Output

1. **Description** — Full template from [describe.md](describe.md) (include **Product intent / non-regressions** when applicable)
2. **Review** — Load and run the `code-review` skill. Pass the already-fetched diff so it is not re-fetched. Pass PR body product-intent section or [product-intent.md](../../code-review/references/product-intent.md) into review overlay. The `code-review` skill owns the review output format, severity criteria, and agent dispatch.

## Option

Include "## Review" subsection in the description with findings or "No issues found."
