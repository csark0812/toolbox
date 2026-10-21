// Hidden acceptance for the kitchen temperature screen: it renders at a phone and a desktop width
// without page errors or sideways scroll and has one h1. Each unit is shown with its status in
// words, worked out from data/readings.json by the food safety rules (Prep fridge 1, Prep fridge 2
// and Dessert fridge need action; the others are OK), with its latest reading beside it; today's
// highest readings are shown, and both missed checks are listed with their unit and time. The same
// page is then served with a changed readings file, to prove the numbers are computed from it.
/* global document */
import assert from 'node:assert/strict'
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { launchBrowser, serve } from '../../../scripts/lib/bench-render.mjs'

const root = process.argv[2]
const page = 'index.html'
const UNITS = [
  'Walk-in chiller',
  'Prep fridge 1',
  'Prep fridge 2',
  'Dessert fridge',
  'Fish drawer',
  'Freezer',
]

/** In the page: for each unit, the smallest visible element naming only that unit and a status. */
function unitBlocks(units) {
  const shown = [...document.body.querySelectorAll('*')].filter((el) => el.getClientRects().length)
  const clean = (text) =>
    text
      .replace(/[\u00a0\u202f]/g, ' ')
      .replace(/\u2212/g, '-')
      .replace(/\s+/g, ' ')
  const status = (text) =>
    /no action/i.test(text)
      ? 'ok'
      : /needs? action|action (needed|required)/i.test(text)
        ? 'action'
        : /\bOK\b/.test(text)
          ? 'ok'
          : null
  const missed = /missed|no reading|not (taken|logged|recorded|checked)|skipped/i
  return Object.fromEntries(
    units.map((name) => {
      const own = shown
        .map((el) => clean(el.innerText))
        .filter((text) => text.includes(name) && !units.some((o) => o !== name && text.includes(o)))
        .sort((a, b) => a.length - b.length)
      const block = own.find((text) => status(text))
      return [
        name,
        {
          status: block ? status(block) : null,
          text: block ?? '',
          missed: own.filter((text) => missed.test(text)),
        },
      ]
    }),
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
      const blocks = await tab.evaluate(unitBlocks, UNITS)
      for (const [name, { status, latest }] of Object.entries(expect.units)) {
        assert.equal(blocks[name].status, status, `${at}: ${name} shows status ${status}`)
        assert.match(
          blocks[name].text,
          new RegExp(`${latest.replace('.', '\\.')}(\\.0)?(?!\\d)`),
          `${at}: ${name} shows its latest reading ${latest} with its status`,
        )
      }
      for (const fact of expect.mustShow) assert.match(facts.text, fact, `${at}: shows ${fact}`)
      for (const name of ['Prep fridge 2', 'Dessert fridge'])
        // In a grid the time may be the column heading rather than inside the unit's row.
        assert.ok(
          blocks[name].missed.length && /10[:.]00/.test(facts.text),
          `${at}: the missed 10:00 check on ${name} is shown with its unit and time`,
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
  label: 'today',
  units: {
    'Walk-in chiller': { status: 'ok', latest: '3.9' },
    'Prep fridge 1': { status: 'action', latest: '4.9' },
    'Prep fridge 2': { status: 'action', latest: '5.3' },
    'Dessert fridge': { status: 'action', latest: '4.8' },
    'Fish drawer': { status: 'ok', latest: '1.8' },
    Freezer: { status: 'ok', latest: '-22' },
  },
  // Today's highest readings: 5.6, 6.1, 5.3, 5.2, 2.6 and -17.5.
  mustShow: [/5\.6/, /6\.1/, /5\.2/, /2\.6/, /-17\.5/],
})

// The tablet replaces the file during the day: a new 16:00 freezer reading must change the screen.
const copy = mkdtempSync(join(tmpdir(), 'fridge-log-'))
try {
  cpSync(root, copy, {
    recursive: true,
    filter: (path) => !/node_modules|\.git$/.test(path),
  })
  const file = join(copy, 'data/readings.json')
  const data = JSON.parse(readFileSync(file, 'utf8'))
  data.units.find((unit) => unit.name === 'Freezer').readings[5] = -16.4
  writeFileSync(file, JSON.stringify(data, null, 2))
  await check(copy, {
    label: 'after a new freezer reading',
    units: {
      Freezer: { status: 'action', latest: '-16.4' },
      'Walk-in chiller': { status: 'ok', latest: '3.9' },
    },
    mustShow: [/-16\.4/],
  })
} finally {
  rmSync(copy, { recursive: true, force: true })
}
