export const DELIVERY_PENCE = 800

/** The tagged tree's height in centimetres. */
export function heightCm(tag) {
  return parseFloat(tag.height)
}

/** The tree price, in pence, for a tree of `cm` centimetres. */
export function bandPrice(cm) {
  if (cm <= 150) return 3000
  if (cm < 180) return 4200
  return 5500
}

/** The invoice for one tagged tree, in pence. */
export function invoice(tag) {
  const cm = heightCm(tag)
  const tree = bandPrice(cm)
  const delivery = tag.delivery ? DELIVERY_PENCE : 0
  return { cm, tree, delivery, total: tree + delivery }
}
