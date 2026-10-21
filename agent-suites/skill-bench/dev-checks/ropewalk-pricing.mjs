// Development check for the coworking pricing: a visitor picks a plan, a team size and a billing period
// and reads the right price for the whole team, the yearly bill, the studio count, and a cheaper plan.
import assert from 'node:assert/strict'
import { checkPage } from './visual-page.mjs'
import { openPage, visibleText } from './ui-flow.mjs'

const root = process.argv[2]
await checkPage(root, 'index.html', {
  mustShow: [/Hot desk/i, /Fixed desk/i, /Private studio/i, /Rope Lane/, /VAT/],
})

/** Click or check the first control that names `pattern`, of the kinds a picker is built from. */
async function choose(tab, pattern) {
  for (const role of ['radio', 'tab', 'switch', 'checkbox', 'button', 'option']) {
    const control = tab.getByRole(role, { name: pattern }).first()
    if (await control.isVisible().catch(() => false)) {
      if (role === 'checkbox' || role === 'switch') {
        if (!(await control.isChecked().catch(() => false))) await control.click()
      } else await control.click()
      return true
    }
  }
  const select = tab.locator('select').filter({ hasText: pattern }).first()
  if (await select.isVisible().catch(() => false)) {
    const label = await select.locator('option').filter({ hasText: pattern }).first().innerText()
    await select.selectOption({ label })
    return true
  }
  const label = tab.locator('label').filter({ hasText: pattern }).first()
  if (await label.isVisible().catch(() => false)) {
    await label.click()
    return true
  }
  return false
}

/** Monthly billing: choose it, or turn an annual switch off. */
async function chooseMonthly(tab) {
  for (const role of ['switch', 'checkbox']) {
    const control = tab.getByRole(role, { name: /annual|yearly|year/i }).first()
    if (await control.isVisible().catch(() => false)) {
      if (await control.isChecked()) await control.click()
      return true
    }
  }
  return choose(tab, /^\s*monthly|^\s*month|pay monthly|billed monthly/i)
}

async function setTeam(tab, size) {
  const field = tab
    .getByRole('spinbutton')
    .or(tab.getByRole('slider'))
    .or(tab.getByLabel(/team|people|how many|seats|members/i).and(tab.locator('input, select')))
    .filter({ visible: true })
    .first()
  const tag = await field.evaluate((el) => el.tagName.toLowerCase())
  if (tag === 'select') await field.selectOption(String(size))
  else await field.fill(String(size))
  await field.dispatchEvent('change')
}

async function price(root, { plan, size, annual }) {
  const { tab, close } = await openPage(root, 'index.html')
  try {
    assert.ok(await choose(tab, plan), `a visitor can pick ${plan}`)
    await setTeam(tab, size)
    assert.ok(
      annual ? await choose(tab, /annual|yearly/i) : await chooseMonthly(tab),
      'a visitor can choose the billing period',
    )
    await tab.waitForTimeout(400)
    return await visibleText(tab)
  } finally {
    await close()
  }
}

const money = (amount) => new RegExp(`£\\s?${amount.replace(',', ',?')}(?![\\d.])`)

const fixed = await price(root, { plan: /fixed desk/i, size: 3, annual: true })
assert.match(fixed, money('612'), '3 fixed desks billed annually cost £612 a month')
assert.match(fixed, money('7,344'), '3 fixed desks billed annually are billed £7,344 a year')

const studio = await price(root, { plan: /private studio/i, size: 5, annual: false })
assert.match(studio, money('1,240'), 'a team of 5 needs two studios: £1,240 a month')

const four = await price(root, { plan: /fixed desk/i, size: 4, annual: false })
assert.match(four, money('960'), '4 fixed desks cost £960 a month')
assert.match(
  four,
  money('340'),
  'a studio would save a team of 4 £340 a month, and the page says so',
)
