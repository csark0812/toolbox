const time = (iso) => iso.slice(11, 16)

/** One board line for a shift. Times are shown in UTC for now. */
export function formatShift(shift) {
  return `${shift.id}  ${shift.start.slice(0, 10)} ${time(shift.start)}-${time(shift.end)} UTC  ${shift.worker}`
}
