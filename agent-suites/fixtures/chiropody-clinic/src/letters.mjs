import { CLINIC } from './clinic.mjs'

export function letter(patient, appointment) {
  return [
    CLINIC.name,
    CLINIC.address,
    '',
    `Dear ${patient.title} ${patient.last},`,
    '',
    `Your appointment is on ${appointment.day} at ${appointment.time}.`,
    'Please bring your current footwear and a list of any medicines you take.',
    '',
    'If you cannot come, please let us know at least a day before so we can offer the slot to someone else.',
    '',
    'Yours sincerely,',
    'Reception',
    '',
    'Tel: 01632 960 123   Out of hours: NHS 111',
  ].join('\n')
}
