import { billableKg, quote } from './rates.mjs'

/** One line of label text, e.g. "ZONE B · 2.5 kg · EXPRESS · $15.08". */
export function labelLine(parcel) {
  const { kg, l, w, h, zone, express } = parcel
  const cents = quote(kg, l, w, h, zone, express)
  return [
    `ZONE ${zone}`,
    `${billableKg(kg, l, w, h)} kg`,
    express ? 'EXPRESS' : 'STANDARD',
    `$${(cents / 100).toFixed(2)}`,
  ].join(' · ')
}
