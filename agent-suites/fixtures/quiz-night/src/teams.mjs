import { readFile, writeFile } from 'node:fs'

/** Reads the team list: callback(error, teams). */
export function loadTeams(path, callback) {
  readFile(path, 'utf8', (error, text) => {
    if (error) return callback(error)
    let teams
    try {
      teams = JSON.parse(text)
    } catch (parseError) {
      return callback(new SyntaxError(`${path}: ${parseError.message}`))
    }
    callback(null, teams)
  })
}

/** Reads the points sheet: callback(error, sheet). */
export function loadPoints(path, callback) {
  readFile(path, 'utf8', (error, text) => {
    if (error) return callback(error)
    callback(null, JSON.parse(text))
  })
}

/** Writes the points sheet: callback(error). */
export function savePoints(path, sheet, callback) {
  writeFile(path, `${JSON.stringify(sheet, null, 2)}\n`, callback)
}
