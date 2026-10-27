import { PRICE_PENCE } from './config.mjs'
import { isAbsent } from './register.mjs'

export const money = (pence) => `£${(pence / 100).toFixed(2)}`

/** Pupils in school on a day. */
export const present = (pupils, absences, day) =>
  pupils.filter((pupil) => !isAbsent(absences, pupil.id, day))

/** How many school dinners and packed lunches the kitchen should expect on a day. */
export function kitchenSheet(pupils, absences, day) {
  const here = present(pupils, absences, day)
  return {
    dinners: here.filter((pupil) => pupil.lunch === 'school').length,
    packed: here.filter((pupil) => pupil.lunch === 'packed').length,
  }
}

/** Dinner money for each school-dinner pupil over the given school days, by class then name. */
export function bill(pupils, absences, days) {
  return pupils
    .filter((pupil) => pupil.lunch === 'school')
    .map((pupil) => {
      const dinners = days.filter((day) => !isAbsent(absences, pupil.id, day)).length
      return { ...pupil, dinners, pence: pupil.freeMeals ? 0 : dinners * PRICE_PENCE }
    })
    .sort((a, b) => a.class.localeCompare(b.class) || a.name.localeCompare(b.name))
}
