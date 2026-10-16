/** Records outgoing mail; production hands it to the mail relay. */
export function createMailer() {
  const outbox = []
  return {
    outbox,
    send(to, subject, text) {
      outbox.push({ to, subject, text })
    },
  }
}
