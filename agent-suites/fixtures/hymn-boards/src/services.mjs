/** One line of the service list. */
export function serviceLine(service) {
  return `${service.date}  ${service.name.padEnd(20)} ${service.hymns.join(' | ')}`
}
