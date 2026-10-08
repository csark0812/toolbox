#!/usr/bin/env node
/* global document, getComputedStyle */
import { chromium } from 'playwright'
import { pathToFileURL } from 'node:url'
import { join, resolve } from 'node:path'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'

const source = process.argv[2]
const selector = process.argv[3] ?? '#primary'
if (!source)
  throw new Error(
    'Usage: node scripts/check-rendered-interface.mjs <url-or-html-path> [primary-action-selector]',
  )
const url = /^https?:|^file:/.test(source) ? source : pathToFileURL(resolve(source)).href
const browser = await chromium.launch({ headless: true })
const failures = []
const proofDir = await mkdtemp(join(tmpdir(), 'interface-proof-'))
try {
  for (const width of [320, 390, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } })
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(url)
    const action = page.locator(selector)
    if (!(await action.isVisible())) failures.push(`${width}px: primary action hidden`)
    const layout = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }))
    if (layout.scroll > layout.client + 1)
      failures.push(`${width}px: document overflow ${layout.scroll} > ${layout.client}`)
    if (await action.isVisible()) {
      const box = await action.boundingBox()
      if (!box || box.x < 0 || box.x + box.width > width + 1)
        failures.push(`${width}px: primary action clipped`)
      const name = (await action.getAttribute('aria-label')) || (await action.innerText())
      if (!name.trim()) failures.push(`${width}px: primary action lacks a name`)
      if (box && (box.width < 24 || box.height < 24))
        failures.push(`${width}px: primary action target too small`)
      const colors = await action.evaluate((element) => {
        const style = getComputedStyle(element)
        return { foreground: style.color, background: style.backgroundColor }
      })
      const contrast = contrastRatio(colors.foreground, colors.background)
      if (contrast !== null && contrast < 4.5)
        failures.push(`${width}px: primary action text contrast ${contrast.toFixed(2)} < 4.5`)
    }
    failures.push(...errors.map((error) => `${width}px: page error ${error}`))
    await page.screenshot({ path: join(proofDir, `${width}.png`), fullPage: true })
    await page.close()
  }
  const page = await browser.newPage({
    viewport: { width: 390, height: 900 },
    reducedMotion: 'reduce',
    forcedColors: 'active',
  })
  await page.goto(url)
  const action = page.locator(selector)
  if (!(await action.isVisible()))
    failures.push('reduced motion/forced colors: primary action hidden')
  await page.keyboard.press('Tab')
  const focused = await action.evaluate((element) => element === document.activeElement)
  if (!focused) failures.push('keyboard: primary action not first focus stop')
  if (focused) {
    const focus = await action.evaluate((element) => {
      const style = getComputedStyle(element)
      return { width: style.outlineWidth, style: style.outlineStyle }
    })
    if (focus.style === 'none' || focus.width === '0px')
      failures.push('keyboard: focus indicator absent')
  }
  await page.screenshot({
    path: join(proofDir, 'reduced-motion-forced-colors.png'),
    fullPage: true,
  })
  await page.close()
} finally {
  await browser.close()
}
console.log(`Screenshots: ${proofDir}`)
if (failures.length) {
  for (const failure of failures) console.error(failure)
  process.exitCode = 1
} else console.log(`Rendered checks passed: ${url}`)

function contrastRatio(foreground, background) {
  const parse = (value) => {
    const parts = value.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (!parts) return null
    return parts.slice(1, 4).map((number) => {
      const channel = Number(number) / 255
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    })
  }
  const front = parse(foreground)
  const back = parse(background)
  if (!front || !back || /rgba\([^)]*,\s*0(?:\.0+)?\)/.test(background)) return null
  const luminance = (channels) => channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
  const light = Math.max(luminance(front), luminance(back))
  const dark = Math.min(luminance(front), luminance(back))
  return (light + 0.05) / (dark + 0.05)
}
