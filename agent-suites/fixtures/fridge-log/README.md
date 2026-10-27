# Kitchen temperature log

The Lantern Street kitchen logs every fridge and freezer every two hours on the wall tablet. The tablet writes the day's readings to `data/readings.json` and replaces that file through the day, so the screen has to read it rather than have the numbers typed in.

We need the screen the head chef (Mo) glances at during service and the inspector looks at when they visit. It replaces a clipboard. It runs on the tablet on the wall and on Mo's phone.

## Rules (from our food safety plan)

- Each unit has its own safe range in the data. Both ends are inside the range: 5.0 °C in a 0–5 °C fridge is fine.
- A unit **needs action** if its latest reading is out of range, or if it had two out-of-range readings in a row today. Otherwise it is **OK**. Show the status in words next to each unit, as `Needs action` or `OK`, not only as a colour.
- A `null` reading is a missed check. Missed checks have to be visible: the inspector asks about every one. A missed check does not break a run of out-of-range readings, and it does not start one.

## What Mo needs to see

- How many units need action right now, which ones and why.
- For every unit: its latest reading and when it was taken, today's lowest and highest reading, and how many readings were out of range today.
- Every missed check, with the unit and time.

Plain HTML, CSS and JavaScript; no build step. Open it with any static server (for example `npx serve .`).
