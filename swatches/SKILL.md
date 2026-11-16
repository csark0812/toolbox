---
name: swatches
description: Use when the user wants to pick a look from options, 2-4 rendered side by side and chosen in chat.
---

# Swatches

<!-- source-of-truth: side-by-side visual options, the comparison sheet and the pick record. -->
<!-- doc-meta: owner=eng -->
<!-- review-deps: paths=swatches/scripts/** -->

Show the user a few real, rendered options next to each other and let them choose. The pick is the deliverable: a decision someone can build on, and a record of the user's taste that gets sharper with every round. User instructions, the project's brand and its design system outrank everything here.

## Entry gate

Use this when the user wants a say in how something looks and the choice is still open: a whole direction for a page or screen, or one variable of a settled one (type, colour, spacing, layout of a section). Not for a choice the user has already made, a fix with one right answer, or building the full page; once a pick exists, building it is the job of whatever was building before.

## 1. Pick the mode and the material

- **Directions** (coarse, the default when nothing is settled): each option is the same first screen, built whole in a different direction.
- **Variables** (fine, once a direction is picked): each option changes exactly one variable. Everything else stays byte-identical, so the difference the user sees is the one being asked about.
- **In app** (once the surface exists in the product): each option is a switch on the real page, such as `/#arrival=b`, listed in a `links.json` for the sheet. Move here as soon as one of these holds: the surface already exists; the variable is motion, timing, or how a part meets elements already on the page (a logo, a loader, a card); judging it needs the real components or the real data. Standalone files stay right for a coarse direction on a surface that does not exist yet. Delete the switches when the pick is built.

Every option shows the same real content: the user's own name, line, action and one piece of real work. If that content is missing, ask for it once in one sentence, or take it from the project, and list anything you wrote yourself in the reply. Run `node <skill>/scripts/record.mjs status` first: it prints where the project's pick log lives, every trait the user dropped, and a STOP line when the last two rounds were answered "none". Earlier picks are constraints, and an option that repeats a dropped trait is wasted. Read the private taste profile too when it exists (`$TASTE_PROFILE`, default `~/.agents/taste-profile.md`): it is the user's taste across projects and outranks the generic advice here.

## 2. Write the options

Three by default, two to four at most. Before building, write one line per option in your notes:

- **Directions:** one sentence each, of the form "**[a particular only this subject has]** shapes **[layout, type or interaction]**", each from a different particular. Options that share an idea and differ only in palette are one option. Make one of them the safe reading and at least one a bolder one the user would not have asked for.
- **Variables:** name the variable and the values. Space the values clearly apart: three serifs that look alike are a wasted round.

Each option is one file, `.swatches/<round>/a.html`, `b.html`, `c.html` and so on; more than four go in set folders, `.swatches/<round>/<set>/a.html`, one sheet per set. Before the first round, write `.swatches/_shell/shell.css` from the project's own theme (font families, colours, type scale, motion durations) and link it from every option, naming in the reply the files it came from; the sheet warns on any font the shell does not declare. Without a project theme, link web fonts (for example Google Fonts with `display=swap`). For each part of an option, name the design-system component that already does that job (a popover, a scroll region, a card, tabs) and use it or an exact copy; an option that needs an exception to the design system says so. Put the option's idea in `<meta name="swatch" content="...">`; it becomes the caption. Add what the option costs, which the sheet prints under the caption: `swatch-traits` (its traits, checked against the user's Drop lines), `swatch-data` (`real`, or `fake:` and what is invented, at what scale), `swatch-needs` (data or fields it needs and what it exposes, such as ids or the whole graph) and `swatch-exceptions`. When the user named a reference, write one line in your notes: the craft to borrow, and the look not to copy. One `h1` with identical text in every option. Each option is finished work, not a wireframe: real type sizes, colour, spacing, hover and focus. In a git repository, add `.swatches/` to `.git/info/exclude` so it never shows up as a change.

## 3. Photograph and check

```bash
node <skill>/scripts/sheet.mjs .swatches/<round> [--motion] [--live] [--data sparse,full] [--urls links.json]
```

`<skill>` is the folder this file was loaded from. The script photographs each option at 1440 and 390px (set `CHROME_PATH` if Chrome is not found), writes `index.html` with the photographs side by side (`--live` puts the options themselves there instead), writes `sheet.png` with the same layout as one picture, and prints WARN lines: script errors, web fonts that did not load, fonts the project does not use, overflow, mismatched headlines, traits the user dropped. When the round decides motion, add `--motion`: it films each option from 100ms to 3s and after a hover into `motion.png`, one row per option, so the options compare at the same moment; open it, because the still sheet shows only the end. When an option shows data, add `--data sparse,full` so each is photographed at both scales through `?data=`. In-app options take `--urls links.json` and a running dev server. Open `sheet.png`. A comparison is fair only if each option looks its best: fix every WARN and anything on the sheet that is broken rather than chosen, then run it again. If no browser can run, say the options are unverified.

## 4. Present and ask

Serve the options on localhost with live reload so the user opens one link for the whole session instead of loose files. On the machine where the user's browser runs, keep one server for the session:

```bash
npx --yes vite .swatches --port 5173
```

Leave it running in the background (log to `.swatches/vite.log`); if the port is taken by something else, use the next free one and never stop another project's server. Keep a hub page at `.swatches/index.html` that shows the newest round live at the top, full size, with earlier rounds and their picks listed below it; keep the order in one small module (for example `steps.js`) the hub imports, so adding a round is one edit and the open hub reloads itself. The user keeps one tab open on `http://localhost:<port>/` and never needs a new link. From a remote or cloud session, write the files to the user's machine and start the server there through whatever the host offers (a remote shell or a session on the device); if nothing can run there, attach `sheet.png` instead. Then, one line per option: its letter, its idea, and what it trades away. Ask one question: which one, or what mix. Do not recommend one before the user answers; say which you would pick only if asked.

Read the answer generously. "B" is a pick. "B with A's type" is a pick: make that combination the next round's starting point, or the result if nothing is left open. "None" or "closer to B" is information: ask what is wrong in one question if it is not clear, then run a new round that changes exactly that.

When a pick names parts across options ("1 and 3", "A but left-aligned"), each part and each modifier becomes a `Keep:` line, and the next round's reply states how it honoured every one.

If two rounds in a row get "none", `record.mjs status` prints STOP and `sheet.mjs` refuses to build another round. Ask one question first: for a reference the user admires, or which axis is wrong (motion, density, colour, staging). Record the answer with `record.mjs add --mode question`, which clears the stop. For a showpiece (a hero object, a map, an animation), the next round changes the axis the answer named, with the user's reference beside it. For a page, stop generating whole directions: they converge on a genre the user has seen before. Build up from nothing in Variables mode, one decision per round, on a plain first screen: type, then the opening line, then colour, then first-screen layout and spacing, then one signature interaction, then the sections. Each round keeps every earlier pick fixed. For copy rounds, write lines that sound spoken rather than like a slogan, aim them at the reader rather than the author, and decide each headline's closing period on purpose instead of by habit.

## 5. Record the pick

Record every answer, including "none" and rounds held inside the app, with the script, never by hand:

```bash
node <skill>/scripts/record.mjs add --round <name> --mode <directions|variables|in-app|question> \
  --asked "<what was being decided>" --options "A <idea> · B <idea> · C <idea>" \
  --picked "<letter, mix or none>" --reason "<the user's words>" \
  --keep "<traits to carry>" --drop "<traits never to repeat>" --open "<still undecided>" \
  --reference "<craft to borrow / look not to copy>" --carry "<decisions the build must honour>" \
  --components "<real components used>" --data "<real or fake, and at what scale>" \
  --exceptions "<design-system exceptions approved>" --tokens "<values now fixed>"
```

The log lives in the repository's common git directory, so every worktree shares it and removing a worktree loses nothing. The script prints the path it wrote; quote it. `--carry` holds negative decisions too ("the wordmark never moves"). When a Keep or Drop trait also came up in another project, the script prints a PROFILE? line: offer that line to the user for their taste profile, and add it only on their yes.

Next steps follow from what is left open: another round of variables, or hand the settled tokens and the Carry lines to the build, which checks each one in the running page.

## 6. Reply

- **Sheet:** the localhost link (or where to find it), the widths, and the final WARN count.
- **Options:** one line each.
- **Question:** the one question.

After the pick, the reply is the record entry and the next step. Report only results from a run after your last edit. See [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/output-schema.md) § Work reports.
