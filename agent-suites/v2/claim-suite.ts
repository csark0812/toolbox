import { readFileSync } from 'node:fs'
import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'

/** Register one live test per scenario in `agent-suites/<suite>/claims.json`. */
export function defineClaimSuite(suite: string) {
  const claims = JSON.parse(readFileSync(`agent-suites/${suite}/claims.json`, 'utf8'))
  const test = describe(suite, ({ agent, judge }) => ({
    coder: agent(),
    reviewer: judge({
      prompt:
        'Evaluate only the supplied claims against the supplied evidence. Skill availability or self-assertion does not prove use. Return passed only if every claim is supported. Explain missing evidence.',
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
