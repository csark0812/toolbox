// Gmail ignores dots and anything after a plus in the part before the @, and googlemail.com is the same mailbox.
const DOTLESS = ['gmail.com', 'googlemail.com']

/** The mailbox a subscriber row really reaches, or null when the row has no usable address. */
export function mailbox(email) {
  const trimmed = (email ?? '').trim().toLowerCase()
  const match = /^([^@\s]+)@([^@\s]+\.[^@\s]+)$/.exec(trimmed)
  if (!match) return null
  let [, local, domain] = match
  if (DOTLESS.includes(domain)) {
    local = local.split('+')[0].replace(/\./g, '')
    domain = 'gmail.com'
  }
  return `${local}@${domain}`
}

const tidyName = (name) => (name ?? '').trim().replace(/\s+/g, ' ')

function addTags(entry, tags) {
  for (const raw of tags ?? []) {
    const tag = raw.trim()
    if (!tag) continue
    if (!entry.tags.some((known) => known.toLowerCase() === tag.toLowerCase())) entry.tags.push(tag)
  }
}

/**
 * One entry per mailbox, in the order each mailbox first appears. Rows without a usable address are
 * kept one by one so someone can fix them by hand.
 */
export function mergeSubscribers(rows) {
  const list = []
  for (const row of rows) {
    const address = mailbox(row.email)
    const existing =
      address === null ? undefined : list.find((entry) => mailbox(entry.email) === address)
    if (!existing) {
      const entry = {
        email: (row.email ?? '').trim(),
        name: tidyName(row.name),
        tags: [],
        joined: row.joined,
        unsubscribed: Boolean(row.unsubscribed),
        rows: 1,
        valid: address !== null,
      }
      addTags(entry, row.tags)
      list.push(entry)
      continue
    }
    existing.rows++
    if (!existing.name) existing.name = tidyName(row.name)
    addTags(existing, row.tags)
    if (row.joined < existing.joined) existing.joined = row.joined
    if (row.unsubscribed) existing.unsubscribed = true
  }
  return list
}

/** Who gets the next newsletter. */
export const mailOut = (list) => list.filter((entry) => entry.valid && !entry.unsubscribed)
