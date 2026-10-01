import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'
const test = describe('tdd', ({ agent, judge }) => ({
  coder: agent(),
  reviewer: judge({
    prompt:
      'Evaluate only the supplied claims against the supplied evidence. Skill availability or self-assertion does not prove use. Return passed only if every claim is supported. Explain missing evidence.',
    schema: z.object({ passed: z.boolean(), reason: z.string() }),
  }),
}))
test(
  'seams: confirm before first test',
  {
    description:
      'Portable tdd skill conformance: seam confirmation before first test, red-green slice discipline',
    criteria: [
      'seam',
      'confirm',
      'The agent invoked tdd, named public seams, and asked for user confirmation before authoring any test code',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'tdd:1',
        suite: 'tdd',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'seams: confirm before first test',
        prompt:
          'Use TDD to add a `normalizePath` helper in agent-suites/fixtures/sample-app/src/redirect.ts that preserves query strings on relative paths.\n\nRead `.claude/skills/tdd/SKILL.md` first. Before writing any test, name the seams and ask me to confirm them. Do not write a failing test until I confirm.',
        rubric: {
          must: ['seam', 'confirm'],
          mustInvokeSkill: ['tdd'],
          mustNot: ['expect(', 'it(', 'test(', 'describe('],
          judge: [
            'The agent invoked tdd, named public seams, and asked for user confirmation before authoring any test code',
          ],
        },
      },
      info,
    )
  },
)
