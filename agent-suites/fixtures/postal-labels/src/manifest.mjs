import { formatAddress } from './address.mjs'
import { formatFor } from './presets.mjs'

export const SENDER = {
  name: 'Kiln & Clay',
  line1: 'Unit 4, Mill Yard',
  city: 'Stroud',
  postcode: 'GL5 3JH',
  country: 'United Kingdom',
}

const quote = (text) => `"${text.replaceAll('"', '""')}"`

/** The courier's CSV manifest: one row per shipment. */
export function manifest(shipments) {
  const rows = ['order,parcels,recipient,sender']
  for (const shipment of shipments)
    rows.push(
      [
        shipment.id,
        shipment.parcels,
        quote(formatAddress(shipment.to, false, true)),
        quote(formatFor('csv', SENDER)),
      ].join(','),
    )
  return rows.join('\n')
}
