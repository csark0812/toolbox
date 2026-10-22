#!/usr/bin/env node
// Resolve computed styles in headless Chrome for every theme, width and state in one call.
//   node <skill>/scripts/probe.mjs <page.html> [--select '<css selectors>'] [options]
//   node <skill>/scripts/probe.mjs --markup '<nav class=nav><a href=#>A</a></nav>' --css nav.css --select '.nav a'
// Options:
//   --props color,background-color,...   computed properties to print (default: colour and outline);
//                                        `box` adds rendered size, right edge and whether content is clipped
//   --widths 390,1280                    viewport widths for the readings (default 390,1280)
//   --sweep 320-1280/40                  overflow sweep: every 40px from 320 to the widest --widths,
//                                        plus common device widths; `off` skips it
//   --states rest,hover,focus,focus-visible   forced pseudo-classes (default rest,hover,focus-visible)
//   --themes light,dark,data-theme=dark  OS colour scheme, root attributes, or both joined with +
//   --against HEAD                       also render the files as they are at a git ref; print what changed
//   --max 3                              elements printed per selector
// Paths resolve from the current folder, which is served as the site root. Each line gives the
// computed values, the text contrast against the painted background, and the outline contrast
// against the parent's background. The sweep prints each width range where the page is wider than
// the viewport and the elements that cross its right edge, from the box they spill out of inwards.
// Exit 2 when Chrome is missing or a selector matches nothing. Node 22+, no dependencies.
/* global WebSocket, document, getComputedStyle, innerWidth */
import { execFileSync, spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { extname, join, normalize, relative, resolve } from 'node:path'

const args = process.argv.slice(2)
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`)
  return index === -1 ? fallback : args[index + 1]
}
const list = (value) =>
  String(value)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
const page = args[0] && !args[0].startsWith('--') ? args[0] : null
const markup = option('markup')
const selectors = option('select')
if (!page && !markup) {
  console.error(
    "Usage: node probe.mjs <page.html> | --markup '<html>' --css a.css,b.css  [--select '.a, .b'] [--props p1,p2] [--widths 390,1280] [--sweep 320-1280/40] [--states rest,hover,focus-visible] [--themes light,dark] [--against HEAD]",
  )
  process.exit(2)
}
const props = list(
  option('props', 'color,background-color,outline-style,outline-width,outline-color'),
)
const widths = list(option('widths', '390,1280')).map(Number)
const states = list(option('states', 'rest,hover,focus-visible'))
const themes = list(option('themes', 'light,dark'))
const against = option('against')
const max = Number(option('max', 3))
const sweepOption = option('sweep', '')
const sweep = (() => {
  if (sweepOption === 'off') return []
  const [, from = 320, to = Math.max(...widths), step = 40] =
    sweepOption.match(/^(\d+)-(\d+)(?:\/(\d+))?$/)?.map(Number) ?? []
  const devices = [360, 375, 390, 414, 430, 768, 800, 820, 834, 1024, 1180, 1280, 1366, 1440]
  const all = [...devices, ...widths].filter((w) => w >= from && w <= to)
  for (let w = from; w <= to; w += step) all.push(w)
  return [...new Set(all)].sort((a, b) => a - b)
})()
const root = resolve('.')

/** A file's bytes on disk, or as committed at `ref` when the probe renders the earlier version. */
function fileAt(file, ref) {
  if (!ref) return existsSync(file) && statSync(file).isFile() ? readFileSync(file) : null
  try {
    return execFileSync('git', ['show', `${ref}:./${relative(root, file)}`], {
      cwd: root,
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 64 * 1024 * 1024,
    })
  } catch {
    return null
  }
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
}
let serving = null
const server = createServer((request, response) => {
  const path = decodeURIComponent(new URL(request.url, 'http://x').pathname)
  if (path === '/__probe__.html') {
    const links = list(option('css', ''))
      .map((sheet) => `<link rel="stylesheet" href="/${sheet}">`)
      .join('')
    response.writeHead(200, { 'content-type': TYPES['.html'] })
    return response.end(`<!doctype html><html><head>${links}</head><body>${markup}</body></html>`)
  }
  let file = normalize(join(root, path))
  if (relative(root, file).startsWith('..')) return response.writeHead(403).end()
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
  const body = fileAt(file, serving)
  if (!body) return response.writeHead(404).end()
  response.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' })
  response.end(body)
})
await new Promise((done) => server.listen(0, '127.0.0.1', done))
const url = `http://127.0.0.1:${server.address().port}/${page ?? '__probe__.html'}`

function findChrome() {
  const cache = (dir) =>
    dir && existsSync(dir)
      ? readdirSync(dir)
          .filter((name) => name.startsWith('chromium'))
          .flatMap((name) => [
            join(dir, name, 'chrome-linux', 'chrome'),
            join(dir, name, 'chrome-linux64', 'chrome'),
            join(dir, name, 'chrome-mac', 'Chromium.app/Contents/MacOS/Chromium'),
          ])
      : []
  return [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/opt/pw-browsers/chromium',
    ...cache(process.env.PLAYWRIGHT_BROWSERS_PATH),
    ...cache(join(homedir(), '.cache', 'ms-playwright')),
    ...cache(join(homedir(), 'Library', 'Caches', 'ms-playwright')),
  ].find((path) => path && existsSync(path))
}
const chrome = findChrome()
if (!chrome) {
  console.error('No Chrome or Chromium found. Set CHROME_PATH, or resolve the cascade by script.')
  process.exit(2)
}
const profile = mkdtempSync(join(process.env.TMPDIR ?? tmpdir(), 'css-probe-'))
const browser = spawn(
  chrome,
  [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--hide-scrollbars',
    '--force-color-profile=srgb',
    ...(process.platform === 'linux' ? ['--no-sandbox', '--disable-dev-shm-usage'] : []),
    'about:blank',
  ],
  { stdio: ['ignore', 'ignore', 'pipe'] },
)
const finish = (code) => {
  browser.kill('SIGKILL')
  server.close()
  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
  } catch {
    // a leftover temporary profile is harmless
  }
  process.exit(code)
}
const endpoint = await new Promise((done, fail) => {
  let log = ''
  const timer = setTimeout(() => fail(new Error(`Chrome did not start: ${log.slice(-300)}`)), 20000)
  browser.stderr.on('data', (chunk) => {
    log += chunk
    const match = log.match(/DevTools listening on (ws:\/\/\S+)/)
    if (match) {
      clearTimeout(timer)
      done(match[1])
    }
  })
  browser.on('exit', (code) => fail(new Error(`Chrome exited (${code}): ${log.slice(-300)}`)))
}).catch((error) => {
  console.error(error.message)
  finish(2)
})

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
const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
const call = (method, params) => send(method, params, sessionId)
const evaluate = async (expression) =>
  (await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result
    .value
await call('Page.enable')
await call('DOM.enable')
await call('CSS.enable')

async function load() {
  const loaded = new Promise((done) => {
    const listen = (message) => {
      if (message.sessionId === sessionId && message.method === 'Page.loadEventFired') {
        listeners.splice(listeners.indexOf(listen), 1)
        done()
      }
    }
    listeners.push(listen)
  })
  await call('Page.navigate', { url })
  await loaded
}

// Runs in the page: computed values, painted background, contrast and box for each match.
const MEASURE = (selectorList, propList, limit) => {
  const paint = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  const rgba = (value) => {
    const match = /^rgba?\(/.test(value) && value.match(/[\d.]+/g)
    if (match) return [...match.slice(0, 3).map(Number), match[3] === undefined ? 1 : +match[3]]
    paint.clearRect(0, 0, 1, 1)
    paint.fillStyle = value
    paint.fillRect(0, 0, 1, 1)
    const data = paint.getImageData(0, 0, 1, 1).data
    return [data[0], data[1], data[2], data[3] / 255]
  }
  const over = (top, bottom) => [0, 1, 2].map((i) => top[i] * top[3] + bottom[i] * (1 - top[3]))
  const backdrop = (element) => {
    const layers = []
    for (let node = element; node && node.nodeType === 1; node = node.parentElement)
      layers.push(rgba(getComputedStyle(node).backgroundColor))
    let color = [255, 255, 255]
    for (const layer of layers.reverse()) color = over(layer, [...color, 1])
    return [...color, 1]
  }
  const luminance = ([r, g, b]) =>
    [r, g, b]
      .map((v) => v / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0)
  const ratio = (a, b) => {
    const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p)
    return ((x + 0.05) / (y + 0.05)).toFixed(2)
  }
  const rows = []
  for (const selector of selectorList)
    [...document.querySelectorAll(selector)].slice(0, limit).forEach((element, index) => {
      const style = getComputedStyle(element)
      const values = propList
        .filter((prop) => prop !== 'box')
        .filter((prop) => !/^outline-(?!style)/.test(prop) || style.outlineStyle !== 'none')
        .map(
          (prop) =>
            `${prop}=${style.getPropertyValue(prop).replace('rgba(0, 0, 0, 0)', 'transparent')}`,
        )
      const behind = backdrop(element)
      const text = over(rgba(style.color), behind)
      const extra = [`text ${ratio(text, behind)}:1`]
      if (style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0) {
        const parent = element.parentElement ? backdrop(element.parentElement) : behind
        extra.push(`outline ${ratio(over(rgba(style.outlineColor), parent), parent)}:1`)
      }
      const box = element.getBoundingClientRect()
      if (propList.includes('box'))
        extra.push(
          `box ${Math.round(box.width)}x${Math.round(box.height)} right=${Math.round(box.right)}`,
          `clipped=${element.scrollWidth > element.clientWidth}`,
        )
      rows.push({ key: `${selector}[${index}]`, text: [...values, ...extra].join(' ') })
    })
  return rows
}

// Runs in the page: when the document is wider than the viewport, every chain of elements that
// crosses the right edge (outside any clipping or scrolling box), widest first.
const OVERFLOW = () => {
  const html = document.documentElement
  const edge = innerWidth + 0.5
  if (html.scrollWidth <= innerWidth) return null
  const name = (el) =>
    el.localName + (el.id ? `#${el.id}` : '') + [...el.classList].map((c) => `.${c}`).join('')
  const crosses = (el) => el.getBoundingClientRect().right > edge
  const contained = (el) => {
    for (let node = el; node && node !== document.body; node = node.parentElement) {
      const style = getComputedStyle(node)
      if (style.position === 'fixed') return true
      if (node !== el && style.overflowX !== 'visible') return true
    }
    return false
  }
  const chains = new Map()
  for (const el of document.body.querySelectorAll('*')) {
    if (!crosses(el) || contained(el)) continue
    if (getComputedStyle(el).overflowX === 'visible' && [...el.children].some(crosses)) continue
    const path = [el]
    while (path[0].parentElement !== document.body && crosses(path[0].parentElement))
      path.unshift(path[0].parentElement)
    if (path[0].parentElement !== document.body) path.unshift(path[0].parentElement)
    const names = path.map(name)
    const key = (names.length > 4 ? [...names.slice(0, 2), '...', ...names.slice(-2)] : names).join(
      ' > ',
    )
    const over = Math.round(el.getBoundingClientRect().right - innerWidth)
    chains.set(key, Math.max(chains.get(key) ?? 0, over))
  }
  const list = [...chains].sort((a, b) => b[1] - a[1]).slice(0, 3)
  return { scroll: html.scrollWidth, names: list.map(([key]) => key) }
}

/** Sweep every width at rest; return one line per run of widths with the same offending elements. */
async function overflowSweep() {
  const runs = []
  for (const width of sweep) {
    await call('Emulation.setDeviceMetricsOverride', {
      width,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    })
    const found = await evaluate(`(${OVERFLOW})()`)
    const key = found ? found.names.join(' | ') || '(no element found)' : ''
    const last = runs.at(-1)
    if (last && last.key === key) last.widths.push(width)
    else runs.push({ key, widths: [width], worst: 0, at: width })
    const run = runs.at(-1)
    if (found && found.scroll - width > run.worst)
      [run.worst, run.at] = [found.scroll - width, width]
  }
  const range = (w) => (w.length > 1 ? `${w[0]}-${w.at(-1)}px` : `${w[0]}px`)
  const bad = runs.filter((run) => run.key)
  if (!bad.length) return [`no sideways overflow at any of ${sweep.length} widths ${range(sweep)}`]
  return bad.map(
    (run) =>
      `sideways overflow ${range(run.widths)} (${run.widths.length} widths) | page +${run.worst}px at ${run.at}px | ${run.key}`,
  )
}

// Split on commas outside parentheses and brackets, so `:is(a, b)` stays one selector.
const selectorList = String(selectors ?? '')
  .split(/,(?![^()[\]]*[)\]])/)
  .map((part) => part.trim())
  .filter(Boolean)

/** Every theme × width × state reading, as { group, theme, width, text } entries in a stable order. */
async function matrix(ref) {
  serving = ref ?? null
  await load()
  const out = []
  const notes = []
  let overflow = []
  for (const theme of themes) {
    const parts = theme.split('+')
    const scheme = parts.find((part) => part === 'light' || part === 'dark') ?? 'light'
    const attributes = parts.filter((part) => part.includes('=')).map((part) => part.split('='))
    await call('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-color-scheme', value: scheme }],
    })
    await evaluate(`(() => { const html = document.documentElement
      for (const name of (html.dataset.probeSet ?? '').split(' ').filter(Boolean)) html.removeAttribute(name)
      const set = ${JSON.stringify(attributes)}
      for (const [name, value] of set) html.setAttribute(name, value)
      html.dataset.probeSet = set.map(([name]) => name).join(' ') })()`)
    if (theme === themes[0] && sweep.length) overflow = await overflowSweep()
    for (const width of widths) {
      await call('Emulation.setDeviceMetricsOverride', {
        width,
        height: 800,
        deviceScaleFactor: 1,
        mobile: false,
      })
      const { root: doc } = await call('DOM.getDocument', { depth: 0 })
      const nodes = []
      for (const selector of selectorList) {
        const { nodeIds } = await call('DOM.querySelectorAll', { nodeId: doc.nodeId, selector })
        if (!nodeIds.length) notes.push(`no match: ${selector}`)
        nodes.push(...nodeIds.slice(0, max))
      }
      for (const state of states) {
        const forced = state === 'rest' ? [] : state.split('+')
        for (const nodeId of nodes)
          await call('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: forced })
        const rows = await evaluate(
          `(${MEASURE})(${JSON.stringify(selectorList)}, ${JSON.stringify(props)}, ${max})`,
        )
        for (const row of rows)
          out.push({ group: `${state} | ${row.key}`, theme, width, text: row.text })
      }
      for (const nodeId of nodes)
        await call('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] })
    }
  }
  return { out, notes: [...new Set(notes)], overflow }
}

/** Print one line per reading, merging widths and then themes whose readings are identical. */
function print(entries) {
  const groups = new Map()
  for (const entry of entries) {
    if (!groups.has(entry.group)) groups.set(entry.group, new Map())
    const byTheme = groups.get(entry.group)
    if (!byTheme.has(entry.theme)) byTheme.set(entry.theme, [])
    byTheme.get(entry.theme).push(entry)
  }
  for (const [group, byTheme] of groups) {
    const lines = new Map()
    for (const [theme, list] of byTheme) {
      const byText = new Map()
      for (const { width, text } of list) byText.set(text, [...(byText.get(text) ?? []), width])
      for (const [text, at] of byText) {
        const key = `${at.join(',')}px | ${group} | ${text}`
        lines.set(key, [...(lines.get(key) ?? []), theme])
      }
    }
    for (const [key, at] of lines) console.log(`${at.join(',')} | ${key}`)
  }
}

try {
  const after = await matrix()
  for (const note of after.notes) console.log(note)
  if (!against) {
    for (const line of after.overflow) console.log(line)
    print(after.out)
  } else {
    const before = await matrix(against)
    for (const line of before.overflow) console.log(`${against}: ${line}`)
    for (const line of after.overflow) console.log(`now: ${line}`)
    const was = new Map(
      before.out.map((entry) => [`${entry.theme}|${entry.width}|${entry.group}`, entry.text]),
    )
    const changed = after.out
      .map((entry) => ({ ...entry, old: was.get(`${entry.theme}|${entry.width}|${entry.group}`) }))
      .filter((entry) => entry.old !== entry.text)
      .map((entry) => ({ ...entry, text: `${entry.old ?? '(absent)'}  ->  ${entry.text}` }))
    print(changed)
    console.log(
      `${after.out.length - changed.length} of ${after.out.length} readings identical to ${against}`,
    )
  }
  finish(after.notes.some((note) => note.startsWith('no match')) ? 2 : 0)
} catch (error) {
  console.error(`probe failed: ${error.message}`)
  finish(1)
}
