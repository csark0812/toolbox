# Trevennick parish: planning applications

Trevennick Parish Council comments on every planning application in the parish before the county
decides it. The clerk and eight councillors use this screen (`index.html`) to prepare the monthly
meeting and to answer residents who ring about "the one on Quay Road". Today it prints every
application in one long table, oldest first, and nobody can find anything on a phone.

The applications are in `data/applications.json` (the county's feed, already saved by the clerk), read
with `fetch`. `asOf` is today's date for the screen.

What the screen needs to do:

- Find an application by reference, address or what is proposed, as you type.
- Narrow by ward and by status (received, under consultation, approved, refused, withdrawn), and show
  how many applications match.
- Put what needs the council's comment first: applications under consultation, with the date comments
  close and how many days are left. Closing within seven days needs to stand out.
- When nothing matches, say so plainly, say which search or filters caused it, and offer one action
  that clears them.
- Each application shows its reference, address, proposal, ward, status, the date received and the
  decision due date. Dates are read by people in Cornwall: 30 Oct 2026, not 2026-10-30.
- It is used at a desk during the meeting and on a phone on the doorstep; both matter.

No framework and no build step: plain HTML, CSS and JavaScript. Serve the folder (for example
`npx serve .`) to view it.
