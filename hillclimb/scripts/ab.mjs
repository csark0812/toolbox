#!/usr/bin/env node
// Alternate a benchmark between a git ref and the working tree, and print a short summary.
//   node <skill>/scripts/ab.mjs [--dir <project>] [--ref HEAD] [--rounds 3] [--max-rounds 9]
//     [--field medianMs] [--higher] [--target <n>] [--gate "<cmd>"]
//     [--change "<paths>" [--commit "<message>"]]
//     [--log <decisions.tsv> --id <id> --hyp "<text>" [--note "<text>"]] [--finish]
//     -- <bench command...>
// --dir (default: the current folder) is the folder the command runs in. The ref's copy of that
// folder is exported to a temporary directory (node_modules is linked, not copied), then the command
// runs A, B, A, B... Rounds adapt: at least --rounds, stopping as soon as the ranges separate with a
// ratio over 1.5x, and extending up to --max-rounds only while the ranges overlap and the medians
// differ by more than 5%. Each run's last JSON line is read: --field names the number to compare
// (default: the first number in the last line of output), and `errors` and `work` fields are reported
// when present. Samples are cached under <dir>/.hillclimb/ab-cache by folder content and command, so
// a later comparison against the same code (the next HEAD, or --ref <baseline>) reuses its side A.
// The first run records side A's commit in <dir>/.hillclimb/baseline, and `--ref baseline` reads it.
// --gate runs a correctness command after the comparison; --target prints whether the target is met
// with margin, and a change to code that already met it is reverted. --commit acts on the verdict: keep commits exactly the --change paths (relative to --dir)
// with the measured medians and delta appended to the subject; revert restores those paths to HEAD.
// --log appends the measured row (and a baseline row when the log is new). --finish, once the kept
// code meets the target with margin, also compares it with the baseline (reusing this comparison when
// side A was the baseline) and prints the project's git status and the commits since the baseline:
// the final evidence, in the same call.
import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { appendRow } from './log.mjs'

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

const round3 = (value) => Math.round(value * 1000) / 1000

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return round3(sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2)
}

/** Median, range, errors and work for one side's runs. */
export function sideStats(runs) {
  const values = runs.map((run) => run.value)
  return {
    n: values.length,
    median: median(values),
    min: Math.min(...values),
    max: Math.max(...values),
    errors: runs.reduce((sum, run) => sum + (run.errors ?? 0), 0),
    hasErrors: runs.some((run) => run.errors !== undefined),
    work: [...new Set(runs.map((run) => run.work).filter((w) => w !== undefined))],
  }
}

/**
 * Both sides plus the delta, the median ratio and whether the ranges separate. With 5 or more runs
 * a side, `clear` also accepts ranges that separate once each side's one run nearest the other side
 * is set aside, so a single stalled run on a busy machine does not hide a real gap.
 */
export function compare(a, b) {
  const left = sideStats(a)
  const right = sideStats(b)
  const delta = ((right.median - left.median) / left.median) * 100
  const low = Math.min(left.median, right.median)
  const ratio = low > 0 ? Math.max(left.median, right.median) / low : Infinity
  const separated = right.max < left.min || right.min > left.max
  const sorted = (runs) => runs.map((run) => run.value).sort((x, y) => x - y)
  const [as, bs] = [sorted(a), sorted(b)]
  const trimmed =
    !separated &&
    as.length >= 5 &&
    bs.length >= 5 &&
    (right.median < left.median ? bs.at(-2) < as[1] : bs[1] > as.at(-2))
  return { left, right, delta, ratio, separated, trimmed, clear: separated || trimmed }
}

/**
 * Whether to run another round: always up to `min`, never past `max`, stop once the ranges separate
 * with a ratio over 1.5x, and extend only while the ranges overlap and the medians differ by over 5%.
 */
export function needsAnotherRound(a, b, { min = 3, max = 9 } = {}) {
  const rounds = Math.min(a.length, b.length)
  if (rounds < min) return true
  if (rounds >= max) return false
  const { delta, ratio, separated, clear } = compare(a, b)
  if (clear && ratio > 1.5) return false
  return !separated && Math.abs(delta) > 5
}

/** Stop when every B run beats the target and the B median has a 40% margin on it. */
export function stopRule(stats, target, higher = false) {
  const met = higher
    ? stats.min > target && stats.median >= round3(target / 0.6)
    : stats.max < target && stats.median <= round3(target * 0.6)
  const edge = higher ? `min ${stats.min} > ${target}` : `max ${stats.max} < ${target}`
  const margin = higher
    ? `median ${stats.median} >= ${round3(target / 0.6)}`
    : `median ${stats.median} <= ${round3(target * 0.6)}`
  return { met, text: `target: ${met ? 'met' : 'not met'} (needs B ${edge} and ${margin})` }
}

/**
 * keep only for a gain beyond the spread with no errors, unchanged work and a passing gate, and only
 * while side A has not already met the target (`met`): a met target needs no second change.
 */
export function verdict(result, { higher = false, gate, met = false } = {}) {
  const { left, right, delta, clear, trimmed } = result
  const improved = higher ? delta > 0 : delta < 0
  const sameWork =
    left.work.length === right.work.length && left.work.every((w, i) => right.work[i] === w)
  const reasons = []
  if (!clear) reasons.push('within spread')
  else if (!improved) reasons.push('slower')
  if (right.errors) reasons.push(`errors=${right.errors}`)
  if (!sameWork) reasons.push(`work changed ${left.work.join('/')} -> ${right.work.join('/')}`)
  if (gate === false) reasons.push('gate failed')
  if (met) reasons.push('target already met without this change')
  return reasons.length
    ? { keep: false, reason: reasons.join(', ') }
    : {
        keep: true,
        reason: `${trimmed ? 'separated but for one run a side' : 'separated'}, ${formatDelta(delta)}`,
      }
}

const formatDelta = (delta) => `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`

const sideText = (stats, label, cached = 0) =>
  `${label}: median ${stats.median} range ${stats.min}-${stats.max} (${stats.n} runs${cached ? `, ${cached} cached` : ''})${stats.hasErrors ? ` errors=${stats.errors}` : ''}${stats.work.length ? ` work=${stats.work.join('/')}` : ''}`

/** One summary line per side and a verdict: separated only when the two ranges do not overlap. */
export function summarize(a, b, labels = ['A', 'B'], cached = 0) {
  const result = compare(a, b)
  return [
    sideText(result.left, labels[0], cached),
    sideText(result.right, labels[1]),
    `delta ${formatDelta(result.delta)} (${result.ratio === Infinity ? 'inf' : result.ratio.toFixed(1)}x) - ${result.separated ? 'separated: the ranges do not overlap' : result.trimmed ? 'separated but for one run a side: only the nearest run of each side overlaps' : 'within spread: the ranges overlap'}`,
  ].join('\n')
}

/** Short pass/fail counts from a test runner's output, when it prints them. */
export function testCounts(output) {
  const counts = [...output.matchAll(/^#\s*(tests|pass|fail)\s+(\d+)\s*$/gm)].map(
    (match) => `${match[1]} ${match[2]}`,
  )
  if (counts.length) return counts.join(', ')
  const line = output
    .split('\n')
    .reverse()
    .find((text) => /\b\d+\s+(passed|failed|passing|failing)\b/i.test(text))
  return line?.trim() ?? ''
}

/** Cache file name for one folder content, command and field. */
export const cacheKey = (tree, command, field = '') =>
  createHash('sha256')
    .update(JSON.stringify([tree, command, field]))
    .digest('hex')
    .slice(0, 20)

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
    console.error(
      'Usage: ab.mjs [--dir <project>] [--ref HEAD] [--rounds 3] [--target <n>] [--gate "<cmd>"] [--change "<paths>" --commit "<msg>"] [--log <tsv> --id <id> --hyp "<text>"] -- <command...>',
    )
    process.exit(2)
  }
  const cwd = resolve(option('dir', '.'))
  const ref = option('ref', 'HEAD')
  const rounds = { min: Number(option('rounds', 3)), max: Number(option('max-rounds', 9)) }
  rounds.max = Math.max(rounds.max, rounds.min)
  const field = option('field')
  const higher = flags.includes('--higher')
  const target = option('target') === undefined ? undefined : Number(option('target'))
  const gateCommand = option('gate')
  const logFile = option('log')
  const git = (gitArgs, env) =>
    execFileSync('git', gitArgs, {
      cwd,
      env: env ? { ...process.env, ...env } : process.env,
      encoding: 'buffer',
      maxBuffer: 512 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  const gitText = (...gitArgs) => git(gitArgs).toString().trim()
  const top = gitText('rev-parse', '--show-toplevel')
  const prefix = gitText('rev-parse', '--show-prefix')
  const baselineFile = join(cwd, '.hillclimb', 'baseline')
  const named = (spec) => {
    try {
      return gitText('rev-parse', '--verify', '-q', `${spec}^{commit}`)
    } catch {
      return undefined
    }
  }
  const sha =
    named(ref) ??
    (ref === 'baseline' && existsSync(baselineFile)
      ? readFileSync(baselineFile, 'utf8').trim()
      : undefined)
  if (!sha) {
    console.error(`Unknown ref ${ref}${ref === 'baseline' ? ' (no .hillclimb/baseline yet)' : ''}`)
    process.exit(2)
  }
  const shown = command.join(' ')
  console.log(`measuring \`${shown}\` in ${cwd}: A = ${ref} (${sha.slice(0, 7)}), B = working tree`)

  const cacheDir = join(cwd, '.hillclimb', 'ab-cache')
  if (!existsSync(baselineFile)) {
    mkdirSync(dirname(baselineFile), { recursive: true })
    writeFileSync(baselineFile, `${sha}\n`)
  }
  try {
    git(['check-ignore', '-q', join(cwd, '.hillclimb', 'x')])
  } catch {
    const exclude = resolve(cwd, gitText('rev-parse', '--git-path', 'info/exclude'))
    mkdirSync(dirname(exclude), { recursive: true })
    appendFileSync(exclude, '\n.hillclimb/\n')
  }
  const treeOf = (spec) => {
    try {
      return gitText('rev-parse', `${spec}:${prefix}`)
    } catch {
      return undefined
    }
  }
  const workingTree = () => {
    const index = join(mkdtempSync(join(process.env.TMPDIR ?? tmpdir(), 'hillclimb-index-')), 'i')
    try {
      const env = { GIT_INDEX_FILE: index }
      git(['read-tree', 'HEAD'], env)
      git(['add', '-A', '--', '.'], env)
      return treeOf(git(['write-tree'], env).toString().trim())
    } catch {
      return undefined
    } finally {
      rmSync(dirname(index), { recursive: true, force: true })
    }
  }
  const cachePath = (tree) => tree && join(cacheDir, `${cacheKey(tree, shown, field)}.json`)
  const readCache = (path) => {
    try {
      return path ? JSON.parse(readFileSync(path, 'utf8')) : []
    } catch {
      return []
    }
  }
  const writeCache = (path, runs) => {
    if (!path) return
    mkdirSync(cacheDir, { recursive: true })
    writeFileSync(path, JSON.stringify(runs.slice(-rounds.max)))
  }
  const snapshots = new Map()
  const run = (where, label) => {
    const result = spawnSync(command[0], command.slice(1), {
      cwd: where,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    })
    if (result.status !== 0)
      throw new Error(
        `${shown} exited ${result.status} in ${label}: ${(result.stderr || result.stdout || String(result.error ?? '')).trim().split('\n').slice(-3).join(' | ')}`,
      )
    return readRun(result.stdout, field)
  }
  const copyOf = (commit) => {
    if (snapshots.has(commit)) return join(snapshots.get(commit), prefix)
    const snapshot = mkdtempSync(join(process.env.TMPDIR ?? tmpdir(), 'hillclimb-ab-'))
    snapshots.set(commit, snapshot)
    const archive = git(['-C', top, 'archive', '--format=tar', commit, '--', prefix || '.'])
    execFileSync('tar', ['-x', '-C', snapshot], { input: archive })
    const copyRoot = join(snapshot, prefix)
    for (let dir = cwd, copy = copyRoot; ; dir = join(dir, '..'), copy = join(copy, '..')) {
      if (existsSync(join(dir, 'node_modules')) && !existsSync(join(copy, 'node_modules')))
        symlinkSync(join(dir, 'node_modules'), join(copy, 'node_modules'))
      if (dir === top || copy === snapshot) break
    }
    return copyRoot
  }
  /** Alternate `commit` (side A, cached runs first) with the working tree; print the summary. */
  const measure = (commit, label) => {
    const cacheA = cachePath(treeOf(commit))
    const cacheB = cachePath(workingTree())
    const cachedA = readCache(cacheA)
    const a = []
    const b = []
    while (needsAnotherRound(a, b, rounds)) {
      a.push(a.length < cachedA.length ? cachedA[a.length] : run(copyOf(commit), label))
      b.push(run(cwd, 'the working tree'))
    }
    const reused = Math.min(cachedA.length, a.length)
    writeCache(cacheA, [...a, ...cachedA.slice(a.length)])
    if (cacheB !== cacheA) writeCache(cacheB, [...readCache(cacheB), ...b])
    console.log(summarize(a, b, [`A ${label}`, 'B working tree'], reused))
    return compare(a, b)
  }
  const log = (fields) => {
    if (!logFile) return
    const file = resolve(cwd, logFile)
    if (!existsSync(file))
      appendRow(file, [
        'baseline',
        '',
        '',
        '',
        fields.result.left.median,
        '',
        '',
        'baseline',
        `${sha.slice(0, 7)} range ${fields.result.left.min}-${fields.result.left.max}, ${fields.result.left.n} runs`,
      ])
    const { result } = fields
    appendRow(file, [
      fields.id,
      fields.hyp,
      fields.change,
      result.left.median,
      result.right.median,
      formatDelta(result.delta),
      fields.gate,
      fields.verdict,
      `${fields.reason}; B range ${result.right.min}-${result.right.max}, ${result.right.n} runs${fields.note ? `; ${fields.note}` : ''}`,
    ])
    console.log(`logged ${fields.id} to ${file}`)
  }

  try {
    const result = measure(sha, ref)

    let gate
    if (gateCommand) {
      const outcome = spawnSync('sh', ['-c', gateCommand], {
        cwd,
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
      })
      const output = `${outcome.stdout ?? ''}\n${outcome.stderr ?? ''}`
      gate = outcome.status === 0
      const counts = testCounts(output)
      console.log(
        gate
          ? `gate: pass \`${gateCommand}\`${counts ? ` (${counts})` : ''}`
          : `gate: FAIL exit ${outcome.status} \`${gateCommand}\`: ${output.trim().split('\n').slice(-4).join(' | ')}`,
      )
    }
    const met = target !== undefined && stopRule(result.left, target, higher).met
    const decision = verdict(result, { higher, gate, met })
    console.log(`verdict: ${decision.keep ? 'keep' : 'revert'} (${decision.reason})`)

    let outcomeNote = ''
    let kept = result.right
    const commitMessage = option('commit')
    if (commitMessage !== undefined) {
      const paths = (option('change') ?? '').split(/\s+/).filter(Boolean)
      if (!paths.length) console.log('no commit or revert: --commit needs --change "<paths>"')
      else if (decision.keep) {
        const [subject, ...body] = commitMessage.split('\n')
        const measured = `${subject} (median ${result.left.median} -> ${result.right.median}, ${formatDelta(result.delta)})`
        git(['add', '--', ...paths])
        git(['commit', '-q', '-m', [measured, ...body].join('\n'), '--', ...paths])
        const commit = gitText('rev-parse', '--short=7', 'HEAD')
        outcomeNote = `commit ${commit}`
        console.log(`committed ${commit} ${measured}`)
      } else {
        for (const path of paths) {
          const tracked = spawnSync('git', ['cat-file', '-e', `HEAD:./${path}`], { cwd })
          if (tracked.status === 0) git(['checkout', 'HEAD', '--', path])
          else rmSync(resolve(cwd, path), { recursive: true, force: true })
        }
        kept = result.left
        outcomeNote = 'reverted'
        console.log(`reverted ${paths.join(' ')}`)
      }
    }
    const stop = target === undefined ? undefined : stopRule(kept, target, higher)
    if (stop) console.log(stop.text)
    const note = [outcomeNote, option('note')].filter(Boolean).join('; ')
    log({
      result,
      id: option('id', 'attempt'),
      hyp: option('hyp', ''),
      change: option('change', ''),
      gate: gate === undefined ? '' : gate ? 'pass' : 'fail',
      verdict: decision.keep ? 'keep' : 'revert',
      reason: decision.reason,
      note,
    })

    if (flags.includes('--finish')) {
      const base = existsSync(baselineFile) ? readFileSync(baselineFile, 'utf8').trim() : sha
      if (stop && !stop.met) console.log('not finished: the target is not met with margin yet')
      else {
        const reuse = decision.keep && treeOf(base) === treeOf(sha)
        console.log(
          `final: the code now against the baseline (${base.slice(0, 7)})${reuse ? ': the comparison above' : ''}`,
        )
        const final = reuse ? result : measure(base, 'baseline')
        if (target !== undefined) console.log(stopRule(final.right, target, higher).text)
        log({
          result: final,
          id: 'final',
          hyp: 'final comparison against the baseline',
          change: '',
          gate: '',
          verdict: 'final',
          reason: final.clear ? 'separated' : 'within spread',
        })
        console.log(`git status: ${gitText('status', '--short', '--', '.') || 'clean'}`)
        console.log(gitText('log', '--oneline', `${base}..HEAD`, '--', '.'))
      }
    }
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  } finally {
    for (const snapshot of snapshots.values()) rmSync(snapshot, { recursive: true, force: true })
  }
}
