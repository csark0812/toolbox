/** One line of a collection ticket: the ticket number, the customer and the job. */
export const ticket = (job) => `#${job.ticket}  ${job.customer}  ${job.job}`
