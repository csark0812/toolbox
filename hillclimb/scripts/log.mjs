#!/usr/bin/env node
// Append one row to a hillclimb decision log (tab-separated, append-only).
import { appendFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { pathToFileURL } from 'node:url'

export const COLUMNS = [
  'ts',
  'id',
  'hypothesis',
  'change',
  'before',
  'after',
  'delta',
  'gate',
  'verdict',
  'note',
]

/** Make one cell safe for a single-line TSV opened in a spreadsheet. */
export function cleanCell(value) {
  const flat = String(value ?? '')
    .replace(/[\t\r\n]+/g, ' ')
    .trim()
  return /^[=+\-@]/.test(flat) ? `'${flat}` : flat
}

export function formatRow(fields, now = new Date()) {
  if (fields.length !== COLUMNS.length - 1)
    throw new Error(`Expected ${COLUMNS.length - 1} fields: ${COLUMNS.slice(1).join(', ')}`)
  return [now.toISOString(), ...fields].map(cleanCell).join('\t') + '\n'
}

export function appendRow(file, fields, now = new Date()) {
  mkdirSync(dirname(file), { recursive: true })
  if (!existsSync(file)) appendFileSync(file, COLUMNS.join('\t') + '\n')
  appendFileSync(file, formatRow(fields, now))
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const [file, ...fields] = process.argv.slice(2)
  if (!file || fields.length === 0 || fields[0] === '--help') {
    console.log(`Usage: log.mjs <decisions.tsv> ${COLUMNS.slice(1).join(' ')}`)
    process.exit(file ? 0 : 1)
  }
  appendRow(file, fields)
}
