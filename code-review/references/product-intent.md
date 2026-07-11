# Product intent (review input)

Diff-only review cannot infer **intentional** UX removals. This reference is SSOT for how review and PR description share product context.

PR authors: consumer-local **pull-request** skill § Product intent / non-regressions (when present).
Review dispatch: [task-prompt-review.md](task-prompt-review.md) § Product intent overlay.

## When to load product intent

Load **before** filing regressions vs `main` when **any**:

- Diff removes or relocates user-facing actions (popup, toolbar, FAB, menus)
- Diff changes surface hierarchy (which entrypoint owns save/identify/open)
- PR body includes `## Product intent / non-regressions`
- Prior synthesis declared a theme **wontfix** with `root_cause: product-intent`

## Sources (priority order)

1. **PR body** — `## Product intent / non-regressions` (if PR exists: `gh pr view --json body`)
2. **Prior synthesis** — wontfix themes + evidence from chat or PR review comment
3. **Surface design SSOT** — table below
4. **App README** — e.g. `apps/extension/README.md` intentional callouts (secondary to design doc)

## Surface design SSOT

| Surface / path prefix | Doc |
|----------------------|-----|
| `apps/extension/` | [docs/design/surfaces/extension.md](../../../../docs/design/surfaces/extension.md) |
| `apps/client/` | [docs/design/surfaces/desktop-workbench.md](../../../../docs/design/surfaces/desktop-workbench.md) |
| Product surfaces (general) | [docs/product/README.md](../../../../docs/product/README.md) — surfaces row |

## Extension: standing non-regressions (POS-267+)

Do **not** file as regression unless implementation **contradicts** the design doc or PR intent section:

| Change vs older `main` | Intent |
|------------------------|--------|
| No save/identify in toolbar **popup** on normal pages | Save/identify live in **embed panel**; popup is fallback/blocked/retry only |
| No **FAB** on generic webpages | FAB on **detected paper sites**; generic pages use toolbar → panel |
| `PopupActionBar` removed | Replaced by panel-first capture flow — not a missing feature |

## Review rules

- **Do not file** a high/medium regression finding when the behavior matches product intent from sources above.
- **Do file** when code violates stated intent (e.g. panel save broken while doc says panel owns save).
- **Needs confirmation** only when intent is ambiguous **and** not covered by PR section or design doc — not when doc explicitly states the behavior.
- Reference prior synthesis when re-verifying: `wontfix (product-intent) — panel-first flow`.

## Coordinator checklist (review pass)

Before synthesis, if diff touches `apps/extension/`:

1. Read [extension.md](../../../../docs/design/surfaces/extension.md) § Embed, Popup
2. Pull PR product-intent section if PR exists
3. Pull wontfix + product-intent themes from prior chat synthesis or PR review comment
4. Include summary in each member Task prompt ([task-prompt-review overlay](task-prompt-review.md))
