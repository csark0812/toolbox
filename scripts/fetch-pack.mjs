#!/usr/bin/env node
// Fetch a comparison skill pack at a pinned commit into _agent/packs/<name>, with the per-runner
// workspace setup its docs call for. Usage: node scripts/fetch-pack.mjs pstack
import { execFileSync } from 'node:child_process'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

/** Pinned so every bench compares against the same pack. Bump deliberately and say so in the report. */
export const PACKS = {
  pstack: {
    repo: 'https://github.com/backnotprop/pstack',
    commit: '6f131f137de64fdaf928278c0fd9ecec520ccbee',
    // /setup-pstack writes ~/.agents/pstack-models.md; sealed runs cannot read home, so the bench
    // places the same file in the workspace and the entry prompt names it.
    setup: {
      claude: {
        '.agents/pstack-models.md': [
          '# pstack model configuration for the Claude Code bench runner (models available to Agent).',
          '# budget: large (xhigh)',
          'feature, refactoring: claude-sonnet-5-5',
          'bug-fix: claude-sonnet-5-5',
          'perf-issue: claude-sonnet-5-5',
          'hillclimb: claude-sonnet-5-5',
          'judgment and prose: claude-opus-5-5',
          'hardest tasks: claude-opus-5-5',
          'how explorer: claude-sonnet-5-5',
          'how explainer: claude-opus-5-5',
          'arena runners: [claude-opus-5-5, claude-sonnet-5-5]',
          'arena cross-judge pool: [claude-opus-5-5, claude-sonnet-5-5]',
          'architect runners: [claude-opus-5-5, claude-sonnet-5-5]',
          'interrogate reviewers: [claude-opus-5-5, claude-sonnet-5-5]',
          'swarm workers: claude-sonnet-5-5',
          '',
        ].join('\n'),
      },
      codex: {
        '.agents/pstack-models.md': [
          '# pstack model configuration for the Codex bench runner: subagents run on the parent model.',
          '# budget: large (xhigh)',
          'feature, refactoring: inherit-parent',
          'bug-fix: inherit-parent',
          'perf-issue: inherit-parent',
          'hillclimb: inherit-parent',
          'judgment and prose: inherit-parent',
          'hardest tasks: inherit-parent',
          'swarm workers: inherit-parent',
          '',
        ].join('\n'),
      },
    },
    entryNote: 'Its model settings file is .agents/pstack-models.md.',
    claudeAgents: ['agents'],
  },
}

export async function fetchPack(name) {
  const pack = PACKS[name]
  if (!pack) throw new Error(`Unknown pack ${name}; known: ${Object.keys(PACKS).join(', ')}`)
  const dir = join('_agent/packs', name)
  await rm(dir, { recursive: true, force: true })
  await mkdir(dir, { recursive: true })
  execFileSync('git', ['init', '-q', dir])
  execFileSync('git', ['-C', dir, 'fetch', '-q', '--depth', '1', pack.repo, pack.commit])
  execFileSync('git', ['-C', dir, 'checkout', '-q', 'FETCH_HEAD'])
  for (const [runner, files] of Object.entries(pack.setup))
    for (const [path, content] of Object.entries(files)) {
      const target = join(dir, `workspace-${runner}`, path)
      await mkdir(join(target, '..'), { recursive: true })
      await writeFile(target, content)
    }
  // Claude Code loads subagent definitions from .claude/agents; pstack's entry skill spawns them.
  for (const agentDir of pack.claudeAgents ?? []) {
    const target = join(dir, 'workspace-claude', '.claude', 'agents')
    await mkdir(target, { recursive: true })
    execFileSync('sh', ['-c', `cp ${join(dir, agentDir)}/*.md "${target}/"`])
  }
  await writeFile(join(dir, 'entry-note.txt'), pack.entryNote ?? '')
  return { dir, commit: pack.commit }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await fetchPack(process.argv[2] ?? 'pstack')
  console.log(JSON.stringify(result))
}
