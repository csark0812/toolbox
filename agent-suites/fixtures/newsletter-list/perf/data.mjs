// The whole imported history: the website sign-ups plus the old branch spreadsheets, generated the same way every time.
export function makeRows() {
  let seed = 20261014
  const next = () => (seed = (seed * 48271) % 2147483647)
  const FIRST = ['Ann', 'Bilal', 'Cora', 'Dev', 'Esme', 'Femi', 'Gus', 'Hana', 'Ivo', 'June']
  const LAST = ['Okafor', 'Price', 'Nolan', 'Shah', 'Lund', 'Reyes', 'Byrne', 'Kaur', 'Moss']
  const DOMAINS = [
    'gmail.com',
    'googlemail.com',
    'btinternet.com',
    'outlook.com',
    'stonebridge.org.uk',
  ]
  const TAGS = ['walks', 'Walks', 'planting', 'committee', 'litter-pick', 'history', ' newsletter ']
  const people = Array.from({ length: 1900 }, (_, i) => ({
    first: FIRST[i % FIRST.length],
    last: LAST[(i * 7) % LAST.length],
    n: i,
    domain: DOMAINS[next() % DOMAINS.length],
  }))
  const rows = []
  for (let i = 0; i < 3200; i++) {
    const p = people[next() % people.length]
    let local = `${p.first}.${p.last}${p.n}`
    if (p.domain.endsWith('gmail.com') && next() % 3 === 0) local = local.replace('.', '') + '+club'
    const domain = p.domain === 'gmail.com' && next() % 4 === 0 ? 'googlemail.com' : p.domain
    let email = `${local}@${domain}`
    if (next() % 5 === 0) email = ` ${email.toUpperCase()}`
    if (next() % 60 === 0) email = next() % 2 ? '' : `${p.first} ${p.last} (no email)`
    rows.push({
      email,
      name: next() % 6 === 0 ? '' : `${p.first}  ${p.last}`,
      tags: Array.from({ length: next() % 3 }, () => TAGS[next() % TAGS.length]),
      joined:
        next() % 7 === 0
          ? undefined
          : `20${15 + (next() % 11)}-${String(1 + (next() % 12)).padStart(2, '0')}-${String(1 + (next() % 28)).padStart(2, '0')}`,
      unsubscribed: next() % 23 === 0,
    })
  }
  return rows
}
