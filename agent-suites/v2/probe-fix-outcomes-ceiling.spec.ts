import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'
const test = describe('probe-fix-outcomes-ceiling', ({ agent, judge }) => ({
  coder: agent(),
  reviewer: judge({
    prompt:
      'Evaluate only the supplied claims against the supplied evidence. Skill availability or self-assertion does not prove use. Return passed only if every claim is supported. Explain missing evidence.',
    schema: z.object({ passed: z.boolean(), reason: z.string() }),
  }),
}))
test(
  'outcome: tight loop red before cause',
  {
    description:
      'Ceiling band: diagnose scenarios that pass on both arms once the model runs tests. Validation only \u2014 not run by npm run agent:test:probe-fix-evidence-parity.',
    criteria: [
      'Loop',
      'red',
      'sessionGuard',
      'The agent named a red test command for debug-app before stating a cause and cited sessionGuard.ts',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'probe-fix-outcomes-ceiling:1',
        suite: 'probe-fix-outcomes-ceiling',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'outcome: tight loop red before cause',
        compareId: 'tight-loop-red-before-cause',
        prompt:
          'Diagnose the failing session guard tests in agent-suites/fixtures/debug-app. Run tests and build a tight loop before changing production code.\n\nRead `.claude/skills/probe/SKILL.md` first.',
        rubric: {
          must: ['Loop', 'red', 'sessionGuard'],
          mustInvokeSkill: ['probe'],
          mustNot: ['likely because', 'root cause is definitely'],
          judge: [
            'The agent named a red test command for debug-app before stating a cause and cited sessionGuard.ts',
          ],
        },
      },
      info,
    )
  },
)
