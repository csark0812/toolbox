import { readFileSync } from 'node:fs'
import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'

const suite = JSON.parse(readFileSync('agent-suites/hillclimb/claims.json', 'utf8'))
const test = describe('hillclimb', ({ agent, judge }) => ({
  coder: agent(),
  reviewer: judge({
    prompt:
      'Evaluate only the supplied claims against the supplied evidence. Skill availability or self-assertion does not prove use. Return passed only if every claim is supported. Explain missing evidence.',
    schema: z.object({ passed: z.boolean(), reason: z.string() }),
  }),
}))

for (const [index, scenario] of suite.scenarios.entries())
  test(
    scenario.name,
    { description: suite.description, criteria: scenario.rubric.judge ?? [] },
    async ({ coder, reviewer }, info) => {
      await executeClaim(
        coder,
        reviewer,
        { id: `hillclimb:${index + 1}`, suite: 'hillclimb', defaults: suite.defaults, ...scenario },
        info,
      )
    },
  )
