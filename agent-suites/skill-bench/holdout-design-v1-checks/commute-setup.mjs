// Hidden acceptance for the commuter setup flow: the page renders at a phone and a desktop width
// without page errors or sideways scroll and has one h1. Then, on a phone, a scripted commuter
// continues with no stations (errors, stays put), picks the same station twice (refused with a
// message), picks Bath Spa and Bristol Temple Meads, sets 07:40 and 17:30, unticks every day
// (refused), ticks Monday and Wednesday, goes back to step one and forward again without losing
// anything, chooses alerts 15 minutes before and finishes on a summary that says all of it. A
// second commuter who skips the alerts step gets a summary with alerts at 10 minutes.
/* global document */
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { launchBrowser, serve } from '../../../scripts/lib/bench-render.mjs'

const root = process.argv[2]
const page = 'index.html'
const ERROR_WORDS =
  /required|please|choose|pick|select|need|missing|at least|different|same|can['’]t|cannot/gi

const visibleText = (tab) =>
  tab.evaluate(() => document.body.innerText.replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' '))
const visible = (locator) => locator.filter({ visible: true })
const settle = (tab) => tab.waitForTimeout(350)
const count = (text) => (text.match(ERROR_WORDS) ?? []).length

/** Click the first visible button (or, failing that, link) whose name matches. */
async function press(tab, name) {
  const buttons = visible(tab.getByRole('button', { name }))
  const target = (await buttons.count()) ? buttons : visible(tab.getByRole('link', { name }))
  assert.ok((await target.count()) > 0, `a visible button matching ${name}`)
  await target.first().click()
  await settle(tab)
}

const HOME = /home station|^home|from/i
const WORK = /work station|^work|^to\b|destination/i
const LEAVE_HOME = /leave home|leaving home|from home|morning|outbound/i
const LEAVE_WORK = /leave work|leaving work|from work|evening|return|home time/i
const DAYS = /^(mon|tue|wed|thu|fri|sat|sun)/i

/** Pick a station: a select, or a text or combobox field with a list to pick from. */
async function station(tab, label, name) {
  const el = visible(tab.getByLabel(label)).first()
  if ((await el.evaluate((node) => node.tagName)) === 'SELECT') {
    const labels = await el.locator('option').allTextContents()
    const option = labels.find((text) => text.trim().startsWith(name))
    assert.ok(option, `${name} is in the list for ${label}`)
    await el.selectOption({ label: option })
    return settle(tab)
  }
  await el.fill(name)
  await settle(tab)
  const pick = new RegExp(`^\\s*${name}`)
  const option = visible(tab.getByRole('option', { name: pick }))
  if (await option.count()) await option.first().click()
  else {
    const button = visible(tab.getByRole('button', { name: pick }))
    if (await button.count()) await button.first().click()
  }
  await el.dispatchEvent('change').catch(() => {})
  return settle(tab)
}

/** The station a field currently holds, as text. */
const stationValue = async (tab, label) => {
  const el = visible(tab.getByLabel(label)).first()
  return el.evaluate((node) =>
    node.tagName === 'SELECT' ? (node.selectedOptions[0]?.textContent ?? '') : node.value,
  )
}

async function time(tab, label, value) {
  const el = visible(tab.getByLabel(label)).first()
  if ((await el.evaluate((node) => node.tagName)) === 'SELECT') {
    const labels = await el.locator('option').allTextContents()
    const option = labels.find((text) => text.includes(value))
    assert.ok(option, `${value} can be chosen for ${label}`)
    await el.selectOption({ label: option })
  } else await el.fill(value)
  await el.dispatchEvent('change').catch(() => {})
  return settle(tab)
}

/** Day toggles: checkboxes, switches or pressed-state buttons, named by day. */
async function setDays(tab, wanted) {
  const toggles = visible(
    tab
      .getByRole('checkbox', { name: DAYS })
      .or(tab.getByRole('switch', { name: DAYS }))
      .or(tab.locator('button[aria-pressed]').filter({ hasText: DAYS })),
  )
  const total = await toggles.count()
  assert.ok(total >= 5, 'a toggle for each travel day')
  for (let i = 0; i < total; i++) {
    const toggle = toggles.nth(i)
    const name =
      (await toggle.getAttribute('aria-label')) ??
      (await toggle.evaluate((el) => el.labels?.[0]?.textContent ?? el.textContent))
    const on = await toggle.evaluate((el) =>
      el.matches('input')
        ? el.checked
        : el.getAttribute('aria-checked') === 'true' || el.getAttribute('aria-pressed') === 'true',
    )
    const want = wanted.some((day) => day.test(name.trim()))
    if (on !== want) {
      try {
        await toggle.click({ timeout: 2000 })
      } catch {
        await toggle.evaluate((el) => el.click())
      }
    }
  }
  return settle(tab)
}

async function stepOne(tab) {
  await station(tab, HOME, 'Bath Spa')
  await station(tab, WORK, 'Bristol Temple Meads')
  await press(tab, /continue|next/i)
}

async function stepTwo(tab) {
  await time(tab, LEAVE_HOME, '07:40')
  await time(tab, LEAVE_WORK, '17:30')
  await press(tab, /continue|next/i)
}

assert.ok(existsSync(join(root, page)), `${page} exists`)
const server = await serve(root)
const browser = await launchBrowser()
try {
  for (const width of [390, 1440]) {
    const tab = await browser.newPage({ viewport: { width, height: 900 } })
    const errors = []
    tab.on('pageerror', (error) => errors.push(error.message))
    await tab.goto(`${server.url}/${page}`, { waitUntil: 'networkidle', timeout: 30000 })
    await tab.waitForTimeout(400)
    const facts = await tab.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
      h1: document.querySelectorAll('h1').length,
    }))
    assert.deepEqual(errors, [], `${width}px: no page errors`)
    assert.ok(
      facts.scroll <= facts.client + 1,
      `${width}px: no sideways scroll (${facts.scroll} > ${facts.client})`,
    )
    assert.equal(facts.h1, 1, `${width}px: exactly one h1`)
    await tab.close()
  }

  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const tab = await context.newPage()
  tab.setDefaultTimeout(5000)
  const errors = []
  tab.on('pageerror', (error) => errors.push(error.message))
  await tab.goto(`${server.url}/${page}`, { waitUntil: 'networkidle', timeout: 30000 })

  let before = await visibleText(tab)
  await press(tab, /continue|next/i)
  let after = await visibleText(tab)
  assert.ok(
    (await tab.locator('[aria-invalid="true"]').count()) > 0 || count(after) > count(before),
    'continuing with no stations shows errors',
  )
  assert.ok(
    await visible(tab.getByLabel(HOME)).first().isVisible(),
    'no stations: stays on step one',
  )

  await station(tab, HOME, 'Bath Spa')
  await station(tab, WORK, 'Bath Spa')
  await press(tab, /continue|next/i)
  after = await visibleText(tab)
  assert.ok(
    await visible(tab.getByLabel(HOME)).first().isVisible(),
    'the same station twice: stays on step one',
  )
  assert.match(
    after,
    /different|same|can['’]t be|cannot be/i,
    'the same station twice is explained',
  )

  await stepOne(tab)
  assert.ok(
    await visible(tab.getByLabel(LEAVE_HOME)).first().isVisible(),
    'step two asks for times',
  )
  await time(tab, LEAVE_HOME, '07:40')
  await time(tab, LEAVE_WORK, '17:30')
  await setDays(tab, [])
  before = await visibleText(tab)
  await press(tab, /continue|next/i)
  after = await visibleText(tab)
  assert.ok(
    await visible(tab.getByLabel(LEAVE_HOME)).first().isVisible(),
    'no days: stays on step two',
  )
  assert.ok(count(after) > count(before), 'no days ticked is explained')
  await setDays(tab, [/^mon/i, /^wed/i])
  await press(tab, /continue|next/i)
  assert.ok(
    !(await visible(tab.getByLabel(LEAVE_HOME)).count()),
    'two days ticked: moves on to alerts',
  )

  // Back to the start and forward again: nothing is lost.
  for (let step = 0; step < 3 && !(await visible(tab.getByLabel(HOME)).count()); step++)
    await press(tab, /back|previous/i)
  assert.match(await stationValue(tab, HOME), /Bath Spa/, 'going back keeps the home station')
  assert.match(
    await stationValue(tab, WORK),
    /Bristol Temple Meads/,
    'going back keeps the work station',
  )
  await press(tab, /continue|next/i)
  assert.match(
    await visible(tab.getByLabel(LEAVE_HOME))
      .first()
      .inputValue()
      .catch(async () => stationValue(tab, LEAVE_HOME)),
    /0?7:40/,
    'going back keeps the times',
  )
  await press(tab, /continue|next/i)

  const fifteen = tab.getByRole('radio', { name: /15/ })
  if (await fifteen.count()) {
    try {
      await fifteen.first().check({ timeout: 2000 })
    } catch {
      await fifteen.first().evaluate((el) => el.click())
    }
  } else {
    const select = visible(tab.getByRole('combobox', { name: /minutes|before|when|alert/i }))
    if (await select.count()) {
      const labels = await select.first().locator('option').allTextContents()
      await select.first().selectOption({ label: labels.find((text) => /15/.test(text)) })
    } else await press(tab, /15/)
  }
  await settle(tab)
  await press(tab, /finish|done|save|set up|start|continue|next/i)
  const summary = await visibleText(tab)
  for (const fact of [
    /Bath Spa/,
    /Bristol Temple Meads/,
    /0?7[:.]40/,
    /17[:.]30|5[:.]30\s?pm/i,
    /mon/i,
    /wed/i,
    /15 min/i,
  ])
    assert.match(summary, fact, `the summary says ${fact}`)
  assert.doesNotMatch(summary, /\b(tue|thu|fri)/i, 'the summary lists only the days ticked')
  assert.ok(
    (await visible(
      tab
        .getByRole('button', { name: /change|edit/i })
        .or(tab.getByRole('link', { name: /change|edit/i })),
    ).count()) > 0,
    'the summary offers a way to change the setup',
  )
  assert.deepEqual(errors, [], 'no page errors during setup')
  await context.close()

  // A second commuter skips the alerts step.
  const fresh = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const other = await fresh.newPage()
  other.setDefaultTimeout(5000)
  await other.goto(`${server.url}/${page}`, { waitUntil: 'networkidle', timeout: 30000 })
  await stepOne(other)
  await stepTwo(other)
  await press(other, /skip/i)
  assert.match(await visibleText(other), /10 min/i, 'skipping leaves alerts on at 10 minutes')
  await fresh.close()
} finally {
  await browser.close()
  await server.close()
}
