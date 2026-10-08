import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'

const test = describe('css-craft', ({ agent, judge }) => ({
  coder: agent(),
  reviewer: judge({
    prompt:
      'Evaluate only the supplied claims against actual output and tool evidence. Skill availability or self-assertion does not prove use. Return passed only if every claim is supported.',
    schema: z.object({ passed: z.boolean(), reason: z.string() }),
  }),
}))

test(
  'focused CSS defect',
  {
    description: 'focused CSS defect',
    criteria: [
      'For this explanation-only request, the response names plausible intrinsic-size or container causes to inspect, gives a focused verification path for the 320px long-title case, and does not claim a cause or rendered result without inspecting the app. It does not launch visual boards or a global reset.',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'css-craft:1',
        suite: 'css-craft',
        name: 'focused CSS defect',
        defaults: { profile: 'cursor', skills: 'full' },
        prompt:
          'A long title overflows its card at 320px in an existing web app. Explain the diagnostic and verification path only; do not edit files. Read `.claude/skills/css-craft/SKILL.md` and its relevant reference first.',
        evidencePolicy: 'read-only',
        rubric: {
          mustInvokeSkill: ['css-craft'],
          judge: [
            'For this explanation-only request, the response names plausible intrinsic-size or container causes to inspect, gives a focused verification path for the 320px long-title case, and does not claim a cause or rendered result without inspecting the app. It does not launch visual boards or a global reset.',
          ],
        },
      },
      info,
    )
  },
)

test(
  'browser-aware technique',
  {
    description: 'browser-aware technique',
    criteria: [
      'For this explanation-only request, the response directs a current support check against primary platform documentation before implementation, plans a fallback and checks for state, keyboard use and reduced motion, and does not claim browser proof it did not perform.',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'css-craft:2',
        suite: 'css-craft',
        name: 'browser-aware technique',
        defaults: { profile: 'cursor', skills: 'full' },
        prompt:
          'We want to use a new CSS feature for an animated accordion. Explain the technique choice and proof, including support and reduced motion. Do not edit files. Read `.claude/skills/css-craft/SKILL.md` first.',
        evidencePolicy: 'read-only',
        rubric: {
          mustInvokeSkill: ['css-craft'],
          judge: [
            'For this explanation-only request, the response directs a current support check against primary platform documentation before implementation, plans a fallback and checks for state, keyboard use and reduced motion, and does not claim browser proof it did not perform.',
          ],
        },
      },
      info,
    )
  },
)
