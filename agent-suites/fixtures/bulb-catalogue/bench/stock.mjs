// Last season's stock, generated deterministically: 5000 sacks, about 1000 cultivars.
export function makeStock(size = 5000, cultivars = 400) {
  let seed = 11
  const next = () => (seed = (seed * 1103515245 + 12345) % 2147483648) >>> 8
  const sacks = []
  for (let index = 0; index < size; index++) {
    const month = 1 + (next() % 12)
    const day = 1 + (next() % 28)
    sacks.push({
      cultivar: `${['early', 'late', 'dwarf', 'giant'][next() % 4]} cultivar ${next() % cultivars}`,
      grams: 250 + (next() % 750),
      lifted: `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    })
  }
  return sacks
}
