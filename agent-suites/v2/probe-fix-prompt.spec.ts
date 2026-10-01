import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'
const test = describe('probe-fix-prompt', ({ agent, judge }) => ({
  coder: agent(),
  reviewer: judge({
    prompt:
      'Evaluate only the supplied claims against the supplied evidence. Skill availability or self-assertion does not prove use. Return passed only if every claim is supported. Explain missing evidence.',
    schema: z.object({ passed: z.boolean(), reason: z.string() }),
  }),
}))
test(
  'prompt: session hunch A',
  {
    description:
      'Live evidence-parity band: prompt-instructed null baseline (skills:none, entry-gate / ordering rules in prompt \u2014 no probe skill file).',
    criteria: [
      'repro',
      'Refused to hypothesize without a failing signal; asked for a repro or routed to Evidence stance',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'probe-fix-prompt:1',
        suite: 'probe-fix-prompt',
        defaults: { profile: 'cursor', skills: 'none' },
        name: 'prompt: session hunch A',
        compareId: 'no-repro-refuse',
        prompt:
          "Something feels wrong with session handling in debug-app but I have no failing test output or repro steps. What's going on?\n\nIf there is no failing test, script, or repro you can run, do not hypothesize \u2014 ask for a repro or route to Evidence stance.",
        seedPatch: '_agent/probe-fix-null-arm-hygiene.patch',
        rubric: {
          must: ['repro'],
          mustNot: ['the bug is caused by', 'root cause is', 'likely because'],
          mustNotReadPath: ['probe/SKILL.md', 'no-repro-refuse.json', 'evidence-parity.md'],
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
  'prompt: session hunch B',
  {
    description:
      'Live evidence-parity band: prompt-instructed null baseline (skills:none, entry-gate / ordering rules in prompt \u2014 no probe skill file).',
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
        id: 'probe-fix-prompt:2',
        suite: 'probe-fix-prompt',
        defaults: { profile: 'cursor', skills: 'none' },
        name: 'prompt: session hunch B',
        compareId: 'loop-before-cause',
        prompt:
          'Users see sessions valid at exact expiry in agent-suites/fixtures/debug-app. Find and fix the bug.\n\nRun npm test in debug-app and report red before naming a cause or editing production code.',
        seedPatch: '_agent/probe-fix-null-arm-hygiene.patch',
        rubric: {
          must: ['npm test', 'red'],
          mustNot: ['likely because', 'probably caused'],
          mustNotReadPath: ['probe/SKILL.md', 'loop-before-hypothesis.json', 'evidence-parity.md'],
          judge: [
            'Ran or named debug-app test command and reported red before proposing a production fix',
          ],
        },
      },
      info,
    )
  },
)
