import { readFileSync } from 'node:fs'
import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'

const DEFAULT_JUDGE =
  'Evaluate only the supplied claims against the supplied evidence. Skill availability or self-assertion does not prove use. Return passed only if every claim is supported. Explain missing evidence.'

/** The debugging families also credit command receipts the agent captured under _evidence/. */
export const RECEIPT_JUDGE =
  'Evaluate only the supplied behavioral claims using tool calls, source snapshots, changed paths and diagnosticReceipts. A completed command explicitly reading a supplied receipt, together with that receipt content, supports inspection and its reported result even if normalized stdout omits that portion. Availability and self-assertion do not prove use. Fail when a required result has neither supporting output nor a captured artifact; do not add protocol or wording requirements absent from the supplied claims.'

/** Register one live test per scenario in `agent-suites/<suite>/claims.json`. */
export function defineClaimSuite(suite: string, { judgePrompt = DEFAULT_JUDGE } = {}) {
  const claims = JSON.parse(readFileSync(`agent-suites/${suite}/claims.json`, 'utf8'))
  const test = describe(suite, ({ agent, judge }) => ({
    coder: agent(),
    reviewer: judge({
      prompt: judgePrompt,
      schema: z.object({ passed: z.boolean(), reason: z.string() }),
    }),
  }))
  for (const [index, scenario] of claims.scenarios.entries())
    test(
      scenario.name,
      { description: claims.description, criteria: scenario.rubric.judge ?? [] },
      async ({ coder, reviewer }, info) => {
        await executeClaim(
          coder,
          reviewer,
          { id: `${suite}:${index + 1}`, suite, defaults: claims.defaults, ...scenario },
          info,
        )
      },
    )
}
