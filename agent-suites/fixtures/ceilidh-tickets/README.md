# Ceilidh tickets

Ticket sales for the Lanteglos harvest ceilidh in the village hall on Saturday 7 November.

The hall's fire certificate allows **150 people** in the hall at once, and everyone in the room counts: ticket holders of every age, babies included, plus the band, the caller and the helpers.

## Tickets

| Type      | Price | People                                                  |
| --------- | ----- | ------------------------------------------------------- |
| `adult`   | £12   | 1                                                       |
| `child`   | £6    | 1 (aged 5 to 15)                                        |
| `family`  | £30   | 4 (two adults and two children)                         |
| `under-5` | free  | 1 (they still need a ticket so we know they are coming) |

`data/sales.csv` has one row per order, and each order is for one ticket type. Orders come from two places:

- `online`, exported from the ticket website. A cancelled order is `refunded`; if only some of the tickets on an order were given back it is `partially_refunded`, and `refunded` says how many tickets went back.
- `shop`, keyed in from the paper book at the post office counter. A refund there is its own row with a minus quantity and the status `refund`.

The band, the caller and the helpers don't buy tickets; they are listed in `data/crew.csv`.

Online sales stay open until the night. Anyone left over is sold a ticket on the door.

`npm run headcount` prints how many people are coming and how many door tickets can still be sold.

## Usage

```
npm run headcount
npm test
```
