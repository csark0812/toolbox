import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  formatEntry,
  matchesDrop,
  noneStreak,
  readEntries,
  status,
} from '../swatches/scripts/record.mjs'

const root = join(import.meta.dirname, '..')
const record = join(root, 'swatches/scripts/record.mjs')
const sheet = join(root, 'swatches/scripts/sheet.mjs')
const chrome = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/opt/pw-browsers/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((path) => path && existsSync(path))

let dir
let env
const git = (cwd, ...args) =>
  execFileSync('git', ['-c', 'user.email=t@t', '-c', 'user.name=t', ...args], {
    cwd,
    stdio: 'pipe',
  })
const run = (script, args, cwd) =>
  spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8', env })
const add = (cwd, ...args) => run(record, ['add', ...args], cwd)

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'swatches-'))
  env = {
    ...process.env,
    SWATCHES_TRAITS: join(dir, 'traits.jsonl'),
    TASTE_PROFILE: join(dir, 'profile.md'),
    CHROME_PATH: chrome ?? '',
  }
})
afterEach(() => rmSync(dir, { recursive: true, force: true }))

describe('swatches record.mjs', () => {
  it('counts only the newest unbroken run of "none" answers', () => {
    const entries = readEntries(
      ['A', 'none', 'none']
        .map((picked, i) => formatEntry({ round: `r${i}`, mode: 'directions', asked: 'x', picked }))
        .join('\n'),
    )
    expect(noneStreak(entries)).toBe(2)
    expect(noneStreak(entries.slice(0, 2))).toBe(1)
  })

  it('matches option traits against dropped traits as whole hyphen words', () => {
    expect(matchesDrop(['accent flash', 'fade'], ['accent-flash', 'glow'])).toEqual([
      'accent-flash',
    ])
    expect(matchesDrop(['glowing'], ['glow'])).toEqual([])
  })

  it('writes the log into the common git directory, shared by a worktree', () => {
    const main = join(dir, 'main')
    mkdirSync(main)
    git(main, 'init', '-q')
    git(main, 'commit', '-q', '--allow-empty', '-m', 'base')
    git(main, 'worktree', 'add', '-q', join(dir, 'wt'))
    const result = add(
      join(dir, 'wt'),
      '--round',
      'r1',
      '--mode',
      'directions',
      '--asked',
      'arrival',
      '--picked',
      'B',
    )
    expect(result.status).toBe(0)
    const log = join(main, '.git', 'swatches', 'picks.md')
    expect(result.stdout).toContain(log)
    rmSync(join(dir, 'wt'), { recursive: true, force: true })
    git(main, 'worktree', 'prune')
    expect(readFileSync(log, 'utf8')).toContain('## ')
  })

  it('carries over an older per-checkout log and reads it before the first shared write', () => {
    git(dir, 'init', '-q')
    mkdirSync(join(dir, '.swatches'))
    writeFileSync(
      join(dir, '.swatches', 'picks.md'),
      formatEntry({ round: 'old', mode: 'directions', asked: 'x', picked: 'none', drop: 'glow' }),
    )
    const before = status(join(dir, '.git', 'swatches', 'picks.md'), dir)
    expect(before.dropped).toEqual(['glow'])
    const result = add(dir, '--round', 'r2', '--mode', 'variables', '--asked', 'y', '--picked', 'A')
    expect(result.stdout).toMatch(/carried over the older log/)
    expect(readFileSync(join(dir, '.git', 'swatches', 'picks.md'), 'utf8')).toMatch(/old[\s\S]*r2/)
  })

  it('prints STOP after two "none" answers and clears it when a question is recorded', () => {
    git(dir, 'init', '-q')
    add(dir, '--round', 'r1', '--mode', 'directions', '--asked', 'x', '--picked', 'none')
    const second = add(
      dir,
      '--round',
      'r2',
      '--mode',
      'directions',
      '--asked',
      'x',
      '--picked',
      'none',
    )
    expect(second.stdout).toMatch(/^STOP: 2 rounds of none/m)
    add(dir, '--round', 'q1', '--mode', 'question', '--asked', 'which axis', '--reason', 'motion')
    expect(run(record, ['status'], dir).stdout).not.toMatch(/STOP/)
  })

  it('offers a trait for the profile only when another project recorded it too', () => {
    for (const name of ['one', 'two']) {
      mkdirSync(join(dir, name))
      git(join(dir, name), 'init', '-q')
    }
    const first = add(
      join(dir, 'one'),
      '--round',
      'r',
      '--mode',
      'directions',
      '--asked',
      'x',
      '--picked',
      'A',
      '--drop',
      'glow',
    )
    expect(first.stdout).not.toMatch(/PROFILE\?/)
    const second = add(
      join(dir, 'two'),
      '--round',
      'r',
      '--mode',
      'directions',
      '--asked',
      'x',
      '--picked',
      'B',
      '--drop',
      'glow',
    )
    expect(second.stdout).toMatch(/PROFILE\? drop "glow" also came up in one/)
    expect(existsSync(env.TASTE_PROFILE)).toBe(false)
  })
})

describe('swatches sheet.mjs', () => {
  const option = (file, caption, traits, font) =>
    writeFileSync(
      file,
      `<!doctype html><meta charset="utf-8"><meta name="swatch" content="${caption}"><meta name="swatch-traits" content="${traits}"><meta name="swatch-data" content="fake: 12 rows"><style>h1,button{font-family:${font}}</style><h1>Same headline</h1><button>Go</button>`,
    )

  it('prints usage and exits 2 without a round', () => {
    const result = spawnSync(process.execPath, [sheet], { encoding: 'utf8' })
    expect(result.status).toBe(2)
    expect(result.stderr).toMatch(/Usage/)
  })

  it('refuses a new round after two "none" answers and exits 3', () => {
    git(dir, 'init', '-q')
    add(dir, '--round', 'r1', '--mode', 'directions', '--asked', 'x', '--picked', 'none')
    add(dir, '--round', 'r2', '--mode', 'directions', '--asked', 'x', '--picked', 'none')
    const round = join(dir, '.swatches', 'r3')
    mkdirSync(round, { recursive: true })
    option(join(round, 'a.html'), 'A', '', 'serif')
    option(join(round, 'b.html'), 'B', '', 'serif')
    const result = run(sheet, [round], dir)
    expect(result.status).toBe(3)
    expect(result.stderr).toMatch(/STOP/)
  })

  it.skipIf(!chrome)(
    'photographs set folders and warns on foreign fonts and dropped traits',
    () => {
      git(dir, 'init', '-q')
      add(
        dir,
        '--round',
        'r0',
        '--mode',
        'directions',
        '--asked',
        'x',
        '--picked',
        'A',
        '--drop',
        'glow',
      )
      mkdirSync(join(dir, '.swatches', '_shell'), { recursive: true })
      writeFileSync(
        join(dir, '.swatches', '_shell', 'shell.css'),
        'body{font-family: "Source Serif 4", serif}',
      )
      for (const set of ['set-1', 'set-2']) {
        const folder = join(dir, '.swatches', 'r1', set)
        mkdirSync(folder, { recursive: true })
        option(join(folder, 'a.html'), `${set} a`, 'fade', 'serif')
        option(join(folder, 'b.html'), `${set} b`, 'glow, particles', '"IBM Plex Mono", serif')
      }
      const result = run(sheet, [join(dir, '.swatches', 'r1'), '--widths', '600'], dir)
      expect(result.status, result.stderr).toBe(0)
      expect(result.stdout).toMatch(/4 options in 2 sets at 600px/)
      expect(result.stdout).toMatch(
        /WARN set-1\/b at 600px: fonts that are not the project's: IBM Plex Mono/,
      )
      expect(result.stdout).toMatch(/WARN set-2\/b: repeats traits the user dropped: glow/)
      expect(result.stdout).not.toMatch(/set-1\/a at 600px: fonts/)
      expect(existsSync(join(dir, '.swatches', 'r1', 'set-2', 'sheet.png'))).toBe(true)
      expect(readFileSync(join(dir, '.swatches', 'r1', 'set-1', 'index.html'), 'utf8')).toContain(
        'data: fake: 12 rows',
      )
    },
    120000,
  )

  it.skipIf(!chrome)(
    'puts live frames in the index with --live',
    () => {
      git(dir, 'init', '-q')
      const round = join(dir, '.swatches', 'r1')
      mkdirSync(round, { recursive: true })
      option(join(round, 'a.html'), 'A', '', 'serif')
      option(join(round, 'b.html'), 'B', '', 'serif')
      const result = run(sheet, [round, '--live', '--widths', '600'], dir)
      expect(result.status, result.stderr).toBe(0)
      const index = readFileSync(join(round, 'index.html'), 'utf8')
      expect(index).toContain('<iframe src="a.html"')
      expect(index).not.toContain('data:image/png')
    },
    120000,
  )
})
