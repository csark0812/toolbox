import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { writeAgentTestCompareReport } from './suite-report-from-session.mjs'

/**
 * Compare two agent-test debug session roots via agent-test writeCompareReport.
 * @param {{
 *   repoRoot: string
 *   left: string
 *   right: string
 *   leftLabel?: string
 *   rightLabel?: string
 *   reportDir?: string
 *   reportPath?: string
 * }} options
 */
export async function writeComparisonReport(options) {
  const leftLabel = options.leftLabel ?? 'left'
  const rightLabel = options.rightLabel ?? 'right'
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const reportDir = options.reportDir ?? join(options.repoRoot, '_agent', 'eval-reports', ts)

  await mkdir(reportDir, { recursive: true })

  const result = await writeAgentTestCompareReport({
    left: options.left,
    right: options.right,
    leftLabel,
    rightLabel,
    outDir: reportDir,
  })

  const { written, report } = result
  const reportPath = options.reportPath ?? written.htmlPath

  console.log(`Compare HTML: ${written.htmlPath}`)
  console.log(`Compare MD: ${written.markdownPath}`)
  console.log(`Compare JSON: ${written.jsonPath}`)

  return {
    reportPath,
    reportMdPath: written.markdownPath,
    reportJsonPath: written.jsonPath,
    reportDir,
    report,
    written,
    aDumpPath: result.aDumpPath,
    bDumpPath: result.bDumpPath,
    leftPasses: result.leftPasses,
    rightPasses: result.rightPasses,
    comparable: result.comparable,
    leftTokenStats: result.leftTokenStats,
    rightTokenStats: result.rightTokenStats,
  }
}
