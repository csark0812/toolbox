# Hollow Sky sign-up gate

Hollow Sky is a members' app for amateur astronomers to log what they observed and when. This page is
what a signed-out visitor sees at the root URL. The founders want it to make a stranger curious enough
to leave an email, not to explain the app: the name, one email field with a "Join" button, and
something behind them drawn from `data/observations.json` (real logged sightings: the object, its
position on the sky in degrees, and the night it was seen). Members see the app itself, not this page.
Plain static HTML, CSS and JS in this folder; `index.html` is the page.
