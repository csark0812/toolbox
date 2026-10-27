# Craft courses

The Saltmarsh Arts Centre runs evening craft courses with a fixed number of places. `data/courses.json` lists each course and its places, and `data/signups.json` is the export from the online sign-up form, in whatever order the form wrote it.

Each sign-up has a local time, written `YYYY-MM-DDTHH:MM`. Places go to people in the order they signed up. Once a course is full, later sign-ups go on its waiting list. Some people send the form twice; a second form from someone who already has a place on that course does not take another place.

## Usage

```
npm run places   # who has a place, who is waiting, and places taken per course
npm test
```
