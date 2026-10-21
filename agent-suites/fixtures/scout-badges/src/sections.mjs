/** The awards a section can present, by the rule in data/sections.json. */
export function forSection(awards, rule) {
  return awards.filter((award) => award[rule.field] >= rule.from && award[rule.field] <= rule.to)
}
