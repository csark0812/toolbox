/** "Zip Code " -> "zip_code", "E-mail" -> "e_mail" */
export function normalizeHeader(header) {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}
