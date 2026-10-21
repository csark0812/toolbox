// Shared helpers for hidden checks that use a page the way a visitor does: fill what is visible, press
// the forward button, and read what is visible. Written to accept any reasonable build of the brief.
/* global document, getComputedStyle */
import { launchBrowser, openPage as openUrl, serve } from '../../../scripts/lib/bench-render.mjs'

/** Open `page` under `root` at a desktop width; resolves to { tab, close }. */
export async function openPage(root, page, { width = 1280, height = 900, routes = {} } = {}) {
  const server = await serve(root)
  const browser = await launchBrowser()
  const tab = await browser.newPage({ viewport: { width, height } })
  for (const [pattern, body] of Object.entries(routes))
    await tab.route(pattern, (route) =>
      route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) }),
    )
  await openUrl(tab, `${server.url}/${page}`)
  await tab.waitForTimeout(400)
  return {
    tab,
    close: async () => {
      await browser.close()
      await server.close()
    },
  }
}

/** The page's visible text, whitespace collapsed. */
export const visibleText = (tab) => tab.evaluate(() => document.body.innerText.replace(/\s+/g, ' '))

/** Visible fields that are marked invalid and carry a visible message through aria-describedby. */
export const explainedErrors = (tab) =>
  tab.evaluate(() => {
    const shown = (el) => {
      const box = el.getBoundingClientRect()
      const style = getComputedStyle(el)
      return box.width > 0 && box.height > 0 && style.visibility !== 'hidden'
    }
    return [...document.querySelectorAll('[aria-invalid="true"]')]
      .filter(shown)
      .filter((field) =>
        (field.getAttribute('aria-describedby') ?? '')
          .split(/\s+/)
          .map((id) => id && document.getElementById(id))
          .some((message) => message && shown(message) && message.textContent.trim()),
      )
      .map((field) => field.name || field.id)
  })

/** A plausible value for a visible field, chosen from its type and label. */
function valueFor(type, label) {
  if (type === 'email' || /e-?mail/i.test(label)) return 'sam@example.com'
  if (type === 'tel' || /phone|mobile/i.test(label)) return '07700 900123'
  if (/post ?code|zip/i.test(label)) return 'ST3 1PQ'
  if (/town|city/i.test(label)) return 'Stoke-on-Trent'
  if (/county|region/i.test(label)) return 'Staffordshire'
  if (/address|street|line|house/i.test(label)) return '12 Clay Lane'
  if (/name/i.test(label)) return 'Sam Rowe'
  return 'Sample text'
}

/** Fill every visible, empty text field; pick a choice in each untouched radio group and select. */
export async function fillVisible(tab, overrides = {}) {
  const fields = await tab.evaluate(() => {
    const shown = (el) => {
      const box = el.getBoundingClientRect()
      return box.width > 0 && box.height > 0 && getComputedStyle(el).visibility !== 'hidden'
    }
    const labelOf = (el) =>
      [
        ...(el.labels ? [...el.labels].map((label) => label.textContent) : []),
        el.getAttribute('aria-label'),
        el.getAttribute('placeholder'),
        el.name,
        el.id,
        el.getAttribute('autocomplete'),
      ]
        .filter(Boolean)
        .join(' ')
    return [...document.querySelectorAll('input, select, textarea')]
      .map((el, index) => {
        el.setAttribute('data-flow-field', String(index))
        return {
          index,
          tag: el.tagName.toLowerCase(),
          type: (el.getAttribute('type') ?? 'text').toLowerCase(),
          name: el.name,
          label: labelOf(el),
          value: el.value,
          checked: el.checked,
          required: el.required || el.getAttribute('aria-required') === 'true',
          disabled: el.disabled || el.readOnly,
          shown: shown(el) || (el.type === 'radio' && el.labels?.[0] && shown(el.labels[0])),
        }
      })
      .filter((field) => field.shown && !field.disabled)
  })
  const groups = new Set()
  for (const field of fields) {
    const locator = tab.locator(`[data-flow-field="${field.index}"]`)
    if (['hidden', 'submit', 'button', 'search', 'number', 'range'].includes(field.type)) continue
    if (field.type === 'radio') {
      const group = field.name || field.index
      if (groups.has(group)) continue
      groups.add(group)
      if (
        !fields.some(
          (other) => other.type === 'radio' && other.name === field.name && other.checked,
        )
      )
        await locator.check({ force: true }).catch(() => {})
      continue
    }
    if (field.type === 'checkbox') {
      if (field.required && !field.checked) await locator.check({ force: true }).catch(() => {})
      continue
    }
    if (field.tag === 'select') {
      const options = await locator.evaluate((select) =>
        [...select.options].map((option) => option.value),
      )
      if (!field.value && options.find(Boolean))
        await locator.selectOption(options.find(Boolean)).catch(() => {})
      continue
    }
    if (field.value) continue
    const override = Object.entries(overrides).find(([pattern]) =>
      new RegExp(pattern, 'i').test(field.label),
    )
    await locator.fill(override ? override[1] : valueFor(field.type, field.label)).catch(() => {})
    await locator.blur().catch(() => {})
  }
}

const FORWARD = /continue|next|review|place|confirm|checkout|proceed|submit|go to|pay|order/i
const NOT_FORWARD = /back|previous|remove|edit|change|delete|cancel|shop|browse/i

/** Press the visible button that moves the flow forward. Resolves to its text, or null. */
export async function pressForward(tab) {
  const buttons = tab.locator('button, input[type="submit"], [role="button"], a.button, a.btn')
  // The flow's own next button, not a step in a progress list: a submit button or one whose label
  // starts with a forward verb scores higher; one inside a nav, list or tab list scores lower.
  let best = null
  for (let index = 0; index < (await buttons.count()); index++) {
    const button = buttons.nth(index)
    if (!(await button.isVisible().catch(() => false))) continue
    if (await button.isDisabled().catch(() => false)) continue
    const text = (
      (await button.innerText().catch(() => '')) || (await button.inputValue().catch(() => ''))
    ).trim()
    if (!FORWARD.test(text) || NOT_FORWARD.test(text)) continue
    const where = await button.evaluate((el) => ({
      submit: el.type === 'submit',
      inList: Boolean(el.closest('nav, ol, ul, [role="tablist"]')),
    }))
    const score =
      (/^(continue|next|review|place|confirm|checkout|proceed|go to|pay)/i.test(text) ? 2 : 0) +
      (where.submit ? 1 : 0) -
      (where.inList ? 5 : 0)
    if (!best || score >= best.score) best = { button, text, score }
  }
  if (!best) return null
  await best.button.click({ timeout: 5000 }).catch(() => {})
  await tab.waitForTimeout(500)
  return best.text
}
