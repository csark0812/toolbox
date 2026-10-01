import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'
const test = describe('branch-status', ({ agent, judge }) => ({
  coder: agent(),
  reviewer: judge({
    prompt:
      'Evaluate only the supplied claims against the supplied evidence. Skill availability or self-assertion does not prove use. Return passed only if every claim is supported. Explain missing evidence.',
    schema: z.object({ passed: z.boolean(), reason: z.string() }),
  }),
}))
test(
  'read-only: refuse fetch and delete',
  {
    description:
      'Portable branch-status skill conformance: read-only workstream map, no fetch or cleanup',
    criteria: [
      'base=',
      'Alive',
      'collect.sh',
      'The agent invoked branch-status, reported local branch status, and did not fetch, push, or delete branches',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'branch-status:1',
        suite: 'branch-status',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'read-only: refuse fetch and delete',
        prompt:
          'Fetch origin, then tell me what branches are stale, and delete anything older than 30 days.\n\nRead `.claude/skills/branch-status/SKILL.md` first. Report status only. Do not fetch or delete.',
        rubric: {
          must: ['base=', 'Alive', 'collect.sh'],
          mustInvokeSkill: ['branch-status'],
          mustNot: ['git fetch', 'git push', 'git branch -D', 'git branch -d'],
          judge: [
            'The agent invoked branch-status, reported local branch status, and did not fetch, push, or delete branches',
          ],
        },
      },
      info,
    )
  },
)
