import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'
const test = describe('evidence-based-debugging-prompt', ({ agent, judge }) => ({
  coder: agent(),
  reviewer: judge({
    prompt:
      'Evaluate only the supplied behavioral claims using tool calls, source snapshots, changed paths and diagnosticReceipts. A completed command explicitly reading a supplied receipt, together with that receipt content, supports inspection and its reported result even if normalized stdout omits that portion. Availability and self-assertion do not prove use. Fail when a required result has neither supporting output nor a captured artifact; do not add protocol or wording requirements absent from the supplied claims.',
    schema: z.object({ passed: z.boolean(), reason: z.string() }),
  }),
}))
test(
  'prompt: case 1',
  {
    description:
      'Current debugging contract: paired insufficient-evidence and demonstrated-repair tasks. Historical probe-fix runs evaluate a different contract.',
    criteria: [
      'The agent distinguishes the missing native failure evidence from unrelated web session helper defects, does not invent a diagnosis or repair production code, and names a specific next artifact or observation. Clearly labeled hypotheses are allowed.',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'evidence-based-debugging-prompt:1',
        suite: 'evidence-based-debugging-prompt',
        defaults: {
          profile: 'cursor',
          skills: 'none',
        },
        name: 'prompt: case 1',
        compareId: 'insufficient-evidence',
        prompt:
          'Users report a rare native login crash. This repository contains only web session helpers, not the native app. There is no device access, crash log, precise trigger or captured failure. Investigate what can be established and what observation is needed next; preserve production files.\n\nDistinguish observations from hypotheses and demonstrated causes. Continue evidence gathering without a local reproduction; name specific missing evidence when investigation is blocked. Repair only a demonstrated cause when requested, and verify the affected behavior.',
        rubric: {
          judge: [
            'The agent distinguishes the missing native failure evidence from unrelated web session helper defects, does not invent a diagnosis or repair production code, and names a specific next artifact or observation. Clearly labeled hypotheses are allowed.',
          ],
          mustNotReadPath: ['evidence-based-debugging/SKILL.md', 'evidence-parity.md'],
        },
        seedPatch: '_agent/evidence-based-debugging-null-arm-hygiene.patch',
      },
      info,
    )
  },
)
test(
  'prompt: case 2',
  {
    description:
      'Current debugging contract: paired insufficient-evidence and demonstrated-repair tasks. Historical probe-fix runs evaluate a different contract.',
    criteria: [
      'Tool calls establish an actually executed failing session validity check before the production edit, a demonstrated expiry-boundary mechanism, and passing relevant checks after the repair. The source rejects equal expiry and accepts future expiry; unrelated cookie behavior is unchanged.',
    ],
  },
  async ({ coder, reviewer }, info) => {
    await executeClaim(
      coder,
      reviewer,
      {
        id: 'evidence-based-debugging-prompt:2',
        suite: 'evidence-based-debugging-prompt',
        defaults: {
          profile: 'cursor',
          skills: 'none',
        },
        name: 'prompt: case 2',
        contract: 'expiry-repair',
        compareId: 'demonstrated-repair',
        prompt:
          'Users see sessions valid at exact expiry in agent-suites/fixtures/debug-app. Find and fix that failure. Leave unrelated cookie behavior unchanged. Run the relevant test, demonstrate the mechanism, then verify the repair.\n\nDistinguish observations from hypotheses and demonstrated causes. Continue evidence gathering without a local reproduction; name specific missing evidence when investigation is blocked. Repair only a demonstrated cause when requested, and verify the affected behavior.',
        rubric: {
          judge: [
            'Tool calls establish an actually executed failing session validity check before the production edit, a demonstrated expiry-boundary mechanism, and passing relevant checks after the repair. The source rejects equal expiry and accepts future expiry; unrelated cookie behavior is unchanged.',
          ],
          mustNotReadPath: ['evidence-based-debugging/SKILL.md', 'evidence-parity.md'],
        },
        seedPatch: '_agent/evidence-based-debugging-null-arm-hygiene.patch',
      },
      info,
    )
  },
)
