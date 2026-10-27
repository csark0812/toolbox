#!/usr/bin/env node
// Everything the first hillclimb step needs, in one command and one short output.
//   node <skill>/scripts/orient.mjs <project-dir> [--test "<cmd>"] [--max-files 40] -- <bench command...>
// Prints the project's files (code capped at about 150 lines each, data at about 600 bytes), the
// branch and the git status of that folder only, one bench run, a test summary, the five hottest
// functions of a profiled bench run (Node benches only) and the HEAD sha to pass to ab.mjs --ref.
// Every path is resolved from <project-dir>, so it works from any current folder.
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { extname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { hotspots } from './hot.mjs'

const CODE_LINES = 150
const DATA_BYTES = 600
const DATA = new Set([
  '.json',
  '.csv',
  '.tsv',
  '.txt',
  '.ndjson',
  '.jsonl',
  '.xml',
  '.yaml',
  '.yml',
  '.lock',
  '.log',
  '.svg',
  '.sql',
])

/** A file's text for the listing: code keeps its first lines, data its first bytes. */
export function excerpt(path, text) {
  if (text.includes('\0')) return '(binary, skipped)'
  if (DATA.has(extname(path).toLowerCase()) || /lock/i.test(path)) {
    return text.length > DATA_BYTES
      ? `${text.slice(0, DATA_BYTES)}\n... (${text.length - DATA_BYTES} more bytes)`
      : text
  }
  const lines = text.split('\n')
  return lines.length > CODE_LINES + 10
    ? `${lines.slice(0, CODE_LINES).join('\n')}\n... (${lines.length - CODE_LINES} more lines)`
    : text
}

/** The last few non-empty lines, joined, for one-line summaries. */
const tail = (text, count = 3) =>
  text
    .trim()
    .split('\n')
    .filter((line) => line.trim())
    .slice(-count)
    .join('\n')

/** pass/fail counts from node:test, vitest, jest or mocha output; otherwise the last lines. */
export function testSummary(output) {
  const counts = [...output.matchAll(/^[#ℹ]\s*(tests|pass|fail)\s+(\d+)\s*$/gm)].map(
    (match) => `${match[1]} ${match[2]}`,
  )
  if (counts.length) return counts.join(', ')
  const line = output
    .split('\n')
    .reverse()
    .find((text) => /\b\d+\s+(passed|failed|passing|failing)\b/i.test(text))
  return line?.trim() ?? tail(output, 2)
}

/** Pick the profile that spent the most self time inside the project. */
export function pickProfile(profiles, dir) {
  let best
  for (const profile of profiles) {
    const inProject = profile.nodes.filter((node) => node.callFrame.url.startsWith('file://'))
    const ids = new Set(
      inProject
        .filter((node) => fileURLToPath(node.callFrame.url).startsWith(dir))
        .map((node) => node.id),
    )
    const deltas = profile.timeDeltas ?? []
    const time = profile.samples.reduce(
      (sum, id, index) => sum + (ids.has(id) ? (deltas[index] ?? 0) : 0),
      0,
    )
    if (!best || time > best.time) best = { profile, time }
  }
  return best?.profile
}

const walk = (dir, root = dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (['node_modules', '.git', '.hillclimb'].includes(entry.name)) return []
    const path = join(dir, entry.name)
    return entry.isDirectory() ? walk(path, root) : [relative(root, path)]
  })

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const args = process.argv.slice(2)
  const split = args.indexOf('--')
  const command = split === -1 ? [] : args.slice(split + 1)
  const flags = split === -1 ? args : args.slice(0, split)
  const option = (name, fallback) => {
    const index = flags.indexOf(`--${name}`)
    return index === -1 ? fallback : flags[index + 1]
  }
  const target = flags.find(
    (flag, index) => !flag.startsWith('--') && !flags[index - 1]?.startsWith('--'),
  )
  if (!target || !command.length) {
    console.error('Usage: orient.mjs <project-dir> [--test "<cmd>"] -- <bench command...>')
    process.exit(2)
  }
  const dir = resolve(target)
  const scripts = fileURLToPath(new URL('.', import.meta.url))
  const git = (...gitArgs) => {
    const result = spawnSync('git', gitArgs, { cwd: dir, encoding: 'utf8' })
    return result.status === 0 ? result.stdout.trim() : undefined
  }
  const inGit = git('rev-parse', '--is-inside-work-tree') === 'true'
  console.log(`project: ${dir}`)
  console.log(`scripts: ${scripts}`)

  const files = (
    inGit
      ? (git('ls-files', '--cached', '--others', '--exclude-standard', '.') ?? '').split('\n')
      : walk(dir)
  )
    .filter((file) => file && existsSync(join(dir, file)) && statSync(join(dir, file)).isFile())
    .sort()
  const maxFiles = Number(option('max-files', 40))
  for (const file of files.slice(0, maxFiles)) {
    console.log(`== ${file}`)
    console.log(excerpt(file, readFileSync(join(dir, file), 'utf8')).trimEnd())
  }
  if (files.length > maxFiles)
    console.log(`== ${files.length - maxFiles} more files: ${files.slice(maxFiles).join(' ')}`)

  if (inGit) {
    console.log(`== git: branch ${git('branch', '--show-current') || '(detached)'}`)
    console.log(git('status', '--short', '--', '.') || 'clean')
  } else console.log('== git: not a repository')

  const run = (env = {}) =>
    spawnSync(command[0], command.slice(1), {
      cwd: dir,
      encoding: 'utf8',
      env: { ...process.env, ...env },
      maxBuffer: 64 * 1024 * 1024,
      shell: command.length === 1 && /\s/.test(command[0]),
    })
  const bench = run()
  console.log(`== bench: \`${command.join(' ')}\` exit ${bench.status}`)
  console.log(tail(`${bench.stdout}\n${bench.status ? bench.stderr : ''}`))

  let testCommand = option('test')
  if (!testCommand && existsSync(join(dir, 'package.json'))) {
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
    if (pkg.scripts?.test) testCommand = 'npm test --silent'
  }
  if (testCommand) {
    const tests = spawnSync('sh', ['-c', testCommand], {
      cwd: dir,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    })
    console.log(
      `== tests: \`${testCommand}\` exit ${tests.status}: ${testSummary(`${tests.stdout}\n${tests.stderr}`)}`,
    )
  } else console.log('== tests: no test command found; pass --test "<cmd>"')

  const profileDir = mkdtempSync(join(process.env.TMPDIR ?? tmpdir(), 'hillclimb-prof-'))
  try {
    const options = [process.env.NODE_OPTIONS, `--cpu-prof --cpu-prof-dir=${profileDir}`]
    run({ NODE_OPTIONS: options.filter(Boolean).join(' ') })
    const profiles = readdirSync(profileDir)
      .filter((name) => name.endsWith('.cpuprofile'))
      .map((name) => JSON.parse(readFileSync(join(profileDir, name), 'utf8')))
    const profile = pickProfile(profiles, dir)
    if (!profile) console.log('== profile: none written (not a Node bench); profile it by hand')
    else {
      console.log('== profile: hottest functions by self time')
      for (const { name, ms, share } of hotspots(profile, 5, dir))
        console.log(`${String(share).padStart(3)}%  ${ms} ms  ${name}`)
    }
  } catch (error) {
    console.log(`== profile: failed (${error.message})`)
  } finally {
    rmSync(profileDir, { recursive: true, force: true })
  }

  if (inGit) console.log(`== HEAD ${git('rev-parse', 'HEAD')} (the baseline for ab.mjs --ref)`)
}
