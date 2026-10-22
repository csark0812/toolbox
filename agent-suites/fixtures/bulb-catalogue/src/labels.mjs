// Shelf label: "Early Cultivar 12 - 4.5 kg - lifted 3 Mar 2025".
export function label(cultivar, grams, lifted) {
  const months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')
  const name = cultivar
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  const [year, month, day] = lifted.split('-').map(Number)
  return `${name} - ${(grams / 1000).toFixed(1)} kg - lifted ${day} ${months[month - 1]} ${year}`
}
