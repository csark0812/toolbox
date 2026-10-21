import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(import.meta.dirname, '..')
const probe = join(root, 'css-craft/scripts/probe.mjs')
const chrome = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/opt/pw-browsers/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((path) => path && existsSync(path))

describe('css-craft probe.mjs', () => {
  it('prints usage and exits 2 without a page or selector', () => {
    const result = spawnSync(process.execPath, [probe], { encoding: 'utf8' })
    expect(result.status).toBe(2)
    expect(result.stderr).toMatch(/Usage/)
  })

  it.skipIf(!chrome)('reports each theme path and only what changed against HEAD', () => {
    const dir = mkdtempSync(join(tmpdir(), 'css-probe-'))
    try {
      const css = (dark) =>
        `:root { --bg: #ffffff; --fg: #111111; }\n:root[data-theme='dark'] { --fg: #f5f5f5; ${dark} }\n.note { background: var(--bg); color: var(--fg); }\n`
      writeFileSync(join(dir, 'app.css'), css(''))
      writeFileSync(
        join(dir, 'index.html'),
        '<!doctype html><link rel="stylesheet" href="app.css"><p class="note">Hi</p>',
      )
      const git = (...args) => execFileSync('git', args, { cwd: dir, stdio: 'pipe' })
      git('init', '-q')
      git('add', '.')
      git('-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-qm', 'base')
      writeFileSync(join(dir, 'app.css'), css('--bg: #111111;'))
      const output = execFileSync(
        process.execPath,
        [
          probe,
          'index.html',
          '--select',
          '.note',
          '--states',
          'rest',
          '--themes',
          'light,data-theme=dark',
          '--against',
          'HEAD',
        ],
        { cwd: dir, encoding: 'utf8', env: { ...process.env, CHROME_PATH: chrome } },
      )
      expect(output).toMatch(
        /data-theme=dark \| 390,1280px \| rest \| \.note\[0\] \| .*text 1\.\d+:1 {2}-> {2}.*background-color=rgb\(17, 17, 17\).*text 1[5-9]\.\d+:1/,
      )
      expect(output).not.toMatch(/^light \|.*rest/m)
      expect(output).toMatch(/6 of 8 readings identical to HEAD/)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
