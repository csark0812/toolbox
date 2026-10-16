const distance = ([ax, ay], [bx, by]) => Math.hypot(ax - bx, ay - by)

/** Shortest distance in km from a point to a route (a polyline of [x, y] points). */
export function distanceToRoute(point, route) {
  let best = Infinity
  for (let i = 1; i < route.length; i++) {
    const [a, b] = [route[i - 1], route[i]]
    const length = distance(a, b) ** 2
    const t = length
      ? Math.max(
          0,
          Math.min(
            1,
            ((point[0] - a[0]) * (b[0] - a[0]) + (point[1] - a[1]) * (b[1] - a[1])) / length,
          ),
        )
      : 0
    best = Math.min(best, distance(point, [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]))
  }
  return best
}

/** Extra driving minutes to pick someone up `km` off the route and come back (30 km/h). */
export const detourMinutes = (km) => Math.round(((2 * km) / 30) * 60)
