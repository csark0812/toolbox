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

Every option shows the same real content: the user's own name, line, action and one piece of real work. If that content is missing, ask for it once in one sentence, or take it from the project, and list anything you wrote yourself in the reply. Read `.swatches/picks.md` if it exists: earlier picks and the reasons given are constraints, and an option that repeats something the user rejected is wasted.

## 2. Write the options

Three by default, two to four at most. Before building, write one line per option in your notes:

- **Directions:** one sentence each, of the form "**[a particular only this subject has]** shapes **[layout, type or interaction]**", each from a different particular. Options that share an idea and differ only in palette are one option. Make one of them the safe reading and at least one a bolder one the user would not have asked for.
- **Variables:** name the variable and the values. Space the values clearly apart: three serifs that look alike are a wasted round.

Each option is one self-contained file, `.swatches/<round>/a.html`, `b.html`, `c.html`, `d.html`. Use the project's fonts and tokens where they exist; else link web fonts (for example Google Fonts with `display=swap`). Put the option's idea in `<meta name="swatch" content="...">`; it becomes the caption. One `h1` with identical text in every option. Each option is finished work, not a wireframe: real type sizes, colour, spacing, hover and focus. In a git repository, add `.swatches/` to `.git/info/exclude` so it never shows up as a change.

## 3. Photograph and check

```bash
node <skill>/scripts/sheet.mjs .swatches/<round>
```

`<skill>` is the folder this file was loaded from. The script photographs each option at 1440 and 390px (set `CHROME_PATH` if Chrome is not found), writes `index.html` with the options side by side as live frames, writes `sheet.png` with the same layout as one picture, and prints WARN lines: script errors, web fonts that did not load, overflow, mismatched headlines. Open `sheet.png`. A comparison is fair only if each option looks its best: fix every WARN and anything on the sheet that is broken rather than chosen, then run it again. If no browser can run, say the options are unverified.

## 4. Present and ask

Show the sheet: give the path to `index.html`, or, where the user cannot open local files (a remote or cloud session), attach `sheet.png` or publish the page the way the host allows. Then, one line per option: its letter, its idea, and what it trades away. Ask one question: which one, or what mix. Do not recommend one before the user answers; say which you would pick only if asked.

Read the answer generously. "B" is a pick. "B with A's type" is a pick: make that combination the next round's starting point, or the result if nothing is left open. "None" or "closer to B" is information: ask what is wrong in one question if it is not clear, then run a new round that changes exactly that.

## 5. Record the pick

Append to `.swatches/picks.md`, newest last:

```markdown
## <date> · <round> · <mode>

Asked: <what was being decided>
Options: A <idea> · B <idea> · C <idea>
Picked: <letter or mix> · "<the user's reason, in their words>"
Rejected because: <anything the user said against the others>
Settled tokens: <the values now fixed, such as font family, sizes, colours, spacing>
```

Next steps follow from what is left open: another round of variables, or hand the settled tokens back to the build.

## 6. Reply

- **Sheet:** where to find it, the widths, and the final WARN count.
- **Options:** one line each.
- **Question:** the one question.

After the pick, the reply is the record entry and the next step. Report only results from a run after your last edit. See [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/output-schema.md) § Work reports.
