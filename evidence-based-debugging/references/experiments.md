# Reproduction and experiment recipes

<!-- doc-meta: owner=eng | last-reviewed=2026-10-05 -->

Choose the fastest check that faithfully reaches the failure and distinguishes explanations. These are alternatives, not a fixed ordering or mandatory tool list.

| Method                                        | Useful when                                                        | Preserve or assert                                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Existing unit, integration or end-to-end test | A test reaches the failing path                                    | The exact wrong outcome; confirm the test executes the relevant branch                             |
| HTTP or CLI invocation                        | The failure has an accessible request or input boundary            | Input, status, output and relevant state; distinguish transport failure from application behavior  |
| Browser or native interaction                 | The symptom depends on rendering, interaction or platform behavior | Starting state, trigger and visible result, with console/network or device evidence where relevant |
| Captured-input or trace replay                | The original environment is unavailable                            | Capture provenance and input semantics; note dependencies or ordering absent from replay           |
| Minimal harness                               | A subsystem can be exercised independently                         | The real transformation and contract; mocks must preserve the suspected mechanism                  |
| Differential check                            | Versions, configurations or environments differ                    | Identical inputs and comparable conditions; inspect other differences before attributing causality |
| Bisection                                     | A known-good baseline and reliable signal exist                    | A faithful failure predicate; preserve unrelated work and use an isolated checkout where needed    |
| Property, fuzz or stress check                | Inputs, scheduling or load trigger intermittent failures           | Seeds or captured counterexamples, trials, failure counts and workload                             |
| Structured human-assisted steps               | A required action cannot be automated                              | Exact starting conditions and steps, with observable outcomes; report the human/tool boundary      |

## Intermittent and timing-sensitive failures

Record the trigger, trials, failures and relevant timing/load conditions. Increase observation opportunity with bounded repeated runs, controlled scheduling, stress or replay where appropriate. Preserve failing artifacts. A rare failure is still evidence; improve the signal without declaring an arbitrary reproduction-rate threshold.

Check whether instrumentation, debugger attachment, logging or altered scheduling changes the behavior. Use the least intrusive observation that answers the question. Compare before and after under equivalent conditions, and report sample size and uncertainty. One passing rerun cannot prove a timing repair.

## Performance

Bind measurements to a fixed workload, environment and revision. Separate warmup, caching and setup from the measured work when they affect the question. Take repeated comparable measurements and report their spread. Test one proposed bottleneck with a discriminating measurement; verify correctness alongside any speed improvement.

## UI and native surfaces

Use the reported viewport/device, state and interaction when available. Capture the visible symptom and the relevant event, state, layout, network or platform transition. A source-level assertion is useful for isolation but cannot substitute for observing a rendered symptom. State which browser, simulator, device or reference surface was actually exercised.

## Production-only and captured failures

Record artifact provenance, time, deployed revision and relevant configuration when available. Check whether logs or traces belong to the same incident and component. Replay captured input or isolate the mechanism without assuming the local environment matches production.

Retain the captured failing evidence. Demonstrate the mechanism in a targeted check before an authorized repair; then report local mechanism verification and original-environment verification separately. A passing local check does not establish production recovery.

## Instrumentation and environment blockers

Instrument a named evidence gap with bounded, scoped observation. Preserve baseline state and distinguish temporary instrumentation from the repair. Keep secrets out of captures and reports. Remove owned instrumentation when it is no longer needed; inspect cleanup without resetting unrelated changes or stopping unowned processes.

An inaccessible port, failed tool launch or denied permission establishes a limitation of that observer context. Gather owner-written status or alternate permitted evidence before attributing it to the product. If the needed observation is unavailable, name it precisely and preserve the investigation state.
