// The society's full tree and a batch of look-ups, generated the same way every time.
export function makeTree() {
  let seed = 20261016
  const next = () => (seed = (seed * 48271) % 2147483647)
  const people = []
  const generations = []
  const id = (n) => `H${String(n).padStart(5, '0')}`
  for (let g = 0; g < 11; g++) {
    const size = g === 0 ? 40 : 40 + g * 34
    const born = []
    for (let i = 0; i < size; i++) {
      const previous = generations[g - 1]
      const person = {
        id: id(people.length),
        name: `Person ${people.length}`,
        mother: null,
        father: null,
      }
      if (previous && next() % 9 !== 0) {
        person.mother = previous[next() % previous.length].id
        let father = previous[next() % previous.length].id
        if (father === person.mother) father = previous[(next() + 1) % previous.length].id
        person.father = father === person.mother ? null : father
      }
      people.push(person)
      born.push(person)
    }
    generations.push(born)
  }
  // Shuffle so records are not in generation order, as in the society's files.
  for (let i = people.length - 1; i > 0; i--) {
    const j = next() % (i + 1)
    ;[people[i], people[j]] = [people[j], people[i]]
  }
  const youngest = generations.at(-1)
  const middle = generations[6]
  const lookUps = []
  for (let q = 0; q < 150; q++) {
    const pool = q % 3 === 0 ? middle : youngest
    lookUps.push([youngest[next() % youngest.length].id, pool[next() % pool.length].id])
  }
  return { people, lookUps }
}
