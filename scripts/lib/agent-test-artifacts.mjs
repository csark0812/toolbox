import { readdir, readFile, stat } from 'node:fs/promises'
import { basename, join } from 'node:path'

/** Band-neutral key for full vs transfer arm comparison. */
export function normalizeScenarioName(name) {
  return name
    .replace(/^(outcome|transfer)[:-]\s*/i, '')
    .replace(/-[a-f0-9]{8}$/i, '')
    .replace(/-/g, ' ')
    .trim()
    .toLowerCase()
}

/** Total tokens from result row usage (agent + judge or total). */
export function totalTokensFromRow(row) {
  const usage = row?.usage
  if (usage?.total?.totalTokens != null) return usage.total.totalTokens
  const agent = row?.agentUsage?.totalTokens ?? usage?.agent?.totalTokens
  const judge = row?.judgeUsage?.totalTokens ?? usage?.judge?.totalTokens
  if (agent != null || judge != null) return (agent ?? 0) + (judge ?? 0)
  return null
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
              norm: compareId ?? normalizeScenarioName(scenario),
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

export function mergeRowsByKey(leftRows, rightRows, leftLabel, rightLabel) {
  const keys = new Set([...leftRows.keys(), ...rightRows.keys()])
  return [...keys].sort().map((key) => {
    const left = leftRows.get(key)
    const right = rightRows.get(key)
    const scenario = left?.scenario ?? right?.scenario ?? key.split('::')[1] ?? key
    const suite = left?.suite ?? right?.suite ?? key.split('::')[0] ?? ''
    return {
      suite,
      scenario,
      norm: normalizeScenarioName(scenario),
      [leftLabel]: left,
      [rightLabel]: right,
    }
  })
}

export function mergeRowsByNorm(leftRows, rightRows, leftLabel, rightLabel) {
  const leftByNorm = new Map()
  for (const row of leftRows.values()) {
    leftByNorm.set(row.norm ?? normalizeScenarioName(row.scenario), row)
  }
  const rightByNorm = new Map()
  for (const row of rightRows.values()) {
    rightByNorm.set(row.norm ?? normalizeScenarioName(row.scenario), row)
  }
  const norms = [...new Set([...leftByNorm.keys(), ...rightByNorm.keys()])].sort()
  return norms.map((norm) => {
    const left = leftByNorm.get(norm)
    const right = rightByNorm.get(norm)
    return {
      suite: [left?.suite, right?.suite].filter(Boolean).join(' / ') || '—',
      scenario: left?.scenario ?? right?.scenario ?? norm,
      norm,
      [leftLabel]: left,
      [rightLabel]: right,
    }
  })
}
