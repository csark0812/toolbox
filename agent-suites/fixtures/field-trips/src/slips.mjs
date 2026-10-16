/** Students on the roster without a signed slip for `trip`, by form then name. */
export function outstanding(roster, slips, trip) {
  if (!slips[trip]) throw new RangeError(`unknown trip: ${trip}`)
  const signed = new Set(slips[trip])
  return roster
    .filter((student) => !signed.has(student.id))
    .sort((a, b) => a.form.localeCompare(b.form) || a.name.localeCompare(b.name))
}
