# Feature

<!-- source-of-truth: workflow playbook for new or changed behavior built from a named data shape -->
<!-- doc-meta: owner=eng -->

**You own** the feature from intent to a reviewed change.

1. If intent or a consequential choice is unclear, settle it with grill. Skip when the request is already specific: `skip: intent is specific`.
2. Name the data shape and the structure that holds it (state machine, typed model, registry, reducer or union) before writing logic. Use model the domain from the engineering principles.
3. Build test-first with tdd, one red-green slice at a time at agreed seams.
4. Review with code-review.
5. Verify the feature path end to end on its real surface.

**Reply contract:** the named data shape, slices built with their tests, review outcome, and how the feature was exercised.
