import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { collectResults } from './agent-test-artifacts.mjs'

/**
 * Build a SuiteRunReport-shaped object from an agent-test debug session root.
 * @param {string} sessionRoot
 * @param {{ host?: string }} [options]
 */
export async function suiteReportFromSession(sessionRoot, options = {}) {
  const rows = [...(await collectResults(sessionRoot)).values()]
  if (rows.length === 0) {
    throw new Error(`No result.json found under session: ${sessionRoot}`)
  }

  const suite = rows[0].suite
  const host = options.host ?? 'cursor'
  let passed = 0
  let failed = 0
  let skipped = 0

  const results = rows.map((row) => {
    if (row.skipped) skipped++
    else if (row.pass) passed++
    else failed++

    return {
      suite: row.suite,
      scenario: row.scenario,
      compareId: row.compareId ?? undefined,
      passed: row.pass,
      failures: [],
      skipped: row.skipped || undefined,
      durationMs: row.durationMs ?? 0,
      usage: row.usage ?? undefined,
      agentUsage: row.agentUsage ?? undefined,
      judgeUsage: row.judgeUsage ?? undefined,
    }
  })

  return {
    suite,
    host,
    passed,
    failed,
    skipped,
    results,
  }
}

/**
 * Write side-a/side-b suite reports and agent-test compare artifacts.
 * @param {{
 *   left: string
 *   right: string
 *   leftLabel?: string
 *   rightLabel?: string
 *   outDir: string
 * }} options
 */
export async function writeAgentTestCompareReport(options) {
  const leftLabel = options.leftLabel ?? 'full'
  const rightLabel = options.rightLabel ?? 'none'

  const { compareSuiteReports, writeCompareReport } = await import(
    '@post-print/agent-test'
  )

  const [a, b] = await Promise.all([
    suiteReportFromSession(options.left),
    suiteReportFromSession(options.right),
  ])

  const aDumpPath = join(options.outDir, `${leftLabel}.suite-report.json`)
  const bDumpPath = join(options.outDir, `${rightLabel}.suite-report.json`)
  await writeFile(aDumpPath, `${JSON.stringify(a, null, 2)}\n`, 'utf8')
  await writeFile(bDumpPath, `${JSON.stringify(b, null, 2)}\n`, 'utf8')

  const report = compareSuiteReports({
    aLabel: leftLabel,
    bLabel: rightLabel,
    a,
    b,
  })

  const written = await writeCompareReport({ outDir: options.outDir, report })

  let leftTokenSum = 0
  let leftTokenCount = 0
  let rightTokenSum = 0
  let rightTokenCount = 0
  for (const row of report.paired) {
    if (row.a.totalTokens != null) {
      leftTokenSum += row.a.totalTokens
      leftTokenCount++
    }
    if (row.b.totalTokens != null) {
      rightTokenSum += row.b.totalTokens
      rightTokenCount++
    }
  }

  return {
    report,
    written,
    aDumpPath,
    bDumpPath,
    leftPasses: report.paired.filter((r) => r.a.passed).length,
    rightPasses: report.paired.filter((r) => r.b.passed).length,
    comparable: report.paired.length,
    leftTokenStats: { sum: leftTokenSum, count: leftTokenCount },
    rightTokenStats: { sum: rightTokenSum, count: rightTokenCount },
  }
}
