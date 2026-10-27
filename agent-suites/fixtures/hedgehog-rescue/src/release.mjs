export const RELEASE_GRAMS = 600

/** The hog's most recent weigh-in. */
export function latestWeighIn(hog) {
  const sorted = [...hog.weighIns].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  return sorted.at(-1)
}

/** Whether the hog can be released, and the weight that decided it. */
export function releaseStatus(hog) {
  const { grams } = latestWeighIn(hog)
  return { grams, ready: grams > RELEASE_GRAMS }
}
