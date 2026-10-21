// Times the rent accounts on the society's full history. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { rentAccounts } from '../src/accounts.mjs'
import { makeHistory } from './data.mjs'
const history = makeHistory()
const fingerprint = (result) => JSON.stringify(result)
const expected = fingerprint(rentAccounts(history))
const RUNS = 7
const timings = []
let errors = 0
let result = { accounts: [], unmatched: [] }
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  result = rentAccounts(history)
  timings.push(performance.now() - start)
  if (fingerprint(result) !== expected) errors++
}
timings.sort((a, b) => a - b)
stdout.write(
  JSON.stringify({
    medianMs: Number(timings[3].toFixed(2)),
    range: [Number(timings[0].toFixed(2)), Number(timings[RUNS - 1].toFixed(2))],
    runs: RUNS,
    errors,
    work: result.accounts.length,
    owed: result.accounts.reduce((sum, account) => sum + account.owed, 0),
    credit: result.accounts.reduce((sum, account) => sum + account.credit, 0),
    unmatched: result.unmatched.length,
  }) + '\n',
)
