export const CONCESSIONS = { pensioner: 0.5, student: 0.25 }

const STANDARD = { ratePence: 32, waterPence: 1800, discount: 0 }

/** The tariff that applies to a plot. */
export function tariffFor(plot) {
  const tariff = STANDARD
  if (plot.concession) {
    if (!(plot.concession in CONCESSIONS))
      throw new RangeError(`unknown concession "${plot.concession}"`)
    tariff.discount = CONCESSIONS[plot.concession]
  }
  return tariff
}
