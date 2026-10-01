import { defineConfig } from '@post-print/agent-test'
import { openai } from '@post-print/agent-harness'
export default defineConfig({
  agent: openai({}),
  judge: openai({}),
  workspace: './_agent/public-workspace',
  testDir: './agent-suites/v2',
  workers: 1,
  retries: 0,
  timeout: 600000,
  outputDir: './_agent/test-results',
  reporter: [['list']],
})
