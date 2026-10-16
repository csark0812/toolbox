/** Each member's attendance this term, by name. */
export function attendance(members, rehearsals) {
  return members
    .map((member) => {
      const attended = rehearsals.filter((r) => r.present.includes(member.name)).length
      const possible = rehearsals.length
      return {
        name: member.name,
        section: member.section,
        attended,
        possible,
        percent: Math.floor((attended / possible) * 100),
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

export const formatRow = (row) =>
  `${row.name.padEnd(14)}${row.section.padEnd(9)}${`${row.attended}/${row.possible}`.padStart(5)}${`${row.percent}%`.padStart(6)}`
