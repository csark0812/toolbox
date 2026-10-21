import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  cacheKey,
  compare,
  needsAnotherRound,
  readRun,
  stopRule,
  summarize,
  testCounts,
  verdict,
} from '../hillclimb/scripts/ab.mjs'
import { hotspots } from '../hillclimb/scripts/hot.mjs'
import { excerpt, pickProfile, testSummary } from '../hillclimb/scripts/orient.mjs'

const root = join(import.meta.dirname, '..')
const runs = (...values) => values.map((value) => ({ value, errors: 0, work: 3 }))

/** A git repo with one project folder whose bench prints the number in value.txt. */
function benchRepo() {
  const repo = mkdtempSync(join(tmpdir(), 'hillclimb-ab-'))
  const project = join(repo, 'projects/app')
  mkdirSync(project, { recursive: true })
  writeFileSync(join(project, 'value.txt'), '10')
  writeFileSync(
    join(project, 'bench.mjs'),
    "import { appendFileSync, readFileSync } from 'node:fs'\nappendFileSync(process.env.BENCH_COUNT, 'x')\nconsole.log(JSON.stringify({ medianMs: Number(readFileSync('value.txt', 'utf8')), errors: 0, work: 1 }))\n",
  )
  const git = (...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8', stdio: 'pipe' })
  git('init', '-q')
  git('add', '.')
  git('-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-qm', 'base')
  const count = `${repo}-count.txt`
  const ab = (...flags) =>
    execFileSync(
      process.execPath,
      [join(root, 'hillclimb/scripts/ab.mjs'), ...flags, '--', process.execPath, 'bench.mjs'],
      {
        cwd: repo,
        encoding: 'utf8',
        env: {
          ...process.env,
          BENCH_COUNT: count,
          GIT_AUTHOR_NAME: 't',
          GIT_AUTHOR_EMAIL: 't@t',
          GIT_COMMITTER_NAME: 't',
          GIT_COMMITTER_EMAIL: 't@t',
        },
      },
    )
  const benchRuns = () => (existsSync(count) ? readFileSync(count, 'utf8').length : 0)
  return { repo, project, git, ab, benchRuns }
}

describe('hillclimb ab.mjs', { timeout: 30_000 }, () => {
  it('reads the metric, errors and work from the last JSON line', () => {
    const output = '> bench\n{"medianMs":4.2,"range":[4,5],"errors":0,"work":30}\n'
    expect(readRun(output)).toEqual({ value: 4.2, errors: 0, work: 30 })
    expect(readRun(output, 'work').value).toBe(30)
    expect(readRun('took 12.5 ms').value).toBe(12.5)
  })

  it('calls a gain separated only when the ranges do not overlap', () => {
    expect(summarize(runs(10, 11, 12), runs(5, 6, 7))).toMatch(
      /delta -45\.5% \(1\.8x\) - separated/,
    )
    expect(summarize(runs(10, 11, 12), runs(9, 10.5, 11))).toMatch(/within spread/)
    expect(summarize(runs(10, 11, 12), runs(5, 6, 7))).toMatch(/errors=0 work=3/)
  })

  it('runs 3 rounds, stops on a clear gap and extends only on a close overlap', () => {
    expect(needsAnotherRound(runs(10, 11), runs(1, 1))).toBe(true)
    expect(needsAnotherRound(runs(100, 101, 99), runs(1, 1.2, 0.9))).toBe(false)
    expect(needsAnotherRound(runs(10, 12, 11), runs(9, 11, 10))).toBe(true)
    expect(needsAnotherRound(runs(10, 12, 11), runs(10, 11.8, 11.1))).toBe(false)
    expect(needsAnotherRound(runs(10, 10.5, 11), runs(8, 8.4, 9))).toBe(false)
    const nine = runs(10, 12, 11, 10, 12, 11, 10, 12, 11)
    expect(needsAnotherRound(nine, runs(9, 11, 10, 9, 11, 10, 9, 11, 10))).toBe(false)
    expect(needsAnotherRound(runs(10, 12, 11, 10), runs(9, 11, 10, 9), { min: 3, max: 4 })).toBe(
      false,
    )
  })

  it('tolerates one stalled run a side once there are 5 runs, but not fewer', () => {
    const slow = runs(5.2, 5.3, 5.25, 5.35, 5.3)
    const fast = runs(1.8, 1.9, 24, 1.85, 1.9)
    expect(compare(slow, fast)).toMatchObject({ separated: false, trimmed: true, clear: true })
    expect(verdict(compare(slow, fast)).reason).toBe('separated but for one run a side, -64.2%')
    expect(needsAnotherRound(slow, fast)).toBe(false)
    expect(compare(slow.slice(0, 3), runs(1.8, 24, 1.9)).clear).toBe(false)
    expect(needsAnotherRound(slow.slice(0, 3), runs(1.8, 24, 1.9))).toBe(true)
    expect(compare(slow, runs(1.8, 24, 1.85, 30, 1.9)).clear).toBe(false)
  })

  it('meets the stop rule only with every run under target and a 40% median margin', () => {
    const side = (...values) => compare(runs(1), runs(...values)).right
    expect(stopRule(side(2.5, 2.9, 3), 5).met).toBe(true)
    expect(stopRule(side(2.5, 2.9, 5.1), 5).met).toBe(false)
    expect(stopRule(side(3.2, 3.4, 3.5), 5).text).toBe(
      'stop rule: not met (needs B max 3.5 < 5 and median 3.4 <= 3)',
    )
    expect(stopRule(side(200, 210, 220), 100, true).met).toBe(true)
    expect(stopRule(side(150, 160, 170), 100, true).met).toBe(false)
  })

  it('keeps only a separated gain with no errors, the same work and a passing gate', () => {
    const gain = compare(runs(10, 11, 12), runs(5, 6, 7))
    expect(verdict(gain)).toEqual({ keep: true, reason: 'separated, -45.5%' })
    expect(verdict(gain, { gate: false })).toEqual({ keep: false, reason: 'gate failed' })
    expect(verdict(compare(runs(10, 11, 12), runs(9, 10.5, 11))).keep).toBe(false)
    expect(verdict(compare(runs(5, 6, 7), runs(10, 11, 12))).reason).toBe('slower')
    expect(verdict(compare(runs(5, 6, 7), runs(10, 11, 12)), { higher: true }).keep).toBe(true)
    expect(verdict(compare(runs(10), [{ value: 1, errors: 1, work: 2 }])).reason).toBe(
      'errors=1, work changed 3 -> 2',
    )
  })

  it('summarizes test output and keys the cache by content, command and field', () => {
    expect(testCounts('# tests 3\n# pass 3\n# fail 0\n')).toBe('tests 3, pass 3, fail 0')
    expect(testCounts(' Tests  12 passed (12)\n')).toBe('Tests  12 passed (12)')
    expect(cacheKey('abc', 'npm run bench')).toBe(cacheKey('abc', 'npm run bench'))
    expect(cacheKey('abc', 'npm run bench')).not.toBe(cacheKey('abd', 'npm run bench'))
    expect(cacheKey('abc', 'npm run bench', 'p95')).not.toBe(cacheKey('abc', 'npm run bench'))
  })

  it('alternates the committed and working copies of a subfolder named by --dir', () => {
    const { repo, project, git, ab } = benchRepo()
    try {
      writeFileSync(join(project, 'value.txt'), '4')
      const output = ab('--dir', 'projects/app', '--rounds', '2')
      const sha = git('rev-parse', '--short=7', 'HEAD').trim()
      expect(output.split('\n')[0]).toBe(
        `measuring \`${process.execPath} bench.mjs\` in ${project}: A = HEAD (${sha}), B = working tree`,
      )
      expect(output).toContain('A HEAD: median 10 range 10-10 (2 runs) errors=0 work=1')
      expect(output).toContain('B working tree: median 4')
      expect(output).toContain('delta -60.0% (2.5x) - separated')
      expect(output).toContain('verdict: keep (separated, -60.0%)')
      expect(git('status', '--short')).toBe(' M projects/app/value.txt\n')
    } finally {
      rmSync(repo, { recursive: true, force: true })
      rmSync(`${repo}-count.txt`, { force: true })
    }
  })

  it('reuses cached side-A runs, runs the gate, logs the rows and resolves --ref baseline', () => {
    const { repo, project, git, ab, benchRuns } = benchRepo()
    try {
      writeFileSync(join(project, 'value.txt'), '2')
      const first = ab(
        '--dir',
        project,
        '--target',
        '5',
        '--gate',
        'echo "# tests 1"; echo "# pass 1"',
        '--log',
        '.hillclimb/app/decisions.tsv',
        '--id',
        'a1',
        '--hyp',
        'smaller value',
      )
      expect(benchRuns()).toBe(6)
      expect(first).toContain('gate: pass `echo "# tests 1"; echo "# pass 1"` (tests 1, pass 1)')
      expect(first).toContain('stop rule: met (needs B max 2 < 5 and median 2 <= 3)')
      const rows = readFileSync(join(project, '.hillclimb/app/decisions.tsv'), 'utf8').split('\n')
      expect(rows[1].split('\t').slice(1, 9)).toEqual([
        'baseline',
        '',
        '',
        '',
        '10',
        '',
        '',
        'baseline',
      ])
      expect(rows[2].split('\t').slice(1, 9)).toEqual([
        'a1',
        'smaller value',
        '',
        '10',
        '2',
        `'-80.0%`,
        'pass',
        'keep',
      ])

      git('-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-qam', 'a1')
      const next = ab('--dir', project)
      expect(next).toContain('A HEAD: median 2 range 2-2 (3 runs, 3 cached)')
      expect(benchRuns()).toBe(9)

      const final = ab('--dir', project, '--ref', 'baseline', '--gate', 'exit 3')
      expect(final).toContain('A baseline: median 10 range 10-10 (3 runs, 3 cached)')
      expect(final).toMatch(/gate: FAIL exit 3/)
      expect(final).toContain('verdict: revert (gate failed)')
      expect(benchRuns()).toBe(12)
      expect(git('status', '--short')).toBe('')
    } finally {
      rmSync(repo, { recursive: true, force: true })
      rmSync(`${repo}-count.txt`, { force: true })
    }
  })

  it('finishes in the same call only once the kept code meets the stop rule', () => {
    const { repo, project, git, ab } = benchRepo()
    try {
      const attempt = (value, id) => {
        writeFileSync(join(project, 'value.txt'), value)
        return ab(
          '--dir',
          project,
          '--target',
          '5',
          '--change',
          'value.txt',
          '--commit',
          `Set ${value}`,
          '--finish',
          '--log',
          '../../decisions.tsv',
          '--id',
          id,
        )
      }
      const first = attempt('6', 'a1')
      expect(first).toContain('stop rule: not met (needs B max 6 < 5 and median 6 <= 3)')
      expect(first).toContain('not finished: the stop rule does not hold yet')
      const second = attempt('7', 'a2')
      expect(second).toContain('reverted value.txt')
      expect(second).toContain('stop rule: not met (needs B max 6 < 5')
      const third = attempt('2', 'a3')
      const lines = third.split('\n')
      const base = git(
        'rev-list',
        '--max-parents=0',
        '--abbrev-commit',
        '--abbrev=7',
        'HEAD',
      ).trim()
      const final = lines.indexOf(`final: the code now against the baseline (${base})`)
      expect(final).toBeGreaterThan(0)
      expect(lines[final + 1]).toBe(
        'A baseline: median 10 range 10-10 (3 runs, 3 cached) errors=0 work=1',
      )
      expect(lines[final + 2]).toMatch(/^B working tree: median 2 /)
      expect(third).toContain('git status: clean')
      expect(third).toMatch(/[0-9a-f]{7} Set 2 \(median 6 -> 2, -66\.7%\)\n[0-9a-f]{7} Set 6 /)
      const log = readFileSync(join(repo, 'decisions.tsv'), 'utf8')
      expect(
        log
          .trimEnd()
          .split('\n')
          .map((row) => row.split('\t')[1]),
      ).toEqual(['id', 'baseline', 'a1', 'a2', 'a3', 'final'])
      expect(git('status', '--short')).toBe('?? decisions.tsv\n')
    } finally {
      rmSync(repo, { recursive: true, force: true })
      rmSync(`${repo}-count.txt`, { force: true })
    }
  })

  it('commits a keep with its measured delta and reverts a loss, touching only --change paths', () => {
    const { repo, project, git, ab } = benchRepo()
    try {
      writeFileSync(join(project, 'value.txt'), '5')
      writeFileSync(join(project, 'notes.txt'), 'not part of the attempt')
      const kept = ab('--dir', project, '--change', 'value.txt', '--commit', 'Halve the value')
      expect(kept).toMatch(/committed [0-9a-f]{7} Halve the value \(median 10 -> 5, -50\.0%\)/)
      expect(git('log', '-1', '--format=%s')).toBe('Halve the value (median 10 -> 5, -50.0%)\n')
      expect(git('show', '--name-only', '--format=', 'HEAD')).toBe('projects/app/value.txt\n')

      writeFileSync(join(project, 'value.txt'), '9')
      writeFileSync(join(project, 'extra.mjs'), 'export {}\n')
      const lost = ab(
        '--dir',
        project,
        '--change',
        'value.txt extra.mjs',
        '--commit',
        'Raise the value',
        '--log',
        'decisions.tsv',
        '--id',
        'a2',
      )
      expect(lost).toContain('verdict: revert (slower)')
      expect(lost).toContain('reverted value.txt extra.mjs')
      expect(readFileSync(join(project, 'value.txt'), 'utf8')).toBe('5')
      expect(existsSync(join(project, 'extra.mjs'))).toBe(false)
      expect(readFileSync(join(project, 'decisions.tsv'), 'utf8')).toMatch(
        /\ta2\t.*\trevert\t.*; reverted/,
      )
      expect(git('status', '--short')).toBe(
        '?? projects/app/decisions.tsv\n?? projects/app/notes.txt\n',
      )
    } finally {
      rmSync(repo, { recursive: true, force: true })
      rmSync(`${repo}-count.txt`, { force: true })
    }
  })
})

describe('hillclimb orient.mjs', { timeout: 30_000 }, () => {
  it('caps code by lines and data by bytes, and skips binary files', () => {
    const code = Array.from({ length: 400 }, (_, i) => `line ${i}`).join('\n')
    const shown = excerpt('src/a.mjs', code)
    expect(shown.split('\n')).toHaveLength(151)
    expect(shown).toMatch(/\.\.\. \(250 more lines\)$/)
    expect(excerpt('src/short.mjs', 'a\nb')).toBe('a\nb')
    expect(excerpt('data/big.json', 'x'.repeat(1000))).toMatch(
      /^x{600}\n\.\.\. \(400 more bytes\)$/,
    )
    expect(excerpt('img.bin', 'a\0b')).toBe('(binary, skipped)')
  })

  it('summarizes common test runner output', () => {
    expect(testSummary('ℹ tests 2\nℹ pass 2\nℹ fail 0\n')).toBe('tests 2, pass 2, fail 0')
    expect(testSummary('  14 passing (20ms)\n')).toBe('14 passing (20ms)')
    expect(testSummary('a\nb\nc\n')).toBe('b\nc')
  })

  it('picks the profile that spent the most time in the project', () => {
    const profile = (url, ms) => ({
      nodes: [{ id: 1, callFrame: { functionName: 'f', url, lineNumber: 0 } }],
      samples: [1],
      timeDeltas: [ms * 1000],
    })
    const npm = profile('file:///usr/lib/npm/cli.js', 50)
    const bench = profile('file:///repo/app/src/a.mjs', 5)
    expect(pickProfile([npm, bench], '/repo/app')).toBe(bench)
  })

  it('prints files, git state, one bench run, tests, a profile and HEAD from any folder', () => {
    const { repo, project, git } = benchRepo()
    try {
      writeFileSync(
        join(project, 'package.json'),
        JSON.stringify({ type: 'module', scripts: { test: 'node --test' } }),
      )
      mkdirSync(join(project, 'tests'))
      writeFileSync(
        join(project, 'tests/a.test.mjs'),
        "import { test } from 'node:test'\ntest('ok', () => {})\n",
      )
      const output = execFileSync(
        process.execPath,
        [join(root, 'hillclimb/scripts/orient.mjs'), project, '--', process.execPath, 'bench.mjs'],
        { cwd: tmpdir(), encoding: 'utf8', env: { ...process.env, BENCH_COUNT: join(repo, 'n') } },
      )
      expect(output).toContain(`project: ${project}`)
      expect(output).toContain('== value.txt\n10')
      expect(output).toContain('== git: branch')
      expect(output).toContain('?? package.json')
      expect(output).toMatch(/== bench: `.*bench\.mjs` exit 0\n\{"medianMs":10/)
      expect(output).toMatch(/== tests: `npm test --silent` exit 0: tests 1, pass 1, fail 0/)
      expect(output).toContain('== profile: hottest functions by self time')
      expect(output).toContain(`== HEAD ${git('rev-parse', 'HEAD').trim()}`)
    } finally {
      rmSync(repo, { recursive: true, force: true })
      rmSync(`${repo}-count.txt`, { force: true })
    }
  })
})

describe('hillclimb hot.mjs', () => {
  it('ranks functions by self time and folds node internals', () => {
    const frame = (id, functionName, url) => ({
      id,
      callFrame: { functionName, url, lineNumber: 4 },
    })
    const profile = {
      nodes: [
        frame(1, 'dedupe', 'file:///repo/src/a.mjs'),
        frame(2, 'sort', 'file:///repo/src/a.mjs'),
        frame(3, 'parse', 'node:internal/x'),
      ],
      samples: [1, 1, 1, 2, 3],
      timeDeltas: [1000, 1000, 1000, 1000, 1000],
    }
    const hot = hotspots(profile, 2, '/repo')
    expect(hot).toEqual([
      { name: 'dedupe src/a.mjs:5', ms: 3, share: 60 },
      { name: 'sort src/a.mjs:5', ms: 1, share: 20 },
    ])
  })
})
