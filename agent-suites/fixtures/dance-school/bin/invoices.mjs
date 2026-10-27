import { generateTermInvoices } from '../src/invoices.mjs'
import { persist } from '../src/store.mjs'

const created = generateTermInvoices(process.argv[2])
persist()
console.log(`${created.length} invoices created`)
