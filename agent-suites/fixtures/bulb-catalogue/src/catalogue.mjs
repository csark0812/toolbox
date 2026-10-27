// One catalogue line per cultivar: sacks, total grams, earliest lift date and a shelf label.
import { label } from './labels.mjs'

export function groupByCultivar(sacks) {
  const cultivars = []
  for (const sack of sacks) if (!cultivars.includes(sack.cultivar)) cultivars.push(sack.cultivar)
  return cultivars.map((cultivar) => ({
    cultivar,
    sacks: sacks.filter((sack) => sack.cultivar === cultivar),
  }))
}

export function buildCatalogue(sacks) {
  return groupByCultivar(sacks)
    .map(({ cultivar, sacks: group }) => {
      const grams = group.reduce((sum, sack) => sum + sack.grams, 0)
      const lifted = group.map((sack) => sack.lifted).sort()[0]
      return { cultivar, sacks: group.length, grams, lifted, label: label(cultivar, grams, lifted) }
    })
    .sort((a, b) => (a.cultivar < b.cultivar ? -1 : a.cultivar > b.cultivar ? 1 : 0))
}
