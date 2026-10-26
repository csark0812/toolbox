# Pause

<!-- source-of-truth: workflow playbook for suspending in-flight work so it can resume cleanly -->
<!-- doc-meta: owner=eng -->

**You own** a clean stop. Run this only when the user explicitly asks to pause. "Keep going" is not a pause.

1. Stop at an atomic boundary and stop any task-owned background work.
2. Take no irreversible action: no new PR, no push to a shared branch.
3. Make one `wip:` commit on the user's feature branch when their rules allow it. Note a broken tree in the body.
4. Write a handoff pack with handoff: intent, progress, verified state, next steps and gotchas.

**Reply contract:** where work stopped, the wip commit, and the handoff pack location.
