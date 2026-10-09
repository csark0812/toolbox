import { defineConfig } from '@post-print/agent-test'
import { claude } from '@post-print/agent-harness'
const haiku = { model: 'claude-haiku-5-5', auth: { type: 'subscription' } } as const
export default defineConfig({
  agent: claude(haiku),
  judge: claude(haiku),
  workspace: './_agent/public-workspace',
  testDir: './agent-suites/v2',
  workers: 1,
  retries: 0,
  timeout: 600000,
  outputDir: './_agent/test-results',
  reporter: [['list']],
})
