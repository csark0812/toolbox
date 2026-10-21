// Hidden acceptance for the framing calculator: the page renders at a phone and a desktop width
// without page errors or sideways scroll and has one h1. On a phone, three scripted quotes must
// come out at the workshop's prices: 40 x 50 cm walnut, anti-reflective, with a mount is £134.70
// (outer 50 x 60, ready in 7 days); 95 x 70 cm gilt, standard glass, with a mount is £243.40
// (outer 105 x 80, large frame surcharge, 14 days); 20 x 15 cm black ash, acrylic, no mount is
// £38.40 (the £8 glazing minimum). A 130 cm width is refused next to the field with no price shown.
/* global document */
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { launchBrowser, serve } from '../../../scripts/lib/bench-render.mjs'

const root = process.argv[2]
const page = 'index.html'

const visibleText = (tab) =>
  tab.evaluate(() => document.body.innerText.replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' '))
const visible = (locator) => locator.filter({ visible: true })
const settle = (tab) => tab.waitForTimeout(400)

/** Set a size: a number or text field, a range slider, or a select. */
async function size(tab, label, value) {
  const el = visible(tab.getByLabel(label)).first()
  const kind = await el.evaluate((node) => (node.tagName === 'SELECT' ? 'select' : node.type))
  if (kind === 'select') await el.selectOption(String(value))
  else if (kind === 'range')
    await el.evaluate((node, v) => {
      node.value = String(v)
      node.dispatchEvent(new Event('input', { bubbles: true }))
      node.dispatchEvent(new Event('change', { bubbles: true }))
    }, value)
  else {
    await el.fill(String(value))
    await el.dispatchEvent('change')
  }
  return settle(tab)
}

/** Choose an option: a radio, an option of a labelled select, or a pressable button. */
async function choose(tab, group, option) {
  const radio = tab.getByRole('radio', { name: option })
  if (await radio.count()) {
    try {
      await radio.first().check({ timeout: 2000 })
    } catch {
      await radio.first().evaluate((el) => el.click())
    }
    return settle(tab)
  }
  const select = visible(tab.getByRole('combobox', { name: group }))
  if (await select.count()) {
    const labels = await select.first().locator('option').allTextContents()
    const label = labels.find((text) => option.test(text))
    assert.ok(label, `an option matching ${option} in ${group}`)
    await select.first().selectOption({ label })
    return settle(tab)
  }
  const button = visible(tab.getByRole('button', { name: option }))
  assert.ok((await button.count()) > 0, `a control to choose ${option}`)
  await button.first().click()
  return settle(tab)
}

/** Mount on or off: a checkbox or switch, or a yes/no choice in a group named for the mount. */
async function mount(tab, on) {
  const toggle = tab
    .getByRole('checkbox', { name: /mount/i })
    .or(tab.getByRole('switch', { name: /mount/i }))
  if (await toggle.count()) {
    const el = toggle.first()
    const checked = await el.evaluate((node) =>
      node.matches('input') ? node.checked : node.getAttribute('aria-checked') === 'true',
    )
    if (checked !== on) {
      try {
        await el.click({ timeout: 2000 })
      } catch {
        await el.evaluate((node) => node.click())
      }
    }
    return settle(tab)
  }
  const group = tab
    .getByRole('radiogroup', { name: /mount/i })
    .or(tab.getByRole('group', { name: /mount/i }))
  if (await group.count()) {
    const radio = group.first().getByRole('radio', { name: on ? /yes|with/i : /^no|without|none/i })
    try {
      await radio.first().check({ timeout: 2000 })
    } catch {
      await radio.first().evaluate((el) => el.click())
    }
    return settle(tab)
  }
  return choose(
    tab,
    /mount/i,
    on ? /with (a )?mount|mount: yes|^yes/i : /no mount|without|mount: no|^no/i,
  )
}

async function quote(tab, { width, height, moulding, glazing, withMount }) {
  await size(tab, /width/i, width)
  await size(tab, /height/i, height)
  await choose(tab, /moulding|frame/i, moulding)
  await choose(tab, /glazing|glass/i, glazing)
  await mount(tab, withMount)
  const calculate = visible(
    tab.getByRole('button', { name: /calculate|get (a |my )?(quote|price)|update|work it out/i }),
  )
  if (await calculate.count()) {
    await calculate.first().click()
    await settle(tab)
  }
  return visibleText(tab)
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

  const tab = await browser.newPage({ viewport: { width: 390, height: 844 } })
  tab.setDefaultTimeout(5000)
  const errors = []
  tab.on('pageerror', (error) => errors.push(error.message))
  await tab.goto(`${server.url}/${page}`, { waitUntil: 'networkidle', timeout: 30000 })
  const outer = (w, h) => new RegExp(`${w}\\s*(cm)?\\s*(x|\\u00d7|by)\\s*${h}`, 'i')

  let text = await quote(tab, {
    width: 40,
    height: 50,
    moulding: /walnut/i,
    glazing: /anti.?reflect/i,
    withMount: true,
  })
  assert.match(text, /£\s?134\.70/, '40 x 50 walnut, anti-reflective, mount: £134.70')
  assert.match(text, outer(50, 60), '40 x 50 with a mount: outer size 50 x 60')
  assert.match(text, /\b7 days/i, 'walnut: ready in 7 days')
  assert.match(text, /£\s?79\.20/, 'the breakdown shows the moulding at £79.20')

  text = await quote(tab, {
    width: 95,
    height: 70,
    moulding: /gilt/i,
    glazing: /standard/i,
    withMount: true,
  })
  assert.match(text, /£\s?243\.40/, '95 x 70 gilt, standard glass, mount: £243.40')
  assert.match(text, outer(105, 80), '95 x 70 with a mount: outer size 105 x 80')
  assert.match(text, /\b14 days/i, 'gilt: ready in 14 days')
  assert.match(text, /£\s?20(\.00)?\b/, 'the breakdown shows the large frame surcharge')

  text = await quote(tab, {
    width: 20,
    height: 15,
    moulding: /black ash/i,
    glazing: /acrylic/i,
    withMount: false,
  })
  assert.match(text, /£\s?38\.40/, '20 x 15 black ash, acrylic, no mount: £38.40')
  assert.match(text, /£\s?8\.00\b|£\s?8\b/, 'the glazing minimum of £8 is applied')

  const before = await visibleText(tab)
  await size(tab, /width/i, 130)
  const calculate = visible(
    tab.getByRole('button', { name: /calculate|get (a |my )?(quote|price)|update|work it out/i }),
  )
  if (await calculate.count())
    await calculate
      .first()
      .click()
      .catch(() => {})
  await settle(tab)
  text = await visibleText(tab)
  const limits = (page) => (page.match(/120/g) ?? []).length
  assert.ok(
    limits(text) > limits(before) || (await tab.locator('[aria-invalid="true"]').count()) > 0,
    'a 130 cm width is refused with the 120 cm limit',
  )
  assert.doesNotMatch(text, /£\s?110\.50/, 'no price is shown for a 130 cm width')
  assert.doesNotMatch(text, /£\s?38\.40/, 'the old price is not left showing for a 130 cm width')
  assert.deepEqual(errors, [], 'no page errors while quoting')
  await tab.close()
} finally {
  await browser.close()
  await server.close()
}
