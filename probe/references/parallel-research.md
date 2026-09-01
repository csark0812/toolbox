# Parallel Research

**Availability:** This parallel recipe requires `council` to be installed and attached. Without it, research the independent topics serially and preserve the same source-class and conflict checks.

Independent research topics in parallel. Uses the [council](https://raw.githubusercontent.com/csark0812/toolbox/main/council/SKILL.md) persona contract and [persona prompt](https://raw.githubusercontent.com/csark0812/toolbox/main/council/references/persona-prompt.md).

## When to use

- The answer needs facts from independent libraries, vendors, policies, or specifications.
- The user explicitly asks for parallel research passes.

## When to skip

- One topic or one authoritative source can answer the question.
- Repository documentation owns the answer.
- The task is a code hunch or code review.

## Task personas

Create one persona per distinct research question or source class. Each persona must have a unique question, evidence scope, and possible effect on the answer.

Use **independent panel**. Give each member the relevant query, source standards, freshness needs, and citation requirements through [persona-prompt.md](https://raw.githubusercontent.com/csark0812/toolbox/main/council/references/persona-prompt.md).

## Synthesis

1. State each answer once with direct source links.
2. Distinguish primary sources from secondary commentary.
3. Preserve conflicts between sources.
4. For high-stakes conflicts, run a narrow corroborating search or name the smallest next proof.
5. Use the [council synthesis](https://raw.githubusercontent.com/csark0812/toolbox/main/council/references/output-format.md) when no layered skill defines the result.
