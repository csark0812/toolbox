import { readFileSync } from 'node:fs'
import { argv } from 'node:process'
import { COLLECTION, packingList } from '../src/parcels.mjs'

const referrals = JSON.parse(
  readFileSync(new URL('../data/referrals.json', import.meta.url), 'utf8'),
)
const day = argv[2] ?? 'Tue'
console.log(`Packing for ${day} (collect ${COLLECTION})`)
for (const parcel of packingList(referrals, day))
  console.log(
    `  ${parcel.ref}  ${parcel.surname.padEnd(10)}${String(parcel.people).padStart(2)} people  ${parcel.size}`,
  )
