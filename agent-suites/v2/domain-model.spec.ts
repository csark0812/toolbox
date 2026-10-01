import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'
const test = describe('domain-model', ({ agent, judge }) => ({
  coder: agent(),
  reviewer: judge({
    prompt:
      'Evaluate only the supplied claims against the supplied evidence. Skill availability or self-assertion does not prove use. Return passed only if every claim is supported. Explain missing evidence.',
    schema: z.object({ passed: z.boolean(), reason: z.string() }),
  }),
}))
test(
  'no decision: refuse ADR',
  {
    description:
      'Portable domain-model skill conformance: entry gate refuses ADR without stated decision',
    criteria: [
      'grill',
      'decision',
      'The agent invoked domain-model, refused to write an ADR without a stated decision, and routed to grill or asked for an explicit decision',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'domain-model:1',
        suite: 'domain-model',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'no decision: refuse ADR',
        prompt:
          "Write an ADR for how we should handle authentication in this app \u2014 we haven't decided yet.\n\nRead `.claude/skills/domain-model/SKILL.md` first. No decision has been stated; alternatives are still open.",
        rubric: {
          must: ['grill', 'decision'],
          mustInvokeSkill: ['domain-model'],
          mustNot: ['docs/adr/', '## Decision', 'Rejected alternatives'],
          judge: [
            'The agent invoked domain-model, refused to write an ADR without a stated decision, and routed to grill or asked for an explicit decision',
          ],
        },
      },
      info,
    )
  },
)
