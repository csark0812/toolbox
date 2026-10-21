/** Sells the next ticket to a supporter and returns it. */
export function sell(tickets, buyer) {
  const ticket = { number: String(tickets.length + 1), buyer }
  tickets.push(ticket)
  return ticket
}
