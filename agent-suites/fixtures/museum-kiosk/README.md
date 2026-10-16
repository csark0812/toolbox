# Museum kiosk

The touch-screen guide in the museum's galleries. Each gallery section can set its own theme with `data-theme` (the photography gallery is dark, for instance), and the whole kiosk can be switched with `data-theme` on `<html>`. Open `index.html` in a browser; all styles are in `styles.css`. `npm test` runs the stylesheet checks.

The palettes, from the design team:

| Token             | Light     | Dark      |
| ----------------- | --------- | --------- |
| `--bg`            | `#fbf8f3` | `#16181d` |
| `--surface`       | `#ffffff` | `#22252c` |
| `--text`          | `#2a2522` | `#ece7e1` |
| `--muted`         | `#6b625b` | `#a59d95` |
| `--accent`        | `#a4441b` | `#f0a37a` |
| `--accent-strong` | `#7a2f0f` | `#ffc4a3` |

Cards use `--surface` and `--text`, captions `--muted`, and the "new" badges `--accent-strong` text with an `--accent` border.
