import { readFileSync } from 'node:fs'
import { reminder } from '../src/texts.mjs'

const load = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const templates = load('templates.json')
const patients = load('patients.json')
const sms = load('sms.json')
console.log(`From ${sms.senderId}, sending at ${sms.sendAt}`)
for (const appointment of load('appointments.json')) {
  const patient = patients.find((p) => p.id === appointment.patient)
  console.log(`  ${patient.mobile}  ${reminder(templates, appointment, patient)}`)
}
