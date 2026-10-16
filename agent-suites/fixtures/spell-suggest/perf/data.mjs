// A full-size archive dictionary and a batch of misspelt searches, generated the same way every
// time.
const SYLLABLES = [
  'ar',
  'be',
  'cha',
  'den',
  'el',
  'for',
  'gra',
  'hol',
  'in',
  'ker',
  'lo',
  'man',
].concat(['nor', 'ost', 'pen', 'qui', 'ra', 'ste', 'tor', 'un', 'ver', 'wy', 'ash', 'bro'])

export function makeArchive() {
  let seed = 20261016
  const next = () => (seed = (seed * 48271) % 2147483647)
  const seen = new Set()
  const dictionary = []
  while (dictionary.length < 9000) {
    let word = ''
    const parts = 2 + (next() % 3)
    for (let i = 0; i < parts; i++) word += SYLLABLES[next() % SYLLABLES.length]
    if (seen.has(word)) continue
    seen.add(word)
    dictionary.push({ word, frequency: 1 + (next() % 500) })
  }
  const searches = []
  for (let i = 0; i < 60; i++) {
    const letters = [...dictionary[next() % dictionary.length].word]
    const at = next() % letters.length
    const edit = next() % 4
    if (edit === 0) letters.splice(at, 1)
    else if (edit === 1) letters.splice(at, 0, 'e')
    else if (edit === 2) letters[at] = 'o'
    searches.push(i % 7 === 0 ? letters.join('').toUpperCase() : letters.join(''))
  }
  return { dictionary, searches }
}
