import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'
const test = describe('probe-evidence-outcomes-ceiling', ({ agent, judge }) => ({
  coder: agent(),
  reviewer: judge({
    prompt:
      'Evaluate only the supplied claims against the supplied evidence. Skill availability or self-assertion does not prove use. Return passed only if every claim is supported. Explain missing evidence.',
    schema: z.object({ passed: z.boolean(), reason: z.string() }),
  }),
}))
test(
  'outcome: founded session guard comparator',
  {
    description:
      'Ceiling band: scenarios that pass on both skills:full and skills:none in direct evidence-parity. Validation only \u2014 not run by npm run agent:test:evidence-parity.',
    criteria: [
      'sessionGuard.ts',
      'verdict',
      'The agent cited agent-suites/fixtures/debug-app/src/sessionGuard.ts with a boundary comparator issue',
      'The agent did not propose a code fix, diff, or change X to Y in the verdict or evidence sections',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'probe-evidence-outcomes-ceiling:1',
        suite: 'probe-evidence-outcomes-ceiling',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'outcome: founded session guard comparator',
        compareId: 'founded-session-guard',
        prompt:
          'Users report sessions stay valid exactly at expiry. Investigate whether `isSessionValid` in agent-suites/fixtures/debug-app is wrong.\n\nRead `.claude/skills/probe/SKILL.md` first. Use ranked falsifiable hypotheses and kill tests before confirmatory reading. Return a verdict with `file:line` citations. Do not implement a fix.',
        rubric: {
          must: ['sessionGuard.ts', 'verdict'],
          mustInvokeSkill: ['probe'],
          mustNot: ['I will fix', 'root cause is definitely'],
          judge: [
            'The agent cited agent-suites/fixtures/debug-app/src/sessionGuard.ts with a boundary comparator issue',
            'The agent did not propose a code fix, diff, or change X to Y in the verdict or evidence sections',
          ],
        },
      },
      info,
    )
  },
)
test(
  'outcome: unfounded redirect clears session',
  {
    description:
      'Ceiling band: scenarios that pass on both skills:full and skills:none in direct evidence-parity. Validation only \u2014 not run by npm run agent:test:evidence-parity.',
    criteria: [
      'verdict',
      'The agent concluded the redirect-clearing hunch is unfounded or not supported by primary code evidence',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'probe-evidence-outcomes-ceiling:2',
        suite: 'probe-evidence-outcomes-ceiling',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'outcome: unfounded redirect clears session',
        compareId: 'unfounded-redirect-clears-session',
        prompt:
          'Login redirect must be clearing the session cookie \u2014 investigate redirectAfterLogin in agent-suites/fixtures/debug-app.\n\nRead `.claude/skills/probe/SKILL.md` first. Return a verdict; do not fix.',
        rubric: {
          must: ['verdict'],
          mustInvokeSkill: ['probe'],
          mustNot: ['root cause is definitely', 'I will fix'],
          judge: [
            'The agent concluded the redirect-clearing hunch is unfounded or not supported by primary code evidence',
          ],
        },
      },
      info,
    )
  },
)
test(
  'outcome: multi-mechanism verdict',
  {
    description:
      'Ceiling band: scenarios that pass on both skills:full and skills:none in direct evidence-parity. Validation only \u2014 not run by npm run agent:test:evidence-parity.',
    criteria: [
      'verdict',
      'The agent separated what evidence settles from what stays open, without collapsing unrelated mechanisms into one story',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'probe-evidence-outcomes-ceiling:3',
        suite: 'probe-evidence-outcomes-ceiling',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'outcome: multi-mechanism verdict',
        compareId: 'multi-mechanism-verdict',
        prompt:
          'Session expiry bugs might be the guard comparator OR callers passing the wrong clock. Investigate agent-suites/fixtures/debug-app.\n\nRead `.claude/skills/probe/SKILL.md` first. Report separate mechanisms if evidence supports more than one; do not force a single narrative.',
        rubric: {
          must: ['verdict'],
          mustInvokeSkill: ['probe'],
          mustNot: ['I will fix'],
          judge: [
            'The agent separated what evidence settles from what stays open, without collapsing unrelated mechanisms into one story',
          ],
        },
      },
      info,
    )
  },
)
test(
  'outcome: multi-file expiry scale',
  {
    description:
      'Ceiling band: scenarios that pass on both skills:full and skills:none in direct evidence-parity. Validation only \u2014 not run by npm run agent:test:evidence-parity.',
    criteria: [
      'sessionCookie.ts',
      'verdict',
      'The agent cited sessionCookie.ts (or the cookie validation path) with a unit or scaling mismatch before or alongside any guard finding',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'probe-evidence-outcomes-ceiling:4',
        suite: 'probe-evidence-outcomes-ceiling',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'outcome: multi-file expiry scale',
        compareId: 'multi-file-expiry-scale',
        prompt:
          'After login, sessions expire almost immediately even though the cookie timestamp looks valid. Investigate session handling under agent-suites/fixtures/debug-app \u2014 the bug might not be in `sessionGuard.ts` alone.\n\nRead `.claude/skills/probe/SKILL.md` first. Trace across files. Return a verdict with `file:line` citations. Do not implement a fix.',
        rubric: {
          must: ['sessionCookie.ts', 'verdict'],
          mustInvokeSkill: ['probe'],
          mustNot: ['I will fix'],
          judge: [
            'The agent cited sessionCookie.ts (or the cookie validation path) with a unit or scaling mismatch before or alongside any guard finding',
          ],
        },
      },
      info,
    )
  },
)
test(
  'outcome: wrong narrative redirect kill',
  {
    description:
      'Ceiling band: scenarios that pass on both skills:full and skills:none in direct evidence-parity. Validation only \u2014 not run by npm run agent:test:evidence-parity.',
    criteria: [
      'verdict',
      'The agent killed or rejected the redirect-clears-cookie narrative with primary code evidence and cited where the actual issue lies or that redirect has no session mutation',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'probe-evidence-outcomes-ceiling:5',
        suite: 'probe-evidence-outcomes-ceiling',
        defaults: { profile: 'cursor', skills: 'full' },
        name: 'outcome: wrong narrative redirect kill',
        compareId: 'wrong-narrative-redirect-kill',
        prompt:
          'Our PM insists login redirect clears the session cookie \u2014 that is the only plausible cause. Investigate redirect and session code under agent-suites/fixtures/debug-app.\n\nRead `.claude/skills/probe/SKILL.md` first. Run discriminating checks before accepting the redirect narrative. Return a verdict; do not fix.',
        rubric: {
          must: ['verdict'],
          mustInvokeSkill: ['probe'],
          mustNot: ['root cause is definitely redirect', 'I will fix'],
          judge: [
            'The agent killed or rejected the redirect-clears-cookie narrative with primary code evidence and cited where the actual issue lies or that redirect has no session mutation',
          ],
        },
      },
      info,
    )
  },
)
