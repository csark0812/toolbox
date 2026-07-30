#!/usr/bin/env node
/**
 * Diagnose evidence-parity cadence (independent of investigate):
 *   sync skills → live diagnose-outcomes
 *   → materialize null suites to $TMPDIR → park answer keys on open tree
 *   → live diagnose-transfer (+ prompt) → restore → offline compare → propose notes
 *
 * Caller park is required: live Cursor Shell often targets the IDE-open root,
 * not the seeded worktree — worktree-only deletes do not stop forage.
 *
 * Does NOT edit SKILL.md — human Keep / Reject / Defer only.
 * Does NOT run investigate suites or organization-ablations by default.
 *
 * Usage:
 *   set -a && source .env && set +a
 *   npm run agent:test:diagnose-evidence-parity
 *
 * Flags (pass after --):
 *   --doctor          run agent-test --doctor first
 *   --no-prompt       skip diagnose-prompt baseline arm
 *   --ablations       also run organization-ablations
 *   --no-propose      skip evolution-note autofill
 *   --repeats N       run parity cadence N times (default 1); writes batch manifest
 *   --compare-only    re-render compare from prior suite-report JSON (no live runs)
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  DIAGNOSE_PARITY_COMPARE_PAIR,
  DIAGNOSE_PROMPT_COMPARE_PAIR,
  DIAGNOSE_OUTCOMES_SUITE,
  DIAGNOSE_TRANSFER_SUITE,
  DIAGNOSE_PROMPT_SUITE,
  compareReportPaths,
  costFromCompareReport,
  findFailedDebugBundles,
  findLatestSuiteReports,
  findParitySession,
  newestSessionAfter,
  readCompareReportJson,
  collectResults,
  aggregateBatchD1,
} from './lib/agent-test-artifacts.mjs'
import {
  parkDiagnoseAnswerKeys,
  restoreDiagnoseAnswerKeys,
  commitDiagnoseParkToGit,
  restoreDiagnoseParkGit,
} from './lib/diagnose-caller-park.mjs'
import { materializeNullArmSuite } from './lib/diagnose-null-arm-suites.mjs'
import {
  decideDiagnoseD1Disposition,
  summarizeD1NoneForensics,
} from './lib/diagnose-d1-decision.mjs'
import { proposeFromDebugDir } from './lib/propose-skill-evolution-core.mjs'
import { regenerateDiagnoseNullArmHygieneSeed } from './regenerate-diagnose-null-arm-hygiene.mjs'

const root = join(fileURLToPath(import.meta.url), '..', '..')
const agentTestBin = join(root, 'node_modules', '.bin', 'agent-test')
const evalReportsRoot = join(root, '_agent', 'eval-reports')

const DIAGNOSE_SUITE_NAMES = {
  outcomesSuite: DIAGNOSE_OUTCOMES_SUITE,
  transferSuite: DIAGNOSE_TRANSFER_SUITE,
  promptSuite: DIAGNOSE_PROMPT_SUITE,
}

const PRIMARY_COMPARE_ID = 'no-repro-refuse'

function parseArgs(argv) {
  const out = {
    doctor: false,
    ablations: false,
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
    else if (arg === '--ablations') out.ablations = true
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

/** Minimal B-side so compare-pairs can dump outcomes.suite-report without a second live suite. */
async function writePlaceholderNullReport(path) {
  const report = {
    suite: 'placeholder-null',
    host: 'cursor',
    passed: 0,
    skipped: 2,
    failed: 0,
    results: [
      {
        suite: 'placeholder-null',
        scenario: 'transfer: session hunch A',
        compareId: 'no-repro-refuse',
        passed: false,
        skipped: true,
        failures: [],
        durationMs: 0,
      },
      {
        suite: 'placeholder-null',
        scenario: 'transfer: session hunch B',
        compareId: 'loop-before-cause',
        passed: false,
        skipped: true,
        failures: [],
        durationMs: 0,
      },
    ],
    summary: {},
  }
  await writeFile(path, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
}

async function resolveCompareInputs({ compareOnly, debugParent }) {
  if (!compareOnly) return null

  const latest = await findLatestSuiteReports(evalReportsRoot, DIAGNOSE_SUITE_NAMES)
  if (latest) {
    return {
      a: latest.paths.suiteReports.outcomes,
      b: latest.paths.suiteReports.transfer,
    }
  }

  const sessionsParent = join(debugParent, 'sessions')
  const paritySession = await findParitySession(sessionsParent, DIAGNOSE_SUITE_NAMES)
  if (paritySession) {
    const sessionCompare = compareReportPaths(
      join(paritySession.path, 'compare'),
      DIAGNOSE_SUITE_NAMES,
    )
    return {
      a: sessionCompare.suiteReports.outcomes,
      b: sessionCompare.suiteReports.transfer,
      paritySession: paritySession.path,
    }
  }

  console.error(
    'compare-only needs suite-report JSON from a prior diagnose parity run under _agent/eval-reports/diagnose-<id>/',
  )
  process.exit(1)
}

async function summarizeD1FromSessions(sessionPaths) {
  const rows = []
  for (const sessionRoot of sessionPaths.filter(Boolean)) {
    rows.push(...(await collectResults(sessionRoot)).values())
  }
  const d1 = rows.filter((r) => r.compareId === PRIMARY_COMPARE_ID)
  return {
    full: d1.filter((r) => r.suite === DIAGNOSE_OUTCOMES_SUITE),
    none: d1.filter((r) => r.suite === DIAGNOSE_TRANSFER_SUITE),
    prompt: d1.filter((r) => r.suite === DIAGNOSE_PROMPT_SUITE),
  }
}

async function runSingleParity(
  args,
  { runId, debugParent, runReportDir, repeatIndex, repeatTotal, seedPath },
) {
  const sessionsParent = join(debugParent, 'sessions')
  const reportPaths = compareReportPaths(runReportDir, DIAGNOSE_SUITE_NAMES)
  const manifestDir = join(root, '_agent', 'evidence-runs', runId)
  await mkdir(manifestDir, { recursive: true })
  await mkdir(runReportDir, { recursive: true })

  const manifest = {
    startedAt: new Date().toISOString(),
    repeatIndex,
    repeatTotal,
    debugParent,
    comparePair: DIAGNOSE_PARITY_COMPARE_PAIR,
    promptComparePair: args.prompt ? DIAGNOSE_PROMPT_COMPARE_PAIR : null,
    callerPark: true,
    seedPath,
    model: {
      agent: process.env.CURSOR_AGENT_MODEL ?? null,
      judge: process.env.CURSOR_JUDGE_MODEL ?? null,
    },
    sessions: {},
    report: null,
    proposals: [],
    failures: 0,
    d1: null,
  }

  const knownSessions = new Set()
  let parkHandle = null

  if (!args.compareOnly) {
    syncSkills()

    const liveBase = ['--live', '--debug', '--debug-dir', debugParent, ...args.agentArgs]

    const placeholderPath = join(runReportDir, '_placeholder-null.suite-report.json')
    await writePlaceholderNullReport(placeholderPath)
    const outcomesStaging = join(runReportDir, 'outcomes-staging')
    await mkdir(outcomesStaging, { recursive: true })

    run(
      'diagnose-outcomes (skill-on, answer keys present)',
      [
        '--suites-dir',
        'agent-suites',
        ...liveBase,
        '--compare-pairs',
        `${DIAGNOSE_OUTCOMES_SUITE}:${placeholderPath}`,
        '--compare-out',
        outcomesStaging,
      ],
      { allowFail: true },
    )

    const outcomesReportSrc = join(outcomesStaging, `${DIAGNOSE_OUTCOMES_SUITE}.suite-report.json`)
    if (!existsSync(outcomesReportSrc)) {
      console.error(`Missing outcomes suite report at ${outcomesReportSrc}`)
      process.exit(1)
    }
    await copyFile(outcomesReportSrc, reportPaths.suiteReports.outcomes)

    const outcomesSession = await newestSessionAfter(sessionsParent, knownSessions)
    if (!outcomesSession) {
      console.error('No session directory found after diagnose-outcomes run')
      process.exit(1)
    }
    knownSessions.add(outcomesSession.path)
    manifest.sessions.outcomes = outcomesSession.path

    // Park first so open-tree Shell forage cannot see answer keys; materialize
    // suite defs for the harness from the parked copies into `_agent/null-arm-suites/`.
    let transferMat
    let promptMat = null
    try {
      console.log('\n▶ park diagnose answer keys off open tree (null-arm forage guard)')
      parkHandle = parkDiagnoseAnswerKeys(root, { parkId: `diagnose-park-${runId}` })
      console.log(`  parked ${parkHandle.moved.length} path(s) → ${parkHandle.parkRoot}`)
      manifest.callerParkRoot = parkHandle.parkRoot
      manifest.callerParkCount = parkHandle.moved.length

      console.log('\n▶ commit park deletions (block git show HEAD|main|origin/main)')
      const parkGit = commitDiagnoseParkToGit(root, parkHandle)
      manifest.callerParkCommit = parkGit.parkCommit
      console.log(`  park commit ${parkGit.parkCommit}`)

      const transferKey = 'agent-suites/diagnose-transfer/scenarios.json'
      const promptKey = 'agent-suites/diagnose-prompt/scenarios.json'
      const transferBuf = parkHandle.files.get(transferKey)
      if (!transferBuf) {
        throw new Error('park missed agent-suites/diagnose-transfer/scenarios.json')
      }
      // HEAD already lacks answer keys — no seedPatch. Scrub judge from on-disk suite.
      transferMat = materializeNullArmSuite(root, DIAGNOSE_TRANSFER_SUITE, null, {
        scenariosJson: transferBuf,
        omitSeed: true,
      })
      if (args.prompt) {
        const promptBuf = parkHandle.files.get(promptKey)
        if (!promptBuf) throw new Error('park missed agent-suites/diagnose-prompt/scenarios.json')
        promptMat = materializeNullArmSuite(root, DIAGNOSE_PROMPT_SUITE, null, {
          scenariosJson: promptBuf,
          omitSeed: true,
        })
      }

      const transferStaging = join(runReportDir, 'transfer-staging')
      await mkdir(transferStaging, { recursive: true })
      run(
        'diagnose-transfer (null arm, caller keys parked)',
        [
          '--suites-dir',
          transferMat.suitesDirArg,
          ...liveBase,
          '--compare-pairs',
          `${reportPaths.suiteReports.outcomes}:${DIAGNOSE_TRANSFER_SUITE}`,
          '--compare-out',
          transferStaging,
        ],
        { allowFail: true },
      )

      const transferReportSrc = join(
        transferStaging,
        `${DIAGNOSE_TRANSFER_SUITE}.suite-report.json`,
      )
      if (existsSync(transferReportSrc)) {
        await copyFile(transferReportSrc, reportPaths.suiteReports.transfer)
      }
      // Prefer the transfer-side compare artifact as the canonical full-vs-none report.
      for (const name of ['compare-report.html', 'compare-report.md', 'compare-report.json']) {
        const src = join(transferStaging, name)
        if (existsSync(src)) await copyFile(src, join(runReportDir, name))
      }

      const transferSession = await newestSessionAfter(sessionsParent, knownSessions)
      if (transferSession) {
        knownSessions.add(transferSession.path)
        manifest.sessions.transfer = transferSession.path
        manifest.sessions.parity = transferSession.path
      }

      if (args.prompt && promptMat) {
        const promptCompareDir = join(runReportDir, 'prompt-compare')
        await mkdir(promptCompareDir, { recursive: true })
        run(
          'diagnose-prompt (prompt baseline, caller keys parked)',
          [
            '--suites-dir',
            promptMat.suitesDirArg,
            ...liveBase,
            '--compare-pairs',
            `${reportPaths.suiteReports.outcomes}:${DIAGNOSE_PROMPT_SUITE}`,
            '--compare-out',
            promptCompareDir,
          ],
          { allowFail: true },
        )
        const promptReportSrc = join(promptCompareDir, `${DIAGNOSE_PROMPT_SUITE}.suite-report.json`)
        if (existsSync(promptReportSrc)) {
          await copyFile(promptReportSrc, reportPaths.suiteReports.prompt)
        }
        const promptSession = await newestSessionAfter(sessionsParent, knownSessions)
        if (promptSession) {
          knownSessions.add(promptSession.path)
          manifest.sessions.prompt = promptSession.path
        }
        manifest.promptCompare = join(promptCompareDir, 'compare-report.html')
        manifest.promptCompareMd = join(promptCompareDir, 'compare-report.md')
        manifest.promptCompareJson = join(promptCompareDir, 'compare-report.json')
      }

      if (args.ablations) {
        // Ablations need skill trees; restore briefly (no more null-arm work follows).
        restoreDiagnoseParkGit(root, parkHandle)
        restoreDiagnoseAnswerKeys(root, parkHandle)
        parkHandle = null
        syncSkills()
        run(
          'organization-ablations',
          ['--suites-dir', 'agent-suites', ...liveBase, '--suite', 'organization-ablations'],
          { allowFail: true },
        )
        const ablationSession = await newestSessionAfter(sessionsParent, knownSessions)
        if (ablationSession) {
          knownSessions.add(ablationSession.path)
          manifest.sessions.ablations = ablationSession.path
        }
      }
    } finally {
      if (parkHandle) {
        console.log('\n▶ restore diagnose git refs + answer keys to open tree')
        try {
          restoreDiagnoseParkGit(root, parkHandle)
        } catch (err) {
          console.error(
            `restoreDiagnoseParkGit failed: ${err instanceof Error ? err.message : err}`,
          )
        }
        restoreDiagnoseAnswerKeys(root, parkHandle)
        parkHandle = null
        syncSkills()
      }
    }
  } else {
    const compareInputs = await resolveCompareInputs({
      compareOnly: true,
      debugParent,
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

  if (
    !existsSync(reportPaths.json) &&
    existsSync(reportPaths.suiteReports.outcomes) &&
    existsSync(reportPaths.suiteReports.transfer)
  ) {
    run(
      'agent-test compare (full vs none)',
      [
        '--suites-dir',
        'agent-suites',
        'compare',
        '--a',
        reportPaths.suiteReports.outcomes,
        '--b',
        reportPaths.suiteReports.transfer,
        '--compare-out',
        runReportDir,
      ],
      { allowFail: true },
    )
  }

  const paritySession =
    manifest.sessions.parity ??
    manifest.sessions.transfer ??
    (await findParitySession(sessionsParent, DIAGNOSE_SUITE_NAMES))?.path ??
    null
  if (paritySession) {
    manifest.sessions.parity = paritySession
  }

  const compareReport = existsSync(reportPaths.json)
    ? await readCompareReportJson(reportPaths.json)
    : { summary: {} }
  manifest.report = reportPaths.html
  manifest.reportMd = reportPaths.md
  manifest.reportJson = reportPaths.json
  manifest.suiteReports = reportPaths.suiteReports
  manifest.cost = costFromCompareReport(compareReport)
  console.log(`\nCompare report (HTML): ${reportPaths.html}`)
  console.log(`Compare report (MD): ${reportPaths.md}`)
  console.log(`Paired scenarios: ${compareReport.summary?.pairedCount ?? 0}`)

  if (paritySession || manifest.sessions.outcomes) {
    const d1Rows = await summarizeD1FromSessions([
      manifest.sessions.outcomes,
      manifest.sessions.transfer,
      paritySession,
      manifest.sessions.prompt,
    ])
    const fullPass = d1Rows.full.length > 0 && d1Rows.full.every((r) => r.pass && !r.skipped)
    const nonePass = d1Rows.none.length > 0 && d1Rows.none.every((r) => r.pass && !r.skipped)
    const promptPass = d1Rows.prompt.length > 0 && d1Rows.prompt.every((r) => r.pass && !r.skipped)
    const noneForensics = await summarizeD1NoneForensics(d1Rows.none)
    manifest.d1 = {
      fullPass,
      nonePass,
      promptPass,
      full: d1Rows.full,
      none: d1Rows.none,
      prompt: d1Rows.prompt,
      noneForensics,
    }
  }

  if (args.propose && (paritySession || manifest.sessions.outcomes)) {
    const debugDirs = new Set()
    for (const sessionPath of [
      manifest.sessions.outcomes,
      manifest.sessions.transfer,
      paritySession,
      manifest.sessions.prompt,
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

  manifest.failures = 0
  for (const sessionPath of [
    manifest.sessions.outcomes,
    manifest.sessions.transfer,
    paritySession,
    manifest.sessions.prompt,
    manifest.sessions.ablations,
  ]) {
    if (!sessionPath) continue
    manifest.failures += (await findFailedDebugBundles(sessionPath)).length
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
    console.log(`Usage: npm run agent:test:diagnose-evidence-parity [-- flags]

Automates: diagnose-outcomes → park caller keys → transfer/prompt → restore + compare + propose.
Requires CURSOR_API_KEY in the environment (source .env first).
Independent of investigate evidence-parity — does not run investigate suites.

Flags:
  --doctor          agent-test --doctor preflight
  --no-prompt       skip diagnose-prompt baseline arm
  --ablations       also run organization-ablations
  --no-propose      skip evolution-note autofill
  --repeats N       run parity cadence N times (default 1)
  --compare-only    re-render compare from prior suite-report JSON (no live runs)
  --debug-dir PATH  staging parent (default: $TMPDIR/toolbox-diagnose-evidence-<ts>)`)
    process.exit(0)
  }

  if (!process.env.CURSOR_API_KEY && !args.compareOnly) {
    console.error('CURSOR_API_KEY is not set. Run: set -a && source .env && set +a')
    process.exit(1)
  }

  const batchId = `diagnose-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`
  const debugParent = args.debugDir || join(tmpdir(), `toolbox-diagnose-evidence-${batchId}`)
  const runManifests = []
  let totalFailures = 0

  if (args.doctor) {
    run('agent-test --doctor', ['--doctor', '--suites-dir', 'agent-suites'])
  }

  let seedPath = join(root, '_agent', 'diagnose-null-arm-hygiene.patch')
  if (!args.compareOnly) {
    // Outside the open tree so parked/null arms cannot forage deleted hunk text via _agent/.
    seedPath = join(tmpdir(), `toolbox-diagnose-null-arm-hygiene-${batchId}.patch`)
    console.log('\n▶ regenerate null-arm hygiene seed (tmpdir, outside open tree)')
    const seed = regenerateDiagnoseNullArmHygieneSeed({ outPath: seedPath })
    console.log(`  ${seed.out} (${seed.pathCount} files, ${seed.bytes} bytes)`)
  }

  for (let i = 0; i < args.repeats; i++) {
    const runId = args.repeats > 1 ? `${batchId}-r${String(i + 1).padStart(2, '0')}` : batchId
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
      seedPath,
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
      primaryClaim: PRIMARY_COMPARE_ID,
      d1Aggregate: aggregateBatchD1(runManifests),
      decisionHint: null,
      runs: runManifests.map((m, idx) => ({
        repeat: idx + 1,
        runId: args.repeats > 1 ? `${batchId}-r${String(idx + 1).padStart(2, '0')}` : batchId,
        evalReport: m.report,
        promptCompare: m.promptCompare ?? null,
        d1: m.d1,
      })),
    }
    const agg = batchManifest.d1Aggregate
    const promptMatchesFull = runManifests.every((m) => m.d1?.fullPass === m.d1?.promptPass)
    const noneRows = runManifests.flatMap((m) => m.d1?.none ?? [])
    const noneForensics = await summarizeD1NoneForensics(noneRows)
    const disposition = decideDiagnoseD1Disposition({
      ...agg,
      promptMatchesFull,
      noneForensics,
    })
    batchManifest.decisionHint = disposition.decisionHint
    batchManifest.claimReady = disposition.claimReady
    batchManifest.decisionRationale = disposition.rationale
    batchManifest.promptMatchesFull = promptMatchesFull
    batchManifest.noneForensics = noneForensics
    const batchPath = join(batchDir, 'batch-manifest.json')
    await writeFile(batchPath, JSON.stringify(batchManifest, null, 2) + '\n', 'utf8')
    console.log(`\nBatch manifest: ${batchPath}`)
    console.log(
      `D1 aggregate: full wins=${agg.d1FullWins}, none wins=${agg.d1NoneWins}, ties=${agg.d1Ties}`,
    )
    console.log(
      `D1 none forensics: invent=${noneForensics.inventFails}, forage=${noneForensics.forageFails}, refuse=${noneForensics.refusePasses}`,
    )
    console.log(`Decision hint: ${batchManifest.decisionHint} (${disposition.rationale})`)
  }

  console.log(`Debug staging: ${debugParent}`)

  if (totalFailures > 0) {
    console.log(
      `\n⚠ ${totalFailures} failed scenario bundle(s) across repeats — triage proposals under _agent/skill-evolution/`,
    )
    process.exit(1)
  }
  console.log('\n✓ Diagnose evidence parity run complete (no failures)')
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
