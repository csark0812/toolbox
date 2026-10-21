import { escapeHtml, page, pounds } from './html.mjs'
import { tenancies } from './store.mjs'

/** The signed-in landlord's tenancies. */
export function listTenancies(request, session) {
  if (!session?.landlordId) return { status: 401, body: { error: 'sign in' } }
  return {
    status: 200,
    body: tenancies().filter((tenancy) => tenancy.landlordId === session.landlordId),
  }
}

/** The tenant portal's tenancy page. */
export function tenancyPage(request, session) {
  if (!session?.tenancyId) return { status: 401, body: { error: 'sign in' } }
  const tenancy = tenancies().find((entry) => entry.id === session.tenancyId)
  if (!tenancy) return { status: 404, body: { error: 'not found' } }
  const body = [
    `<h1>${escapeHtml(tenancy.property)}</h1>`,
    `<p>Tenant: ${escapeHtml(tenancy.tenant)}</p>`,
    `<p>Deposit held: ${pounds(tenancy.depositPence)}</p>`,
    `<p>Tenancy ends ${escapeHtml(tenancy.end)}</p>`,
  ].join('\n')
  return { status: 200, body: page('Your tenancy', body) }
}
