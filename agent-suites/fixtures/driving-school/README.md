# Driving school

The booking API for Northgate Driving School. Learners sign in to book and manage their lessons; instructors sign in to see their diary. `data/instructors.json`, `data/learners.json` and `data/lessons.json` hold the school's records. Lesson times are UK local time written as `YYYY-MM-DDTHH:MM` and are treated as UTC throughout.

Rules for every endpoint:

- A request needs a signed-in session (`learnerId` or `instructorId`); otherwise it gets 401.
- A learner only ever sees or changes their own lessons. Anyone else's lesson is answered with 404, exactly as if it didn't exist.
- An instructor is never booked for two lessons that overlap.
- A learner can move a lesson free of charge with at least 48 hours' notice. With less notice the £15 late-change fee is added to the lesson.
- A learner's phone number and pickup address are only ever shown to that learner's own instructor.
- Cancelled lessons stay in `lessons.json` with `status: "cancelled"` and are never shown in a diary.

`src/api.mjs` routes requests to the handlers. `npm test` runs the handler tests.
