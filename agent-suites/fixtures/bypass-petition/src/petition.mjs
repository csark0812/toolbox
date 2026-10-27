export const NEEDED = 250

export function parseSignatures(text) {
  const [header, ...lines] = text.trim().split('\n')
  const keys = header.split(',')
  return lines.map((line) =>
    Object.fromEntries(line.split(',').map((value, i) => [keys[i], value])),
  )
}

export function parsePostcodes(text) {
  return new Set(text.trim().split('\n').map(normalisePostcode))
}

export function normalisePostcode(postcode) {
  return postcode.trim().toUpperCase()
}

const personKey = (signature) => `${signature.name.trim()}|${normalisePostcode(signature.postcode)}`

export function tally(signatures, parish) {
  const seen = new Set()
  const valid = []
  const rejected = []
  for (const signature of signatures) {
    if (!parish.has(normalisePostcode(signature.postcode))) {
      rejected.push({ ...signature, reason: 'not in the parish' })
    } else if (seen.has(personKey(signature))) {
      rejected.push({ ...signature, reason: 'already signed' })
    } else {
      seen.add(personKey(signature))
      valid.push(signature)
    }
  }
  return { valid, rejected, short: Math.max(0, NEEDED - valid.length) }
}
