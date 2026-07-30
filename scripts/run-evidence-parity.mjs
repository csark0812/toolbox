#!/usr/bin/env node
/**
 * Investigate evidence-parity cadence:
 *   sync skills → live investigate-outcomes
 *   → park answer keys on open tree → materialize null suites
 *   → live investigate-transfer (+ prompt) → restore → offline compare → propose notes
 *
 * Caller park is required: live Cursor Shell often targets the IDE-open root,
 * not the seeded worktree — worktree-only deletes do not stop forage.
 * After park-commit, null arms get guard-only debug-app seeds only (no
 * answer-bearing hygiene patch in the agent-visible tree).
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
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  PARITY_COMPARE_PAIR,
  PROMPT_COMPARE_PAIR,
  OUTCOMES_SUITE,
  TRANSFER_SUITE,
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
import {
  INVESTIGATE_GUARD_ONLY_SEEDS,
  parkInvestigateAnswerKeys,
  restoreInvestigateAnswerKeys,
  commitInvestigateParkToGit,
  restoreInvestigateParkGit,
} from './lib/investigate-caller-park.mjs'
import { materializeNullArmSuite } from './lib/null-arm-suites.mjs'
import { proposeFromDebugDir } from './lib/propose-skill-evolution-core.mjs'
import { regenerateInvestigateNullArmHygieneSeed } from './regenerate-investigate-null-arm-hygiene.mjs'

const root = join(fileURLToPath(import.meta.url), '..', '..')
const agentTestBin = join(root, 'node_modules', '.bin', 'agent-test')
const evalReportsRoot = join(root, '_agent', 'eval-reports')

const INVESTIGATE_SUITE_NAMES = {
  outcomesSuite: OUTCOMES_SUITE,
  transferSuite: TRANSFER_SUITE,
  promptSuite: PROMPT_SUITE,
}

const PRIMARY_COMPARE_ID = 'fix-invention-pressure'
const FIXTURE_SEEDS_DIR = join(root, '_agent', 'investigate-fixture-seeds')

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

/**
 * Write guard-only seeds from parked bytes (or open tree) under `_agent/`.
 * These patches plant the discriminating bug only — no answer-key hunks.
 * @param {Map<string, Buffer>} [parkedFiles]
 * @returns {Record<string, string>} compareId → relative seed path
 */
function materializeGuardOnlySeeds(parkedFiles) {
  mkdirSync(FIXTURE_SEEDS_DIR, { recursive: true })
  /** @type {Record<string, string>} */
  const byCompareId = {}
  for (const [compareId, rel] of Object.entries(INVESTIGATE_GUARD_ONLY_SEEDS)) {
    const base = rel.split('/').pop()
    const outRel = `_agent/investigate-fixture-seeds/${base}`
    const outAbs = join(root, outRel)
    const body = parkedFiles?.get(rel)
    if (body) {
      writeFileSync(outAbs, body)
    } else if (existsSync(join(root, rel))) {
      writeFileSync(outAbs, readFileSync(join(root, rel)))
    } else {
      throw new Error(`Missing guard-only seed for ${compareId}: ${rel}`)
    }
    byCompareId[compareId] = outRel
  }
  return byCompareId
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
        compareId: 'leave-redirect-red-herring',
        passed: false,
        skipped: true,
        failures: [],
        durationMs: 0,
      },
      {
        suite: 'placeholder-null',
        scenario: 'transfer: session hunch B',
        compareId: 'fix-invention-pressure',
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

  const latest = await findLatestSuiteReports(evalReportsRoot, INVESTIGATE_SUITE_NAMES)
  if (latest) {
    return {
      a: latest.paths.suiteReports.outcomes,
      b: latest.paths.suiteReports.transfer,
    }
  }

  const sessionsParent = join(debugParent, 'sessions')
  const paritySession = await findParitySession(sessionsParent, INVESTIGATE_SUITE_NAMES)
  if (paritySession) {
    const sessionCompare = compareReportPaths(
      join(paritySession.path, 'compare'),
      INVESTIGATE_SUITE_NAMES,
    )
    return {
      a: sessionCompare.suiteReports.outcomes,
      b: sessionCompare.suiteReports.transfer,
      paritySession: paritySession.path,
    }
  }

  console.error(
    'compare-only needs suite-report JSON from a prior parity run under _agent/eval-reports/<id>/',
  )
  process.exit(1)
}

async function summarizeC1FromSessions(sessionPaths) {
  const rows = []
  for (const sessionRoot of sessionPaths.filter(Boolean)) {
    rows.push(...(await collectResults(sessionRoot)).values())
  }
  const c1 = rows.filter((r) => r.compareId === PRIMARY_COMPARE_ID)
  return {
    full: c1.filter((r) => r.suite === OUTCOMES_SUITE),
    none: c1.filter((r) => r.suite === TRANSFER_SUITE),
    prompt: c1.filter((r) => r.suite === PROMPT_SUITE),
  }
}

async function runSingleParity(
  args,
  { runId, debugParent, runReportDir, repeatIndex, repeatTotal, seedPath },
) {
  const sessionsParent = join(debugParent, 'sessions')
  const reportPaths = compareReportPaths(runReportDir, INVESTIGATE_SUITE_NAMES)
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
    c1: null,
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
      'investigate-outcomes (skill-on, answer keys present)',
      [
        '--suites-dir',
        'agent-suites',
        ...liveBase,
        '--compare-pairs',
        `${OUTCOMES_SUITE}:${placeholderPath}`,
        '--compare-out',
        outcomesStaging,
      ],
      { allowFail: true },
    )

    const outcomesReportSrc = join(outcomesStaging, `${OUTCOMES_SUITE}.suite-report.json`)
    if (!existsSync(outcomesReportSrc)) {
      console.error(`Missing outcomes suite report at ${outcomesReportSrc}`)
      process.exit(1)
    }
    await copyFile(outcomesReportSrc, reportPaths.suiteReports.outcomes)

    const outcomesSession = await newestSessionAfter(sessionsParent, knownSessions)
    if (!outcomesSession) {
      console.error('No session directory found after investigate-outcomes run')
      process.exit(1)
    }
    knownSessions.add(outcomesSession.path)
    manifest.sessions.outcomes = outcomesSession.path

    try {
      console.log('\n▶ park investigate answer keys off open tree (null-arm forage guard)')
      parkHandle = parkInvestigateAnswerKeys(root, { parkId: `investigate-park-${runId}` })
      console.log(`  parked ${parkHandle.moved.length} path(s) → ${parkHandle.parkRoot}`)
      manifest.callerParkRoot = parkHandle.parkRoot
      manifest.callerParkCount = parkHandle.moved.length

      console.log('\n▶ commit park deletions (block git show HEAD|main|origin/main)')
      const parkGit = commitInvestigateParkToGit(root, parkHandle)
      manifest.callerParkCommit = parkGit.parkCommit
      console.log(`  park commit ${parkGit.parkCommit}`)

      const seedByCompareId = materializeGuardOnlySeeds(parkHandle.files)
      manifest.guardOnlySeeds = seedByCompareId

      const transferKey = 'agent-suites/investigate-transfer/scenarios.json'
      const promptKey = 'agent-suites/investigate-prompt/scenarios.json'
      const transferBuf = parkHandle.files.get(transferKey)
      if (!transferBuf) {
        throw new Error('park missed agent-suites/investigate-transfer/scenarios.json')
      }
      // HEAD already lacks answer keys — guard-only seeds only (no answer-bearing patch).
      const transferMat = materializeNullArmSuite(root, TRANSFER_SUITE, null, {
        scenariosJson: transferBuf,
        seedPatchByCompareId: seedByCompareId,
      })
      let promptMat = null
      if (args.prompt) {
        const promptBuf = parkHandle.files.get(promptKey)
        if (!promptBuf)
          throw new Error('park missed agent-suites/investigate-prompt/scenarios.json')
        promptMat = materializeNullArmSuite(root, PROMPT_SUITE, null, {
          scenariosJson: promptBuf,
          seedPatchByCompareId: seedByCompareId,
        })
      }

      const transferStaging = join(runReportDir, 'transfer-staging')
      await mkdir(transferStaging, { recursive: true })
      run(
        'investigate-transfer (null arm, caller keys parked)',
        [
          '--suites-dir',
          transferMat.suitesDirArg,
          ...liveBase,
          '--compare-pairs',
          `${reportPaths.suiteReports.outcomes}:${TRANSFER_SUITE}`,
          '--compare-out',
          transferStaging,
        ],
        { allowFail: true },
      )

      const transferReportSrc = join(transferStaging, `${TRANSFER_SUITE}.suite-report.json`)
      if (existsSync(transferReportSrc)) {
        await copyFile(transferReportSrc, reportPaths.suiteReports.transfer)
      }
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
          'investigate-prompt (prompt baseline, caller keys parked)',
          [
            '--suites-dir',
            promptMat.suitesDirArg,
            ...liveBase,
            '--compare-pairs',
            `${reportPaths.suiteReports.outcomes}:${PROMPT_SUITE}`,
            '--compare-out',
            promptCompareDir,
          ],
          { allowFail: true },
        )
        const promptReportSrc = join(promptCompareDir, `${PROMPT_SUITE}.suite-report.json`)
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

      if (args.diagnose || args.ablations) {
        // Later arms need skill trees / open-tree docs; restore before they run.
        restoreInvestigateParkGit(root, parkHandle)
        restoreInvestigateAnswerKeys(root, parkHandle)
        parkHandle = null
        syncSkills()

        if (args.diagnose) {
          run(
            'diagnose-outcomes (skills: full)',
            ['--suites-dir', 'agent-suites', ...liveBase, '--suite', 'diagnose-outcomes'],
            { allowFail: true },
          )
          const diagnoseSession = await newestSessionAfter(sessionsParent, knownSessions)
          if (diagnoseSession) {
            knownSessions.add(diagnoseSession.path)
            manifest.sessions.diagnose = diagnoseSession.path
          }
        }

        if (args.ablations) {
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
      }
    } finally {
      if (parkHandle) {
        console.log('\n▶ restore investigate git refs + answer keys to open tree')
        try {
          restoreInvestigateParkGit(root, parkHandle)
        } catch (err) {
          console.error(
            `restoreInvestigateParkGit failed: ${err instanceof Error ? err.message : err}`,
          )
        }
        restoreInvestigateAnswerKeys(root, parkHandle)
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
    (await findParitySession(sessionsParent, INVESTIGATE_SUITE_NAMES))?.path ??
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
    const c1Rows = await summarizeC1FromSessions([
      manifest.sessions.outcomes,
      manifest.sessions.transfer,
      paritySession,
      manifest.sessions.prompt,
    ])
    const fullPass = c1Rows.full.length > 0 && c1Rows.full.every((r) => r.pass && !r.skipped)
    const nonePass = c1Rows.none.length > 0 && c1Rows.none.every((r) => r.pass && !r.skipped)
    const promptPass = c1Rows.prompt.length > 0 && c1Rows.prompt.every((r) => r.pass && !r.skipped)
    manifest.c1 = {
      fullPass,
      nonePass,
      promptPass,
      full: c1Rows.full,
      none: c1Rows.none,
      prompt: c1Rows.prompt,
    }
  }

  if (args.propose && (paritySession || manifest.sessions.outcomes)) {
    const debugDirs = new Set()
    for (const sessionPath of [
      manifest.sessions.outcomes,
      manifest.sessions.transfer,
      paritySession,
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

  manifest.failures = 0
  for (const sessionPath of [
    manifest.sessions.outcomes,
    manifest.sessions.transfer,
    paritySession,
    manifest.sessions.prompt,
    manifest.sessions.diagnose,
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

async function preflightOpenTreeHealthy() {
  const skill = join(root, 'investigate', 'SKILL.md')
  if (!existsSync(skill)) {
    throw new Error(
      'investigate/SKILL.md missing — open tree looks mid-park; restore refs/files before re-running evidence-parity',
    )
  }
  try {
    const headMsg = spawnSync('git', ['log', '-1', '--pretty=%s'], {
      cwd: root,
      encoding: 'utf8',
    }).stdout.trim()
    if (/temporary investigate answer-key park/i.test(headMsg)) {
      throw new Error(
        'HEAD is an investigate park commit — restore main before re-running evidence-parity',
      )
    }
  } catch (err) {
    if (err instanceof Error && /park commit|SKILL/.test(err.message)) throw err
  }
}

async function main() {
  const args = parseArgs(process.argv)
  if (args.help) {
    console.log(`Usage: npm run agent:test:evidence-parity [-- flags]

Automates: investigate-outcomes → park caller keys → transfer/prompt → restore + compare + propose.
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

  if (!args.compareOnly) await preflightOpenTreeHealthy()

  const batchId = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const debugParent = args.debugDir || join(tmpdir(), `toolbox-evidence-${batchId}`)
  const runManifests = []
  let totalFailures = 0

  if (args.doctor) {
    run('agent-test --doctor', ['--doctor', '--suites-dir', 'agent-suites'])
  }

  let seedPath = join(root, '_agent', 'investigate-null-arm-hygiene.patch')
  if (!args.compareOnly) {
    // Outside the open tree so parked/null arms cannot forage deleted hunk text via _agent/.
    seedPath = join(tmpdir(), `toolbox-investigate-null-arm-hygiene-${batchId}.patch`)
    console.log('\n▶ regenerate null-arm hygiene seed (tmpdir, outside open tree)')
    const seed = regenerateInvestigateNullArmHygieneSeed({ outPath: seedPath })
    console.log(`  ${seed.out} (${seed.pathCount} files, ${seed.bytes} bytes)`)
    // Also refresh the conventional _agent/ path for suite JSON / offline checks —
    // live null arms do not apply this answer-bearing patch (park-commit + guard-only).
    regenerateInvestigateNullArmHygieneSeed({})
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
    const promptMatchesFull = runManifests.every((m) => m.c1?.fullPass === m.c1?.promptPass)
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
    console.log(
      `C1 aggregate: full wins=${agg.c1FullWins}, none wins=${agg.c1NoneWins}, ties=${agg.c1Ties}`,
    )
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
