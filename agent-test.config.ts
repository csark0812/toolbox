import { defineConfig } from '@post-print/agent-test'
import { openai } from '@post-print/agent-harness'
export default defineConfig({
  agent: openai({}),
  judge: openai({}),
  workspace: './_agent/public-workspace',
  testDir: './agent-suites/v2',
  // Each run gets its own sealed workspace, so claims can run side by side. Raise or lower with
  // AGENT_TEST_WORKERS or --workers; subscription rate limits are the practical ceiling.
  workers: Number(process.env.AGENT_TEST_WORKERS ?? 4),
  retries: 0,
  timeout: 600000,
  outputDir: './_agent/test-results',
  reporter: [['list']],
})
