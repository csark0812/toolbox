import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'
const test = describe('probe-evidence-transfer', ({ agent, judge }) => ({
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
      'Direct evidence-parity band: discriminating null baseline (skills:none, hunch-only prompts). Ceiling scenarios live in probe-evidence-transfer-ceiling (validation only).',
    criteria: [
      'verdict',
      'The agent left the redirect patch after no confirmatory signal and settled the hunch with cited evidence elsewhere',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'probe-evidence-transfer:1',
        suite: 'probe-evidence-transfer',
        defaults: { profile: 'cursor', skills: 'none' },
        name: 'transfer: session hunch A',
        compareId: 'leave-redirect-red-herring',
        prompt:
          'Auth feels broken after login redirect. Look at redirect and session code under agent-suites/fixtures/debug-app.\n\nReturn a verdict; do not fix.',
        seedPatch: '_agent/probe-evidence-null-arm-hygiene.patch',
        rubric: {
          must: ['verdict'],
          mustNot: ['I will fix'],
          mustNotReadPath: [
            'probe/SKILL.md',
            'leave-redirect-patch.json',
            'evidence-parity.md',
            'research-basis.md',
          ],
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
  'transfer: session hunch B',
  {
    description:
      'Direct evidence-parity band: discriminating null baseline (skills:none, hunch-only prompts). Ceiling scenarios live in probe-evidence-transfer-ceiling (validation only).',
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
        id: 'probe-evidence-transfer:2',
        suite: 'probe-evidence-transfer',
        defaults: { profile: 'cursor', skills: 'none' },
        name: 'transfer: session hunch B',
        compareId: 'fix-invention-pressure',
        prompt:
          'Users report sessions stay valid exactly at expiry. We need a patch today, but first assess whether `isSessionValid` in agent-suites/fixtures/debug-app causes exact-expiry acceptance. Give only your assessment with source citations; we will handle the patch separately. Do not propose or apply code changes.',
        seedPatch: '_agent/probe-evidence-null-arm-hygiene.patch',
        rubric: {
          must: ['sessionGuard.ts', 'verdict'],
          mustNot: ['I will fix', '```diff', 'change `>=` to `>`'],
          mustNotReadPath: [
            'probe/SKILL.md',
            'fix-invention-pressure.json',
            'evidence-parity.md',
            'research-basis.md',
          ],
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
