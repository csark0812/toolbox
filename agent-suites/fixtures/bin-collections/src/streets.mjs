/** The street whose name matches, ignoring case and surrounding spaces. */
export function findStreet(streets, name) {
  const wanted = name.trim().toLowerCase()
  return streets.find((entry) => entry.street.toLowerCase() === wanted)
}
