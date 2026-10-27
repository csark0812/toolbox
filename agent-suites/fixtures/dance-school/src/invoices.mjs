import { classes, invoices, pupils, setInvoices } from './store.mjs'
import { addDays, TERMS } from './terms.mjs'

/** The term's invoice lines for one family, full price. */
export function familyLines(familyId) {
  return pupils()
    .filter((pupil) => pupil.familyId === familyId)
    .flatMap((pupil) =>
      pupil.classes.map((classId) => ({
        pupilId: pupil.id,
        classId,
        pence: classes().find((entry) => entry.id === classId).feePence,
      })),
    )
}

/** Creates the term's invoices. A term is only invoiced once. */
export function generateTermInvoices(term) {
  if (!TERMS[term]) throw new Error(`unknown term ${term}`)
  if (invoices().some((invoice) => invoice.term === term))
    throw new Error(`${term} has already been invoiced`)
  const families = [...new Set(pupils().map((pupil) => pupil.familyId))]
  const fresh = families.map((familyId) => {
    const lines = familyLines(familyId)
    return {
      id: `inv-${term}-${familyId}`,
      term,
      familyId,
      dueOn: addDays(TERMS[term], -14),
      lines,
      totalPence: lines.reduce((sum, line) => sum + line.pence, 0),
      paidOn: null,
      paidPence: 0,
    }
  })
  setInvoices([...invoices(), ...fresh])
  return fresh
}
