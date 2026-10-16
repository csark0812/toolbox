#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import { manifest, SENDER } from '../src/manifest.mjs'
import { formatFor } from '../src/presets.mjs'
import { render } from '../src/template.mjs'

const { values } = parseArgs({
  options: {
    preset: { type: 'string' },
    manifest: { type: 'boolean' },
    slip: { type: 'string' },
  },
})
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const shipments = JSON.parse(read('data/shipments.json'))
if (values.manifest) console.log(manifest(shipments))
else if (values.slip) {
  const shipment = shipments.find((entry) => entry.id === values.slip)
  if (!shipment) {
    console.error(`no shipment ${values.slip}`)
    process.exit(1)
  }
  process.stdout.write(
    render(read('templates/return-slip.txt'), {
      order: shipment.id,
      shop: SENDER,
      customer: shipment.to,
    }),
  )
} else {
  const preset = values.preset ?? 'envelope'
  for (const shipment of shipments) console.log(`${formatFor(preset, shipment.to)}\n`)
}
