import { defineConfig } from '@post-print/agent-test'
import { claude } from '@post-print/agent-harness'
import { resolve } from 'node:path'

// App-fixture UI bench (agent-suites/ui-bench-app). UI_BENCH_APP names a local, git-ignored
// fixture under agent-suites/ui-bench/local/; scripts/ui-bench.mjs --app prepares its workspace.
const app = process.env.UI_BENCH_APP ?? 'piggybank'
const builder = {
  model: process.env.UI_BENCH_AGENT_MODEL ?? 'claude-sonnet-5-5',
  auth: { type: 'subscription' },
} as const
const renderServer = {
  command: process.execPath,
  args: [resolve('scripts/ui-bench-render-mcp.mjs')],
  env: { UI_BENCH_APP: app },
  tools: ['render_screen'],
}
export default defineConfig({
  agent: claude({ ...builder, mcpServers: { 'ui-bench': renderServer } }),
  judge: claude({ model: 'claude-haiku-5-5', auth: { type: 'subscription' } }),
  workspace: `./_agent/app-workspaces/${app}`,
  testDir: './agent-suites/ui-bench-app',
  workers: 3,
  retries: 0,
  timeout: 1_200_000,
  outputDir: './_agent/ui-bench-app-results',
  reporter: [['list']],
})
