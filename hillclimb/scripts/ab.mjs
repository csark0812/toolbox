#!/usr/bin/env node
// Alternate a benchmark between a git ref and the working tree, and print one summary line.
//   node <skill>/scripts/ab.mjs [--ref HEAD] [--rounds 5] [--field medianMs] -- <bench command...>
// Run it from the folder the command runs in. The ref's copy of that folder is exported to a temporary
// directory (node_modules is linked, not copied), then the command runs A, B, A, B... for the given
// rounds. Each run's last JSON line is read: --field names the number to compare (default: the first
// number in the last line of output), and `errors` and `work` fields are reported when present.
// The output is one line per side plus the verdict, so a keep decision costs a few lines of context.
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

/** The compared number and the error and work counts from one run's output. */
export function readRun(output, field) {
  const lines = output.trim().split('\n').reverse()
  for (const line of lines)
    try {
      const data = JSON.parse(line)
      if (data && typeof data === 'object' && (!field || typeof data[field] === 'number'))
        return {
          value: field ? data[field] : Number(line.match(/-?\d+(\.\d+)?/)?.[0]),
          errors: data.errors,
          work: data.work,
        }
    } catch {
      // not a JSON line
    }
  const number = lines[0]?.match(/-?\d+(\.\d+)?/)?.[0]
  return { value: number === undefined ? NaN : Number(number) }
}

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  const value = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
  return Math.round(value * 1000) / 1000
}

/** One summary line per side and a verdict: separated only when the two ranges do not overlap. */
export function summarize(a, b, labels = ['A', 'B']) {
  const side = (runs, label) => {
    const values = runs.map((run) => run.value)
    const errors = runs.reduce((sum, run) => sum + (run.errors ?? 0), 0)
    const work = [...new Set(runs.map((run) => run.work).filter((w) => w !== undefined))]
    return {
      median: median(values),
      min: Math.min(...values),
      max: Math.max(...values),
      text: `${label}: median ${median(values)} range ${Math.min(...values)}-${Math.max(...values)} (${values.length} runs)${runs.some((run) => run.errors !== undefined) ? ` errors=${errors}` : ''}${work.length ? ` work=${work.join('/')}` : ''}`,
    }
  }
  const left = side(a, labels[0])
  const right = side(b, labels[1])
  const delta = ((right.median - left.median) / left.median) * 100
  const separated = right.max < left.min || right.min > left.max
  return [
    left.text,
    right.text,
    `delta ${delta >= 0 ? '+' : ''}${delta.toFixed(1)}% - ${separated ? 'separated: the ranges do not overlap' : 'within spread: the ranges overlap'}`,
  ].join('\n')
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const args = process.argv.slice(2)
  const split = args.indexOf('--')
  const command = split === -1 ? [] : args.slice(split + 1)
  const flags = split === -1 ? args : args.slice(0, split)
  const option = (name, fallback) => {
    const index = flags.indexOf(`--${name}`)
    return index === -1 ? fallback : flags[index + 1]
  }
  if (!command.length) {
    console.error('Usage: ab.mjs [--ref HEAD] [--rounds 5] [--field medianMs] -- <command...>')
    process.exit(2)
  }
  const ref = option('ref', 'HEAD')
  const rounds = Number(option('rounds', 5))
  const field = option('field')
  const git = (...gitArgs) =>
    execFileSync('git', gitArgs, { encoding: 'buffer', maxBuffer: 512 * 1024 * 1024 })
  const top = git('rev-parse', '--show-toplevel').toString().trim()
  const prefix = git('rev-parse', '--show-prefix').toString().trim()
  const snapshot = mkdtempSync(join(process.env.TMPDIR ?? tmpdir(), 'hillclimb-ab-'))
  try {
    const archive = git('-C', top, 'archive', '--format=tar', ref, '--', prefix || '.')
    execFileSync('tar', ['-x', '-C', snapshot], { input: archive })
    const cwdA = join(snapshot, prefix)
    for (let dir = process.cwd(), copy = cwdA; ; dir = join(dir, '..'), copy = join(copy, '..')) {
      if (existsSync(join(dir, 'node_modules')) && !existsSync(join(copy, 'node_modules')))
        symlinkSync(join(dir, 'node_modules'), join(copy, 'node_modules'))
      if (dir === top || copy === snapshot) break
    }
    const run = (cwd) => {
      const result = spawnSync(command[0], command.slice(1), {
        cwd,
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
      })
      if (result.status !== 0)
        throw new Error(
          `${command.join(' ')} exited ${result.status} in ${cwd === process.cwd() ? 'the working tree' : ref}: ${(result.stderr || result.stdout).trim().split('\n').slice(-3).join(' | ')}`,
        )
      return readRun(result.stdout, field)
    }
    const a = []
    const b = []
    for (let round = 0; round < rounds; round++) {
      a.push(run(cwdA))
      b.push(run(process.cwd()))
    }
    console.log(summarize(a, b, [`A ${ref}`, 'B working tree']))
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  } finally {
    rmSync(snapshot, { recursive: true, force: true })
  }
}
