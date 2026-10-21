#!/usr/bin/env node
// Photograph a page the way a visitor sees it, and measure what screenshots hide.
//   node <skill>/scripts/look.mjs <folder-or-html-file> [--out <dir>] [--widths 390,1440]
// Serves the folder over a throwaway local server, opens it in headless Chrome or Chromium (CHROME_PATH,
// or a usual install path), scrolls once so scroll-triggered content appears, then saves one screenshot
// per screen at each width and prints measurements. Node 22+, no dependencies, nothing installed.
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
const target = args.find(
  (arg, index) => !arg.startsWith('--') && !args[index - 1]?.startsWith('--'),
)
if (!target) {
  console.error('Usage: node look.mjs <folder-or-html-file> [--out <dir>] [--widths 390,1440]')
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
const out = option('out') ? resolve(option('out')) : defaultOut()
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
  response.end(readFileSync(file))
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
  const lum = (c) => { const m = c.match(/[\\d.]+/g); if (!m) return null; if (m[3] !== undefined && Number(m[3]) < 0.5) return null; return m.slice(0, 3).map(Number).map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0) }
  const bg = (el) => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; const l = lum(c); if (l !== null) return l; if (getComputedStyle(e).backgroundImage !== 'none') return null } return 1 }
  const lowContrast = texts.filter((el) => { const f = lum(getComputedStyle(el).color); const b = bg(el); if (f === null || b === null) return false; const r = (Math.max(f, b) + 0.05) / (Math.min(f, b) + 0.05); const big = parseFloat(getComputedStyle(el).fontSize) >= 24; return r < (big ? 3 : 4.5) }).slice(0, 5).map((el) => el.tagName.toLowerCase() + ': ' + el.textContent.trim().slice(0, 40))
  const headlines = [...document.querySelectorAll('h1, h2, h3')].filter(visible).map((el) => { const lh = parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.2; return { tag: el.tagName.toLowerCase(), lines: Math.round(el.getBoundingClientRect().height / lh), text: el.textContent.trim().slice(0, 50) } })
  const wide = [...document.querySelectorAll('body *')].filter((el) => el.getBoundingClientRect().right > html.clientWidth + 1 && visible(el) && getComputedStyle(el).position !== 'fixed').slice(0, 5).map((el) => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''))
  const fonts = [...new Set(texts.map((el) => getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim()))]
  const declared = [...document.fonts].map((f) => f.family.replace(/["']/g, ''))
  const loaded = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/["']/g, ''))
  return { height: html.scrollHeight, sideways: html.scrollWidth > html.clientWidth + 1 ? html.scrollWidth : 0, wide, h1: document.querySelectorAll('h1').length, smallest: Math.min(...sizes), fonts, missingFonts: fonts.filter((f) => declared.includes(f) && !loaded.includes(f)), headlines: headlines.filter((h) => h.lines > 2), lowContrast, images: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src')).slice(0, 5) }
})()`

/**
 * One picture per width: every screen of the page in reading order (left to right, then down), so a
 * whole page is reviewed in one look. The single screens stay beside it for close reading.
 */
async function contactSheet(width, files) {
  const columns = width < 600 ? 3 : 2
  const tile = width < 600 ? width : width / 2
  const tiles = files
    .map(
      (file) =>
        `<img src="data:image/jpeg;base64,${readFileSync(file).toString('base64')}" style="width:${tile}px;display:block">`,
    )
    .join('')
  const sheetWidth = columns * tile + (columns + 1) * 8
  await call('Emulation.setDeviceMetricsOverride', {
    width: sheetWidth,
    height: 600,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await call('Page.navigate', { url: 'about:blank' })
  await pause(100)
  const sheetHeight = await evaluate(`(() => {
    document.body.style.cssText = 'margin:0;padding:8px;background:#777;display:grid;gap:8px;grid-template-columns:repeat(${columns},${tile}px);align-items:start'
    document.body.innerHTML = ${JSON.stringify(tiles)}
    return Promise.all([...document.images].map((i) => i.decode())).then(() => document.documentElement.scrollHeight)
  })()`)
  const { data } = await call('Page.captureScreenshot', {
    format: 'jpeg',
    quality: 70,
    clip: { x: 0, y: 0, width: sheetWidth, height: sheetHeight, scale: 1 },
    captureBeyondViewport: true,
  })
  const file = join(out, `${width}-all.jpg`)
  writeFileSync(file, Buffer.from(data, 'base64'))
  return file
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
    if (facts.h1 !== 1) flags.push(`FAIL ${facts.h1} h1 elements; a page has one`)
    if (facts.smallest < 12) flags.push(`WARN smallest visible text is ${facts.smallest}px`)
    for (const headline of facts.headlines)
      flags.push(`WARN ${headline.tag} runs to ${headline.lines} lines: "${headline.text}"`)
    for (const text of facts.lowContrast) flags.push(`FAIL low contrast: ${text}`)
    if (facts.missingFonts.length && !unreachable.size)
      flags.push(
        `WARN not loaded as web fonts, so visitors without them installed see a fallback: ${facts.missingFonts.join(', ')}`,
      )
    if (facts.images.length) flags.push(`FAIL broken images: ${facts.images.join(', ')}`)
    problems += flags.filter((flag) => flag.startsWith('FAIL')).length
    report.push(
      `${width}px: ${screens} screen(s), fonts ${facts.fonts.join(' / ')}${screens > MAX_SCREENS ? `, first ${MAX_SCREENS} shot: the page may be too long` : ''}`,
      ...flags.map((flag) => `  ${flag}`),
    )
  }
  for (const [width, files] of shotsByWidth)
    report.push(`look ${await contactSheet(width, files)}  (${width}px, every screen)`)
  report.push(`single screens: ${out}/<width>-<screen>.jpg`)
  if (unreachable.size)
    report.push(
      `NOTE could not reach ${[...unreachable].join(', ')} from this machine, so remote fonts or files show their fallback here. Visitors online get them; this is not a page fault.`,
    )
  for (const error of [...new Set(errors)].slice(0, 5)) {
    report.push(`FAIL page error: ${error.split('\n')[0]}`)
    problems++
  }
  console.log(report.join('\n'))
  console.log(
    problems
      ? `${problems} FAIL(s). Fix them, then run this again.`
      : 'No FAILs measured. Now open each "look" picture and critique it.',
  )
  finish(problems ? 1 : 0)
} catch (error) {
  console.error(error)
  finish(2)
}
