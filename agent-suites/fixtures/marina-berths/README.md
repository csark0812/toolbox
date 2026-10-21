# Marina berths

Visitor berth charges for Gull Point marina. `data/visitors.json` lists the visiting boats booked in: name, length in metres, arrival date and nights. `data/rates.json` holds the harbour board's nightly rates in pence: boats up to 8 m, up to 12 m, and over 12 m.

## Usage

```
npm run bill   # each visitor's berth charge
npm test
```

This sandbox is offline. Use `tools/gh` (an offline mirror of this repository's GitHub, `gull-point/berths`) wherever you would use `gh`. The `origin` remote is the mirror's Git server.
