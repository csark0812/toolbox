import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'

const test = describe('design-legacy-comparison', ({ agent, judge }) => ({
  coder: agent(),
  reviewer: judge({
    prompt:
      'Evaluate only the supplied claims against actual output and tool evidence. Return passed only if every claim is supported.',
    schema: z.object({ passed: z.boolean(), reason: z.string() }),
  }),
}))

test(
  'legacy web direction baseline',
  {
    description: 'legacy web direction baseline',
    criteria: [
      'Tool evidence establishes reading the archived frontend-design skill. The response accounts for user task, content, responsive behavior and accessibility, and does not claim a render it did not perform.',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'design-legacy-comparison:1',
        suite: 'design-legacy-comparison',
        name: 'legacy web direction baseline',
        defaults: { profile: 'cursor', skills: 'legacy-design' },
        prompt:
          'We are redesigning a research dashboard. The goal is to help a reader resume one saved paper and see its annotations. Direction is unsettled. Give the process and first review artifact only; do not edit files. Read `.claude/skills/frontend-design/SKILL.md` first.',
        evidencePolicy: 'read-only',
        rubric: {
          judge: [
            'Tool evidence establishes reading the archived frontend-design skill. The response accounts for user task, content, responsive behavior and accessibility, and does not claim a render it did not perform.',
          ],
        },
      },
      info,
    )
  },
)

test(
  'legacy CSS baseline',
  {
    description: 'legacy CSS baseline',
    criteria: [
      'Tool evidence establishes reading the archived modern-css skill and its layout reference. The response addresses the layout cause and narrow-width verification without inventing a rendered result.',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'design-legacy-comparison:2',
        suite: 'design-legacy-comparison',
        name: 'legacy CSS baseline',
        defaults: { profile: 'cursor', skills: 'legacy-design' },
        prompt:
          'A long title overflows its card at 320px in an existing web app. Explain the diagnostic and verification path only; do not edit files. Read `.claude/skills/modern-css/SKILL.md` and its relevant layout reference first.',
        evidencePolicy: 'read-only',
        rubric: {
          judge: [
            'Tool evidence establishes reading the archived modern-css skill and its layout reference. The response addresses the layout cause and narrow-width verification without inventing a rendered result.',
          ],
        },
      },
      info,
    )
  },
)
