import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  collectResults,
  mergeRowsByKey,
  mergeRowsByNorm,
  totalTokensFromRow,
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

function tokenCell(row) {
  const tokens = totalTokensFromRow(row)
  if (tokens == null) return '—'
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}k`
  return String(tokens)
}

function deltaTokenCell(left, right) {
  const l = totalTokensFromRow(left)
  const r = totalTokensFromRow(right)
  if (l == null || r == null) return '—'
  const delta = r - l
  const sign = delta > 0 ? '+' : ''
  if (Math.abs(delta) >= 1000) return `${sign}${(delta / 1000).toFixed(1)}k`
  return `${sign}${delta}`
}

function categoryCell(row) {
  if (!row || row.pass || row.skipped) return ''
  return row.category || 'fail'
}

function sumTokens(rows, label) {
  let sum = 0
  let count = 0
  for (const row of rows) {
    const side = row[label]
    const tokens = totalTokensFromRow(side)
    if (tokens != null) {
      sum += tokens
      count++
    }
  }
  return { sum, count }
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
      `${leftLabel} | ${leftLabel} ms | ${leftLabel} tok | ${leftLabel} cat | ` +
      `${rightLabel} | ${rightLabel} ms | ${rightLabel} tok | Δ tok | ${rightLabel} cat |`,
    '| ----- | -------- | ' +
      '---- | --- | --- | --- | ' +
      '---- | --- | --- | --- | --- |',
  ]

  for (const row of merged) {
    const L = row[leftLabel]
    const R = row[rightLabel]
    lines.push(
      `| ${row.suite} | ${row.scenario} | ${statusCell(L)} | ${durationCell(L)} | ${tokenCell(L)} | ${categoryCell(L)} | ${statusCell(R)} | ${durationCell(R)} | ${tokenCell(R)} | ${deltaTokenCell(L, R)} | ${categoryCell(R)} |`,
    )
  }

  const leftPasses = merged.filter((r) => r[leftLabel]?.pass).length
  const rightPasses = merged.filter((r) => r[rightLabel]?.pass).length
  const comparable = merged.filter((r) => r[leftLabel] && r[rightLabel]).length
  const leftTokenStats = sumTokens(merged, leftLabel)
  const rightTokenStats = sumTokens(merged, rightLabel)

  lines.push(
    '',
    '## Summary',
    '',
    `- Comparable scenarios: ${comparable}`,
    `- ${leftLabel} passes: ${leftPasses}`,
    `- ${rightLabel} passes: ${rightPasses}`,
  )

  if (leftTokenStats.count > 0) {
    lines.push(
      `- ${leftLabel} total tokens (comparable): ${leftTokenStats.sum.toLocaleString()} (${leftTokenStats.count} scenarios)`,
    )
  }
  if (rightTokenStats.count > 0) {
    lines.push(
      `- ${rightLabel} total tokens (comparable): ${rightTokenStats.sum.toLocaleString()} (${rightTokenStats.count} scenarios)`,
    )
  }
  if (leftTokenStats.count > 0 && rightTokenStats.count > 0) {
    const delta = rightTokenStats.sum - leftTokenStats.sum
    const sign = delta > 0 ? '+' : ''
    lines.push(`- Token delta (${rightLabel} − ${leftLabel}): ${sign}${delta.toLocaleString()}`)
  }

  lines.push(
    '',
    '_Tokens from SDK usage when reported (agent + judge). Wall time includes git capture and judge._',
  )

  const body = lines.join('\n') + '\n'
  await writeFile(reportPath, body, 'utf8')
  return {
    reportPath,
    body,
    merged,
    leftPasses,
    rightPasses,
    comparable,
    leftTokenStats,
    rightTokenStats,
  }
}
