# Watering planner

Care reminders for the plants in our flat. `data/plants.json` lists each plant's tasks: watering every few days and feeding every month or two, each starting from a first date.

`npm run plan -- <start date> <months>` prints every task due from the start date for that many months, one line per task, in date order.

Task dates are calendar dates with no time of day. Repeating tasks keep their rhythm from the first date: a task every 7 days falls on the same weekday, and a monthly task falls on the same day of the month as its first date, or on the last day of a month that is too short for it.

`npm test` runs the tests.
