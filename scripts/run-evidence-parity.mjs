#!/usr/bin/env node
/**
 * One-shot evidence-parity cadence:
 *   sync skills → agent-test --compare-pairs investigate-outcomes:investigate-transfer
 *   → optional diagnose + ablations → propose evolution notes
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
 *   --compare-only    re-render compare from prior suite-report JSON (no live runs)
 */
import { spawnSync } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  PARITY_COMPARE_PAIR,
  compareReportPaths,
  costFromCompareReport,
  findFailedDebugBundles,
  findLatestSuiteReports,
  findParitySession,
  newestSessionAfter,
  readCompareReportJson,
} from './lib/agent-test-artifacts.mjs'
import { proposeFromDebugDir } from './lib/propose-skill-evolution-core.mjs'

const root = join(fileURLToPath(import.meta.url), '..', '..')
const agentTestBin = join(root, 'node_modules', '.bin', 'agent-test')
const evalReportsRoot = join(root, '_agent', 'eval-reports')

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

async function resolveCompareInputs({ compareOnly, debugParent, runReportDir }) {
  if (!compareOnly) return null

  const latest = await findLatestSuiteReports(evalReportsRoot)
  if (latest) {
    return {
      a: latest.paths.suiteReports.outcomes,
      b: latest.paths.suiteReports.transfer,
    }
  }

  const sessionsParent = join(debugParent, 'sessions')
  const paritySession = await findParitySession(sessionsParent)
  if (paritySession) {
    const sessionCompare = compareReportPaths(join(paritySession.path, 'compare'))
    return {
      a: sessionCompare.suiteReports.outcomes,
      b: sessionCompare.suiteReports.transfer,
      paritySession: paritySession.path,
    }
  }

  console.error(
    'compare-only needs suite-report JSON from a prior parity run under _agent/eval-reports/<run-id>/',
  )
  process.exit(1)
}

async function main() {
  const args = parseArgs(process.argv)
  if (args.help) {
    console.log(`Usage: npm run agent:test:evidence-parity [-- flags]

Automates: compare-pairs (outcomes vs transfer) + optional diagnose/ablations + propose notes.
Requires CURSOR_API_KEY in the environment (source .env first).

Flags:
  --doctor          agent-test --doctor preflight
  --no-diagnose     skip diagnose-outcomes
  --no-ablations    skip organization-ablations
  --no-propose      skip evolution-note autofill
  --compare-only    re-render compare from prior suite-report JSON (no live runs)
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
  const runReportDir = join(evalReportsRoot, runId)
  const reportPaths = compareReportPaths(runReportDir)
  const manifestDir = join(root, '_agent', 'evidence-runs', runId)
  await mkdir(manifestDir, { recursive: true })
  await mkdir(runReportDir, { recursive: true })

  const manifest = {
    startedAt: new Date().toISOString(),
    debugParent,
    comparePair: PARITY_COMPARE_PAIR,
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

    run('evidence-parity compare-pairs', [
      ...baseAgentArgs,
      '--compare-pairs',
      PARITY_COMPARE_PAIR,
      '--compare-out',
      runReportDir,
    ])

    const paritySession = await newestSessionAfter(sessionsParent, knownSessions)
    if (!paritySession) {
      console.error('No session directory found after compare-pairs run')
      process.exit(1)
    }
    knownSessions.add(paritySession.path)
    manifest.sessions.parity = paritySession.path

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
    const compareInputs = await resolveCompareInputs({
      compareOnly: true,
      debugParent,
      runReportDir,
    })
    run('agent-test compare (replay)', [
      '--suites-dir',
      'agent-suites',
      'compare',
      '--a',
      compareInputs.a,
      '--b',
      compareInputs.b,
      '--compare-out',
      runReportDir,
    ])
  }

  const paritySession =
    manifest.sessions.parity ??
    (await findParitySession(sessionsParent))?.path ??
    null
  if (paritySession) {
    manifest.sessions.parity = paritySession
  }

  const compareReport = await readCompareReportJson(reportPaths.json)
  manifest.report = reportPaths.html
  manifest.reportMd = reportPaths.md
  manifest.reportJson = reportPaths.json
  manifest.suiteReports = reportPaths.suiteReports
  manifest.cost = costFromCompareReport(compareReport)
  console.log(`\nCompare report (HTML): ${reportPaths.html}`)
  console.log(`Compare report (MD): ${reportPaths.md}`)
  console.log(`Paired scenarios: ${compareReport.summary?.pairedCount ?? 0}`)

  if (args.propose && paritySession) {
    const debugDirs = new Set()
    for (const dir of await findFailedDebugBundles(paritySession)) {
      debugDirs.add(dir)
    }
    for (const sessionPath of [manifest.sessions.diagnose, manifest.sessions.ablations]) {
      if (!sessionPath) continue
      for (const dir of await findFailedDebugBundles(sessionPath)) {
        debugDirs.add(dir)
      }
    }
    for (const debugDir of debugDirs) {
      const { outPath } = await proposeFromDebugDir(debugDir, {
        repoRoot: root,
        ts: runId,
      })
      manifest.proposals.push(outPath)
      console.log(`Proposed: ${outPath}`)
    }
  }

  manifest.failures = paritySession
    ? (await findFailedDebugBundles(paritySession)).length
    : 0
  if (manifest.sessions.diagnose) {
    manifest.failures += (await findFailedDebugBundles(manifest.sessions.diagnose)).length
  }
  if (manifest.sessions.ablations) {
    manifest.failures += (await findFailedDebugBundles(manifest.sessions.ablations)).length
  }
  manifest.finishedAt = new Date().toISOString()

  const manifestPath = join(manifestDir, 'manifest.json')
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8')
  console.log(`\nManifest: ${manifestPath}`)
  console.log(`Debug staging: ${debugParent}`)

  if (manifest.failures > 0) {
    console.log(
      `\n⚠ ${manifest.failures} failed scenario bundle(s) — triage proposals under _agent/skill-evolution/`,
    )
    process.exit(1)
  }
  console.log('\n✓ Evidence parity run complete (no failures)')
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
