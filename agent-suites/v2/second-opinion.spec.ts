import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'
const test = describe('second-opinion', ({ agent, judge }) => ({
  coder: agent(),
  reviewer: judge({
    prompt:
      'Evaluate only the supplied claims against the supplied evidence. Skill availability or self-assertion does not prove use. Return passed only if every claim is supported. Explain missing evidence.',
    schema: z.object({ passed: z.boolean(), reason: z.string() }),
  }),
}))
test(
  'council: anchor kills tag drift',
  {
    description:
      'Portable second-opinion conformance: invent lenses, single-pass default, claim anchoring, paste artifact entry; council layered for multi-perspective depth',
    criteria: [
      'drift',
      'anchor',
      'Mode:',
      'council',
      'The agent invoked council and second-opinion, anchored kills to plan sections, and tagged unanchored critique as drift not convergent',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'second-opinion:1',
        suite: 'second-opinion',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'council: anchor kills tag drift',
        prompt:
          'Second opinion on our auth rollout plan at docs/plans/auth.plan.md.\n\nRead `.claude/skills/second-opinion/SKILL.md` and `.claude/skills/council/SKILL.md` first. Attach both skills. Council creates task personas and selects the interaction; anchor kills to plan sections; tag unanchored claims as drift.',
        rubric: {
          must: ['drift', 'anchor', 'Mode:', 'council'],
          mustInvokeSkill: ['second-opinion', 'council'],
          mustNot: ['manufacture criticism'],
          judge: [
            'The agent invoked council and second-opinion, anchored kills to plan sections, and tagged unanchored critique as drift not convergent',
          ],
        },
      },
      info,
    )
  },
)
test(
  'single-pass: completeness from wording',
  {
    description:
      'Portable second-opinion conformance: invent lenses, single-pass default, claim anchoring, paste artifact entry; council layered for multi-perspective depth',
    criteria: [
      'completeness',
      'Mode:',
      'single-pass',
      'The agent invoked second-opinion alone with a completeness-ish lens (coordinator-only, no council spawn)',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'second-opinion:2',
        suite: 'second-opinion',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'single-pass: completeness from wording',
        prompt:
          'Quick second opinion \u2014 did I miss anything in this fleeting draft?\n\n## Draft: session cookie flags\n\nUse httpOnly + Secure cookies for the new auth service. Ship Friday.\n\nRead `.claude/skills/second-opinion/SKILL.md` and `second-opinion/references/plan-review.md` first. Infer a completeness-ish lens; coordinator-only, no council, no Task spawn.',
        rubric: {
          must: ['completeness', 'Mode:', 'single-pass'],
          mustInvokeSkill: ['second-opinion'],
          mustNot: ['Mode: council', 'Wave 2 defender', 'stance=premises'],
          judge: [
            'The agent invoked second-opinion alone with a completeness-ish lens (coordinator-only, no council spawn)',
          ],
        },
      },
      info,
    )
  },
)
test(
  'entry: chat paste without path',
  {
    description:
      'Portable second-opinion conformance: invent lenses, single-pass default, claim anchoring, paste artifact entry; council layered for multi-perspective depth',
    criteria: [
      'Artifact:',
      'rate-limit',
      'single-pass',
      'premises',
      'The agent accepted the in-thread paste as the artifact without demanding a disk path or redirecting to grill',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'second-opinion:3',
        suite: 'second-opinion',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'entry: chat paste without path',
        prompt:
          'Second opinion on this paste (no file path):\n\n## Ephemeral plan: rate-limit login\n\nAdd a 5/min IP bucket in middleware before password check. No Redis \u2014 in-process map is fine for v1.\n\nRead `.claude/skills/second-opinion/SKILL.md` first. Accept the paste as the artifact; run single-pass with a premises lens.',
        rubric: {
          must: ['Artifact:', 'rate-limit', 'single-pass', 'premises'],
          mustInvokeSkill: ['second-opinion'],
          mustNot: [
            'point to grill',
            'ask for a path',
            'provide a file path',
            'Without artifact path',
          ],
          judge: [
            'The agent accepted the in-thread paste as the artifact without demanding a disk path or redirecting to grill',
          ],
        },
      },
      info,
    )
  },
)
test(
  'council: focus group invents design lenses',
  {
    description:
      'Portable second-opinion conformance: invent lenses, single-pass default, claim anchoring, paste artifact entry; council layered for multi-perspective depth',
    criteria: [
      'Mode:',
      'council',
      'The agent layered council with second-opinion and created design task personas (e.g. brand-fit, craft, job-fit) without defaulting to completeness or premises',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'second-opinion:4',
        suite: 'second-opinion',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'council: focus group invents design lenses',
        prompt:
          'Focus group second opinion on this visual alignment plan at docs/plans/align-app-marketing.plan.md.\n\nRead `.claude/skills/second-opinion/SKILL.md` and `.claude/skills/council/SKILL.md` first. Attach both. Create design task personas from the ask and use an independent panel, not default plan-readiness roles.',
        rubric: {
          must: ['Mode:', 'council'],
          mustInvokeSkill: ['second-opinion', 'council'],
          mustNot: ['completeness', 'Mode: single-pass', 'stance=premises', 'lens=premises'],
          judge: [
            'The agent layered council with second-opinion and created design task personas (e.g. brand-fit, craft, job-fit) without defaulting to completeness or premises',
          ],
        },
      },
      info,
    )
  },
)
