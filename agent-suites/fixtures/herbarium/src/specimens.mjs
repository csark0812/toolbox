/** One line of the specimen list. */
export function specimenLine(specimen) {
  return `${specimen.accession}  ${specimen.taxon}  ${specimen.collector}  ${specimen.collected ?? 'date unknown'}`
}
