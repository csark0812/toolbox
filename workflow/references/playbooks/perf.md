# Performance

<!-- source-of-truth: workflow playbook for a measured slowness from baseline to verified improvement -->
<!-- doc-meta: owner=eng -->

**You own** the number from its baseline to a verified result.

1. Capture a baseline on the real surface and answer the seven questions in the measurement reference. Gate: a named limiter.
2. If the user stated a target or asked to keep improving, run hillclimb. Otherwise use evidence-based-debugging to find and fix the one bottleneck.
3. Measure after with the same harness. Inconclusive or measured on the wrong surface is a failure, not a pass.

**Reply contract:** verdict word, baseline → after with run count, range and limiter, and the commits that moved it.
