/** `HH:MM:SS` as seconds since midnight. */
export function seconds(time) {
  const [h, m, s] = time.split(':').map(Number)
  return h * 3600 + m * 60 + s
}

/** Seconds as `H:MM:SS`. */
export function clock(total) {
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** Seconds per kilometre as `M:SS/km`, rounded up to the next second. */
export function pace(totalSeconds, km) {
  const perKm = Math.ceil(totalSeconds / km)
  return `${Math.floor(perKm / 60)}:${String(perKm % 60).padStart(2, '0')}/km`
}
