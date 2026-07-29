import { readdir, readFile, stat } from 'node:fs/promises'
import { basename, join } from 'node:path'

export function normalizeScenarioName(name) {
  return name
    .replace(/^outcome:\s*/i, '')
    .replace(/^transfer:\s*/i, '')
    .trim()
    .toLowerCase()
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
              raw.name ??
              basename(full).replace(/\.debug$/, '')
            const suite = raw.suiteName ?? basename(join(full, '..'))
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
              norm: normalizeScenarioName(scenario),
              pass,
              skipped: Boolean(raw.skipped),
              durationMs: raw.durationMs ?? raw.duration ?? null,
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
