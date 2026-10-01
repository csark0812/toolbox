import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'
const test = describe('prototype', ({ agent, judge }) => ({
  coder: agent(),
  reviewer: judge({
    prompt:
      'Evaluate only the supplied claims against the supplied evidence. Skill availability or self-assertion does not prove use. Return passed only if every claim is supported. Explain missing evidence.',
    schema: z.object({ passed: z.boolean(), reason: z.string() }),
  }),
}))
test(
  'up front: question and mode before code',
  {
    description:
      'Portable prototype skill conformance: declare question + mode before writing code',
    criteria: [
      'question',
      'mode',
      'throwaway',
      'The agent invoked prototype, stated a design question and throwaway/keep-skeleton mode, and did not write implementation code before those were clear',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'prototype:1',
        suite: 'prototype',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'up front: question and mode before code',
        prompt:
          'Prototype auth for our sample app.\n\nRead `.claude/skills/prototype/SKILL.md` first. Do not write any code until you have stated the design question and mode.',
        rubric: {
          must: ['question', 'mode', 'throwaway'],
          mustInvokeSkill: ['prototype'],
          mustNot: ['```ts', '```tsx', '```js', 'export function', 'export const'],
          judge: [
            'The agent invoked prototype, stated a design question and throwaway/keep-skeleton mode, and did not write implementation code before those were clear',
          ],
        },
      },
      info,
    )
  },
)
