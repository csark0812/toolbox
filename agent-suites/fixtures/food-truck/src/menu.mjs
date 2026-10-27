/** Pence as pounds, like £7.50. */
export const pounds = (pence) => `£${(pence / 100).toFixed(2)}`

/** The menu item with this name. */
export function itemNamed(menu, name) {
  const item = menu.find((entry) => entry.name === name)
  if (!item) throw new Error(`Not on the menu: ${name}`)
  return item
}

/** The menu board line for an item: its name, price and allergens. */
export function boardLine(item) {
  const allergens = item.allergens.length ? `  (${item.allergens.join(', ')})` : ''
  return `${item.name.padEnd(14)}${pounds(item.pence).padStart(6)}${allergens}`
}
