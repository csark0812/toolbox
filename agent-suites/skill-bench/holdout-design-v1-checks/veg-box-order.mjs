// Hidden acceptance for the veg box order flow: the page renders at a phone and a desktop width
// without page errors or sideways scroll and has one h1. Then, on a phone, a scripted customer
// picks a Medium box and two lots of eggs; continuing with empty delivery details shows inline
// errors and stays put; a bad email is refused, then a BS1 postcode with a message about delivery;
// fixed details reach a review with £27.10 (£24.60 plus £2.50 delivery); going back to add a loaf
// keeps the typed details and brings the total to £28.80 with free delivery; placing the order
// shows a confirmation with that total.
/* global document */
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { launchBrowser, serve } from '../../../scripts/lib/bench-render.mjs'

const root = process.argv[2]
const page = 'index.html'
const ERROR_WORDS =
  /required|please|enter|need|missing|valid|check|add your|can['’]t be|cannot be|looks like|isn['’]t/gi

const visibleText = (tab) =>
  tab.evaluate(() => document.body.innerText.replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' '))
const visible = (locator) => locator.filter({ visible: true })
const settle = (tab) => tab.waitForTimeout(350)

/** Click the first visible button or link whose name matches. */
async function press(tab, name) {
  const buttons = visible(tab.getByRole('button', { name }))
  const target = (await buttons.count()) ? buttons : visible(tab.getByRole('link', { name }))
  assert.ok((await target.count()) > 0, `a visible button matching ${name}`)
  await target.first().click()
  await settle(tab)
}

/** Choose an option: a radio, an option of a labelled select, or a pressable button or card. */
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

/** Set a quantity: a number field, a select, or a stepper's increase button pressed n times. */
async function quantity(tab, name, n) {
  const spin = visible(tab.getByRole('spinbutton', { name }))
  if (await spin.count()) {
    await spin.first().fill(String(n))
    await spin.first().dispatchEvent('change')
    return settle(tab)
  }
  const select = visible(tab.getByRole('combobox', { name }))
  if (await select.count()) {
    await select.first().selectOption(String(n))
    return settle(tab)
  }
  const plus = visible(
    tab.getByRole('button', {
      name: new RegExp(
        `(add|increase|more|plus|\\+).*${name.source}|${name.source}.*(add|increase|more|plus|\\+)`,
        'i',
      ),
    }),
  )
  assert.ok((await plus.count()) > 0, `a way to set the quantity of ${name}`)
  for (let i = 0; i < n; i++) await plus.first().click()
  return settle(tab)
}

const field = (tab, label) => visible(tab.getByLabel(label)).first()
const NAME = /full name|^name/i
const EMAIL = /e-?mail/i
const PHONE = /phone|mobile/i
const ADDRESS = /^(street |delivery |home )?address|address line|street|house/i
const POSTCODE = /post ?code/i

async function fill(tab, values) {
  for (const [label, value] of values) await field(tab, label).fill(value)
  await settle(tab)
}

const count = (text) => (text.match(ERROR_WORDS) ?? []).length
const invalid = (tab) => tab.locator('[aria-invalid="true"]').count()

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
    const text = await visibleText(tab)
    for (const fact of [/Small/, /Medium/, /Large/, /£\s?14\.50/, /£\s?19\.00/, /£\s?24\.50/])
      assert.match(text, fact, `${width}px: step one shows ${fact}`)
    await tab.close()
  }

  const tab = await browser.newPage({ viewport: { width: 390, height: 844 } })
  tab.setDefaultTimeout(5000)
  const errors = []
  tab.on('pageerror', (error) => errors.push(error.message))
  await tab.goto(`${server.url}/${page}`, { waitUntil: 'networkidle', timeout: 30000 })
  await choose(tab, /box/i, /medium/i)
  await quantity(tab, /eggs/i, 2)
  await press(tab, /continue|next/i)
  assert.ok(await field(tab, NAME).isVisible(), 'step two asks for the delivery details')

  let before = await visibleText(tab)
  await press(tab, /continue|next|review/i)
  let after = await visibleText(tab)
  assert.ok(
    (await invalid(tab)) > 0 || count(after) > count(before),
    'continuing with empty details shows errors',
  )
  assert.ok(await field(tab, NAME).isVisible(), 'empty details do not move on')

  await fill(tab, [
    [NAME, 'Priya Shah'],
    [EMAIL, 'priya@example'],
    [PHONE, '07700 900123'],
    [ADDRESS, '12 Cotham Vale'],
    [POSTCODE, 'BS6 5QA'],
  ])
  await choose(tab, /delivery day|day/i, /thursday/i)
  await press(tab, /continue|next|review/i)
  assert.ok(await field(tab, EMAIL).isVisible(), 'an email without a domain does not move on')
  assert.equal(await field(tab, NAME).inputValue(), 'Priya Shah', 'typed details are kept')

  await fill(tab, [
    [EMAIL, 'priya.shah@example.com'],
    [POSTCODE, 'BS1 4DJ'],
  ])
  before = await visibleText(tab)
  await press(tab, /continue|next|review/i)
  after = await visibleText(tab)
  assert.ok(await field(tab, POSTCODE).isVisible(), 'a BS1 postcode does not move on')
  const deliver = (text) => (text.match(/deliver/gi) ?? []).length
  assert.ok(
    deliver(after) > deliver(before),
    'the BS1 postcode is refused with a message about delivery',
  )

  await fill(tab, [[POSTCODE, 'BS6 5QA']])
  await press(tab, /continue|next|review/i)
  let review = await visibleText(tab)
  for (const fact of [
    /Medium/i,
    /eggs/i,
    /Priya Shah/,
    /BS6 5QA/i,
    /Thursday/i,
    /£\s?2\.50/,
    /£\s?27\.10/,
  ])
    assert.match(review, fact, `the review shows ${fact}`)

  // Back to step one, without losing anything, to add a loaf.
  const loaf = () =>
    visible(
      tab
        .getByRole('spinbutton', { name: /sourdough/i })
        .or(tab.getByRole('combobox', { name: /sourdough/i }))
        .or(tab.getByRole('button', { name: /sourdough/i })),
    ).count()
  for (let step = 0; step < 4 && !(await loaf()); step++) await press(tab, /back|edit|change/i)
  assert.ok(await loaf(), 'the customer can go back to the box and extras')
  await quantity(tab, /sourdough/i, 1)
  await press(tab, /continue|next/i)
  assert.equal(
    await field(tab, NAME).inputValue(),
    'Priya Shah',
    'going back keeps the delivery details',
  )
  await press(tab, /continue|next|review/i)
  review = await visibleText(tab)
  assert.match(review, /£\s?28\.80/, 'the review total is £28.80 once the loaf is added')
  assert.match(review, /free/i, 'delivery is free at £28.80')
  assert.doesNotMatch(review, /£\s?31\.30/, 'no delivery charge is added at £28.80')

  await press(tab, /place (my |the )?order|confirm|send (my )?order|order now/i)
  const done = await visibleText(tab)
  assert.match(done, /confirmed|thank/i, 'placing the order shows a confirmation')
  assert.match(done, /£\s?28\.80/, 'the confirmation shows the total')
  assert.deepEqual(errors, [], 'no page errors during the order')
  await tab.close()
} finally {
  await browser.close()
  await server.close()
}
