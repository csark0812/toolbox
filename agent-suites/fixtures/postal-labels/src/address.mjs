/** The lines of an address, from the recipient down to the postcode line. */
function addressLines(address) {
  const lines = [address.name, address.line1]
  if (address.line2) lines.push(address.line2)
  lines.push([address.city, address.region, address.postcode].filter(Boolean).join(' '))
  return lines
}

/**
 * An address as text: on one line separated by commas, or one part per line; optionally with
 * the country, optionally in capitals (as some couriers and the post office ask).
 */
export function formatAddress(
  address,
  multiline = false,
  includeCountry = false,
  uppercase = false,
) {
  const lines = addressLines(address)
  if (includeCountry) lines.push(address.country)
  const text = lines.join(multiline ? '\n' : ', ')
  return uppercase ? text.toUpperCase() : text
}
