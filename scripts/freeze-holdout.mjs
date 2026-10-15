#!/usr/bin/env node
// Hash every held-out input so a later edit is visible. Run with --write only to re-freeze on purpose;
// re-freezing after seeing results voids the held-out claim, so record why in the commit.
//   node scripts/freeze-holdout.mjs [--set holdout-v2] [--write]
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const lockPath = (set) => `agent-suites/skill-bench/${set}.lock.json`

function files(path) {
  if (statSync(path).isFile()) return [path]
  return readdirSync(path)
    .sort()
    .flatMap((name) => files(join(path, name)))
}

/** Every file a held-out task depends on, in a stable order. */
export function holdoutFiles(set = 'holdout') {
  const holdout = JSON.parse(readFileSync(`agent-suites/skill-bench/${set}.json`, 'utf8'))
  const fixtures = [
    ...new Set(holdout.tasks.map((task) => `agent-suites/fixtures/${fixtureOf(task)}`)),
  ]
  return [
    `agent-suites/skill-bench/${set}.json`,
    ...files(`agent-suites/skill-bench/${set}-checks`),
    ...(existsSync(`agent-suites/skill-bench/${set}-seeds`)
      ? files(`agent-suites/skill-bench/${set}-seeds`)
      : []),
    ...fixtures.sort().flatMap(files),
  ]
}

function fixtureOf(task) {
  const path =
    task.claim.fixtureGate ?? task.claim.frozenPaths?.[0] ?? `agent-suites/fixtures/${task.check}`
  return path.split('/')[2]
}

export function holdoutDigest(set = 'holdout') {
  const hash = createHash('sha256')
  for (const file of holdoutFiles(set))
    hash.update(file).update('\0').update(readFileSync(file)).update('\0')
  return hash.digest('hex')
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const at = process.argv.indexOf('--set')
  const set = at > 0 ? process.argv[at + 1] : 'holdout'
  const digest = holdoutDigest(set)
  if (process.argv.includes('--write')) {
    writeFileSync(
      lockPath(set),
      JSON.stringify({ sha256: digest, files: holdoutFiles(set).length }, null, 2) + '\n',
    )
    console.log(`Froze ${holdoutFiles(set).length} ${set} files: ${digest}`)
  } else console.log(digest)
}
