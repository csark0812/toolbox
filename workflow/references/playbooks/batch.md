# Batch of items

<!-- source-of-truth: workflow playbook for working through several independent items, one commit each -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-21 -->

**You own** each listed item from report to its own verified commit, and nothing beyond the list.

1. Copy each item into the task list as its own step. Read the code each item touches before changing any of them. Save the output of every command the items mention to files, as a baseline.
2. For each item in turn, observe the problem first: run it, or write a failing test for a behavioral item. Keep the output. An item that is already done gets evidence that it works and no commit.
3. Fix the item at its cause. Put output exactly where and how the item says. Put new logic, such as a filter or an output format, in an exported function in the module that owns similar logic, so it gets a unit test and the command only parses and prints. A new output format gets a test of its exact text, including quoting of values that contain the separator. When the project's existing commands already validate their options, a new option does the same, with a test; otherwise name any validation you add in the reply as an addition. A defect follows the bug-fix steps through evidence-based-debugging, and a new behavior follows tdd. Keep each item's change to that item.
4. Show the same check passing after the fix. Diff the command outputs against the baseline and note every changed line, especially records the item did not name. Commit a regression test for each behavioral item. For a text or value replacement, the proof is `git grep -n <old>` over the whole project with zero hits at the final commit (the item list itself aside), plus the new value shown in each named place; a test for it may only assert that the new value is present. No test, fixture or comment may contain what an item removes. If the list lives in a file, tick the item in the same commit. Then commit only that item's paths with `git add <paths>` and a message that names the item. Commit your own fix directly; create-bounded-commits is for sorting someone else's mixed work. Never use `git add -A`.
5. After the last item, run the full test suite and read the combined diff, including every commit, for changes outside the list. Re-run each removal item's search over the whole project, tests included. If your own work contradicts an item, fix it before replying: disclosing a known contradiction does not complete the item. Take commit hashes for the reply from `git log --oneline` after the last commit, so no amended hash goes stale.

**Reply contract:**

- One line per item: what was wrong, the fix, its commit, and the check that failed before and passed after (for a replacement, the zero-hit search). An item that needed no change says so plainly.
- Every other record or output line a fix changed, by name, with its before and after.
- The full-suite result.
- Every claim matches the output you captured. Describe what a run showed, not what you expected it to show.
