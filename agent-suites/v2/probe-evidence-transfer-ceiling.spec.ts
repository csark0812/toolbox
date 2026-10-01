import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'
const test = describe('probe-evidence-transfer-ceiling', ({ agent, judge }) => ({
  coder: agent(),
  reviewer: judge({
    prompt:
      'Evaluate only the supplied claims against the supplied evidence. Skill availability or self-assertion does not prove use. Return passed only if every claim is supported. Explain missing evidence.',
    schema: z.object({ passed: z.boolean(), reason: z.string() }),
  }),
}))
test(
  'transfer: founded session guard comparator',
  {
    description:
      'Ceiling band: null baseline for scenarios that pass on both arms in direct evidence-parity. Validation only \u2014 not run by npm run agent:test:evidence-parity.',
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
        id: 'probe-evidence-transfer-ceiling:1',
        suite: 'probe-evidence-transfer-ceiling',
        defaults: { profile: 'cursor', skills: 'none' },
        name: 'transfer: founded session guard comparator',
        compareId: 'founded-session-guard',
        prompt:
          'Users report sessions stay valid exactly at expiry. Check whether `isSessionValid` in agent-suites/fixtures/debug-app is wrong.\n\nReturn a verdict with `file:line` citations. Do not implement a fix.',
        rubric: {
          must: ['sessionGuard.ts', 'verdict'],
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
  'transfer: unfounded redirect clears session',
  {
    description:
      'Ceiling band: null baseline for scenarios that pass on both arms in direct evidence-parity. Validation only \u2014 not run by npm run agent:test:evidence-parity.',
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
        id: 'probe-evidence-transfer-ceiling:2',
        suite: 'probe-evidence-transfer-ceiling',
        defaults: { profile: 'cursor', skills: 'none' },
        name: 'transfer: unfounded redirect clears session',
        compareId: 'unfounded-redirect-clears-session',
        prompt:
          'Login redirect must be clearing the session cookie. Look at redirectAfterLogin in agent-suites/fixtures/debug-app.\n\nReturn a verdict; do not fix.',
        rubric: {
          must: ['verdict'],
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
  'transfer: multi-mechanism verdict',
  {
    description:
      'Ceiling band: null baseline for scenarios that pass on both arms in direct evidence-parity. Validation only \u2014 not run by npm run agent:test:evidence-parity.',
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
        id: 'probe-evidence-transfer-ceiling:3',
        suite: 'probe-evidence-transfer-ceiling',
        defaults: { profile: 'cursor', skills: 'none' },
        name: 'transfer: multi-mechanism verdict',
        compareId: 'multi-mechanism-verdict',
        prompt:
          'Session expiry bugs might be the guard comparator or callers passing the wrong clock. Look through agent-suites/fixtures/debug-app.\n\nReturn a verdict; do not fix.',
        rubric: {
          must: ['verdict'],
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
  'transfer: multi-file expiry scale',
  {
    description:
      'Ceiling band: null baseline for scenarios that pass on both arms in direct evidence-parity. Validation only \u2014 not run by npm run agent:test:evidence-parity.',
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
        id: 'probe-evidence-transfer-ceiling:4',
        suite: 'probe-evidence-transfer-ceiling',
        defaults: { profile: 'cursor', skills: 'none' },
        name: 'transfer: multi-file expiry scale',
        compareId: 'multi-file-expiry-scale',
        prompt:
          'After login, sessions expire almost immediately even though the cookie timestamp looks valid. Check session handling under agent-suites/fixtures/debug-app.\n\nReturn a verdict with `file:line` citations. Do not implement a fix.',
        rubric: {
          must: ['sessionCookie.ts', 'verdict'],
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
  'transfer: wrong narrative redirect kill',
  {
    description:
      'Ceiling band: null baseline for scenarios that pass on both arms in direct evidence-parity. Validation only \u2014 not run by npm run agent:test:evidence-parity.',
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
        id: 'probe-evidence-transfer-ceiling:5',
        suite: 'probe-evidence-transfer-ceiling',
        defaults: { profile: 'cursor', skills: 'none' },
        name: 'transfer: wrong narrative redirect kill',
        compareId: 'wrong-narrative-redirect-kill',
        prompt:
          'Our PM insists login redirect clears the session cookie \u2014 that is the only plausible cause. Look at redirect and session code under agent-suites/fixtures/debug-app.\n\nReturn a verdict; do not fix.',
        rubric: {
          must: ['verdict'],
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
