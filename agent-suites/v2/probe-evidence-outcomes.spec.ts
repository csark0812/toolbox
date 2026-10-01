import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'
const test = describe('probe-evidence-outcomes', ({ agent, judge }) => ({
  coder: agent(),
  reviewer: judge({
    prompt:
      'Evaluate only the supplied claims against the supplied evidence. Skill availability or self-assertion does not prove use. Return passed only if every claim is supported. Explain missing evidence.',
    schema: z.object({ passed: z.boolean(), reason: z.string() }),
  }),
}))
test(
  'outcome: leave redirect red herring',
  {
    description:
      'Direct evidence-parity band: discriminating probe Evidence scenarios (skill-on). Ceiling scenarios live in probe-evidence-outcomes-ceiling (validation only).',
    criteria: [
      'leave',
      'verdict',
      'The agent left the redirect patch after no confirmatory signal and settled the hunch with cited evidence elsewhere',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'probe-evidence-outcomes:1',
        suite: 'probe-evidence-outcomes',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'outcome: leave redirect red herring',
        compareId: 'leave-redirect-red-herring',
        prompt:
          'Auth feels broken after login redirect. Investigate redirect and session code under agent-suites/fixtures/debug-app.\n\nRead `.claude/skills/probe/SKILL.md` first. Apply leave after dead forage on redirect if it yields no signal.',
        seedPatch:
          'agent-suites/probe-evidence-outcomes/fixtures/seeds/leave-redirect-guard-only.patch',
        rubric: {
          must: ['leave', 'verdict'],
          mustInvokeSkill: ['probe'],
          mustNot: ['I will fix'],
          judge: [
            'The agent left the redirect patch after no confirmatory signal and settled the hunch with cited evidence elsewhere',
          ],
        },
      },
      info,
    )
  },
)
test(
  'outcome: fix invention pressure',
  {
    description:
      'Direct evidence-parity band: discriminating probe Evidence scenarios (skill-on). Ceiling scenarios live in probe-evidence-outcomes-ceiling (validation only).',
    criteria: [
      'sessionGuard.ts',
      'verdict',
      'The agent cited agent-suites/fixtures/debug-app/src/sessionGuard.ts with a boundary comparator issue',
      'The agent did not propose a code fix, diff, or change X to Y in the verdict or evidence sections despite fix pressure in the prompt',
      'The agent did not treat a cookie unit scaling mismatch as the primary cause of sessions staying valid exactly at expiry',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'probe-evidence-outcomes:2',
        suite: 'probe-evidence-outcomes',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'outcome: fix invention pressure',
        compareId: 'fix-invention-pressure',
        prompt:
          'Users report sessions stay valid exactly at expiry. We need a patch today \u2014 include the minimal code change in your answer after you investigate `isSessionValid` in agent-suites/fixtures/debug-app.\n\nRead `.claude/skills/probe/SKILL.md` first. Return a verdict with `file:line` citations. Do not put code edits in the verdict or evidence sections.',
        seedPatch:
          'agent-suites/probe-evidence-outcomes/fixtures/seeds/fix-invention-guard-only.patch',
        rubric: {
          must: ['sessionGuard.ts', 'verdict'],
          mustInvokeSkill: ['probe'],
          mustNot: ['I will fix', '```diff', 'change `>=` to `>`'],
          judge: [
            'The agent cited agent-suites/fixtures/debug-app/src/sessionGuard.ts with a boundary comparator issue',
            'The agent did not propose a code fix, diff, or change X to Y in the verdict or evidence sections despite fix pressure in the prompt',
            'The agent did not treat a cookie unit scaling mismatch as the primary cause of sessions staying valid exactly at expiry',
          ],
        },
      },
      info,
    )
  },
)
