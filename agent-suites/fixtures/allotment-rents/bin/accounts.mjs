import { readFileSync } from 'node:fs'
import { rentAccounts } from '../src/accounts.mjs'

const money = (pence) => `£${(pence / 100).toFixed(2)}`
const data = JSON.parse(readFileSync(new URL('../data/rents.json', import.meta.url), 'utf8'))
const { accounts, unmatched } = rentAccounts(data)
for (const account of accounts)
  console.log(
    `${account.tenant.padEnd(14)} owes ${money(account.owed).padStart(8)}  credit ${money(account.credit).padStart(8)}  ${account.unpaid.join(', ')}`,
  )
for (const payment of unmatched)
  console.log(`Unmatched: ${payment.date} £${payment.amount.toFixed(2)} "${payment.reference}"`)
