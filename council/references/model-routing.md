# Model Routing

<!-- doc-meta: owner=eng | last-reviewed=2026-08-16 -->

Cost-aware model selection for [`council`](../SKILL.md). Optimize for **cheapest good enough**, not most capable by default. Prefer cheaper / Auto paths for almost all parallel members. Escalate only when slice shape or evidence requires it — and then to the **most appropriate** stronger model, not the most expensive one.

**Heavy bar (Premium / strongest slugs):** Reserve for genuinely heavy work. Examples: multi-thousand-line or Broad+ reviews, architecture across many subsystems with large blast radius, high-stakes adjudication after cheaper paths fail, or an explicit deepest-analysis request. Ordinary reviews, single-subsystem judgment, moderate research conflict, and typical explore/gather stay Fast or Standard.

Inspect the current host Task `model` enum before every dispatch. Never invent slugs.

## Source tiers

| Tier            | Meaning                                                     | Use as                                          |
| --------------- | ----------------------------------------------------------- | ----------------------------------------------- |
| **Primary**     | Vendor/host docs (Cursor, OpenAI, Anthropic, xAI, Moonshot) | Pricing pools, effort semantics, product intent |
| **Independent** | Artificial Analysis and similarly harnessed public evals    | Relative escalation signals among families      |
| **Vendor-only** | Self-reported benches without independent replication       | Soft signals only. Never sole routing reason.   |

Primary sources: [Cursor models & pricing](https://cursor.com/docs/models-and-pricing), [Cursor council](https://cursor.com/docs/council.md), [Anthropic effort](https://platform.claude.com/docs/en/build-with-claude/effort), [OpenAI reasoning](https://developers.openai.com/api/docs/guides/reasoning), [Composer 2.5](https://cursor.com/blog/composer-2-5), [GPT-5.6](https://openai.com/index/gpt-5-6/), [GPT-5.3 Codex](https://openai.com/index/introducing-gpt-5-3-codex/), [Sonnet 5](https://www.anthropic.com/news/claude-sonnet-5), [Grok 4.5](https://docs.x.ai/developers/grok-4-5), [Kimi K2.7 Code](https://www.kimi.com/resources/kimi-k2-7-code). Independent: [AA Composer 2.5](https://artificialanalysis.ai/articles/cursor-composer-2-5-coding-agent-index), [AA GPT-5.6](https://artificialanalysis.ai/articles/gpt-5-6-has-landed).

## Cursor cost model

Apply **before** capability fit when any explicit slug is under consideration.

| Factor                | Rule                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **First-party pool**  | Auto, Composer 2.5, Grok 4.5 — Cursor documents significantly more included usage than named API models                         |
| **API pool**          | Named third-party/API models billed at API rates — use only when Auto/cheaper first-party paths are unavailable or insufficient |
| **Throughput `fast`** | Same intelligence, higher token price for lower latency (Composer Fast ≈ 6× token price for roughly no intelligence gain)       |
| **Reasoning effort**  | low / medium / high / xhigh / max changes thinking/tool token spend and quality — orthogonal to throughput `fast`               |

**Selection order**

1. Can Auto handle this slice? → use Auto.
2. Else → cheapest available model still likely good enough for the slice.
3. Else → escalate to the **most appropriate** stronger model for the slice (strength cards below), not the highest-priced enum entry.

Do not pick a model only because it has a high benchmark score.

## Auto reachability

**Invariant:** `Parent model = Auto` + no user model override ⇒ omit Task/Subagent `model`. `inherit-auto` is a plan sentinel only — never translate it into an explicit slug. Tier→slug mapping runs only after confirming the parent is **named**.

| Parent    | Task enum has `auto` | Member `model`             | Log                  |
| --------- | -------------------- | -------------------------- | -------------------- |
| **Auto**  | n/a                  | **Omit** `model` (inherit) | `inherit-auto`       |
| **Named** | yes                  | Pass `model=auto`          | `model=auto`         |
| **Named** | no                   | **Cannot reach Auto**      | `Auto reachable: no` |

**Cost-controlled `N ≥ 2`:** If Auto is unreachable (named parent, no `auto` in enum), **stop** and ask the user to switch the parent chat to Auto. Do not silently assign explicit paid/API slugs. User-named models still win. Record the override.

**Plan vs tool:** `model=inherit-auto` in the plan → omit `model` on the tool call. `model=<slug>` in the plan → pass `model="<slug>"` only if the slug is in the host enum.

Bracket forms such as `composer-2.5[fast=false]` are documented for subagent frontmatter. Live Task calls can reject them unless present in the enum. Never invent them in Task calls.

## Effort vs fast

| Control              | Controls                            | Parallel rule (`N ≥ 2`)                                        |
| -------------------- | ----------------------------------- | -------------------------------------------------------------- |
| **Reasoning effort** | Thinking/tool depth and token spend | low for mechanical. medium default. high for single escalation |
| **Throughput fast**  | Latency only (same intelligence)    | **Do not use** `*-fast` unless user explicitly wants latency   |

High-fast bundles (`gpt-5.3-codex-high-fast`, `cursor-grok-4.5-high-fast`) are **sequential escalations only**.

Effort guidance:

- **Low** — mechanical lookup, narrow gather, classification
- **Medium** — default for parallel members that need some reasoning. Ordinary reviews and moderate research.
- **High** — single-member adjudication after conflict, complex debugging, multi-subsystem architecture (still prefer mid-tier models unless the heavy bar is met)
- **Xhigh/max** — sequential escalation only for genuinely heavy slices (multi-thousand-line / Broad+ review, multi-subsystem blast radius, explicit deepest-analysis) when stakes justify it

## Strength cards

When a slice needs more than Auto, assign the most appropriate stronger model.

| Model / path                          | Best at                                                                                       | Weak / caveats                                                               | Escalate here when                                                                                                                                           |
| ------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Auto**                              | Cost-efficient routing. Balances intelligence, cost, reliability (Cursor primary docs).       | No fixed public bench profile. Unreachable from named parent without `auto`. | Default for all normal slices                                                                                                                                |
| **Regular Composer 2.5**              | Cursor-native long-horizon coding. Complex instructions. Strong cost/task.                    | Often absent from Task enum. Coding-specialized.                             | Repo/coding delegate when Auto unavailable and regular Composer is selectable                                                                                |
| **`composer-2.5-fast`**               | Same intelligence as regular Composer, lower latency                                          | ≈6× token price. Wasteful in parallel batches.                               | Interactive `N = 1` only, with explicit latency justification                                                                                                |
| **Grok 4.5 (non-fast)**               | Coding, agentic/terminal work. First-party pool when exposed.                                 | High-fast bundles expensive. Not frontier on every SWE bench.                | Terminal-heavy first-party work when Auto unavailable and non-fast Grok exists                                                                               |
| **`cursor-grok-4.5-high-fast`**       | Strong terminal/agentic when bundled high+fast is worth cost                                  | Expensive high-fast. Poor parallel default.                                  | Sequential terminal/debug escalation only                                                                                                                    |
| **`gpt-5.6-luna-*`** (if exposed)     | Cheapest GPT-5.6 tier. High-volume lower-stakes work.                                         | Weaker than Sol on hardest coding/reasoning                                  | Cheap API fallback for mechanical/low-stakes when Auto unavailable                                                                                           |
| **`gpt-5.6-terra-medium`**            | Balanced GPT-5.6. Moderate reasoning and coding-agent performance.                            | Weaker than Sol on hard review. Not always Pareto-best vs Luna/Sol.          | Moderate integration/synthesis when cheaper paths likely insufficient                                                                                        |
| **`claude-sonnet-5-thinking-medium`** | Agentic follow-through. Brownfield debug. Adjudication. Tool/terminal use.                    | API-pool cost. Below Opus on hardest science/reasoning.                      | Conflicting members, ambiguous adjudication, sustained agentic explore                                                                                       |
| **`gpt-5.3-codex-high-fast`**         | Long agentic coding. Terminal. Interactive steering. Computer-use loops.                      | Expensive high-fast. Weaker than Sonnet on some repo-reasoning benches.      | Sequential long-horizon implementation/debug when cheaper coding paths fail                                                                                  |
| **`gpt-5.6-sol-medium`**              | Hardest GPT-5.6 reasoning. Coding-agent index leader. Polish for knowledge/architecture work. | Highest GPT-5.6 cost. Overkill for mechanical and ordinary Standard slices.  | Heavy bar only: multi-thousand-line / Broad+ review, multi-subsystem blast radius, high-stakes tiebreaker after cheaper paths fail, deepest-analysis request |
| **`kimi-k2.7-code`**                  | Long-horizon coding. 256K context. MCP/tool workflows.                                        | Thinking always on. Vendor-heavy benches. Not cheapest mechanical worker.    | Large-context coding, open-weight, or Kimi tool workflows when cheaper paths fail                                                                            |

## Escalation by slice shape

Use after Auto is ruled out or explicitly declined.

| Slice shape                                 | Cheapest likely fit              | Most appropriate escalation                                                                               |
| ------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Mechanical explore/gather                   | Auto                             | Luna / cheapest exposed API only if Auto unavailable and user accepts spend                               |
| Repo map / coding delegate                  | Auto → regular Composer 2.5      | Sonnet 5 medium (harder brownfield). Codex (long tool-driven implementation).                             |
| Ordinary review / single-subsystem judgment | Auto → mid-tier (Terra / Sonnet) | Stay Standard. Do **not** jump to Sol/Premium.                                                            |
| Multi-thousand-line / Broad+ review         | Auto first                       | Sol (or strongest appropriate) only when volume + stakes meet the heavy bar. Otherwise Sonnet/Terra.      |
| Web/docs research                           | Auto                             | Mid-tier API or Sonnet only if synthesis/conflict risk is material                                        |
| Terminal-heavy work                         | Auto → first-party Grok non-fast | Grok high-fast or Codex as sequential escalation only                                                     |
| Conflicting member outputs                  | Single tiebreaker. Auto first.   | Sonnet 5 medium for adjudication. Sol only for architecture-level contradiction that meets the heavy bar. |
| Multi-subsystem architecture blast radius   | Single sequential member         | Sol medium (heavy bar). Single-subsystem architecture stays Standard / Sonnet.                            |
| Long-horizon implementation/debug           | Auto or regular Composer         | Codex high-fast only if cheaper coding paths fail and user accepts cost                                   |

## Routing precedence (canonical order)

Resolve every member’s model action in this order — do **not** run tier→slug mapping before parent-aware routing:

1. **User-requested member model** — if the user named a model for this member and it is in the host enum, pass that exact slug. If unsupported, report the unsupported request. Do not invent or substitute a different slug.
2. **Auto parent → inherit Auto** — omit the Task/Subagent `model` argument. Log `model=inherit-auto`. Tier metadata (including Premium) must not select a slug.
3. **Named parent → explicit tier-to-slug routing** — only after the parent is named. Prefer `model=auto` when that enum value exists. Otherwise map tier via strength cards and escalation tables above (Cursor cost first, cheapest good enough, most appropriate escalation).
4. **Usage/rate-limit failure → retry once via Auto inheritance** — same member, prompt, type, and stance. Omit `model` (or pass `model=auto` if that is how Reach Auto works for a named parent with `auto` in enum).
5. **If the Auto retry fails** — document the missing member. Do not invent output.

**Hard invariant:** `Parent model = Auto` + `no user model override` ⇒ the spawned Task/Subagent call has **no** `model` property.

## Parent-aware routing (Auto first)

| Parent                          | Initial member `model`                 | Notes                                                                                              |
| ------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Auto**                        | **Omit** `model` (inherit parent Auto) | Default for **all** normal members, including Standard/Premium tiers. User-named model still wins. |
| **Named**, enum includes `auto` | Pass `model=auto` for normal members   | Log `model=auto`. Explicit slugs only for justified named-parent escalation or user override.      |
| **Named**, no `auto` in enum    | **Cannot reach Auto**                  | For cost-controlled `N ≥ 2`, **stop** and ask user to switch parent to Auto — do not silent-spend. |
| User named a model for a member | That slug (must be in enum)            | Overrides Auto inherit and cost routing. Record override in dispatch plan.                         |

**How to get Auto on Task:**

| Situation                                          | Member `model`                                                                   |
| -------------------------------------------------- | -------------------------------------------------------------------------------- |
| Parent is **Auto**                                 | **Omit** `model` (inherits parent Auto). Log `model=inherit-auto`.               |
| Parent is **named**, but Task enum includes `auto` | Pass `model=auto` (only when the slug is in the current enum).                   |
| Parent is **named**, and `auto` is **not** in enum | You **cannot** reach Auto via Task. Omit `model` only inherits the named parent. |

Do **not** invent `auto` when it is absent from the enum. Do **not** treat “omit `model`” as Auto when the parent is on a named model — that still bills/uses the parent’s named model.

**Plan vs tool syntax** (repeat at spawn time):

| Dispatch-plan value     | Actual Task/Subagent arguments          |
| ----------------------- | --------------------------------------- |
| `model=inherit-auto`    | **Omit** the `model` property           |
| `model=auto`            | Pass `model="auto"` (enum must list it) |
| `model=<explicit slug>` | Pass `model="<explicit slug>"`          |

Record in the dispatch plan: `Parent model`, `User model overrides`, `Auto reachable`, `Host supports`, `Billing pool`, `Explicit model slugs used`, `Fast variants used`.

**Usage-constrained mode:** If the user is out of credits or on usage limits, route **all** members via [Reach Auto](#reach-auto) below. Do the same if the first member fails for that reason. Do not keep assigning paid/API slugs.

## Pre-spawn model-routing gate

**Mandatory before any Task/Subagent call.** If any gate item fails, do not spawn. Correct the plan first.

- [ ] Parent model mode recorded (`Auto` or named)
- [ ] Any user model override recorded (`User model overrides: none | …`)
- [ ] Every member has a resolved model action (`inherit-auto` | `auto` | explicit slug)
- [ ] Auto-parent members without user overrides use `model=inherit-auto` in the plan
- [ ] Their actual spawn calls **omit** `model` (plan `inherit-auto` must not become a tool `model` property)
- [ ] Explicit slugs appear only for named-parent routing or recorded user overrides
- [ ] Every explicit slug exists in the current host Task `model` enum
- [ ] Model diversity never causes tier escalation or an Auto override (diversify prompts/stances instead)
- [ ] Premium / Standard tier metadata did not override an Auto parent
- [ ] Plan text and actual tool arguments agree

## Fail closed (do not spawn)

These contradictions are **hard stops** — correct before any member is spawned. Do not rely on informal noticing:

1. Plan says `Parent model: Auto` but any member has an explicit slug without a recorded user override → **do not spawn**. Correct that member to `model=inherit-auto` and omit the tool argument.
2. Plan says `model=inherit-auto` but the generated Task/Subagent call contains a `model` property → **invalid**. Remove `model` before dispatch.
3. Plan says named parent and an explicit slug (or `model=auto`) is required by named-parent rules but absent → resolve per [Routing precedence](#routing-precedence-canonical-order) or fail clearly. Do not spawn half-routed.
4. User requested an unsupported slug → report unsupported. Do not substitute another model.

## Explicit routing (named parent only)

When the parent is **named** and Auto is unreachable, route per this file’s cost model and strength cards. Do the same when a documented escalation under a named parent is justified and the user accepts spend.

1. **Cursor cost first** — prefer first-party pool over API pool. Never use throughput `fast` in `N ≥ 2` unless the user explicitly wants latency for that member.
2. **Cheapest good enough** — lowest-cost enum option still likely to succeed for the slice.
3. **Most appropriate escalation** — if cheaper paths are likely to fail, escalate to the matching strength card. Use Sonnet for adjudication, Sol for architecture, Codex for long tool-driven implementation. Do **not** pick the most expensive enum entry by default.
4. **Effort ≠ fast** — raise reasoning effort for harder single-member work. Do not buy `*-fast` for intelligence.

Under an **Auto** parent, do **not** enter this branch for normal members — inherit Auto instead. Host Auto selects the underlying model.

### Tier labels (planning only — subordinate to parent-aware routing)

Tier labels still appear in dispatch plans and agent `dispatch.model.default` metadata. They describe slice difficulty for **named-parent** routing only. Under an Auto parent, keep the tier label for planning/logging but set `model=inherit-auto` and omit the tool argument.

| Tier         | Slice needs                                                                                                                                                                    | Named-parent routing intent                                          | Escalate when (named parent only)                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Fast**     | Mechanical search, file discovery, repo mapping, narrow gather                                                                                                                 | Auto / cheapest non-fast good enough                                 | Cross-file integration or judgment calls needed                                                  |
| **Standard** | Moderate reasoning, explore follow-ups, web research, ordinary reviews, single-subsystem architecture, most synthesis                                                          | Auto first. Else cheapest mid fit per strength cards.                | Conflicting sources, ambiguous adjudication, or deeper synthesis that still fits mid-tier models |
| **Premium**  | Only genuinely heavy slices: multi-thousand-line / Broad+ reviews, multi-subsystem architecture blast radius, high-stakes synthesis tiebreakers, explicit deepest-analysis ask | Auto first. Else **most appropriate** stronger model for that slice. | — (do **not** label ordinary reviews, small diffs, or single-file judgment as Premium)           |

**Pick a slug:** follow [Routing precedence](#routing-precedence-canonical-order). Tier→slug mapping runs only on the named-parent branch.

### By job type

| Job                  | Default tier | Routing intent           | Escalate when (named parent)                                                            |
| -------------------- | ------------ | ------------------------ | --------------------------------------------------------------------------------------- |
| `explore` / `gather` | Fast         | Auto / cheapest non-fast | Cross-file integration or architectural judgment (still Standard unless Premium-heavy)  |
| `research` (web)     | Standard     | Auto first               | Conflicting sources or policy/legal ambiguity (Premium only if stakes + volume justify) |
| `mixed`              | Per slice    | Per slice shape above    | Premium only when a slice meets the heavy bar                                           |

Per-agent tier defaults → agent dispatch config + this file.

## Diversity

Never escalate price, choose `fast`, or override Auto just to diversify. Diversify prompts and/or stances first. When the parent is on Auto, shared Auto across members is expected and correct. If `N ≥ 2` share the same `subagent_type` under a named parent, and explicit models are already justified, prefer same-tier or similar-cost distinct models. Do this only when the user wants diversity. **Do not escalate tier just to diversify.**

**Adversarial carve-out:** For `Goal: adversarial` / `adversarial-staged`, distinct same-tier family slugs are allowed when the user requests cross-model / different models. They are also allowed under a named parent when diversity is wanted — see [adversarial.md](adversarial.md) § Model routing overlay. Under an Auto parent with no user override, still `inherit-auto` (omit `model`).

## Anti-fast (parallel)

For `N ≥ 2`, do **not** pass `*-fast` or high-fast bundles unless the user explicitly requests lower latency for that member. High-fast slugs are sequential escalations only (named parent or user override).

## Reach Auto

Use this as the **default** model path for normal members, and whenever members must run on host Auto (usage-constrained mode, or a usage-limit retry):

1. If parent is **Auto** → omit `model` (inherit). Log `model=inherit-auto`.
2. Else if Task enum includes `auto` → pass `model=auto`. Log `model=auto` (add `— usage/rate limit` on retries).
3. Else → **stop assigning named/paid slugs** for cost-controlled runs. Tell the user that Auto works only when the **parent chat** is on Auto. Auto also works when the host exposes `auto` in the Task enum. Ask them to switch the parent to Auto and re-run failed members. Do not claim a retry “used Auto” if you only omitted `model` under a named parent.

## Usage-limit retry

If a member **failed to start** or was **stopped** for usage, rate, quota, or credit limits on the chosen model:

1. Enter **usage-constrained mode** for the rest of this subagent dispatch run.
2. Retry that **same** member once via [Reach Auto](#reach-auto). Keep the same `subagent_type`, prompt, and stance. Change only the model action to Auto inheritance.
3. Use this path for Task-tool pre-start failures and for post-start member failures.
4. Re-route any **not-yet-started** members via Reach Auto as well. Do not spawn more paid/API slugs after the first usage failure.
5. Log the retry/re-route in the dispatch plan (`retried/routed via Reach Auto — usage/rate limit`).
6. If Reach Auto is blocked (named parent and no `auto` in enum), stop and ask the user to switch the parent chat to Auto. Do not burn further named-model attempts.
7. If an Auto retry also fails, document the failure and continue with remaining reachable members. Do not invent that member's output.

Also use this path when the member returned an error for those same limit reasons.

## Anti-patterns

- Premium / Sol / Codex for mechanical grep or narrow file discovery
- Premium / Sol for ordinary reviews, small/medium diffs, or single-subsystem architecture that Standard can handle
- Labeling a slice Premium because the job is “important” without meeting the heavy bar (volume, multi-subsystem blast radius, or explicit deepest-analysis)
- `composer-2.5-fast` (or any `*-fast`) as the default for parallel Standard members
- High-fast bundles in `N ≥ 2` parallel dispatch
- Inventing `auto`, `composer-2.5`, or bracket forms absent from the host enum
- Choosing the most expensive model when a cheaper appropriate one fits the slice
- Omitting `model` under a named parent and claiming Auto inheritance
- Silencing cost-controlled parallel runs onto API-pool slugs when Auto is unreachable
- Recording `Parent model: Auto` then passing any explicit Task `model` without a user override (including Premium-tier members)
- Translating plan sentinel `inherit-auto` into an arbitrary slug such as `gpt-5.3-codex-high-fast`
- Letting tier metadata or model diversity override an Auto parent

## Example dispatches (validation)

### A. Correct — Auto parent (omit `model`, even for Premium)

Dispatch plan:

```markdown
Parent model: Auto
User model overrides: none
Auto reachable: inherit-auto
Host supports: [explore, docs-researcher, generalPurpose, …]
Billing pool: first-party
Explicit model slugs used: none
Fast variants used: none

Selected members:

- reviewer · tier=Premium · model=inherit-auto · stance=correctness: Broad+ multi-thousand-line review (heavy bar)
- docs-researcher · tier=Standard · model=inherit-auto · stance=n/a: topic A
- explore · tier=Fast · model=inherit-auto · stance=n/a: repo map for cited APIs
```

Spawn call conceptually (every member):

```text
Task/Subagent(
  subagent_type="...",
  prompt="..."
)
```

There is **no** `model` argument, even though a member’s metadata says Premium. Expected: omit `model` on all Tasks. No `*-fast`. No API slugs. Ordinary (non-heavy) reviewers must be `tier=Standard`, not Premium.

### B. Incorrect — Auto parent with an explicit slug

```markdown
Parent model: Auto

- reviewer · tier=Premium · model=gpt-5.3-codex-high-fast
```

**Invalid** unless the user explicitly requested that model for the member. Pre-spawn gate must fail closed: correct to `model=inherit-auto` and omit the tool argument. Do not “fix” by swapping to Composer or another slug.

### C. Correct — named parent (tier routing after Auto ruled out)

```markdown
Parent model: <named model>
User model overrides: none
Auto reachable: no

- reviewer · tier=Standard · model=composer-2.5-fast
```

The explicit slug is selected using named-parent tier-routing rules **and** only if it exists in the host enum. Prefer non-fast / cheapest good enough when available. `*-fast` still requires an explicit latency reason for `N ≥ 2`.

### D. Correct — explicit user override under Auto parent

```markdown
Parent model: Auto
User model overrides: reviewer=gpt-5.3-codex-high-fast

- reviewer · tier=Premium · model=gpt-5.3-codex-high-fast
```

This explicit model is valid because the user requested it and the host enum supports it. Unsupported overrides → report. Do not substitute.

### E. Correct — usage-limit retry

Initial named-parent dispatch uses an explicit model and fails due to quota or rate limits. Retry the **same** member with the same prompt, type, and stance. Omit `model` (or pass `model=auto` when that enum value is how Reach Auto works) to use Auto inheritance.

### F. Named parent, `auto` absent from enum — cost-controlled `N ≥ 2`

```markdown
Parent model: claude-sonnet-5-thinking-medium
Auto reachable: no
Host supports: [composer-2.5-fast, gpt-5.6-terra-medium, …] # no auto
```

Expected: **stop**. Ask user to switch parent to Auto. Do not spawn paid/API slugs for a cost-controlled parallel batch.

### G. Sequential Premium escalation (named parent or user override only)

```markdown
Parent model: <named model>
N = 1 (sequential tiebreaker)
User model overrides: none
Explicit model slugs used: claude-sonnet-5-thinking-medium — adjudication of conflicting member outputs. API pool accepted
Fast variants used: none
```

Expected: single Task with explicit Sonnet medium when parent is named (or user override). Under an Auto parent without a user override, the tiebreaker still uses `inherit-auto` / omit `model` — do not invent a Premium slug to “force” strength.
