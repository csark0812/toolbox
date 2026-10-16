// A synthetic quarter of shifts: deterministic, so every run times the same work.
export function makeQuarter() {
  let seed = 20260901
  const next = () => (seed = (seed * 48271) % 2147483647)
  const first = ['Ruth', 'Ana', 'Kofi', 'Mei', 'Jonas', 'Priya', 'Tomás', 'Ines', 'Yuki', 'Omar']
  const last = ['Okafor', 'Lima', 'Mensah', 'Chen', 'Berg', 'Rao', 'Ruiz', 'Sousa', 'Ito', 'Haddad']
  const people = []
  for (let i = 0; i < 400; i++)
    people.push({ id: `p${i}`, name: `${first[i % 10]} ${last[Math.floor(i / 10) % 10]} ${i}` })
  const projects = ['harbor', 'atlas', 'zephyr', 'kiln', 'orchard', 'beacon', 'quarry', 'delta']
  const pad = (n) => String(n).padStart(2, '0')
  const entries = []
  for (let i = 0; i < 30000; i++) {
    const day = new Date(Date.UTC(2026, 6, 1) + (next() % 92) * 86400000)
    const start = 6 + (next() % 14)
    const length = 2 + (next() % 9)
    entries.push({
      person: next() % 97 === 0 ? `ghost${i}` : `p${next() % 400}`,
      project: projects[next() % projects.length],
      date: day.toISOString().slice(0, 10),
      start: `${pad(start)}:${pad((next() % 4) * 15)}`,
      end: `${pad((start + length) % 24)}:${pad((next() % 4) * 15)}`,
    })
  }
  return { people, entries }
}
