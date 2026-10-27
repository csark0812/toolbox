# Bramble Lane veg boxes: order page

Bramble Lane is a market garden on the edge of Bristol. We deliver boxes of whatever we picked that week. At the moment people order by texting Hannah, and she wants a proper order page instead. Most orders come from phones.

There is no back end yet: when the order is placed, show the confirmation on the page (Hannah will wire it up to email later). Customers pay on delivery by card or cash, so the page takes no payment details.

## The order, in three steps

1. **Box and extras**
   - Box (pick one): Small £14.50 (feeds 1–2), Medium £19.00 (feeds 2–3), Large £24.50 (feeds 4+).
   - Extras, quantity 0 to 5 each: Eggs (half dozen) £2.80, Sourdough loaf £4.20, Apple juice (1 litre) £3.60.
2. **Delivery details**: Full name, Email, Phone, Address, Postcode, Delivery day (Thursday or Friday).
3. **Review and place order**: everything they chose, the delivery details, and the total. They can go back and change anything without losing what they typed.

Then a confirmation that says the order is confirmed, with the order summary and total.

## Rules

- Delivery is free when the box plus extras come to £25.00 or more; otherwise it is £2.50.
- We deliver only to these postcode districts: BS3, BS4, BS5, BS6 and BS7. Anyone else should be told clearly that we don't deliver there yet (people from BS1 and BS8 ask all the time).
- Every delivery field is required. The email must look like an email; the phone must be a UK number (11 digits starting with 0, or +44 followed by 10 digits; spaces are fine).
- Mistakes are shown next to the field they belong to, in words, when the customer tries to continue. The customer should never lose what they typed.
- Hannah hates forms that shout. Be kind in the wording.

Plain HTML, CSS and JavaScript; no build step.
