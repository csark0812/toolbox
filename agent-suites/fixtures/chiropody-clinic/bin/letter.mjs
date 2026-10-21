import { readFileSync } from 'node:fs'
import { argv, exit } from 'node:process'
import { letter } from '../src/letters.mjs'

const load = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const patient = load('patients.json').find((p) => p.id === argv[2])
if (!patient) {
  console.error('Usage: npm run letter -- <patient id>')
  exit(1)
}
const appointment = load('appointments.json').find((a) => a.patient === patient.id)
console.log(letter(patient, appointment))
