import { readFileSync } from 'node:fs'
import * as fabric from '../src/fabric.mjs'
import { FORMAT } from '../src/format.mjs'

const patterns = JSON.parse(readFileSync(new URL('../data/patterns.json', import.meta.url), 'utf8'))
for (const quilt of patterns) {
  console.log(`${quilt.name} (${quilt.width} x ${quilt.length} in)`)
  for (const piece of quilt.pieces.map((name) => fabric[name])) {
    const label = piece.name.replace('calc_', '')
    console.log(`  ${label}: ${FORMAT[label](piece(quilt))}`)
  }
}
