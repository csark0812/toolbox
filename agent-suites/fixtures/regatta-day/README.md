# Regatta day

The race programme page for Hollingford Regatta. A static page: open `index.html` in a browser. Styles are in `styles.css`, with the tokens at the top.

The header stays at the top of the screen, with links to jump to each session. Each session's heading (name and times) stays pinned just under the header while you scroll through that session's races, and the next session's heading pushes it away. The "Live" and "Next" badges scroll under a pinned heading like the rest of the race. Jumping to a session from the header lands with its heading in full view under the header and its first race in full view under the heading. On phones the jump links move onto their own row in the header.

`npm test` checks the stylesheet parses and the markup has every session.
