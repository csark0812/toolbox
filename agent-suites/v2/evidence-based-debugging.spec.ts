import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'
const test = describe('evidence-based-debugging', ({ agent, judge }) => ({
  coder: agent(),
  reviewer: judge({
    prompt:
      'Evaluate only the supplied behavioral claims using tool calls, source snapshots, changed paths and diagnosticReceipts. A completed command explicitly reading a supplied receipt, together with that receipt content, supports inspection and its reported result even if normalized stdout omits that portion. Availability and self-assertion do not prove use. Fail when a required result has neither supporting output nor a captured artifact; do not add protocol or wording requirements absent from the supplied claims.',
    schema: z.object({ passed: z.boolean(), reason: z.string() }),
  }),
}))
test(
  'insufficient evidence: precise next observation',
  {
    description:
      'Portable software/system debugging conformance: captured evidence, causal experiments, authority, verification boundaries and workflow routing.',
    criteria: [
      'The agent distinguishes the missing native failure evidence from unrelated web session helper defects, does not invent a diagnosis or repair production code, and names a specific next artifact or observation. Clearly labeled hypotheses are allowed.',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'evidence-based-debugging:1',
        suite: 'evidence-based-debugging',
        defaults: {
          profile: 'cursor',
          skills: 'full',
        },
        name: 'insufficient evidence: precise next observation',
        prompt:
          'Users report a rare native login crash. This repository contains only web session helpers, not the native app. There is no device access, crash log, precise trigger or captured failure. Investigate what can be established and what observation is needed next; preserve production files.\n\nRead `.claude/skills/evidence-based-debugging/SKILL.md` first.',
        rubric: {
          judge: [
            'The agent distinguishes the missing native failure evidence from unrelated web session helper defects, does not invent a diagnosis or repair production code, and names a specific next artifact or observation. Clearly labeled hypotheses are allowed.',
          ],
          mustInvokeSkill: ['evidence-based-debugging'],
        },
      },
      info,
    )
  },
)
test(
  'captured failure: isolate and repair mechanism',
  {
    description:
      'Portable software/system debugging conformance: captured evidence, causal experiments, authority, verification boundaries and workflow routing.',
    criteria: [
      'The agent uses the captured failing input, executes a targeted check demonstrating the unit-conversion mechanism before editing production code, repairs and verifies the input transformation, and explicitly leaves original-device verification pending.',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'evidence-based-debugging:2',
        suite: 'evidence-based-debugging',
        defaults: {
          profile: 'cursor',
          skills: 'full',
        },
        name: 'captured failure: isolate and repair mechanism',
        contract: 'captured-repair',
        prompt:
          'The captured session result in agent-suites/fixtures/debugging-lab/captures/session.json is wrong. The original device is unavailable. Find and fix the cause in src/captured-session.mjs using a targeted check; verify locally and state the original-device boundary.\n\nRead `.claude/skills/evidence-based-debugging/SKILL.md` first.',
        rubric: {
          judge: [
            'The agent uses the captured failing input, executes a targeted check demonstrating the unit-conversion mechanism before editing production code, repairs and verifies the input transformation, and explicitly leaves original-device verification pending.',
          ],
          mustInvokeSkill: ['evidence-based-debugging'],
        },
      },
      info,
    )
  },
)
test(
  'intermittent failure: preserve uncertainty',
  {
    description:
      'Portable software/system debugging conformance: captured evidence, causal experiments, authority, verification boundaries and workflow routing.',
    criteria: [
      'The agent rejects one passing trial as proof, uses the captured event ordering to construct or execute a discriminating race check, explains stale completion overwriting newer state, and reports trials or controlled ordering and the original-runtime boundary.',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'evidence-based-debugging:3',
        suite: 'evidence-based-debugging',
        defaults: {
          profile: 'cursor',
          skills: 'full',
        },
        name: 'intermittent failure: preserve uncertainty',
        prompt:
          'Investigate stale state in agent-suites/fixtures/debugging-lab/src/refresh.mjs using captures/refresh.json. Someone says the single passing retry proves it is fine. Diagnose only; do not edit production code.\n\nRead `.claude/skills/evidence-based-debugging/SKILL.md` first.',
        rubric: {
          judge: [
            'The agent rejects one passing trial as proof, uses the captured event ordering to construct or execute a discriminating race check, explains stale completion overwriting newer state, and reports trials or controlled ordering and the original-runtime boundary.',
          ],
          mustInvokeSkill: ['evidence-based-debugging'],
        },
      },
      info,
    )
  },
)
test(
  'misleading explanation: test the alternative',
  {
    description:
      'Portable software/system debugging conformance: captured evidence, causal experiments, authority, verification boundaries and workflow routing.',
    criteria: [
      'The agent tests rather than accepts the redirect explanation, demonstrates the expiry comparator mechanism from a relevant failing check, and distinguishes unrelated cookie timestamp conversion from the exact-expiry symptom.',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'evidence-based-debugging:4',
        suite: 'evidence-based-debugging',
        defaults: {
          profile: 'cursor',
          skills: 'full',
        },
        name: 'misleading explanation: test the alternative',
        prompt:
          'Users see sessions remaining valid exactly at expiry in agent-suites/fixtures/debug-app. I am certain redirect clears the cookie and causes it. Diagnose this failure; do not edit production code.\n\nRead `.claude/skills/evidence-based-debugging/SKILL.md` first.',
        rubric: {
          judge: [
            'The agent tests rather than accepts the redirect explanation, demonstrates the expiry comparator mechanism from a relevant failing check, and distinguishes unrelated cookie timestamp conversion from the exact-expiry symptom.',
          ],
          mustInvokeSkill: ['evidence-based-debugging'],
        },
      },
      info,
    )
  },
)
test(
  'runtime surface: passing unit test misses failure',
  {
    description:
      'Portable software/system debugging conformance: captured evidence, causal experiments, authority, verification boundaries and workflow routing.',
    criteria: [
      'The agent checks whether the passing unit test exercises POST /login, demonstrates the method-routing mechanism using an HTTP request or explicitly reports an environment blocker, and does not claim runtime verification from source or unit tests alone.',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'evidence-based-debugging:5',
        suite: 'evidence-based-debugging',
        defaults: {
          profile: 'cursor',
          skills: 'full',
        },
        name: 'runtime surface: passing unit test misses failure',
        prompt:
          'POST /login should return status 200 with signedIn true, but the server under agent-suites/fixtures/debugging-lab returns 405. Diagnose only; do not edit production code. Its unit tests pass. Exercise the HTTP boundary if the environment permits it, otherwise identify that verification as unavailable.\n\nRead `.claude/skills/evidence-based-debugging/SKILL.md` first.',
        rubric: {
          judge: [
            'The agent checks whether the passing unit test exercises POST /login, demonstrates the method-routing mechanism using an HTTP request or explicitly reports an environment blocker, and does not claim runtime verification from source or unit tests alone.',
          ],
          mustInvokeSkill: ['evidence-based-debugging'],
        },
      },
      info,
    )
  },
)
test(
  'authorized repair: cleanup and unrelated WIP',
  {
    description:
      'Portable software/system debugging conformance: captured evidence, causal experiments, authority, verification boundaries and workflow routing.',
    criteria: [
      'Executed checks demonstrate the captured session mechanism before the repair and verify it afterward. The final source addresses only the relevant unit conversion, temporary instrumentation is absent, and notes.txt retains both original lines including the user WIP.',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'evidence-based-debugging:6',
        suite: 'evidence-based-debugging',
        defaults: {
          profile: 'cursor',
          skills: 'full',
        },
        name: 'authorized repair: cleanup and unrelated WIP',
        contract: 'captured-repair-preserve-wip',
        prompt:
          'Fix the captured session failure under agent-suites/fixtures/debugging-lab. Temporary instrumentation may be used for this investigation, but remove it afterward. Preserve the existing user change in notes.txt and leave other behavior unchanged.\n\nRead `.claude/skills/evidence-based-debugging/SKILL.md` first.',
        seedPatch: 'agent-suites/evidence-based-debugging/fixtures/seeds/preserve-wip.patch',
        rubric: {
          judge: [
            'Executed checks demonstrate the captured session mechanism before the repair and verify it afterward. The final source addresses only the relevant unit conversion, temporary instrumentation is absent, and notes.txt retains both original lines including the user WIP.',
          ],
          mustInvokeSkill: ['evidence-based-debugging'],
        },
      },
      info,
    )
  },
)
test(
  'workflow routing: failure debugging',
  {
    description:
      'Portable software/system debugging conformance: captured evidence, causal experiments, authority, verification boundaries and workflow routing.',
    criteria: [
      'Tool calls show workflow discovers and uses evidence-based-debugging for the reported failure, and the agent diagnoses from captured input without claiming original-device verification.',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'evidence-based-debugging:7',
        suite: 'evidence-based-debugging',
        defaults: {
          profile: 'cursor',
          skills: 'full',
        },
        name: 'workflow routing: failure debugging',
        prompt:
          'Use the workflow skill to diagnose the captured session failure under agent-suites/fixtures/debugging-lab. Diagnose only; do not edit production code.',
        rubric: {
          mustInvokeSkill: ['workflow', 'evidence-based-debugging'],
          judge: [
            'Tool calls show workflow discovers and uses evidence-based-debugging for the reported failure, and the agent diagnoses from captured input without claiming original-device verification.',
          ],
        },
      },
      info,
    )
  },
)
test(
  'workflow routing: hunch verdict',
  {
    description:
      'Portable software/system debugging conformance: captured evidence, causal experiments, authority, verification boundaries and workflow routing.',
    criteria: [
      'Tool calls show workflow uses probe for the hunch, returns a cited evidence verdict on redirect behavior, and leaves production files unchanged.',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'evidence-based-debugging:8',
        suite: 'evidence-based-debugging',
        defaults: {
          profile: 'cursor',
          skills: 'full',
        },
        name: 'workflow routing: hunch verdict',
        prompt:
          'Use the workflow skill to assess my hunch that debug-app redirectAfterLogin clears the session cookie. I want a cited verdict on that explanation, not reproduction-led debugging or a repair. Stay read-only.',
        rubric: {
          mustInvokeSkill: ['workflow', 'probe'],
          judge: [
            'Tool calls show workflow uses probe for the hunch, returns a cited evidence verdict on redirect behavior, and leaves production files unchanged.',
          ],
        },
      },
      info,
    )
  },
)
