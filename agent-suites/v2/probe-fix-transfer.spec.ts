import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'
const test = describe('probe-fix-transfer', ({ agent, judge }) => ({
  coder: agent(),
  reviewer: judge({
    prompt:
      'Evaluate only the supplied claims against the supplied evidence. Skill availability or self-assertion does not prove use. Return passed only if every claim is supported. Explain missing evidence.',
    schema: z.object({ passed: z.boolean(), reason: z.string() }),
  }),
}))
test(
  'transfer: session hunch A',
  {
    description:
      'Direct evidence-parity band: discriminating null baseline (skills:none, hunch-only prompts). Ceiling scenarios live in probe-fix-outcomes-ceiling (validation only).',
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
        id: 'probe-fix-transfer:1',
        suite: 'probe-fix-transfer',
        defaults: { profile: 'cursor', skills: 'none' },
        name: 'transfer: session hunch A',
        compareId: 'no-repro-refuse',
        prompt: "Something feels wrong with session handling in debug-app. What's the bug?",
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
  'transfer: session hunch B',
  {
    description:
      'Direct evidence-parity band: discriminating null baseline (skills:none, hunch-only prompts). Ceiling scenarios live in probe-fix-outcomes-ceiling (validation only).',
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
        id: 'probe-fix-transfer:2',
        suite: 'probe-fix-transfer',
        defaults: { profile: 'cursor', skills: 'none' },
        name: 'transfer: session hunch B',
        compareId: 'loop-before-cause',
        prompt:
          'Users see sessions valid at exact expiry in agent-suites/fixtures/debug-app. Find and fix the bug.',
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
