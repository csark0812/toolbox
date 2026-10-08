import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'

const test = describe('interface-design', ({ agent, judge }) => ({
  coder: agent(),
  reviewer: judge({
    prompt:
      'Evaluate only the supplied claims against actual output and tool evidence. Skill availability or self-assertion does not prove use. Return passed only if every claim is supported.',
    schema: z.object({ passed: z.boolean(), reason: z.string() }),
  }),
}))

test(
  'unsettled web direction',
  {
    description: 'unsettled web direction',
    criteria: [
      'The response proposes three conceptually distinct visual boards with content, layout, type, color and fit or risk, and holds final implementation for a user direction choice. It reserves disposable first-screen renders for choices that need layout or motion proof.',
      'The response treats real dashboard content, states, accessibility and responsive proof as required before completion. It makes no unsupported claim of having rendered the design.',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'interface-design:1',
        suite: 'interface-design',
        name: 'unsettled web direction',
        defaults: { profile: 'cursor', skills: 'full' },
        prompt:
          'We are redesigning a research dashboard. The goal is to help a reader resume one saved paper and see its annotations. Direction is unsettled. Give the process and first review artifact only; do not edit files. Read `.claude/skills/interface-design/SKILL.md` and its relevant reference first.',
        evidencePolicy: 'read-only',
        rubric: {
          mustInvokeSkill: ['interface-design'],
          judge: [
            'The response proposes three conceptually distinct visual boards with content, layout, type, color and fit or risk, and holds final implementation for a user direction choice. It reserves disposable first-screen renders for choices that need layout or motion proof.',
            'The response treats real dashboard content, states, accessibility and responsive proof as required before completion. It makes no unsupported claim of having rendered the design.',
          ],
        },
      },
      info,
    )
  },
)

test(
  'existing direction',
  {
    description: 'existing direction',
    criteria: [
      'The response accepts the supplied direction without asking for three new boards or another choice. It plans concrete content, reachable states, responsive, accessibility and rendered verification.',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'interface-design:2',
        suite: 'interface-design',
        name: 'existing direction',
        defaults: { profile: 'cursor', skills: 'full' },
        prompt:
          'The user has selected a restrained editorial direction for a new web reading page. Explain the next implementation and verification steps only; do not edit files. Read `.claude/skills/interface-design/SKILL.md` first.',
        evidencePolicy: 'read-only',
        rubric: {
          mustInvokeSkill: ['interface-design'],
          judge: [
            'The response accepts the supplied direction without asking for three new boards or another choice. It plans concrete content, reachable states, responsive, accessibility and rendered verification.',
          ],
        },
      },
      info,
    )
  },
)

test(
  'native app route',
  {
    description: 'native app route',
    criteria: [
      'The response gives a native iPhone brief around the daily action, platform, assets, deliverable, and native verification. It does not claim that web screenshots prove native behavior or begin a browser page build.',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'interface-design:3',
        suite: 'interface-design',
        name: 'native app route',
        defaults: { profile: 'cursor', skills: 'full' },
        prompt:
          'An iPhone reading app needs a new daily home. Give a concept brief and next specialist/proof route only. Do not edit files. Read `.claude/skills/interface-design/SKILL.md` first.',
        evidencePolicy: 'read-only',
        rubric: {
          mustInvokeSkill: ['interface-design'],
          judge: [
            'The response gives a native iPhone brief around the daily action, platform, assets, deliverable, and native verification. It does not claim that web screenshots prove native behavior or begin a browser page build.',
          ],
        },
      },
      info,
    )
  },
)

test(
  'standalone media route',
  {
    description: 'standalone media route',
    criteria: [
      'The response treats this as standalone media, naming audience, duration, format, concept and proof or specialist needs. It does not treat UI animation or a web screen as finished video production.',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'interface-design:4',
        suite: 'interface-design',
        name: 'standalone media route',
        defaults: { profile: 'cursor', skills: 'full' },
        prompt:
          'We need a 20-second product launch video, separate from the website. Give a brief and next production/proof route only. Do not edit files. Read `.claude/skills/interface-design/SKILL.md` first.',
        evidencePolicy: 'read-only',
        rubric: {
          mustInvokeSkill: ['interface-design'],
          judge: [
            'The response treats this as standalone media, naming audience, duration, format, concept and proof or specialist needs. It does not treat UI animation or a web screen as finished video production.',
          ],
        },
      },
      info,
    )
  },
)

test(
  'code review route',
  {
    description: 'code review route',
    criteria: [
      'The response uses a review evidence approach and does not launch visual concept boards or a new interface implementation. It reports an evidence boundary if no actual diff was supplied.',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'interface-design:5',
        suite: 'interface-design',
        name: 'code review route',
        defaults: { profile: 'cursor', skills: 'full' },
        prompt:
          'Review a proposed CSS change for concrete regressions. Do not edit files. Read `.claude/skills/code-review/SKILL.md` first.',
        evidencePolicy: 'read-only',
        rubric: {
          mustInvokeSkill: ['code-review'],
          judge: [
            'The response uses a review evidence approach and does not launch visual concept boards or a new interface implementation. It reports an evidence boundary if no actual diff was supplied.',
          ],
        },
      },
      info,
    )
  },
)

test(
  'new public site route',
  {
    description: 'new public site route',
    criteria: [
      'The response treats this as a new website, proposes three distinct concept boards with hierarchy, type, color and fit or risk, and waits for user direction before product implementation. It identifies responsive and rendered proof as later gates without claiming those checks ran.',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'interface-design:6',
        suite: 'interface-design',
        name: 'new public site route',
        defaults: { profile: 'cursor', skills: 'full' },
        prompt:
          'We need a new public website for a research annotation product. Direction is unsettled. Give the first review artifact and process only; do not edit files. Read `.claude/skills/interface-design/SKILL.md` first.',
        evidencePolicy: 'read-only',
        rubric: {
          mustInvokeSkill: ['interface-design'],
          judge: [
            'The response treats this as a new website, proposes three distinct concept boards with hierarchy, type, color and fit or risk, and waits for user direction before product implementation. It identifies responsive and rendered proof as later gates without claiming those checks ran.',
          ],
        },
      },
      info,
    )
  },
)
