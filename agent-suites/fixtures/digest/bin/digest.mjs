import { readFileSync } from 'node:fs'
import { plan } from '../src/digest.mjs'

const read = (file) => readFileSync(new URL(`../data/${file}`, import.meta.url), 'utf8')
const users = JSON.parse(read('users.json'))
const now = Date.parse(read('now.txt').trim())
const entries = plan(users, now)
for (const entry of entries) console.log(`${entry.id}  ${entry.sendAt}`)
console.log(`${entries.length} of ${users.length} users due`)
