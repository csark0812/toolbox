#!/usr/bin/env node
// Photograph every option in a swatches round and lay them side by side on one sheet.
//   node <skill>/scripts/sheet.mjs <round-folder> [--widths 1440,390] [--height 900] [--live] [--motion]
//        [--urls links.json] [--data sparse,full] [--fonts "Family A,Family B"]
// A round holds one first screen per option, a.html, b.html, ... (up to z.html), or sets of them in
// subfolders (<round>/<set>/a.html, ...), one sheet per set. With --urls, the options are pages of a
// running app instead: {"a": "https://host/#arrival=a", "b": {"url": "...", "caption": "..."}}.
// Each is opened in headless Chrome or Chromium (CHROME_PATH, or a usual install path) and photographed
// at every width. The script writes <round>/index.html for the user (the photographs embedded, or live
// frames with --live) and <round>/sheet.png for the agent, and prints a WARN line for anything that
// makes a comparison unfair: a script error, a web font that did not load, a font that is not the
// project's, text past the right edge, different headlines, a trait the user dropped.
//   --motion  also films each option as it loads (100ms to 3s, then a hover) into <round>/motion.png,
//             one row per option, so the options can be compared at the same moment.
//   --data    photographs each option at <url>?data=<preset> for every preset (sparse and full data).
//   --fonts   the families an option may use; default: those declared in the nearest _shell/shell.css.
// Option captions come from <meta name="swatch" content="...">; swatch-traits, swatch-data,
// swatch-needs and swatch-exceptions metas are printed under them. Before a new round it reads the
// project's pick log and refuses to run after two rounds answered "none" (see record.mjs).
// Node 22+, no dependencies, nothing installed.
/* global WebSocket */
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { homedir } from 'node:os'
import { basename, dirname, extname, join, normalize, relative, resolve } from 'node:path'
import { logPath, matchesDrop, readEntries, status } from './record.mjs'

const args = process.argv.slice(2)
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`)
  return index === -1 ? fallback : args[index + 1]
}
const SWITCHES = ['--live', '--motion']
const target = args.find(
  (arg, index) =>
    !arg.startsWith('--') &&
    (!args[index - 1]?.startsWith('--') || SWITCHES.includes(args[index - 1])),
)
const usage =
  'Usage: node sheet.mjs <round-folder with a.html, b.html, ... or set folders> [--widths 1440,390] [--height 900] [--live] [--motion] [--urls links.json] [--data sparse,full] [--fonts "A,B"]'
if (!target) {
  console.error(usage)
  process.exit(2)
}
const root = resolve(target)
mkdirSync(root, { recursive: true })
const widths = option('widths', '1440,390').split(',').map(Number)
const height = Number(option('height', 900))
const live = args.includes('--live')
const motion = args.includes('--motion')
const presets = option('data') ? option('data').split(',') : [null]

/** The options of one folder: a.html to z.html, in order. */
const optionFiles = (dir) =>
  readdirSync(dir)
    .filter((name) => /^[a-z]\.html$/.test(name))
    .sort()
    .map((name) => ({ id: name[0], file: join(dir, name) }))

/** The sets in a round: the round itself, or each subfolder that holds two or more options. */
function findSets() {
  if (option('urls')) {
    const links = JSON.parse(readFileSync(resolve(option('urls')), 'utf8'))
    const list = Object.entries(links).map(([id, link]) => ({
      id,
      url: typeof link === 'string' ? link : link.url,
      caption: typeof link === 'string' ? '' : (link.caption ?? ''),
    }))
    return [{ name: '', dir: root, options: list }]
  }
  if (!statSync(root).isDirectory()) return []
  const own = optionFiles(root)
  if (own.length >= 2) return [{ name: '', dir: root, options: own }]
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'shots')
    .map((entry) => ({
      name: entry.name,
      dir: join(root, entry.name),
      options: optionFiles(join(root, entry.name)),
    }))
    .filter((set) => set.options.length >= 2)
    .sort((a, b) => a.name.localeCompare(b.name))
}
const sets = findSets()
if (!sets.length) {
  console.error(
    `Found no round in ${root}: write at least a.html and b.html, or set folders that each hold them, or pass --urls.\n${usage}`,
  )
  process.exit(2)
}

// Two "none" answers in a row stop a new round until one question is asked and recorded. A round
// already in the log can be photographed again to fix its WARN lines.
const log = logPath(root)
const state = status(log)
const roundName = basename(root)
const recorded = existsSync(log)
  ? readEntries(readFileSync(log, 'utf8')).some((entry) => entry.title.includes(` ${roundName} `))
  : false
if (state.stop && !recorded) {
  console.error(state.stop)
  console.error(`log: ${log}`)
  process.exit(3)
}

/** The families the project's shell declares, for the font check. */
function allowedFonts() {
  if (option('fonts'))
    return option('fonts')
      .split(',')
      .map((f) => f.trim().toLowerCase())
  for (let dir = root, i = 0; i < 4; dir = dirname(dir), i++) {
    const shell = join(dir, '_shell', 'shell.css')
    if (!existsSync(shell)) continue
    const css = readFileSync(shell, 'utf8')
    const families = [
      ...css.matchAll(/font-family\s*:\s*([^;}]+)/gi),
      ...css.matchAll(/--[\w-]*font[\w-]*\s*:\s*([^;}]+)/gi),
    ].flatMap((match) => match[1].split(','))
    return [...new Set(families.map((f) => f.replace(/["']/g, '').trim().toLowerCase()))].filter(
      Boolean,
    )
  }
  return null
}
const fonts = allowedFonts()
const GENERIC = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'system-ui',
  'ui-sans-serif',
  'ui-serif',
  'ui-monospace',
  '-apple-system',
  'blinkmacsystemfont',
  'cursive',
  'fantasy',
])

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

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
}
// Served from the round's parent, so options can share ../_shell/shell.css and other files.
const served = dirname(root)
const server = createServer((request, response) => {
  let file
  try {
    file = normalize(join(served, decodeURIComponent(new URL(request.url, 'http://x').pathname)))
  } catch {
    return response.writeHead(400).end()
  }
  if (relative(served, file).startsWith('..')) return response.writeHead(403).end()
  if (!existsSync(file) || statSync(file).isDirectory())
    return response.writeHead(request.url === '/favicon.ico' ? 204 : 404).end()
  response.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' })
  response.end(readFileSync(file))
})
await new Promise((done) => server.listen(0, '127.0.0.1', done))
const base = `http://127.0.0.1:${server.address().port}`
const urlOf = (opt, preset) => {
  const url = opt.url ?? `${base}/${relative(served, opt.file).split('\\').join('/')}`
  if (!preset) return url
  const [path, hash = ''] = url.split('#')
  return `${path}${path.includes('?') ? '&' : '?'}data=${encodeURIComponent(preset)}${hash ? `#${hash}` : ''}`
}
const devHost = (url) =>
  /^(localhost|127\.0\.0\.1|\[::1\])$|\.(localhost|test|internal|local)$/.test(
    new URL(url).hostname,
  )
const anyDevHost = sets.some((set) => set.options.some((opt) => opt.url && devHost(opt.url)))

const chrome = findChrome()
if (!chrome) {
  console.error('No Chrome or Chromium found. Set CHROME_PATH to one, then run this again.')
  process.exit(2)
}
const proxyUrl = process.env.HTTPS_PROXY ?? process.env.https_proxy
const proxy = proxyUrl && /^https?:\/\/[^@/]+$/.test(proxyUrl.replace(/\/$/, '')) ? proxyUrl : null
const shots = join(root, 'shots')
const profile = join(shots, 'chrome-profile')
rmSync(shots, { recursive: true, force: true })
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
    // An app on a development host with its own certificate authority is still the user's own app.
    ...(anyDevHost ? ['--ignore-certificate-errors'] : []),
    ...(process.platform === 'linux' ? ['--no-sandbox', '--disable-dev-shm-usage'] : []),
    // Web fonts load the way a visitor sees them when this machine reaches the web through a proxy.
    ...(proxy ? [`--proxy-server=${proxy}`, '--proxy-bypass-list=127.0.0.1;localhost'] : []),
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
  server.close()
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
let errors = []
listeners.push((message) => {
  if (message.sessionId !== sessionId) return
  if (message.method === 'Runtime.exceptionThrown')
    errors.push(message.params.exceptionDetails.exception?.description ?? 'script error')
})
await call('Page.enable')
await call('Runtime.enable')

const viewHeight = (width) => (width < 600 ? 844 : height)
const navigate = async (url, width, settle = 700) => {
  await call('Emulation.setDeviceMetricsOverride', {
    width,
    height: viewHeight(width),
    deviceScaleFactor: 1,
    mobile: width < 600,
  })
  const loaded = new Promise((done) => {
    const listen = (message) => {
      if (message.sessionId !== sessionId || message.method !== 'Page.loadEventFired') return
      listeners.splice(listeners.indexOf(listen), 1)
      done()
    }
    listeners.push(listen)
  })
  await call('Page.navigate', { url })
  if (settle === 0) return
  await Promise.race([loaded, pause(15000)])
  await evaluate('document.fonts.ready.then(() => true)')
  await pause(settle)
}
const photo = async (file, clip) => {
  let data
  for (let attempt = 0; !data; attempt++) {
    try {
      ;({ data } = await call('Page.captureScreenshot', {
        format: 'png',
        ...(clip ? { clip } : {}),
      }))
    } catch (error) {
      // A frame asked for while a navigation commits has no page yet; try again shortly.
      if (attempt === 20) throw error
      await pause(25)
    }
  }
  writeFileSync(file, Buffer.from(data, 'base64'))
}

const CHECK = `(() => {
  const html = document.documentElement
  const meta = (name) => document.querySelector('meta[name="' + name + '"]')?.content ?? ''
  const wide = [...document.querySelectorAll('body *')].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.right > html.clientWidth + 1 && getComputedStyle(el).position !== 'fixed' }).slice(0, 3).map((el) => el.tagName.toLowerCase())
  const failed = [...document.fonts].filter((f) => f.status === 'error').map((f) => f.family.replace(/["']/g, ''))
  const texts = [...document.querySelectorAll('body *')].filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && el.getBoundingClientRect().height > 0)
  const families = {}
  for (const el of texts) { const family = getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim(); families[family] ??= el.tagName.toLowerCase() }
  const h1 = document.querySelector('h1')
  return { wide, failed: [...new Set(failed)], families, h1: h1 ? h1.textContent.trim().slice(0, 60) : '', caption: meta('swatch'), traits: meta('swatch-traits'), data: meta('swatch-data'), needs: meta('swatch-needs'), exceptions: meta('swatch-exceptions') }
})()`

let warnings = 0
const warn = (line) => {
  warnings++
  console.log(`WARN ${line}`)
}
const escape = (text) => String(text).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`)
const shotName = (set, id, width, preset) =>
  `${set.name ? `${set.name}-` : ''}${id}-${width}${preset ? `-${preset}` : ''}.png`

/** Photograph one set at every width and data preset, and check what makes a comparison unfair. */
async function photographSet(set) {
  const label = set.name ? `${set.name}/` : ''
  const headlines = new Set()
  for (const opt of set.options) {
    for (const preset of presets)
      for (const width of widths) {
        errors = []
        await navigate(urlOf(opt, preset), width)
        const found = await evaluate(CHECK)
        await photo(join(shots, shotName(set, opt.id, width, preset)))
        const where = `${label}${opt.id} at ${width}px${preset ? ` (${preset} data)` : ''}`
        if (errors.length) warn(`${where}: script error: ${errors[0].split('\n')[0]}`)
        if (found.failed.length) warn(`${where}: web font did not load: ${found.failed.join(', ')}`)
        if (found.wide.length) warn(`${where}: past the right edge: ${found.wide.join(', ')}`)
        if (!found.h1) warn(`${where}: no h1, so the options may not be showing the same content`)
        const foreign = fonts
          ? Object.entries(found.families).filter(
              ([f]) => !GENERIC.has(f.toLowerCase()) && !fonts.includes(f.toLowerCase()),
            )
          : []
        if (foreign.length)
          warn(
            `${where}: fonts that are not the project's: ${foreign.map(([f, tag]) => `${f} (on ${tag})`).join(', ')}; allowed: ${fonts.join(', ')}`,
          )
        headlines.add(found.h1)
        Object.assign(opt, {
          caption: opt.caption || found.caption,
          traits: found.traits,
          data: found.data,
          needs: found.needs,
          exceptions: found.exceptions,
        })
      }
    const dropped = matchesDrop(
      (opt.traits ?? '').split(/[,;·]/).filter((trait) => trait.trim()),
      state.dropped,
    )
    if (dropped.length)
      warn(`${label}${opt.id}: repeats traits the user dropped: ${dropped.join(', ')}`)
  }
  if (headlines.size > 1)
    warn(
      `${label}the options' h1 text differs (${[...headlines].join(' | ')}); compare like with like`,
    )
}

/** Each option filmed as it loads, one row per option, the same moments in every row. */
const MOMENTS = [100, 300, 600, 1000, 1800, 3000]
async function filmSet(set) {
  const width = widths[0]
  for (const opt of set.options) {
    await navigate('about:blank', width, 0)
    const start = Date.now()
    await navigate(urlOf(opt, presets[0]), width, 0)
    opt.frames = []
    for (const at of MOMENTS) {
      await pause(Math.max(0, at - (Date.now() - start)))
      const file = join(shots, `motion-${set.name ? `${set.name}-` : ''}${opt.id}-${at}.png`)
      await photo(file)
      opt.frames.push({ file, label: `${Date.now() - start}ms` })
    }
    const point = (await evaluate(
      `(() => { const el = document.querySelector('a[href], button, [role=button], input'); const r = el?.getBoundingClientRect(); return r ? { x: r.x + r.width / 2, y: r.y + r.height / 2 } : { x: innerWidth / 2, y: innerHeight / 2 } })()`,
    )) ?? { x: width / 2, y: viewHeight(width) / 2 }
    await call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y, steps: 8 })
    await pause(400)
    const file = join(shots, `motion-${set.name ? `${set.name}-` : ''}${opt.id}-hover.png`)
    await photo(file)
    opt.frames.push({ file, label: 'hover' })
  }
}

/** Captions: the idea, then what the option needs or costs, so the user sees it before picking. */
const captionOf = (opt) => {
  const facts = [
    opt.data && `data: ${opt.data}`,
    opt.needs && `needs: ${opt.needs}`,
    opt.exceptions && `exceptions: ${opt.exceptions}`,
  ].filter(Boolean)
  return `<b>${escape(opt.id.toUpperCase())}</b> ${escape(opt.caption ?? '')}${facts.map((fact) => `<br><small>${escape(fact)}</small>`).join('')}`
}

// index.html for the user and sheet.png for the agent share one layout: every option on one row at
// each width. The user's copy embeds the photographs by default, because file previews and shared
// attachments often open the one file without its neighbours; --live shows the options themselves.
const column = (set, width) => (width < 600 ? 260 : Math.floor(1600 / set.options.length) - 24)
function page(set, src, title = 'Swatches') {
  const rows = []
  for (const preset of presets)
    for (const width of widths)
      rows.push(
        `${preset ? `<h2>${escape(preset)} data · ${width}px</h2>` : ''}<div class="row">${set.options
          .map((opt) => {
            const scale = column(set, width) / width
            const h = viewHeight(width)
            return `<figure><div class="frame" style="width:${Math.round(width * scale)}px;height:${Math.round(h * scale)}px">${src(opt, width, h, scale, preset)}</div><figcaption>${captionOf(opt)}</figcaption></figure>`
          })
          .join('')}</div>`,
      )
  return `<!doctype html><meta charset="utf-8"><title>${escape(title)}</title>
<style>body{margin:0;padding:24px;background:#e9e9e6;color:#1d1d1b;font:15px/1.4 system-ui,sans-serif}
.row{display:flex;gap:24px;align-items:flex-start;margin-bottom:32px}figure{margin:0}h2{font-size:14px;font-weight:600;margin:0 0 8px}
.frame{overflow:hidden;background:#fff;box-shadow:0 0 0 1px #0002}.frame>*{transform-origin:0 0;border:0;display:block}
figcaption{margin-top:8px;max-width:${column(set, widths[0])}px}b{font-size:18px;margin-right:6px}small{color:#555}</style>
${rows.join('\n')}`
}
function motionPage(set) {
  const tile = 240
  const rows = set.options
    .map(
      (opt) =>
        `<div class="row"><div class="who">${captionOf(opt)}</div>${opt.frames
          .map(
            (frame) =>
              `<figure><img src="data:image/png;base64,${readFileSync(frame.file).toString('base64')}" style="width:${tile}px"><figcaption>${frame.label}</figcaption></figure>`,
          )
          .join('')}</div>`,
    )
    .join('')
  return {
    width: 48 + 180 + (MOMENTS.length + 1) * (tile + 8),
    html: `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:24px;background:#e9e9e6;font:13px/1.4 system-ui,sans-serif}.row{display:flex;gap:8px;align-items:flex-start;margin-bottom:16px}.who{width:172px}figure{margin:0}img{display:block;box-shadow:0 0 0 1px #0002}b{font-size:16px;margin-right:4px}</style>${rows}`,
  }
}
/** A full-height picture of an HTML file served beside the shots. */
async function pictureOf(html, file, width) {
  const scratch = join(shots, `${basename(file, '.png')}.html`)
  writeFileSync(scratch, html)
  await navigate(`${base}/${relative(served, scratch).split('\\').join('/')}`, width, 200)
  const fullHeight = await evaluate('document.documentElement.scrollHeight')
  await call('Emulation.setDeviceMetricsOverride', {
    width,
    height: fullHeight,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await pause(200)
  await photo(file)
  rmSync(scratch, { force: true })
}

const written = []
try {
  for (const set of sets) {
    await photographSet(set)
    const shotOf = (opt, w, preset) => join(shots, shotName(set, opt.id, w, preset))
    const liveSrc = (opt, w, h, scale, preset) =>
      `<iframe src="${escape(opt.url ? urlOf(opt, preset) : relative(set.dir, opt.file) + (preset ? `?data=${encodeURIComponent(preset)}` : ''))}" width="${w}" height="${h}" style="transform:scale(${scale})" title="Option ${opt.id.toUpperCase()}"></iframe>`
    const embedSrc = (opt, w, h, scale, preset) =>
      `<img src="data:image/png;base64,${readFileSync(shotOf(opt, w, preset)).toString('base64')}" width="${w}" height="${h}" style="transform:scale(${scale})" alt="Option ${opt.id.toUpperCase()} at ${w}px">`
    const index = join(set.dir, 'index.html')
    writeFileSync(index, page(set, live ? liveSrc : embedSrc, set.name || 'Swatches'))
    const sheetWidth = 48 + set.options.length * (column(set, widths[0]) + 24)
    const sheet = join(set.dir, 'sheet.png')
    await pictureOf(page(set, embedSrc), sheet, sheetWidth)
    let film = null
    if (motion) {
      await filmSet(set)
      const { html, width } = motionPage(set)
      film = join(set.dir, 'motion.png')
      await pictureOf(html, film, width)
    }
    written.push({ set, index, sheet, film })
  }
  if (sets.length > 1)
    writeFileSync(
      join(root, 'index.html'),
      `<!doctype html><meta charset="utf-8"><title>Swatches</title><style>body{margin:0;padding:24px;font:15px/1.5 system-ui,sans-serif}iframe{width:100%;height:80vh;border:0;box-shadow:0 0 0 1px #0002;margin-bottom:32px}</style>${sets.map((set) => `<h2>${escape(set.name)}</h2><iframe src="${escape(set.name)}/index.html" title="${escape(set.name)}"></iframe>`).join('')}`,
    )
} catch (error) {
  console.error(error)
  finish(2)
}

const count = sets.reduce((sum, set) => sum + set.options.length, 0)
console.log(
  `${count} options${sets.length > 1 ? ` in ${sets.length} sets` : ''} at ${widths.join(' and ')}px${presets[0] ? ` with ${presets.join(' and ')} data` : ''}, ${warnings} WARN`,
)
for (const { set, sheet, film } of written) {
  console.log(`sheet${set.name ? ` (${set.name})` : ''}: ${sheet}`)
  if (film) console.log(`motion${set.name ? ` (${set.name})` : ''}: ${film}`)
}
console.log(
  `for the user: ${join(root, 'index.html')}${live ? ' (live frames)' : ' (photographs embedded)'}`,
)
finish(0)
