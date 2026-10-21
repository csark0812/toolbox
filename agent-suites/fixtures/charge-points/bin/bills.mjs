import { readFileSync } from 'node:fs'
import { argv } from 'node:process'
import { bill, parseReadings, parseSessions } from '../src/bills.mjs'

const load = (file) => readFileSync(new URL(`../data/${file}`, import.meta.url), 'utf8')
const sessions = parseSessions(load('sessions.csv'))
const readings = parseReadings(load('readings.csv'))
const day = argv[2] ?? '2026-10-09'
const pounds = (pence) => `£${(pence / 100).toFixed(2)}`
for (const session of sessions.filter((s) => s.date === day)) {
  const { kwh, energy, overstay, total } = bill(session, readings)
  console.log(
    `${session.id}  ${session.driver.padEnd(14)} ${session.plugIn}-${session.unplug}  ` +
      `${kwh.toFixed(2).padStart(6)} kWh  energy ${pounds(energy)}  overstay ${pounds(overstay)}  total ${pounds(total)}`,
  )
}
