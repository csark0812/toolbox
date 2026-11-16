#!/usr/bin/env node
// The pick log: one record of every round and its pick, shared by all worktrees of a project.
//   node <skill>/scripts/record.mjs path                     print where the log lives
//   node <skill>/scripts/record.mjs status                   none-streak, Drop traits, STOP line
//   node <skill>/scripts/record.mjs add --round <name> --mode <directions|variables|in-app|question>
//        --asked "..." [--options "..."] --picked "<letter, mix or none>" [--reason "..."]
//        [--keep "..."] [--drop "..."] [--open "..."] [--reference "..."] [--carry "..."]
//        [--components "..."] [--data "..."] [--exceptions "..."] [--tokens "..."]
// The log lives in the repository's common git directory (<git-common-dir>/swatches/picks.md), so a
// worktree that is removed takes none of it along. Outside git it is <project>/.swatches/picks.md.
// --project <dir> picks the project (default: the current folder); --log <file> overrides the path.
// After `add`, a Keep or Drop trait that also appears in another project's log is offered for the
// private taste profile ($TASTE_PROFILE, default ~/.agents/taste-profile.md); nothing is written there.
// Node 22+, no dependencies.
import { execFileSync } from 'node:child_process'
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

/** Where the project's pick log lives: the common git directory, else the project's `.swatches/`. */
export function logPath(project = process.cwd()) {
  try {
    const common = execFileSync(
      'git',
      ['rev-parse', '--path-format=absolute', '--git-common-dir'],
      { cwd: project, stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' },
    ).trim()
    return join(common, 'swatches', 'picks.md')
  } catch {
    return join(resolve(project), '.swatches', 'picks.md')
  }
}

/** The project's name for cross-project trait matching: the main checkout's folder name. */
function projectName(log) {
  const parent = dirname(dirname(log))
  return basename(basename(parent) === '.git' ? dirname(parent) : parent)
}

/** Each `## ` entry with its fields, oldest first. */
export function readEntries(text) {
  return text
    .split(/^## /m)
    .slice(1)
    .map((block) => {
      const [title, ...lines] = block.split('\n')
      const fields = {}
      for (const line of lines) {
        const match = line.match(/^([A-Z][A-Za-z ]+):\s*(.*)$/)
        if (match) fields[match[1].toLowerCase()] = match[2].trim()
      }
      return { title: title.trim(), fields }
    })
}

/** One trait as compared: lowercase words joined by hyphens. */
const normal = (trait) =>
  trait
    .toLowerCase()
    .replace(/["“”']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** The traits listed in a field such as `Drop: glow, accent flash · heavier ink`. */
export const traits = (field = '') => field.split(/[,;·]/).map(normal).filter(Boolean)

const sameTrait = (a, b) => a === b || `-${a}-`.includes(`-${b}-`) || `-${b}-`.includes(`-${a}-`)

/** How many rounds in a row, ending with the newest, were answered "none". */
export function noneStreak(entries) {
  let streak = 0
  for (const entry of [...entries].reverse()) {
    if (!/^none\b/i.test(entry.fields.picked ?? '')) break
    streak++
  }
  return streak
}

/** Every Drop trait in the log. */
export const droppedTraits = (entries) => [
  ...new Set(entries.flatMap((entry) => traits(entry.fields.drop))),
]

/** The option traits that repeat something the user dropped. */
export const matchesDrop = (optionTraits, dropped) =>
  optionTraits.map(normal).filter((trait) => dropped.some((drop) => sameTrait(trait, drop)))

/** Older per-checkout logs: this project's `.swatches/picks.md`, then the main checkout's. */
export const olderLogs = (log, project = process.cwd()) =>
  [
    join(resolve(project), '.swatches', 'picks.md'),
    join(dirname(dirname(dirname(log))), '.swatches', 'picks.md'),
  ].filter((path) => path !== log && existsSync(path))

/** The log's text: the shared log, or an older per-checkout log until the first shared write. */
export function readLog(log, project) {
  if (existsSync(log)) return readFileSync(log, 'utf8')
  const [older] = olderLogs(log, project)
  return older ? readFileSync(older, 'utf8') : ''
}

/** The log's state as the next round sees it, with the STOP line when two "none" answers ran. */
export function status(log, project) {
  const entries = readEntries(readLog(log, project))
  const streak = noneStreak(entries)
  return {
    log,
    entries: entries.length,
    streak,
    dropped: droppedTraits(entries),
    stop:
      streak >= 2
        ? `STOP: ${streak} rounds of none in a row. Ask the user one question (a reference, or which axis is wrong) and record it with --mode question before building another round.`
        : null,
  }
}

const FIELDS = [
  ['asked', 'Asked'],
  ['options', 'Options'],
  ['keep', 'Keep'],
  ['drop', 'Drop'],
  ['open', 'Open'],
  ['reference', 'Reference'],
  ['carry', 'Carry into build'],
  ['components', 'Components'],
  ['data', 'Data'],
  ['exceptions', 'Exceptions'],
  ['tokens', 'Settled tokens'],
]

/** One entry as Markdown, in the log's field order. */
export function formatEntry(values, date = new Date()) {
  const day = date.toLocaleDateString('en-CA')
  const lines = [`## ${day} · ${values.round} · ${values.mode}`, '']
  for (const [key, label] of FIELDS.slice(0, 2))
    if (values[key]) lines.push(`${label}: ${values[key]}`)
  const picked = values.picked ?? (values.mode === 'question' ? 'answered' : '')
  lines.push(`Picked: ${picked}${values.reason ? ` · "${values.reason}"` : ''}`)
  for (const [key, label] of FIELDS.slice(2))
    if (values[key]) lines.push(`${label}: ${values[key]}`)
  return `${lines.join('\n')}\n`
}

/**
 * A first write to the shared log carries over an older `.swatches/picks.md`, from this worktree or
 * from the main checkout beside the common git directory.
 */
function startLog(log, project) {
  if (existsSync(log)) return null
  mkdirSync(dirname(log), { recursive: true })
  const [older] = olderLogs(log, project)
  if (older) {
    writeFileSync(log, readFileSync(older, 'utf8').replace(/\n*$/, '\n\n'))
    return older
  }
  writeFileSync(log, '')
  return null
}

/** Traits from this entry that another project's log also kept or dropped. */
function profileCandidates(values, log) {
  const store = process.env.SWATCHES_TRAITS ?? join(homedir(), '.toolbox', 'swatches-traits.jsonl')
  const profile = process.env.TASTE_PROFILE ?? join(homedir(), '.agents', 'taste-profile.md')
  const project = projectName(log)
  const seen = existsSync(store)
    ? readFileSync(store, 'utf8')
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line))
    : []
  const inProfile = existsSync(profile) ? normal(readFileSync(profile, 'utf8')) : ''
  const fresh = [
    ...traits(values.keep).map((trait) => ({ kind: 'keep', trait })),
    ...traits(values.drop).map((trait) => ({ kind: 'drop', trait })),
  ]
  mkdirSync(dirname(store), { recursive: true })
  for (const row of fresh) appendFileSync(store, `${JSON.stringify({ ...row, project })}\n`)
  return fresh.flatMap((row) => {
    const others = [
      ...new Set(
        seen
          .filter((old) => old.kind === row.kind && old.project !== project)
          .filter((old) => sameTrait(old.trait, row.trait))
          .map((old) => old.project),
      ),
    ]
    if (!others.length || `-${inProfile}-`.includes(`-${row.trait}-`)) return []
    return [
      `PROFILE? ${row.kind} "${row.trait}" also came up in ${others.join(', ')}. Ask the user before adding it to ${profile}.`,
    ]
  })
}

function parse(argv) {
  const values = {}
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue
    values[argv[i].slice(2)] = argv[i + 1]
    i++
  }
  return values
}

function main() {
  const [command, ...rest] = process.argv.slice(2)
  const values = parse(rest)
  const project = values.project ?? process.cwd()
  const log = values.log ? resolve(values.log) : logPath(project)
  if (command === 'path') return console.log(log)
  if (command === 'status') {
    const state = status(log, project)
    console.log(`log: ${state.log} (${state.entries} entries)`)
    console.log(`none in a row: ${state.streak}`)
    console.log(`dropped traits: ${state.dropped.join(', ') || '(none)'}`)
    if (state.stop) console.log(state.stop)
    return
  }
  if (command === 'add') {
    const missing = ['round', 'mode', 'asked'].filter((key) => !values[key])
    if (values.mode !== 'question' && !values.picked) missing.push('picked')
    if (missing.length) {
      console.error(`record.mjs add: missing --${missing.join(', --')}`)
      process.exit(2)
    }
    const carried = startLog(log, project)
    if (carried) console.log(`carried over the older log at ${carried}`)
    appendFileSync(log, `${readFileSync(log, 'utf8').trim() ? '\n' : ''}${formatEntry(values)}`)
    const state = status(log, project)
    console.log(`recorded in ${log} (${state.entries} entries, none in a row: ${state.streak})`)
    if (state.stop) console.log(state.stop)
    for (const line of profileCandidates(values, log)) console.log(line)
    return
  }
  console.error(
    'Usage: node record.mjs path | status | add --round <name> --mode <mode> --asked "..." --picked "..." [--keep, --drop, --open, --reference, --carry, --components, --data, --exceptions, --tokens]',
  )
  process.exit(2)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main()
