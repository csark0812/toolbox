import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'
const test = describe('council', ({ agent, judge }) => ({
  coder: agent(),
  reviewer: judge({
    prompt:
      'Evaluate only the supplied claims against the supplied evidence. Skill availability or self-assertion does not prove use. Return passed only if every claim is supported. Explain missing evidence.',
    schema: z.object({ passed: z.boolean(), reason: z.string() }),
  }),
}))
test(
  'independent panel: persona preview and safe proof',
  {
    description:
      'Portable council conformance: task personas, useful interaction choice, independent first views, real members, and single-pass fit',
    criteria: [
      'Council preview',
      'Independent panel',
      'Question',
      'Evidence',
      'Falsifier',
      'Boundary',
      'safe proof',
      'real member',
      'The agent created distinct task personas, previewed the format, kept first views independent, ran real members, and used a safe read to settle one conflict',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'council:1',
        suite: 'council',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'independent panel: persona preview and safe proof',
        prompt:
          'Use council on the plan at docs/plans/auth.plan.md for a multi-perspective readiness review. Create task personas, show the plain-English preview, run independent first views, and settle a narrow conflict with a safe read when possible.',
        rubric: {
          must: [
            'Council preview',
            'Independent panel',
            'Question',
            'Evidence',
            'Falsifier',
            'Boundary',
            'safe proof',
            'real member',
          ],
          mustInvokeSkill: ['council'],
          mustNot: [
            'optimist',
            'pessimist',
            'senior-engineer',
            'busy-user',
            'model=',
            'token budget',
          ],
          judge: [
            'The agent created distinct task personas, previewed the format, kept first views independent, ran real members, and used a safe read to settle one conflict',
          ],
        },
      },
      info,
    )
  },
)
test(
  'structured challenge: independent attack and defense',
  {
    description:
      'Portable council conformance: task personas, useful interaction choice, independent first views, real members, and single-pass fit',
    criteria: [
      'Structured challenge',
      'proposal-risk',
      'recovery-defense',
      'independent',
      'focused follow-up',
      'The agent selected structured challenge, gave attacker and defender distinct evidence and falsifiers, and kept their first views independent',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'council:2',
        suite: 'council',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'structured challenge: independent attack and defense',
        prompt:
          'Use council to stress-test the rollout proposal at docs/plans/auth.plan.md. Choose the interaction pattern that fits one proposal with meaningful attack and defense.',
        rubric: {
          must: [
            'Structured challenge',
            'proposal-risk',
            'recovery-defense',
            'independent',
            'focused follow-up',
          ],
          mustInvokeSkill: ['council'],
          mustNot: ['vote', 'model=', 'token'],
          judge: [
            'The agent selected structured challenge, gave attacker and defender distinct evidence and falsifiers, and kept their first views independent',
          ],
        },
      },
      info,
    )
  },
)
test(
  'competing proposals: compare complete alternatives',
  {
    description:
      'Portable council conformance: task personas, useful interaction choice, independent first views, real members, and single-pass fit',
    criteria: [
      'Competing proposals',
      'shared criteria',
      'database-case',
      'redis-case',
      'material disagreement',
      'The agent selected competing proposals and compared complete alternatives against shared criteria without reducing the result to a vote',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'council:3',
        suite: 'council',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'competing proposals: compare complete alternatives',
        prompt:
          'Use council to compare two complete session-storage proposals against the same reliability and maintenance criteria.',
        rubric: {
          must: [
            'Competing proposals',
            'shared criteria',
            'database-case',
            'redis-case',
            'material disagreement',
          ],
          mustInvokeSkill: ['council'],
          mustNot: ['select the winner by vote', 'model='],
          judge: [
            'The agent selected competing proposals and compared complete alternatives against shared criteria without reducing the result to a vote',
          ],
        },
      },
      info,
    )
  },
)
test(
  'nominal ideation: generate before evaluation',
  {
    description:
      'Portable council conformance: task personas, useful interaction choice, independent first views, real members, and single-pass fit',
    criteria: [
      'Nominal ideation',
      'generate independently',
      'cluster',
      'evaluate',
      'distinct evidence',
      'The agent selected nominal ideation, preserved independent option generation, and delayed clustering and evaluation until synthesis',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'council:4',
        suite: 'council',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'nominal ideation: generate before evaluation',
        prompt:
          'Use council to generate and prioritize ways to reduce onboarding abandonment without early group influence.',
        rubric: {
          must: [
            'Nominal ideation',
            'generate independently',
            'cluster',
            'evaluate',
            'distinct evidence',
          ],
          mustInvokeSkill: ['council'],
          mustNot: ['brainstorm together first', 'model='],
          judge: [
            'The agent selected nominal ideation, preserved independent option generation, and delayed clustering and evaluation until synthesis',
          ],
        },
      },
      info,
    )
  },
)
test(
  'delphi revision: controlled estimate update',
  {
    description:
      'Portable council conformance: task personas, useful interaction choice, independent first views, real members, and single-pass fit',
    criteria: [
      'Delphi revision',
      'independent estimates',
      'neutral summary',
      'one revision',
      'range',
      'dissent',
      'The agent selected Delphi revision, used controlled feedback, and kept the final estimate range and dissent visible',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'council:5',
        suite: 'council',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'delphi revision: controlled estimate update',
        prompt:
          'Use council to estimate a migration timeline under uncertain operational constraints and preserve meaningful dissent.',
        rubric: {
          must: [
            'Delphi revision',
            'independent estimates',
            'neutral summary',
            'one revision',
            'range',
            'dissent',
          ],
          mustInvokeSkill: ['council'],
          mustNot: ['hide dissent', 'model='],
          judge: [
            'The agent selected Delphi revision, used controlled feedback, and kept the final estimate range and dissent visible',
          ],
        },
      },
      info,
    )
  },
)
test(
  'socratic seminar: clarify premises',
  {
    description:
      'Portable council conformance: task personas, useful interaction choice, independent first views, real members, and single-pass fit',
    criteria: [
      'Socratic seminar',
      'evidence-led questions',
      'clarified premises',
      'unresolved question',
      "The agent selected Socratic seminar and used task personas to clarify assumptions without pretending that the council owns the user's decision",
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'council:6',
        suite: 'council',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'socratic seminar: clarify premises',
        prompt:
          'Use council to clarify what ready to launch means in a draft that mixes reliability, usability, and support assumptions.',
        rubric: {
          must: [
            'Socratic seminar',
            'evidence-led questions',
            'clarified premises',
            'unresolved question',
          ],
          mustInvokeSkill: ['council'],
          mustNot: ['majority vote', 'model='],
          judge: [
            "The agent selected Socratic seminar and used task personas to clarify assumptions without pretending that the council owns the user's decision",
          ],
        },
      },
      info,
    )
  },
)
test(
  'fit check: use one pass',
  {
    description:
      'Portable council conformance: task personas, useful interaction choice, independent first views, real members, and single-pass fit',
    criteria: [
      'fewer than two',
      'single pass',
      'The agent applied the persona fit test and used one coordinator pass when only one useful question remained',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'council:7',
        suite: 'council',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'fit check: use one pass',
        prompt:
          'Map how auth works in agent-suites/fixtures/sample-app. Use council only if two distinct task personas can change the answer.',
        rubric: {
          must: ['fewer than two', 'single pass'],
          mustInvokeSkill: ['council'],
          mustNot: ['real member', 'Council preview', 'model='],
          judge: [
            'The agent applied the persona fit test and used one coordinator pass when only one useful question remained',
          ],
        },
      },
      info,
    )
  },
)
