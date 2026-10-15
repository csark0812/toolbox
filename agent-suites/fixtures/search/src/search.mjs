// Returns ids of products whose name contains every query word (case-insensitive), shortest name first.

export function search(products, query) {
  const words = query.split(' ').filter(Boolean)
  const hits = []
  for (const product of products) {
    let all = true
    for (const word of words) {
      if (
        !product.name
          .toLowerCase()
          .split(' ')
          .some((part) => part.includes(word.toLowerCase()))
      ) {
        all = false
      }
    }
    if (all) hits.push(product)
  }
  return hits
    .sort((a, b) => a.name.length - b.name.length || a.id - b.id)
    .map((product) => product.id)
}
