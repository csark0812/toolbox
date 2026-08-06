# Routing

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

## Owns

Bounded **code slice** or **plan section** iterative closure until `Closure: ready`.

## Routes elsewhere

| User ask                                          | Skill                       |
| ------------------------------------------------- | --------------------------- |
| Full plan / PRD pre-build critique                | **second-opinion**          |
| Plan § or mid-implementation slice until cohesive | **iterative-review**        |
| PR, branch, diff, merge-ready                     | **code-review**             |
| Open design dialogue without slice target         | **grill** / **crystallize** |
| One concrete doubt, no fix loop                   | **investigate**             |
| Broken behavior, repro-first                      | **diagnose**                |

## Peer negations (reciprocal)

When installing, ensure sibling descriptions include:

- **code-review** — not slice cohesion loops → **iterative-review**
- **second-opinion** — not iterative slice closure → **iterative-review**
- **iterative-review** — not PR merge review, full-plan debate, single hunch

## After closure

| Next step                           | Skill            |
| ----------------------------------- | ---------------- |
| Merge / PR review of resulting diff | **code-review**  |
| Persist terms or ADRs               | **domain-model** |
| Hard bug with repro                 | **diagnose**     |
