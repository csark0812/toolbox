/** How many of the repairs had this outcome. */
const count = (repairs, outcome) => repairs.filter((repair) => repair.outcome === outcome).length

/** Lines of the end-of-session report. */
export function report(repairs) {
  return [
    `Items seen: ${repairs.length}`,
    `Fixed: ${count(repairs, 'fixed')}`,
    `Advice given: ${count(repairs, 'advice')}`,
    `Not fixable: ${count(repairs, 'unfixable')}`,
  ]
}
