/** The heading and pilot lines for one task day in the tasks list. */
export function taskLines(task) {
  return [
    `${task.id}  ${task.date}  ${task.name}  (${task.entries.length} pilots)`,
    ...task.entries.map(
      (e) => `  ${e.comp.padEnd(3)} ${e.pilot.padEnd(12)} ${e.glider.padEnd(10)} ${e.elapsed}`,
    ),
  ]
}
