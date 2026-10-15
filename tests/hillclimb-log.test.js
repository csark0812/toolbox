import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { COLUMNS, cleanCell, formatRow } from '../hillclimb/scripts/log.mjs'

const root = join(import.meta.dirname, '..')

describe('hillclimb decision log', () => {
  it('keeps each cell on one line and neutralizes spreadsheet formulas', () => {
    expect(cleanCell('drop\tthe\nsort')).toBe('drop the sort')
    expect(cleanCell('=HYPERLINK("x")')).toBe(`'=HYPERLINK("x")`)
    expect(cleanCell('-12%')).toBe(`'-12%`)
    expect(cleanCell(undefined)).toBe('')
  })

  it('rejects rows with the wrong number of fields', () => {
    expect(() => formatRow(['only-one'])).toThrow(/Expected 9 fields/)
  })

  it('writes the header once and appends rows through the CLI', () => {
    const directory = mkdtempSync(join(tmpdir(), 'hillclimb-log-'))
    try {
      const file = join(directory, 'nested/decisions.tsv')
      const script = join(root, 'hillclimb/scripts/log.mjs')
      const row = ['h1', 'Set dedupe', 'src/a.mjs', '20.0', '4.1', '-79%', 'pass', 'kept', 'ok']
      execFileSync(process.execPath, [script, file, ...row])
      execFileSync(process.execPath, [script, file, ...row])
      const lines = readFileSync(file, 'utf8').trimEnd().split('\n')
      expect(lines[0]).toBe(COLUMNS.join('\t'))
      expect(lines).toHaveLength(3)
      expect(lines[1].split('\t')).toHaveLength(COLUMNS.length)
      expect(lines[1]).toContain(`\t'-79%\t`)
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })
})
