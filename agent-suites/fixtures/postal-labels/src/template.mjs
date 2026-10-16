import { formatAddress } from './address.mjs'

const FLAGS = ['multiline', 'country', 'upper']

/**
 * Fill a template. `{{key}}` inserts a value; `{{key|multiline,country,upper}}` formats an address
 * with any of those flags.
 */
export function render(template, values) {
  return template.replace(/\{\{(\w+)(?:\|([\w,]+))?\}\}/g, (_, key, options = '') => {
    const value = values[key]
    if (value === undefined) throw new RangeError(`no value for ${key}`)
    if (typeof value !== 'object') return String(value)
    const chosen = options.split(',').filter(Boolean)
    for (const flag of chosen)
      if (!FLAGS.includes(flag)) throw new RangeError(`unknown flag: ${flag}`)
    return formatAddress.apply(null, [value, ...FLAGS.map((flag) => chosen.includes(flag))])
  })
}
