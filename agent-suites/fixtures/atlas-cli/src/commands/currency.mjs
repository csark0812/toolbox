import { country } from '../countries.mjs'

export const summary = 'currency <country>...     currency code and name'
export function run(args) {
  return args.map((name) => {
    const [code, label] = country(name).currency
    return `${country(name).name}: ${code} (${label})`
  })
}
