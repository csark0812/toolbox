import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { readRun, summarize } from '../hillclimb/scripts/ab.mjs'
import { hotspots } from '../hillclimb/scripts/hot.mjs'

const root = join(import.meta.dirname, '..')

describe('hillclimb ab.mjs', () => {
  it('reads the metric, errors and work from the last JSON line', () => {
    const output = '> bench\n{"medianMs":4.2,"range":[4,5],"errors":0,"work":30}\n'
    expect(readRun(output)).toEqual({ value: 4.2, errors: 0, work: 30 })
    expect(readRun(output, 'work').value).toBe(30)
    expect(readRun('took 12.5 ms').value).toBe(12.5)
  })

  it('calls a gain separated only when the ranges do not overlap', () => {
    const runs = (...values) => values.map((value) => ({ value, errors: 0, work: 3 }))
    expect(summarize(runs(10, 11, 12), runs(5, 6, 7))).toMatch(/delta -45\.5% - separated/)
    expect(summarize(runs(10, 11, 12), runs(9, 10.5, 11))).toMatch(/within spread/)
    expect(summarize(runs(10, 11, 12), runs(5, 6, 7))).toMatch(/errors=0 work=3/)
  })

  it('alternates the committed and working copies of a subfolder', () => {
    const repo = mkdtempSync(join(tmpdir(), 'hillclimb-ab-'))
    try {
      const project = join(repo, 'projects/app')
      mkdirSync(project, { recursive: true })
      writeFileSync(join(project, 'value.txt'), '10')
      writeFileSync(
        join(project, 'bench.mjs'),
        "import { readFileSync } from 'node:fs'\nconsole.log(JSON.stringify({ medianMs: Number(readFileSync('value.txt', 'utf8')), errors: 0, work: 1 }))\n",
      )
      const git = (...args) => execFileSync('git', args, { cwd: repo, stdio: 'pipe' })
      git('init', '-q')
      git('add', '.')
      git('-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-qm', 'base')
      writeFileSync(join(project, 'value.txt'), '4')
      const output = execFileSync(
        process.execPath,
        [
          join(root, 'hillclimb/scripts/ab.mjs'),
          '--rounds',
          '2',
          '--',
          process.execPath,
          'bench.mjs',
        ],
        { cwd: project, encoding: 'utf8' },
      )
      expect(output).toContain('A HEAD: median 10 range 10-10 (2 runs) errors=0 work=1')
      expect(output).toContain('B working tree: median 4')
      expect(output).toContain('delta -60.0% - separated')
    } finally {
      rmSync(repo, { recursive: true, force: true })
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
