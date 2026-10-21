// Renders a run's page for the judge: served over a throwaway local server, scrolled through once so
// scroll-triggered content appears, then photographed one screen at a time at a phone and a desktop
// width. Every arm's page is photographed the same way; the judge sees only these pictures.
/* global document, window */
import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'
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
    const path = decodeURIComponent(new URL(request.url, 'http://local').pathname)
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

/**
 * The browser every arm and the judge's camera use: CHROME_PATH, else a preinstalled Chromium or
 * Chrome, else Playwright's own download. The bench passes it to runs as CHROME_PATH.
 */
export function chromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    '/opt/pw-browsers/chromium',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ]
  return candidates.find((path) => path && existsSync(path))
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
      await tab.goto(`${server.url}/${page}`, { waitUntil: 'networkidle', timeout: 30000 })
      const height = () => tab.evaluate(() => document.documentElement.scrollHeight)
      // Scroll through once so observers and lazy pictures fire, then return to the top.
      for (let y = 0; y < (await height()); y += viewport.height / 2) {
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
