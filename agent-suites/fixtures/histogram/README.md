# Histogram

Exposure statistics for the photo ingest service. `imageStats(rgba, width, height)` takes raw RGBA pixels (4 bytes per pixel) and reports, for the luminance channel (Rec. 709 weights, rounded to the nearest whole level 0-255): a 256-bin histogram, the mean (two decimals), the median and the 1st and 99th percentiles (nearest rank), and how many pixels are clipped to pure black (0) or pure white (255). Fully transparent pixels (alpha 0) are ignored.

The ingest workers run in containers with little memory, and large panoramas get them killed. `npm run perf` analyses a 6-megapixel synthetic image in fresh processes and prints JSON with the median peak memory. `npm test` runs the tests.
