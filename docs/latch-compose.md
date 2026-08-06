# Latch-compose and job-first voice

**Source of truth for** toolbox host/overlay skill authoring — how process skills couple to spawn overlays, and how user/member prose should read.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

General skill-authoring vocabulary (progressive disclosure, leading words, invocation) is **not** shipped in this hub. Install Matt Pocock’s skill globally when you want that pack:

```bash
npx skills add mattpocock/skills --skill writing-great-skills -g -y
```

This page owns the toolbox-specific rules below.

## Latch-compose (host / overlay skills)

**Latch-compose** is how a host skill that owns a process couples to an overlay skill that owns _how_ to run a step (spawn, split, model routing) without **path-coupling** (sibling `SKILL.md` path-links).

- Hosts latch overlays with the phrase `via <kernel-slug>` (example: `via subagents`) plus description reach so the overlay can attach when a Task/Subagent call is imminent.
- The overlay **latches on as extra context** — a how-layer on the host process. It must not replace the recipe or become a separate takeover job.
- Do not hard-link sibling skills with relative path-links to another skill’s `SKILL.md`. Name the overlay with the latch phrase; keep domain recipes and synthesis in the host.

Slash-free examples: write `via subagents` in the host recipe; do not write a markdown link whose target path is another skill folder (path-coupling).

Reference instance: [`subagents`](../subagents/SKILL.md) Compose contract.

## Job-first voice (host / overlay skills)

User-facing and member prompts lead with the **job**, not protocol salutation lines (**job-first** / plain forward-facing prose).

Protocol markers (suite tokens, stance, member index) stay **secondary** — e.g. an HTML contract footer, a dispatch plan table, or equivalent — never the opening lead.

Exemplars: iterate pass output; subagents member opens. Do not copy iterate’s `<!-- iterate-contract: … -->` string onto other skills.
