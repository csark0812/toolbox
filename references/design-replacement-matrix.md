# Design skill retirement

<!-- source-of-truth: why the Toolbox design skills were retired and what replaces them. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-12 -->

`interface-design` and `css-craft` replaced the archived `frontend-design` and `modern-css` skills in 2026-10 and were retired on 2026-10-12. The archived originals stay in [original-skills](original-skills/README.md) as reference.

## Evidence

The UI benchmark in `agent-suites/ui-bench/` builds pages from fixture briefs, renders them, and compares versions blind. Results, graded by the repository owner and by a calibrated Opus judge:

| Compared with a one-sentence quality instruction                        | Human grades                                                        |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `interface-design` and `css-craft`, before and after adding craft rules | No better; judge and human mostly tied or preferred the instruction |
| Archived Construct web-designer and app-designer                        | No better (36–38% judge win rate, equal ship scores)                |
| Compact from-scratch rule skill, two versions                           | 0 wins, 7 losses, 2 ties on Haiku; 1 win, 4 losses, 1 tie on Sonnet |

Agents read each SKILL.md but rarely opened its reference files. A stronger builder model (Sonnet over Haiku) improved how the pages looked; skill text did not.

## Replacement

Give UI tasks a short instruction, for example: "Make it well crafted: accessible, responsive from 320px, consistent with the existing design system, and check the rendered result." A project's components, tokens, and layout patterns belong in that project's own skill. Test any new design skill against that instruction in the UI benchmark, graded by a person, before adding it here.
