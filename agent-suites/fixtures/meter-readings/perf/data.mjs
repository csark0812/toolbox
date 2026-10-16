// Writes a deterministic quarter of half-hourly readings for the whole estate, in time order.
import { createWriteStream } from 'node:fs'
import { once } from 'node:events'

export const METERS = 140
export const DAYS = 92

export async function writeQuarter(file) {
  const out = createWriteStream(file)
  let seed = 31337
  const next = () => (seed = (seed * 48271) % 2147483647)
  out.write('meter,timestamp,kwh\n')
  const start = Date.UTC(2026, 0, 1)
  for (let slot = 0; slot < DAYS * 48; slot++) {
    const at = new Date(start + slot * 1800000).toISOString().replace('.000Z', 'Z')
    let chunk = ''
    for (let m = 0; m < METERS; m++) {
      const roll = next() % 1000
      const kwh = roll < 7 ? '' : (((next() % 2400) + (slot % 48 > 34 ? 600 : 0)) / 1000).toFixed(3)
      chunk += `M-${String(m).padStart(4, '0')},${at},${kwh}\n`
    }
    if (!out.write(chunk)) await once(out, 'drain')
  }
  out.end()
  await once(out, 'finish')
}
