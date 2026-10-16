const CODE = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/

/** Issues a card. `code` must look like ABCD-EFGH-JKLM. */
export function issueCard(store, { code, balanceCents, expiresAt }) {
  if (!CODE.test(code)) throw new RangeError(`Bad card code ${code}`)
  if (!Number.isInteger(balanceCents) || balanceCents <= 0)
    throw new RangeError('A card needs a positive balance in cents')
  if (store.cards.has(code)) throw new Error(`Card ${code} already exists`)
  const card = { code, balanceCents, expiresAt, history: [] }
  store.cards.set(code, card)
  return card
}

/** The card with exactly this code, or undefined. */
export function findCard(store, code) {
  return store.cards.get(code)
}
