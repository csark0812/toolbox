// Development check for the planning screen: readable dates and days left, search as you type, and a
// no-match state that names the search and clears it in one action.
import assert from 'node:assert/strict'
import { checkPage } from './visual-page.mjs'
import { openPage, visibleText } from './ui-flow.mjs'

const root = process.argv[2]
await checkPage(root, 'index.html', {
  mustShow: ['PA26/0341', 'The Old Net Loft', /30 Oct(ober)?\b/, /9 days\b/],
})

const { tab, close } = await openPage(root, 'index.html')
try {
  const before = await visibleText(tab)
  assert.doesNotMatch(before, /\b2026-\d\d-\d\d\b/, 'no dates shown as 2026-10-30')
  // Another application on the first view, to see it hidden by the search and back after clearing.
  const other = ['PA26/0382', 'PA26/0310', 'PA26/0500', 'PA26/0398', 'PA26/0374'].find((ref) =>
    before.includes(ref),
  )
  assert.ok(other, 'the first view lists more than the net loft')
  const search = tab
    .getByRole('searchbox')
    .or(tab.getByLabel(/search|find/i).and(tab.locator('input')))
    .filter({ visible: true })
    .first()
  await search.fill('net loft')
  await tab.waitForTimeout(500)
  let text = await visibleText(tab)
  assert.match(text, /The Old Net Loft/, 'searching finds the net loft')
  assert.ok(!text.includes(other), 'searching hides what does not match')

  await search.fill('zzqx')
  await tab.waitForTimeout(500)
  text = await visibleText(tab)
  assert.match(
    text,
    /\bno\b[^.]{0,40}(application|result|match)|nothing (matches|found)/i,
    'no match is said',
  )
  assert.match(text, /zzqx/, 'the no-match message names the search')
  await tab
    .getByRole('button', { name: /clear|reset|show all/i })
    .or(tab.getByRole('link', { name: /clear|reset|show all/i }))
    .first()
    .click({ timeout: 5000 })
  await tab.waitForTimeout(500)
  assert.ok((await visibleText(tab)).includes(other), 'one action brings every application back')
  assert.equal(await search.inputValue(), '', 'and empties the search')
} finally {
  await close()
}
