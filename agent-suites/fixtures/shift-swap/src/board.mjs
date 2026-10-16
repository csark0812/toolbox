/** Shifts posted for swapping, earliest first. */
export function openSwaps(shifts) {
  return shifts
    .filter((shift) => shift.swap)
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
}
