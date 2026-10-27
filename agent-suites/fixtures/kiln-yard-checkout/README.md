# Kiln Yard Pottery: checkout

Kiln Yard is a two-person pottery in a converted bottle kiln on Clay Lane, Longton, Stoke-on-Trent. They
sell their seconds and small batches online. The current checkout (`index.html`) is one long form, the
cart is typed into the page by hand, and people abandon it: they do not know what is wrong when the
order will not go through, and on a phone the form is hard to fill in.

What the owners want from the new checkout:

- **The cart comes from `data/cart.json`** (the live shop returns the same shape from its API), read
  with `fetch`. Shop settings (delivery price, collection times) are in `data/shop.json`. A visitor can
  change a quantity or remove an item and the totals update. An empty cart says so and links back to the
  shop (`https://kilnyard.example/shop`) instead of showing an empty form.
- **Steps:** the cart, then your details (full name, email, phone optional), then delivery or
  collection (a postal address with postcode for delivery; collection needs no address), then a review
  with every line, the delivery charge and the total, and a button that places the order.
- **Mistakes are explained where they happen.** A field that is missing or wrong shows a short message
  next to it saying how to fix it, not the browser's own bubble, and the field is marked
  (`aria-invalid` with the message linked by `aria-describedby`) so screen readers announce it. Email
  must look like an email; the postcode must look like a UK postcode.
- **Payment** is not taken on this page: once the order is placed the studio emails a payment link
  after they have wrapped the pots. Say so before the button.
- **After the order is placed**, the page confirms it with an order reference (`KY-` and five digits),
  the email address the confirmation went to and what happens next.

No framework and no build step: plain HTML, CSS and JavaScript, one page. Nothing is sent anywhere yet;
placing the order just shows the confirmation. Serve the folder (for example `npx serve .`) to view it.
