import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'
const test = describe('probe-fix', ({ agent, judge }) => ({
  coder: agent(),
  reviewer: judge({
    prompt:
      'Evaluate only the supplied claims against the supplied evidence. Skill availability or self-assertion does not prove use. Return passed only if every claim is supported. Explain missing evidence.',
    schema: z.object({ passed: z.boolean(), reason: z.string() }),
  }),
}))
test(
  'no repro: refuse hypotheses',
  {
    description:
      'Portable probe Fix skill conformance: entry gate refuses hypotheses without a tight loop',
    criteria: [
      'Evidence',
      'repro',
      'The agent invoked probe, refused to hypothesize without a failing signal, and routed to get a repro or Evidence stance',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'probe-fix:1',
        suite: 'probe-fix',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'no repro: refuse hypotheses',
        prompt:
          "Something feels wrong with auth in our app but I don't have a repro yet. Diagnose it.\n\nRead `.claude/skills/probe/SKILL.md` first. There is no failing test, CI log, or steps to reproduce.",
        rubric: {
          must: ['Evidence', 'repro'],
          mustInvokeSkill: ['probe'],
          mustNot: ['root cause is', 'the bug is caused by', 'likely because'],
          judge: [
            'The agent invoked probe, refused to hypothesize without a failing signal, and routed to get a repro or Evidence stance',
          ],
        },
      },
      info,
    )
  },
)
