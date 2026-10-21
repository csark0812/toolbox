import { hires, tools } from './store.mjs'

const withTool = (hire) => ({ ...hire, tool: tools().find((tool) => tool.id === hire.toolId).name })

/** The signed-in customer's hires, newest first. */
export function listHires(request, session) {
  if (!session?.customerId) return { status: 401, body: { error: 'sign in' } }
  const own = hires()
    .filter((hire) => hire.customerId === session.customerId)
    .sort((a, b) => b.from.localeCompare(a.from))
  return { status: 200, body: own.map(withTool) }
}

/** One of the signed-in customer's hires. */
export function viewHire(request, session) {
  if (!session?.customerId) return { status: 401, body: { error: 'sign in' } }
  const hire = hires().find(
    (entry) => entry.id === request.params.id && entry.customerId === session.customerId,
  )
  if (!hire) return { status: 404, body: { error: 'not found' } }
  return { status: 200, body: withTool(hire) }
}
