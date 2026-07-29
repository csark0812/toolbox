#!/usr/bin/env node
/**
 * One-shot evidence-parity cadence:
 *   sync skills → compare-pairs investigate-outcomes:investigate-transfer
 *   → compare-pairs investigate-outcomes:investigate-prompt → optional diagnose/ablations → propose notes
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
 *   --no-prompt       skip investigate-prompt baseline arm
 *   --repeats N       run parity cadence N times (default 1); writes batch manifest
 *   --compare-only    re-render compare from prior suite-report JSON (no live runs)
 */
import { spawnSync } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  PARITY_COMPARE_PAIR,
  PROMPT_COMPARE_PAIR,
  PROMPT_SUITE,
  compareReportPaths,
  costFromCompareReport,
  findFailedDebugBundles,
  findLatestSuiteReports,
  findParitySession,
  newestSessionAfter,
  readCompareReportJson,
  collectResults,
  aggregateBatchC1,
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
    prompt: true,
    repeats: 1,
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
    else if (arg === '--no-prompt') out.prompt = false
    else if (arg === '--repeats') out.repeats = Math.max(1, Number(argv[++i] ?? 1) || 1)
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

async function summarizeC1FromSessions(sessionPaths) {
  const rows = []
  for (const sessionRoot of sessionPaths.filter(Boolean)) {
    rows.push(...(await collectResults(sessionRoot)).values())
  }
  const c1 = rows.filter((r) => r.compareId === 'fix-invention-pressure')
  return {
    full: c1.filter((r) => r.suite === 'investigate-outcomes'),
    none: c1.filter((r) => r.suite === 'investigate-transfer'),
    prompt: c1.filter((r) => r.suite === PROMPT_SUITE),
  }
}

async function runSingleParity(args, { runId, debugParent, runReportDir, repeatIndex, repeatTotal }) {
  const sessionsParent = join(debugParent, 'sessions')
  const reportPaths = compareReportPaths(runReportDir)
  const manifestDir = join(root, '_agent', 'evidence-runs', runId)
  await mkdir(manifestDir, { recursive: true })
  await mkdir(runReportDir, { recursive: true })

  const manifest = {
    startedAt: new Date().toISOString(),
    repeatIndex,
    repeatTotal,
    debugParent,
    comparePair: PARITY_COMPARE_PAIR,
    promptComparePair: args.prompt ? PROMPT_COMPARE_PAIR : null,
    model: {
      agent: process.env.CURSOR_AGENT_MODEL ?? null,
      judge: process.env.CURSOR_JUDGE_MODEL ?? null,
    },
    sessions: {},
    report: null,
    proposals: [],
    failures: 0,
    c1: null,
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

  const knownSessions = new Set()

  if (!args.compareOnly) {
    syncSkills()

    run('evidence-parity compare-pairs (full vs none)', [
      ...baseAgentArgs,
      '--compare-pairs',
      PARITY_COMPARE_PAIR,
      '--compare-out',
      runReportDir,
    ], { allowFail: true })

    const paritySession = await newestSessionAfter(sessionsParent, knownSessions)
    if (!paritySession) {
      console.error('No session directory found after compare-pairs run')
      process.exit(1)
    }
    knownSessions.add(paritySession.path)
    manifest.sessions.parity = paritySession.path

    if (args.prompt) {
      const promptCompareDir = join(runReportDir, 'prompt-compare')
      run('evidence-parity compare-pairs (full vs prompt)', [
        ...baseAgentArgs,
        '--compare-pairs',
        PROMPT_COMPARE_PAIR,
        '--compare-out',
        promptCompareDir,
      ], { allowFail: true })
      const promptSession = await newestSessionAfter(sessionsParent, knownSessions)
      if (promptSession) {
        knownSessions.add(promptSession.path)
        manifest.sessions.prompt = promptSession.path
      }
      manifest.promptCompare = join(promptCompareDir, 'compare-report.html')
      manifest.promptCompareMd = join(promptCompareDir, 'compare-report.md')
      manifest.promptCompareJson = join(promptCompareDir, 'compare-report.json')
    }

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

  if (paritySession) {
    const c1Rows = await summarizeC1FromSessions([
      paritySession,
      manifest.sessions.prompt,
    ])
    const fullPass = c1Rows.full.length > 0 && c1Rows.full.every((r) => r.pass && !r.skipped)
    const nonePass = c1Rows.none.length > 0 && c1Rows.none.every((r) => r.pass && !r.skipped)
    const promptPass =
      c1Rows.prompt.length > 0 && c1Rows.prompt.every((r) => r.pass && !r.skipped)
    manifest.c1 = {
      fullPass,
      nonePass,
      promptPass,
      full: c1Rows.full,
      none: c1Rows.none,
      prompt: c1Rows.prompt,
    }
  }

  if (args.propose && paritySession) {
    const debugDirs = new Set()
    for (const dir of await findFailedDebugBundles(paritySession)) {
      debugDirs.add(dir)
    }
    for (const sessionPath of [
      manifest.sessions.prompt,
      manifest.sessions.diagnose,
      manifest.sessions.ablations,
    ]) {
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
  if (manifest.sessions.prompt) {
    manifest.failures += (await findFailedDebugBundles(manifest.sessions.prompt)).length
  }
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
  return manifest
}


async function main() {
  const args = parseArgs(process.argv)
  if (args.help) {
    console.log(`Usage: npm run agent:test:evidence-parity [-- flags]

Automates: compare-pairs (outcomes vs transfer + outcomes vs prompt) + optional diagnose/ablations + propose notes.
Requires CURSOR_API_KEY in the environment (source .env first).

Flags:
  --doctor          agent-test --doctor preflight
  --no-diagnose     skip diagnose-outcomes
  --no-ablations    skip organization-ablations
  --no-propose      skip evolution-note autofill
  --no-prompt       skip investigate-prompt baseline arm
  --repeats N       run parity cadence N times (default 1)
  --compare-only    re-render compare from prior suite-report JSON (no live runs)
  --debug-dir PATH  staging parent (default: $TMPDIR/toolbox-evidence-<ts>)`)
    process.exit(0)
  }

  if (!process.env.CURSOR_API_KEY && !args.compareOnly) {
    console.error('CURSOR_API_KEY is not set. Run: set -a && source .env && set +a')
    process.exit(1)
  }

  const batchId = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const debugParent =
    args.debugDir || join(tmpdir(), `toolbox-evidence-${batchId}`)
  const runManifests = []
  let totalFailures = 0

  if (args.doctor) {
    run('agent-test --doctor', ['--doctor', '--suites-dir', 'agent-suites'])
  }

  for (let i = 0; i < args.repeats; i++) {
    const runId =
      args.repeats > 1 ? `${batchId}-r${String(i + 1).padStart(2, '0')}` : batchId
    const runReportDir = join(evalReportsRoot, runId)
    if (args.repeats > 1) {
      console.log(`\n══ Repeat ${i + 1}/${args.repeats} (${runId}) ══`)
    }
    const manifest = await runSingleParity(args, {
      runId,
      debugParent,
      runReportDir,
      repeatIndex: i + 1,
      repeatTotal: args.repeats,
    })
    runManifests.push(manifest)
    totalFailures += manifest.failures
  }

  if (args.repeats > 1) {
    const batchDir = join(root, '_agent', 'evidence-runs', `batch-${batchId}`)
    await mkdir(batchDir, { recursive: true })
    const batchManifest = {
      batchId,
      startedAt: runManifests[0]?.startedAt ?? null,
      finishedAt: new Date().toISOString(),
      repeats: args.repeats,
      c1Aggregate: aggregateBatchC1(runManifests),
      decisionHint: null,
      runs: runManifests.map((m, idx) => ({
        repeat: idx + 1,
        runId: args.repeats > 1 ? `${batchId}-r${String(idx + 1).padStart(2, '0')}` : batchId,
        evalReport: m.report,
        promptCompare: m.promptCompare ?? null,
        c1: m.c1,
      })),
    }
    const agg = batchManifest.c1Aggregate
    const promptMatchesFull = runManifests.every(
      (m) => m.c1?.fullPass === m.c1?.promptPass,
    )
    if (
      agg.c1FullWins > agg.c1NoneWins &&
      agg.c1FullBeatsPrompt > agg.c1PromptBeatsFull &&
      !promptMatchesFull
    ) {
      batchManifest.decisionHint = 'keep-narrow-candidate'
    } else if (agg.c1FullWins > agg.c1NoneWins && promptMatchesFull) {
      batchManifest.decisionHint = 'demote-candidate'
    } else if (agg.c1NoneWins >= agg.c1FullWins || agg.c1PromptBeatsFull > agg.c1FullBeatsPrompt) {
      batchManifest.decisionHint = 'demote-or-remove-candidate'
    } else {
      batchManifest.decisionHint = 'invest-more'
    }
    batchManifest.promptMatchesFull = promptMatchesFull
    const batchPath = join(batchDir, 'batch-manifest.json')
    await writeFile(batchPath, JSON.stringify(batchManifest, null, 2) + '\n', 'utf8')
    console.log(`\nBatch manifest: ${batchPath}`)
    console.log(`C1 aggregate: full>${agg.c1NoneWins ? 'none' : ''} wins=${agg.c1FullWins}, none wins=${agg.c1NoneWins}, ties=${agg.c1Ties}`)
    console.log(`Decision hint: ${batchManifest.decisionHint}`)
  }

  console.log(`Debug staging: ${debugParent}`)

  if (totalFailures > 0) {
    console.log(
      `\n⚠ ${totalFailures} failed scenario bundle(s) across repeats — triage proposals under _agent/skill-evolution/`,
    )
    process.exit(1)
  }
  console.log('\n✓ Evidence parity run complete (no failures)')
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
