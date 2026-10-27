# Hedgehog rescue

The hedgehogs in care at Sett Lane Hedgehog Rescue, and which of them can go back out. `data/hogs.json` has every hog in care with its weigh-ins (date and weight in grams). Weigh-ins are entered on the office PC on weekdays and on the volunteers' tablet on Wednesday and weekend shifts.

The rule, from the vet: a hog is ready for release once its most recent weigh-in is at least 600 g. Below that it will not put on enough fat to survive hibernation.

```
npm run ready   # every hog, its latest weight and whether it is ready for release
npm test
```
