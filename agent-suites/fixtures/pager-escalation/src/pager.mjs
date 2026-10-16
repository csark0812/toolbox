/** Every page sent, newest last. */
export const sent = []

/** Page a person about an incident. */
export function page(person, incident) {
  sent.push({ to: person, incident: incident.id, at: new Date().toISOString() })
}
