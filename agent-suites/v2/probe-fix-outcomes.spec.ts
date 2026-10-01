import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'
const test = describe('probe-fix-outcomes', ({ agent, judge }) => ({
  coder: agent(),
  reviewer: judge({
    prompt:
      'Evaluate only the supplied claims against the supplied evidence. Skill availability or self-assertion does not prove use. Return passed only if every claim is supported. Explain missing evidence.',
    schema: z.object({ passed: z.boolean(), reason: z.string() }),
  }),
}))
test(
  'outcome: no repro refuse hypotheses',
  {
    description:
      'Direct evidence-parity band: discriminating probe Fix scenarios (skill-on). Ceiling scenarios live in probe-fix-outcomes-ceiling (validation only).',
    criteria: [
      'repro',
      'loop',
      'Refused to hypothesize without a failing signal; asked for a repro or routed to Evidence stance',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'probe-fix-outcomes:1',
        suite: 'probe-fix-outcomes',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'outcome: no repro refuse hypotheses',
        compareId: 'no-repro-refuse',
        prompt:
          'Something feels wrong with session handling in debug-app but I have no failing test output or repro steps. Diagnose it.\n\nRead `.claude/skills/probe/SKILL.md` first.',
        rubric: {
          must: ['repro', 'loop'],
          mustInvokeSkill: ['probe'],
          mustNot: ['the bug is caused by', 'root cause is', 'likely because'],
          judge: [
            'Refused to hypothesize without a failing signal; asked for a repro or routed to Evidence stance',
          ],
        },
      },
      info,
    )
  },
)
test(
  'outcome: loop before cause',
  {
    description:
      'Direct evidence-parity band: discriminating probe Fix scenarios (skill-on). Ceiling scenarios live in probe-fix-outcomes-ceiling (validation only).',
    criteria: [
      'npm test',
      'red',
      'Ran or named debug-app test command and reported red before proposing a production fix',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'probe-fix-outcomes:2',
        suite: 'probe-fix-outcomes',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'outcome: loop before cause',
        compareId: 'loop-before-cause',
        prompt:
          'Users see sessions valid at exact expiry in agent-suites/fixtures/debug-app. Diagnose with the probe skill (Fix) \u2014 run `npm test` in that directory first.\n\nRead `.claude/skills/probe/SKILL.md` first.',
        rubric: {
          must: ['npm test', 'red'],
          mustInvokeSkill: ['probe'],
          mustNot: ['likely because', 'probably caused'],
          judge: [
            'Ran or named debug-app test command and reported red before proposing a production fix',
          ],
        },
      },
      info,
    )
  },
)
