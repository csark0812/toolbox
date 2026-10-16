import { readFileSync, writeFileSync } from 'node:fs'

/** The seed library catalogue, stored as JSON. */
export default class Catalog {
  static file = new URL('../data/seeds.json', import.meta.url)

  static all() {
    return JSON.parse(readFileSync(this.file, 'utf8'))
  }

  static save(entries) {
    writeFileSync(this.file, `${JSON.stringify(entries, null, 2)}\n`)
  }

  /** A variety or family name for matching: trimmed, lowercase, single spaces. */
  static normalize(name) {
    return name.trim().toLowerCase().replace(/\s+/g, ' ')
  }

  static search(text) {
    const wanted = this.normalize(text)
    return this.all().filter((entry) => this.normalize(entry.variety).includes(wanted))
  }

  static byFamily(family) {
    const wanted = this.normalize(family)
    return this.all().filter((entry) => this.normalize(entry.family) === wanted)
  }

  /** Add donated packets; the same variety and year from anyone is one stock line. */
  static add({ variety, family, donor, year, packets }) {
    if (!(packets > 0) || !Number.isInteger(packets))
      throw new RangeError('packets must be a whole number above 0')
    const entries = this.all()
    const same = entries.find(
      (entry) => this.normalize(entry.variety) === this.normalize(variety) && entry.year === year,
    )
    if (same) same.packets += packets
    else entries.push({ variety: variety.trim(), family, donor, year, packets })
    this.save(entries)
    return same ?? entries.at(-1)
  }

  /** Take packets out, oldest seed first. */
  static withdraw(variety, packets) {
    const entries = this.all()
    const stock = entries
      .filter((entry) => this.normalize(entry.variety) === this.normalize(variety))
      .sort((a, b) => a.year - b.year)
    const available = stock.reduce((sum, entry) => sum + entry.packets, 0)
    if (packets > available) throw new RangeError(`only ${available} packets of ${variety} left`)
    let left = packets
    for (const entry of stock) {
      const taken = Math.min(entry.packets, left)
      entry.packets -= taken
      left -= taken
    }
    this.save(entries.filter((entry) => entry.packets > 0))
    return available - packets
  }
}
