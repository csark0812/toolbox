import { formatAddress } from './address.mjs'

/** How each kind of label lays out an address: [multiline, includeCountry, uppercase]. */
export const PRESETS = {
  envelope: [true, false, true],
  customs: [true, true, true],
  csv: [false, true, false],
  sms: [false, false, false],
}

export function formatFor(preset, address) {
  if (!PRESETS[preset]) throw new RangeError(`unknown preset: ${preset}`)
  return formatAddress(address, ...PRESETS[preset])
}
