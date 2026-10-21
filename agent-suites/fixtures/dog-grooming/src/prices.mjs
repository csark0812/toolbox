export const GROOM = { small: 30, medium: 38, large: 46 }
export const EXTRAS = { nails: 5, 'flea bath': 8, teeth: 6 }
export const FREE_EVERY = 6

/** Every groom with its number for that dog, whether it is the free one, and its price in pounds. */
export function priceGrooms(grooms) {
  const counts = {}
  return grooms.map((groom) => {
    counts[groom.dog] = (counts[groom.dog] ?? 0) + 1
    const number = counts[groom.dog]
    const free = number % FREE_EVERY === 0
    const extras = groom.extras.reduce((sum, extra) => sum + EXTRAS[extra], 0)
    const price = free ? 0 : GROOM[groom.size] + extras
    return { groom, number, free, price }
  })
}
