export const ADULT = 12000
export const JUNIOR = 6000
export const FAMILY_CAP = 25000
const SEASON = [4, 5, 6, 7, 8, 9]

/** One member's sub for the season, in pence. */
export function memberSub({ junior, joined }) {
  const full = junior ? JUNIOR : ADULT
  if (!joined) return full
  const month = Number(joined.slice(5, 7))
  const left = SEASON.filter((m) => m >= month).length
  return Math.round((full * left) / SEASON.length)
}

/** Every household's bill, in pence, with the family cap applied where it is due. */
export function householdBills(members, family) {
  const households = {}
  for (const member of members) (households[member.household] ??= []).push(member)
  return Object.entries(households).map(([household, people]) => {
    const total = people.reduce((sum, member) => sum + memberSub(member), 0)
    const capped = household in family && total > FAMILY_CAP
    return {
      household,
      surname: people[0].name.split(' ').at(-1),
      members: people.length,
      pence: capped ? FAMILY_CAP : total,
      capped,
    }
  })
}
