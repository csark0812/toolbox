import { settings } from './settings.mjs'

/** Whole-number percentage of lessons done. */
export function completion(learner) {
  return learner.lessons ? Math.floor((learner.done / learner.lessons) * 100) : 0
}

/** passed, failed or in progress. */
export function outcome(learner) {
  if (learner.done < learner.lessons || learner.mark === null) return 'in progress'
  return learner.mark >= settings.passMark ? 'passed' : 'failed'
}

export function progressLine(learner) {
  return `${learner.name}: ${learner.course} ${completion(learner)}% (${outcome(learner)})`
}
