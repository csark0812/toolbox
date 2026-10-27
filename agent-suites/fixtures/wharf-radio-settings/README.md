# Wharf FM: presenter settings

Wharf FM is a volunteer community radio station broadcasting from an old grain store on Sutton Wharf,
Plymouth, on 99.4. Its sixty presenters use a small web app to book studio slots and hear from
listeners. This repository holds one screen of it: **Settings** (`index.html`). Today it is a bare form
whose Save button does nothing, so presenters never know whether a change stuck, and a few have left
the station by accident from the old version.

The current presenter's settings are in `data/settings.json`; read it with `fetch` (the live app's API
returns the same shape). The screen needs:

- **Profile:** display name (required, at most 40 characters; it is read out on air), email (required),
  the show's name, and a short bio for the website (at most 280 characters, with a live count).
- **Notifications:** on or off for each kind in the data (a slot is confirmed, a listener sends a
  message, the weekly listening figures, a fellow presenter asks to swap). Each is a real, labelled
  control.
- **Studio defaults:** default slot length (1, 2 or 3 hours) and the studio they usually use (Studio A,
  the big desk; Studio B, the small one with the phone line).
- **Saving:** the screen shows when there are unsaved changes, and after saving it confirms that the
  changes were saved. A field that is missing or too long shows a short message next to it, the field
  is marked (`aria-invalid` with the message linked by `aria-describedby`), and nothing is saved until
  it is fixed.
- **Leave the station:** removes the presenter's account and every booked slot. It must never happen by
  accident: ask for confirmation and say what will be lost (the number of upcoming slots in the data).

No framework and no build step: plain HTML, CSS and JavaScript. Saving does not reach a server yet;
keep the saved values in memory or `localStorage`. Serve the folder (for example `npx serve .`) to view it.
