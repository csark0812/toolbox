// A season of uploads from the footbridge counter, generated the same way every time.
const pad = (n) => String(n).padStart(2, '0')

/** An ISO time for a UTC instant written in the counter's local offset (UTC+1 from 29 March). */
function stamp(ms) {
  const summer = ms >= Date.parse('2026-03-29T01:00:00Z')
  const local = new Date(ms + (summer ? 3600000 : 0))
  const date = `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}`
  const time = `${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}:00`
  return `${date}T${time}${summer ? '+01:00' : 'Z'}`
}

export function makeUploads() {
  let seed = 20260412
  const next = () => (seed = (seed * 48271) % 2147483647)
  const start = Date.parse('2026-02-02T00:00:00Z')
  const readings = []
  const late = []
  for (let h = 0; h < 70 * 24; h++) {
    const day = Math.floor(h / 24)
    // The counter was offline for a few days in February and again in April.
    if ((day >= 10 && day < 13) || day === 60) continue
    const hour = h % 24
    const base = hour < 6 ? 2 : hour < 9 || hour > 19 ? 25 : 60
    const reading = {
      at: stamp(start + h * 3600000 + (next() % 3) * 60000),
      count: base + (next() % 40),
    }
    const roll = next() % 100
    if (roll < 3) reading.count = null
    else if (roll === 3) reading.count = -1
    else if (roll === 4) delete reading.count
    if (roll === 5 || roll === 6) late.push({ ...reading, count: reading.count + (next() % 5) })
    if (roll === 7) late.push(reading)
    else readings.push(reading)
  }
  // Late uploads arrive in batches at the end of the file.
  return readings.concat(late)
}
