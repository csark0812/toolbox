import { accounts } from './store.mjs'

const squash = (postcode) =>
  String(postcode ?? '')
    .replace(/\s+/g, '')
    .toUpperCase()

/** Signs a resident in with the reference on their bill and their postcode. */
export function signIn(request) {
  const { accountRef, postcode } = request.body
  const account = accounts().find((entry) => entry.ref === accountRef)
  if (!account || squash(account.postcode) !== squash(postcode)) {
    return { status: 401, body: { error: 'those details do not match a bill' } }
  }
  return { status: 200, body: { accountRef: account.ref } }
}

/** The signed-in resident's bill: the instalments and what is left to pay. */
export function viewAccount(request, session) {
  if (!session?.accountRef) return { status: 401, body: { error: 'sign in' } }
  const account = accounts().find((entry) => entry.ref === session.accountRef)
  const today = (request.now ?? new Date()).toISOString().slice(0, 10)
  const toPay = account.instalments.filter((item) => item.due > today)
  return {
    status: 200,
    body: {
      ...account,
      totalPence: account.instalments.reduce((sum, item) => sum + item.pence, 0),
      leftToPayPence: toPay.reduce((sum, item) => sum + item.pence, 0),
    },
  }
}
