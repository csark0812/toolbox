const METERS_PER_MILE = 1609.344

/** `5.21 km` */
export function formatKm(meters) {
  return `${(meters / 1000).toFixed(2)} km`
}

/** `3.24 mi` */
export function formatMiles(meters) {
  return `${(meters / METERS_PER_MILE).toFixed(2)} mi`
}

const clock = (seconds) => {
  const whole = Math.round(seconds)
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

/** `5:12 /km` */
export function paceKm(seconds, meters) {
  return `${clock(seconds / (meters / 1000))} /km`
}

/** `8:22 /mi` */
export function paceMiles(seconds, meters) {
  return `${clock(seconds / (meters / METERS_PER_MILE))} /mi`
}

/** `1:02:03` or `27:03` */
export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const rest = clock(seconds % 3600).padStart(h ? 5 : 0, '0')
  return h ? `${h}:${rest}` : rest
}
