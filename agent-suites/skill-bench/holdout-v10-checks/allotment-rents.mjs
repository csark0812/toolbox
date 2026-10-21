// Hidden acceptance for the rent accounts speed-up: the same accounts and unmatched payments as the
// original on random histories (handover days, two tenancies starting the same day where the first
// listed wins, open-ended and overlapping tenancies, vacant plots, references with leading zeros,
// lower-case letters, a year before the plot or no number at all, refunds, amounts with a fraction
// of a penny, same-day invoices and payments, zero invoices and invoice numbers that file
// alphabetically), the frozen timing script under target with the same work, and the work committed
// on the branch.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { rentAccounts } = await import(pathToFileURL(join(dir, 'src/accounts.mjs')).href)

const day = (date) => new Date(`${date}T00:00:00Z`).getTime()
const pence = (pounds) => Math.round(pounds * 100)

/** The plot a bank reference names: its first number, with the letter straight after it if any. */
function plotOf(reference) {
  const match = /(\d+)([a-z]?)/i.exec(reference)
  return match ? `${Number(match[1])}${match[2].toUpperCase()}` : null
}

/** Who held a plot on a date. On a handover day the incoming tenant holds it. */
function holder(tenancies, plot, date) {
  const holding = tenancies
    .filter(
      (tenancy) =>
        tenancy.plot === plot &&
        day(tenancy.from) <= day(date) &&
        (tenancy.to === null || day(date) <= day(tenancy.to)),
    )
    .sort((a, b) => day(b.from) - day(a.from))
  return holding[0]?.tenant ?? null
}

/** Every tenant's rent account, and the bank payments that could not be matched to a tenant. */
function reference({ tenancies, invoices, payments }) {
  const tenants = [...new Set(tenancies.map((tenancy) => tenancy.tenant))]
  const unmatched = payments.filter((payment) => {
    const plot = plotOf(payment.reference)
    return !plot || !holder(tenancies, plot, payment.date)
  })
  const accounts = tenants.map((tenant) => {
    const bills = invoices
      .filter((invoice) => holder(tenancies, invoice.plot, invoice.issued) === tenant)
      .map((invoice) => ({ ...invoice, due: invoice.amount }))
    const paid = payments.filter((payment) => {
      const plot = plotOf(payment.reference)
      return plot && holder(tenancies, plot, payment.date) === tenant
    })
    // Invoices before payments on the same day, so a payment can settle the day's invoice.
    const events = [
      ...bills.map((bill) => ({ date: bill.issued })),
      ...paid.map((payment) => ({ date: payment.date, amount: pence(payment.amount) })),
    ].sort((a, b) => day(a.date) - day(b.date))
    let credit = 0
    for (const event of events) {
      credit += event.amount ?? 0
      while (credit > 0) {
        const oldest = bills
          .filter((bill) => bill.due > 0 && day(bill.issued) <= day(event.date))
          .sort((a, b) => day(a.issued) - day(b.issued) || a.id.localeCompare(b.id))[0]
        if (!oldest) break
        const part = Math.min(credit, oldest.due)
        oldest.due -= part
        credit -= part
      }
    }
    return {
      tenant,
      invoiced: bills.reduce((sum, bill) => sum + bill.amount, 0),
      paid: paid.reduce((sum, payment) => sum + pence(payment.amount), 0),
      owed: bills.reduce((sum, bill) => sum + bill.due, 0),
      credit,
      unpaid: bills
        .filter((bill) => bill.due > 0)
        .sort((a, b) => day(a.issued) - day(b.issued) || a.id.localeCompare(b.id))
        .map((bill) => bill.id),
    }
  })
  accounts.sort((a, b) => b.owed - a.owed || a.tenant.localeCompare(b.tenant))
  return { accounts, unmatched }
}

let seed = 83
const next = () => (seed = (seed * 48271) % 2147483647)
const pick = (list) => list[next() % list.length]
const DATES = ['2025-03-31', '2025-04-01', '2025-04-02', '2025-06-30', '2025-07-01', '2026-04-01']
const PLOTS = ['1', '2A', '2B', '10']
const REFERENCES = [
  'PLOT 1',
  'plot 001',
  '2a rent',
  'PLT-02B',
  '2B',
  'Plot 2ab',
  '2025 rent 2A',
  'plot ten',
  '10',
  'RENT 10 AND 1',
  '3A',
  '',
]
const AMOUNTS = [10, 20, 30.5, 0.005, 10.005, 19.995, 0.1, 0.2, -10, 45, 1.015]
for (let round = 0; round < 400; round++) {
  const tenancies = Array.from({ length: next() % 6 }, () => {
    const from = pick(DATES)
    const later = DATES.filter((date) => date >= from)
    return {
      plot: pick(PLOTS),
      tenant: pick(['Ada', 'ben', 'Cy', 'Émile']),
      from,
      to: next() % 3 === 0 ? null : pick(later),
    }
  })
  const invoices = Array.from({ length: next() % 7 }, (_, i) => ({
    id: pick([`INV-${i + 1}`, `INV-1${i}`, `inv-${9 - i}`, `inv-${i}`]),
    plot: pick(PLOTS),
    issued: pick(DATES),
    amount: pick([0, 1000, 1050, 2000, 3001]),
  }))
  const payments = Array.from({ length: next() % 8 }, () => ({
    date: pick(DATES),
    amount: pick(AMOUNTS),
    reference: pick(REFERENCES),
  }))
  const history = { tenancies, invoices, payments }
  const frozen = JSON.stringify(history)
  assert.deepEqual(rentAccounts(history), reference(history), `round ${round}: ${frozen}`)
  assert.equal(JSON.stringify(history), frozen, "the caller's history is not changed")
}
assert.equal(
  execFileSync(process.execPath, ['bin/accounts.mjs'], { cwd: dir, encoding: 'utf8' }),
  [
    'Sam Okafor     owes   £58.00  credit    £0.00  INV-2026-9',
    'Joan Pryce     owes    £0.00  credit    £0.00  ',
    'Ravi Mehta     owes    £0.00  credit   £24.00  ',
    'Unmatched: 2026-04-09 £20.00 "ALLOTMENT RENT"',
    '',
  ].join('\n'),
)
const perf = JSON.parse(
  execFileSync(process.execPath, ['perf/measure.mjs'], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 110000,
  }),
)
assert.equal(perf.errors, 0)
assert.equal(perf.work, 198, 'every tenant has an account')
assert.equal(perf.owed, 1245407, 'the same amount owed')
assert.equal(perf.credit, 95619, 'the same credit')
assert.equal(perf.unmatched, 318, 'the same unmatched payments')
// Target is 5 ms; allow slack for a loaded machine.
assert.ok(perf.medianMs < 12, `median ${perf.medianMs} ms is far above the 5 ms target`)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
assert.ok(git('rev-list', `${baseline}..HEAD`, '--', '.'), 'the speed-up is committed')
assert.equal(git('status', '--porcelain', '--', 'src'), '', 'no uncommitted source changes')
