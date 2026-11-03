#!/usr/bin/env node
// Photograph every option in a swatches folder and lay them side by side on one sheet.
//   node <skill>/scripts/sheet.mjs <folder> [--widths 1440,390] [--height 900]
// The folder holds one self-contained first screen per option: a.html, b.html, c.html (up to d.html).
// Each is served over a throwaway local server, opened in headless Chrome or Chromium (CHROME_PATH, or a
// usual install path) and photographed at every width. The script then writes <folder>/index.html, the
// photographs side by side with captions, embedded so the file opens anywhere on its own, and
// <folder>/sheet.png, one picture of the same comparison, and prints a WARN line for anything that makes a comparison unfair: a script error, a
// web font that did not load, text past the right edge. Node 22+, no dependencies, nothing installed.
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
import { extname, join, normalize, relative, resolve } from 'node:path'

const args = process.argv.slice(2)
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`)
  return index === -1 ? fallback : args[index + 1]
}
const target = args.find(
  (arg, index) => !arg.startsWith('--') && !args[index - 1]?.startsWith('--'),
)
if (!target || !existsSync(target) || !statSync(target).isDirectory()) {
  console.error(
    'Usage: node sheet.mjs <folder with a.html, b.html, ...> [--widths 1440,390] [--height 900]',
  )
  process.exit(2)
}
const root = resolve(target)
const widths = option('widths', '1440,390').split(',').map(Number)
const height = Number(option('height', 900))
const options = readdirSync(root)
  .filter((name) => /^[a-d]\.html$/.test(name))
  .sort()
  .map((name) => name[0])
if (options.length < 2) {
  console.error(
    `Found ${options.length} option file(s) in ${root}; write at least a.html and b.html.`,
  )
  process.exit(2)
}
const notes = (() => {
  // Optional one-line caption per option, from <meta name="swatch" content="..."> in each file.
  const caption = {}
  for (const id of options) {
    const match = readFileSync(join(root, `${id}.html`), 'utf8').match(
      /<meta\s+name=["']swatch["']\s+content=(["'])(.*?)\1/i,
    )
    caption[id] = match ? match[2] : ''
  }
  return caption
})()

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
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
}
const server = createServer((request, response) => {
  let file
  try {
    file = normalize(join(root, decodeURIComponent(new URL(request.url, 'http://x').pathname)))
  } catch {
    return response.writeHead(400).end()
  }
  if (relative(root, file).startsWith('..')) return response.writeHead(403).end()
  if (!existsSync(file) || statSync(file).isDirectory())
    return response.writeHead(request.url === '/favicon.ico' ? 204 : 404).end()
  response.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' })
  response.end(readFileSync(file))
})
await new Promise((done) => server.listen(0, '127.0.0.1', done))
const base = `http://127.0.0.1:${server.address().port}`

const chrome = findChrome()
if (!chrome) {
  console.error('No Chrome or Chromium found. Set CHROME_PATH to one, then run this again.')
  process.exit(2)
}
const proxyUrl = process.env.HTTPS_PROXY ?? process.env.https_proxy
const proxy = proxyUrl && /^https?:\/\/[^@/]+$/.test(proxyUrl.replace(/\/$/, '')) ? proxyUrl : null
const shots = join(root, 'shots')
const profile = join(shots, '.profile')
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

const open = async (url, width, viewHeight) => {
  await call('Emulation.setDeviceMetricsOverride', {
    width,
    height: viewHeight,
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
  await Promise.race([loaded, pause(15000)])
  await evaluate('document.fonts.ready.then(() => true)')
  await pause(700)
}
const photo = async (file, clip) => {
  const { data } = await call('Page.captureScreenshot', {
    format: 'png',
    ...(clip ? { clip } : {}),
  })
  writeFileSync(file, Buffer.from(data, 'base64'))
}

const CHECK = `(() => {
  const html = document.documentElement
  const wide = [...document.querySelectorAll('body *')].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.right > html.clientWidth + 1 && getComputedStyle(el).position !== 'fixed' }).slice(0, 3).map((el) => el.tagName.toLowerCase())
  const failed = [...document.fonts].filter((f) => f.status === 'error').map((f) => f.family.replace(/["']/g, ''))
  const h1 = document.querySelector('h1')
  return { wide, failed: [...new Set(failed)], h1: h1 ? h1.textContent.trim().slice(0, 60) : '' }
})()`

let warnings = 0
const warn = (line) => {
  warnings++
  console.log(`WARN ${line}`)
}
const headlines = new Set()
for (const id of options) {
  for (const width of widths) {
    errors = []
    await open(`${base}/${id}.html`, width, width < 600 ? 844 : height)
    const found = await evaluate(CHECK)
    await photo(join(shots, `${id}-${width}.png`))
    if (errors.length) warn(`${id} at ${width}px: script error: ${errors[0].split('\n')[0]}`)
    if (found.failed.length)
      warn(`${id} at ${width}px: web font did not load: ${found.failed.join(', ')}`)
    if (found.wide.length)
      warn(`${id} at ${width}px: past the right edge: ${found.wide.join(', ')}`)
    if (!found.h1)
      warn(`${id} at ${width}px: no h1, so the options may not be showing the same content`)
    headlines.add(found.h1)
  }
}
if (headlines.size > 1)
  warn(`the options' h1 text differs (${[...headlines].join(' | ')}); compare like with like`)

// index.html for the user and sheet.png for the agent share one layout: every option on one row at each
// width. The user's copy embeds the photographs, because file previews and shared attachments often
// open the one file without its neighbours, or block frames and remote fonts.
const embed = (id, width) =>
  `data:image/png;base64,${readFileSync(join(shots, `${id}-${width}.png`)).toString('base64')}`
const escape = (text) => text.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`)
const column = (width) => (width < 600 ? 260 : Math.floor(1600 / options.length) - 24)
const card = (id, width, src) => {
  const scale = column(width) / width
  const viewHeight = width < 600 ? 844 : height
  return `<figure><div class="frame" style="width:${Math.round(width * scale)}px;height:${Math.round(viewHeight * scale)}px">${src(width, viewHeight, scale)}</div><figcaption><b>${id.toUpperCase()}</b> ${escape(notes[id])}</figcaption></figure>`
}
const page = (src) => `<!doctype html><meta charset="utf-8"><title>Swatches</title>
<style>body{margin:0;padding:24px;background:#e9e9e6;color:#1d1d1b;font:15px/1.4 system-ui,sans-serif}
.row{display:flex;gap:24px;align-items:flex-start;margin-bottom:32px}figure{margin:0}
.frame{overflow:hidden;background:#fff;box-shadow:0 0 0 1px #0002}.frame>*{transform-origin:0 0;border:0;display:block}
figcaption{margin-top:8px;max-width:${column(widths[0])}px}b{font-size:18px;margin-right:6px}</style>
${widths.map((width) => `<div class="row">${options.map((id) => card(id, width, (w, h, scale) => src(id, w, h, scale))).join('')}</div>`).join('\n')}`

writeFileSync(
  join(root, 'index.html'),
  page(
    (id, w, h, scale) =>
      `<img src="${embed(id, w)}" width="${w}" height="${h}" style="transform:scale(${scale})" alt="Option ${id.toUpperCase()} at ${w}px">`,
  ),
)
writeFileSync(
  join(shots, 'sheet.html'),
  page(
    (id, w, h, scale) =>
      `<img src="${id}-${w}.png" width="${w}" height="${h}" style="transform:scale(${scale})" alt="">`,
  ),
)
const sheetWidth = 48 + options.length * (column(widths[0]) + 24)
await open(`${base}/shots/sheet.html`, sheetWidth, 800)
const fullHeight = await evaluate('document.documentElement.scrollHeight')
await call('Emulation.setDeviceMetricsOverride', {
  width: sheetWidth,
  height: fullHeight,
  deviceScaleFactor: 1,
  mobile: false,
})
await pause(200)
await photo(join(root, 'sheet.png'))
rmSync(join(shots, 'sheet.html'), { force: true })

console.log(`${options.length} options at ${widths.join(' and ')}px, ${warnings} WARN`)
console.log(`sheet: ${join(root, 'sheet.png')}`)
console.log(`for the user: ${join(root, 'index.html')}`)
finish(0)
