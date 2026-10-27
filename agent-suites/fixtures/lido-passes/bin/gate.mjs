import { isValid, loadPasses } from '../src/passes.mjs'

const [id, date] = process.argv.slice(2)
const pass = loadPasses().find((entry) => entry.id === id)
if (!pass || !date) {
  console.error('usage: npm run gate -- <pass> <YYYY-MM-DD>')
  process.exit(2)
}
console.log(`${pass.swimmer}: ${isValid(pass, date) ? 'let in' : 'not valid'}`)
