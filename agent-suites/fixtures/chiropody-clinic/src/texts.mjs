import { CLINIC } from './clinic.mjs'

export function fill(template, fields) {
  return template.replace(/\{(\w+)\}/g, (match, key) => fields[key] ?? match)
}

export function reminder(templates, appointment, patient) {
  const template = templates[appointment.kind] ?? templates.default
  return fill(template, {
    name: patient.first,
    time: appointment.time,
    day: appointment.day,
    phone: CLINIC.phone,
  })
}
