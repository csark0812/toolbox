import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
const outcomes = new Set([
  'passed',
  'task-failed',
  'infrastructure-failed',
  'judge-failed',
  'interrupted',
  'incomplete',
])
export function validateEvidence(record) {
  if (
    record.schemaVersion !== 1 ||
    !record.scenario ||
    !outcomes.has(record.outcome) ||
    !record.measurements
  )
    throw new Error('Invalid normalized evidence')
  for (const metric of Object.values(record.measurements))
    if (
      !metric ||
      (!(typeof metric.value === 'number' && Number.isFinite(metric.value) && metric.unit) &&
        !metric.unavailable)
    )
      throw new Error('Missing measurement is not zero')
  if (record.outcome === 'passed' && (!record.evidence || !record.source))
    throw new Error('Passing evidence requires bound inputs and artifacts')
  return record
}
export async function readCurrentEvidence(dir) {
  const records = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) records.push(...(await readCurrentEvidence(path)))
    else if (entry.name === 'normalized.json')
      records.push(validateEvidence(JSON.parse(await readFile(path, 'utf8'))))
  }
  return records
}
export function pairedEvidence(records) {
  const pairs = new Map()
  for (const row of records) {
    validateEvidence(row)
    const key = JSON.stringify([row.compareId, row.repetition])
    if (!row.compareId) throw new Error('Comparison identity required')
    if (!pairs.has(key))
      pairs.set(key, { id: row.compareId, repetition: row.repetition, variants: {} })
    const pair = pairs.get(key)
    if (pair.variants[row.variant]) throw new Error('Duplicate paired result')
    pair.variants[row.variant] = row
  }
  return [...pairs.values()].map((pair) => ({
    ...pair,
    complete:
      Object.keys(pair.variants).length >= 2 &&
      Object.values(pair.variants).every((row) => row.outcome === 'passed'),
  }))
}
