// Hidden acceptance for the charger billing screen: it renders at a phone and a desktop width
// without page errors or sideways scroll and has one h1. The month's totals and each person's bill
// are worked out from data/october.json by the agreed rules (October sessions only, failed sessions
// unbilled, the peak boundary at 07:00 and 19:00, idle fees only past the grace period, October
// payments only), each person's total and balance are shown together, credit is shown as credit,
// and the person who owes most is named. The same page is then served with a changed export, to
// prove the numbers are computed from the file.
/* global document */
import assert from 'node:assert/strict'
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { launchBrowser, serve } from '../../../scripts/lib/bench-render.mjs'

const root = process.argv[2]
const page = 'index.html'
const DRIVERS = ['Amara Osei', 'Tom Kirby', 'Leila Haddad', 'Gareth Pryce']
const money = (amount) => new RegExp(`£\\s?${amount.replace('.', '\\.')}(?!\\d)`)

/** In the page: for each person, the visible texts of elements that name only that person. */
function personBlocks(names) {
  const clean = (text) =>
    text
      .replace(/[\u00a0\u202f]/g, ' ')
      .replace(/\u2212/g, '-')
      .replace(/\s+/g, ' ')
  const texts = [...document.body.querySelectorAll('*')]
    .filter((el) => el.getClientRects().length)
    .map((el) => clean(el.innerText))
  return Object.fromEntries(
    names.map((name) => [
      name,
      texts.filter(
        (text) => text.includes(name) && !names.some((o) => o !== name && text.includes(o)),
      ),
    ]),
  )
}

async function check(dir, expect) {
  const server = await serve(dir)
  const browser = await launchBrowser()
  try {
    for (const width of [390, 1440]) {
      const tab = await browser.newPage({ viewport: { width, height: 900 } })
      const errors = []
      tab.on('pageerror', (error) => errors.push(error.message))
      await tab.goto(`${server.url}/${page}`, { waitUntil: 'networkidle', timeout: 30000 })
      await tab.waitForTimeout(600)
      const facts = await tab.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
        h1: document.querySelectorAll('h1').length,
        text: document.body.innerText
          .replace(/[\u00a0\u202f]/g, ' ')
          .replace(/\u2212/g, '-')
          .replace(/\s+/g, ' '),
      }))
      const at = `${expect.label}, ${width}px`
      assert.deepEqual(errors, [], `${at}: no page errors`)
      assert.ok(
        facts.scroll <= facts.client + 1,
        `${at}: no sideways scroll (${facts.scroll} > ${facts.client})`,
      )
      assert.equal(facts.h1, 1, `${at}: exactly one h1`)
      assert.match(facts.text, /October|Oct 2026|2026-10/i, `${at}: shows the month`)
      for (const fact of expect.mustShow) assert.match(facts.text, fact, `${at}: shows ${fact}`)
      const blocks = await tab.evaluate(personBlocks, DRIVERS)
      for (const [name, { total, balance, credit }] of Object.entries(expect.people)) {
        assert.ok(
          blocks[name].some(
            (text) =>
              money(total).test(text) &&
              money(balance).test(text) &&
              (!credit || /credit/i.test(text)),
          ),
          `${at}: ${name} is shown with total £${total} and balance £${balance}${credit ? ' in credit' : ''}`,
        )
      }
      assert.ok(
        blocks[expect.owesMost].some((text) =>
          /owes? (the )?most|most owed|highest|largest|biggest/i.test(text),
        ),
        `${at}: ${expect.owesMost} is named as owing the most`,
      )
      await tab.close()
    }
  } finally {
    await browser.close()
    await server.close()
  }
}

assert.ok(existsSync(join(root, page)), `${page} exists`)
await check(root, {
  label: 'October',
  mustShow: [/217\.2(?!\d)/, money('62.79'), money('25.83')],
  people: {
    'Amara Osei': { total: '15.50', balance: '5.50' },
    'Tom Kirby': { total: '14.46', balance: '1.54', credit: true },
    'Leila Haddad': { total: '15.71', balance: '15.71' },
    'Gareth Pryce': { total: '17.12', balance: '4.62' },
  },
  owesMost: 'Leila Haddad',
})

// Next month's export replaces the file: a corrected reading must change the bills.
const copy = mkdtempSync(join(tmpdir(), 'ev-chargers-'))
try {
  cpSync(root, copy, { recursive: true, filter: (path) => !/node_modules|\.git$/.test(path) })
  const file = join(copy, 'data/october.json')
  const data = JSON.parse(readFileSync(file, 'utf8'))
  data.sessions.find((session) => session.id === 's14').kWh = 23.1
  writeFileSync(file, JSON.stringify(data, null, 2))
  await check(copy, {
    label: 'after a corrected reading',
    mustShow: [/227\.2(?!\d)/, money('63.99'), money('27.03')],
    people: { 'Leila Haddad': { total: '16.91', balance: '16.91' } },
    owesMost: 'Leila Haddad',
  })
} finally {
  rmSync(copy, { recursive: true, force: true })
}
