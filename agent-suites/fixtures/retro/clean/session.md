# Recorded session: label correction

1. The user requested the label Session a. The agent read src/session.mjs and the package checks in one targeted pass.
2. The agent corrected the label and ran npm run check; exit 0. CI ran the same check; exit 0.
3. Review confirmed the label met the request. The user accepted it. No repeated searches, check omissions, missing information, instruction conflicts, or tool failures were recorded.

The current source is the accepted result. The fixture has one CI workflow, running both available checks; there is no configured pre-commit hook.
