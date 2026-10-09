/* global document, getComputedStyle, window */
// Shared by the agents' render_page MCP tool and the benchmark's harness-side hard checks,
// so every arm sees the same mechanical findings the grader records.
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

export const LIGHT_WIDTHS = [320, 390, 768, 1440]
export const DARK_WIDTHS = [390, 1440]
const AXE_WIDTHS = new Set([390, 1440])
const MIN_TARGET = 24
const FOCUS_STOPS = 12

/**
 * Render one HTML page and collect mechanical findings.
 * Task checks (harness-only) cover defects no generic check can see:
 *   { type: 'anchor-visible', hash, heading, widths }      linked heading lands below any fixed header
 *   { type: 'computed-style', selector, property, oneOf, label }
 *   { type: 'text-at', query, text, label }                 a state (e.g. ?state=empty) shows its copy
 *   { type: 'luminance', scheme, selector, property, max, label }
 * @param {{ page: string, outDir: string, primarySelector?: string, taskChecks?: object[] }} input
 * @returns {Promise<{ findings: { check: string, view: string, detail: string }[], screenshots: Record<string, string>, text: string }>}
 */
export async function renderPage({ page: pagePath, outDir, primarySelector, taskChecks = [] }) {
  await mkdir(outDir, { recursive: true })
  const url = pathToFileURL(pagePath).href
  const browser = await chromium.launch({ headless: true })
  const findings = []
  const screenshots = {}
  let text = ''
  const record = (check, view, detail) => findings.push({ check, view, detail })
  try {
    const views = [
      ...LIGHT_WIDTHS.map((width) => ({ width, scheme: 'light', name: `${width}` })),
      ...DARK_WIDTHS.map((width) => ({ width, scheme: 'dark', name: `${width}-dark` })),
    ]
    for (const view of views) {
      const context = await browser.newContext({
        viewport: { width: view.width, height: 900 },
        colorScheme: view.scheme,
      })
      const tab = await context.newPage()
      tab.on('pageerror', (error) => record('page-error', view.name, error.message))
      await tab.goto(url, { waitUntil: 'load' })
      await checkOverflow(tab, view, record)
      if (primarySelector) await checkPrimaryAction(tab, primarySelector, view, record)
      if (view.scheme === 'light' && AXE_WIDTHS.has(view.width)) await checkAxe(tab, view, record)
      if (view.scheme === 'dark' && view.width === 390) await checkContrast(tab, view, record)
      if (view.scheme === 'light' && view.width === 1440) {
        text = await tab.evaluate(() => document.body.innerText)
        await checkFocusStops(tab, view, record)
      }
      const file = join(outDir, `${view.name}.png`)
      await tab.screenshot({ path: file, fullPage: true })
      screenshots[view.name] = file
      await context.close()
    }
    for (const check of taskChecks) await runTaskCheck(browser, url, check, record)
  } finally {
    await browser.close()
  }
  return { findings: dedupe(findings), screenshots, text }
}

async function checkOverflow(tab, view, record) {
  const layout = await tab.evaluate(() => {
    const client = document.documentElement.clientWidth
    const clipped = []
    // Content clipped by its own scroll container is intentional, not page overflow.
    const insideScroller = (element) => {
      for (
        let parent = element.parentElement;
        parent && parent !== document.body;
        parent = parent.parentElement
      ) {
        const overflowX = getComputedStyle(parent).overflowX
        if (overflowX !== 'visible') return true
      }
      return false
    }
    for (const element of document.querySelectorAll('body *')) {
      const style = getComputedStyle(element)
      if (style.display === 'none' || style.visibility === 'hidden') continue
      if (element.classList.contains('visually-hidden') || insideScroller(element)) continue
      const box = element.getBoundingClientRect()
      if (box.width === 0 || box.height === 0) continue
      if (box.right > client + 1 || box.left < -1) {
        const name = element.id
          ? `#${element.id}`
          : `${element.tagName.toLowerCase()}${element.className ? `.${String(element.className).split(' ')[0]}` : ''}`
        clipped.push(name)
      }
    }
    return { scroll: document.documentElement.scrollWidth, client, clipped }
  })
  if (layout.scroll > layout.client + 1)
    record(
      'page-overflow',
      view.name,
      `document scrolls horizontally (${layout.scroll}px content in ${layout.client}px viewport)`,
    )
  const outside = [...new Set(layout.clipped)].slice(0, 5)
  if (outside.length)
    record(
      'element-outside-viewport',
      view.name,
      `extends past the viewport: ${outside.join(', ')}`,
    )
}

async function checkPrimaryAction(tab, selector, view, record) {
  const action = tab.locator(selector).first()
  if (!(await action.count())) return record('primary-action', view.name, `${selector} not found`)
  if (!(await action.isVisible())) return record('primary-action', view.name, `${selector} hidden`)
  const box = await action.boundingBox()
  if (box && (box.width < MIN_TARGET || box.height < MIN_TARGET))
    record(
      'target-size',
      view.name,
      `${selector} is ${Math.round(box.width)}×${Math.round(box.height)}px`,
    )
}

async function checkAxe(tab, view, record) {
  const result = await new AxeBuilder({ page: tab })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  for (const violation of result.violations) {
    if (violation.impact !== 'serious' && violation.impact !== 'critical') continue
    const targets = violation.nodes
      .slice(0, 3)
      .map((node) => node.target.join(' '))
      .join(', ')
    record(`axe:${violation.id}`, view.name, `${violation.help} (${targets})`)
  }
}

/** Dark-scheme contrast, which axe at the default light scheme cannot see. */
async function checkContrast(tab, view, record) {
  const result = await new AxeBuilder({ page: tab }).withRules(['color-contrast']).analyze()
  for (const violation of result.violations) {
    const targets = violation.nodes
      .slice(0, 3)
      .map((node) => node.target.join(' '))
      .join(', ')
    record('axe:color-contrast', view.name, `${violation.help} (${targets})`)
  }
}

async function checkFocusStops(tab, view, record) {
  const missing = []
  for (let stop = 0; stop < FOCUS_STOPS; stop++) {
    await tab.keyboard.press('Tab')
    const focus = await tab.evaluate(() => {
      const element = document.activeElement
      if (!element || element === document.body) return null
      const style = getComputedStyle(element)
      const outline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0
      const shadow = style.boxShadow && style.boxShadow !== 'none'
      const label =
        element.id ||
        element.getAttribute('aria-label') ||
        element.textContent?.trim().slice(0, 30) ||
        element.tagName
      return { visible: outline || shadow, label }
    })
    if (!focus) break
    if (!focus.visible) missing.push(focus.label)
  }
  if (missing.length)
    record(
      'focus-indicator',
      view.name,
      `no visible focus indicator on: ${[...new Set(missing)].slice(0, 5).join(', ')}`,
    )
}

async function runTaskCheck(browser, url, check, record) {
  for (const width of check.widths ?? [390, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      colorScheme: check.scheme ?? 'light',
    })
    const tab = await context.newPage()
    try {
      if (check.type === 'anchor-visible') {
        await tab.goto(`${url}${check.hash}`, { waitUntil: 'load' })
        const hidden = await tab.evaluate(
          ({ hash, heading }) => {
            const target =
              document.querySelector(`${hash} ${heading}`) ?? document.querySelector(hash)
            if (!target) return `${hash} missing`
            const top = target.getBoundingClientRect().top
            const covering = [...document.querySelectorAll('body *')].filter((element) => {
              const position = getComputedStyle(element).position
              if (position !== 'fixed' && position !== 'sticky') return false
              const box = element.getBoundingClientRect()
              return box.top <= 0 + 1 && box.bottom > top && box.height < window.innerHeight / 2
            })
            return covering.length
              ? `${hash} heading at ${Math.round(top)}px is under a fixed header`
              : null
          },
          { hash: check.hash, heading: check.heading ?? 'h2' },
        )
        if (hidden) record('anchor-hidden', `${width}`, hidden)
      } else if (check.type === 'computed-style') {
        await tab.goto(url, { waitUntil: 'load' })
        const values = await tab.evaluate(
          ({ selector, property }) =>
            [...document.querySelectorAll(selector)].map((element) =>
              getComputedStyle(element).getPropertyValue(property),
            ),
          { selector: check.selector, property: check.property },
        )
        const wrong = values.filter((value) => !check.oneOf.includes(value.trim()))
        if (!values.length || wrong.length)
          record(
            'task-style',
            `${width}`,
            `${check.label}: ${check.selector} ${check.property} is ${[...new Set(wrong)].join('/') || 'missing'}`,
          )
      } else if (check.type === 'text-at') {
        await tab.goto(`${url}${check.query}`, { waitUntil: 'load' })
        const text = await tab.evaluate(() => document.body.innerText)
        if (!text.includes(check.text))
          record(
            'state-missing',
            `${width}`,
            `${check.label}: "${check.text}" not shown at ${check.query}`,
          )
      } else if (check.type === 'luminance') {
        await tab.goto(url, { waitUntil: 'load' })
        const values = await tab.evaluate(
          ({ selector, property }) =>
            [...document.querySelectorAll(selector)].map((element) => ({
              name: element.className || element.tagName.toLowerCase(),
              value: getComputedStyle(element).getPropertyValue(property),
            })),
          { selector: check.selector, property: check.property },
        )
        const bright = values.filter(({ value }) => (relativeLuminance(value) ?? 0) > check.max)
        if (bright.length)
          record(
            'task-style',
            `${width}-${check.scheme ?? 'light'}`,
            `${check.label}: ${bright.map(({ name, value }) => `${name} ${value}`).join(', ')}`,
          )
      }
    } finally {
      await context.close()
    }
  }
}

/** WCAG relative luminance of an `rgb()`/`rgba()` value; null when transparent or unparsable. */
export function relativeLuminance(value) {
  const parts = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/)
  if (!parts || parts[4] === '0') return null
  const [r, g, b] = parts.slice(1, 4).map((number) => {
    const channel = Number(number) / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return r * 0.2126 + g * 0.7152 + b * 0.0722
}

function dedupe(findings) {
  const seen = new Set()
  return findings.filter((finding) => {
    const key = `${finding.check}|${finding.view}|${finding.detail}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
