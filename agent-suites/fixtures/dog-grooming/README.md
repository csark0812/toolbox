# Dog grooming

Bills for Wagtail Grooming. `data/grooms.json` has every groom since the shop opened in July, oldest first: the date, the owner's surname, the dog's name, its size and any extras. Most bookings are taken over the phone and typed in by staff; since September some come in through the online booking form, which saves names as the customer typed them.

Prices:

- A groom is £30 for a small dog, £38 for a medium dog and £46 for a large dog.
- Extras: nail clip (`nails`) £5, flea bath £8, teeth cleaning (`teeth`) £6.
- Loyalty: every sixth groom for the same dog (the 6th, 12th, 18th, …) is free. The free groom covers the groom itself; any extras are still charged.

```
npm run bill -- 2026-10   # every groom in October with its price, then the month's total
npm test
```
