// Returns the items for a 1-based page number.
export function paginate(items, page, pageSize) {
  const start = (page - 1) * pageSize
  return items.slice(Math.max(0, start - 1), start + pageSize - 1)
}
