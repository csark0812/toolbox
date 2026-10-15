// Deterministic production-sized catalog: 20000 products.
const WORDS = [
  'steel',
  'blue',
  'large',
  'small',
  'oak',
  'table',
  'lamp',
  'chair',
  'red',
  'mat',
  'pro',
  'mini',
  'desk',
  'cable',
  'usb',
  'wood',
  'glass',
  'black',
  'white',
  'set',
]
export function makeCatalog(size = 20000) {
  let seed = 11
  const next = () => (seed = (seed * 1103515245 + 12345) % 2147483648) >>> 8
  return Array.from({ length: size }, (_, id) => ({
    id,
    name: Array.from({ length: 3 + (next() % 4) }, () => WORDS[next() % WORDS.length]).join(' '),
  }))
}
