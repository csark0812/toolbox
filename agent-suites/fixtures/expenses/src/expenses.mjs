import { readFileSync } from 'node:fs'

/** Expense claims: { date, person, description, amount } with amount in dollars. */
export const loadExpenses = () =>
  JSON.parse(readFileSync(new URL('../data/expenses.json', import.meta.url), 'utf8'))
