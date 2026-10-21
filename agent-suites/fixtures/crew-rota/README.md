# Lifeboat crew rota

Internal tool for the Porthgarrow volunteer lifeboat station. Crew members are on call by week; the
coxswain needs one screen that answers, at a glance: who is on call right now and whether that covers a
launch (a launch needs a helm, two crew and a shore tractor driver), the gaps in the next seven days,
whose training is lapsing, and the last few launches.

Data lives in `data/station.json`. The screen is static: `index.html` reads the JSON with `fetch` and
renders it. No framework, no build step. Serve the folder (for example `npx serve .`) to view it.
