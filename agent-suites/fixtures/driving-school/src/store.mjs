import { readFileSync } from 'node:fs'

const load = (name) => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url)))

let state
/** Reloads the records from data/ (the tests call this between cases). */
export function reset() {
  state = { instructors: load('instructors'), learners: load('learners'), lessons: load('lessons') }
}
reset()

export const instructors = () => state.instructors
export const learners = () => state.learners
export const lessons = () => state.lessons

/** Stores a lesson, replacing the one with the same id. */
export function saveLesson(lesson) {
  state.lessons = state.lessons.filter((entry) => entry.id !== lesson.id).concat(lesson)
}
