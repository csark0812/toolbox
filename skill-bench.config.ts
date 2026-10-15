import { defineConfig } from '@post-print/agent-test'
import { claude, openai } from '@post-print/agent-harness'
// Blinded skill bench: same runner as the claim suites, a neutral workspace, no judge in the run.
export default defineConfig({
  // SKILL_BENCH_RUNNER picks the agent host for every arm; the judge is chosen per bench, cross-family.
  agent:
    process.env.SKILL_BENCH_RUNNER === 'claude'
      ? claude({ auth: { type: 'subscription' } })
      : openai({}),
  judge: openai({}),
  workspace: './_agent/bench-workspace',
  testDir: './agent-suites/skill-bench',
  // Raise or lower with --workers; subscription rate limits are the practical ceiling.
  workers: Number(process.env.SKILL_BENCH_WORKERS ?? 4),
  retries: 0,
  timeout: 900000,
  outputDir: './_agent/bench-results',
  reporter: [['list']],
})
