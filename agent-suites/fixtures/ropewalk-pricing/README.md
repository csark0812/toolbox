# Ropewalk Studios: pricing

Ropewalk Studios is a coworking space inside a 300-metre Victorian ropewalk on Rope Lane, Faversham:
one long, narrow brick hall with desks down both sides and glass studios at the far end. The website
is one page (`index.html`). Its pricing is three static cards that only quote a per-person price, so
teams email to ask what they would actually pay, and most of them ask about the wrong plan.

Replace the pricing section with one that answers a team's question on the page: **what would we
pay?** The rules are in `data/pricing.json`; read them with `fetch` and calculate from them, so the
office manager can change a price without touching the code.

- A visitor picks a plan (hot desk, fixed desk or private studio), sets the team size (1 to 20 people)
  and chooses monthly or annual billing.
- The price updates as they change anything: the monthly cost for the whole team and, for annual
  billing, the amount billed for the year. Per-person plans multiply by the team size. A studio holds
  up to 4 people, so a bigger team needs more studios. Annual billing takes 15% off and is paid once a
  year.
- Say what the team gets (meeting room hours a month, the total for the team). Teams on fixed desks
  often do not realise that private studios can be cheaper: when studios would cost a fixed-desk team
  less, say so and by how much a month.
- Prices are in pounds with pence only when there are any (£612, £7,344, £22.50). Prices exclude VAT;
  say so once.
- The rest of the page (the story, the hall, the address and the booking link) stays, and can be
  improved to match.

No framework and no build step: plain HTML, CSS and JavaScript. Serve the folder (for example
`npx serve .`) to view it.
