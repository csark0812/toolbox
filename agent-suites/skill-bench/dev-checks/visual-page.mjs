// Shared hidden check for visual tasks: the page renders at a phone and a desktop width without page
// errors or sideways scrolling, has one h1, and shows every required fact as visible text.
/* global document */
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { launchBrowser, openPage, serve } from '../../../scripts/lib/bench-render.mjs'

export async function checkPage(root, page, { mustShow = [] } = {}) {
  assert.ok(existsSync(join(root, page)), `${page} exists`)
  const server = await serve(root)
  const browser = await launchBrowser()
  try {
    for (const width of [390, 1440]) {
      const tab = await browser.newPage({ viewport: { width, height: 900 } })
      const errors = []
      tab.on('pageerror', (error) => errors.push(error.message))
      await openPage(tab, `${server.url}/${page}`)
      const facts = await tab.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
        h1: document.querySelectorAll('h1').length,
        text: document.body.innerText.replace(/\s+/g, ' '),
      }))
      assert.deepEqual(errors, [], `${width}px: no page errors`)
      assert.ok(
        facts.scroll <= facts.client + 1,
        `${width}px: no sideways scroll (${facts.scroll} > ${facts.client})`,
      )
      assert.equal(facts.h1, 1, `${width}px: exactly one h1`)
      for (const fact of mustShow)
        assert.ok(
          fact instanceof RegExp ? fact.test(facts.text) : facts.text.includes(fact),
          `${width}px: shows ${fact}`,
        )
      await tab.close()
    }
  } finally {
    await browser.close()
    await server.close()
  }
}
