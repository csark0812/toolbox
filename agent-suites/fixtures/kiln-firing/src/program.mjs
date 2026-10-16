import * as segments from './helpers.mjs'

export const ROOM_TEMP = 20

// How long each kind of segment takes, by the name of the function that works it out.
const DURATION = { ramp: 'calcRamp', hold: 'calcHold' }

/** Each segment of a program with how long it takes and the temperature at its end. */
export function steps(program) {
  let temperature = ROOM_TEMP
  return program.map((segment) => {
    const duration = DURATION[segment.shape]
    if (!duration) throw new Error(`unknown segment shape ${segment.shape}`)
    const minutes = segments[duration](segment, temperature)
    if (segment.shape === 'ramp') temperature = segment.to
    return { ...segment, minutes, temperature }
  })
}

export const totalMinutes = (program) => steps(program).reduce((sum, step) => sum + step.minutes, 0)
