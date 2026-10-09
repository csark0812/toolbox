import { defineConfig } from '@post-print/agent-test'
import { claude } from '@post-print/agent-harness'
import { resolve } from 'node:path'

// UI quality benchmark (agent-suites/ui-bench). Visual judging runs afterwards in
// scripts/ui-bench-judge.mjs, so the in-run judge is only a required default.
const haiku = { model: 'claude-haiku-5-5', auth: { type: 'subscription' } } as const
// render_page runs outside the agent's Bash sandbox, which blocks Chromium. The server
// starts in the agent's working directory and only renders pages inside it.
const renderServer = {
  command: process.execPath,
  args: [resolve('scripts/ui-bench-render-mcp.mjs')],
  tools: ['render_page'],
}
export default defineConfig({
  agent: claude({ ...haiku, mcpServers: { 'ui-bench': renderServer } }),
  judge: claude(haiku),
  workspace: './_agent/public-workspace',
  testDir: './agent-suites/ui-bench',
  // Runs are independent sealed workspaces; 3 at a time keeps a batch near 15 minutes.
  workers: 3,
  retries: 0,
  timeout: 900000,
  outputDir: './_agent/ui-bench-results',
  reporter: [['list']],
})
