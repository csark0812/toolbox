import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'

const test = describe('interface-design', ({ agent, judge }) => ({
  coder: agent(),
  reviewer: judge({
    prompt:
      'Evaluate only the supplied claims against actual output and tool evidence. Skill availability or self-assertion does not prove use. Return passed only if every claim is supported.',
    schema: z.object({ passed: z.boolean(), reason: z.string() }),
  }),
}))

test(
  'unsettled web direction',
  {
    description: 'unsettled web direction',
    criteria: [
      'The response proposes three conceptually distinct visual boards with content, layout, type, color and fit or risk, and holds final implementation for a user direction choice. It reserves disposable first-screen renders for choices that need layout or motion proof.',
      'The response treats real dashboard content, states, accessibility and responsive proof as required before completion. It makes no unsupported claim of having rendered the design.',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'interface-design:1',
        suite: 'interface-design',
        name: 'unsettled web direction',
        defaults: { profile: 'cursor', skills: 'full' },
        prompt:
          'We are redesigning a research dashboard. The goal is to help a reader resume one saved paper and see its annotations. Direction is unsettled. Give the process and first review artifact only; do not edit files. Read `.claude/skills/interface-design/SKILL.md` and its relevant reference first.',
        evidencePolicy: 'read-only',
        rubric: {
          mustInvokeSkill: ['interface-design'],
          judge: [
            'The response proposes three conceptually distinct visual boards with content, layout, type, color and fit or risk, and holds final implementation for a user direction choice. It reserves disposable first-screen renders for choices that need layout or motion proof.',
            'The response treats real dashboard content, states, accessibility and responsive proof as required before completion. It makes no unsupported claim of having rendered the design.',
          ],
        },
      },
      info,
    )
  },
)

test(
  'existing direction',
  {
    description: 'existing direction',
    criteria: [
      'The response accepts the supplied direction without asking for three new boards or another choice. It plans concrete content, reachable states, responsive, accessibility and rendered verification.',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'interface-design:2',
        suite: 'interface-design',
        name: 'existing direction',
        defaults: { profile: 'cursor', skills: 'full' },
        prompt:
          'The user has selected a restrained editorial direction for a new web reading page. Explain the next implementation and verification steps only; do not edit files. Read `.claude/skills/interface-design/SKILL.md` first.',
        evidencePolicy: 'read-only',
        rubric: {
          mustInvokeSkill: ['interface-design'],
          judge: [
            'The response accepts the supplied direction without asking for three new boards or another choice. It plans concrete content, reachable states, responsive, accessibility and rendered verification.',
          ],
        },
      },
      info,
    )
  },
)
