#!/usr/bin/env node
// Measure motion a screenshot cannot show, on a running app or a local page.
//   node <skill>/scripts/motion-probe.mjs <url-or-html-file> [--lead <selector>] [--showpiece <selector>]
//        [--track "<selector>,<selector>"] [--steps steps.json] [--roundtrip <selector>]
//        [--load-ms 3000] [--width 1440] [--cpu 4] [--budget-ms 20] [--out <dir>]
//   node <skill>/scripts/motion-probe.mjs frames <video> [--from <s>] [--to <s>] [--fps 30] [--out <dir>]
// It records every tracked element on every animation frame (position, size, opacity, text length,
// whether an animation runs on it, and for a canvas a tiny pixel digest), films the screen, and checks:
//   load       the lead (default h1) and the showpiece (default the largest canvas, svg, video or image)
//              never jump without an animation, are never rebuilt, and the showpiece starts only after
//              the lead settles; layout shift on load.
//   steps      a JSON list run after load: {"click": sel} {"move": [x, y]} {"key": "Enter"}
//              {"type": "text"} {"back": true} {"scroll": y} {"wait": ms}. Each step is a segment.
//   roundtrip  click <selector>, wait, go back, wait: flags near-empty frames (a loader or blank flash),
//              the lead vanishing, one-frame jumps, and a way back much slower or faster than the way in.
//   cost       a separate load at --cpu times slower CPU: p50 and p95 frame time against --budget-ms.
// `frames` turns a screen recording into timestamped frames and contact sheets (needs ffmpeg).
// Node 22+, no dependencies.
/* global WebSocket */
import { execFileSync, spawn, spawnSync } from 'node:child_process'
import { createServer } from 'node:http'
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { homedir } from 'node:os'
import { basename, dirname, extname, join, normalize, relative, resolve } from 'node:path'

const args = process.argv.slice(2)
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`)
  return index === -1 ? fallback : args[index + 1]
}
const positional = args.filter(
  (arg, index) => !arg.startsWith('--') && !args[index - 1]?.startsWith('--'),
)

/** Pictures go inside the project's .git folder when there is one, else into .taste/. */
function outDir(name) {
  if (option('out')) return resolve(option('out'), name)
  try {
    const gitDir = execFileSync('git', ['rev-parse', '--absolute-git-dir'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    return join(gitDir, name)
  } catch {
    return resolve('.taste', name)
  }
}

if (positional[0] === 'frames') {
  framesFromVideo(positional[1])
  process.exit(0)
}

/** A user's screen recording as frames named by their time, plus 6×5 contact sheets. */
function framesFromVideo(video) {
  if (!video || !existsSync(video)) {
    console.error(
      'Usage: node motion-probe.mjs frames <video> [--from <s>] [--to <s>] [--fps 30] [--out <dir>]',
    )
    process.exit(2)
  }
  if (spawnSync('ffmpeg', ['-version']).status !== 0) {
    console.error('ffmpeg is not on PATH. Install it (brew install ffmpeg), then run this again.')
    process.exit(2)
  }
  const fps = Number(option('fps', 30))
  const from = Number(option('from', 0))
  const out = outDir('taste-frames')
  rmSync(out, { recursive: true, force: true })
  mkdirSync(out, { recursive: true })
  const range = ['-ss', String(from), ...(option('to') ? ['-to', option('to')] : [])]
  const run = (extra) =>
    execFileSync(
      'ffmpeg',
      ['-hide_banner', '-loglevel', 'error', ...range, '-i', video, ...extra],
      {
        stdio: ['ignore', 'ignore', 'inherit'],
      },
    )
  run(['-vf', `fps=${fps},scale=480:-2`, '-q:v', '4', join(out, 'frame-%04d.jpg')])
  const frames = readdirSync(out)
    .filter((name) => name.startsWith('frame-'))
    .sort()
  const index = frames.map((name, i) => {
    const ms = Math.round((from + i / fps) * 1000)
    const named = `t${String(ms).padStart(6, '0')}ms.jpg`
    execFileSync('mv', [join(out, name), join(out, named)])
    return named
  })
  run(['-vf', `fps=${fps},scale=320:-2,tile=6x5`, '-q:v', '4', join(out, 'sheet-%02d.jpg')])
  const sheets = readdirSync(out)
    .filter((name) => name.startsWith('sheet-'))
    .sort()
  writeFileSync(join(out, 'index.txt'), index.join('\n'))
  console.log(
    `${index.length} frames at ${fps}fps from ${from}s, named by time: ${out}/t<ms>ms.jpg`,
  )
  sheets.forEach((sheet, i) =>
    console.log(
      `sheet ${join(out, sheet)}  (frames ${index[i * 30] ?? ''} to ${index[Math.min(index.length, (i + 1) * 30) - 1] ?? ''}, left to right, then down)`,
    ),
  )
}

const target = positional[0]
if (!target) {
  console.error(
    'Usage: node motion-probe.mjs <url-or-html-file> [--lead <sel>] [--showpiece <sel>] [--track "<sel>,..."] [--steps steps.json] [--roundtrip <sel>] [--load-ms 3000] [--width 1440] [--cpu 4] [--budget-ms 20]\n       node motion-probe.mjs frames <video> [--from <s>] [--to <s>] [--fps 30]',
  )
  process.exit(2)
}
const isUrl = /^https?:\/\//.test(target)
if (!isUrl && !existsSync(target)) {
  console.error(`No such page: ${target}`)
  process.exit(2)
}
const width = Number(option('width', 1440))
const height = 900
const loadMs = Number(option('load-ms', 3000))
const cpu = Number(option('cpu', 4))
const budget = Number(option('budget-ms', 20))
const lead = option('lead', 'h1')
const showpiece = option('showpiece', '@showpiece')
const tracked = [
  ['lead', lead],
  ['showpiece', showpiece],
  ...(option('track') ?? '')
    .split(',')
    .map((sel) => sel.trim())
    .filter(Boolean)
    .map((sel) => [sel, sel]),
]
const steps = option('steps')
  ? JSON.parse(readFileSync(option('steps'), 'utf8'))
  : option('roundtrip')
    ? [{ click: option('roundtrip') }, { wait: 1500 }, { back: true }, { wait: 1500 }]
    : []

// A local page is served over a throwaway server; a URL is opened as it is.
let server = null
let url = target
if (!isUrl) {
  const file = resolve(target)
  const root = statSync(file).isDirectory() ? file : dirname(file)
  const page = statSync(file).isDirectory() ? 'index.html' : basename(file)
  const TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.woff2': 'font/woff2',
  }
  server = createServer((request, response) => {
    let path
    try {
      path = normalize(join(root, decodeURIComponent(new URL(request.url, 'http://x').pathname)))
    } catch {
      return response.writeHead(400).end()
    }
    if (relative(root, path).startsWith('..')) return response.writeHead(403).end()
    if (existsSync(path) && statSync(path).isDirectory()) path = join(path, 'index.html')
    if (!existsSync(path))
      return response.writeHead(request.url === '/favicon.ico' ? 204 : 404).end()
    response.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' })
    response.end(readFileSync(path))
  })
  await new Promise((done) => server.listen(0, '127.0.0.1', done))
  url = `http://127.0.0.1:${server.address().port}/${page}`
}
// A development host with its own certificate authority is still the user's own app.
const devHost = /^(localhost|127\.0\.0\.1|\[::1\])$|\.(localhost|test|internal|local)$/.test(
  new URL(url).hostname,
)

function findChrome() {
  const cache = (dir) => {
    try {
      return readdirSync(dir)
        .filter((name) => name.startsWith('chromium'))
        .flatMap((name) => [
          join(dir, name, 'chrome-linux', 'chrome'),
          join(dir, name, 'chrome-linux64', 'chrome'),
          join(dir, name, 'chrome-mac', 'Chromium.app/Contents/MacOS/Chromium'),
        ])
    } catch {
      return []
    }
  }
  return [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/opt/pw-browsers/chromium',
    ...cache(process.env.PLAYWRIGHT_BROWSERS_PATH ?? ''),
    ...cache(join(homedir(), '.cache', 'ms-playwright')),
    ...cache(join(homedir(), 'Library', 'Caches', 'ms-playwright')),
  ].find((path) => path && existsSync(path))
}
const chrome = findChrome()
if (!chrome) {
  console.error('No Chrome or Chromium found. Set CHROME_PATH to one, then run this again.')
  process.exit(2)
}
const out = outDir('taste-probe-frames')
rmSync(out, { recursive: true, force: true })
const profile = join(out, 'chrome-profile')
mkdirSync(profile, { recursive: true })
const browser = spawn(
  chrome,
  [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--hide-scrollbars',
    '--force-color-profile=srgb',
    ...(devHost ? ['--ignore-certificate-errors'] : []),
    ...(process.platform === 'linux' ? ['--no-sandbox', '--disable-dev-shm-usage'] : []),
    'about:blank',
  ],
  { stdio: ['ignore', 'ignore', 'pipe'] },
)
const endpoint = await new Promise((done, fail) => {
  let log = ''
  const timer = setTimeout(
    () => fail(new Error(`Chrome did not start:\n${log.slice(-500)}`)),
    20000,
  )
  browser.stderr.on('data', (chunk) => {
    log += chunk
    const match = log.match(/DevTools listening on (ws:\/\/\S+)/)
    if (match) {
      clearTimeout(timer)
      done(match[1])
    }
  })
  browser.on('exit', (code) => fail(new Error(`Chrome exited (${code}):\n${log.slice(-500)}`)))
})
const finish = (code) => {
  browser.kill('SIGKILL')
  server?.close()
  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
  } catch {
    // left for the next run, which clears the folder first
  }
  process.exit(code)
}

// A minimal DevTools Protocol client over Node's built-in WebSocket.
const socket = new WebSocket(endpoint)
await new Promise((done) => socket.addEventListener('open', done, { once: true }))
let nextId = 0
const waiting = new Map()
const listeners = []
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data)
  if (message.id && waiting.has(message.id)) {
    const { done, fail } = waiting.get(message.id)
    waiting.delete(message.id)
    if (message.error) fail(new Error(message.error.message))
    else done(message.result)
  } else for (const listen of listeners) listen(message)
})
const send = (method, params = {}, sessionId) =>
  new Promise((done, fail) => {
    const id = ++nextId
    waiting.set(id, { done, fail })
    socket.send(JSON.stringify({ id, method, params, sessionId }))
  })
const pause = (ms) => new Promise((done) => setTimeout(done, ms))
const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
const call = (method, params) => send(method, params, sessionId)
const evaluate = async (expression) =>
  (await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result
    .value

// The recorder runs in the page on every animation frame and reports through a binding, which
// survives navigations, so a full-page Back is recorded as well as a client-side one.
const RECORDER = `(() => {
  if (window.__motionProbe) return
  window.__motionProbe = true
  const tracked = ${JSON.stringify(tracked)}
  const report = (event) => { try { window.__probeSend(JSON.stringify(event)) } catch {} }
  const showpiece = () => {
    let best = null, area = innerWidth * innerHeight * 0.15
    for (const el of document.querySelectorAll('canvas, svg, video, img')) {
      if (el instanceof SVGElement && el.ownerSVGElement) continue
      const r = el.getBoundingClientRect(); const a = r.width * r.height
      if (a > area) { area = a; best = el }
    }
    return best
  }
  const find = (sel) => sel === '@showpiece' ? showpiece() : document.querySelector(sel)
  const refs = {}
  const replaced = {}
  const lost = {}
  const animated = (el) => { for (let e = el; e; e = e.parentElement) if (e.getAnimations().some((a) => a.playState === 'running')) return true; return false }
  const opacity = (el) => { let o = 1; for (let e = el; e; e = e.parentElement) { const s = getComputedStyle(e); if (s.visibility === 'hidden' || s.display === 'none') return 0; o *= Number(s.opacity) } return o }
  const tiny = document.createElement('canvas'); tiny.width = 64; tiny.height = 32
  const tinyCtx = tiny.getContext('2d', { willReadFrequently: true }); tinyCtx.imageSmoothingQuality = 'high'
  const digest = (el) => { if (!(el instanceof HTMLCanvasElement) || !el.width) return 0; try { tinyCtx.clearRect(0, 0, 64, 32); tinyCtx.drawImage(el, 0, 0, 64, 32); let sum = 0; for (const v of tinyCtx.getImageData(0, 0, 64, 32).data) sum = (sum * 31 + v) % 1000003; return sum } catch { return 0 } }
  const seen = new WeakSet()
  const describe = (el) => el ? el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\\s+/)[0] : '') : ''
  const frame = () => {
    const samples = {}
    for (const [key, sel] of tracked) {
      let el = refs[key]
      if (el && !el.isConnected) lost[key] = true
      if (!el || !el.isConnected) {
        const next = find(sel)
        if (lost[key] && next) { replaced[key] = (replaced[key] || 0) + 1; lost[key] = false }
        el = refs[key] = next
      }
      if (!el) { samples[key] = null; continue }
      const r = el.getBoundingClientRect()
      samples[key] = { x: Math.round(r.x * 10) / 10, y: Math.round(r.y * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10, o: Math.round(opacity(el) * 100) / 100, t: key === 'lead' ? el.textContent.length : 0, a: animated(el), c: digest(el), r: replaced[key] || 0 }
    }
    for (const animation of document.getAnimations()) {
      if (seen.has(animation)) continue
      seen.add(animation)
      const target = animation.effect?.target
      const owner = tracked.find(([key]) => refs[key] && target && (refs[key] === target || refs[key].contains(target)))?.[0] ?? ''
      const started = Date.now()
      report({ kind: 'animation', owner, target: describe(target), at: started })
      animation.finished.then(() => report({ kind: 'animation-end', owner, target: describe(target), at: Date.now(), started })).catch(() => {})
    }
    report({ kind: 'frame', at: Date.now(), samples })
    requestAnimationFrame(frame)
  }
  try { new PerformanceObserver((list) => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) report({ kind: 'shift', at: Date.now(), value: entry.value }) }).observe({ type: 'layout-shift', buffered: true }) } catch {}
  requestAnimationFrame(frame)
})()`

const events = []
const shots = []
listeners.push((message) => {
  if (message.sessionId !== sessionId) return
  if (message.method === 'Runtime.bindingCalled' && message.params.name === '__probeSend')
    events.push(JSON.parse(message.params.payload))
  if (message.method === 'Page.screencastFrame') {
    const { data, metadata, sessionId: frameId } = message.params
    shots.push({ at: Math.round(metadata.timestamp * 1000), bytes: data.length, data })
    call('Page.screencastFrameAck', { sessionId: frameId }).catch(() => {})
  }
})
await call('Page.enable')
await call('Runtime.enable')
await call('Runtime.addBinding', { name: '__probeSend' })
await call('Page.addScriptToEvaluateOnNewDocument', { source: RECORDER })
await call('Emulation.setDeviceMetricsOverride', {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: width < 600,
})

const segments = []
const segment = async (name, act, ms) => {
  const start = Date.now()
  await act()
  await pause(ms)
  segments.push({ name, start, end: Date.now() })
}
await call('Page.startScreencast', { format: 'jpeg', quality: 50, maxWidth: 720, everyNthFrame: 1 })
await segment('load', () => call('Page.navigate', { url }), loadMs)

const center = async (selector) =>
  evaluate(
    `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return null; el.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } })()`,
  )
const mouse = async (type, x, y) =>
  call('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 })
for (const step of steps) {
  const [verb] = Object.keys(step).filter((key) => key !== 'name')
  const label =
    step.name ??
    `${verb} ${typeof step[verb] === 'string' ? step[verb] : JSON.stringify(step[verb])}`
  const act = async () => {
    if (verb === 'click') {
      const at = await center(step.click)
      if (!at) throw new Error(`step "${label}": no element matches ${step.click}`)
      await mouse('mouseMoved', at.x, at.y)
      await mouse('mousePressed', at.x, at.y)
      await mouse('mouseReleased', at.x, at.y)
    } else if (verb === 'move')
      await call('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: step.move[0],
        y: step.move[1],
        steps: 8,
      })
    else if (verb === 'key') {
      await call('Input.dispatchKeyEvent', { type: 'keyDown', key: step.key })
      await call('Input.dispatchKeyEvent', { type: 'keyUp', key: step.key })
    } else if (verb === 'type') await call('Input.insertText', { text: step.type })
    else if (verb === 'back') await evaluate('history.back()')
    else if (verb === 'scroll')
      await evaluate(`scrollTo({ top: ${Number(step.scroll)}, behavior: 'smooth' })`)
  }
  await segment(label, act, verb === 'wait' ? Number(step.wait) : Number(step.after ?? 1200))
}
await call('Page.stopScreencast')

// The cost pass: the same load on a slower CPU, timed by the recorder's own frames.
const costStart = Date.now()
await call('Emulation.setCPUThrottlingRate', { rate: cpu })
await call('Page.navigate', { url })
await pause(Math.max(loadMs, 2500))
await call('Emulation.setCPUThrottlingRate', { rate: 1 })
const costFrames = events.filter((event) => event.kind === 'frame' && event.at >= costStart + 300)

// ---- checks -------------------------------------------------------------------------------------
const lines = []
let fails = 0
const flag = (level, text) => {
  if (level === 'FAIL') fails++
  lines.push(`  ${level} ${text}`)
}
/** A segment's frames, led by the last frame before it, so a change at its very start is seen. */
const framesIn = (seg) => {
  const all = events.filter((event) => event.kind === 'frame')
  const inside = all.filter((event) => event.at >= seg.start && event.at <= seg.end)
  const before = all.filter((event) => event.at < seg.start).at(-1)
  return before ? [before, ...inside] : inside
}
const moved = (a, b) =>
  a && b
    ? Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.w - b.w), Math.abs(a.h - b.h))
    : 0
const changed = (a, b) =>
  a && b
    ? moved(a, b) > 0.5 || Math.abs(a.o - b.o) > 0.01 || a.t !== b.t || a.c !== b.c
    : Boolean(a) !== Boolean(b)
const median = (values) => {
  const sorted = [...values].sort((x, y) => x - y)
  return sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0
}
const quantile = (values, q) => {
  const sorted = [...values].sort((x, y) => x - y)
  return sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))] : 0
}
/** When a tracked element first and last changed within a segment, from its own samples. */
const activity = (frames, key) => {
  let first = null
  let last = null
  for (let i = 1; i < frames.length; i++)
    if (changed(frames[i - 1].samples[key], frames[i].samples[key])) {
      first ??= frames[i].at
      last = frames[i].at
    }
  return { first, last }
}
/** One-frame jumps: a move of more than 2px with no animation running on the element (a layout
 * jump), or a move more than 4× the element's median move and over 6px (a snap in a smooth motion). */
function jumps(frames, key) {
  const found = []
  const steps = []
  for (let i = 1; i < frames.length; i++) {
    const a = frames[i - 1].samples[key]
    const b = frames[i].samples[key]
    const d = moved(a, b)
    if (d > 0.05) steps.push({ d, b, a, at: frames[i].at })
  }
  const typical = median(steps.map((step) => step.d))
  for (const step of steps) {
    const still = !step.a.a && !step.b.a
    if (still && step.d > 2) found.push({ kind: 'layout', ...step })
    else if (step.d > 6 && step.d > typical * 4) found.push({ kind: 'snap', ...step })
  }
  return found
}
const ms = (at, seg) => `${at - seg.start}ms`
const shotsIn = (seg) => shots.filter((shot) => shot.at >= seg.start && shot.at <= seg.end)
/** Near-empty frames: a JPEG far smaller than the segment's typical frame is mostly blank or a loader. */
function emptyFrames(seg) {
  // Frames before the page's first animation frame are the blank before first paint, not a flash.
  const painted =
    events.find((event) => event.kind === 'frame' && event.at >= seg.start)?.at ?? seg.start
  const list = shotsIn(seg).filter((shot) => shot.at >= painted + 50)
  const typical = median(list.map((shot) => shot.bytes))
  return list.filter((shot) => shot.bytes < typical * 0.3)
}
const saveShot = (shot, name) => {
  const file = join(out, name)
  writeFileSync(file, Buffer.from(shot.data, 'base64'))
  return file
}

for (const seg of segments) {
  const frames = framesIn(seg)
  lines.push(
    `${seg.name}: ${frames.length - (frames[0].at < seg.start ? 1 : 0)} frames over ${seg.end - seg.start}ms`,
  )
  if (!frames.length) {
    flag('WARN', 'no frames recorded: the page did not load or blocked the recorder')
    continue
  }
  const last = frames.at(-1).samples
  for (const [key, sel] of tracked) {
    if (!frames.some((frame) => frame.samples[key])) {
      if (seg.name === 'load' && key !== 'showpiece') flag('WARN', `${key} (${sel}) never appeared`)
      continue
    }
    const rebuilt = (last[key]?.r ?? 0) - (frames[0].samples[key]?.r ?? 0)
    if (rebuilt > 0)
      flag(
        'FAIL',
        `${key} (${sel}) was removed and rebuilt ${rebuilt} time(s): the page re-rendered under the visitor (hydration mismatch or a remount)`,
      )
    for (const jump of jumps(frames, key).slice(0, 3))
      flag(
        (jump.kind === 'layout' && (key === 'lead' || seg.name === 'load')) || key === 'lead'
          ? 'FAIL'
          : 'WARN',
        jump.kind === 'layout'
          ? `${key} (${sel}) jumped ${jump.d.toFixed(0)}px in one frame at ${ms(jump.at, seg)} with no animation running: a layout jump`
          : `${key} (${sel}) snapped ${jump.d.toFixed(0)}px in one frame at ${ms(jump.at, seg)}, over 4× its usual step: a discontinuity in a smooth motion`,
      )
  }
  const visibleLead = frames.map((frame) => frame.samples.lead && frame.samples.lead.o > 0.05)
  const gone = visibleLead.findIndex(
    (shown, i) =>
      i > 0 &&
      !shown &&
      visibleLead.slice(0, i).some(Boolean) &&
      visibleLead.slice(i).some(Boolean),
  )
  if (gone > 0)
    flag(
      'FAIL',
      `the lead (${lead}) vanished at ${ms(frames[gone].at, seg)} and came back: a loader or blank screen flashed`,
    )
  const empty = emptyFrames(seg)
  if (empty.length)
    flag(
      'WARN',
      `${empty.length} near-empty frame(s) from ${ms(empty[0].at, seg)} (a loader or a blank flash?): ${saveShot(empty[0], `empty-${segments.indexOf(seg)}.jpg`)}`,
    )
  if (seg.name === 'load') {
    const leadSpan = activity(frames, 'lead')
    const leadEnds = events
      .filter(
        (event) =>
          event.kind === 'animation-end' &&
          event.owner === 'lead' &&
          event.at <= seg.end &&
          event.at >= seg.start,
      )
      .map((event) => event.at)
    const leadSettled = Math.max(leadSpan.last ?? seg.start, ...leadEnds)
    const showStarts = events
      .filter(
        (event) =>
          event.kind === 'animation' &&
          event.owner === 'showpiece' &&
          event.at >= seg.start &&
          event.at <= seg.end,
      )
      .map((event) => event.at)
    const showSpan = activity(frames, 'showpiece')
    const showStart = Math.min(showSpan.first ?? Infinity, ...showStarts)
    lines.push(
      `  lead settles at ${leadSettled === seg.start ? 'once (no motion seen)' : ms(leadSettled, seg)}; showpiece starts at ${Number.isFinite(showStart) ? ms(showStart, seg) : '(no motion seen)'}`,
    )
    if (Number.isFinite(showStart) && leadSettled > seg.start && showStart < leadSettled - 50)
      flag(
        'WARN',
        `the showpiece starts ${leadSettled - showStart}ms before the lead settles: let the lead land first, then start the showpiece about 150–250ms later`,
      )
    const shift = events
      .filter((event) => event.kind === 'shift' && event.at >= seg.start && event.at <= seg.end)
      .reduce((sum, event) => sum + event.value, 0)
    if (shift > 0.1)
      flag(
        'FAIL',
        `layout shift ${shift.toFixed(3)} during load: something resizes or arrives late and pushes the page`,
      )
    else if (shift > 0.02) flag('WARN', `layout shift ${shift.toFixed(3)} during load`)
  }
}

// The way back mirrors the way in: same path, about two-thirds of the time.
const settleTime = (seg) => {
  const frames = framesIn(seg)
  let last = null
  for (let i = 1; i < frames.length; i++)
    if (tracked.some(([key]) => changed(frames[i - 1].samples[key], frames[i].samples[key])))
      last = frames[i].at
  return last === null ? 0 : last - seg.start
}
const forward = segments.find((seg) => seg.name.startsWith('click'))
const back = segments.find((seg) => seg.name.startsWith('back'))
if (forward && back) {
  const there = settleTime(forward)
  const home = settleTime(back)
  lines.push(`roundtrip: the way in settles in ${there}ms, the way back in ${home}ms`)
  if (there > 0 && home > 0 && (home > there * 1.5 || home < there / 1.5))
    flag(
      'WARN',
      `the way back takes ${(home / there).toFixed(2)}× the way in; play the same path at about two-thirds of the time`,
    )
  if (there > 0 && home === 0)
    flag('WARN', 'the way back has no motion: it snaps, while the way in animates')
}

const deltas = costFrames
  .slice(1)
  .map((frame, i) => frame.at - costFrames[i].at)
  .filter((d) => d > 0)
const p50 = median(deltas)
const p95 = quantile(deltas, 0.95)
lines.push(
  `cost at ${cpu}× slower CPU: ${deltas.length} frames, p50 ${p50}ms, p95 ${p95}ms (budget ${budget}ms)`,
)
if (deltas.length < 10)
  flag('WARN', 'too few frames to time: the page may be blocking the main thread')
else if (p95 > budget)
  flag(
    'WARN',
    `p95 frame time ${p95}ms is over ${budget}ms: find the per-frame work (filters, layout reads, per-item draws) before tuning motion`,
  )

const strip = shots
  .filter((_, i) => i % Math.max(1, Math.floor(shots.length / 24)) === 0)
  .slice(0, 24)
strip.forEach((shot, i) =>
  saveShot(shot, `frame-${String(i + 1).padStart(2, '0')}-${shot.at - segments[0].start}ms.jpg`),
)
writeFileSync(join(out, 'events.json'), JSON.stringify({ segments, events }))
lines.push(`frames: ${out}/frame-<n>-<ms since load>ms.jpg (${strip.length} of ${shots.length})`)
console.log(lines.join('\n'))
console.log(
  fails
    ? `${fails} FAIL(s). Fix them, then run this again.`
    : 'No FAILs measured. Read the WARN lines and open the frames.',
)
finish(fails ? 1 : 0)
