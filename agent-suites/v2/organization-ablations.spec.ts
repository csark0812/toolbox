import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'
const test = describe('organization-ablations', ({ agent, judge }) => ({
  coder: agent(),
  reviewer: judge({
    prompt:
      'Evaluate only the supplied claims against the supplied evidence. Skill availability or self-assertion does not prove use. Return passed only if every claim is supported. Explain missing evidence.',
    schema: z.object({ passed: z.boolean(), reason: z.string() }),
  }),
}))
test(
  'ablation review: primary-first arm',
  {
    description:
      'Direct SkillJuror-lite ablations: compare skill organization arms under equal-budget direct runs. Default validation checks configuration only.',
    criteria: [
      'Reviewer: primary',
      'The agent completed a primary review without spawning council or Task members',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'organization-ablations:1',
        suite: 'organization-ablations',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'ablation review: primary-first arm',
        prompt:
          'Review staged changes in agent-suites/fixtures/sample-app/src/redirect.ts. Review only; do not edit or commit.\n\nRead `.claude/skills/code-review/SKILL.md` first. Default primary-first \u2014 no council unless escalation criteria match.',
        seedPatch: 'agent-suites/code-review/fixtures/seeds/redirect-staged.patch',
        seedStageOnly: true,
        rubric: {
          must: ['Reviewer: primary'],
          mustInvokeSkill: ['code-review'],
          mustNot: ['Reviewer: council', 'Task('],
          judge: ['The agent completed a primary review without spawning council or Task members'],
        },
      },
      info,
    )
  },
)
test(
  'ablation review: council escalation arm',
  {
    description:
      'Direct SkillJuror-lite ablations: compare skill organization arms under equal-budget direct runs. Default validation checks configuration only.',
    criteria: [
      'council',
      'The agent escalated to council or multi specialists as requested after primary framing',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'organization-ablations:2',
        suite: 'organization-ablations',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'ablation review: council escalation arm',
        prompt:
          'Review staged changes in agent-suites/fixtures/sample-app/src/auth.ts with security and API council escalation. Review only.\n\nRead `.claude/skills/code-review/SKILL.md` and `.claude/skills/council/SKILL.md` first. Attach council for parallel specialist perspectives.',
        seedPatch: 'agent-suites/code-review/fixtures/seeds/auth-pr.patch',
        rubric: {
          must: ['council'],
          mustInvokeSkill: ['code-review', 'council'],
          judge: [
            'The agent escalated to council or multi specialists as requested after primary framing',
          ],
        },
      },
      info,
    )
  },
)
test(
  'ablation council: fit-check skip arm',
  {
    description:
      'Direct SkillJuror-lite ablations: compare skill organization arms under equal-budget direct runs. Default validation checks configuration only.',
    criteria: [
      'single-pass',
      'skip',
      'The agent named a single-pass rival and skipped parallel spawn for this sequential repo map',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'organization-ablations:3',
        suite: 'organization-ablations',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'ablation council: fit-check skip arm',
        prompt:
          'Map how auth works in agent-suites/fixtures/sample-app. Use council if parallel helps.\n\nRead `.claude/skills/council/SKILL.md` first. Name a single-pass rival before spawning N\u22652; skip parallel when independence fails.',
        rubric: {
          must: ['single-pass', 'skip'],
          mustInvokeSkill: ['council'],
          mustNot: ['Task(', 'spawn 2'],
          judge: [
            'The agent named a single-pass rival and skipped parallel spawn for this sequential repo map',
          ],
        },
      },
      info,
    )
  },
)
