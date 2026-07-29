import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  collectResults,
  mergeRowsByKey,
  mergeRowsByNorm,
} from './agent-test-artifacts.mjs'

function statusCell(row) {
  if (row?.skipped) return 'skipped'
  if (row == null) return '—'
  return row.pass ? 'PASS' : 'FAIL'
}

function durationCell(row) {
  if (row?.durationMs == null) return '—'
  return `${(row.durationMs / 1000).toFixed(1)}s`
}

function categoryCell(row) {
  if (!row || row.pass || row.skipped) return ''
  return row.category || 'fail'
}

/**
 * @param {{
 *   repoRoot: string
 *   left: string
 *   right: string
 *   leftLabel?: string
 *   rightLabel?: string
 *   align?: 'key' | 'normalized'
 *   reportDir?: string
 *   reportPath?: string
 * }} options
 */
export async function writeComparisonReport(options) {
  const leftLabel = options.leftLabel ?? 'left'
  const rightLabel = options.rightLabel ?? 'right'
  const align = options.align ?? 'key'

  const [leftRows, rightRows] = await Promise.all([
    collectResults(options.left),
    collectResults(options.right),
  ])

  if (leftRows.size === 0 && rightRows.size === 0) {
    throw new Error('No result.json found under either session root.')
  }

  const merged =
    align === 'normalized'
      ? mergeRowsByNorm(leftRows, rightRows, leftLabel, rightLabel)
      : mergeRowsByKey(leftRows, rightRows, leftLabel, rightLabel)

  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const reportDir = options.reportDir ?? join(options.repoRoot, '_agent', 'eval-reports')
  await mkdir(reportDir, { recursive: true })
  const reportPath = options.reportPath ?? join(reportDir, `${ts}.md`)

  const lines = [
    '# Agent-test comparison',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `- **${leftLabel}:** \`${options.left}\``,
    `- **${rightLabel}:** \`${options.right}\``,
    `- **Align:** ${align}`,
    '',
    '| Suite | Scenario | ' +
      `${leftLabel} | ${leftLabel} ms | ${leftLabel} cat | ` +
      `${rightLabel} | ${rightLabel} ms | ${rightLabel} cat |`,
    '| ----- | -------- | ' +
      '---- | --- | --- | ' +
      '---- | --- | --- |',
  ]

  for (const row of merged) {
    const L = row[leftLabel]
    const R = row[rightLabel]
    lines.push(
      `| ${row.suite} | ${row.scenario} | ${statusCell(L)} | ${durationCell(L)} | ${categoryCell(L)} | ${statusCell(R)} | ${durationCell(R)} | ${categoryCell(R)} |`,
    )
  }

  const leftPasses = merged.filter((r) => r[leftLabel]?.pass).length
  const rightPasses = merged.filter((r) => r[rightLabel]?.pass).length
  const comparable = merged.filter((r) => r[leftLabel] && r[rightLabel]).length

  lines.push(
    '',
    '## Summary',
    '',
    `- Comparable scenarios: ${comparable}`,
    `- ${leftLabel} passes: ${leftPasses}`,
    `- ${rightLabel} passes: ${rightPasses}`,
    '',
    '_Wall time is a budget proxy until harness exposes token usage._',
  )

  const body = lines.join('\n') + '\n'
  await writeFile(reportPath, body, 'utf8')
  return { reportPath, body, merged, leftPasses, rightPasses, comparable }
}
