let value = ''
export async function refresh(load) {
  value = await load()
  return value
}
export function current() {
  return value
}
