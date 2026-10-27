import { readFileSync } from 'node:fs'

// Pence per animal shorn.
export const FEES = { alpaca: 1400, llama: 1800 }
export const MILEAGE_PENCE = 45
export const FREE_MILES = 10

export const FARMS = {
  bryn: { name: 'Bryn Uchaf', code: 'BRY', vat: false },
  hafod: { name: 'Hafod Alpacas', code: 'HAF', vat: true },
  pentre: { name: 'Pentre Llamas', code: 'PEN', vat: false },
}

// Upper micron limit (inclusive) for each grade; anything above the last is coarse.
export const GRADES = [
  { name: 'royal', max: 18 },
  { name: 'superfine', max: 20 },
  { name: 'fine', max: 23 },
  { name: 'medium', max: 26 },
  { name: 'strong', max: 30 },
]

// What the co-op pays, pence per kilo.
export const PRICE_PER_KG = {
  royal: 2400,
  superfine: 1600,
  fine: 1100,
  medium: 600,
  strong: 250,
  coarse: 0,
}

export function loadVisits(path = 'data/visits.json') {
  return JSON.parse(readFileSync(path, 'utf8'))
}

export function farmFor(visit) {
  const farm = FARMS[visit.farm]
  if (!farm) throw new Error(`Unknown farm: ${visit.farm}`)
  return farm
}

export function gradeFleece(micron) {
  if (micron === null || micron === undefined) throw new Error('No micron reading')
  const grade = GRADES.find((g) => micron <= g.max)
  return grade ? grade.name : 'coarse'
}

export function fleeceValue(animal) {
  return Math.round(animal.fleeceKg * PRICE_PER_KG[gradeFleece(animal.micron)])
}

export function bagLabel(visit, animal) {
  const grade = animal.micron === null ? 'UNSAMPLED' : gradeFleece(animal.micron).toUpperCase()
  return `${farmFor(visit).code}-${animal.tag} ${grade} ${animal.fleeceKg.toFixed(2)}kg`
}

export function animalFee(animal) {
  const fee = FEES[animal.species]
  if (fee === undefined) throw new Error(`No fee for ${animal.species}`)
  return fee
}

export function travelCharge(visit) {
  return Math.max(0, visit.miles - FREE_MILES) * MILEAGE_PENCE
}

export function invoice(visit) {
  const farm = farmFor(visit)
  const lines = []
  for (const animal of visit.animals)
    lines.push([`Shearing ${animal.tag} (${animal.species})`, animalFee(animal)])
  const travel = travelCharge(visit)
  if (travel > 0) lines.push([`Travel ${visit.miles - FREE_MILES} miles`, travel])
  const credit = visit.animals
    .filter((a) => a.micron !== null)
    .reduce((sum, a) => sum + fleeceValue(a), 0)
  if (credit > 0) lines.push(['Fleece buy-back', -credit])
  const net = lines.reduce((sum, [, pence]) => sum + pence, 0)
  if (farm.vat) lines.push(['VAT 20%', Math.round(net * 0.2)])
  return { farm, lines, total: lines.reduce((sum, [, pence]) => sum + pence, 0) }
}

export const pounds = (pence) => (pence < 0 ? '-' : '') + '£' + (Math.abs(pence) / 100).toFixed(2)
