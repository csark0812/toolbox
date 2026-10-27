import { isHeld } from './dates.mjs'
import { items } from './store.mjs'

/** What a passenger may see of an item. */
export const publicView = ({ id, title, category, foundOn }) => ({ id, title, category, foundOn })

/** Searches the items still on the shelf. */
export function searchItems(request, session) {
  if (!session) return { status: 401, body: { error: 'sign in' } }
  const words = String(request.query.q ?? '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
  const found = items().filter(
    (item) =>
      item.status === 'open' &&
      isHeld(item, request.today) &&
      words.every((word) => `${item.title} ${item.category}`.toLowerCase().includes(word)),
  )
  return { status: 200, body: found.map(publicView) }
}
