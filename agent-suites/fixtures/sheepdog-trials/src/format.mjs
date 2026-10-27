export function line(run) {
  return `${run.class.padEnd(7)} ${`${run.handler} & ${run.dog}`.padEnd(22)} ${String(run.points).padStart(3)}`
}

export function describeError(path, error) {
  return error.code ? `Could not read ${path}: ${error.code}` : `Feed broken: ${error.message}`
}
