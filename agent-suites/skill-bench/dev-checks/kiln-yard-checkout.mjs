// Development check for the pottery checkout: the cart comes from data/cart.json, an empty cart says so,
// a forward press with missing details explains the error beside the field, and a visitor who fills
// the steps in reaches a confirmation with a KY- reference and their email address.
import assert from 'node:assert/strict'
import { checkPage } from './visual-page.mjs'
import { explainedErrors, fillVisible, openPage, pressForward, visibleText } from './ui-flow.mjs'

const root = process.argv[2]
await checkPage(root, 'index.html', {
  mustShow: ['Mug, tide glaze', 'Serving bowl, ash glaze', 'Bud vase', /121[.,]50/],
})

// The cart is read from the data file: an empty one is said to be empty, not shown as a form.
{
  const { tab, close } = await openPage(root, 'index.html', {
    routes: { '**/data/cart.json': { currency: 'GBP', items: [] } },
  })
  try {
    const text = await visibleText(tab)
    assert.match(text, /empty|nothing in|no items/i, 'an empty cart says it is empty')
    assert.doesNotMatch(text, /121[.,]50/, 'an empty cart shows no old total')
  } finally {
    await close()
  }
}

// Moving on with nothing filled in shows a marked field with its message beside it.
{
  const { tab, close } = await openPage(root, 'index.html')
  try {
    let errors = []
    for (let press = 0; press < 4 && !errors.length; press++) {
      if (!(await pressForward(tab))) break
      errors = await explainedErrors(tab)
    }
    assert.ok(
      errors.length,
      'a missing detail is marked aria-invalid with a visible linked message',
    )
    assert.doesNotMatch(await visibleText(tab), /KY-\d{5}/, 'an incomplete order is not placed')
  } finally {
    await close()
  }
}

// Filling each step in reaches the confirmation.
{
  const { tab, close } = await openPage(root, 'index.html')
  try {
    let text = ''
    for (let step = 0; step < 10; step++) {
      await fillVisible(tab)
      await pressForward(tab)
      text = await visibleText(tab)
      if (/KY-\d{5}/.test(text)) break
    }
    assert.match(text, /KY-\d{5}/, 'the confirmation shows a KY- order reference')
    assert.match(text, /sam@example\.com/, 'the confirmation names the email address used')
  } finally {
    await close()
  }
}
