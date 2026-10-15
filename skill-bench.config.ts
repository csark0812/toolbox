import { defineConfig } from '@post-print/agent-test'
import { claude, openai } from '@post-print/agent-harness'
// One limit for every arm: packs that delegate to subagents run long, and a shorter limit would
// turn their runs into infrastructure failures rather than judged work.
const RUN_LIMIT_MS = 20 * 60 * 1000

// Claude Code invokes skills through its Skill tool and keeps task lists with TodoWrite; the
// harness default allows neither, which hides auto-routed skills. Every arm gets the same tools.
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

// Blinded skill bench: same runner as the claim suites, a neutral workspace, no judge in the run.
export default defineConfig({
  // SKILL_BENCH_RUNNER picks the agent host for every arm; the judge is chosen per bench, cross-family.
  agent:
    process.env.SKILL_BENCH_RUNNER === 'claude'
      ? claude({ auth: { type: 'subscription' }, timeoutMs: RUN_LIMIT_MS, tools: CLAUDE_TOOLS })
      : openai({ timeoutMs: RUN_LIMIT_MS }),
  judge: openai({}),
  workspace: `./_agent/bench-workspace-${process.env.SKILL_BENCH_RUNNER ?? 'codex'}`,
  testDir: './agent-suites/skill-bench',
  // Raise or lower with --workers; subscription rate limits are the practical ceiling.
  workers: Number(process.env.SKILL_BENCH_WORKERS ?? 4),
  retries: 0,
  timeout: RUN_LIMIT_MS + 5 * 60 * 1000,
  outputDir: './_agent/bench-results',
  reporter: [['list']],
})
