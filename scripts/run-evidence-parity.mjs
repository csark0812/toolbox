#!/usr/bin/env node
/**
 * One-shot evidence-parity cadence:
 *   sync skills → investigate-outcomes (full) → investigate-transfer (none)
 *   → optional diagnose + ablations → compare report → propose evolution notes
 *
 * Does NOT edit SKILL.md — human Keep / Reject / Defer only.
 *
 * Usage:
 *   set -a && source .env && set +a
 *   npm run agent:test:evidence-parity
 *
 * Flags (pass after --):
 *   --doctor          run agent-test --doctor first
 *   --no-diagnose     skip diagnose-outcomes
 *   --no-ablations    skip organization-ablations
 *   --no-propose      skip evolution-note autofill
 *   --compare-only    skip live runs; need prior sessions under --debug-dir
 */
import { spawnSync } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  findFailedDebugBundles,
  listSessionDirs,
  newestSessionAfter,
} from './lib/agent-test-artifacts.mjs'
import { writeComparisonReport } from './lib/compare-agent-runs-core.mjs'
import { proposeFromDebugDir } from './lib/propose-skill-evolution-core.mjs'

const root = join(fileURLToPath(import.meta.url), '..', '..')
const agentTestBin = join(root, 'node_modules', '.bin', 'agent-test')

function parseArgs(argv) {
  const out = {
    doctor: false,
    diagnose: true,
    ablations: true,
    propose: true,
    compareOnly: false,
    debugDir: '',
    agentArgs: [],
  }
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--doctor') out.doctor = true
    else if (arg === '--no-diagnose') out.diagnose = false
    else if (arg === '--no-ablations') out.ablations = false
    else if (arg === '--no-propose') out.propose = false
    else if (arg === '--compare-only') out.compareOnly = true
    else if (arg === '--debug-dir') out.debugDir = argv[++i] ?? ''
    else if (arg === '--help' || arg === '-h') out.help = true
    else out.agentArgs.push(arg)
  }
  return out
}

function run(label, args, { allowFail = false } = {}) {
  console.log(`\n▶ ${label}`)
  const result = spawnSync(agentTestBin, args, {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
  })
  if (result.status !== 0 && !allowFail) {
    console.error(`\n✗ ${label} exited ${result.status ?? 1}`)
    process.exit(result.status ?? 1)
  }
  return result.status ?? 0
}

function syncSkills() {
  console.log('\n▶ sync:skills')
  const result = spawnSync('npm', ['run', 'sync:skills'], {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
  })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

async function main() {
  const args = parseArgs(process.argv)
  if (args.help) {
    console.log(`Usage: npm run agent:test:evidence-parity [-- flags]

Automates: outcomes (full) + transfer (none) + compare + propose notes.
Requires CURSOR_API_KEY in the environment (source .env first).

Flags:
  --doctor          agent-test --doctor preflight
  --no-diagnose     skip diagnose-outcomes
  --no-ablations    skip organization-ablations
  --no-propose      skip evolution-note autofill
  --compare-only    skip live runs (sessions must exist under --debug-dir)
  --debug-dir PATH  staging parent (default: $TMPDIR/toolbox-evidence-<ts>)`)
    process.exit(0)
  }

  if (!process.env.CURSOR_API_KEY && !args.compareOnly) {
    console.error('CURSOR_API_KEY is not set. Run: set -a && source .env && set +a')
    process.exit(1)
  }

  const runId = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const debugParent =
    args.debugDir || join(tmpdir(), `toolbox-evidence-${runId}`)
  const sessionsParent = join(debugParent, 'sessions')
  const manifestDir = join(root, '_agent', 'evidence-runs', runId)
  await mkdir(manifestDir, { recursive: true })

  const manifest = {
    startedAt: new Date().toISOString(),
    debugParent,
    sessions: {},
    report: null,
    proposals: [],
    failures: 0,
  }

  const baseAgentArgs = [
    '--suites-dir',
    'agent-suites',
    '--live',
    '--debug',
    '--debug-dir',
    debugParent,
    ...args.agentArgs,
  ]

  if (args.doctor) {
    run('agent-test --doctor', ['--doctor', '--suites-dir', 'agent-suites'])
  }

  const knownSessions = new Set()

  if (!args.compareOnly) {
    syncSkills()

    run('investigate-outcomes (skills: full)', [
      ...baseAgentArgs,
      '--suite',
      'investigate-outcomes',
    ])
    const fullSession = await newestSessionAfter(sessionsParent, knownSessions)
    if (!fullSession) {
      console.error('No session directory found after investigate-outcomes')
      process.exit(1)
    }
    knownSessions.add(fullSession.path)
    manifest.sessions.full = fullSession.path

    run('investigate-transfer (skills: none)', [
      ...baseAgentArgs,
      '--suite',
      'investigate-transfer',
    ])
    const noneSession = await newestSessionAfter(sessionsParent, knownSessions)
    if (!noneSession) {
      console.error('No session directory found after investigate-transfer')
      process.exit(1)
    }
    knownSessions.add(noneSession.path)
    manifest.sessions.none = noneSession.path

    if (args.diagnose) {
      run('diagnose-outcomes (skills: full)', [
        ...baseAgentArgs,
        '--suite',
        'diagnose-outcomes',
      ], { allowFail: true })
      const diagnoseSession = await newestSessionAfter(sessionsParent, knownSessions)
      if (diagnoseSession) {
        knownSessions.add(diagnoseSession.path)
        manifest.sessions.diagnose = diagnoseSession.path
      }
    }

    if (args.ablations) {
      run('organization-ablations', [
        ...baseAgentArgs,
        '--suite',
        'organization-ablations',
      ], { allowFail: true })
      const ablationSession = await newestSessionAfter(sessionsParent, knownSessions)
      if (ablationSession) {
        knownSessions.add(ablationSession.path)
        manifest.sessions.ablations = ablationSession.path
      }
    }
  } else {
    const sessions = await listSessionDirs(sessionsParent)
    if (sessions.length < 2) {
      console.error('--compare-only needs at least two session dirs under', sessionsParent)
      process.exit(1)
    }
    manifest.sessions.full = sessions.at(-2).path
    manifest.sessions.none = sessions.at(-1).path
  }

  const report = await writeComparisonReport({
    repoRoot: root,
    left: manifest.sessions.full,
    right: manifest.sessions.none,
    leftLabel: 'full',
    rightLabel: 'none',
    align: 'normalized',
    reportDir: join(root, '_agent', 'eval-reports'),
  })
  manifest.report = report.reportPath
  console.log(`\nCompare report: ${report.reportPath}`)

  if (args.propose) {
    const debugDirs = new Set()
    for (const sessionPath of Object.values(manifest.sessions)) {
      if (!sessionPath) continue
      for (const dir of await findFailedDebugBundles(sessionPath)) {
        debugDirs.add(dir)
      }
    }
    const proposalTs = runId
    for (const debugDir of debugDirs) {
      const { outPath } = await proposeFromDebugDir(debugDir, {
        repoRoot: root,
        ts: proposalTs,
      })
      manifest.proposals.push(outPath)
      console.log(`Proposed: ${outPath}`)
    }
  }

  const fullFails = (await findFailedDebugBundles(manifest.sessions.full)).length
  const noneFails = (await findFailedDebugBundles(manifest.sessions.none)).length
  manifest.failures = fullFails + noneFails
  manifest.finishedAt = new Date().toISOString()

  const manifestPath = join(manifestDir, 'manifest.json')
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8')
  console.log(`\nManifest: ${manifestPath}`)
  console.log(`Debug staging: ${debugParent}`)

  if (manifest.failures > 0) {
    console.log(`\n⚠ ${manifest.failures} failed scenario bundle(s) — triage proposals under _agent/skill-evolution/`)
    process.exit(1)
  }
  console.log('\n✓ Evidence parity run complete (no failures)')
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
