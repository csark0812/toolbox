import { readFileSync, writeFileSync } from 'node:fs'

/** Reads loans from JSON, normalizing statuses written by older exports. */
export function loadLoans(path) {
  return JSON.parse(readFileSync(path, 'utf8')).map(normalizeLoan)
}

export function normalizeLoan(loan) {
  let status = String(loan.status).trim().toLowerCase()
  if (status === 'late') status = 'overdue'
  return { ...loan, status }
}

export function saveLoans(path, loans) {
  writeFileSync(path, JSON.stringify(loans, null, 2) + '\n')
}
