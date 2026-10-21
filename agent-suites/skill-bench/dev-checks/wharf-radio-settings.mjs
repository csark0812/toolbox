// Development check for the presenter settings: values come from the data file, a changed setting shows
// as unsaved and then as saved, a missing display name is explained beside the field and blocks the
// save, and leaving the station asks first and says how many booked slots would go.
/* global document */
import assert from 'node:assert/strict'
import { checkPage } from './visual-page.mjs'
import { explainedErrors, openPage, visibleText } from './ui-flow.mjs'

const root = process.argv[2]
await checkPage(root, 'index.html', {
  mustShow: [/listener sends a message/i, /weekly listening figures/i, /Studio B/],
})
const SAVED = /\b(saved|changes saved|all saved)\b/i
const save = (tab) =>
  tab
    .getByRole('button', { name: /^\s*save/i })
    .first()
    .click({ timeout: 5000 })

{
  const { tab, close } = await openPage(root, 'index.html')
  try {
    const values = await tab.evaluate(() =>
      [...document.querySelectorAll('input, textarea')].map((field) => field.value),
    )
    assert.ok(values.includes('Mo Okafor'), 'the display name is read from the data file')
    const toggle = tab
      .getByRole('switch', { name: /listener sends a message/i })
      .or(tab.getByRole('checkbox', { name: /listener sends a message/i }))
      .first()
    await toggle.click({ timeout: 5000 })
    await tab.waitForTimeout(300)
    assert.match(
      await visibleText(tab),
      /unsaved|not saved|not yet saved/i,
      'a change shows as unsaved',
    )
    await save(tab)
    await tab.waitForTimeout(600)
    assert.match(await visibleText(tab), SAVED, 'saving confirms the changes were saved')
  } finally {
    await close()
  }
}

{
  const { tab, close } = await openPage(root, 'index.html')
  try {
    await tab
      .getByLabel(/display name/i)
      .first()
      .fill('')
    await save(tab)
    await tab.waitForTimeout(500)
    assert.ok((await explainedErrors(tab)).length, 'a missing display name is marked and explained')
    assert.doesNotMatch(await visibleText(tab), SAVED, 'nothing is saved with a missing name')
  } finally {
    await close()
  }
}

{
  const { tab, close } = await openPage(root, 'index.html')
  const dialogs = []
  tab.on('dialog', (dialog) => {
    dialogs.push(dialog.message())
    dialog.dismiss().catch(() => {})
  })
  try {
    await tab
      .getByRole('button', { name: /leave|delete|remove (my )?account/i })
      .first()
      .click({ timeout: 5000 })
    await tab.waitForTimeout(500)
    const text = `${await visibleText(tab)} ${dialogs.join(' ')}`
    assert.match(
      text,
      /\b(3|three)\b[^.]{0,40}(slot|booking|show)/i,
      'it says the 3 booked slots go',
    )
    const still = await tab.evaluate(() =>
      [...document.querySelectorAll('input')].some((field) => field.value === 'Mo Okafor'),
    )
    assert.ok(still, 'one press does not remove the account')
  } finally {
    await close()
  }
}
