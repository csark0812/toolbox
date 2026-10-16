import { country } from '../countries.mjs'
import { offsetAt } from '../zones.mjs'

export const summary = "zone <country>            UTC offset now for the country's main time zone"
export function run([name], now = new Date()) {
  const { zone } = country(name)
  return [`${country(name).name}: ${zone} ${offsetAt(zone, now)}`]
}
