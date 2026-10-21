# Canoe queue

The boathouse at Millbrook Lake keeps a walk-up queue for canoes. `data/returns.json` lists when each canoe is due back today, and `data/waiting.json` lists the people in the queue in the order they arrived.

Times are local, written `H:MM` on the dock tablet (for example `9:05` or `10:30`).

Each person in the queue gets the canoe that comes back first, in queue order. Their wait is the time between arriving and their canoe coming back, or zero if it is already back.

## Usage

```
npm run queue    # who gets which canoe, the wait, and the next canoe due back
npm test
```
