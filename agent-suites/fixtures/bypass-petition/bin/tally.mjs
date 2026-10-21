import { readFileSync } from 'node:fs'
import { argv } from 'node:process'
import { NEEDED, parsePostcodes, parseSignatures, tally } from '../src/petition.mjs'

const read = (name) => readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8')
const signatures = parseSignatures(read('signatures.csv'))
const { valid, rejected, short } = tally(signatures, parsePostcodes(read('postcodes.txt')))

if (argv.includes('--rejected')) {
  for (const { date, name, postcode, source, reason } of rejected) {
    console.log(
      `${date}  ${name.padEnd(16)}  ${postcode.padEnd(9)}  ${source.padEnd(6)}  ${reason}`,
    )
  }
  console.log('')
}
const paper = valid.filter((signature) => signature.source === 'paper').length
console.log(`${signatures.length} signatures, ${rejected.length} rejected`)
console.log(
  `${valid.length} valid (${paper} paper, ${valid.length - paper} online), ${NEEDED} needed`,
)
console.log(
  short ? `${short} more needed before it can go to the council` : 'Enough to go to the council',
)
