import { sell } from './tickets.mjs'

/** Buys a ticket for the signed-in supporter. */
export function handleBuy(request, session, tickets) {
  if (!session?.supporterId) return { status: 401, body: { error: 'sign in' } }
  return { status: 201, body: sell(tickets, session.supporterId) }
}
