# Routing

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

## Owns

Bounded **code slice** or **plan section** iterative closure until `Closure: ready`.

## Routes elsewhere

| User ask                                          | Skill                       |
| ------------------------------------------------- | --------------------------- |
| Full plan / PRD pre-build critique                | **second-opinion**          |
| Plan § or mid-implementation slice until cohesive | **iterate**                 |
| PR, branch, diff, merge-ready                     | **code-review**             |
| Open design dialogue without slice target         | **grill** / **crystallize** |
| One concrete doubt, no fix loop                   | **probe** (Evidence)        |
| Broken behavior, repro-first                      | **probe** (Fix)             |

## During / after code-review

| Signal in review pass                         | Route to             |
| --------------------------------------------- | -------------------- |
| Bounded area cohesion thrash (not merge-only) | **iterate**          |
| One falsifiable doubt, no fix loop            | **probe** (Evidence) |
| Repro-first failure surfaced                  | **probe** (Fix)      |

## Peer negations (reciprocal)

When installing, ensure sibling descriptions include:

- **code-review** — not slice cohesion loops → **iterate**
- **second-opinion** — not iterative slice closure → **iterate**
- **iterate** — not PR merge review, full-plan debate, single hunch

## After closure

| Next step                           | Skill              | Pack / surface hint                           |
| ----------------------------------- | ------------------ | --------------------------------------------- |
| Merge / PR review of resulting diff | **code-review**    | `source:branch` or `pr` · default lens        |
| Context full — continue elsewhere   | **handoff**        | `Pack: fix-loop` or `pointers` + `Goal:` slug |
| Persist terms or ADRs               | **domain-model**   | —                                             |
| Hard bug with repro                 | **probe** (Fix)    | —                                             |
| Full plan still untested            | **second-opinion** | artifact path only                            |
