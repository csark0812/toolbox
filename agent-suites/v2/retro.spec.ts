import { readFileSync } from 'node:fs'
import { describe, z } from '@post-print/agent-test'
import { executeClaim } from './support'

type RetroScenario = {
  name: string
  prompt: string
  evidencePaths: string[]
  rubric: { mustInvokeSkill: string[]; judge: string[] }
}

const claims: { description: string; scenarios: RetroScenario[] } = JSON.parse(
  readFileSync(new URL('../retro/claims.json', import.meta.url), 'utf8'),
)

const test = describe('retro', ({ agent, judge }) => ({
  coder: agent(),
  reviewer: judge({
    prompt:
      'Evaluate recommendations against the recorded session, current source snapshots and actual tool calls. Distinguish observations from inference. Skill availability or self-assertion does not prove use. Return passed only if every supplied claim is supported; report missing evidence.',
    schema: z.object({ passed: z.boolean(), reason: z.string() }),
  }),
}))

for (const [index, scenario] of claims.scenarios.entries()) {
  test(
    scenario.name,
    { description: claims.description, criteria: scenario.rubric.judge },
    async ({ coder, reviewer }, info) => {
      await executeClaim(
        coder,
        reviewer,
        {
          id: `retro:${index + 1}`,
          suite: 'retro',
          defaults: { profile: 'cursor', skills: 'full' },
          evidencePolicy: 'read-only',
          ...scenario,
        },
        info,
      )
    },
  )
}
