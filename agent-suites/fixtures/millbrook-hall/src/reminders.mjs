import { HALL_EMAIL, SENDER } from './config.mjs'
import { price } from './pricing.mjs'

export const fromAddress = () => `${SENDER.mailbox}@${SENDER.domain}`

/** The reminder text sent to a hirer the week before their booking. */
export function reminder(booking) {
  return [
    `From: Millbrook Hall <${fromAddress()}>`,
    `To: ${booking.contact}`,
    `${booking.day} ${booking.start}-${booking.end}: ${booking.group}, £${price(booking).toFixed(2)}`,
    `To change or cancel, reply to ${HALL_EMAIL}.`,
  ].join('\n')
}
