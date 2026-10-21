/** Seats still free on a flight. */
export const seatsLeft = (flight) => flight.basket - flight.booked

/** Lines of the office board, by date and then dawn before dusk. */
export function board(flights) {
  return [...flights]
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.slot === 'dawn' ? -1 : 1))
    .map(
      (flight) =>
        `${flight.date}  ${flight.slot.padEnd(5)} ${flight.site.padEnd(14)}${String(seatsLeft(flight)).padStart(2)} left`,
    )
}
