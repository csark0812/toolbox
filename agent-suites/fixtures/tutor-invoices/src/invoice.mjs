export const RATE_PENCE = 3600

/** A lesson's charge in pence. */
export function lessonCharge(lesson) {
  return Math.round((lesson.minutes / 60) * RATE_PENCE)
}

/** Each family's lessons in `month` (`YYYY-MM`) with their charges and total. */
export function invoices(lessons, month) {
  const families = new Map()
  for (const lesson of lessons.filter((l) => l.date.startsWith(`${month}-`))) {
    const family = families.get(lesson.family) ?? { family: lesson.family, lines: [], total: 0 }
    const charge = lessonCharge(lesson)
    family.lines.push({ ...lesson, charge })
    family.total += charge
    families.set(lesson.family, family)
  }
  return [...families.values()].sort((a, b) => a.family.localeCompare(b.family))
}

export const pounds = (pence) => `£${(pence / 100).toFixed(2)}`
