const day = (date) => new Date(`${date}T00:00:00Z`).getTime()
const pence = (pounds) => Math.round(pounds * 100)

/** The plot a bank reference names: its first number, with the letter straight after it if any. */
function plotOf(reference) {
  const match = /(\d+)([a-z]?)/i.exec(reference)
  return match ? `${Number(match[1])}${match[2].toUpperCase()}` : null
}

/** Who held a plot on a date. On a handover day the incoming tenant holds it. */
function holder(tenancies, plot, date) {
  const holding = tenancies
    .filter(
      (tenancy) =>
        tenancy.plot === plot &&
        day(tenancy.from) <= day(date) &&
        (tenancy.to === null || day(date) <= day(tenancy.to)),
    )
    .sort((a, b) => day(b.from) - day(a.from))
  return holding[0]?.tenant ?? null
}

/** Every tenant's rent account, and the bank payments that could not be matched to a tenant. */
export function rentAccounts({ tenancies, invoices, payments }) {
  const tenants = [...new Set(tenancies.map((tenancy) => tenancy.tenant))]
  const unmatched = payments.filter((payment) => {
    const plot = plotOf(payment.reference)
    return !plot || !holder(tenancies, plot, payment.date)
  })
  const accounts = tenants.map((tenant) => {
    const bills = invoices
      .filter((invoice) => holder(tenancies, invoice.plot, invoice.issued) === tenant)
      .map((invoice) => ({ ...invoice, due: invoice.amount }))
    const paid = payments.filter((payment) => {
      const plot = plotOf(payment.reference)
      return plot && holder(tenancies, plot, payment.date) === tenant
    })
    // Invoices before payments on the same day, so a payment can settle the day's invoice.
    const events = [
      ...bills.map((bill) => ({ date: bill.issued })),
      ...paid.map((payment) => ({ date: payment.date, amount: pence(payment.amount) })),
    ].sort((a, b) => day(a.date) - day(b.date))
    let credit = 0
    for (const event of events) {
      credit += event.amount ?? 0
      while (credit > 0) {
        const oldest = bills
          .filter((bill) => bill.due > 0 && day(bill.issued) <= day(event.date))
          .sort((a, b) => day(a.issued) - day(b.issued) || a.id.localeCompare(b.id))[0]
        if (!oldest) break
        const part = Math.min(credit, oldest.due)
        oldest.due -= part
        credit -= part
      }
    }
    return {
      tenant,
      invoiced: bills.reduce((sum, bill) => sum + bill.amount, 0),
      paid: paid.reduce((sum, payment) => sum + pence(payment.amount), 0),
      owed: bills.reduce((sum, bill) => sum + bill.due, 0),
      credit,
      unpaid: bills
        .filter((bill) => bill.due > 0)
        .sort((a, b) => day(a.issued) - day(b.issued) || a.id.localeCompare(b.id))
        .map((bill) => bill.id),
    }
  })
  accounts.sort((a, b) => b.owed - a.owed || a.tenant.localeCompare(b.tenant))
  return { accounts, unmatched }
}
