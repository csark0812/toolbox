import { byDesign, loadStock } from '../src/stock.mjs'

for (const [design, rows] of byDesign(loadStock()))
  console.log(`${design}: ${rows.map(({ size, count }) => `${size} ${count}`).join(', ')}`)
