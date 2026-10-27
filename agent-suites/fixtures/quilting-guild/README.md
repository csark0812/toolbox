# Quilting guild

Fabric planning for the Thornbury quilting guild's group projects. `data/patterns.json` lists this term's quilts with their finished size in inches and which pieces each one needs (a table runner has no batting, for example).

`src/fabric.mjs` has one calculator per piece:

- `calc_backing(quilt)`: yards of 42-inch backing fabric, with 4 inches of overhang on every side, seamed from 40-inch usable widths and rounded up to the quarter yard.
- `calc_batting(quilt)`: yards of 90-inch batting, the same overhang, rounded up to the quarter yard (two lengths for anything wider than the roll).
- `calc_binding(quilt)`: inches of binding: the perimeter plus 10 inches for joins and corners.

## Usage

```
npm run cutlist   # what each quilt needs
npm run order     # the backing order for the shop
npm test
```
