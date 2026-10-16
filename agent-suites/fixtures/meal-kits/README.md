# Meal kits

Subscriptions for Pantry Box, a weekly recipe-box service. `data/subscriptions.json` holds each customer's plan, delivery day and next delivery date. The website calls the handlers in `src/api.mjs` with the request and the signed-in customer's session.

## Rules

- Customers can only see and change their own subscription. The customer is always taken from the session, never from the request.
- A customer can skip a single week, or pause deliveries for 1 to 8 weeks. Deliveries resume on the same weekday.
- When a pause is confirmed, the customer gets an email listing the delivery dates they will miss.

## Usage

```
npm run deliveries -- 2026-10-22   # boxes going out that day
npm test
```
