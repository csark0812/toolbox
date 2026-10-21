# Cricket subs

Season subscriptions for Ashcombe Cricket Club. The season runs from April to September.

- An adult sub is £120 and a junior sub (under 18 on 1 April) is £60.
- Someone who joins after the season has started pays for the months that are left, counting the month they joined: joining in June means paying for June to September, 4/6 of the sub.
- A household that has taken the family membership pays at most £250 for the season, however many of them play.

`data/members.json` has every member with their household number, whether they are a junior and the month they joined (blank if they were members from the start). `data/family.json` lists the household numbers that have the family membership.

```
npm run subs   # the season's bill for every household, then the club's total
npm test
```
