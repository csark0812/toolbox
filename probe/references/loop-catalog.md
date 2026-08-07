# Loop construction catalog

Try in roughly this order until one loop is **tight** and **red** on the bug.

1. **Failing test** at whatever seam reaches the bug — unit, integration, e2e.
2. **Curl / HTTP script** against a running dev server.
3. **CLI invocation** with fixture input. Diff stdout against a known-good snapshot.
4. **Headless browser script** (Playwright / Puppeteer) — DOM/console/network assertions.
5. **Replay a captured trace** — network request, payload, or event log through the code path in isolation.
6. **Throwaway harness** — minimal subset of the system (one service, mocked deps) with a single function call.
7. **Property / fuzz loop** — random inputs when the bug is "sometimes wrong output."
8. **Bisection harness** — automate "boot at state X, check, repeat" for `git bisect run`.
9. **Differential loop** — same input through old vs new version (or two configs). Diff outputs.
10. **HITL script** — last resort when a human must click. Structure their steps so output feeds back.

## Non-deterministic bugs

Goal: **higher reproduction rate**, not a perfect repro. Loop the trigger 100×. Parallelise. Add stress. Narrow timing windows. A 50%-flake bug is debuggable. A 1% flake is not — keep raising the rate.

## When none work

Stop. List attempts. Ask the user for environment access, a captured artifact (HAR, log dump, recording), or permission for temporary instrumentation. Do not hypothesize without a loop.
