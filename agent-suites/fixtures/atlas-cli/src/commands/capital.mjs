import { country } from '../countries.mjs'

export const summary = 'capital <country>...      capital city of each country'
export function run(args) {
  return args.map((name) => `${country(name).name}: ${country(name).capital}`)
}
