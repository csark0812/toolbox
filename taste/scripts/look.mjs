#!/usr/bin/env node
// Photograph a page the way a visitor sees it, and measure what screenshots hide.
//   node <skill>/scripts/look.mjs <folder-or-html-file> [--out <dir>] [--widths 390,1440] [--fails-only] [--motion]
// Serves the folder over a throwaway local server, opens it in headless Chrome or Chromium (CHROME_PATH,
// or a usual install path), scrolls once so scroll-triggered content appears, then saves one screenshot
// per screen at each width and prints measurements. At the widest width it also checks how the page
// behaves: the first screen 1.2s after load, hover and keyboard focus, the page without its scripts,
// and the page with reduced motion. With --motion it also films the widest width as frames: the
// first screen as it loads, as the pointer crosses it, and the page as it scrolls, in one sheet.
// Node 22+, no dependencies, nothing installed.
/* global WebSocket */
import { execFileSync, spawn } from 'node:child_process'
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
const failsOnly = args.includes('--fails-only')
const motion = args.includes('--motion')
const FLAGS = ['--fails-only', '--motion']
const target = args.find(
  (arg, index) =>
    !arg.startsWith('--') &&
    (!args[index - 1]?.startsWith('--') || FLAGS.includes(args[index - 1])),
)
if (!target) {
  console.error(
    'Usage: node look.mjs <folder-or-html-file> [--out <dir>] [--widths 390,1440] [--fails-only] [--motion]',
  )
  process.exit(2)
}
const isFile = statSync(target).isFile()
const root = resolve(isFile ? dirname(target) : target)
const page = isFile ? basename(target) : 'index.html'
/**
 * Pictures go inside the project's .git folder when there is one, where they never show up as a
 * change and need no cleaning up; otherwise into .taste/look, which the user deletes.
 */
function defaultOut() {
  try {
    const gitDir = execFileSync('git', ['rev-parse', '--absolute-git-dir'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    const dir = join(gitDir, 'taste-look')
    mkdirSync(dir, { recursive: true })
    return dir
  } catch {
    return resolve('.taste/look')
  }
}
// --out names a parent folder; the script writes only into its own taste-look subfolder there,
// because that is the folder it clears at the start of every run.
const out = option('out') ? resolve(option('out'), 'taste-look') : defaultOut()
const widths = option('widths', '390,1440').split(',').map(Number)
const MAX_SCREENS = Number(option('screens', 6))

function findChrome() {
  const cache = (dir) =>
    existsSync(dir)
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
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.mp4': 'video/mp4',
}
const server = createServer((request, response) => {
  let file
  try {
    file = normalize(join(root, decodeURIComponent(new URL(request.url, 'http://x').pathname)))
  } catch {
    return response.writeHead(400).end()
  }
  if (relative(root, file).startsWith('..')) return response.writeHead(403).end()
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
  // Browsers ask for a favicon nobody wrote; that miss is not the page's error.
  if (!existsSync(file)) return response.writeHead(request.url === '/favicon.ico' ? 204 : 404).end()
  response.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' })
  // The no-script view: the same page with its scripts taken out, to find content only a script reveals.
  const noScript = request.url.includes('look-noscript') && extname(file) === '.html'
  response.end(
    noScript
      ? readFileSync(file, 'utf8').replace(/<script\b[\s\S]*?<\/script>/gi, '')
      : readFileSync(file),
  )
})
await new Promise((done) => server.listen(0, '127.0.0.1', done))
const url = `http://127.0.0.1:${server.address().port}/${page}`

const chrome = findChrome()
if (!chrome) {
  console.error('No Chrome or Chromium found. Set CHROME_PATH to one, then run this again.')
  process.exit(2)
}
const proxyUrl = process.env.HTTPS_PROXY ?? process.env.https_proxy
const proxy = proxyUrl && /^https?:\/\/[^@/]+$/.test(proxyUrl.replace(/\/$/, '')) ? proxyUrl : null
// The profile lives next to the screenshots: some sandboxes deny the system temp folder.
const profile = join(out, '.profile')
rmSync(out, { recursive: true, force: true })
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
  // Chrome may still be writing its profile as it dies; a leftover profile is harmless.
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
const errors = []
// A remote file (a web font, a CDN script) that cannot be fetched here usually means this machine is
// offline or sandboxed, not that the page is wrong; it is reported once, apart from real page errors.
const unreachable = new Set()
const isLocal = (address = '') => !address || address.startsWith(`http://127.0.0.1:`)
listeners.push((message) => {
  if (message.sessionId !== sessionId) return
  if (message.method === 'Runtime.exceptionThrown')
    errors.push(message.params.exceptionDetails.exception?.description ?? 'script error')
  if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') {
    const { entry } = message.params
    if (entry.source === 'network' && !isLocal(entry.url)) unreachable.add(new URL(entry.url).host)
    else errors.push(entry.text)
  }
})
await call('Page.enable')
await call('Runtime.enable')
await call('Log.enable')

const MEASURE = `(() => {
  const html = document.documentElement
  const visible = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && Number(s.opacity) > 0.05 }
  const texts = [...document.querySelectorAll('body *')].filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && visible(el))
  const sizes = texts.map((el) => parseFloat(getComputedStyle(el).fontSize))
  const paint = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  const rgba = (c) => { const m = /^rgba?\\(/.test(c) && c.match(/[\\d.]+/g); if (m) return [...m.slice(0, 3).map(Number), m[3] === undefined ? 1 : Number(m[3])]; try { if (!paint || !CSS.supports('color', c)) return null; paint.clearRect(0, 0, 1, 1); paint.fillStyle = c; paint.fillRect(0, 0, 1, 1); const d = paint.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255] } catch { return null } }
  const lum = (c) => { const m = rgba(c); if (!m) return null; if (m[3] < 0.5) return null; return m.slice(0, 3).map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0) }
  const media = (e) => ['IMG', 'VIDEO', 'CANVAS', 'PICTURE', 'IFRAME'].includes(e.tagName) || e instanceof SVGElement
  const ancestors = (el) => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; const l = lum(c); if (l !== null) return l; if (getComputedStyle(e).backgroundImage !== 'none') return null } return 1 }
  // What is painted beneath the text, not only its ancestors: a full-bleed image under a hero headline is a sibling.
  const bg = (el) => { const r = el.getBoundingClientRect(); let x = r.left + r.width / 2; let y = r.top + r.height / 2; if (y < 0 || y >= innerHeight) { scrollTo({ top: scrollY + y - innerHeight / 2, behavior: 'instant' }); const s = el.getBoundingClientRect(); x = s.left + s.width / 2; y = s.top + s.height / 2 } if (x < 0 || x >= innerWidth || y < 0 || y >= innerHeight) return ancestors(el); const stack = document.elementsFromPoint(x, y); const start = stack.findIndex((e) => e === el || el.contains(e)); if (start === -1) return ancestors(el); for (const e of stack.slice(start)) { if (!el.contains(e) && media(e)) return null; const s = getComputedStyle(e); const l = lum(s.backgroundColor); if (l !== null) return l; if (s.backgroundImage !== 'none') return null } return 1 }
  const lowContrast = texts.filter((el) => { const st = getComputedStyle(el); const f = lum(st.color); const b = bg(el); if (f === null || b === null) return false; const r = (Math.max(f, b) + 0.05) / (Math.min(f, b) + 0.05); const size = parseFloat(st.fontSize); const big = size >= 24 || (size >= 18.66 && Number(st.fontWeight) >= 700); return r < (big ? 3 : 4.5) }).slice(0, 5).map((el) => el.tagName.toLowerCase() + ': ' + el.textContent.trim().slice(0, 40))
  scrollTo({ top: 0, behavior: 'instant' })
  const headlines = [...document.querySelectorAll('h1, h2, h3')].filter(visible).map((el) => { const lh = parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.2; return { tag: el.tagName.toLowerCase(), lines: Math.round(el.getBoundingClientRect().height / lh), text: el.textContent.trim().slice(0, 50) } })
  const wide = [...document.querySelectorAll('body *')].filter((el) => el.getBoundingClientRect().right > html.clientWidth + 1 && visible(el) && getComputedStyle(el).position !== 'fixed').slice(0, 5).map((el) => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''))
  const fonts = [...new Set(texts.map((el) => getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim()))]
  const declared = [...document.fonts].map((f) => f.family.replace(/["']/g, ''))
  const loaded = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/["']/g, ''))
  const rounded = [...new Set(sizes.map((size) => Math.round(size)))].sort((a, b) => a - b)
  const closeSizes = rounded.filter((size, i) => i > 0 && size / rounded[i - 1] < 1.1 && size >= 13)
  const weights = [...new Set(texts.map((el) => getComputedStyle(el).fontWeight))]
  const inks = [...new Set(texts.map((el) => getComputedStyle(el).color))]
  const controls = [...document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, [role=button], [role=switch], [role=tab]')].filter(visible)
  const inline = (el) => el.tagName === 'A' && [...el.parentElement.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
  const tiny = controls.filter((el) => { const r = el.getBoundingClientRect(); const box = el.type === 'checkbox' || el.type === 'radio' ? (el.labels?.[0]?.getBoundingClientRect() ?? r) : r; return !inline(el) && (box.width < 24 || box.height < 24) }).slice(0, 5).map((el) => el.tagName.toLowerCase() + ': ' + (el.textContent.trim() || el.getAttribute('aria-label') || el.name || '').slice(0, 30))
  const small = controls.filter((el) => { const r = el.getBoundingClientRect(); return !inline(el) && ['BUTTON', 'INPUT', 'SELECT'].includes(el.tagName) && !['checkbox', 'radio'].includes(el.type) && r.height < 40 }).length
  const transparent = (c) => /^(transparent|rgba\\(\\d+, \\d+, \\d+, 0\\))$/.test(c)
  const filled = controls.filter((el) => { const r = el.getBoundingClientRect(); const st = getComputedStyle(el); return r.top < innerHeight && r.bottom > 0 && ['A', 'BUTTON'].includes(el.tagName) && !transparent(st.backgroundColor) && st.backgroundColor !== getComputedStyle(document.body).backgroundColor && r.width >= 60 })
  const filledColours = new Set(filled.map((el) => getComputedStyle(el).backgroundColor))
  return { sizeCount: rounded.length, closeSizes, weights: weights.length, inks: inks.length, tiny, small, filled: filled.length, filledColours: filledColours.size, height: html.scrollHeight, sideways: html.scrollWidth > html.clientWidth + 1 ? html.scrollWidth : 0, wide, h1: [...document.querySelectorAll('h1')].filter(visible).length, smallest: Math.min(...sizes), fonts, missingFonts: fonts.filter((f) => declared.includes(f) && !loaded.includes(f)), headlines: headlines.filter((h) => h.lines > 2), lowContrast, images: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src')).slice(0, 5) }
})()`

/**
 * One picture for the whole look: the phone screens in a column on the left, the desktop screens
 * beside them in reading order (left to right, then down). The single screens stay beside it.
 */
async function contactSheet(groups) {
  const column = (width, files) => {
    const phone = width < 600
    const columns = phone && files.length < 4 ? 1 : 2
    const tile = phone ? width : width / 2
    const images = files
      .map(
        (file) =>
          `<img src="data:image/jpeg;base64,${readFileSync(file).toString('base64')}" style="width:${tile}px;display:block">`,
      )
      .join('')
    return {
      width: columns * tile + (columns - 1) * 8,
      html: `<div style="display:grid;gap:8px;grid-template-columns:repeat(${columns},${tile}px);align-items:start">${images}</div>`,
    }
  }
  const parts = groups.map(([width, files]) => column(width, files))
  const sheetWidth = parts.reduce((sum, part) => sum + part.width, 0) + (parts.length + 1) * 16
  await call('Emulation.setDeviceMetricsOverride', {
    width: sheetWidth,
    height: 600,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await call('Page.navigate', { url: 'about:blank' })
  await pause(100)
  const sheetHeight = await evaluate(`(() => {
    document.body.style.cssText = 'margin:0;padding:16px;background:#777;display:flex;gap:16px;align-items:flex-start'
    document.body.innerHTML = ${JSON.stringify(parts.map((part) => part.html).join(''))}
    return Promise.all([...document.images].map((i) => i.decode())).then(() => document.documentElement.scrollHeight)
  })()`)
  const { data } = await call('Page.captureScreenshot', {
    format: 'jpeg',
    quality: 70,
    clip: { x: 0, y: 0, width: sheetWidth, height: sheetHeight, scale: 1 },
    captureBeyondViewport: true,
  })
  const file = join(out, 'look.jpg')
  writeFileSync(file, Buffer.from(data, 'base64'))
  return file
}

/**
 * Motion frames at one width: the first screen at moments after navigation, then as the pointer
 * crosses it, then the page in steps of a third of a screen. Each frame is labelled with the time
 * or position it was taken at, so the sequence reads as a filmstrip.
 */
async function film(width) {
  const height = 900
  const frames = []
  const shoot = async (row, label) => {
    // A frame asked for while a navigation commits has no page to capture yet; try again shortly.
    let data
    for (let attempt = 0; !data; attempt++) {
      try {
        ;({ data } = await call('Page.captureScreenshot', { format: 'jpeg', quality: 60 }))
      } catch (error) {
        if (attempt === 20) throw error
        await pause(25)
      }
    }
    const file = join(out, `motion-${String(frames.length + 1).padStart(2, '0')}.jpg`)
    writeFileSync(file, Buffer.from(data, 'base64'))
    frames.push({ row, label, file })
  }
  await call('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await call('Page.navigate', { url: 'about:blank' })
  const start = Date.now()
  await call('Page.navigate', { url })
  for (const at of [100, 300, 600, 1000, 1800, 3000]) {
    await pause(Math.max(0, at - (Date.now() - start)))
    await shoot('load', `${Date.now() - start}ms`)
  }
  for (const [x, y] of [
    [0.2, 0.35],
    [0.4, 0.5],
    [0.6, 0.45],
    [0.8, 0.6],
  ]) {
    await call('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: width * x,
      y: height * y,
      steps: 8,
    })
    await pause(180)
    await shoot('pointer', `pointer ${Math.round(x * 100)}%, ${Math.round(y * 100)}%`)
  }
  await call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: width - 2, y: height - 2 })
  const total = await evaluate('document.documentElement.scrollHeight')
  for (
    let y = height / 3, shots = 0;
    y < total - height / 3 && shots < 9;
    y += height / 3, shots++
  ) {
    await evaluate(`scrollTo(0, ${y})`)
    await pause(300)
    await shoot('scroll', `scroll ${Math.round(y)}px`)
  }
  const tile = 360
  const rows = ['load', 'pointer', 'scroll']
    .map((row) => {
      const cells = frames
        .filter((frame) => frame.row === row)
        .map(
          (frame) =>
            `<figure style="margin:0"><img src="data:image/jpeg;base64,${readFileSync(frame.file).toString('base64')}" style="width:${tile}px;display:block"><figcaption style="font:12px/1.6 sans-serif;color:#fff">${frame.label}</figcaption></figure>`,
        )
        .join('')
      return cells ? `<div style="display:flex;flex-wrap:wrap;gap:8px">${cells}</div>` : ''
    })
    .join('')
  const sheetWidth = tile * 3 + 16 * 2 + 8 * 2
  await call('Emulation.setDeviceMetricsOverride', {
    width: sheetWidth,
    height: 600,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await call('Page.navigate', { url: 'about:blank' })
  await pause(100)
  const sheetHeight = await evaluate(`(() => {
    document.body.style.cssText = 'margin:0;padding:16px;background:#777;display:grid;gap:16px'
    document.body.innerHTML = ${JSON.stringify(rows)}
    return Promise.all([...document.images].map((i) => i.decode())).then(() => document.documentElement.scrollHeight)
  })()`)
  const { data } = await call('Page.captureScreenshot', {
    format: 'jpeg',
    quality: 70,
    clip: { x: 0, y: 0, width: sheetWidth, height: sheetHeight, scale: 1 },
    captureBeyondViewport: true,
  })
  const file = join(out, 'motion.jpg')
  writeFileSync(file, Buffer.from(data, 'base64'))
  return file
}

/**
 * The behaviour probe loads the page four times. Its result is kept beside the pictures with a
 * fingerprint of the project's files, so a rerun on unchanged files reuses a clean result.
 */
const probeCache = join(dirname(out), 'taste-probe.json')
function fingerprint(dir = root, list = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) fingerprint(path, list)
    else {
      const info = statSync(path)
      list.push(`${relative(root, path)}:${info.size}:${info.mtimeMs}`)
    }
  }
  return list.sort().join('|')
}

// What a still screenshot hides: how the page enters, how its controls answer the pointer and the
// keyboard, and whether content survives without scripts and with reduced motion.
// settled: the paths of text visible on the normal, settled page. Only those count as hidden in the
// no-script and reduced-motion views, so menus, toasts and inactive tabs hidden by design never FAIL.
const INVISIBLE = (settled = null) => `(() => {
  const settled = ${JSON.stringify(settled)}
  const faint = (el) => { let o = 1; for (let e = el; e; e = e.parentElement) { const s = getComputedStyle(e); if (s.visibility === 'hidden') return 0; o *= Number(s.opacity) } return o }
  const path = (el) => { const parts = []; for (let e = el; e && e !== document.documentElement; e = e.parentElement) { let n = 1; for (let p = e.previousElementSibling; p; p = p.previousElementSibling) if (p.tagName === e.tagName) n++; parts.unshift(e.tagName.toLowerCase() + ':' + n) } return parts.join('/') }
  const texts = [...document.querySelectorAll('body *')].filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && el.getBoundingClientRect().height > 0)
  const firstScreen = texts.filter((el) => el.getBoundingClientRect().top < innerHeight)
  const wasSeen = (el) => !settled || settled.includes(path(el))
  return { hidden: texts.filter((el) => faint(el) < 0.1 && wasSeen(el)).length, firstHidden: firstScreen.filter((el) => faint(el) < 0.1 && wasSeen(el)).length, fading: firstScreen.filter((el) => faint(el) < 0.9).length, running: document.getAnimations().filter((a) => a.playState === 'running' && Number(a.effect?.getTiming().duration) > 200).length, visible: texts.filter((el) => faint(el) >= 0.1).map(path) }
})()`
const PRIMARY = `(() => {
  const transparent = (c) => /^(transparent|rgba\\(\\d+, \\d+, \\d+, 0\\))$/.test(c)
  const looks = (el) => { const s = getComputedStyle(el); return (!transparent(s.backgroundColor) || (parseFloat(s.borderTopWidth) > 0 && s.borderTopStyle !== 'none')) && parseFloat(s.paddingLeft) >= 8 }
  const el = [...document.querySelectorAll('button, [role=button], a[href], input[type=submit]')].find((el) => { const r = el.getBoundingClientRect(); return r.width >= 24 && r.height >= 20 && r.top < innerHeight && r.bottom > 0 && getComputedStyle(el).visibility !== 'hidden' && (el.tagName !== 'A' || looks(el)) })
  if (!el) return null
  document.querySelectorAll('[data-look-action]').forEach((other) => other.removeAttribute('data-look-action'))
  el.setAttribute('data-look-action', '')
  const r = el.getBoundingClientRect()
  return { x: r.x + r.width / 2, y: r.y + r.height / 2, text: el.textContent.trim().slice(0, 30) }
})()`
const STYLE = (selector) =>
  `(() => { const el = ${selector}; if (!el) return null; const s = getComputedStyle(el); return [s.backgroundColor, s.color, s.borderColor, s.boxShadow, s.outlineStyle + s.outlineWidth + s.outlineColor, s.textDecorationLine, s.transform, s.opacity].join('|') })()`
// A focus ring is any visible change focus makes: border, background, outline, shadow or underline.
// Each control's resting look is recorded first (REST_LOOKS), then compared with its focused look.
const FOCUS_LOOK = `(el) => { const s = getComputedStyle(el); const outline = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0 ? s.outlineStyle + s.outlineWidth + s.outlineColor : 'none'; return [s.borderTopColor, s.borderRightColor, s.borderBottomColor, s.borderLeftColor, s.borderTopWidth, s.borderRightWidth, s.borderBottomWidth, s.borderLeftWidth, s.borderTopStyle, s.borderBottomStyle, s.backgroundColor, s.backgroundImage, outline, s.boxShadow, s.textDecorationLine, s.textDecorationColor, s.textDecorationThickness].join('|') }`
const REST_LOOKS = `(() => { const look = ${FOCUS_LOOK}; window.__lookRest = new Map([...document.querySelectorAll('a[href], button, input, select, textarea, summary, [tabindex], [contenteditable]')].map((el) => [el, look(el)])); return true })()`
const ACTIVE_RING = `(() => { const el = document.activeElement; if (!el || el === document.body) return null; const s = getComputedStyle(el); const rest = window.__lookRest?.get(el); const ring = rest !== undefined ? rest !== (${FOCUS_LOOK})(el) : (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none'; return { ring, name: el.tagName.toLowerCase() + ': ' + (el.textContent.trim() || el.getAttribute('aria-label') || el.name || '').slice(0, 30), action: el.hasAttribute('data-look-action') } })()`

async function load(width, address = url) {
  await call('Emulation.setDeviceMetricsOverride', {
    width,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  })
  const loaded = new Promise((done) => {
    const listen = (message) => {
      if (message.sessionId !== sessionId || message.method !== 'Page.loadEventFired') return
      listeners.splice(listeners.indexOf(listen), 1)
      done()
    }
    listeners.push(listen)
  })
  await call('Page.navigate', { url: address })
  await Promise.race([loaded, pause(15000)])
}
const press = (key, code, keyCode) =>
  call('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key,
    code,
    windowsVirtualKeyCode: keyCode,
  }).then(() =>
    call('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: keyCode }),
  )

// The headline's opacity at the load event, with every animation held at its start.
const FIRST_PAINT = `(() => { const h = document.querySelector('h1'); if (!h) return 1; let o = 1; for (let e = h; e; e = e.parentElement) o *= Number(getComputedStyle(e).opacity); return o })()`

async function probe(width) {
  const flags = []
  await call('Animation.enable')
  await call('Animation.setPlaybackRate', { playbackRate: 0 })
  await load(width)
  const headline = await evaluate(FIRST_PAINT)
  await call('Animation.setPlaybackRate', { playbackRate: 1 })
  if (headline < 0.6)
    flags.push(
      `FAIL the h1 starts hidden (opacity ${headline.toFixed(2)} at load): the headline must be readable from the first frame; animate the secondary pieces instead`,
    )
  await load(width)
  await pause(1200)
  const entrance = await evaluate(INVISIBLE())
  if (entrance.fading)
    flags.push(
      `WARN ${entrance.fading} text block(s) in the first screen are still hidden or fading 1.2s after load; let the first screen settle within about 0.6s`,
    )
  await pause(800)
  const { visible: settled } = await evaluate(INVISIBLE())
  const action = await evaluate(PRIMARY)
  if (action) {
    const rest = await evaluate(STYLE(`document.querySelector('[data-look-action]')`))
    await call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: action.x, y: action.y })
    await pause(450)
    const hover = await evaluate(STYLE(`document.querySelector('[data-look-action]')`))
    if (rest === hover)
      flags.push(`WARN the primary action ("${action.text}") does not change on hover`)
    await call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: width - 1, y: 899 })
    await pause(300)
    await evaluate(REST_LOOKS)
    const missing = []
    for (let stop = 0; stop < 40; stop++) {
      await press('Tab', 'Tab', 9)
      await pause(60)
      const focused = await evaluate(ACTIVE_RING)
      if (!focused) continue
      if (!focused.ring && missing.length < 5 && !missing.includes(focused.name))
        missing.push(focused.name)
      if (focused.action || stop >= 7) break
    }
    if (missing.length) flags.push(`FAIL no visible keyboard focus on: ${missing.join('; ')}`)
  } else
    flags.push(
      'WARN no button or button-styled link in the first screen: what is the one thing to do here?',
    )

  await load(width, `${url}${url.includes('?') ? '&' : '?'}look-noscript`)
  await pause(300)
  const noScript = await evaluate(INVISIBLE(settled))
  if (noScript.hidden)
    flags.push(
      `FAIL ${noScript.hidden} text block(s) are invisible until a script runs (opacity 0 or hidden in the CSS); start visible and let the script add the motion`,
    )

  await call('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  })
  await load(width)
  await pause(300)
  const reduced = await evaluate(INVISIBLE(settled))
  await call('Emulation.setEmulatedMedia', { features: [] })
  if (reduced.firstHidden)
    flags.push(
      `FAIL ${reduced.firstHidden} text block(s) in the first screen stay hidden with reduced motion on`,
    )
  if (reduced.running)
    flags.push(
      `WARN ${reduced.running} animation(s) longer than 200ms still run with reduced motion on`,
    )
  return flags
}

let problems = 0
const report = []
const shotsByWidth = []
try {
  for (const width of widths) {
    const height = width < 600 ? 844 : 900
    await call('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 600,
    })
    await call('Page.navigate', { url })
    await pause(400)
    await evaluate('document.fonts.ready.then(() => true)')
    await evaluate(
      `new Promise((done) => { if (document.readyState === 'complete') done(); else addEventListener('load', done) })`,
    )
    const total = await evaluate('document.documentElement.scrollHeight')
    for (let y = 0; y < total; y += height / 2) {
      await evaluate(`scrollTo(0, ${y})`)
      await pause(120)
    }
    await evaluate('scrollTo(0, 0)')
    await pause(700)
    const facts = await evaluate(MEASURE)
    const screens = Math.ceil(facts.height / height)
    const files = []
    let previous = ''
    for (let screen = 0; screen < Math.min(screens, MAX_SCREENS); screen++) {
      await evaluate(`scrollTo(0, ${screen * height})`)
      await pause(500)
      const { data } = await call('Page.captureScreenshot', { format: 'jpeg', quality: 75 })
      // A page zoomed out by sideways overflow cannot scroll further; repeated screens add nothing.
      if (data === previous) break
      previous = data
      const file = join(out, `${width}-${String(screen + 1).padStart(2, '0')}.jpg`)
      writeFileSync(file, Buffer.from(data, 'base64'))
      files.push(file)
    }
    shotsByWidth.push([width, files])
    const flags = []
    if (facts.sideways)
      flags.push(
        `FAIL sideways scroll: page is ${facts.sideways}px wide (${facts.wide.join(', ')})`,
      )
    if (facts.h1 !== 1) flags.push(`WARN ${facts.h1} visible h1 elements; a page has one`)
    if (facts.smallest < 12) flags.push(`WARN smallest visible text is ${facts.smallest}px`)
    for (const headline of facts.headlines)
      flags.push(`WARN ${headline.tag} runs to ${headline.lines} lines: "${headline.text}"`)
    for (const text of facts.lowContrast) flags.push(`FAIL low contrast: ${text}`)
    if (facts.missingFonts.length && !unreachable.size)
      flags.push(
        `WARN not loaded as web fonts, so visitors without them installed see a fallback: ${facts.missingFonts.join(', ')}`,
      )
    if (facts.sizeCount > 8)
      flags.push(
        `WARN ${facts.sizeCount} different text sizes; a type scale needs about five to seven`,
      )
    if (facts.closeSizes.length)
      flags.push(
        `WARN text sizes too close to read as different steps: ${facts.closeSizes.join(', ')}px; merge each with its neighbour`,
      )
    if (facts.weights > 3) flags.push(`WARN ${facts.weights} font weights; two or three are enough`)
    if (facts.inks > 6)
      flags.push(`WARN ${facts.inks} text colours; use an ink, a muted ink and the accent`)
    if (width < 600 && facts.tiny.length)
      flags.push(`WARN tap targets under 24px at ${width}px: ${facts.tiny.join('; ')}`)
    if (width < 600 && facts.small)
      flags.push(
        `WARN ${facts.small} button(s) or field(s) under 40px tall on the phone; aim for 44px`,
      )
    if (facts.filled > 2 || facts.filledColours > 1)
      flags.push(
        `WARN ${facts.filled} filled buttons in the first screen (${facts.filledColours} colours) compete; keep one primary action filled and make the others quieter`,
      )
    if (facts.images.length) flags.push(`FAIL broken images: ${facts.images.join(', ')}`)
    problems += flags.filter((flag) => flag.startsWith('FAIL')).length
    report.push(
      `${width}px: ${screens} screen(s), fonts ${facts.fonts.join(' / ')}${screens > MAX_SCREENS ? `, first ${MAX_SCREENS} shot: the page may be too long` : ''}`,
      ...flags.map((flag) => `  ${flag}`),
    )
  }
  const probeWidth = Math.max(...widths)
  const filmstrip = motion ? await film(probeWidth) : null
  const print = fingerprint()
  let cached = null
  try {
    cached = JSON.parse(readFileSync(probeCache, 'utf8'))
  } catch {
    // No earlier run: probe the page.
  }
  const reuse =
    cached && cached.print === print && cached.width === probeWidth && !cached.flags.length
  const behaviour = reuse ? [] : await probe(probeWidth)
  try {
    writeFileSync(probeCache, JSON.stringify({ print, width: probeWidth, flags: behaviour }))
  } catch {
    // A read-only folder only loses the reuse.
  }
  problems += behaviour.filter((flag) => flag.startsWith('FAIL')).length
  report.push(
    `${probeWidth}px entrance, hover, keyboard focus, no-script and reduced motion:${behaviour.length ? '' : reuse ? ' unchanged files, clean last run' : ' nothing to flag'}`,
    ...behaviour.map((flag) => `  ${flag}`),
  )
  const sheet = await contactSheet(shotsByWidth)
  report.push(`look ${sheet}  (${widths.join(' and ')}px side by side, every screen)`)
  report.push(`single screens: ${out}/<width>-<screen>.jpg`)
  if (filmstrip)
    report.push(
      `motion ${filmstrip}  (${probeWidth}px: loading, pointer crossing, scrolling; open it to judge the motion)`,
    )
  if (unreachable.size)
    report.push(
      `NOTE could not reach ${[...unreachable].join(', ')} from this machine, so remote fonts or files show their fallback here. Visitors online get them; this is not a page fault.`,
    )
  for (const error of [...new Set(errors)].slice(0, 5)) {
    report.push(`FAIL page error: ${error.split('\n')[0]}`)
    problems++
  }
  console.log(
    failsOnly
      ? [
          ...report.filter((line) => line.trim().startsWith('FAIL')),
          `look ${sheet}`,
          ...(filmstrip ? [`motion ${filmstrip}`] : []),
        ].join('\n')
      : report.join('\n'),
  )
  console.log(
    problems
      ? `${problems} FAIL(s). Fix them, then run this again.`
      : 'No FAILs measured. Now open the "look" picture and critique it.',
  )
  finish(problems ? 1 : 0)
} catch (error) {
  console.error(error)
  finish(2)
}
