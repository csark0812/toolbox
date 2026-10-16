/** The SMS a customer gets once a technician is on the way. */
export async function etaText(callout, tech, km) {
  const { shortAddress, travelMinutes } = await import('./geo.mjs')
  return `Hi ${callout.customer}, ${tech.name} is on the way to ${shortAddress(callout.address)} and should arrive in about ${travelMinutes(km)} minutes.`
}
