# Code review evidence and filing

<!-- source-of-truth: Action proof bar, scope rules, and filing breadth for code review. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-01 -->

## Action proof card

Before filing a finding, answer:

```text
Location: exact path and line
Starting state: state required before the trigger
Trigger: reachable action, input, event, or caller
Wrong outcome: behavior the code produces
Impact: concrete user, data, security, or system effect
Counter-evidence: callers, contracts, tests, runtime rules, or fallbacks checked
```

If the trigger or impact is not proved, do not file an Action finding. State the uncertainty only when it is material, and name the smallest proof that can settle it.

## Surface evidence

For a diff, staged change, commit, branch, or pull request, also require:

- the change introduced, worsened, or newly exposed the behavior;
- code, tests, or a safe reproduction shows the wrong outcome;
- the fix belongs to the named change contract.

For paths, modules, snapshots, and pasted code, judge the named material in scope. Do not force introduced-only logic onto a holistic review.

## Filing breadth

Default to blockers only:

- reachable wrong production behavior;
- data loss or corruption;
- reachable security flaws;
- failure of a core action for a meaningful user segment;
- high-probability regression with a named trigger.

Do not file missing tests, style, naming, module placement, duplication, documentation, or polish as blockers by themselves.

When the user asks for improvements, report proved hardening risks and useful non-blocking improvements. Label them as improvements, not ship blockers.

## Contracts and duplicate findings

- Cite a named authoritative contract before filing or excluding an intent-sensitive concern.
- If expected behavior is unresolved, record a contract hold. Do not turn ambiguity into a defect.
- Continue to file contract-independent crashes, corruption, and security flaws.
- Merge manifestations with the same root cause. Preserve distinct triggers and impacts in the one finding.
- Use `regression` only when a proven content change caused or worsened the defect.

## Architecture concerns

For state, identity, lifecycle, policy, side effects, recovery, or trust boundaries, identify:

- the domain concept;
- its owner and source of truth;
- its public contract;
- its failure and recovery behavior;
- its test seam.

File movement, indirection, or abstraction count alone is not evidence of a design defect.
