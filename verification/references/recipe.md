# Executable recipe contract

<!-- source-of-truth: generated application verification contract -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-30 -->

Generate SKILL.md plus a feature index containing feature, owning source, entry points, prerequisites, ordered user actions, observable expected result, side effects, evidence and limitations. Support launch/readiness, read-only doctor, user-facing drive, evidence and owned cleanup. Prefer existing harnesses. Use isolated ports/profiles/data and capture successful as well as failed runs.

Bind launched build/revision and dirty inputs, never merely a responsive port. Evidence includes traces/screenshots where useful and survives cleanup. Cleanup must prove resource ownership. Never stop unowned services or edit personal data to overcome missing test auth. A mock boundary is explicit and cannot prove live persistence. Keep live fixtures free of mocked APIs for the claimed integration.

Finish only with executed results or a named blocked gate. A fresh agent should replay from the recipe and prerequisites, without author history. Commands and capability names come from the actual host, not another platform's examples.
