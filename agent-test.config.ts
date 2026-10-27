import { defineConfig } from '@post-print/agent-test'
import { claude, openai } from '@post-print/agent-harness'

// Claude Code invokes skills through its Skill tool; the harness default does not allow it, which
// hides auto-routed skills from the routing claims.
const CLAUDE_TOOLS = [
  'Bash',
  'Read',
  'Edit',
  'Write',
  'Glob',
  'Grep',
  'Agent',
  'Skill',
  'TodoWrite',
]

// Run from inside a Claude Code session, this inherited setting makes nested sessions repeat their
// final message, which breaks the judge's JSON.
delete process.env.CLAUDE_CODE_INCLUDE_PARTIAL_MESSAGES

// AGENT_TEST_RUNNER picks the host for the agent and the judge: Claude Code by default, `codex` for Codex.
const codex = process.env.AGENT_TEST_RUNNER === 'codex'
const host = (options = {}) =>
  codex
    ? openai(options)
    : // On Linux, Claude Code's sandbox blocks Unix sockets, and headless Chrome (taste's look.mjs)
      // dies at startup without them.
      claude({
        auth: { type: 'subscription' },
        tools: CLAUDE_TOOLS,
        allowUnixSockets: true,
        ...options,
      })

export default defineConfig({
  agent: host(),
  judge: host(),
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
