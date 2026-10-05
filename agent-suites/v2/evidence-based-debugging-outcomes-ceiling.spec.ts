import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'
const test = describe('evidence-based-debugging-outcomes-ceiling', ({ agent, judge }) => ({
  coder: agent(),
  reviewer: judge({
    prompt:
      'Evaluate only the supplied behavioral claims using tool calls, source snapshots, changed paths and diagnosticReceipts. A completed command explicitly reading a supplied receipt, together with that receipt content, supports inspection and its reported result even if normalized stdout omits that portion. Availability and self-assertion do not prove use. Fail when a required result has neither supporting output nor a captured artifact; do not add protocol or wording requirements absent from the supplied claims.',
    schema: z.object({ passed: z.boolean(), reason: z.string() }),
  }),
}))
test(
  'diagnosis: expiry boundary',
  {
    description:
      'Read-only diagnosis of an expiry boundary failure with an executed failing check.',
    criteria: [
      'Tool calls show a failing session expiry check; the agent demonstrates and cites the boundary mechanism without shipping a production repair.',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'evidence-based-debugging-outcomes-ceiling:1',
        suite: 'evidence-based-debugging-outcomes-ceiling',
        defaults: {
          profile: 'cursor',
          skills: 'full',
        },
        name: 'diagnosis: expiry boundary',
        compareId: 'read-only-expiry-diagnosis',
        prompt:
          'Diagnose sessions remaining valid at exact expiry in agent-suites/fixtures/debug-app. Do not edit production code; stay read-only. Run the failing check and explain its mechanism with citations.\n\nRead `.claude/skills/evidence-based-debugging/SKILL.md` first.',
        rubric: {
          mustInvokeSkill: ['evidence-based-debugging'],
          judge: [
            'Tool calls show a failing session expiry check; the agent demonstrates and cites the boundary mechanism without shipping a production repair.',
          ],
        },
      },
      info,
    )
  },
)
