import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const root = join(import.meta.dirname, '..')
const probe = join(root, 'taste/scripts/motion-probe.mjs')
const chrome = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/opt/pw-browsers/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((path) => path && existsSync(path))

// A wordmark that eases in over 900ms above a canvas that draws a moving mark.
const page = ({ early, push, rebuildOnBack }) => `<!doctype html><meta charset="utf-8">
<style>body{margin:0;font:16px sans-serif;background:#fff}h1{font-size:64px;margin:40px;animation:in 900ms ease-out both}@keyframes in{from{opacity:0;transform:translateY(8px)}}canvas{display:block;width:1200px;height:600px}main{transition:transform .4s}.up{transform:translateY(-120px)}</style>
<div id="top"></div><main id="m"><h1>PostPrint.</h1><button id="go">Sign up</button></main><canvas width="600" height="300"></canvas>
<script>
const c = document.querySelector('canvas').getContext('2d')
c.fillStyle = '#fff'; c.fillRect(0, 0, 600, 300)
const spin = () => { const t0 = performance.now(); (function f(t) { c.fillStyle = '#fff'; c.fillRect(0, 0, 600, 300); c.fillStyle = '#c00'; c.fillRect(Math.max(0, t - t0) / 10 % 600, 100, 20, 20); requestAnimationFrame(f) })(t0) }
${early ? 'spin()' : "Promise.all(document.querySelector('h1').getAnimations().map((a) => a.finished)).then(() => setTimeout(spin, 200))"}
${push ? "setTimeout(() => { document.getElementById('top').style.height = '40px' }, 500)" : ''}
const m = document.getElementById('m')
document.getElementById('go').onclick = () => { history.pushState({}, '', '#signup'); m.classList.add('up') }
addEventListener('popstate', () => { ${rebuildOnBack ? "const html = m.outerHTML; document.body.querySelector('main').remove(); setTimeout(() => document.body.insertAdjacentHTML('afterbegin', html.replace(' class=\"up\"', '')), 300)" : "m.classList.remove('up')"} })
</script>`

let dir
beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'motion-probe-'))
})
afterAll(() => rmSync(dir, { recursive: true, force: true }))

const runProbe = (name, html, ...args) => {
  writeFileSync(join(dir, `${name}.html`), html)
  return spawnSync(
    process.execPath,
    [probe, join(dir, `${name}.html`), '--out', join(dir, name), '--load-ms', '2500', ...args],
    { encoding: 'utf8', env: { ...process.env, CHROME_PATH: chrome ?? '' } },
  )
}

describe('taste motion-probe.mjs', () => {
  it('prints usage and exits 2 without a page', () => {
    const result = spawnSync(process.execPath, [probe], { encoding: 'utf8' })
    expect(result.status).toBe(2)
    expect(result.stderr).toMatch(/Usage/)
  })

  it.skipIf(!chrome)(
    'flags a layout jump and a showpiece that starts before the lead settles',
    () => {
      const result = runProbe('early', page({ early: true, push: true }))
      expect(result.status).toBe(1)
      expect(result.stdout).toMatch(/FAIL showpiece \(@showpiece\) jumped 40px in one frame/)
      expect(result.stdout).toMatch(/WARN the showpiece starts \d+ms before the lead settles/)
    },
    120000,
  )

  it.skipIf(!chrome)(
    'passes a showpiece that waits for the lead, and a way back that animates',
    () => {
      const result = runProbe('clean', page({}), '--roundtrip', '#go')
      expect(result.status, result.stdout).toBe(0)
      expect(result.stdout).not.toMatch(/^\s*FAIL |before the lead settles/m)
      expect(result.stdout).toMatch(/roundtrip: the way in settles in \d+ms, the way back in \d+ms/)
    },
    120000,
  )

  it.skipIf(!chrome)(
    'flags a lead that is rebuilt and vanishes on the way back',
    () => {
      const result = runProbe('rebuild', page({ rebuildOnBack: true }), '--roundtrip', '#go')
      expect(result.status).toBe(1)
      expect(result.stdout).toMatch(/FAIL lead \(h1\) was removed and rebuilt/)
      expect(result.stdout).toMatch(/FAIL the lead \(h1\) vanished at \d+ms and came back/)
    },
    120000,
  )
})
