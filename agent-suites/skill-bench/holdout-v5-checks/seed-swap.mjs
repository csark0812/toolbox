// Hidden acceptance for the seed catalogue refactor: the static-only class and the default
// export are gone, plain named functions remain, and every command (including the string-keyed
// lookups, the lazily imported report and the detached normalize in labels) prints the same
// output and leaves the same catalogue file.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { cpSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { execFileSync, spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const source = readFileSync(join(dir, 'src/catalog.mjs'), 'utf8')
assert.doesNotMatch(source, /\bclass\b/, 'the Catalog class is gone')
assert.doesNotMatch(source, /export\s+default/, 'no default export')
const catalog = await import(pathToFileURL(join(dir, 'src/catalog.mjs')).href)
assert.ok(!('default' in catalog), 'no default export')
for (const name of ['all', 'search', 'byFamily', 'add', 'withdraw', 'normalize'])
  assert.equal(typeof catalog[name], 'function', `${name} is a named export`)
assert.equal(catalog.normalize('  Red   Russian '), 'red russian')

const work = mkdtempSync(join(tmpdir(), 'seeds-check-'))
try {
  cpSync(dir, work, { recursive: true, filter: (path) => !path.includes('.git') })
  const steps = [
    ['find', 'tiger'],
    ['find', 'nothing like it'],
    ['family', 'FABACEAE'],
    ['add', 'Black Krim', 'Solanaceae', 'Ines', '2026', '3'],
    ['add', 'tigerella', 'Solanaceae', 'Owen', '2025', '2'],
    ['add', 'Broken', 'Solanaceae', 'Owen', '2025', '0'],
    ['take', 'Tigerella', '3'],
    ['take', 'Black Krim', '5'],
    ['report'],
    ['labels'],
    ['find', 'krim'],
    ['nonsense'],
  ]
  const transcript = steps.map((args) => {
    const run = spawnSync(process.execPath, ['bin/seeds.mjs', ...args], {
      cwd: work,
      encoding: 'utf8',
    })
    return [args.join(' '), run.status, run.stdout, run.stderr]
  })
  const hash = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16)
  const GOLDEN = [
    '3a01947fe349e7ce',
    'b22c4560b6bc360b',
    '4fabc2eb13e50185',
    '7b5360d355e1e233',
    'f40bc233dde40fe8',
    '4be121abe2e0cf0e',
    '87f43a5d793bc2a5',
    '4d58fcbc9089d90c',
    '7a2caa17a3b56d70',
    '7940447c728c0dc7',
    '856563b29f20fc87',
    'a31148d92a45bf14',
  ]
  const FILE = '2218daa85074ca01'
  transcript.forEach((entry, i) =>
    assert.equal(
      hash(JSON.stringify(entry)),
      GOLDEN[i],
      `seeds ${entry[0]}: ${JSON.stringify(entry)}`,
    ),
  )
  assert.equal(
    hash(readFileSync(join(work, 'data/seeds.json'))),
    FILE,
    'the catalogue file ends the same',
  )
} finally {
  rmSync(work, { recursive: true, force: true })
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
