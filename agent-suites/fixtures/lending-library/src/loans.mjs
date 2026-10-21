import { readFileSync } from 'node:fs'

/** Every book that is out, in the order it was lent. */
export function loadLoans() {
  return JSON.parse(readFileSync(new URL('../data/loans.json', import.meta.url), 'utf8'))
}

/** The loans one member holds. */
export function loansFor(loans, member) {
  return loans.filter((loan) => loan.member === member)
}
