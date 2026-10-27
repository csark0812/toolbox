#!/bin/sh
# The price list on the website: portions and sponge price for each standard tier.
set -e
STYLE="${1:-wedding}"
node --input-type=module -e "
import { servingsFor } from './bin/quote.mjs'
import { config, pounds } from './src/orders.mjs'
console.log('size  shape   portions  sponge')
for (const shape of ['round', 'square'])
  for (let size = 6; size <= 16; size++) {
    const n = servingsFor({ shape, size }, '$STYLE')
    console.log(String(size).padEnd(6) + shape.padEnd(8) + String(n).padEnd(10) + pounds(n * config.pencePerPortion.sponge))
  }
"
