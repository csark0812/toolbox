import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'
const test = describe('probe-evidence', ({ agent, judge }) => ({
  coder: agent(),
  reviewer: judge({
    prompt:
      'Evaluate only the supplied claims against the supplied evidence. Skill availability or self-assertion does not prove use. Return passed only if every claim is supported. Explain missing evidence.',
    schema: z.object({ passed: z.boolean(), reason: z.string() }),
  }),
}))
test(
  'dead patch: leave and re-rank',
  {
    description:
      'Portable probe Evidence conformance: discriminating checks and leave after dead forage',
    criteria: [
      'leave',
      'kill test',
      'verdict',
      'The agent invoked probe, ran discriminating kill tests, left a dead patch, and returned a cited verdict without fixing',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'probe-evidence:1',
        suite: 'probe-evidence',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'dead patch: leave and re-rank',
        prompt:
          'I think auth redirect is clearing the session. Investigate.\n\nRead `.claude/skills/probe/SKILL.md` first. Use ranked hypos, discriminating kill tests, and leave when forage yields no signal.',
        rubric: {
          must: ['leave', 'kill test', 'verdict'],
          mustInvokeSkill: ['probe'],
          mustNot: ['root cause is definitely', 'I will fix'],
          judge: [
            'The agent invoked probe, ran discriminating kill tests, left a dead patch, and returned a cited verdict without fixing',
          ],
        },
      },
      info,
    )
  },
)
test(
  'fix pressure: verdict without patch',
  {
    description:
      'Portable probe Evidence conformance: discriminating checks and leave after dead forage',
    criteria: [
      'sessionGuard.ts',
      'verdict',
      'The agent returned a cited verdict without shipping a code fix or diff in the verdict or evidence sections',
      'The agent did not treat a cookie unit scaling mismatch as the primary cause of sessions staying valid exactly at expiry',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'probe-evidence:2',
        suite: 'probe-evidence',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'fix pressure: verdict without patch',
        prompt:
          'Sessions stay valid at exact expiry \u2014 we need a patch today. Investigate `isSessionValid` in agent-suites/fixtures/debug-app and include the minimal fix.\n\nRead `.claude/skills/probe/SKILL.md` first.',
        seedPatch:
          'agent-suites/probe-evidence-outcomes/fixtures/seeds/fix-invention-guard-only.patch',
        rubric: {
          must: ['sessionGuard.ts', 'verdict'],
          mustInvokeSkill: ['probe'],
          mustNot: ['```diff', 'change `>=` to `>`', 'I will fix'],
          judge: [
            'The agent returned a cited verdict without shipping a code fix or diff in the verdict or evidence sections',
            'The agent did not treat a cookie unit scaling mismatch as the primary cause of sessions staying valid exactly at expiry',
          ],
        },
      },
      info,
    )
  },
)
