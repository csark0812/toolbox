import { defineConfig } from '@post-print/agent-test'
import { openai } from '@post-print/agent-harness'
// Blinded skill bench: same runner as the claim suites, a neutral workspace, no judge in the run.
export default defineConfig({
  agent: openai({}),
  judge: openai({}),
  workspace: './_agent/bench-workspace',
  testDir: './agent-suites/skill-bench',
  workers: 2,
  retries: 0,
  timeout: 900000,
  outputDir: './_agent/bench-results',
  reporter: [['list']],
})
