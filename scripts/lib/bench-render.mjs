// Renders a run's page for the judge: served over a throwaway local server, scrolled through once so
// scroll-triggered content appears, then photographed one screen at a time at a phone and a desktop
// width. Every arm's page is photographed the same way; the judge sees only these pictures.
/* global document, getComputedStyle, window */
import { createServer } from 'node:http'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { extname, join, normalize, relative, resolve } from 'node:path'
import { chromium } from 'playwright'

export const VIEWPORTS = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
]
/** Screens photographed per viewport; a longer page is cut off and the judge is told so. */
export const MAX_SCREENS = 6

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
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
}

/** Serve `root` on a random local port; resolves to { url, close }. */
export async function serve(root) {
  const base = resolve(root)
  const server = createServer((request, response) => {
    let path
    try {
      path = decodeURIComponent(new URL(request.url, 'http://local').pathname)
    } catch {
      return response.writeHead(400).end()
    }
    let file = normalize(join(base, path))
    if (relative(base, file).startsWith('..')) return response.writeHead(403).end()
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
    if (!existsSync(file)) return response.writeHead(404).end()
    response.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' })
    response.end(readFileSync(file))
  })
  await new Promise((done) => server.listen(0, '127.0.0.1', done))
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((done) => server.close(done)),
  }
}

/** Chromium executables inside a Playwright browser cache, newest revision first. */
function playwrightCache(dir) {
  if (!dir || !existsSync(dir)) return []
  const builds = readdirSync(dir)
    .filter((name) => /^chromium-\d+$/.test(name))
    .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))
  return builds.flatMap((build) =>
    [
      'chrome-linux/chrome',
      'chrome-linux64/chrome',
      'chrome-mac/Chromium.app/Contents/MacOS/Chromium',
      'chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium',
      'chrome-mac/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
      'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
    ].map((tail) => join(dir, build, tail)),
  )
}

/** Every place a Chromium or Chrome is looked for, in order of preference. */
export function chromeCandidates() {
  let bundled
  try {
    bundled = chromium.executablePath()
  } catch {
    bundled = undefined
  }
  return [
    process.env.CHROME_PATH,
    '/opt/pw-browsers/chromium',
    ...playwrightCache(process.env.PLAYWRIGHT_BROWSERS_PATH),
    ...playwrightCache('/opt/pw-browsers'),
    ...playwrightCache(join(homedir(), '.cache', 'ms-playwright')),
    ...playwrightCache(join(homedir(), 'Library', 'Caches', 'ms-playwright')),
    bundled,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/snap/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ].filter(Boolean)
}

/**
 * The browser every arm and the judge's camera use: CHROME_PATH, else a Playwright download, else
 * a system Chromium or Chrome. The bench passes it to runs as CHROME_PATH. Undefined when none is
 * installed.
 */
export function chromePath() {
  return chromeCandidates().find((path) => existsSync(path))
}

export async function launchBrowser() {
  const executablePath = chromePath()
  return chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
    // Web fonts and remote pictures load the way a visitor would see them.
    ...(process.env.HTTPS_PROXY
      ? { proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } }
      : {}),
  })
}

const pause = (ms) => new Promise((done) => setTimeout(done, ms))

/**
 * Open `url` in `tab` the same way for every page: wait for the load event, then give the network a
 * few seconds to go quiet (a page that keeps polling never does, and is not broken for it), then
 * wait for web fonts.
 */
export async function openPage(tab, url) {
  await tab.goto(url, { waitUntil: 'load', timeout: 30000 })
  await tab.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})
  await tab.evaluate(() => document.fonts?.ready.then(() => true)).catch(() => {})
}

/**
 * Photograph `page` (a path relative to `root`) screen by screen at each viewport into `outDir`.
 * Returns [{ file, viewport, screen }] plus whether any viewport was cut off at MAX_SCREENS.
 */
export async function captureScreens(root, page, outDir) {
  mkdirSync(outDir, { recursive: true })
  const server = await serve(root)
  const browser = await launchBrowser()
  const shots = []
  const truncated = []
  try {
    for (const viewport of VIEWPORTS) {
      const tab = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
      })
      await openPage(tab, `${server.url}/${page}`)
      const height = () => tab.evaluate(() => document.documentElement.scrollHeight)
      // Scroll through once so observers and lazy pictures fire, then return to the top. Only as far
      // as the screens photographed: a page that grows as it scrolls would never end.
      const limit = MAX_SCREENS * viewport.height
      for (let y = 0; y < Math.min(await height(), limit); y += viewport.height / 2) {
        await tab.evaluate((top) => window.scrollTo(0, top), y)
        await pause(150)
      }
      await tab.evaluate(() => window.scrollTo(0, 0))
      await pause(800)
      const screens = Math.ceil((await height()) / viewport.height)
      if (screens > MAX_SCREENS) truncated.push(viewport.name)
      for (let screen = 0; screen < Math.min(screens, MAX_SCREENS); screen++) {
        await tab.evaluate((top) => window.scrollTo(0, top), screen * viewport.height)
        await pause(700)
        const file = join(outDir, `${viewport.name}-${screen + 1}.jpg`)
        await tab.screenshot({ path: file, type: 'jpeg', quality: 72 })
        shots.push({ file, viewport: viewport.name, screen: screen + 1 })
      }
      await tab.close()
    }
  } finally {
    await browser.close()
    await server.close()
  }
  return { shots, truncated }
}

/** The desktop viewport the motion and interaction frames are taken at. */
export const FRAME_VIEWPORT = VIEWPORTS.find((viewport) => viewport.name === 'desktop')

/**
 * The fixed frame set every arm gets, in the order the judge sees it. `group` labels the judge's
 * view; `step` names the file. Entrance times count from the load event with CSS animations and
 * the page's script clock frozen between frames, so a frame shows the page at that moment however
 * long the camera takes, for CSS and script-driven motion alike.
 */
export const FRAME_PLAN = [
  { group: 'entrance', step: 'load-0ms', at: 0 },
  { group: 'entrance', step: 'load-300ms', at: 300 },
  { group: 'entrance', step: 'load-1200ms', at: 1200 },
  { group: 'action', step: 'action-rest' },
  { group: 'action', step: 'action-hover' },
  { group: 'action', step: 'action-focus' },
  { group: 'scroll', step: 'section-2-entering' },
  { group: 'scroll', step: 'section-2-settled' },
  { group: 'scroll', step: 'section-3-entering' },
  { group: 'scroll', step: 'section-3-settled' },
  { group: 'reduced-motion', step: 'reduced-motion' },
]

/**
 * In the page: the primary action of the first screen, found the same way for every page. The first
 * visible button, or link styled as one (a filled background or a border, with padding), whose top
 * is inside the first screen. Marked with a data attribute so the camera can hover and focus it.
 */
export function markPrimaryAction() {
  const transparent = (colour) => /^(transparent|rgba\(\d+, \d+, \d+, 0\))$/.test(colour)
  const looksLikeButton = (el) => {
    const style = getComputedStyle(el)
    const filled = !transparent(style.backgroundColor) || style.backgroundImage !== 'none'
    const bordered = parseFloat(style.borderTopWidth) > 0 && style.borderTopStyle !== 'none'
    // Padding on the sides, and either padding above or a height of its own (min-height buttons).
    const padded =
      parseFloat(style.paddingLeft) >= 8 &&
      (parseFloat(style.paddingTop) >= 4 || el.getBoundingClientRect().height >= 32)
    return (filled || bordered) && padded
  }
  const candidates = [
    ...document.querySelectorAll(
      'button, [role="button"], a[href], input[type="submit"], input[type="button"]',
    ),
  ]
  const target = candidates.find((el) => {
    const box = el.getBoundingClientRect()
    const style = getComputedStyle(el)
    if (box.width < 24 || box.height < 20 || box.top >= window.innerHeight || box.bottom <= 0)
      return false
    if (style.visibility === 'hidden' || style.display === 'none') return false
    const isButton = el.tagName !== 'A' || el.getAttribute('role') === 'button'
    return isButton ? el.textContent.trim() || el.value || looksLikeButton(el) : looksLikeButton(el)
  })
  if (!target) return null
  target.setAttribute('data-bench-action', '')
  const box = target.getBoundingClientRect()
  return { x: box.x, y: box.y, width: box.width, height: box.height }
}

/**
 * In the page: the top (in page coordinates) of the next two sections below the first screen, found
 * by position so the same page reads the same however it is wrapped. Single wrappers that hold the
 * whole page (`<div id="root">`, `<main>`, …) are descended through; the blocks are then the
 * `section` elements, the children of `main`, of `body`'s children and of that innermost wrapper.
 * A block counts when it is at least 120px tall and half the screen wide and starts below most of
 * the first screen; blocks that start within 60px of each other are one section.
 */
export function sectionTops() {
  const skip = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'LINK', 'META'])
  const blocks = (el) =>
    [...el.children].filter((child) => !skip.has(child.tagName) && child.offsetHeight > 0)
  let root = document.body
  for (let depth = 0; depth < 12; depth++) {
    const children = blocks(root)
    if (children.length !== 1 || children[0].offsetHeight < window.innerHeight) break
    root = children[0]
  }
  const candidates = new Set([
    ...document.querySelectorAll('section, main > *, body > * > *'),
    ...blocks(document.body),
    ...blocks(root),
  ])
  const tops = [...candidates]
    .map((el) => el.getBoundingClientRect())
    .filter((box) => box.height >= 120 && box.width >= window.innerWidth / 2)
    .map((box) => Math.round(box.top + window.scrollY))
    .filter((top) => top >= window.innerHeight * 0.8)
    .sort((a, b) => a - b)
  const sections = []
  for (const top of tops) if (!sections.length || top - sections.at(-1) >= 60) sections.push(top)
  return sections.slice(0, 2)
}

/**
 * Photograph motion and interaction at the desktop width into `outDir`: the first screen as it
 * enters, the primary action at rest, on hover and on keyboard focus, the next two sections as they
 * scroll in and once settled, and the first screen with reduced motion. Returns { frames, notes }:
 * frames are [{ file, group, step }] in FRAME_PLAN order; notes say what could not be found.
 */
export async function captureFrames(root, page, outDir) {
  mkdirSync(outDir, { recursive: true })
  const server = await serve(root)
  const browser = await launchBrowser()
  const viewport = FRAME_VIEWPORT
  const url = `${server.url}/${page}`
  const frames = []
  const notes = []
  const shoot = async (tab, step, options = {}) => {
    const { group } = FRAME_PLAN.find((frame) => frame.step === step)
    const file = join(outDir, `frame-${step}.jpg`)
    await tab.screenshot({ path: file, type: 'jpeg', quality: 70, ...options })
    frames.push({ file, group, step })
  }
  const fresh = (options = {}) =>
    browser.newPage({ viewport: { width: viewport.width, height: viewport.height }, ...options })
  try {
    const tab = await fresh()
    const cdp = await tab.context().newCDPSession(tab)
    await cdp.send('Animation.enable')
    const rate = (playbackRate) => cdp.send('Animation.setPlaybackRate', { playbackRate })
    // Both clocks are frozen before the page exists, so time zero is the load event however slow
    // the camera is: CSS animations and transitions through the animation playback rate, script
    // timers, requestAnimationFrame, performance.now() and Date through Playwright's page clock.
    await tab.clock.install({ time: Date.now() })
    await tab.clock.pauseAt(Date.now() + 1)
    await rate(0)
    await tab.goto(url, { waitUntil: 'load', timeout: 30000 })
    let clock = 0
    for (const { step, at } of FRAME_PLAN.filter((frame) => frame.group === 'entrance')) {
      if (at > clock) {
        await tab.clock.runFor(at - clock)
        await rate(1)
        await pause(at - clock)
        await rate(0)
        clock = at
      }
      await shoot(tab, step)
    }
    await tab.clock.resume()
    await rate(1)
    await tab.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})
    await tab.evaluate(() => document.fonts?.ready.then(() => true)).catch(() => {})
    await pause(1500)

    const action = await tab.evaluate(markPrimaryAction)
    if (action) {
      const pad = 48
      const clip = {
        x: Math.max(0, action.x - pad),
        y: Math.max(0, action.y - pad),
        width: Math.min(viewport.width, action.width + pad * 2),
        height: Math.min(viewport.height, action.height + pad * 2),
      }
      const handle = tab.locator('[data-bench-action]').first()
      await tab.mouse.move(viewport.width - 1, viewport.height - 1)
      await pause(400)
      await shoot(tab, 'action-rest', { clip })
      await handle.hover({ timeout: 5000 }).catch(() => {})
      await pause(500)
      await shoot(tab, 'action-hover', { clip })
      await tab.mouse.move(viewport.width - 1, viewport.height - 1)
      // Reach it from the keyboard, so :focus-visible styles show the way a keyboard user sees them.
      let focused = false
      for (let presses = 0; presses < 40 && !focused; presses++) {
        await tab.keyboard.press('Tab')
        focused = await tab.evaluate(() =>
          document.activeElement?.hasAttribute('data-bench-action'),
        )
      }
      if (!focused) await handle.focus().catch(() => {})
      await tab.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      await pause(500)
      await shoot(tab, 'action-focus', { clip })
    } else notes.push('No button or button-styled link was found in the first screen.')
    await tab.close()

    // The Tab walk above can scroll the page and fire one-shot reveals, so the scroll frames start
    // from a fresh load that has never been scrolled.
    const scroller = await fresh()
    await openPage(scroller, url)
    await pause(1500)
    const tops = await scroller.evaluate(sectionTops)
    for (const [index, top] of tops.entries()) {
      const number = index + 2
      // The section's top a quarter of the way up from the bottom edge: it has just come into view.
      await scroller.evaluate(
        (y) => window.scrollTo({ top: y, behavior: 'instant' }),
        Math.max(0, top - viewport.height * 0.75),
      )
      await pause(150)
      await shoot(scroller, `section-${number}-entering`)
      await scroller.evaluate(
        (y) => window.scrollTo({ top: y, behavior: 'instant' }),
        Math.max(0, top - viewport.height * 0.25),
      )
      await pause(1200)
      await shoot(scroller, `section-${number}-settled`)
    }
    if (tops.length < 2)
      notes.push(`Only ${tops.length} section(s) were found below the first screen.`)
    await scroller.close()

    const reduced = await fresh({ reducedMotion: 'reduce' })
    await reduced.goto(url, { waitUntil: 'load', timeout: 30000 })
    await reduced.evaluate(() => document.fonts?.ready.then(() => true)).catch(() => {})
    await pause(150)
    await shoot(reduced, 'reduced-motion')
    await reduced.close()
  } finally {
    await browser.close()
    await server.close()
  }
  return { frames, notes }
}
