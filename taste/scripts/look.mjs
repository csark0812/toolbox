#!/usr/bin/env node
// Photograph a page the way a visitor sees it, and measure what screenshots hide.
//   node <skill>/scripts/look.mjs <folder-or-html-file> [--out .taste/look] [--widths 390,768,1440]
// Serves the folder over a throwaway local server, opens it in headless Chrome or Chromium (CHROME_PATH,
// or a usual install path), scrolls once so scroll-triggered content appears, then saves one screenshot
// per screen at each width and prints measurements. Node 22+, no dependencies, nothing installed.
/* global WebSocket */
import { spawn } from 'node:child_process'
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
  console.error(
    'Usage: node look.mjs <folder-or-html-file> [--out .taste/look] [--widths 390,768,1440]',
  )
  process.exit(2)
}
const isFile = statSync(target).isFile()
const root = resolve(isFile ? dirname(target) : target)
const page = isFile ? basename(target) : 'index.html'
const out = resolve(option('out', '.taste/look'))
const widths = option('widths', '390,768,1440').split(',').map(Number)
const MAX_SCREENS = Number(option('screens', 8))

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
  let file = normalize(join(root, decodeURIComponent(new URL(request.url, 'http://x').pathname)))
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
  rmSync(profile, { recursive: true, force: true })
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
listeners.push((message) => {
  if (message.sessionId !== sessionId) return
  if (message.method === 'Runtime.exceptionThrown')
    errors.push(message.params.exceptionDetails.exception?.description ?? 'script error')
  if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error')
    errors.push(message.params.entry.text)
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
  const loaded = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/["']/g, ''))
  return { height: html.scrollHeight, sideways: html.scrollWidth > html.clientWidth + 1 ? html.scrollWidth : 0, wide, h1: document.querySelectorAll('h1').length, smallest: Math.min(...sizes), fonts, missingFonts: fonts.filter((f) => !loaded.includes(f) && !/^(system-ui|-apple-system|sans-serif|serif|monospace|Arial|Helvetica|Georgia|Times New Roman|Segoe UI|Roboto)$/i.test(f)), headlines: headlines.filter((h) => h.lines > 2), lowContrast, images: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src')).slice(0, 5) }
})()`

let problems = 0
const report = []
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
    for (let screen = 0; screen < Math.min(screens, MAX_SCREENS); screen++) {
      await evaluate(`scrollTo(0, ${screen * height})`)
      await pause(500)
      const { data } = await call('Page.captureScreenshot', { format: 'jpeg', quality: 75 })
      const file = join(out, `${width}-${String(screen + 1).padStart(2, '0')}.jpg`)
      writeFileSync(file, Buffer.from(data, 'base64'))
      files.push(relative(process.cwd(), file))
    }
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
    if (facts.missingFonts.length)
      flags.push(
        `WARN not loaded as web fonts, so visitors without them installed see a fallback: ${facts.missingFonts.join(', ')}`,
      )
    if (facts.images.length) flags.push(`FAIL broken images: ${facts.images.join(', ')}`)
    problems += flags.filter((flag) => flag.startsWith('FAIL')).length
    report.push(
      `${width}px: ${screens} screen(s), fonts ${facts.fonts.join(' / ')}${screens > MAX_SCREENS ? `, first ${MAX_SCREENS} shot` : ''}`,
      ...flags.map((flag) => `  ${flag}`),
      ...files.map((file) => `  shot ${file}`),
    )
  }
  for (const error of [...new Set(errors)].slice(0, 5)) {
    report.push(`FAIL page error: ${error.split('\n')[0]}`)
    problems++
  }
  console.log(report.join('\n'))
  console.log(
    problems
      ? `${problems} FAIL(s). Fix them, then run this again.`
      : 'No FAILs measured. Now open every shot and look.',
  )
  finish(problems ? 1 : 0)
} catch (error) {
  console.error(error)
  finish(2)
}
