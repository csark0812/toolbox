function personById(people, id) {
  const person = people.find((entry) => entry.id === id)
  if (!person) throw new Error(`no person ${id} in the tree`)
  return person
}

/** Everyone `id` descends from, with the fewest generations to each (themselves at 0). */
export function ancestors(people, id) {
  const found = [{ id, steps: 0 }]
  for (let i = 0; i < found.length; i++) {
    const person = personById(people, found[i].id)
    for (const parent of [person.mother, person.father]) {
      if (!parent) continue
      if (found.some((entry) => entry.id === parent)) continue
      found.push({ id: parent, steps: found[i].steps + 1 })
    }
  }
  return found
}

/** The nearest common ancestor of `a` and `b`: { ancestor, up, down }, or null. */
export function kinship(people, a, b) {
  const fromA = ancestors(people, a)
  const fromB = ancestors(people, b)
  let best = null
  for (const left of fromA) {
    const right = fromB.find((entry) => entry.id === left.id)
    if (!right) continue
    const option = { ancestor: left.id, up: left.steps, down: right.steps }
    const better =
      !best ||
      option.up + option.down < best.up + best.down ||
      (option.up + option.down === best.up + best.down &&
        (option.up < best.up || (option.up === best.up && option.ancestor < best.ancestor)))
    if (better) best = option
  }
  return best
}

/** Plain words for a kinship result. */
export function describe({ up, down }) {
  if (up === 0 && down === 0) return 'the same person'
  if (up === 0) return down === 1 ? 'parent' : `${'great-'.repeat(down - 2)}grandparent`
  if (down === 0) return up === 1 ? 'child' : `${'great-'.repeat(up - 2)}grandchild`
  if (up === 1 && down === 1) return 'sibling'
  const degree = Math.min(up, down) - 1
  const removed = Math.abs(up - down)
  if (degree === 0)
    return removed === 1
      ? 'aunt, uncle, niece or nephew'
      : 'great-aunt, great-uncle or grand-nibling'
  const ordinal = ['', '1st', '2nd', '3rd'][degree] ?? `${degree}th`
  return `${ordinal} cousin${removed ? ` ${removed}x removed` : ''}`
}
