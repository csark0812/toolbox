import { fairTotals, formatFair } from '../src/fair.mjs'
import { loadFleeces } from '../src/fleeces.mjs'

console.log('Fellside Wool Fair, all days')
console.log(formatFair(fairTotals(loadFleeces())))
