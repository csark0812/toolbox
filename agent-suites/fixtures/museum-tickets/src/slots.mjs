export const PLACES = 40

export const SLOTS = [
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
]

export function parseTickets(text) {
  const [, ...rows] = text.trim().split('\n')
  return rows.map((row) => {
    const [ref, date, slot, type, qty, channel, status] = row.split(',')
    return { ref, date, slot, type, qty: Number(qty), channel, status }
  })
}

/** The places a ticket takes in its slot. */
export function placesOf(ticket) {
  if (ticket.status === 'refunded') return 0
  if (ticket.type === 'infant') return 0
  return ticket.qty
}

/** Places taken in each slot of a day. */
export function daySlots(tickets, date) {
  const taken = new Map(SLOTS.map((slot) => [slot, 0]))
  for (const ticket of tickets) {
    if (ticket.date !== date || !taken.has(ticket.slot)) continue
    taken.set(ticket.slot, taken.get(ticket.slot) + placesOf(ticket))
  }
  return [...taken].map(([slot, places]) => ({ slot, places, full: places >= PLACES }))
}
