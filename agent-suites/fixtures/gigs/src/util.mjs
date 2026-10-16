// Shared helpers.

/** "Night Owls & Co." -> "night-owls-co" */
export function slug(text) {
  return text
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** 1250 -> "$12.50", 0 -> "Free". */
export function priceLabel(cents) {
  if (cents === 0) return 'Free'
  const dollars = Math.floor(cents / 100)
  const rest = cents % 100
  return rest === 0 ? `$${dollars}` : `$${dollars}.${String(rest).padStart(2, '0')}`
}

/** "2026-10-16T00:00:00Z" in America/New_York -> "Thu, Oct 15, 8:00 PM". */
export function fmtWhen(iso, timeZone) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  })
    .format(new Date(iso))
    .replace(/\u202f/g, ' ')
}
