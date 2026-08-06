import { access, readdir, readFile, stat } from 'node:fs/promises'
import { basename, join } from 'node:path'

export const PARITY_COMPARE_PAIR = 'probe-evidence-outcomes:probe-evidence-transfer'
export const PROMPT_COMPARE_PAIR = 'probe-evidence-outcomes:probe-evidence-prompt'
export const OUTCOMES_SUITE = 'probe-evidence-outcomes'
export const TRANSFER_SUITE = 'probe-evidence-transfer'
export const PROMPT_SUITE = 'probe-evidence-prompt'

export const DIAGNOSE_PARITY_COMPARE_PAIR = 'probe-fix-outcomes:probe-fix-transfer'
export const DIAGNOSE_PROMPT_COMPARE_PAIR = 'probe-fix-outcomes:probe-fix-prompt'
export const DIAGNOSE_OUTCOMES_SUITE = 'probe-fix-outcomes'
export const DIAGNOSE_TRANSFER_SUITE = 'probe-fix-transfer'
export const DIAGNOSE_PROMPT_SUITE = 'probe-fix-prompt'

const DEFAULT_SUITE_NAMES = {
  outcomesSuite: OUTCOMES_SUITE,
  transferSuite: TRANSFER_SUITE,
  promptSuite: PROMPT_SUITE,
}

/** Paths agent-test writes under a compare-out directory. */
export function compareReportPaths(outDir, suiteNames = {}) {
  const {
    outcomesSuite = DEFAULT_SUITE_NAMES.outcomesSuite,
    transferSuite = DEFAULT_SUITE_NAMES.transferSuite,
    promptSuite = DEFAULT_SUITE_NAMES.promptSuite,
  } = suiteNames
  return {
    html: join(outDir, 'compare-report.html'),
    md: join(outDir, 'compare-report.md'),
    json: join(outDir, 'compare-report.json'),
    suiteReports: {
      outcomes: join(outDir, `${outcomesSuite}.suite-report.json`),
      transfer: join(outDir, `${transferSuite}.suite-report.json`),
      prompt: join(outDir, `${promptSuite}.suite-report.json`),
    },
  }
}

/** Summarize paired token usage from a SuiteCompareReport JSON object. */
export function costFromCompareReport(report) {
  let outcomesSum = 0
  let outcomesCount = 0
  let transferSum = 0
  let transferCount = 0
  for (const row of report.paired ?? []) {
    if (row.a?.totalTokens != null) {
      outcomesSum += row.a.totalTokens
      outcomesCount++
    }
    if (row.b?.totalTokens != null) {
      transferSum += row.b.totalTokens
      transferCount++
    }
  }
  return {
    full: {
      totalTokens: outcomesCount > 0 ? outcomesSum : null,
      scenarioCount: outcomesCount,
    },
    none: {
      totalTokens: transferCount > 0 ? transferSum : null,
      scenarioCount: transferCount,
    },
    deltaTokens: outcomesCount > 0 && transferCount > 0 ? transferSum - outcomesSum : null,
  }
}

async function pathExists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

export async function listSessionDirs(sessionsParent) {
  let entries
  try {
    entries = await readdir(sessionsParent, { withFileTypes: true })
  } catch {
    return []
  }
  const rows = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const full = join(sessionsParent, entry.name)
    const st = await stat(full)
    rows.push({ name: entry.name, path: full, mtimeMs: st.mtimeMs })
  }
  return rows.sort((a, b) => a.mtimeMs - b.mtimeMs)
}

export async function newestSessionAfter(sessionsParent, known = new Set()) {
  const sessions = await listSessionDirs(sessionsParent)
  const fresh = sessions.filter((s) => !known.has(s.path))
  return fresh.at(-1) ?? null
}

/**
 * Newest session containing both outcomes and transfer debug trees.
 * Defaults to investigate suite names; pass diagnose suites for diagnose parity.
 */
export async function findParitySession(
  sessionsParent,
  { outcomesSuite = OUTCOMES_SUITE, transferSuite = TRANSFER_SUITE } = {},
) {
  const sessions = await listSessionDirs(sessionsParent)
  for (let i = sessions.length - 1; i >= 0; i--) {
    const session = sessions[i]
    const hasOutcomes = await pathExists(join(session.path, outcomesSuite))
    const hasTransfer = await pathExists(join(session.path, transferSuite))
    if (hasOutcomes && hasTransfer) return session
  }
  return sessions.at(-1) ?? null
}

/** Newest eval-reports run dir that already has suite-report JSON dumps. */
export async function findLatestSuiteReports(evalReportsRoot, suiteNames = {}) {
  const runs = await listSessionDirs(evalReportsRoot)
  for (let i = runs.length - 1; i >= 0; i--) {
    const paths = compareReportPaths(runs[i].path, suiteNames)
    if (
      (await pathExists(paths.suiteReports.outcomes)) &&
      (await pathExists(paths.suiteReports.transfer))
    ) {
      return { outDir: runs[i].path, paths }
    }
  }
  return null
}

export async function collectResults(sessionRoot) {
  const rows = new Map()

  async function walk(dir) {
    let entries
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name.endsWith('.debug')) {
          const resultPath = join(full, 'result.json')
          try {
            const raw = JSON.parse(await readFile(resultPath, 'utf8'))
            const scenario =
              raw.scenarioName ?? raw.scenario ?? raw.name ?? basename(full).replace(/\.debug$/, '')
            const suite = raw.suiteName ?? raw.suite ?? basename(join(full, '..'))
            const compareId = raw.compareId ?? null
            let category = ''
            let failed = false
            try {
              const failuresRaw = JSON.parse(await readFile(join(full, 'failures.json'), 'utf8'))
              const failures = Array.isArray(failuresRaw)
                ? failuresRaw
                : (failuresRaw?.failures ?? [])
              const first = failures[0]
              category = first?.category ?? first?.type ?? ''
              failed = failures.length > 0
            } catch {
              /* optional */
            }
            const pass = Boolean(raw.pass ?? raw.passed)
            const key = `${suite}::${scenario}`
            rows.set(key, {
              suite,
              scenario,
              compareId,
              pass,
              skipped: Boolean(raw.skipped),
              durationMs: raw.durationMs ?? raw.duration ?? null,
              usage: raw.usage ?? null,
              agentUsage: raw.agentUsage ?? raw.usage?.agent ?? null,
              judgeUsage: raw.judgeUsage ?? raw.usage?.judge ?? null,
              category,
              debugDir: full,
              failed: failed || !pass,
            })
          } catch {
            /* no result.json */
          }
        } else {
          await walk(full)
        }
      }
    }
  }

  await walk(sessionRoot)
  return rows
}

export async function findFailedDebugBundles(sessionRoot) {
  const rows = await collectResults(sessionRoot)
  return [...rows.values()].filter((r) => r.failed && r.debugDir).map((r) => r.debugDir)
}

export async function readCompareReportJson(jsonPath) {
  return JSON.parse(await readFile(jsonPath, 'utf8'))
}

/** Aggregate primary-claim wins across batch manifests (`c1` or `d1`). */
export function aggregateBatchPrimaryClaim(runManifests, claimKey = 'c1') {
  const claim = (m) => m[claimKey]
  const fullWins = runManifests.filter((m) => claim(m)?.fullPass && !claim(m)?.nonePass).length
  const noneWins = runManifests.filter((m) => claim(m)?.nonePass && !claim(m)?.fullPass).length
  const ties = runManifests.filter((m) => claim(m)?.fullPass === claim(m)?.nonePass).length
  const promptBeatsFull = runManifests.filter(
    (m) => claim(m)?.promptPass && !claim(m)?.fullPass,
  ).length
  const fullBeatsPrompt = runManifests.filter(
    (m) => claim(m)?.fullPass && !claim(m)?.promptPass,
  ).length
  return {
    [`${claimKey}FullWins`]: fullWins,
    [`${claimKey}NoneWins`]: noneWins,
    [`${claimKey}Ties`]: ties,
    [`${claimKey}PromptBeatsFull`]: promptBeatsFull,
    [`${claimKey}FullBeatsPrompt`]: fullBeatsPrompt,
    runs: runManifests.length,
  }
}

export function aggregateBatchC1(runManifests) {
  return aggregateBatchPrimaryClaim(runManifests, 'c1')
}

export function aggregateBatchD1(runManifests) {
  return aggregateBatchPrimaryClaim(runManifests, 'd1')
}
