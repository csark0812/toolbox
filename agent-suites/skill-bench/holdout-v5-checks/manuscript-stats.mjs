// Hidden acceptance for the manuscript word counts: letters outside ASCII are part of words
// (the ASCII-only \w split accented words apart), contractions stay one word, and the chapter
// table matches the editors' rule (whitespace-separated tokens with a letter or digit).
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { countWords } = await import(pathToFileURL(join(dir, 'src/count.mjs')).href)
const cases = [
  ['Zażółć gęślą jaźń', 3],
  ["C'était déjà l'été, ou presque.", 5],
  ['naïve café au lait', 4],
  ["Don't panic, it's 1987.", 4],
  ['Ελλάδα και Κύπρος', 3],
  ['Добрый вечер', 2],
  ['À minuit, le couloir était silencieux.', 6],
  ['The market opens at six.', 5],
  ["We didn't believe her brother's story.", 6],
]
for (const [text, want] of cases) assert.equal(countWords(text), want, JSON.stringify(text))

const pad = (name, words, sentences, minutes) =>
  `${name.padEnd(16)} ${String(words).padStart(6)} words  ${String(sentences).padStart(3)} sentences  ${minutes} min`
const sentences = { 'ch01-en.md': 8, 'ch02-en.md': 6, 'ch03-fr.md': 9, 'ch04-pl.md': 6 }
let total = 0
const lines = readdirSync(join(dir, 'chapters'))
  .filter((name) => name.endsWith('.md'))
  .sort()
  .map((name) => {
    const text = readFileSync(join(dir, 'chapters', name), 'utf8').replace(/^#+\s*/gm, '')
    const words = text.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length
    total += words
    return pad(name, words, sentences[name], Math.ceil(words / 230))
  })
assert.deepEqual(
  lines.map((line) => line.trim().split(/\s+/).slice(0, 2)),
  [
    ['ch01-en.md', '117'],
    ['ch02-en.md', '93'],
    ['ch03-fr.md', '137'],
    ['ch04-pl.md', '78'],
  ],
  'the chapters are as shipped',
)
const out = execFileSync(process.execPath, ['bin/stats.mjs', 'chapters'], {
  cwd: dir,
  encoding: 'utf8',
})
assert.equal(
  out,
  [...lines, `${'total'.padEnd(16)} ${String(total).padStart(6)} words  2 min`].join('\n') + '\n',
)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
