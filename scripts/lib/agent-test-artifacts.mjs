import { access, readdir, readFile, stat } from 'node:fs/promises'
import { basename, join } from 'node:path'

export const PARITY_COMPARE_PAIR = 'investigate-outcomes:investigate-transfer'
export const PROMPT_COMPARE_PAIR = 'investigate-outcomes:investigate-prompt'
export const OUTCOMES_SUITE = 'investigate-outcomes'
export const TRANSFER_SUITE = 'investigate-transfer'
export const PROMPT_SUITE = 'investigate-prompt'

/** Paths agent-test writes under a compare-out directory. */
export function compareReportPaths(outDir) {
  return {
    html: join(outDir, 'compare-report.html'),
    md: join(outDir, 'compare-report.md'),
    json: join(outDir, 'compare-report.json'),
    suiteReports: {
      outcomes: join(outDir, `${OUTCOMES_SUITE}.suite-report.json`),
      transfer: join(outDir, `${TRANSFER_SUITE}.suite-report.json`),
      prompt: join(outDir, `${PROMPT_SUITE}.suite-report.json`),
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
    deltaTokens:
      outcomesCount > 0 && transferCount > 0 ? transferSum - outcomesSum : null,
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

/** Newest session containing both investigate-outcomes and investigate-transfer debug trees. */
export async function findParitySession(sessionsParent) {
  const sessions = await listSessionDirs(sessionsParent)
  for (let i = sessions.length - 1; i >= 0; i--) {
    const session = sessions[i]
    const hasOutcomes = await pathExists(join(session.path, OUTCOMES_SUITE))
    const hasTransfer = await pathExists(join(session.path, TRANSFER_SUITE))
    if (hasOutcomes && hasTransfer) return session
  }
  return sessions.at(-1) ?? null
}

/** Newest eval-reports run dir that already has suite-report JSON dumps. */
export async function findLatestSuiteReports(evalReportsRoot) {
  const runs = await listSessionDirs(evalReportsRoot)
  for (let i = runs.length - 1; i >= 0; i--) {
    const paths = compareReportPaths(runs[i].path)
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
              raw.scenarioName ??
              raw.scenario ??
              raw.name ??
              basename(full).replace(/\.debug$/, '')
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

export function aggregateBatchC1(runManifests) {
  const c1FullWins = runManifests.filter((m) => m.c1?.fullPass && !m.c1?.nonePass).length
  const c1NoneWins = runManifests.filter((m) => m.c1?.nonePass && !m.c1?.fullPass).length
  const c1Ties = runManifests.filter((m) => m.c1?.fullPass === m.c1?.nonePass).length
  const c1PromptBeatsFull = runManifests.filter(
    (m) => m.c1?.promptPass && !m.c1?.fullPass,
  ).length
  const c1FullBeatsPrompt = runManifests.filter(
    (m) => m.c1?.fullPass && !m.c1?.promptPass,
  ).length
  return { c1FullWins, c1NoneWins, c1Ties, c1PromptBeatsFull, c1FullBeatsPrompt, runs: runManifests.length }
}
