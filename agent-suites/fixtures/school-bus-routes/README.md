# School bus routes

Free bus passes for Hollins Lane Primary and the two school bus routes that serve it. `data/pupils.json` has the applications for the coming school year, in the order they arrived, with each pupil's date of birth, their route and the walking distance from home to school in miles (from the council's route planner). `data/routes.json` has the number of seats on each route's bus.

The rules, from the council's transport policy:

- A pupil qualifies if they live more than 2 miles' walk from school and are under 8, or more than 3 miles' walk and are 8 or over. Age is taken on 1 September, the first day of the school year.
- Passes are given in the order the applications arrived. Once a route's bus has a pass for every seat, a later pupil who qualifies is told the route is full and goes on the waiting list.

```
npm run passes   # every application and its outcome, then the seats used on each route
npm test
```
